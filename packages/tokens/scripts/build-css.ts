import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { editions, makeBrandTheme } from "../src/brand.js";
import { brandAppearanceVariable, cssVariableName, LAYER_ORDER } from "../src/css.js";
import { colorFamilies, defaultTertiaryFamily, surfaceFamilies } from "../src/palette.js";
import { statusFallback, statusRoles } from "../src/status.js";
import { darkTokens, inLayer, toShadcnAliases, toShadcnPreset, toStylesheet, toTailwindPreset, toTailwindTheme, tokens } from "../src/index.js";
import light from "../tokens/elea.tokens.json" with { type: "json" };
import dark from "../tokens/elea.dark.tokens.json" with { type: "json" };

// Emits the runtime stylesheet and the Tailwind theme next to the compiled package
const dist = join(dirname(dirname(fileURLToPath(import.meta.url))), "dist");
mkdirSync(dist, { recursive: true });
cpSync(new URL("../fonts/", import.meta.url), join(dist, "fonts"), { recursive: true });
// Keep action roles live in CSS. Non-CSS consumers receive the same DTCG aliases as resolved colours.
function actionAliases(set: typeof tokens, actions: Record<string, { $value: string }>, isDark: boolean) {
  const values = set.map(token => {
    // Keep duration overrides on a nested host live through the fallback at the consuming element.
    if (token.path.startsWith("motion.intent.")) return { ...token, value: "initial" };
    if (statusRoles.some(role => token.path === `color.${role}`)) {
      const source = brandAppearanceVariable(token.path, isDark ? "dark" : "light");
      return { ...token, value: `var(${source}, ${token.value})` };
    }
    if (!token.path.startsWith("color.action.")) return token;
    const name = token.path.slice("color.action.".length);
    const value = actions[name]!.$value;
    if (statusFallback(token.path)) return { ...token, value: "initial" };
    if (value.startsWith("{")) return { ...token, value: `var(${cssVariableName(value.slice(1, -1))})` };
    const swatch = name.startsWith("tertiary") && colorFamilies[defaultTertiaryFamily].find(shade => shade.value === value);
    return swatch ? { ...token, value: `var(--elea-palette-${defaultTertiaryFamily.toLowerCase()}-${swatch.step}, ${value})` } : token;
  });
  values.push({ path: "_status-edge", type: "color", value: isDark ? "#ffffff" : "#000000" });
  return values;
}
const runtimeTokens = toStylesheet(actionAliases(tokens, light.color.action, false), {
  dark: actionAliases(darkTokens, dark.color.action, true), localAppearance: true,
});
const density = readFileSync(new URL("./density.css", import.meta.url), "utf8");
writeFileSync(join(dist, "elea.css"), [
  LAYER_ORDER,
  '@import "./fonts/elea-sans.css";',
  `@layer elea.tokens {\n${runtimeTokens}${density}}\n`,
].join("\n"));
writeFileSync(join(dist, "theme.css"), toTailwindTheme(tokens));
const referenceColors = Object.entries(surfaceFamilies).flatMap(([name, shades]) =>
  shades.map(({ step, value }) => ({ path: `palette.${name.toLowerCase()}.${step}`, type: "color", value }))
);
writeFileSync(join(dist, "palette.css"), toStylesheet(referenceColors, { layer: "elea.tokens" }));
const editionStyles = Object.entries(editions).map(([name, theme]) =>
  makeBrandTheme(theme, `elea-${name.toLowerCase()}`).css
);
writeFileSync(join(dist, "editions.css"), inLayer("elea.tokens", editionStyles.join("\n")));
// The shadcn/ui bridge: aliases for Tailwind v4 projects, covering the root and the prebuilt editions
const scopes = [":root", "[data-theme]", "[data-elea-theme]", "[data-elea-appearance]", ...Object.keys(editions).map((name) => `.elea-${name.toLowerCase()}`)];
writeFileSync(join(dist, "shadcn.css"), toShadcnAliases(scopes.join(", ")));
// The Tailwind v3 presets as static modules, so a config loads them without resolving the token sources
const presets = { eleaPreset: toTailwindPreset(tokens), shadcnPreset: toShadcnPreset() };
const constants = Object.entries(presets).map(([name, preset]) => `export const ${name} = ${JSON.stringify(preset, null, 2)};`);
writeFileSync(join(dist, "tailwind.js"), `${constants.join("\n")}\nexport default eleaPreset;\n`);
writeFileSync(join(dist, "tailwind.d.ts"), [
  "export interface TailwindPreset {",
  "  theme: { extend: Record<string, Record<string, string | Record<string, string>>> };",
  "}",
  ...Object.keys(presets).map((name) => `export declare const ${name}: TailwindPreset;`),
  "export default eleaPreset;", "",
].join("\n"));
console.log(`tokens: ${tokens.length} light, ${darkTokens.length} dark overrides`);
