// Run after npm run build:packages in the ELEA checkout.
import { readFileSync } from "node:fs";
import { isDeepStrictEqual, parseArgs } from "node:util";
import { createThemeProfile } from "@alien6-studio/elea-tokens/brand";
import { compareThemeReports, qualifyTheme } from "@alien6-studio/elea-tokens/qualification";

const { values } = parseArgs({ options: {
  profile: { type: "string" }, theme: { type: "string" }, previous: { type: "string" },
  evidence: { type: "string", multiple: true },
} });
if (values.profile && values.theme) throw new Error("Choose either --profile NAME or --theme FILE.");
const readJson = path => JSON.parse(readFileSync(path, "utf8"));
const profile = values.profile ?? "reserve";
const theme = values.theme ? readJson(values.theme) : {
  ...createThemeProfile(profile), profile, buttonRadiusScale: "profile",
};
const report = qualifyTheme(theme);
if (values.previous) {
  const previous = readJson(values.previous);
  if (previous.schemaVersion !== report.schemaVersion || !Array.isArray(previous.checks) || !previous.theme) {
    throw new Error("Expected a version 1 ELEA theme report in --previous.");
  }
  report.comparison = {
    previousPackageVersion: previous.packageVersion,
    changedSettings: [...new Set([...Object.keys(previous.theme), ...Object.keys(theme)])].sort()
      .filter(key => !isDeepStrictEqual(previous.theme[key], theme[key]))
      .map(key => ({ setting: key, before: previous.theme[key] ?? null, after: theme[key] ?? null })),
    changedColourPairs: compareThemeReports(previous, report),
  };
}
if (values.evidence) {
  report.browserEvidence = values.evidence.map(path => {
    const result = readJson(path);
    if (result.schemaVersion !== 1 || result.packageVersions?.tokens !== report.packageVersion ||
        !isDeepStrictEqual(result.configuration, theme) || typeof result.passed !== "boolean" ||
        !result.browser?.version || !Array.isArray(result.buttons) || !Array.isArray(result.densities)) {
      throw new Error("Browser evidence does not match this theme and tokens version: " + path);
    }
    return result;
  });
}
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
if (report.checks.some(check => !check.passed) || report.browserEvidence?.some(result => !result.passed)) process.exitCode = 1;
