import { brandColorRoles, makeBrandTheme, type BrandTheme } from "./brand.js";
import { contrast } from "./contrast.js";
import manifest from "@alien6-studio/elea-tokens/package.json" with { type: "json" };

export interface ContrastCheck {
  id: string;
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
  passed: boolean;
}

/** Resolved colour pairs from the generator. Browser evidence is recorded separately. */
export function qualifyTheme(theme: BrandTheme) {
  const { roles } = makeBrandTheme(theme);
  const checks: ContrastCheck[] = [];
  for (const role of brandColorRoles) {
    const action = roles[role];
    if (!action) continue;
    for (const mode of ["light", "dark"] as const) {
      const colours = action[mode];
      for (const state of ["fill", "hover", "pressed", "container"] as const) {
        const foreground = state === "container" ? colours.onContainer : colours.text;
        const background = colours[state];
        const ratio = contrast(foreground, background);
        checks.push({ id: [role, mode, state].join("."), foreground, background, ratio, minimum: 4.5, passed: ratio >= 4.5 });
      }
    }
  }
  return {
    schemaVersion: 1 as const, packageVersion: manifest.version, theme: structuredClone(theme), checks,
    unassignedRoles: brandColorRoles.filter(role => !roles[role]),
    scope: "Resolved action label and container ink pairs for light and dark appearances",
  };
}
export type ThemeReport = ReturnType<typeof qualifyTheme>;

/** Compare by stable role, appearance and state, including additions and removals. */
export function compareThemeReports(previous: ThemeReport, current: ThemeReport) {
  const before = new Map(previous.checks.map(check => [check.id, check]));
  const after = new Map(current.checks.map(check => [check.id, check]));
  return [...new Set([...before.keys(), ...after.keys()])].sort().flatMap(id => {
    const old = before.get(id);
    const next = after.get(id);
    if (old && next && old.foreground === next.foreground && old.background === next.background && old.minimum === next.minimum && old.ratio === next.ratio) return [];
    return [{ id, before: old ?? null, after: next ?? null }];
  });
}
