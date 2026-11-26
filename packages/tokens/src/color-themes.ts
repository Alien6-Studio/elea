import type { BrandTheme } from "./brand.js";
import { brandColorRoles, colorThemes, type ColorThemeId, type ThemeProfileId } from "./palette.js";

const additionalRoles = brandColorRoles.filter(role => role !== "primary" && role !== "secondary");

/** Apply only the colours of a scheme, keeping the product’s type, corners and density. */
export function applyColorTheme(brand: BrandTheme, id: ColorThemeId): BrandTheme {
  const theme = colorThemes[id];
  const { primary, secondary } = theme.colours;
  const palette: NonNullable<BrandTheme["palette"]> = { neutral: theme.neutral };
  for (const role of additionalRoles) palette[role] = { seed: theme.colours[role] };
  return { ...brand, seed: primary, accent: secondary, palette };
}

/** Create a complete brand from a named profile. */
export function createThemeProfile(id: ThemeProfileId): BrandTheme {
  const { profile, colours } = colorThemes[id];
  return applyColorTheme({ ...profile, shape: id, seed: colours.primary }, id);
}

/** Identify a complete scheme for selection and compact sharing, including its role sources. */
export function matchingColorTheme({ seed, accent, palette }: BrandTheme): ColorThemeId | undefined {
  if (!palette || palette.primary || palette.secondary) return;
  return (Object.keys(colorThemes) as ColorThemeId[]).find(id => {
    const theme = colorThemes[id];
    return seed.toLowerCase() === theme.colours.primary && accent?.toLowerCase() === theme.colours.secondary
      && palette.neutral === theme.neutral && additionalRoles.every(role => {
        const assignment = palette[role];
        return assignment && "seed" in assignment && assignment.seed.toLowerCase() === theme.colours[role];
      });
  });
}
