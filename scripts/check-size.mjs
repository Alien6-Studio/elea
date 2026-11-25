import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// Size budget of every package, gzip bytes of the compiled JavaScript and CSS.
// Raising a budget is a deliberate decision made in the same change as the growth.
// tokens: 14.95 KB including the optional brand generator with a free font, accent and radius, three
// prebuilt CSS editions with paired palettes and control proportions and depth, motion tokens, the Tailwind v3 presets, the shadcn/ui aliases and the
// cascade layer every sheet states, with scoped appearance color pairs and portal-compatible brand classes.
// content: 28.1 KB including multiline Markdown lists, checklists with the state of their tasks, media links, the shared image URL policy
// and a Markdown inline scanner that escapes on export and stays linear on hostile input.
// content-viewer: 12.75 KB including checklists, the core entry, the viewer without a bundled sanitizer and the
// one-import bundle beside the layered sheet.
// content-editor: 75.5 KB including checklists that tick, the animated mode picker and add menu, direct toolbar insertion,
// inline media editing, upload status reported by the host and sanitized clipboard blocks trimmed
// without backtracking, in small modules that each compress alone, the one-import bundle and the
// theme its open body surfaces track from the editor. It also holds the parts loaded on demand and what
// loads them: the package is larger for it, what a host downloads first is smaller, and that first
// load has its own budget where a bundler measures it, in check-package.
// ui is budgeted per component instead: each one answers for its own script and stylesheet, so
// the package can grow by components without any of them growing unnoticed. This includes scoped
// control tokens for buttons, fields and choices, plus the optional Tabs presentations.
const BUDGETS = { tokens: 14_950, content: 28_100, "content-viewer": 12_750, media: 8_000, "content-editor": 75_500 };

// Gzip bytes of dist/<Component>.js plus dist/css/<component>.css. A sheet without a script
// (motion, button-effects) or a script without a sheet (cx, index, scope) answers alone. A sheet
// holds alone: it states the layer order and carries the shared keyframes it names.
const UI_BUDGETS = {
  accordion: 2_500, alert: 1_500, avatar: 1_500, badge: 1_000, button: 3_300, "button-effects": 1_500, card: 1_500, checkbox: 1_750, "confirm-field": 1_000, cx: 250,
  dialog: 3_700, field: 2_000, footer: 1_250, index: 600, menu: 2_700, motion: 1_250, pagination: 2_000, popover: 4_100, progress: 1_500,
  "radio-group": 1_750, select: 4_875, separator: 750, sheet: 1_750, skeleton: 2_100, scope: 900, "skeleton-region": 750, slider: 2_000, table: 2_250, tabs: 3_100, toast: 3_250, tooltip: 2_250,
};

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
const gzip = (path) => (existsSync(path) ? gzipSync(readFileSync(path)).length : 0);
const kebab = (name) => name.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const ui = join("packages", "ui", "dist");
const parts = new Map();
for (const name of readdirSync(ui)) if (name.endsWith(".js")) parts.set(kebab(name.slice(0, -3)), [join(ui, name)]);
for (const name of readdirSync(join(ui, "css"))) parts.set(name.slice(0, -4), [...(parts.get(name.slice(0, -4)) ?? []), join(ui, "css", name)]);
let total = 0;
for (const [part, paths] of [...parts].sort()) {
  const size = paths.reduce((sum, path) => sum + gzip(path), 0);
  const budget = UI_BUDGETS[part];
  total += size;
  const state = size <= budget ? "ok" : "OVER";
  const status = budget === undefined ? "NONE" : state;
  if (status !== "ok") failed = true;
  console.log(`${status.padEnd(4)} ui/${part.padEnd(14)} ${String(size).padStart(6)} B gzip (budget ${budget ?? "missing"})`);
}
console.log(`     ui with every component ${total} B gzip`);
if (failed) {
  console.error("A package or a component exceeds its size budget, or has none.");
  process.exit(1);
}
