import { brandAppearanceVariable, cssVariableName, localAppearanceSelector } from "./css.js";

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const RADII = {
  Square: ["0", "0", "0", "0"],
  Soft: ["0.25rem", "0.375rem", "0.5rem", "0.75rem"],
  Round: ["0.5rem", "0.875rem", "1.125rem", "1.5rem"],
} as const;

export type Corners = keyof typeof RADII;
export const corners: readonly Corners[] = Object.keys(RADII) as Corners[];
export const typeFamilies = {
  Sans: "var(--elea-font-family-sans)",
  Serif: "var(--elea-font-family-serif)",
  Mono: "var(--elea-font-family-mono)",
} as const;

const READING = {
  Compact: { size: "1rem", leading: "1.45", measure: "58ch" },
  Balanced: { size: "1.125rem", leading: "1.625", measure: "68ch" },
  Airy: { size: "1.25rem", leading: "1.8", measure: "72ch" },
} as const;
export type Typeface = keyof typeof typeFamilies;
export type Rhythm = keyof typeof READING;
export const typefaces: readonly Typeface[] = Object.keys(typeFamilies) as Typeface[];
export const rhythms: readonly Rhythm[] = Object.keys(READING) as Rhythm[];

export type Edition = "Precision" | "Editorial" | "Obsidian";

export interface BrandTheme {
  /** Retains a built-in edition's surfaces and control treatment while customizing its identity. */
  edition?: Edition | undefined;
  /** Six hexadecimal digits prefixed by a hash. */
  seed: string;
  corner: Corners;
  typeface: Typeface;
  rhythm: Rhythm;
  /** The product's own interface font: any CSS font stack, `var(--font-inter), system-ui` included. */
  font?: string | undefined;
  /** A second brand colour, six hexadecimal digits; it drives the secondary ramp. */
  accent?: string | undefined;
  /** A free corner radius in `rem` or `px` for large surfaces; the other steps follow it and `corner` is ignored. */
  radius?: string | undefined;
}

export const editions = {
  Precision: { edition: "Precision", seed: "#08745e", accent: "#465451", corner: "Soft", typeface: "Sans", rhythm: "Balanced" },
  Editorial: { edition: "Editorial", seed: "#2945c7", accent: "#454a70", corner: "Square", typeface: "Serif", rhythm: "Airy" },
  Obsidian: { edition: "Obsidian", seed: "#a15f3e", accent: "#495060", corner: "Soft", radius: "0.375rem", typeface: "Sans", rhythm: "Compact" },
} as const satisfies Record<Edition, BrandTheme>;

// Each color pair uses the same semantic role in both appearances.
const surfaces = {
  Precision: {
    "color.surface.default": ["#ffffff", "#11161e"],
    "color.surface.subtle": ["#f4f7fa", "#19212b"],
    "color.surface.muted": ["#e9eef4", "#252f3d"],
    "color.surface.inverse": ["#16202d", "#edf2f7"],
    "color.text.default": ["#16202d", "#edf2f7"],
    "color.text.muted": ["#46576b", "#afbdcc"],
    "color.text.subtle": ["#526378", "#a3b2c2"],
    "color.text.inverse": ["#ffffff", "#11161e"],
    "color.border.default": ["#dbe3ed", "#313e4d"],
    "color.border.strong": ["#8594a8", "#65768a"],
  },
  Editorial: {
    "color.surface.default": ["#fafafc", "#171923"],
    "color.surface.subtle": ["#eef0f4", "#212535"],
    "color.surface.muted": ["#e3e8f4", "#2b3450"],
    "color.surface.inverse": ["#171923", "#f2f5ff"],
    "color.text.default": ["#171923", "#f2f5ff"],
    "color.text.muted": ["#495469", "#bac6e0"],
    "color.text.subtle": ["#545e73", "#aab8d6"],
    "color.text.inverse": ["#fafafc", "#171923"],
    "color.border.default": ["#cbd1df", "#424b65"],
    "color.border.strong": ["#87909e", "#6f7e9e"],
  },
  Obsidian: {
    "color.surface.default": ["#f9fafb", "#191b20"],
    "color.surface.subtle": ["#e9ecf1", "#23262d"],
    "color.surface.muted": ["#dfe4eb", "#30343e"],
    "color.surface.inverse": ["#20232b", "#eff0f3"],
    "color.text.default": ["#20232b", "#eff0f3"],
    "color.text.muted": ["#485261", "#c0c7d2"],
    "color.text.subtle": ["#525c6b", "#aeb7c5"],
    "color.text.inverse": ["#f9fafb", "#191b20"],
    "color.border.default": ["#c7ced8", "#404853"],
    "color.border.strong": ["#828d9d", "#717d8f"],
  },
} as const;

