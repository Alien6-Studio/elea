import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { editions, makeBrandTheme } from "../src/brand.js";
import { LAYER_ORDER } from "../src/css.js";
import { darkTokens, inLayer, toShadcnAliases, toShadcnPreset, toStylesheet, toTailwindPreset, toTailwindTheme, tokens } from "../src/index.js";

// Emits the runtime stylesheet and the Tailwind theme next to the compiled package
const dist = join(dirname(dirname(fileURLToPath(import.meta.url))), "dist");
mkdirSync(dist, { recursive: true });
cpSync(new URL("../fonts/", import.meta.url), join(dist, "fonts"), { recursive: true });
const runtimeTokens = toStylesheet(tokens, { dark: darkTokens, localAppearance: true });
writeFileSync(join(dist, "elea.css"), [
  LAYER_ORDER,
  '@import "./fonts/elea-sans.css";',
  `@layer elea.tokens {\n${runtimeTokens}}\n`,
].join("\n"));
writeFileSync(join(dist, "theme.css"), toTailwindTheme(tokens));
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
