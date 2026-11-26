import assert from "node:assert/strict";
import { test } from "node:test";
import { createThemeProfile, type BrandTheme } from "./brand.js";
import { qualifyTheme, compareThemeReports } from "./qualification.js";
import { colorThemes, type ThemeProfileId } from "./palette.js";

test("every named profile records both appearances, exact ratios and all resolved action states", () => {
  for (const [id, definition] of Object.entries(colorThemes)) {
    if (!("profile" in definition)) continue;
    const report = qualifyTheme(createThemeProfile(id as ThemeProfileId));
    assert.equal(report.checks.length, 7 * 2 * 4);
    assert.deepEqual(report.unassignedRoles, []);
    assert.equal(new Set(report.checks.map(row => row.id)).size, 56);
    for (const row of report.checks) {
      assert.ok(row.ratio >= 1 && row.ratio <= 21, row.id);
      assert.equal(row.passed, row.ratio >= row.minimum);
    }
    assert.deepEqual(compareThemeReports(report, report), []);
  }
});

test("a saved report identifies changed, added and removed pairs", () => {
  const base: BrandTheme = { seed: "#000000", typeface: "Sans", rhythm: "Balanced", corner: "Square" };
  const before = qualifyTheme(base);
  assert.equal(before.checks.find(row => row.id === "primary.light.fill")?.ratio, 21);
  assert.ok(before.unassignedRoles.includes("secondary"));
  const after = qualifyTheme({ ...base, seed: "#ff0080", accent: "#f0e700" });
  assert.equal(compareThemeReports(before, after).find(row => row.id === "primary.light.fill")?.before?.background, "#000000");
  assert.equal(compareThemeReports(before, after).find(row => row.id === "secondary.dark.fill")?.before, null);
  assert.equal(compareThemeReports(after, before).find(row => row.id === "secondary.dark.fill")?.after, null);
});

test("the evidence retains its original configuration after a host edits the theme", () => {
  const theme = createThemeProfile("reserve");
  const report = qualifyTheme(theme);
  theme.palette!.warning = { seed: "#111111" };
  assert.notDeepEqual(report.theme.palette?.warning, theme.palette?.warning);
});