const controlStyles = {
  Precision: {
    "_density": "0px",
    "_tabs-presentation": "segmented",
    "_control-fill": "100%",
    "_outline-tint": "15%",
    "_control-edge": "0 1px 2px rgb(0 0 0 / 0.12)",
    "_control-press-shadow": "inset 0 1px 3px rgb(0 0 0 / 0.22)",
    "_field-border-width": "1px",
    "_shadow-ambient": "initial",
    "shadow-sm": "0 1px 2px rgb(0 0 0 / 0.12)",
    "shadow-md": "0 1px 3px rgb(0 0 0 / 0.12), 0 8px 22px -10px rgb(0 0 0 / 0.24)",
  },
  Editorial: {
    "_density": "2px",
    "_tabs-presentation": "underline",
    "_control-fill": "100%",
    "_outline-tint": "0%",
    "_control-edge": "none",
    "_control-press-shadow": "inset 0 -2px rgb(0 0 0 / 0.23)",
    "_field-border-width": "1px 1px 2px",
    "_shadow-ambient": "0 7px 12px -9px rgb(0 0 0 / 0.24)",
    "shadow-sm": "0 1px rgb(0 0 0 / 0.14)",
    "shadow-md": "0 1px 0 1px rgb(0 0 0 / 0.12), var(--elea-_shadow-ambient)",
  },
  Obsidian: {
    "_density": "-2px",
    "_tabs-presentation": "rail",
    "_control-fill": "0%",
    "_outline-tint": "100%",
    "_control-edge": "inset 0 1px rgb(255 255 255 / 0.18), inset 0 -1px rgb(0 0 0 / 0.15)",
    "_control-press-shadow": "inset 0 2px 4px rgb(0 0 0 / 0.32)",
    "_field-border-width": "1px",
    "_shadow-ambient": "0 1px 3px rgb(0 0 0 / 0.24), 0 12px 24px -10px rgb(0 0 0 / 0.35)",
    "shadow-sm": "0 1px 2px rgb(0 0 0 / 0.18)",
    "shadow-md": "inset 0 1px rgb(255 255 255 / 0.14), var(--elea-_shadow-ambient)",
  },
} as const;

function channels(hex: string) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function mix(hex: string, target: number, amount: number) {
  return "#" + channels(hex).map((channel) => Math.round(channel + (target - channel) * amount).toString(16).padStart(2, "0")).join("");
}

