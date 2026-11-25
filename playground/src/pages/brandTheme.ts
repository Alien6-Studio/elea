import { applyColorTheme, brandColorRoles, corners, createThemeProfile, editions, makeBrandTheme, matchingColorTheme, rhythms, typefaces, type BrandColorRole, type BrandTheme as TokenTheme, type RoleAssignment } from "@alien6-studio/elea-tokens/brand";
import { colorFamilies, colorThemes, surfaceFamilies, type ColorFamily, type ColorThemeId, type SurfaceFamily, type ThemeProfileId } from "@alien6-studio/elea-tokens/palette";

import { href } from "../router.js";

export { editions, makeBrandTheme, typeFamilies } from "@alien6-studio/elea-tokens/brand";
export { matchingColorTheme as matchingColourTheme };

export type StudioThemeId = ThemeProfileId;
export const featuredColourThemes = (Object.keys(colorThemes) as ColorThemeId[])
  .filter((id): id is StudioThemeId => "profile" in colorThemes[id]);

// Remember the origin across edits so shared profiles can be restored after navigation.
export interface BrandTheme extends TokenTheme {
  profile?: StudioThemeId;
  paletteOrigin?: ColorThemeId;
}

export function studioTheme(id: StudioThemeId): BrandTheme {
  return { ...createThemeProfile(id), profile: id };
}

export const defaultSiteTheme = studioTheme("reserve");

function assignmentValue(assignment: RoleAssignment | undefined) {
  if (!assignment) return undefined;
  return "seed" in assignment ? assignment.seed.slice(1).toLowerCase() : assignment.family.toLowerCase() + "-" + assignment.step;
}

export function resetStudioColours(brand: BrandTheme): BrandTheme {
  const scheme = brand.profile ?? brand.paletteOrigin;
  if (scheme) {
    const { seed, accent, palette } = applyColorTheme(brand, scheme);
    return { ...brand, seed, accent, palette };
  }
  const base = brand.edition ? editions[brand.edition] : editions.Precision;
  return { ...brand, seed: base.seed, accent: brand.edition ? base.accent : undefined, palette: undefined };
}

export function sameRole(brand: BrandTheme, base: BrandTheme, role: BrandColorRole) {
  if (assignmentValue(brand.palette?.[role]) !== assignmentValue(base.palette?.[role])) return false;
  if (role === "primary") return brand.seed.toLowerCase() === base.seed.toLowerCase();
  if (role === "secondary") {
    const accent = brand.accent ?? (brand.edition && editions[brand.edition].accent);
    return accent?.toLowerCase() === base.accent?.toLowerCase();
  }
  return true;
}

export function usesStudioColours(brand: BrandTheme) {
  const base = resetStudioColours(brand);
  return brand.palette?.neutral === base.palette?.neutral && brandColorRoles.every(role => sameRole(brand, base, role));
}

export function studioThemeName(brand: BrandTheme) {
  const scheme = brand.profile ?? brand.paletteOrigin ?? matchingColorTheme(brand);
  return scheme ? colorThemes[scheme].name : "Custom theme";
}

/** The theme when the generator accepts it, so a hand-edited URL or a half-typed value never throws. */
export function validBrand(brand: BrandTheme): BrandTheme | undefined {
  try {
    makeBrandTheme(brand);
    return brand;
  } catch {
    return undefined;
  }
}

// Older Studio links serialized every default when sharing the blue Precision preset.
const oldPrecision = new URLSearchParams("brand=2854b8&corners=Soft&type=Sans&rhythm=Balanced&accent=40536b&edition=precision");

const families = Object.keys(colorFamilies) as ColorFamily[];
const surfaces = Object.keys(surfaceFamilies) as SurfaceFamily[];
function readFamily<T extends string>(names: readonly T[], value: string | null) {
  return names.find(name => name.toLowerCase() === value?.toLowerCase());
}

function readSwatch(key: string | null) {
  const parts = /^([a-z]+)-(\d{2,3})$/i.exec(key ?? "");
  if (!parts) return;
  const family = readFamily(families, parts[1]!);
  if (!family) return undefined;
  const swatch = colorFamilies[family].find(({ step }) => String(step) === parts[2]);
  return swatch && { family, ...swatch };
}

function withPalette(brand: BrandTheme, params: URLSearchParams): BrandTheme {
  const next = { ...brand };
  const palette = { ...next.palette };
  for (const role of brandColorRoles) {
    const key = params.get(role);
    if (!key) continue;
    const shade = readSwatch(key);
    if (shade) {
      palette[role] = { family: shade.family, step: shade.step };
      if (role === "primary") next.seed = shade.value;
      if (role === "secondary") next.accent = shade.value;
    } else if (role !== "primary" && role !== "secondary" && /^[a-f\d]{6}$/i.test(key)) {
      palette[role] = { seed: "#" + key.toLowerCase() };
    }
  }
  const neutral = readFamily(surfaces, params.get("neutral"));
  if (neutral) palette.neutral = neutral;
  if (Object.keys(palette).length) next.palette = palette;
  return next;
}

function legacyPalette(brand: BrandTheme, params: URLSearchParams) {
  const scheme = params.get("scheme");
  const source = params.get("source");
  if (scheme && Object.hasOwn(colorThemes, scheme)) {
    const id = scheme as ColorThemeId;
    return withPalette({ ...applyColorTheme(brand, id), paletteOrigin: id }, params);
  }
  return withPalette(source && Object.hasOwn(colorThemes, source) ? { ...brand, paletteOrigin: source as ColorThemeId } : brand, params);
}

