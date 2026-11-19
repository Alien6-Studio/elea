import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// Size budget of every package, gzip bytes of the compiled JavaScript and CSS.
// Raising a budget is a deliberate decision made in the same change as the growth.
// content: 24 KB since the Markdown and HTML serializers joined the model.
// content-editor: 56 KB since rich paste, block selection, keyboard flow, the slash menu,
// lists as one rich text field, the code editor, document history, the block menu and the
// classic mode with its document bar joined the editor.
// ui: 16 KB since Select, a listbox-backed select and checklist, joined the primitives.
const BUDGETS = { tokens: 6_000, content: 24_000, "content-viewer": 12_000, media: 8_000, "content-editor": 56_000, ui: 16_000 };

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(js|css)$/.test(name) && !name.endsWith(".map") ? [path] : [];
  });
}

let failed = false;
for (const [pkg, budget] of Object.entries(BUDGETS)) {
  const dist = join("packages", pkg, "dist");
  const size = files(dist).reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0);
  const status = size <= budget ? "ok" : "OVER";
  if (size > budget) failed = true;
  console.log(`${status.padEnd(4)} ${pkg.padEnd(7)} ${String(size).padStart(7)} B gzip (budget ${budget})`);
}
if (failed) {
  console.error("A package exceeds its size budget.");
  process.exit(1);
}
