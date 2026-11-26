import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { expect, test, type Locator } from "@playwright/test";
import { studioTheme } from "../src/pages/brandTheme";
import { textContrast } from "./contrast";

const packageVersions = Object.fromEntries(["ui", "tokens"].map(name => {
  const manifest = new URL(import.meta.resolve(`@alien6-studio/elea-${name}/package.json`));
  return [name, JSON.parse(readFileSync(manifest, "utf8")).version as string];
}));

async function readButton(button: Locator, tone: string, state: "rest" | "hover" | "pressed", appearance: string) {
  const colours = await button.evaluate(async element => {
    // Flush the pseudo-class style, then sample its final colours.
    void getComputedStyle(element).backgroundColor;
    await Promise.allSettled(element.getAnimations().filter(animation => "transitionProperty" in animation).map(animation => animation.finished));
    const style = getComputedStyle(element);
    return { foreground: style.color, background: style.backgroundColor, hovered: element.matches(":hover"), pressed: element.matches(":active") };
  });
  return {
    id: [tone, appearance, state === "rest" ? "fill" : state].join("."),
    component: "Button", variant: "solid", tone, state, ...colours,
    contrast: await textContrast(button), minimum: 4.5,
  };
}

for (const [theme, label] of [["reserve", "Réserve"], ["rasance", "Rasance"]] as const) {
  for (const appearance of ["light", "dark"] as const) {
    test(`rendered theme proof for ${theme} in ${appearance}`, async ({ page, browser }, testInfo) => {
      await page.emulateMedia({ colorScheme: appearance, reducedMotion: "reduce" });
      const path = (guide: string) => `/elea/playground/#/ui/${guide}?scheme=${theme}`;
      await page.goto(path("button"));
      await expect(page.getByRole("combobox", { name: "Site theme", exact: true })).toHaveText(label);
      await expect(page.locator("html")).toHaveAttribute("data-theme", appearance);
      const samples = page.getByRole("group", { name: "solid", exact: true });
      const buttons = [];
      for (const tone of ["primary", "danger"]) {
        const button = samples.getByRole("button", { name: tone + " solid", exact: true });
        await button.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        buttons.push(await readButton(button, tone, "rest", appearance));
        await button.hover();
        buttons.push(await readButton(button, tone, "hover", appearance));
        await page.mouse.down();
        try {
          buttons.push(await readButton(button, tone, "pressed", appearance));
        } finally {
          await page.mouse.up();
        }
      }

      await page.goto(path("table"));
      const region = page.getByRole("region", { name: "Article workspace" });
      const field = region.getByRole("searchbox", { name: "Filter articles" });
      const row = region.getByRole("rowheader", { name: "Autumn field notes" });
      const action = region.getByRole("button", { name: "Word count" });
      const densities = [];
      for (const [density, height, padding] of [["Compact", 36, 8], ["Standard", 40, 12], ["Comfortable", 44, 16]] as const) {
        await region.getByRole("combobox", { name: "Region density" }).click();
        await page.getByRole("option", { name: density, exact: true }).click();
        await expect(region).toHaveAttribute("data-elea-density", density.toLowerCase());
        densities.push({
          density: density.toLowerCase(),
          fieldMinHeight: await field.evaluate(node => getComputedStyle(node).minHeight),
          buttonMinHeight: await action.evaluate(node => getComputedStyle(node).minHeight),
          tableCellPaddingBlockStart: await row.evaluate(node => getComputedStyle(node).paddingBlockStart),
          expectedMinHeight: height + "px", expectedPaddingBlockStart: padding + "px",
        });
      }
      const report = {
        schemaVersion: 1, id: [theme, appearance, testInfo.project.name].join("/"), theme, configuration: studioTheme(theme), appearance, packageVersions,
        provenance: {
          origin: process.env.GITHUB_ACTIONS === "true" ? "github-actions" : "local",
          sourceRevision: process.env.ELEA_SOURCE_REVISION || null,
          siteRevision: process.env.ELEA_PAGES_REVISION || process.env.GITHUB_SHA || null,
        },
        browser: { engine: browser.browserType().name(), version: browser.version(), project: testInfo.project.name },
        viewport: page.viewportSize(), reducedMotion: "reduce",
        scope: { buttonGuide: path("button"), tableGuide: path("table"), region: "Article workspace" },
        buttons, densities,
        passed: buttons.every(pair => pair.contrast >= pair.minimum && pair.hovered === (pair.state !== "rest") && pair.pressed === (pair.state === "pressed")) && densities.every(sample =>
          sample.buttonMinHeight === sample.expectedMinHeight && sample.fieldMinHeight === sample.expectedMinHeight &&
          sample.tableCellPaddingBlockStart === sample.expectedPaddingBlockStart),
      };
      const output = testInfo.outputPath("theme-proof.json");
      await writeFile(output, JSON.stringify(report, null, 2) + "\n");
      await testInfo.attach("theme-proof", { path: output, contentType: "application/json" });
      expect(report.passed, JSON.stringify({ buttons, densities }, null, 2)).toBe(true);
    });
  }
}