function readProfile(id: StudioThemeId, params: URLSearchParams) {
  const base = studioTheme(id);
  const seed = params.get("seed") ?? params.get("brand");
  const accent = params.get("accent");
  const brand = {
    ...base,
    seed: seed && /^[\da-f]{6}$/i.test(seed) ? "#" + seed : base.seed,
    accent: accent && /^[\da-f]{6}$/i.test(accent) ? "#" + accent : base.accent,
    corner: corners.find(value => value === params.get("corners")) ?? base.corner,
    typeface: typefaces.find(value => value === params.get("type")) ?? base.typeface,
    rhythm: rhythms.find(value => value === params.get("rhythm")) ?? base.rhythm,
    radius: params.get("radius") ?? base.radius,
    font: params.get("font") ?? base.font,
  };
  return withPalette(validBrand(brand) ?? base, params);
}

export function readBrandTheme(): BrandTheme | undefined {
  const params = new URLSearchParams(globalThis.location?.hash.split("?")[1]);
  const profile = featuredColourThemes.find(id => id === params.get("scheme"));
  // Older custom schemes serialized the full brand settings, even without an edition.
  const fullBrand = ["brand", "corners", "type", "rhythm"].every(key => params.has(key));
  if (profile && !params.has("edition") && !fullBrand) return readProfile(profile, params);
  const preset = Object.values(editions).find(({ edition }) => edition.toLowerCase() === params.get("edition"));
  if (preset && params.size === 1) return preset;
  if (preset === editions.Precision && params.size === oldPrecision.size &&
    [...oldPrecision].every(([key, value]) => params.get(key) === value)) return preset;

  const colour = params.get("brand");
  if (!colour && (preset || Object.hasOwn(colorThemes, params.get("scheme") ?? ""))) {
    return legacyPalette(preset ?? editions.Precision, params);
  }
  const corner = corners.find((value) => value === params.get("corners"));
  if (!colour || !/^[a-f0-9]{6}$/iu.test(colour) || !corner) return undefined;
  // The original shared URLs used only colour and corners.
  const typeface = typefaces.find((value) => value === params.get("type")) ?? "Serif";
  const rhythm = rhythms.find((value) => value === params.get("rhythm")) ?? "Balanced";
  const base: BrandTheme = { seed: `#${colour.toLowerCase()}`, corner, typeface, rhythm, edition: preset?.edition };
  // A product's own second colour, radius and font are optional and dropped when malformed.
  const accent = params.get("accent");
  const radius = params.get("radius");
  const font = params.get("font");
  const brand = validBrand({ ...base, ...(accent && { accent: `#${accent.toLowerCase()}` }), ...(radius && { radius }), ...(font && { font }) }) ?? base;
  return legacyPalette(brand, params);
}

export function brandRoute(route: "colours" | "theme" | "playground" | "ui" | `ui/${string}`, brand?: BrandTheme) {
  const path = href(route);
  if (!brand) return path;
  const { edition, seed, corner, typeface, rhythm, accent, radius, font, palette } = brand;
  if (brand.profile) {
    const base = studioTheme(brand.profile);
    const params = new URLSearchParams({ scheme: brand.profile });
    if (corner !== base.corner) params.set("corners", corner);
    if (typeface !== base.typeface) params.set("type", typeface);
    if (rhythm !== base.rhythm) params.set("rhythm", rhythm);
    if (font) params.set("font", font);
    if (radius) params.set("radius", radius);
    if (!palette?.primary && seed.toLowerCase() !== base.seed) params.set("seed", seed.slice(1));
    if (!palette?.secondary && accent && accent.toLowerCase() !== base.accent) params.set("accent", accent.slice(1));
    for (const role of brandColorRoles) {
      const value = assignmentValue(palette?.[role]);
      if (value && value !== assignmentValue(base.palette?.[role])) params.set(role, value);
    }
    if (palette?.neutral && palette.neutral !== base.palette?.neutral) params.set("neutral", palette.neutral.toLowerCase());
    return path + "?" + params;
  }
  const preset: BrandTheme | undefined = edition && editions[edition];
  const scheme = matchingColorTheme(brand);
  if (edition && preset && corner === preset.corner && typeface === preset.typeface && rhythm === preset.rhythm &&
    radius === preset.radius && font === preset.font) {
    const base = `${path}?edition=${edition.toLowerCase()}`;
    if (scheme) return `${base}&scheme=${scheme}`;
    if (!palette && seed === preset.seed && (accent ?? preset.accent) === preset.accent) return base;
  }

  const params = new URLSearchParams({ brand: seed.slice(1), corners: corner, type: typeface, rhythm });
  if (accent) params.set("accent", accent.slice(1));
  if (radius) params.set("radius", radius);
  if (font) params.set("font", font);
  if (edition) params.set("edition", edition.toLowerCase());
  if (scheme) params.set("scheme", scheme);
  else if (palette) {
    if (brand.paletteOrigin) params.set("source", brand.paletteOrigin);
    for (const role of brandColorRoles) {
      const value = assignmentValue(palette[role]);
      if (value) params.set(role, value);
    }
    if (palette.neutral) params.set("neutral", palette.neutral.toLowerCase());
  }
  return `${path}?${params}`;
}
