import baseTokens from "../tokens/elea.tokens.json" with { type: "json" };
import darkTokens from "../tokens/elea.dark.tokens.json" with { type: "json" };
import { brandAppearanceVariable, cssVariableName, localAppearanceSelector } from "./css.js";
import { colorFamilies, surfaceFamilies, colorSteps, defaultColorStep, defaultTertiaryFamily, brandColorRoles, type BrandColorRole, type ColorFamily, type ColorStep, type SurfaceFamily } from "./palette.js";

import { statusColors } from "./status.js";

export { brandColorRoles, type BrandColorRole };
export { applyColorTheme, createThemeProfile, matchingColorTheme } from "./color-themes.js";

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
export type ControlTreatment = keyof typeof controlStyles;

export interface PaletteSelection {
  family: ColorFamily;
  step: ColorStep;
}

export type RoleAssignment = PaletteSelection | { seed: string };

export interface BrandTheme {
  /** Retains a built-in edition's surfaces and control treatment while customizing its identity. */
  edition?: Edition | undefined;
  /** Control surfaces, elevation, density and tab treatment. Overrides the edition's treatment. */
  controls?: ControlTreatment | undefined;
  /** Six hexadecimal digits prefixed by a hash. */
  seed: string;
  corner: Corners;
  typeface: Typeface;
  rhythm: Rhythm;
  /** The product's own interface font: any CSS font stack, `var(--font-inter), system-ui` included. */
  font?: string | undefined;
  /** A second brand colour, six hexadecimal digits; it drives the secondary ramp. */
  accent?: string | undefined;
  /** Exact reference shades for actions and an optional family for surfaces, text and borders. */
  palette?: {
    primary?: PaletteSelection | undefined;
    secondary?: PaletteSelection | undefined;
    neutral?: SurfaceFamily | undefined;
    tertiary?: RoleAssignment | undefined;
    success?: RoleAssignment | undefined;
    info?: RoleAssignment | undefined;
    warning?: RoleAssignment | undefined;
    danger?: RoleAssignment | undefined;
  } | undefined;
  /** A free corner radius in `rem` or `px` for large surfaces; the other steps follow it and `corner` is ignored. */
  radius?: string | undefined;
}

/** Primary and secondary seeds that can be applied to any edition. */
export const brandPalettes = {
  Emerald: { seed: "#08745e", accent: "#465451" },
  Cobalt: { seed: "#2945c7", accent: "#454a70" },
  Copper: { seed: "#a15f3e", accent: "#495060" },
  Plum: { seed: "#873b76", accent: "#625078" },
  Lagoon: { seed: "#096a88", accent: "#81542f" },
} as const;

export const editions = {
  Precision: { edition: "Precision", ...brandPalettes.Emerald, corner: "Soft", typeface: "Sans", rhythm: "Balanced" },
  Editorial: { edition: "Editorial", ...brandPalettes.Cobalt, corner: "Square", typeface: "Serif", rhythm: "Airy" },
  Obsidian: { edition: "Obsidian", ...brandPalettes.Copper, corner: "Soft", radius: "0.375rem", typeface: "Sans", rhythm: "Compact" },
} as const satisfies Record<Edition, BrandTheme>;

