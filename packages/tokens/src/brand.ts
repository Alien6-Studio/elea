import { channels, contrast } from "./contrast.js";
import baseTokens from "../tokens/elea.tokens.json" with { type: "json" };
import darkTokens from "../tokens/elea.dark.tokens.json" with { type: "json" };
import { brandAppearanceVariable, cssVariableName, localAppearanceSelector } from "./css.js";
import { colorFamilies, colorThemes, surfaceFamilies, colorSteps, defaultColorStep, defaultTertiaryFamily, brandColorRoles, type BrandColorRole, type ColorFamily, type ColorStep, type SurfaceFamily, type ThemeProfileId } from "./palette.js";

import { statusColors } from "./status.js";

export { brandColorRoles, type BrandColorRole } from "./palette.js";
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
  /** Profile-specific shapes apply at the profile's reference corner setting, unless a free radius is supplied. */
  shape?: ThemeProfileId | undefined;
  /** Use uniform Button radii (default), or scale the active profile's action shape for sm, md and lg. */
  buttonRadiusScale?: "uniform" | "profile" | undefined;
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

function mix(hex: string, target: number, amount: number) {
  return "#" + channels(hex).map((channel) => Math.round(channel + (target - channel) * amount).toString(16).padStart(2, "0")).join("");
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
  const readable = scale.filter(({ value }) => backgrounds.every(background => contrast(value, background) >= minimum));
  return readable.reduce((closest, next) => Math.abs(next.step - step) < Math.abs(closest.step - step) ? next : closest, readable[0]!);
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

function buttonRadii(action: string | undefined, corner: Corners, scale: "uniform" | "profile") {
  if (scale !== "uniform" && scale !== "profile") throw new RangeError("Unknown Button radius scale");
  if (action && scale === "profile") {
    const scaled = (factor: number) => {
      // A full radius is deliberately oversized. Bound it before scaling the two smaller capsules.
      if (action.startsWith("var(--elea-radius-full")) return `calc(min(${action}, 1.5em) * ${factor})`;
      return action.replaceAll(/(\d+(?:\.\d+)?)(rem|%)?/g, (number, length, unit) =>
        unit ? `${Number(length) * factor}${unit}` : number);
    };
    return { sm: scaled(0.5), md: scaled(0.75), lg: "var(--elea-shape-action)" };
  }
  const uniform = action && corner === "Square" ? RADII.Soft : undefined;
  return { sm: uniform?.[0], md: uniform?.[1], lg: uniform?.[3] };
}

/** Working state shared by the steps that assemble one brand theme. */
interface Assembly {
  palette: BrandTheme["palette"];
  backgrounds: SurfacePairs;
  tokens: string[];
  semantic: ColorPair[];
  statusDefaults: ColorPair[];
  roles: Partial<Record<BrandColorRole, Action>>;
  roleScales: Partial<Record<BrandColorRole, readonly Readonly<Swatch>[]>>;
  linkSteps: [ColorStep, ColorStep];
}

type RuleMode = "light" | "dark" | "local";
type FeedbackRole = Exclude<BrandColorRole, "primary" | "secondary" | "tertiary">;

function assertEditionAndPalette(edition: Edition | undefined, palette: BrandTheme["palette"]) {
  if (edition !== undefined && !Object.hasOwn(editions, edition)) throw new RangeError("Unknown edition");
  if (palette !== undefined && (palette === null || typeof palette !== "object" || Array.isArray(palette))) throw new RangeError("Expected palette assignments");
}

function cornerRadii(corner: Corners, length: RegExpExecArray | null) {
  return length
    ? [0.5, 0.75, 1, 1.5].map((factor) => `${Number((Number(length[1]) * factor).toFixed(4))}${length[2]}`)
    : RADII[corner];
}

function themeShapes(shape: ThemeProfileId | undefined, corner: Corners, freeRadius: boolean) {
  if (shape !== undefined && (typeof shape !== "string" || !Object.hasOwn(colorThemes, shape) || !("shapes" in colorThemes[shape]))) {
    throw new RangeError("Unknown shape profile");
  }
  const profile = shape === undefined ? undefined : colorThemes[shape];
  return !freeRadius && profile?.profile.corner === corner ? profile.shapes : undefined;
}

type ThemeShapes = ReturnType<typeof themeShapes>;

interface TokenOptions {
  palettes: Record<Ramp, readonly Swatch[]>;
  palette: BrandTheme["palette"];
  radii: readonly string[];
  shapes: ThemeShapes;
  corner: Corners;
  buttonRadiusScale: "uniform" | "profile";
  font: string | undefined;
  typeface: Typeface;
  rhythm: Rhythm;
}

function brandTokens({ palettes, palette, radii, shapes, corner, buttonRadiusScale, font, typeface, rhythm }: TokenOptions) {
  const reading = READING[rhythm];
  return [
    ...brandRamps.flatMap(role => palettes[role].map(swatch => {
      const selected = palette?.[role];
      const value = selected ? referenceVariable(selected.family, swatch) : swatch.value;
      return `  --elea-color-${role}-${swatch.step}: ${value};`;
    })),
    ...["sm", "md", "lg", "xl"].map((size, index) => `  --elea-radius-${size}: ${radii[index]};`),
    ...Object.entries(buttonRadii(shapes?.action, corner, buttonRadiusScale)).map(([size, value]) =>
      `  --elea-button-radius-${size}: ${value ?? "initial"};`),
    // Reset each role at the brand boundary so nested uniform themes use their scalar radii.
    ...(["action", "control", "surface", "indicator"] as const).map(role => `  --elea-shape-${role}: ${shapes?.[role] ?? "initial"};`),
    ...(font === undefined ? [] : [`  --elea-font-family-sans: ${font};`]),
    `  --elea-font-family-content: ${typeFamilies[typeface]};`,
    `  --elea-font-size-lg: ${reading.size};`,
    `  --elea-font-leading-relaxed: ${reading.leading};`,
    `  --elea-size-measure: ${reading.measure};`,
    "  --elea-color-text-on-brand: #ffffff;",
  ];
}

function grayNeutralTokens(neutral: SurfaceFamily | undefined) {
  return neutral === "Gray" ? surfaceFamilies.Gray.map(swatch => `  --elea-color-neutral-${swatch.step}: ${referenceVariable("Gray", swatch)};`) : [];
}

function controlTokens(controls: ControlTreatment | undefined, edition: Edition | undefined) {
  const treatment = controls === undefined && edition ? editionControls[edition] : controls;
  if (treatment === undefined) return [];
  if (!Object.hasOwn(controlStyles, treatment)) throw new RangeError("Unknown control treatment");
  return Object.entries(controlStyles[treatment]).map(([property, value]) => `  --elea-${property}: ${value};`);
}

function surfaceSemantic(surface: SurfacePairs, neutral: SurfaceFamily | undefined): ColorPair[] {
  const surfaceValue = (value: string) => neutral ? referenceVariable(neutral, surfaceFamilies[neutral].find(swatch => swatch.value === value)!) : value;
  return Object.entries(surface).map(([path, [day, night]]): ColorPair => [path, surfaceValue(day), surfaceValue(night)]);
}

function tokenFor(palette: BrandTheme["palette"], role: Ramp, swatch: Swatch) {
  if (role !== "secondary" || swatch.step !== 950) return `var(--elea-color-${role}-${swatch.step})`;
  const selected = palette?.secondary;
  return selected ? referenceVariable(selected.family, swatch) : swatch.value;
}

function inkPair(build: Assembly, path: string, role: Ramp, light: ColorStep, dark: ColorStep, minimum = 4.5): ColorPair {
  const scale = build.roleScales[role]!;
  return [path, tokenFor(build.palette, role, readableInk(scale, light, build.backgrounds, 0, minimum)),
    tokenFor(build.palette, role, readableInk(scale, dark, build.backgrounds, 1, minimum))];
}

function emitAction(build: Assembly, role: BrandColorRole, action: Action,
  resolve: (key: keyof typeof actionSuffixes, value: string) => string, pairs = build.semantic) {
  build.roles[role] = action;
  for (const key of Object.keys(actionSuffixes) as (keyof typeof actionSuffixes)[]) {
    const path = `color.action.${role}${actionSuffixes[key]}`;
    const day = resolve(key, action.light[key]);
    const night = resolve(key, action.dark[key]);
    const isStatus = role !== "primary" && role !== "secondary" && role !== "tertiary";
    if (isStatus || key === "ink" || key === "container" || key === "onContainer") {
      pairs.push([path, day, night]);
    } else {
      build.tokens.push(`  ${cssVariableName(path)}: ${day};`);
    }
  }
}

function emitRampActions(build: Assembly) {
  for (const role of brandRamps) {
    const scale = build.roleScales[role];
    if (!scale) continue;
    const step = build.palette?.[role]?.step ?? defaultColorStep;
    const swatchFor = (key: keyof typeof actionSuffixes, value: string) =>
      key === "fill" ? scale[colorSteps.indexOf(step)]! : scale.find(swatch => swatch.value === value)!;
    emitAction(build, role, assignedAction(scale, step, build.backgrounds), (key, value) =>
      key === "text" ? value : tokenFor(build.palette, role, swatchFor(key, value)));
  }
}

function emitAssignedRole(build: Assembly, role: BrandColorRole, pick: RoleAssignment) {
  if (!pick || typeof pick !== "object") throw new RangeError("Expected a reference shade or a hex seed");
  if ("seed" in pick && (typeof pick.seed !== "string" || !HEX.test(pick.seed))) throw new RangeError("Expected a six-digit hex colour");
  const scale = "seed" in pick ? seedScale(pick.seed) : referenceShade(pick)!;
  build.roleScales[role] = scale;
  const action = assignedAction(scale, "seed" in pick ? defaultColorStep : pick.step, build.backgrounds);
  const variable = (value: string) => "seed" in pick ? value : referenceVariable(pick.family, scale.find(swatch => swatch.value === value)!);
  emitAction(build, role, action, (key, value) => key === "text" ? value : variable(value));
  if (role !== "tertiary") build.semantic.push([`color.${role}`, variable(action.light.ink), variable(action.dark.ink)]);
}

function emitEditionFeedback(build: Assembly, role: FeedbackRole) {
  const { backgrounds, linkSteps } = build;
  const info = role === "info";
  const primary = build.roleScales.primary!;
  const light = info ? readableInk(primary, linkSteps[0], backgrounds, 0, 4.5).value : baseTokens.color[role].$value;
  const dark = info ? readableInk(primary, linkSteps[1], backgrounds, 1, 4.5).value : darkTokens.color[role].$value;
  build.statusDefaults.push(info ? inkPair(build, "color.info", "primary", ...linkSteps) : [`color.${role}`, light, dark]);
  const action = {
    light: statusColors(light, backgrounds["color.surface.default"][0], backgrounds["color.text.inverse"][0], false),
    dark: statusColors(dark, backgrounds["color.surface.default"][1], backgrounds["color.text.inverse"][1], true),
  };
  // Consumers resolve the legacy status where they render so nested host overrides apply.
  emitAction(build, role, action, () => "initial", build.statusDefaults);
}

function emitOtherRoles(build: Assembly, edition: Edition | undefined) {
  for (const role of brandColorRoles) {
    if (role === "primary" || role === "secondary") continue;
    const assignment = build.palette?.[role];
    const pick: RoleAssignment | undefined = assignment === undefined && role === "tertiary" && edition
      ? { family: defaultTertiaryFamily, step: defaultColorStep } : assignment;
    if (pick !== undefined) emitAssignedRole(build, role, pick);
    else if (edition && role !== "tertiary") emitEditionFeedback(build, role);
  }
}

function declarationValue(path: string, light: string, dark: string, mode: RuleMode) {
  if (mode === "dark") return dark;
  if (mode === "light" || light === dark) return light;
  return `light-dark(var(${brandAppearanceVariable(path, "light")}), var(${brandAppearanceVariable(path, "dark")}))`;
}

function declarations(pairs: ColorPair[], mode: RuleMode, indent: string) {
  return pairs.map(([path, light, dark]) => `${indent}  ${cssVariableName(path)}: ${declarationValue(path, light, dark, mode)};`);
}

function brandRules(build: Assembly, scope: string, mode: RuleMode, indent = "") {
  const { semantic, statusDefaults } = build;
  return [
    `${indent}${scope} {`, ...(mode === "light" ? build.tokens : []), ...declarations(semantic, mode, indent), `${indent}}`,
    // A named edition resets inherited feedback. A host selector on this very element
    // can still supply its own status before or after the generated sheet.
    ...(statusDefaults.length ? [`${indent}:where(${scope}) {`, ...declarations(statusDefaults, mode, indent), `${indent}}`] : []),
  ];
}

function brandCss(build: Assembly, className: string) {
  const scopes = [`.${className}`, `[data-elea-theme="${className.replace(/^elea-/, "")}"]`];
  const selector = scopes.join(", ");
  const darkScope = (root: string) => scopes.flatMap((scope) => [`${root}${scope}`, `${root} ${scope}`]).join(", ");
  // Match the legacy root and theme specificity.
  const local = scopes.flatMap(scope => [
    `${scope}${localAppearanceSelector}:is(:root, *)`, `${localAppearanceSelector} ${scope}:is(:root, *)`,
  ]).join(", ");
  return [
    ...brandRules(build, selector, "light"), "",
    "@media (prefers-color-scheme: dark) {",
    ...brandRules(build, darkScope(':root:not([data-theme="light"])'), "dark", "  "), "}", "",
    ...brandRules(build, darkScope(':root[data-theme="dark"]'), "dark"), "",
    "@supports (color: light-dark(white, black)) {", ...brandRules(build, local, "local", "  "), "}", "",
  ].join("\n");
}

/** Generate scoped CSS, colour roles and their tone scales. */
export function makeBrandTheme({ edition, controls, seed, corner, shape, buttonRadiusScale = "uniform", typeface, rhythm, font, accent, palette, radius }: BrandTheme, className = "elea-brand") {
  assertBrandTheme({ seed, corner, typeface, rhythm, font, accent }, className);
  assertEditionAndPalette(edition, palette);
  const length = parseRadius(radius);
  const radii = cornerRadii(corner, length);
  const shapes = themeShapes(shape, corner, Boolean(length));
  const accentSeed = accent ?? (edition && editions[edition].accent);
  const primary = referenceShade(palette?.primary) ?? seedScale(seed);
  const secondary = referenceShade(palette?.secondary) ?? (accentSeed === undefined ? undefined : seedScale(accentSeed));
  // The public secondary ramp historically spans 50–900.
  const palettes = { primary: [...primary], secondary: secondary ? secondary.slice(0, -1) : [] };
  const tokens = [...brandTokens({ palettes, palette, radii, shapes, corner, buttonRadiusScale, font, typeface, rhythm }),
    ...grayNeutralTokens(palette?.neutral)];
  const surface = palette?.neutral === undefined ? edition && surfaces[edition] : neutralSurfaces(palette.neutral);
  const build: Assembly = {
    palette, backgrounds: surface || surfaces.Precision, semantic: [], statusDefaults: [], roles: {}, roleScales: { primary },
    // Keep historical link and info tones with the seed at 500.
    linkSteps: palette?.primary ? [700, 300] : [600, 200],
    tokens,
  };
  const hoverSteps: [ColorStep, ColorStep] = palette?.primary ? [800, 200] : [700, 100];
  build.semantic.push(
    inkPair(build, "color.text.link", "primary", ...build.linkSteps), inkPair(build, "color.text.link-hover", "primary", ...hoverSteps),
    inkPair(build, "color.focus", "primary", 600, 300, 3),
  );
  if (surface) build.semantic.push(...surfaceSemantic(surface, palette?.neutral));
  build.tokens.push(...controlTokens(controls, edition));
  if (secondary) {
    build.roleScales.secondary = secondary;
    build.semantic.push(
      inkPair(build, "color.text.accent", "secondary", 700, 300), inkPair(build, "color.border.accent", "secondary", 600, 400, 3),
    );
  }
  emitRampActions(build);
  emitOtherRoles(build, edition);
  // The aliases remain available when a local appearance is introduced inside this brand.
  for (const [path, day, night] of [...build.semantic, ...build.statusDefaults]) {
    build.tokens.push(`  ${brandAppearanceVariable(path, "light")}: ${day};`,
      `  ${brandAppearanceVariable(path, "dark")}: ${night};`);
  }
  const colours = primary.map(swatch => swatch.value);
  return { css: brandCss(build, className), colours, palettes, roles: build.roles, roleScales: build.roleScales };
}