function luminance(colour: string) {
  const [r = 0, g = 0, b = 0] = channels(colour).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

/** The seed darkened until a white label on it reaches a contrast ratio of 4.5:1. */
function readable(seed: string) {
  let solid = seed.toLowerCase();
  let step = 1;
  while (luminance(solid) > 1.05 / 4.5 - 0.05) {
    solid = mix(seed, 0, step / 100);
    step += 1;
  }
  return solid;
}

const HEX = /^#[a-f0-9]{6}$/i;

function assertBrandTheme({ seed, corner, typeface, rhythm, font, accent }: Omit<BrandTheme, "radius">, className: string) {
  if (typeof className !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(className)) {
    throw new RangeError("Expected a CSS class name of up to 64 ASCII characters starting with a letter");
  }
  if (typeof seed !== "string" || !HEX.test(seed)) throw new RangeError("Expected a six-digit hex colour");
  if (!Object.hasOwn(RADII, corner)) throw new RangeError("Unknown corner style");
  if (!Object.hasOwn(typeFamilies, typeface)) throw new RangeError("Unknown reading typeface");
  if (!Object.hasOwn(READING, rhythm)) throw new RangeError("Unknown reading density");
  if (accent !== undefined && (typeof accent !== "string" || !HEX.test(accent))) throw new RangeError("Expected a six-digit hex accent colour");
  // The stack lands in a stylesheet: only names, quotes, commas and var() may appear in it.
  if (font !== undefined && (typeof font !== "string" || !/^[A-Za-z0-9 ,'"()_-]{1,200}$/.test(font))) throw new RangeError("Expected a CSS font stack");
}

function parseRadius(radius: string | undefined) {
  if (radius === undefined) return null;
  const length = /^(\d{1,3}(?:\.\d{1,4})?)(rem|px)$/.exec(String(radius));
  if (!length) throw new RangeError("Expected a radius in rem or px");
  return length;
}

/** Generate a scoped stylesheet and its ordered primary ramp (50 to 950). */
export function makeBrandTheme({ edition, seed, corner, typeface, rhythm, font, accent, radius }: BrandTheme, className = "elea-brand") {
  assertBrandTheme({ seed, corner, typeface, rhythm, font, accent }, className);
  if (edition !== undefined && !Object.hasOwn(editions, edition)) throw new RangeError("Unknown edition");
  const length = parseRadius(radius);
  const radii = length
    ? [0.5, 0.75, 1, 1.5].map((factor) => `${Number((Number(length[1]) * factor).toFixed(4))}${length[2]}`)
    : RADII[corner];
  const reading = READING[rhythm];
  const solid = readable(seed);
  const colours = [
    ...[0.94, 0.85, 0.71, 0.57, 0.39, 0.18].map((amount) => mix(solid, 255, amount)),
    solid,
    ...[0.17, 0.32, 0.48, 0.68].map((amount) => mix(solid, 0, amount)),
  ];
  // Secondary buttons fill with the 700 step, so that is where the readable accent sits.
  const accentSeed = accent ?? (edition && editions[edition].accent);
  const second = accentSeed === undefined ? null : readable(accentSeed);
  const secondary = second === null ? [] : [
    ...[0.94, 0.85, 0.71, 0.57, 0.42, 0.28, 0.14].map((amount) => mix(second, 255, amount)),
    second,
    ...[0.17, 0.32].map((amount) => mix(second, 0, amount)),
  ];
  const tokens = [
    ...SHADES.map((shade, index) => `  --elea-color-primary-${shade}: ${colours[index]};`),
    ...secondary.map((colour, index) => `  --elea-color-secondary-${SHADES[index]}: ${colour};`),
    ...["sm", "md", "lg", "xl"].map((size, index) => `  --elea-radius-${size}: ${radii[index]};`),
    ...(font === undefined ? [] : [`  --elea-font-family-sans: ${font};`]),
    `  --elea-font-family-content: ${typeFamilies[typeface]};`,
    `  --elea-font-size-lg: ${reading.size};`,
    `  --elea-font-leading-relaxed: ${reading.leading};`,
    `  --elea-size-measure: ${reading.measure};`,
    "  --elea-color-text-on-brand: #ffffff;",
  ];
  const shade = (step: number, ramp = "primary") => `var(--elea-color-${ramp}-${step})`;
  const semantic: [string, string, string][] = [
    ["color.text.link", shade(700), shade(300)],
    ["color.text.link-hover", shade(800), shade(200)],
    ["color.focus", shade(600), shade(300)],
    ["color.info", shade(700), shade(300)],
  ];
  if (edition) {
    for (const [path, [day, night]] of Object.entries(surfaces[edition])) semantic.push([path, day, night]);
    for (const [property, value] of Object.entries(controlStyles[edition])) tokens.push(`  --elea-${property}: ${value};`);
    // Rebind these roles inside a named scope, including when it sits in another edition.
    semantic.push(
      ["color.text.accent", shade(700, "secondary"), shade(300, "secondary")],
      ["color.border.accent", shade(600, "secondary"), shade(400, "secondary")],
    );
  }
  const declarations = (mode: "light" | "dark", indent: string) => semantic.map(([path, day, night]) =>
    `${indent}${cssVariableName(path)}: ${mode === "light" ? day : night};`).join("\n");
  // The aliases remain available when a local appearance is introduced inside this brand.
  for (const [path, day, night] of semantic) {
    tokens.push(`  ${brandAppearanceVariable(path, "light")}: ${day};`,
      `  ${brandAppearanceVariable(path, "dark")}: ${night};`);
  }
  const scopes = [`.${className}`, `[data-elea-theme="${className.replace(/^elea-/, "")}"]`];
  const selector = scopes.join(", ");
  const darkScope = (root: string) => scopes.flatMap((scope) => [`${root}${scope}`, `${root} ${scope}`]).join(", ");
  // Match the specificity of the legacy root+theme rules, winning by source order within this sheet.
  const local = scopes.flatMap(scope => [
    `${scope}${localAppearanceSelector}:is(:root, *)`, `${localAppearanceSelector} ${scope}:is(:root, *)`,
  ]).join(", ");
  const css = [
    `${selector} {`, ...tokens, declarations("light", "  "), "}", "",
    "@media (prefers-color-scheme: dark) {",
    `  ${darkScope(':root:not([data-theme="light"])')} {`,
    declarations("dark", "    "), "  }", "}", "",
    `${darkScope(':root[data-theme="dark"]')} {`, declarations("dark", "  "), "}", "",
    "@supports (color: light-dark(white, black)) {", `  ${local} {`,
    ...semantic.map(([path]) => `    ${cssVariableName(path)}: light-dark(var(${brandAppearanceVariable(path, "light")}), var(${brandAppearanceVariable(path, "dark")}));`),
    "  }", "}", "",
  ].join("\n");
  return { css, colours };
}
