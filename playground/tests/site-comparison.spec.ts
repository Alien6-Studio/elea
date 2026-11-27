import { readFile } from "node:fs/promises";
import { expect, test, type Locator, type TestInfo } from "@playwright/test";

async function capture(region: Locator, info: TestInfo, name: string) {
  const path = info.outputPath(name + ".png");
  await region.screenshot({ path });
  await info.attach(name, { path, contentType: "image/png" });
}

test("publication comparison changes only the second edition across site preferences", async ({ page }, info) => {
  await page.goto("/#home-theme");
  const comparison = page.locator("#theme-comparison");
  const reference = comparison.getByRole("article", { name: "Réserve" });
  const alternate = comparison.getByRole("article", { name: "Braise" });
  await page.evaluate(() => { document.documentElement.dataset.siteFont = "roboto"; });
  await expect(reference.getByRole("heading")).toHaveText("Harbour light");
  await expect(alternate.getByRole("heading")).toHaveText("Harbour light");
  await expect(alternate.getByRole("heading")).toHaveCSS("font-family", /Georgia|Iowan/);
  await expect(reference.getByRole("heading")).toHaveCSS("font-family", /ELEA Sans/);
  await expect(reference.locator("img")).toHaveJSProperty("complete", true);
  await comparison.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await capture(comparison, info, "editions-desktop");
  await comparison.getByRole("combobox", { name: "Compare with" }).click();
  await page.getByRole("option", { name: "Rasance", exact: true }).click();
  const rasance = comparison.getByRole("article", { name: "Rasance" });
  await expect(rasance.getByRole("link")).toHaveAttribute("href", /scheme=rasance/);
  await expect(reference.getByRole("link")).toHaveAttribute("href", /scheme=reserve/);
  await comparison.getByText("Compare design decisions").click();
  await expect(comparison.getByRole("cell", { name: "#181817" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const first = (await reference.boundingBox())!;
  expect((await rasance.boundingBox())!.y).toBeGreaterThanOrEqual(first.y + first.height);
  await capture(comparison, info, "editions-mobile");
});

test("ELEA keeps its signature and the specimen renders the interface roles", async ({ page }, info) => {
  await page.goto("/");
  const wordmark = page.locator(".site__masthead .site__wordmark");
  await page.evaluate(() => document.fonts.ready);
  const initial = await wordmark.boundingBox();
  await page.evaluate(() => { document.documentElement.dataset.siteFont = "roboto"; });
  await expect(wordmark).toHaveCSS("font-family", /^"ELEA Sans"/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-family", /Roboto/);
  expect(await wordmark.boundingBox()).toEqual(initial);
  await page.goto("/typography/");
  const section = page.getByRole("region", { name: "Typography in use" });
  await expect(section.locator("dd[data-elea-type]")).toHaveCount(7);
  await expect(section.locator('[data-elea-type="data"]').first()).toHaveCSS("font-variant-numeric", /tabular-nums/);
  await expect(section.getByText("€108.40")).toHaveCSS("text-align", "end");
  await capture(section, info, "interface-types");
});

test("the Studio exports a reproducible report for the active brand", async ({ page }) => {
  await page.goto("/playground/#/theme?scheme=braise");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download contrast report" }).click();
  const report = JSON.parse(await readFile((await (await download).path())!, "utf8"));
  expect(report.theme.profile).toBe("braise");
  expect(report.checks).toHaveLength(56);
  expect(report.checks.find((check: { id: string }) => check.id === "primary.light.fill").background).toBe("#f0aa70");
});