// Light and dark surface pairs for historical editions.
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
  raised: {
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
  flat: {
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
  inset: {
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

const editionControls = { Precision: "raised", Editorial: "flat", Obsidian: "inset" } as const satisfies Record<Edition, ControlTreatment>;

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

type Swatch = { step: ColorStep; value: string };
type ColorPair = [path: string, light: string, dark: string];
const brandRamps = ["primary", "secondary"] as const;
type Ramp = typeof brandRamps[number];
type Action = ReturnType<typeof assignedAction>;
const actionSuffixes = { fill: "", text: "-text", hover: "-hover", pressed: "-pressed", ink: "-ink",
  container: "-container", onContainer: "-on-container" } as const;

type SurfacePairs = Readonly<Record<keyof typeof surfaces.Precision, readonly [string, string]>>;

function referenceFamily(family: ColorFamily) {
  if (!Object.hasOwn(colorFamilies, family)) throw new RangeError("Unknown reference colour family");
  return colorFamilies[family];
}

function referenceShade(pick: PaletteSelection | undefined) {
  if (pick === undefined) return;
  if (pick === null || !colorSteps.includes(pick.step)) throw new RangeError("Unknown reference colour step");
  return referenceFamily(pick.family);
}

function contrast(foreground: string, background: string) {
  const a = luminance(foreground) + 0.05;
  const b = luminance(background) + 0.05;
  return Math.max(a / b, b / a);
}

function seedScale(seed: string): Swatch[] {
  const colours = [
    ...[0.96, 0.71, 0.57, 0.39, 0.18].map(amount => mix(seed, 255, amount)),
    seed.toLowerCase(),
    ...[0.17, 0.32, 0.64, 0.8, 0.92].map(amount => mix(seed, 0, amount)),
  ];
  return colorSteps.map((step, index) => ({ step, value: colours[index]! }));
}

function swatchAt(scale: readonly Swatch[], step: ColorStep) {
  return scale[colorSteps.indexOf(step)]!.value;
}

/** Keep exported themes usable with or without the optional reference sheet. */
function referenceVariable(family: SurfaceFamily, swatch: Swatch) {
  return `var(--elea-palette-${family.toLowerCase()}-${swatch.step}, ${swatch.value})`;
}

function neutralSurfaces(family: SurfaceFamily): SurfacePairs {
  if (!Object.hasOwn(surfaceFamilies, family)) throw new RangeError("Unknown surface colour family");
  const scale = surfaceFamilies[family];
  const pair = (light: ColorStep, dark: ColorStep) => [swatchAt(scale, light), swatchAt(scale, dark)] as const;
  return {
    "color.surface.default": pair(50, 950), "color.surface.subtle": pair(100, 900),
    "color.surface.muted": pair(200, 800), "color.surface.inverse": pair(900, 100),
    "color.text.default": pair(950, 50), "color.text.muted": pair(800, 100),
    "color.text.subtle": pair(700, 200), "color.text.inverse": pair(50, 950),
    "color.border.default": pair(200, 800), "color.border.strong": pair(600, 400),
  };
}

function readableInk(scale: readonly Swatch[], step: ColorStep, surfaces: SurfacePairs, mode: 0 | 1, minimum: number) {
  const backgrounds = [surfaces["color.surface.default"][mode], surfaces["color.surface.muted"][mode]];
  return scale.filter(({ value }) => backgrounds.every(background => contrast(value, background) >= minimum))
    .reduce((closest, next) => Math.abs(next.step - step) < Math.abs(closest.step - step) ? next : closest);
}

function assignedAction(scale: readonly Swatch[], step: ColorStep, surfaces: SurfacePairs) {
  const fill = swatchAt(scale, step);
  const text = contrast(fill, "#000000") > contrast(fill, "#ffffff") ? "#000000" : "#ffffff";
  // Pure black and white collapse one half of a seeded ramp. Use distinct tones with the same foreground.
  const states = scale.filter(({ value }) => contrast(value, text) >= 4.5 && contrast(value, fill) >= 1.1);
  const darker = states.filter(swatch => swatch.step > step);
  const lighter = states.filter(swatch => swatch.step < step).reverse();
  const order = darker.length >= 2 ? [...darker, ...lighter] : [...lighter, ...darker];
  const [hover, pressed] = [...new Set(order.map(swatch => swatch.value))];
  function appearance(mode: 0 | 1) {
    return {
      fill, text, hover: hover!, pressed: pressed!, ink: readableInk(scale, step, surfaces, mode, 4.5).value,
      container: swatchAt(scale, mode === 0 ? 100 : 800),
      onContainer: swatchAt(scale, mode === 0 ? 900 : 50),
    };
  }
  return { light: appearance(0), dark: appearance(1) };
}

/** Generate scoped CSS, colour roles and their tone scales. */
export function makeBrandTheme({ edition, controls, seed, corner, typeface, rhythm, font, accent, palette, radius }: BrandTheme, className = "elea-brand") {
  assertBrandTheme({ seed, corner, typeface, rhythm, font, accent }, className);
  if (edition !== undefined && !Object.hasOwn(editions, edition)) throw new RangeError("Unknown edition");
  if (palette !== undefined && (palette === null || typeof palette !== "object" || Array.isArray(palette))) throw new RangeError("Expected palette assignments");
  const length = parseRadius(radius);
  const radii = length
    ? [0.5, 0.75, 1, 1.5].map((factor) => `${Number((Number(length[1]) * factor).toFixed(4))}${length[2]}`)
    : RADII[corner];
  const reading = READING[rhythm];
  const accentSeed = accent ?? (edition && editions[edition].accent);
  const primary = referenceShade(palette?.primary) ?? seedScale(seed);
  const secondary = referenceShade(palette?.secondary) ?? (accentSeed === undefined ? undefined : seedScale(accentSeed));
  const roleScales: Partial<Record<BrandColorRole, readonly Readonly<Swatch>[]>> = { primary };
  // The public secondary ramp historically spans 50–900.
  const palettes = { primary: [...primary], secondary: secondary ? secondary.slice(0, -1) : [] };
  const colours = primary.map(swatch => swatch.value);
  const tokens = [
    ...brandRamps.flatMap(role => palettes[role].map(swatch => {
      const selected = palette?.[role];
      const value = selected ? referenceVariable(selected.family, swatch) : swatch.value;
      return `  --elea-color-${role}-${swatch.step}: ${value};`;
    })),
    ...["sm", "md", "lg", "xl"].map((size, index) => `  --elea-radius-${size}: ${radii[index]};`),
    ...(font === undefined ? [] : [`  --elea-font-family-sans: ${font};`]),
    `  --elea-font-family-content: ${typeFamilies[typeface]};`,
    `  --elea-font-size-lg: ${reading.size};`,
    `  --elea-font-leading-relaxed: ${reading.leading};`,
    `  --elea-size-measure: ${reading.measure};`,
    "  --elea-color-text-on-brand: #ffffff;",
  ];
  const shade = (step: number, ramp = "primary") => `var(--elea-color-${ramp}-${step})`;
  const surface = palette?.neutral !== undefined ? neutralSurfaces(palette.neutral) : edition && surfaces[edition];
  if (palette?.neutral === "Gray") {
    for (const swatch of surfaceFamilies.Gray) {
      tokens.push(`  --elea-color-neutral-${swatch.step}: ${referenceVariable("Gray", swatch)};`);
    }
  }
  const backgrounds = surface || surfaces.Precision;
  const tokenFor = (role: Ramp, swatch: Swatch) => {
    if (role !== "secondary" || swatch.step !== 950) return shade(swatch.step, role);
    const selected = palette?.secondary;
    return selected ? referenceVariable(selected.family, swatch) : swatch.value;
  };
  function inkPair(path: string, role: Ramp, light: ColorStep, dark: ColorStep, minimum = 4.5): ColorPair {
    const scale = roleScales[role]!;
    return [path, tokenFor(role, readableInk(scale, light, backgrounds, 0, minimum)),
      tokenFor(role, readableInk(scale, dark, backgrounds, 1, minimum))];
  }
  // Keep historical link and info tones with the seed at 500.
  const linkSteps: [ColorStep, ColorStep] = palette?.primary ? [700, 300] : [600, 200];
  const hoverSteps: [ColorStep, ColorStep] = palette?.primary ? [800, 200] : [700, 100];
  const statusDefaults: ColorPair[] = [];
  const semantic: ColorPair[] = [
    inkPair("color.text.link", "primary", ...linkSteps), inkPair("color.text.link-hover", "primary", ...hoverSteps),
    inkPair("color.focus", "primary", 600, 300, 3),
  ];
  if (surface) {
    const neutral = palette?.neutral;
    const surfaceValue = (value: string) => neutral ? referenceVariable(neutral, surfaceFamilies[neutral].find(swatch => swatch.value === value)!) : value;
    for (const [path, [day, night]] of Object.entries(surface)) semantic.push([path, surfaceValue(day), surfaceValue(night)]);
  }
  const treatment = controls === undefined && edition ? editionControls[edition] : controls;
  if (treatment !== undefined) {
    if (!Object.hasOwn(controlStyles, treatment)) throw new RangeError("Unknown control treatment");
    for (const [property, value] of Object.entries(controlStyles[treatment])) tokens.push(`  --elea-${property}: ${value};`);
  }
  if (secondary) {
    roleScales.secondary = secondary;
    semantic.push(
      inkPair("color.text.accent", "secondary", 700, 300), inkPair("color.border.accent", "secondary", 600, 400, 3),
    );
  }
  const roles: Partial<Record<BrandColorRole, Action>> = {};

  function emitAction(role: BrandColorRole, action: Action,
    resolve: (key: keyof typeof actionSuffixes, value: string) => string, pairs = semantic) {
    roles[role] = action;
    for (const key of Object.keys(actionSuffixes) as (keyof typeof actionSuffixes)[]) {
      const path = `color.action.${role}${actionSuffixes[key]}`;
      const day = resolve(key, action.light[key]);
      const night = resolve(key, action.dark[key]);
      const isStatus = role !== "primary" && role !== "secondary" && role !== "tertiary";
      if (isStatus || key === "ink" || key === "container" || key === "onContainer") {
        pairs.push([path, day, night]);
      } else {
        tokens.push(`  ${cssVariableName(path)}: ${day};`);
      }
    }
  }

  for (const role of brandRamps) {
    const scale = roleScales[role];
    if (!scale) continue;
    const step = palette?.[role]?.step ?? defaultColorStep;
    emitAction(role, assignedAction(scale, step, backgrounds), (key, value) =>
      key === "text" ? value : tokenFor(role, key === "fill" ? scale[colorSteps.indexOf(step)]! : scale.find(swatch => swatch.value === value)!));
  }
  for (const role of brandColorRoles) {
    if (role === "primary" || role === "secondary") continue;
    const assignment = palette?.[role];
    const pick: RoleAssignment | undefined = assignment === undefined && role === "tertiary" && edition
      ? { family: defaultTertiaryFamily, step: defaultColorStep } : assignment;
    if (pick !== undefined) {
      if (!pick || typeof pick !== "object") throw new RangeError("Expected a reference shade or a hex seed");
      if ("seed" in pick && (typeof pick.seed !== "string" || !HEX.test(pick.seed))) throw new RangeError("Expected a six-digit hex colour");
      const scale = "seed" in pick ? seedScale(pick.seed) : referenceShade(pick)!;
      roleScales[role] = scale;
      const action = assignedAction(scale, "seed" in pick ? defaultColorStep : pick.step, backgrounds);
      const variable = (value: string) => "seed" in pick ? value : referenceVariable(pick.family, scale.find(swatch => swatch.value === value)!);
      emitAction(role, action, (key, value) => key === "text" ? value : variable(value));
      if (role !== "tertiary") semantic.push([`color.${role}`, variable(action.light.ink), variable(action.dark.ink)]);
    } else if (edition && role !== "tertiary") {
      const info = role === "info";
      const light = info ? readableInk(primary, linkSteps[0], backgrounds, 0, 4.5).value : baseTokens.color[role].$value;
      const dark = info ? readableInk(primary, linkSteps[1], backgrounds, 1, 4.5).value : darkTokens.color[role].$value;
      statusDefaults.push(info ? inkPair("color.info", "primary", ...linkSteps) : [`color.${role}`, light, dark]);
      const action = {
        light: statusColors(light, backgrounds["color.surface.default"][0], backgrounds["color.text.inverse"][0], false),
        dark: statusColors(dark, backgrounds["color.surface.default"][1], backgrounds["color.text.inverse"][1], true),
      };
      // Consumers resolve the legacy status where they render so nested host overrides apply.
      emitAction(role, action, () => "initial", statusDefaults);
    }
  }
  // The aliases remain available when a local appearance is introduced inside this brand.
  for (const [path, day, night] of [...semantic, ...statusDefaults]) {
    tokens.push(`  ${brandAppearanceVariable(path, "light")}: ${day};`,
      `  ${brandAppearanceVariable(path, "dark")}: ${night};`);
  }
  const scopes = [`.${className}`, `[data-elea-theme="${className.replace(/^elea-/, "")}"]`];
  const selector = scopes.join(", ");
  const darkScope = (root: string) => scopes.flatMap((scope) => [`${root}${scope}`, `${root} ${scope}`]).join(", ");
  // Match the legacy root and theme specificity.
  const local = scopes.flatMap(scope => [
    `${scope}${localAppearanceSelector}:is(:root, *)`, `${localAppearanceSelector} ${scope}:is(:root, *)`,
  ]).join(", ");
  function rules(scope: string, mode: "light" | "dark" | "local", indent = "") {
    function declarations(pairs: ColorPair[]) {
      return pairs.map(([path, light, dark]) => {
        const value = mode === "dark" ? dark : mode === "light" || light === dark ? light
          : `light-dark(var(${brandAppearanceVariable(path, "light")}), var(${brandAppearanceVariable(path, "dark")}))`;
        return `${indent}  ${cssVariableName(path)}: ${value};`;
      });
    }
    return [
      `${indent}${scope} {`, ...(mode === "light" ? tokens : []), ...declarations(semantic), `${indent}}`,
      // A named edition resets inherited feedback. A host selector on this very element
      // can still supply its own status before or after the generated sheet.
      ...(statusDefaults.length ? [`${indent}:where(${scope}) {`, ...declarations(statusDefaults), `${indent}}`] : []),
    ];
  }
  const css = [
    ...rules(selector, "light"), "",
    "@media (prefers-color-scheme: dark) {",
    ...rules(darkScope(':root:not([data-theme="light"])'), "dark", "  "), "}", "",
    ...rules(darkScope(':root[data-theme="dark"]'), "dark"), "",
    "@supports (color: light-dark(white, black)) {", ...rules(local, "local", "  "), "}", "",
  ].join("\n");
  return { css, colours, palettes, roles, roleScales };
}
