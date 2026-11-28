import { pathToFileURL } from "node:url";
import { chromium, type Page } from "@playwright/test";
import { componentGuides } from "../src/data/componentGuides.js";
import { siteNavigation } from "../src/links.js";
import { auditLayout, collectLayout, type LayoutRuleResult } from "../src/composition/audit.js";

/**
 * Audits the whole site against the columns of its layout: every page and
 * every component guide, at each width. It needs a built site and fails
 * when a rule is broken: `npm run audit:layout [site URL]`. The browser
 * checks run the same audit.
 * Pages are measured at rest: overlays that are closed are not seen. A page
 * zoomed to 200% is the page at half the width, which the widths cover.
 */
const widths = [320, 600, 720, 768, 1024, 1280, 1440, 1920];

/** Resolves in the page after two frames. */
const settled = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

type AuditedRule = LayoutRuleResult & { occurrences: Map<string, Set<string>> };

function statusOf({ assessed, passed }: AuditedRule) {
  if (assessed === 0) return "N/A ";
  return passed ? "PASS" : "FAIL";
}

function reportOf(rules: Map<string, AuditedRule>, heading: string) {
  const lines = [heading];
  for (const rule of rules.values()) {
    lines.push(`${statusOf(rule)}  ${rule.title} (${rule.assessed} assessed)`);
    for (const [finding, seen] of rule.occurrences) {
      lines.push(`    ${finding}\n      ${seen.size === widths.length ? "every width" : [...seen].join(", ")}`);
    }
  }
  const broken = [...rules.values()].filter(rule => !rule.passed).length;
  lines.push(`\n${broken} of ${rules.size} rules are broken.`);
  return { broken, report: lines.join("\n") };
}

export async function auditSite(page: Page, site: string) {
  const rules = new Map<string, AuditedRule>();
  const measure = async (name: string, variant: string) => {
    for (const result of auditLayout(await page.evaluate(collectLayout, undefined))) {
      const rule = rules.get(result.rule) ?? { ...result, assessed: 0, findings: [], occurrences: new Map() };
      rules.set(result.rule, rule);
      rule.assessed += result.assessed;
      rule.passed &&= result.passed;
      // A finding is an element and the edge it misses: the distance changes with the width
      for (const { label, message } of result.findings) {
        const key = `${name}: ${label} ${message.replaceAll(/ [\d.]+ px/g, "")}`;
        rule.occurrences.set(key, (rule.occurrences.get(key) ?? new Set()).add(variant));
      }
    }
  };
  const audit = async (name: string) => {
    await page.evaluate(() => document.fonts.ready);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      // Components that size themselves to their container settle on the next frames
      await page.evaluate(settled);
      await measure(name, String(width));
    }
  };

  const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
  const documents = sitemap.split("<loc>").slice(1).map(entry => new URL(entry.split("</loc>")[0]!).pathname);
  const routes = siteNavigation.flatMap(link => ("route" in link ? [link.route] : []));
  const paths = [...documents, ...routes.map(route => `/playground/#/${route}`)];
  for (const path of paths) {
    await page.goto(site + path);
    await page.waitForLoadState("networkidle");
    // A route of the playground loads after its shell
    await page.waitForFunction(() => !document.querySelector("main > [role=status]"));
    await audit(path);
  }
  for (const { slug, name } of componentGuides) {
    await page.goto(`${site}/playground/#/ui/${slug}`);
    await page.waitForFunction(([title]) => document.title.startsWith(title!) && document.querySelector(".demo__stage"), [name]);
    await audit(`ui/${slug}`);
  }

  return reportOf(rules, `Layout audit of ${paths.length} pages and ${componentGuides.length} component guides at ${widths.length} widths at ${site}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const { broken, report } = await auditSite(page, process.argv[2] ?? "http://127.0.0.1:4174");
    console.log(report);
    if (broken) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
