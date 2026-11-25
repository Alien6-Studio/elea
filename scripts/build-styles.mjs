import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { LAYERS, bundle, layered } from "./css.mjs";

// Ships a package's stylesheet in the components layer (styles.css), and a bundle that imports
// the sheets it depends on before it (bundle.css), so that a host writes one import
const { positionals: [source, target, ...dependencies], values: { sheet = [] } } = parseArgs({
  allowPositionals: true, options: { sheet: { type: "string", multiple: true } },
});
if (!source || !target) {
  console.error("usage: build-styles.mjs <source> <target directory> [dependency stylesheet...]");
  process.exit(1);
}
mkdirSync(target, { recursive: true });
const entries = [[source, "styles.css"], ...sheet.map(path => [path, basename(path)])];
for (const [path, name] of entries) {
  writeFileSync(join(target, name), `${LAYERS}\n${layered("components", readFileSync(path, "utf8"))}`);
}
writeFileSync(join(target, "bundle.css"), bundle([...dependencies, ...entries.map(([, name]) => `./${name}`)]));
