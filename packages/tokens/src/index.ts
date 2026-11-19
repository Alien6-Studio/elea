import base from "../tokens/elea.tokens.json" with { type: "json" };
import dark from "../tokens/elea.dark.tokens.json" with { type: "json" };
import { flattenTokens, mergeTokens, type TokenGroup } from "./dtcg.js";

export { cssDeclarations, cssValue, cssVariableName, tailwindVariableName, toStylesheet, toTailwindTheme, type StylesheetOptions } from "./css.js";
export { flattenTokens, mergeTokens, resolveReference, type FlatToken, type TokenGroup, type TokenLeaf } from "./dtcg.js";

/** The DTCG source of the light theme. */
export const lightTokens = base as unknown as TokenGroup;
/** The DTCG overrides of the dark theme; references resolve against the light tree. */
export const darkTokenOverrides = dark as unknown as TokenGroup;

/** Every light token, flat, references resolved. */
export const tokens = flattenTokens(lightTokens);
/** The dark overrides, flat, references resolved against the merged tree. */
export const darkTokens = flattenTokens(darkTokenOverrides, mergeTokens(lightTokens, darkTokenOverrides));

/** The CSS custom property of a token path, e.g. `cssVar("color.text.default")`. */
export function cssVar(path: string): string {
  return `var(--elea-${path.replaceAll(".", "-")})`;
}
