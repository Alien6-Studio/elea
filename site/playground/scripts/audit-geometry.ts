import { pathToFileURL } from "node:url";
import { chromium, type Page } from "@playwright/test";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { componentGuides } from "../src/data/componentGuides.js";
import { siteNavigation } from "../src/links.js";
import { auditContours, collectBoxes, scaleOf, type AuditedScale, type RuleResult } from "../src/geometry/index.js";

/**
 * Audits the whole site against the rules of the geometry study: every page,
 * and every component guide in every theme. It needs a built site and fails
 * when a rule is broken: `npm run audit:geometry [site URL]`. The browser
 * checks run the same audit.
 * Pages are measured at rest: overlays that are closed are not seen.
 */
const themes = Object.keys(colorThemes);
const radiusScale = [4, 6, 8, 12];

/** The radius scale of the Button, read from the steps its guide draws in the current theme. */
async function buttonScale(page: Page): Promise<AuditedScale[]> {
  const scale = page.locator(".catalog-button-radii").first();
  const names = await scale.locator("figcaption").allTextContents();
  await scale.evaluate(element => { element.dataset.geometryScale = ""; });
  const boxes = (await page.evaluate(collectBoxes, "[data-geometry-scale] .elea-button")).filter(box => box.parent < 0);
  if (boxes.length !== names.length) throw new Error(`Read ${boxes.length} of the ${names.length} radius steps of the Button`);
  return [scaleOf("Button radius", boxes.map((box, index) => ({ name: names[index]!, box })))];
}

type AuditedRule = RuleResult & { occurrences: Map<string, Set<string>> };

function statusOf({ assessed, passed }: AuditedRule) {
  if (assessed === 0) return "N/A ";
  return passed ? "PASS" : "FAIL";
}

function reportOf(rules: Map<string, AuditedRule>, heading: string) {
  const lines = [heading];
  for (const rule of rules.values()) {
    lines.push(`${statusOf(rule)}  ${rule.title} (${rule.assessed} assessed)`);
    for (const [finding, seen] of rule.occurrences) {
      lines.push(`    ${finding}\n      ${seen.size === themes.length ? "every theme" : [...seen].join(", ")}`);
    }
  }
  const broken = [...rules.values()].filter(rule => !rule.passed).length;
  lines.push(`\n${broken} of ${rules.size} rules are broken.`);
  return { broken, report: lines.join("\n") };
}

export async function auditSite(page: Page, site: string) {
  const rules = new Map<string, AuditedRule>();
  const audit = async (name: string, variant: string, scales: AuditedScale[] = []) => {
    await page.evaluate(() => document.fonts.ready);
    for (const result of auditContours(await page.evaluate(collectBoxes, "body"), { radiusScale, scales })) {
      const rule = rules.get(result.rule) ?? { ...result, assessed: 0, findings: [], occurrences: new Map() };
      rules.set(result.rule, rule);
      rule.assessed += result.assessed;
      rule.passed &&= result.passed;
      for (const { label, message } of result.findings) {
        const key = `${name}: ${label}\n      ${message}`;
        rule.occurrences.set(key, (rule.occurrences.get(key) ?? new Set()).add(variant));
      }
    }
  };

  const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
  const documents = sitemap.split("<loc>").slice(1).map(entry => new URL(entry.split("</loc>")[0]!).pathname);
  const routes = siteNavigation.flatMap(link => ("route" in link ? [link.route] : []));
  const paths = [...documents, ...routes.map(route => `/playground/#/${route}`)];
  for (const path of paths) {
    await page.goto(site + path);
    await page.waitForLoadState("networkidle");
    await audit(path, "site theme");
  }
  for (const theme of themes) {
    for (const { slug, name } of componentGuides) {
      await page.goto(`${site}/playground/#/ui/${slug}?scheme=${theme}`);
      await page.waitForFunction(([title]) => document.title.startsWith(title!) && document.querySelector(".demo__stage"), [name]);
      await audit(`ui/${slug}`, theme, slug === "button" ? await buttonScale(page) : []);
    }
  }

  return reportOf(rules, `Geometry audit of ${paths.length} pages and ${componentGuides.length} component guides in ${themes.length} themes at ${site}\n`);
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
