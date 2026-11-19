import type { FlatToken } from "./dtcg.js";

/** The CSS custom property of a token path: `color.text.default` becomes `--elea-color-text-default`. */
export function cssVariableName(path: string, prefix = "elea"): string {
  return `--${prefix}-${path.replaceAll(".", "-")}`;
}

/** The CSS text of a token value. */
export function cssValue(token: FlatToken): string {
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
    parts.push(`@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${dark}\n  }\n}`);
    parts.push(`:root[data-theme="dark"] {\n${cssDeclarations(options.dark, prefix)}\n}`);
  }
  return `${parts.join("\n\n")}\n`;
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
};

/** The Tailwind v4 `@theme` variable of a token, or null when the group has no Tailwind namespace. */
export function tailwindVariableName(path: string, prefix = "elea"): string | null {
  const group = Object.keys(TAILWIND_NAMESPACES)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => path === candidate || path.startsWith(`${candidate}.`));
  if (!group) return null;
  const rest = path.slice(group.length + 1).replaceAll(".", "-");
  return `--${TAILWIND_NAMESPACES[group]}-${prefix}${rest ? `-${rest}` : ""}`;
}

/**
 * A Tailwind v4 `@theme` block whose values point at the runtime variables, so utilities
 * such as `text-elea-text-muted` or `rounded-elea-lg` follow the active theme.
 */
export function toTailwindTheme(tokens: readonly FlatToken[], prefix = "elea"): string {
  const lines = tokens
    .map((token) => {
      const name = tailwindVariableName(token.path, prefix);
      return name ? `  ${name}: var(${cssVariableName(token.path, prefix)});` : null;
    })
    .filter((line): line is string => line !== null);
  return `@theme {\n${lines.join("\n")}\n}\n`;
}
