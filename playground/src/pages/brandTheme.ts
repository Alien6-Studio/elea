import { corners, editions, makeBrandTheme, rhythms, typefaces, type BrandTheme } from "@alien6-studio/elea-tokens/brand";

import { href } from "../router.js";

export { editions, makeBrandTheme, typeFamilies, type BrandTheme } from "@alien6-studio/elea-tokens/brand";

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

export function readBrandTheme(): BrandTheme | undefined {
  const params = new URLSearchParams(globalThis.location?.hash.split("?")[1]);
  const preset = Object.values(editions).find(({ edition }) => edition.toLowerCase() === params.get("edition"));
  if (preset && params.size === 1) return preset;
  if (preset === editions.Precision && params.size === oldPrecision.size &&
    [...oldPrecision].every(([key, value]) => params.get(key) === value)) return preset;

  const colour = params.get("brand");
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
  return validBrand({ ...base, ...(accent && { accent: `#${accent.toLowerCase()}` }), ...(radius && { radius }), ...(font && { font }) }) ?? base;
}

export function brandRoute(route: "theme" | "playground" | "ui" | `ui/${string}`, brand?: BrandTheme) {
  const path = href(route);
  if (!brand) return path;
  const { edition, seed, corner, typeface, rhythm, accent, radius, font } = brand;
  const preset: BrandTheme | undefined = edition && editions[edition];
  if (edition && preset && seed === preset.seed && (accent ?? preset.accent) === preset.accent &&
    corner === preset.corner && typeface === preset.typeface && rhythm === preset.rhythm &&
    radius === preset.radius && font === preset.font) {
    return `${path}?edition=${edition.toLowerCase()}`;
  }

  const params = new URLSearchParams({ brand: seed.slice(1), corners: corner, type: typeface, rhythm });
  if (accent) params.set("accent", accent.slice(1));
  if (radius) params.set("radius", radius);
  if (font) params.set("font", font);
  if (edition) params.set("edition", edition.toLowerCase());
  return `${path}?${params}`;
}
