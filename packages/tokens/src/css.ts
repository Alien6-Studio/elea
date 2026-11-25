import type { FlatToken } from "./dtcg.js";
import { statusFallback } from "./status.js";

/** The CSS custom property of a token path: `color.text.default` becomes `--elea-color-text-default`. */
export function cssVariableName(path: string, prefix = "elea"): string {
  return `--${prefix}-${path.replaceAll(".", "-")}`;
}

export function cssReference(path: string, prefix = "elea"): string {
  const fallback = statusFallback(path, prefix);
  return `var(${cssVariableName(path, prefix)}${fallback ? ", " + fallback : ""})`;
}

/** The CSS text of a token value. */
export function cssValue(token: FlatToken): string {
  if (token.type === "cubicBezier" && Array.isArray(token.value)) return `cubic-bezier(${token.value.join(", ")})`;
  if (Array.isArray(token.value)) {
    return token.value.map((family) => (/[\s,]/.test(String(family)) ? `"${String(family)}"` : String(family))).join(", ");
  }
  return String(token.value);
}

/** `name: value;` declarations, one per line, indented. */
export function cssDeclarations(tokens: readonly FlatToken[], prefix = "elea", indent = "  "): string {
  return tokens.map((token) => `${indent}${cssVariableName(token.path, prefix)}: ${cssValue(token)};`).join("\n");
}

export interface StylesheetOptions {
  prefix?: string;
  /** Tokens that change in dark mode; applied under `prefers-color-scheme` and `[data-theme="dark"]`. */
  dark?: readonly FlatToken[];
  /** A cascade layer to put the rules in, so that any rule outside it overrides a token; `elea.tokens` in `elea.css`. */
  layer?: string;
  /** Emit independent light, dark and auto scopes for the supplied color pairs. */
  localAppearance?: boolean;
}

/** The order of the layers every Elea stylesheet declares; a rule outside them wins over all of them. */
export const LAYER_ORDER = "@layer elea.tokens, elea.base, elea.components;";

/** `css` inside the cascade layer `layer`, after the order of the Elea layers. */
export function inLayer(layer: string, css: string): string {
  return `${LAYER_ORDER}\n@layer ${layer} {\n${css.trimEnd()}\n}\n`;
}

/** A local scope is independent of the document's data-theme. Invalid values inherit. */
export const localAppearanceSelector = ':is([data-elea-appearance="light"], [data-elea-appearance="dark"], [data-elea-appearance="auto"])';

export function brandAppearanceVariable(path: string, mode: "light" | "dark", prefix = "elea"): string {
  return cssVariableName(`brand-${mode}.${path}`, prefix);
}

function localAppearance(light: readonly FlatToken[], dark: readonly FlatToken[], prefix: string): string {
  const lightByPath = new Map(light.map(token => [token.path, token]));
  const unassigned: string[] = [];
  function modeValue(mode: "light" | "dark", token: FlatToken): string {
    const name = brandAppearanceVariable(token.path, mode, prefix);
    if (token.value !== "initial") {
      const fallback = cssValue(token);
      return fallback.startsWith(`var(${name},`) ? fallback : `var(${name}, ${fallback})`;
    }
    // An unassigned role must invalidate the whole pair so the component can use its local fallback.
    unassigned.push(`    ${name}: initial;`);
    return `var(${name})`;
  }
  const declarations = dark.flatMap(token => {
    const base = lightByPath.get(token.path);
    if (token.type !== "color" || base?.type !== "color") return [];
    const day = modeValue("light", base);
    const night = modeValue("dark", token);
    return [`    ${cssVariableName(token.path, prefix)}: light-dark(${day}, ${night});`];
  });
  return [
    "@supports (color: light-dark(white, black)) {",
    ...(unassigned.length ? ["  :where(:root) {", ...unassigned, "  }"] : []),
    ...["light", "dark", "auto"].map(mode => `  [data-elea-appearance="${mode}"] { color-scheme: ${mode === "auto" ? "light dark" : mode}; }`),
    `  ${localAppearanceSelector}:is(:root, *) {`, ...declarations, "  }", "}",
  ].join("\n");
}

/**
 * The runtime stylesheet: every token on `:root`, the dark overrides under the system
 * preference (unless the page forces light) and under an explicit `data-theme="dark"`.
 */
export function toStylesheet(tokens: readonly FlatToken[], options: StylesheetOptions = {}): string {
  const prefix = options.prefix ?? "elea";
  const parts = [`:root {\n${cssDeclarations(tokens, prefix)}\n}`];
  if (options.dark && options.dark.length > 0) {
    const dark = cssDeclarations(options.dark, prefix, "    ");
    parts.push(
      `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${dark}\n  }\n}`,
      `:root[data-theme="dark"] {\n${cssDeclarations(options.dark, prefix)}\n}`,
    );
    if (options.localAppearance) parts.push(localAppearance(tokens, options.dark, prefix));
  }
  const css = `${parts.join("\n\n")}\n`;
  return options.layer ? inLayer(options.layer, css) : css;
}

/** Tailwind v4 theme namespaces fed by Elea token groups. */
const TAILWIND_NAMESPACES: Record<string, string> = {
  color: "color",
  "font.family": "font",
  "font.size": "text",
  "font.weight": "font-weight",
  "font.leading": "leading",
  space: "spacing",
  radius: "radius",
  shadow: "shadow",
  "motion.easing": "ease",
};

