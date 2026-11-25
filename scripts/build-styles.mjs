import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LAYERS, bundle, layered } from "./css.mjs";

// Ships a package's stylesheet in the components layer (styles.css), and a bundle that imports
// the sheets it depends on before it (bundle.css), so that a host writes one import
const [source, target, ...dependencies] = process.argv.slice(2);
if (!source || !target) {
  console.error("usage: build-styles.mjs <source> <target directory> [dependency stylesheet...]");
  process.exit(1);
}
mkdirSync(target, { recursive: true });
writeFileSync(join(target, "styles.css"), `${LAYERS}\n${layered("components", readFileSync(source, "utf8"))}`);
writeFileSync(join(target, "bundle.css"), bundle([...dependencies, "./styles.css"]));
