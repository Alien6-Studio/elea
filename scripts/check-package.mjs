import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Qualifies the packages as a stranger would use them: packed archives installed in a
// throwaway consumer outside the repository, with no path to the sources. The consumer
// imports every entry point, checks every declared export resolves to a shipped file,
// type-checks against the published declarations, renders the viewer on the server and
// the editor in a browser-like DOM, with React 18 then React 19.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publishable = readdirSync(join(root, "packages"))
  .map((dir) => ({ dir, manifest: JSON.parse(readFileSync(join(root, "packages", dir, "package.json"), "utf8")) }))
  .filter(({ manifest }) => !manifest.private);
const temporary = mkdtempSync(join(tmpdir(), "elea-consumer-"));
const consumer = join(temporary, "consumer");
mkdirSync(consumer);
writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
const userConfig = join(temporary, "empty.npmrc");
writeFileSync(userConfig, "registry=https://registry.npmjs.org\n");
const env = { ...process.env, npm_config_userconfig: userConfig };
delete env.NODE_AUTH_TOKEN;
delete env.NPM_TOKEN;

function run(command, args, cwd = consumer, capture = false) {
  const result = spawnSync(command, args, { cwd, env, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.slice(0, 2).join(" ")} failed (${result.status})${capture ? `: ${result.stderr}` : ""}`);
  return result.stdout;
}

const install = ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--registry=https://registry.npmjs.org"];

/** Every `exports` entry of a package must point at a file that the archive shipped. */
function checkExports(name) {
  const dir = join(consumer, "node_modules", name);
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const targets = [];
  const collect = (value) => {
    if (typeof value === "string") targets.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(manifest.exports);
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

const CONSUMER_SCRIPT = `
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import React from "react";
import { renderToString } from "react-dom/server";
import { createDocument, defaultRegistry, documentToText, parseDocument, fr } from "@alien6-studio/elea-content";
import { tokens, toStylesheet, cssVar } from "@alien6-studio/elea-tokens";
import { ContentView, ContentExcerpt, createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
console.log("react", require("react/package.json").version);

// Core and tokens
const doc = parseDocument({ blocks: [{ type: "paragraph", data: { text: "<p>Hi <b>there</b> <img src=\\"data:image/png;base64,AA\\"></p>" } }, { type: "header", data: { text: "T", level: 2 } }] }, { registry: defaultRegistry });
assert.equal(documentToText(doc, defaultRegistry), "Hi there\\n\\nT");
assert.ok(tokens.length > 50 && toStylesheet(tokens).includes("--elea-color-text-default") && cssVar("space.4") === "var(--elea-space-4)");

// Viewer on the server: no hook, sanitized output
const sanitizer = createDefaultSanitizer({ links: { siteHostnames: ["members.example.org"] } });
const html = renderToString(React.createElement(ContentView, { data: doc, sanitizer, messages: fr }));
assert.ok(html.includes('<div class="elea-paragraph"><p>Hi <b>there</b> <img></p></div>'), html);
assert.ok(renderToString(React.createElement(ContentExcerpt, { data: doc })).includes("Hi there T"));

// ContentEditor in a browser-like DOM, the client entry points behind "use client"
const dom = new JSDOM("<!doctype html><html><body><div id=root></div></body></html>", { url: "https://example.org/" });
const browserGlobals = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, Range: dom.window.Range, getSelection: () => dom.window.getSelection(), requestAnimationFrame: (cb) => setTimeout(cb, 0), IS_REACT_ACT_ENVIRONMENT: true };
// Some of these are getter-only on recent Node versions, so they are defined rather than assigned
for (const [key, value] of Object.entries(browserGlobals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
const { createRoot } = await import("react-dom/client");
const reactModule = await import("react");
const act = reactModule.act ?? (await import("react-dom/test-utils")).act;
const { ContentEditor, ContentProvider } = await import("@alien6-studio/elea-content-editor");
const root = createRoot(dom.window.document.getElementById("root"));
let blocks = createDocument(doc.blocks).blocks;
await act(async () => {
  root.render(React.createElement(ContentProvider, { messages: fr }, React.createElement(ContentEditor, { blocks, onBlocksChange: (next) => { blocks = next; }, enableVirtualization: false })));
});
const editable = dom.window.document.querySelector('[contenteditable="true"]');
assert.ok(editable && editable.innerHTML.includes("<b>there</b>"), "editor renders the sanitized paragraph");
assert.ok(dom.window.document.querySelector('[data-elea-block-type="header"] textarea'), "editor renders the header field");
await act(async () => root.unmount());
console.log("consumer verified: core, tokens, viewer (SSR), editor (DOM)");
`;

const CONSUMER_TYPES = `
import type { EleaDocument, EleaBlock, BlockRegistry } from "@alien6-studio/elea-content";
import { parseDocument, defaultRegistry } from "@alien6-studio/elea-content";
import { ContentView, type ContentViewProps } from "@alien6-studio/elea-content-viewer";
import { ContentEditor, ContentProvider, type ContentEditorProps } from "@alien6-studio/elea-content-editor";
import { tokens, type FlatToken } from "@alien6-studio/elea-tokens";

const registry: BlockRegistry = defaultRegistry;
const document: EleaDocument = parseDocument("text", { registry });
const block: EleaBlock | undefined = document.blocks[0];
const viewerProps: ContentViewProps = { data: document };
const editorProps: ContentEditorProps = { blocks: document.blocks, onBlocksChange: () => {} };
const first: FlatToken | undefined = tokens[0];
export { ContentView, ContentEditor, ContentProvider, viewerProps, editorProps, block, first };
`;

try {
  const packed = JSON.parse(run("npm", ["pack", ...publishable.map(({ dir }) => `--workspace=packages/${dir}`), "--json", "--pack-destination", temporary], root, true));
  const archives = packed.map((entry) => join(temporary, entry.filename));
  if (archives.length !== publishable.length) throw new Error(`Expected ${publishable.length} archives, packed ${archives.length}`);

  for (const reactVersion of ["18.3.1", "19.3.1"]) {
    console.log(`\n== React ${reactVersion}`);
    run("npm", [...install, `react@${reactVersion}`, `react-dom@${reactVersion}`, "jsdom@30.1.3", ...archives]);
    let exported = 0;
    for (const { manifest } of publishable) exported += checkExports(manifest.name);
    console.log(`exports verified: ${exported} declared targets shipped, LICENSE present in every archive`);
    writeFileSync(join(consumer, "consume.mjs"), CONSUMER_SCRIPT);
    run("node", ["consume.mjs"]);
  }

  // Types resolve from the published declarations with a bundler-style consumer configuration
  writeFileSync(join(consumer, "types.ts"), CONSUMER_TYPES);
  writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { module: "ESNext", moduleResolution: "bundler", target: "ES2022", jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: true, types: [] }, files: ["types.ts"] }));
  run("npm", [...install, "@types/react@19.3.0", "@types/react-dom@19.3.0"]);
  run(join(root, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"]);
  console.log("types verified: published declarations resolve under moduleResolution bundler");
  console.log(`consumer imports verified: ${publishable.length} packages`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
