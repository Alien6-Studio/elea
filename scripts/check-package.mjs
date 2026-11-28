import { copyFileSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { createRequire } from "node:module";
import { LAYERS, animationsIn, customPropertiesIn, keyframesIn, layerOrder, unlayered, withoutComments } from "./css.mjs";

// Installs the packed archives in clean consumers outside the repository. It imports every
// package, checks that all declared exports ship, and verifies the published types and rendering.
const { values } = parseArgs({ options: { "pack-destination": { type: "string" } } });
const destination = values["pack-destination"];
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const { devDependencies } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const publishable = readdirSync(join(root, "packages"))
  .map((dir) => ({ dir, manifest: JSON.parse(readFileSync(join(root, "packages", dir, "package.json"), "utf8")) }))
  .filter(({ manifest }) => !manifest.private);
const temporary = mkdtempSync(join(tmpdir(), "elea-consumer-"));
const userConfig = join(temporary, "empty.npmrc");
writeFileSync(userConfig, "registry=https://registry.npmjs.org\n");
const env = { ...process.env, npm_config_userconfig: userConfig };
delete env.NODE_AUTH_TOKEN;
delete env.NPM_TOKEN;

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, { cwd, env, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
  if (result.error) throw result.error;
  const detail = capture ? `: ${result.stderr}` : "";
  if (result.status !== 0) throw new Error(`${command} ${args.slice(0, 2).join(" ")} failed (${result.status})${detail}`);
  return result.stdout;
}

const install = ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--registry=https://registry.npmjs.org"];

/** Every `exports` entry of a package must point at a file that the archive shipped. */
function checkExports(name, consumer) {
  const dir = join(consumer, "node_modules", name);
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const targets = [];
  const collect = (value) => {
    if (typeof value === "string") targets.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(manifest.exports);
  // Bundlers and runtimes that know no `import` condition resolve through `default`
  for (const [entry, value] of Object.entries(manifest.exports)) {
    if (typeof value === "object" && !value.default) throw new Error(`${name}: export ${entry} has no default condition`);
  }
  collect(manifest.main);
  collect(manifest.types);
  for (const target of targets) {
    if (!existsSync(join(dir, target))) throw new Error(`${name}: declared export ${target} is not in the archive`);
  }
  if (!existsSync(join(dir, "LICENSE"))) throw new Error(`${name}: the archive ships without its LICENSE`);
  const sources = run("find", [dir, "-name", "*.ts", "-not", "-name", "*.d.ts"], consumer, true).trim();
  if (sources) throw new Error(`${name} ships TypeScript sources:\n${sources}`);
  return targets.length;
}

// Aliases a host declares itself, outside the layers: Tailwind reads `@theme` at build time, and the
// shadcn bridge has to win over the variables a shadcn project already sets
const UNLAYERED = new Set(["@alien6-studio/elea-tokens/theme.css", "@alien6-studio/elea-tokens/shadcn.css"]);

/** `file` with the sheets it imports in their place, resolved as a bundler resolves them. */
function inlineImports(file) {
  const resolve = createRequire(file).resolve;
  return readFileSync(file, "utf8").replaceAll(/@import "([^"]+)";/g, (_, sheet) => inlineImports(resolve(sheet)));
}

/**
 * Every stylesheet a package exports must hold alone: its rules sit in the Elea layers, each animation
 * it runs is defined in it, and each custom property it reads without a fallback is one it declares
 * or a token. A sheet that imports others is a bundle: it must hold without anything else.
 */
function checkStyles(consumer) {
  const scope = join(consumer, "node_modules", "@alien6-studio");
  const tokens = customPropertiesIn(readFileSync(join(scope, "elea-tokens", "dist", "elea.css"), "utf8")).declared;
  let checked = 0;
  for (const { manifest } of publishable) {
    const dir = join(consumer, "node_modules", manifest.name);
    for (const [entry, target] of Object.entries(manifest.exports)) {
      if (typeof target !== "string" || !target.endsWith(".css")) continue;
      checkSheet(`${manifest.name}${entry.slice(1)}`, join(dir, target), tokens);
      checked += 1;
    }
  }
  return checked;
}

function checkSheet(name, file, tokens) {
  const source = readFileSync(file, "utf8");
  const css = withoutComments(inlineImports(file));
  if (!UNLAYERED.has(name)) {
    if (!source.includes(LAYERS)) throw new Error(`${name} does not state the order of the Elea layers`);
    const outside = unlayered(css);
    if (outside) throw new Error(`${name} has rules outside the Elea layers:\n${outside.slice(0, 200)}`);
  }
  const keyframes = keyframesIn(css);
  const missing = [...animationsIn(css)].filter((animation) => !keyframes.has(animation));
  if (missing.length > 0) throw new Error(`${name} runs keyframes it does not define: ${missing.join(", ")}`);
  const { declared, required } = customPropertiesIn(css);
  const known = source.includes("@import") ? declared : new Set([...declared, ...tokens]);
  const unknown = [...required].filter((property) => !known.has(property));
  if (unknown.length > 0) throw new Error(`${name} reads custom properties that nothing declares: ${unknown.join(", ")}`);
}

const TAILWIND = "4.3.5";
const TAILWIND_ORDER = "@layer theme, base, elea, components, utilities;";
const TAILWIND_IMPORTS = ['@import "tailwindcss";', '@import "@alien6-studio/elea-ui/bundle.css";'];

/**
 * A Tailwind v4 host, compiled by Tailwind itself. With the order line the README requires, `elea`
 * sits between `base` and `components` whichever import comes first. Without it the order is that of
 * the imports: an Elea sheet imported first lands under `base`, where Preflight resets every
 * component. That failure is checked too, so that the README stops requiring the line the day it lifts.
 */
function checkTailwindHost(consumer) {
  const compile = (name, lines) => {
    writeFileSync(join(consumer, `${name}.css`), `${lines.join("\n")}\n`);
    run(join(consumer, "node_modules", ".bin", "tailwindcss"), ["-i", `${name}.css`, "-o", `${name}.out.css`], consumer, true);
    return layerOrder(readFileSync(join(consumer, `${name}.out.css`), "utf8"));
  };
  const expected = layerOrder(TAILWIND_ORDER);
  for (const [name, imports] of [["tailwind-first", TAILWIND_IMPORTS], ["elea-first", TAILWIND_IMPORTS.toReversed()]]) {
    const order = compile(`ordered-${name}`, [TAILWIND_ORDER, ...imports]);
    if (order.join() !== expected.join()) throw new Error(`Tailwind host, ${name}, with the order line: layers are ${order.join(", ")}`);
  }
  const unordered = compile("unordered", TAILWIND_IMPORTS.toReversed());
  if (unordered.indexOf("elea") > unordered.indexOf("base")) throw new Error(`Tailwind host without the order line: elea no longer sits under base (${unordered.join(", ")}), update the README`);
  return unordered;
}

const VITE = "8.3.8";
// Includes the clipboard HTML parser, document length checks, the block and mark allow-lists and link editing.
// Preview, Markdown and crop controls load on demand.
const EDITOR_FIRST_LOAD = 63_900;

/**
 * Vite must emit the UI stylesheet and its fonts at the host's base URL. The editor's first load is
 * budgeted independently of the parts it loads on demand.
 */
const BUNDLER_SCRIPT = String.raw`
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { JSDOM } from "jsdom";
import { createElement, createRef } from "react";
import { renderToString } from "react-dom/server";
import { editions, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";
import { Button, Input } from "@alien6-studio/elea-ui";
import { build } from "vite";

const [limit] = process.argv.slice(2).map(Number);
const { output } = await build({
  logLevel: "error",
  configFile: false,
  base: "/portal/",
  build: { write: false, rollupOptions: { input: "entry.js", external: ["react", "react-dom", "react/jsx-runtime"], preserveEntrySignatures: "strict" } },
});
const css = output.find(file => file.fileName.endsWith(".css")).source;
for (const name of ["ELEASans-Variable.woff2", "ELEASans-Italic-Variable.woff2"]) {
  const original = readFileSync(new URL(import.meta.resolve("@alien6-studio/elea-tokens/fonts/" + name)));
  const font = output.find(file => file.fileName.endsWith(".woff2") && original.equals(file.source));
  assert.ok(font && css.includes("/portal/" + font.fileName), "the deployed UI stylesheet must resolve " + name);
}
const controls = renderToString(createElement("div", null, createElement(Input), createElement(Button, null, "Save")));
const brand = makeBrandTheme({ ...editions.Precision, font: "Georgia, serif" }, "journal");
const { window } = new JSDOM("<style>" + css + brand.css + "</style><body style='font-family: serif'>" +
  controls + '<section data-elea-theme="journal">' + controls + "</section></body>");
const family = node => window.getComputedStyle(node).fontFamily;
assert.equal(family(window.document.body), "serif");
for (const tag of ["input", "button"]) {
  const [standard, branded] = window.document.querySelectorAll(tag);
  assert.match(family(standard), /^["']?ELEA Sans["']?,/);
  assert.equal(family(branded), "Georgia, serif");
}
const chunks = new Map(output.filter((file) => file.type === "chunk").map((chunk) => [chunk.fileName, chunk]));
function staticImports(entry) {
  const files = new Set([entry.fileName]);
  for (const file of files) {
    for (const imported of chunks.get(file).imports) {
      if (chunks.has(imported)) files.add(imported);
    }
  }
  return files;
}
function chunkFor(module) {
  const chunk = [...chunks.values()].find(file => file.moduleIds.some(id => id.replaceAll("\\", "/").endsWith(module)));
  assert.ok(chunk, "the bundle holds " + module);
  return chunk;
}
const first = staticImports([...chunks.values()].find(chunk => chunk.isEntry));
const size = (names) => names.reduce((total, name) => total + gzipSync(chunks.get(name).code).length, 0);

const parts = {
  source: chunkFor("elea-content-editor/dist/MarkdownEditor.js"),
  preview: chunkFor("elea-content-editor/dist/EditorPreview.js"),
  cropper: chunkFor("elea-media/dist/ImageCropper.js"),
  formats: chunkFor("elea-media/dist/AdjustableCrop.js"),
};
assert.ok(!first.has(chunkFor("elea-media/dist/createCropFormats.js").fileName), "the crop format factory loads with the editor");
assert.ok(!staticImports(parts.cropper).has(parts.formats.fileName), "the base cropper loads the opt-in crop format controls");
const sizes = [];
for (const [part, holder] of Object.entries(parts)) {
  assert.ok(!first.has(holder.fileName), "the " + part + " part is downloaded with the editor instead of on demand");
  sizes.push(part + " " + size([holder.fileName]));
}
const total = size([...first]);
assert.ok(total <= limit, "the first load of the editor is " + total + " gzip bytes, over its budget of " + limit);
console.log("bundler host verified: UI fonts and brand override; first load of the editor " + total + " of " + limit + " gzip bytes; on demand: " + sizes.join(", "));
`;

const CONSUMER_SCRIPT = String.raw`
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToString } from "react-dom/server";
import { createDocument, defaultRegistry, documentToText, parseDocument, fr } from "@alien6-studio/elea-content";
import { tokens, lightTokens, darkTokenOverrides, toStylesheet, cssVar } from "@alien6-studio/elea-tokens";
import sourceLight from "@alien6-studio/elea-tokens/tokens/elea.tokens.json" with { type: "json" };
import sourceDark from "@alien6-studio/elea-tokens/tokens/elea.dark.tokens.json" with { type: "json" };
import exchangeLight from "@alien6-studio/elea-tokens/dtcg/2025.10/elea.tokens.json" with { type: "json" };
import exchangeDark from "@alien6-studio/elea-tokens/dtcg/2025.10/elea.dark.tokens.json" with { type: "json" };
import { colorFamilies } from "@alien6-studio/elea-tokens/palette";
import { editions, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";
import { ContentView, ContentExcerpt, createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { DropZone, cropRect } from "@alien6-studio/elea-media";
import { createLocalObserve } from "@alien6-studio/observe";
import { createBrowserCollector } from "@alien6-studio/observe/browser";
import { ibanFormat, paymentCardFormat, sirenFormat, siretFormat } from "@alien6-studio/elea-ui/formats";
import { Breadcrumb, Button, Calendar, CardNumberInput, Carousel, ColorPicker, Combobox, DateField, Dialog, Footer, Hero, IbanInput, Input, MultiSelect, Navbar, ResponsiveImage, SearchAutocomplete, SearchField, Sidebar, SirenInput, SiretInput, Stepper, Textarea, StepperPanel, StepperSkeleton } from "@alien6-studio/elea-ui";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
console.log("react", require("react/package.json").version);

// Core and tokens
const doc = parseDocument({ blocks: [{ type: "paragraph", data: { text: "<p>Hi <b>there</b> <img src=\"data:image/png;base64,AA\"></p>" } }, { type: "header", data: { text: "T", level: 2 } }] }, { registry: defaultRegistry });
assert.equal(documentToText(doc, defaultRegistry), "Hi there\n\nT");
assert.ok(tokens.length > 50 && toStylesheet(tokens).includes("--elea-color-text-default") && cssVar("space.4") === "var(--elea-space-4)");
assert.deepEqual(lightTokens, sourceLight);
assert.deepEqual(darkTokenOverrides, sourceDark);
assert.equal(sourceLight.space[3].$value, "0.75rem");
assert.equal(sourceLight.motion.duration.fast.$value, "100ms");
assert.equal(typeof sourceLight.shadow.md.$value, "string");
assert.equal(sourceDark.space, undefined);
for (const exchange of [exchangeLight, exchangeDark]) {
  assert.deepEqual(exchange.space[3].$value, { value: 0.75, unit: "rem" });
  assert.deepEqual(exchange.motion.duration.fast.$value, { value: 100, unit: "ms" });
  assert.equal(exchange.shadow.md.$value.length, 2);
}
assert.equal(exchangeLight.color.focus.$value, sourceLight.color.focus.$value);
assert.equal(exchangeDark.color.focus.$value, sourceDark.color.focus.$value);
const { qualifyTheme, compareThemeReports } = await import("@alien6-studio/elea-tokens/qualification");
const report = qualifyTheme(editions.Editorial);
assert.ok(report.checks.some(check => check.id === "primary.light.fill" && check.passed));
assert.deepEqual(compareThemeReports(report, report), []);
const typeSheet = readFileSync(require.resolve("@alien6-studio/elea-tokens/typography.css"), "utf8");
for (const role of ["display", "page", "section", "reading", "label", "data", "annotation"]) {
  assert.ok(typeSheet.includes('data-elea-type="' + role + '"'));
}
const baseSheet = readFileSync(require.resolve("@alien6-studio/elea-tokens/elea.css"), "utf8");
for (const role of ["primary", "secondary"]) {
  assert.ok(baseSheet.includes("--elea-color-action-" + role + ": var(--elea-color-" + role + "-500);"));
}
const paletteSheet = readFileSync(require.resolve("@alien6-studio/elea-tokens/palette.css"), "utf8");
for (const [family, swatches] of Object.entries(colorFamilies)) {
  for (const { step, value } of swatches) {
    assert.ok(paletteSheet.includes("--elea-palette-" + family.toLowerCase() + "-" + step + ": " + value + ";"));
  }
}

assert.ok(makeBrandTheme(editions.Editorial, "journal").css.startsWith('.journal, [data-elea-theme="journal"] {'));

// Viewer on the server: no hook, sanitized output
const sanitizer = createDefaultSanitizer({ links: { siteHostnames: ["members.example.org"] } });
const html = renderToString(React.createElement(ContentView, { data: doc, sanitizer, messages: fr }));
assert.ok(html.includes('<div class="elea-paragraph"><p>Hi <b>there</b> </p></div>'), html);
assert.ok(renderToString(React.createElement(ContentExcerpt, { data: doc })).includes("Hi there T"));

// Media on the server: the drop zone renders its input and label, the geometry needs no DOM
assert.ok(renderToString(React.createElement(DropZone, { label: "Add", onFiles: () => {} })).includes('type="file"'));
assert.equal(cropRect({ width: 200, height: 100 }, { width: 100, height: 100 }, { zoom: 1, rotation: 0, offset: { x: 0, y: 0 } }).width, 100);
const observed = { surface: "editor", component: "button", slot: "document.save", role: "button", state: "ready", variant: null };
const observedContext = { theme: null, appearance: null, density: null, experiment: null };
const observe = createLocalObserve({ purpose: "local-demo", catalog: { revision: "check-1", entries: [{ target: observed, context: observedContext, kinds: ["interaction.activated"] }] }, collectors: [] });
const activation = { schemaVersion: 1, kind: "interaction.activated", target: observed, context: observedContext, detail: { source: "application-command", modality: "keyboard" } };
assert.equal(observe.record(activation), false, "nothing is recorded before a grant");
observe.setGrant({ purpose: "local-demo", destination: "memory", kinds: ["interaction.activated"] });
assert.equal(observe.record(activation), true);
assert.equal(observe.snapshot().length, 1);
observe.dispose();
assert.equal(typeof createBrowserCollector, "function");

// UI primitives render on the server from the published entry point
const button = renderToString(React.createElement(Button, null, "Save"));
assert.ok(button.startsWith("<button") && button.includes("Save"), button);
const wizard = { steps: [{ id: "write", label: "Write" }, { id: "review", label: "Review" }], current: "write", onSelect() {} };
const stepper = renderToString(React.createElement(Stepper, { ...wizard, label: "Publication", linear: true }));
assert.ok(stepper.includes('aria-current="step"') && stepper.includes("Review"), stepper);
const panel = renderToString(React.createElement(StepperPanel, { ...wizard, previousLabel: "Back", nextLabel: "Continue" }));
assert.ok(panel.includes("Continue"), panel);
assert.ok(renderToString(React.createElement(StepperSkeleton, { steps: 2 })).includes('aria-hidden="true"'));
const calendar = renderToString(React.createElement(Calendar, { label: "Publication date", labels: { previousMonth: "Previous", nextMonth: "Next" }, locale: "en-GB", value: "2028-02-29", onChange() {} }));
assert.ok(calendar.includes('role="grid"') && calendar.includes("29 February 2028"), calendar);
const carousel = renderToString(React.createElement(Carousel, {
  label: "Editions", previousLabel: "Previous", nextLabel: "Next", items: ["First", "Second"],
  itemKey: value => value, renderItem: value => value,
}));
assert.ok(carousel.includes('aria-label="Editions"') && carousel.includes("First") && !carousel.includes("Second"), carousel);
const picker = renderToString(React.createElement(ColorPicker, { label: "Ink", hexLabel: "Ink hex", invalidMessage: "Enter six hex digits.", value: "#345678", onChange() {} }));
assert.ok(picker.includes('type="color"') && picker.includes("#345678") && picker.includes("Ink hex"), picker);
const collection = renderToString(React.createElement(Combobox, { label: "Collection", emptyMessage: "No matches", options: [{ value: "ice", label: "Glaciers" }], value: "ice", onChange() {} }));
assert.ok(collection.includes('role="combobox"') && collection.includes("Glaciers"), collection);
const trail = renderToString(React.createElement(Breadcrumb, { label: "Location", overflowLabel: "Earlier pages", items: [{ id: "home", label: "Library", href: "/" }, { id: "proof", label: "Proof" }] }));
assert.ok(trail.includes('aria-current="page"') && trail.includes('href="/"'), trail);
const regions = renderToString(React.createElement(MultiSelect, { label: "Regions", labels: { empty: "No matches", remove: label => "Remove " + label }, options: [{ value: "eu", label: "Europe" }], value: ["eu"], onChange() {} }));
assert.ok(regions.includes('role="combobox"') && regions.includes("Remove Europe"), regions);
const dateField = renderToString(React.createElement(DateField, { name: "day", label: "Publication", labels: { day: "Day", month: "Month", year: "Year", openCalendar: "Choose date", previousMonth: "Previous", nextMonth: "Next" }, locale: "en-GB", value: "2028-02-29", onChange() {} }));
assert.ok(dateField.includes('value="2028-02-29"') && dateField.includes("Choose date"), dateField);
for (const [Component, format, raw, expected, sizes] of [
  [IbanInput, ibanFormat, "gb82west12345698765432", "GB82 WEST 1234 5698 7654 32", [4, 4, 4, 4, 4, 2]],
  [CardNumberInput, paymentCardFormat, "378282246310005", "3782 822463 10005", [4, 6, 5]],
  [SirenInput, sirenFormat, "001234567", "001 234 567", [3, 3, 3]],
  [SiretInput, siretFormat, "00123456700017", "001 234 567 00017", [3, 3, 3, 5]],
]) {
  const markup = renderToString(React.createElement(Input, { format, defaultValue: raw }));
  assert.ok(markup.includes('value="' + expected + '"'), markup);
  assert.equal(format.parse(expected), raw.toUpperCase());
  const field = React.createElement(Component, { name: "identifier", label: "Identifier", defaultValue: raw,
    segmentLabel: (index, total) => "Block " + (index + 1) + " of " + total });
  const { window } = new JSDOM(renderToString(React.createElement("form", null, field)));
  const form = window.document.forms[0];
  const blocks = Array.from(form.querySelectorAll('input[type="text"]'));
  assert.deepEqual(blocks.map(input => input.size), sizes);
  assert.deepEqual(blocks.map(input => input.value), expected.split(" "));
  assert.equal(blocks[0].getAttribute("aria-label"), "Block 1 of " + sizes.length);
  assert.deepEqual([...new window.FormData(form)], [["identifier", raw.toUpperCase()]]);
  window.close();
}
const masked = renderToString(React.createElement(Input, { defaultValue: "123456", mask: "### ###", counter: { max: 7 } }));
assert.ok(masked.includes('value="123 456"') && masked.includes("7 / 7"), masked);
const overLimit = renderToString(React.createElement(Textarea, { defaultValue: "Proof", counter: { max: 2 } }));
assert.ok(overLimit.includes('aria-invalid="true"') && overLimit.includes("5 / 2"), overLimit);
const footer = renderToString(React.createElement(Footer, { groups: [{ label: "Project", links: [{ label: "Docs", href: "/docs" }] }] }));
assert.ok(footer.startsWith("<footer") && footer.includes('aria-label="Project"') && footer.includes('href="/docs"'), footer);
const guideLinks = [{ id: "guide", label: "Guide", href: "/guide" }];
const layout = new JSDOM(renderToString(React.createElement(React.Fragment, null,
  React.createElement(Navbar, { label: "Primary", menuLabel: "Menu", items: guideLinks, current: "guide" }),
  React.createElement(Hero, { heading: "Guide", headingLevel: "h2" }),
  React.createElement(ResponsiveImage, { src: "/cover.jpg", alt: "Cover", width: 800, height: 450,
    fetchPriority: "high", sources: [{ media: "(max-width: 32rem)", srcSet: "/portrait.jpg", width: 400, height: 600 }] }),
  React.createElement(SearchAutocomplete, { label: "Find editions", value: "", results: [], status: "", onValueChange() {} }),
  React.createElement(SearchField, { name: "q", label: "Search the guide", defaultValue: "guide" }),
  React.createElement(Sidebar, { label: "Contents", groups: [{ id: "start", label: "Start here", items: guideLinks }], current: "guide" }),
)));
const layoutDocument = layout.window.document;
assert.equal(layoutDocument.querySelector('input[type="search"][name="q"]').value, "guide");
assert.equal(layoutDocument.querySelector("picture source").getAttribute("srcset"), "/portrait.jpg");
assert.equal(layoutDocument.querySelector("picture img").getAttribute("fetchpriority"), "high");
assert.equal(layoutDocument.querySelector('input[role="combobox"]').getAttribute("aria-expanded"), "false");
const headingId = layoutDocument.querySelector("section").getAttribute("aria-labelledby");
assert.equal(layoutDocument.getElementById(headingId).tagName, "H2");
for (const name of ["Primary", "Contents"]) {
  const active = layoutDocument.querySelector('nav[aria-label="' + name + '"] a[aria-current="page"]');
  assert.equal(active?.getAttribute("href"), "/guide");
}
layout.window.close();
for (const component of ["hero", "navbar", "sidebar", "search-autocomplete", "responsive-image"]) {
  const css = readFileSync(require.resolve("@alien6-studio/elea-ui/css/" + component + ".css"), "utf8");
  assert.ok(css.includes(".elea-" + component));
  if (component === "navbar" || component === "sidebar") assert.ok(css.includes(".elea-navigation-list__link"));
  if (component === "search-autocomplete") assert.ok(css.includes(".elea-search-field__icon"));
}

// ContentEditor in a browser-like DOM, the client entry points behind "use client"
const dom = new JSDOM("<!doctype html><html><body><div id=root></div></body></html>", { url: "https://example.org/" });
const browserGlobals = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, Range: dom.window.Range, getSelection: () => dom.window.getSelection(), requestAnimationFrame: (cb) => setTimeout(cb, 0), IS_REACT_ACT_ENVIRONMENT: true };
// Some of these are getter-only on recent Node versions, so they are defined rather than assigned
for (const [key, value] of Object.entries(browserGlobals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
const { createRoot, hydrateRoot } = await import("react-dom/client");
const reactModule = await import("react");
const act = reactModule.act ?? (await import("react-dom/test-utils")).act;
const appearance = React.createElement("section", { "data-elea-appearance": "dark", "data-elea-theme": "journal" },
  React.createElement(Dialog, { open: true, closeLabel: "Close", onClose: () => {}, title: "Appearance" }, "Review"));
const host = dom.window.document.createElement("div");
host.innerHTML = renderToString(appearance);
dom.window.document.body.append(host);
const recoverable = [];
let hydrated;
await act(async () => { hydrated = hydrateRoot(host, appearance, { onRecoverableError: error => recoverable.push(error) }); });
const portal = dom.window.document.querySelector(".elea-dialog-backdrop");
assert.equal(portal.getAttribute("data-elea-appearance"), "dark");
assert.equal(portal.getAttribute("data-elea-theme"), "journal");
await act(async () => host.firstElementChild.setAttribute("data-elea-appearance", "light"));
assert.equal(portal.getAttribute("data-elea-appearance"), "light");
assert.deepEqual(recoverable, []);
await act(async () => hydrated.unmount());
host.remove();
const { ContentEditor, ContentProvider, loadEditorParts } = await import("@alien6-studio/elea-content-editor");
const root = createRoot(dom.window.document.getElementById("root"));
let blocks = createDocument(doc.blocks).blocks;
await act(async () => {
  root.render(React.createElement(ContentProvider, { messages: fr }, React.createElement(ContentEditor, { blocks, onBlocksChange: (next) => { blocks = next; }, enableVirtualization: false })));
});
const editable = dom.window.document.querySelector('[contenteditable="true"]');
assert.ok(editable && editable.innerHTML.includes("<b>there</b>"), "editor renders the sanitized paragraph");
assert.ok(dom.window.document.querySelector('[data-elea-block-type="header"] [contenteditable="true"]'), "editor renders the header field");
// The Markdown source is a part of the editor that loads when first asked for
const editor = (mode) => React.createElement(ContentProvider, { messages: fr }, React.createElement(ContentEditor, { blocks, onBlocksChange: (next) => { blocks = next; }, enableVirtualization: false, mode }));
await act(async () => root.render(editor("markdown")));
await act(async () => loadEditorParts("source"));
assert.ok(dom.window.document.querySelector("textarea.elea-markdown-editor__input"), "editor renders the Markdown source once it has loaded");
await act(async () => root.unmount());
console.log("consumer verified: content, tokens, viewer (SSR), media (SSR), ui (SSR), editor (DOM)");
`;

// Run alone: the core entry must render without DOMPurify or jsdom ever being loaded
const CONSUMER_CORE = String.raw`
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import React from "react";
import { renderToString } from "react-dom/server";
import { RICH_HTML_POLICY } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer/core";

const sanitizer = { policy: RICH_HTML_POLICY, sanitize: (html) => html.toUpperCase() };
const html = renderToString(React.createElement(ContentView, { data: { blocks: [{ type: "paragraph", data: { text: "hi" } }] }, sanitizer }));
assert.ok(html.includes('<div class="elea-paragraph">HI</div>'), html);
const loaded = () => Object.keys(createRequire(import.meta.url).cache).filter((file) => /node_modules\/(jsdom|dompurify)\//.test(file)).length;
assert.equal(loaded(), 0, "the core entry loaded a DOM");
await import("@alien6-studio/elea-content-viewer");
assert.ok(loaded() > 0, "the probe no longer sees the DOM the main entry loads");
console.log("core verified: viewer rendered on the server without DOMPurify or jsdom");
`;

const CONSUMER_TYPES = `
import { createElement, createRef } from "react";
import { ContentView as CoreContentView, type ContentViewProps as CoreContentViewProps } from "@alien6-studio/elea-content-viewer/core";
import type { EleaDocument, EleaBlock, BlockRegistry } from "@alien6-studio/elea-content";
import { blocksToHtml, htmlToBlocks, parseDocument, defaultRegistry } from "@alien6-studio/elea-content";
import { ContentView, type ContentViewProps } from "@alien6-studio/elea-content-viewer";
import { ContentEditor, ContentProvider, type ContentEditorProps, type ImageCropOptions } from "@alien6-studio/elea-content-editor";
import { tokens, type FlatToken } from "@alien6-studio/elea-tokens";
import { createThemeProfile, editions, makeBrandTheme, type BrandTheme } from "@alien6-studio/elea-tokens/brand";
import { ImageCropper, type CropState, type DropZoneProps } from "@alien6-studio/elea-media";
import { Button, IbanInput, Stepper, StepperPanel, StepperSkeleton, type ButtonProps, type IdentifierInputProps, type InputProps, type LinkButtonProps } from "@alien6-studio/elea-ui";
import { ibanFormat } from "@alien6-studio/elea-ui/formats";
export const ibanInput: InputProps = { format: ibanFormat };
const bankField: IdentifierInputProps = {
  label: "IBAN", name: "iban", segmentLabel: (index, total) => "Block " + (index + 1) + " of " + total,
  value: "DE89", onValueChange: (raw: string) => void raw,
};
export const bankAccount = createElement(IbanInput, bankField);
const navigation = { current: 0, steps: [{ id: "draft", label: "Draft" }], onSelect: (step: { id: string }) => void step.id };
export const steps = createElement(Stepper, { ...navigation, label: "Flow", ref: createRef<HTMLElement>(), className: "flow", "aria-describedby": "hint" });
export const actions = createElement(StepperPanel, { ...navigation, previousLabel: "Back", nextLabel: "Next", ref: createRef<HTMLDivElement>(), id: "actions" });
export const loading = createElement(StepperSkeleton, { ref: createRef<HTMLDivElement>(), style: { width: "100%" } });

const registry: BlockRegistry = defaultRegistry;
const document: EleaDocument = parseDocument("text", { registry });
const block: EleaBlock | undefined = document.blocks[0];
const viewerProps: ContentViewProps = { data: document, siteHostnames: ["members.example.org"] };
// @ts-expect-error the core entry has no sanitizer of its own
const withoutSanitizer: CoreContentViewProps = { data: document };
const editorProps: ContentEditorProps = {
  mode: "classic", width: "full", maxLength: 350, blocks: htmlToBlocks("<p>Draft</p>"),
  onBlocksChange: blocksToHtml,
};
const imageCrop: ImageCropOptions = {
  formats: { defaultValue: "cover", presets: [{ value: "cover", label: "Cover", aspect: 16 / 9 }] },
  resolveOriginal: file => file.url ? { source: file.url } : undefined,
};
const first: FlatToken | undefined = tokens[0];
const brand: BrandTheme = editions.Obsidian;
const stylesheet: string = makeBrandTheme(brand).css;
const profileStylesheet = makeBrandTheme({ ...createThemeProfile("reserve"), buttonRadiusScale: "profile" }).css;
const zone: DropZoneProps = { label: "Add", onFiles: () => {} };
const crop: CropState = { zoom: 1, rotation: 0, offset: { x: 0, y: 0 } };
const buttonProps: ButtonProps = { children: "Save", variant: "primary" };
const routerButton: LinkButtonProps = {
  children: "Review", href: "/review", variant: "outline", tone: "danger",
  render: props => createElement("a", props),
};
export { routerButton };
export { CoreContentView, withoutSanitizer, ContentView, ContentEditor, ContentProvider, ImageCropper, Button, viewerProps, editorProps, imageCrop, block, first, stylesheet, profileStylesheet, zone, crop, buttonProps };
`;

try {
  const packed = JSON.parse(run("npm", ["pack", ...publishable.map(({ dir }) => `--workspace=packages/${dir}`), "--json", "--pack-destination", temporary], root, true));
  const archives = packed.map((entry) => join(temporary, entry.filename));
  if (archives.length !== publishable.length) throw new Error(`Expected ${publishable.length} archives, packed ${archives.length}`);

  const supportedReact = [
    { version: "18.3.1", types: "18.3.18", domTypes: "18.3.5" },
    { version: "19.3.1", types: "19.3.0", domTypes: "19.3.0" },
  ];
  for (const { version, types, domTypes } of supportedReact) {
    const consumer = join(temporary, version);
    mkdirSync(consumer);
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
    console.log(`\n== React ${version}`);
    const withPhone = version.startsWith("19.");
    const phoneDependency = withPhone ? [`libphonenumber-js@${devDependencies["libphonenumber-js"]}`] : [];
    run("npm", [...install, ...phoneDependency, `react@${version}`, `react-dom@${version}`, `@types/react@${types}`, `@types/react-dom@${domTypes}`, `jsdom@${devDependencies.jsdom}`, ...archives], consumer);
    let exported = 0;
    for (const { manifest } of publishable) exported += checkExports(manifest.name, consumer);
    console.log(`exports verified: ${exported} declared targets shipped, LICENSE present in every archive`);
    console.log(`styles verified: ${checkStyles(consumer)} stylesheets hold alone, in the Elea layers`);
    writeFileSync(join(consumer, "consume.mjs"), CONSUMER_SCRIPT);
    run("node", ["consume.mjs"], consumer);
    writeFileSync(join(consumer, "core.mjs"), CONSUMER_CORE);
    run("node", ["core.mjs"], consumer);
    if (withPhone) {
      run("node", ["--input-type=module", "-e", `
        import assert from "node:assert/strict";
        import { createElement, createRef } from "react";
        import { renderToString } from "react-dom/server";
        import { JSDOM } from "jsdom";
        import { getCountries, PhoneInput, phoneFormat, phoneToE164 } from "@alien6-studio/elea-ui/phone";
        assert.ok(getCountries().includes("FR"));
        assert.equal(phoneFormat("GB").format("02079460018"), "020 7946 0018");
        assert.equal(phoneToE164("020 7946 0018", "GB"), "+442079460018");
        const telephone = createElement(PhoneInput, { name: "tel", "aria-label": "Telephone", locale: "en",
          country: "GB", onCountryChange() {}, value: "02079460018", onValueChange() {},
          labels: { country: "Country", empty: "No countries" } });
        const { window } = new JSDOM(renderToString(createElement("form", null, telephone)));
        const form = window.document.forms[0];
        assert.equal(form.querySelector('[role="combobox"]').getAttribute("aria-label"), "Country");
        assert.equal(form.querySelector('input[type="tel"]').value, "020 7946 0018");
        assert.deepEqual([...new window.FormData(form)], [["tel", "+442079460018"]]);
        window.close();
      `], consumer);
    } else {
      run("node", ["--input-type=module", "-e", `
        import assert from "node:assert/strict";
        assert.throws(() => import.meta.resolve("libphonenumber-js/min"), { code: "ERR_MODULE_NOT_FOUND" });
      `], consumer);
    }
    const phoneTypes = withPhone ? `
      import { PhoneInput, phoneFormat, type CountryCode, type PhoneInputProps } from "@alien6-studio/elea-ui/phone";
      export const contactInput = (country: CountryCode): InputProps => ({ format: phoneFormat(country) });
      const telephone: PhoneInputProps = { locale: "en", country: "GB", onCountryChange() {},
        value: "", onValueChange() {}, labels: { country: "Country", empty: "No countries" } };
      export const contactPhone = createElement(PhoneInput, telephone);
    ` : "";
    writeFileSync(join(consumer, "types.ts"), CONSUMER_TYPES + phoneTypes);
    writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { module: "ESNext", moduleResolution: "bundler", target: "ES2022", jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: true, types: [] }, files: ["types.ts"] }));
    run(join(root, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"], consumer);
    console.log("types verified: packaged declarations resolve under moduleResolution bundler");
  }
  console.log(`consumer imports verified: ${publishable.length} packages`);

  const host = join(temporary, "tailwind");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ private: true, type: "module" }));
  console.log(`\n== Tailwind ${TAILWIND}`);
  run("npm", [...install, `tailwindcss@${TAILWIND}`, `@tailwindcss/cli@${TAILWIND}`, ...archives], host);
  const unordered = checkTailwindHost(host);
  console.log(`tailwind host verified: with the order line, ${layerOrder(TAILWIND_ORDER).join(", ")}; without it and Elea imported first, ${unordered.join(", ")}`);

  const bundler = join(temporary, "bundler");
  mkdirSync(bundler);
  writeFileSync(join(bundler, "package.json"), JSON.stringify({ private: true, type: "module" }));
  console.log(`\n== Vite ${VITE}`);
  run("npm", [...install, `vite@${VITE}`, `jsdom@${devDependencies.jsdom}`, "react@19.3.1", "react-dom@19.3.1", ...archives], bundler);
  writeFileSync(join(bundler, "entry.js"), 'import "@alien6-studio/elea-ui/bundle.css";\nexport { ContentEditor, ContentProvider } from "@alien6-studio/elea-content-editor";\n');
  writeFileSync(join(bundler, "build.mjs"), BUNDLER_SCRIPT);
  run("node", ["build.mjs", String(EDITOR_FIRST_LOAD)], bundler);

  if (destination) {
    mkdirSync(destination, { recursive: true });
    for (const archive of archives) copyFileSync(archive, join(destination, basename(archive)));
    console.log(`Qualified archives saved to ${destination}`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