/** The Tailwind v4 `@theme` variable of a token, or null when the group has no Tailwind namespace. */
export function tailwindVariableName(path: string, prefix = "elea"): string | null {
  const group = Object.keys(TAILWIND_NAMESPACES)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => path === candidate || path.startsWith(`${candidate}.`));
  if (!group) return null;
  const rest = path.slice(group.length + 1).replaceAll(".", "-");
  const suffix = rest ? `-${rest}` : "";
  return `--${TAILWIND_NAMESPACES[group]}-${prefix}${suffix}`;
}

/**
 * A Tailwind v4 theme whose utilities resolve Elea variables on the styled element,
 * so they follow overrides inherited from a host's theme scope.
 */
export function toTailwindTheme(tokens: readonly FlatToken[], prefix = "elea"): string {
  const lines = tokens
    .map((token) => {
      const name = tailwindVariableName(token.path, prefix);
      return name ? `  ${name}: ${cssReference(token.path, prefix)};` : null;
    })
    .filter((line): line is string => line !== null);
  return `@theme inline {\n${lines.join("\n")}\n}\n`;
}

/** Tailwind v3 theme keys of the namespaces above. */
const TAILWIND_V3_KEYS: Record<string, string> = {
  color: "colors",
  font: "fontFamily",
  text: "fontSize",
  "font-weight": "fontWeight",
  leading: "lineHeight",
  spacing: "spacing",
  radius: "borderRadius",
  shadow: "boxShadow",
  ease: "transitionTimingFunction",
};

export interface TailwindPreset {
  theme: { extend: Record<string, Record<string, string | Record<string, string>>> };
}

/** A Tailwind v3 colour on a runtime variable that still takes opacity modifiers such as `/50`. */
function alphaColour(path: string, prefix: string): string {
  return `color-mix(in srgb, ${cssReference(path, prefix)} calc(<alpha-value> * 100%), transparent)`;
}

/**
 * A Tailwind v3 preset with the utility names of the v4 theme (`bg-elea-surface-default`,
 * `rounded-elea-md`, `p-elea-4`), every value resolving the Elea variable at runtime.
 */
export function toTailwindPreset(tokens: readonly FlatToken[], prefix = "elea"): TailwindPreset {
  const extend: TailwindPreset["theme"]["extend"] = {};
  for (const token of tokens) {
    const name = tailwindVariableName(token.path, prefix);
    if (!name) continue;
    const namespace = Object.keys(TAILWIND_V3_KEYS).sort((a, b) => b.length - a.length).find((candidate) => name.startsWith(`--${candidate}-${prefix}`))!;
    const key = name.slice(namespace.length + 3);
    const group = (extend[TAILWIND_V3_KEYS[namespace]!] ??= {});
    group[key] = namespace === "color" ? alphaColour(token.path, prefix) : `var(${cssVariableName(token.path, prefix)})`;
  }
  return { theme: { extend } };
}

/** The shadcn/ui variables and the Elea token each one follows. */
const SHADCN: Record<string, string> = {
  background: "color.surface.default",
  foreground: "color.text.default",
  card: "color.surface.default",
  "card-foreground": "color.text.default",
  popover: "color.surface.default",
  "popover-foreground": "color.text.default",
  primary: "color.action.primary",
  "primary-foreground": "color.action.primary-text",
  secondary: "color.action.secondary",
  "secondary-foreground": "color.action.secondary-text",
  muted: "color.surface.muted",
  "muted-foreground": "color.text.muted",
  accent: "color.surface.muted",
  "accent-foreground": "color.text.default",
  destructive: "color.action.danger",
  "destructive-foreground": "color.action.danger-text",
  border: "color.border.default",
  input: "color.border.strong",
  ring: "color.focus",
  radius: "radius.lg",
};

/**
 * The shadcn/ui variables (`--background`, `--primary`, `--ring`, `--radius`…) as aliases of Elea
 * tokens, holding full colours as Tailwind v4 projects expect. A variable resolves where it is
 * declared, so give every scope that restyles Elea (a brand class) in `selector`.
 */
export function toShadcnAliases(selector = ":root, [data-theme], [data-elea-theme], [data-elea-appearance]", prefix = "elea"): string {
  const lines = Object.entries(SHADCN).map(([name, path]) => `  --${name}: ${cssReference(path, prefix)};`);
  return `${selector} {\n${lines.join("\n")}\n}\n`;
}

/**
 * A Tailwind v3 preset for shadcn/ui components: `bg-primary`, `text-muted-foreground`,
 * `border-input` and `rounded-md` read Elea tokens directly, replacing the `hsl(var(--x))` palette.
 */
export function toShadcnPreset(prefix = "elea"): TailwindPreset {
  const colors: Record<string, Record<string, string>> = {};
  for (const [name, path] of Object.entries(SHADCN)) {
    if (!path.startsWith("color.")) continue;
    const [base, part] = name.endsWith("-foreground") ? [name.slice(0, -11), "foreground"] : [name, "DEFAULT"];
    const shades = (colors[base] ??= {});
    shades[part] = alphaColour(path, prefix);
  }
  const borderRadius = Object.fromEntries(["sm", "md", "lg", "xl"].map((size) => {
    const variable = cssVariableName(`radius.${size}`, prefix);
    return [size, `var(${variable})`];
  }));
  return { theme: { extend: { colors, borderRadius } } };
}
