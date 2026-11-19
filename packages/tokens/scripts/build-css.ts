import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { darkTokens, toStylesheet, toTailwindTheme, tokens } from "../src/index.js";

// Emits the runtime stylesheet and the Tailwind theme next to the compiled package
const dist = join(dirname(dirname(fileURLToPath(import.meta.url))), "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "elea.css"), toStylesheet(tokens, { dark: darkTokens }));
writeFileSync(join(dist, "theme.css"), toTailwindTheme(tokens));
console.log(`tokens: ${tokens.length} light, ${darkTokens.length} dark overrides`);
