import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Copies one file into the build output; tsc only emits TypeScript
const [source, target] = process.argv.slice(2);
if (!source || !target) {
  console.error("usage: copy-file.mjs <source> <target>");
  process.exit(1);
}
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
