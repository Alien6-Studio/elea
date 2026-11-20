import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BUILTIN_BLOCK_TYPES,
  LEGACY_BLOCK_TYPES,
  MAX_LIST_DEPTH,
  attachmentBlock,
  defaultRegistry,
  headerBlock,
  imageBlock,
  listBlock,
  paragraphBlock,
  quoteBlock,
  videoBlock,
} from "./builtin.js";
import { createRegistry, asDefinition } from "./registry.js";
import { defineBlock } from "./definition.js";

test("the default registry knows the seven Elea blocks and the legacy EditorJS types", () => {
  for (const type of [...BUILTIN_BLOCK_TYPES, ...LEGACY_BLOCK_TYPES]) assert.ok(defaultRegistry.has(type), type);
  assert.equal(defaultRegistry.has("widget"), false);
  assert.equal(defaultRegistry.get("widget"), undefined);
  assert.deepEqual(defaultRegistry.defaults("widget"), {});
  assert.deepEqual(defaultRegistry.normalizeData("widget", { a: 1 }), { a: 1 });
  assert.equal(defaultRegistry.toText({ type: "widget", data: { text: "x" } }), "");
  assert.equal(defaultRegistry.hasMedia({ type: "widget", data: {} }), false);
});

test("defaults match what the editor inserts", () => {
  assert.deepEqual(paragraphBlock.defaults(), { text: "" });
  assert.deepEqual(headerBlock.defaults(), { text: "", level: 2 });
  assert.deepEqual(listBlock.defaults(), { style: "unordered", items: [""] });
  assert.deepEqual(quoteBlock.defaults(), { text: "", caption: "" });
  assert.deepEqual(imageBlock.defaults(), { file: { url: "", id: "" }, caption: "" });
  assert.deepEqual(videoBlock.defaults(), { url: "", caption: "" });
  assert.deepEqual(attachmentBlock.defaults(), { resourceId: "", title: "", type: "", description: "", url: "" });
});

test("normalize coerces loose stored data", () => {
  assert.deepEqual(paragraphBlock.normalize({ text: 12 }), { text: "" });
  assert.deepEqual(headerBlock.normalize({ text: "T", level: "4" }), { text: "T", level: 4 });
  assert.deepEqual(headerBlock.normalize({ level: 9 }), { text: "", level: 2 });
  assert.deepEqual(headerBlock.normalize({ level: 2.7 }), { text: "", level: 2 });
  assert.deepEqual(listBlock.normalize({ style: "ordered", items: ["a", { content: "b", items: ["c", 5] }, 7, { nope: true }] }), {
    style: "ordered",
    items: ["a", { content: "b", items: ["c"] }],
  });
  assert.deepEqual(listBlock.normalize({ style: "weird", items: "x" }), { style: "unordered", items: [] });
  assert.deepEqual(listBlock.normalize({ style: "unordered", marker: "lower-alpha", items: [{ content: "a", items: ["b"], childrenMarker: "square" }] }), {
    style: "ordered", marker: "lower-alpha", items: [{ content: "a", items: ["b"], childrenMarker: "square" }],
  });
  assert.deepEqual(listBlock.normalize({ marker: "unknown", items: [{ content: "a", items: ["b"], childrenMarker: "unknown" }] }), {
    style: "unordered", items: [{ content: "a", items: ["b"] }],
  });
  assert.deepEqual(quoteBlock.normalize({ text: "q" }), { text: "q", caption: "" });
  assert.deepEqual(imageBlock.normalize({ file: { url: "/a.png", fileId: "f1" }, caption: "c", alt: "alt" }), { file: { url: "/a.png", id: "f1" }, caption: "c", alt: "alt" });
  assert.deepEqual(imageBlock.normalize({ url: "/legacy.png" }), { file: { url: "/legacy.png", id: "" }, caption: "" });
  assert.deepEqual(imageBlock.normalize({ file: "oops", alt: "" }), { file: { url: "", id: "" }, caption: "" });
  assert.deepEqual(videoBlock.normalize({}), { url: "", caption: "" });
  assert.deepEqual(attachmentBlock.normalize({ resourceId: "r", title: "t", file: { url: "/f.pdf", id: "f" } }), {
    resourceId: "r", title: "t", type: "", description: "", url: "", file: { url: "/f.pdf", id: "f" },
  });
  assert.deepEqual(attachmentBlock.normalize({ file: null }), { resourceId: "", title: "", type: "", description: "", url: "" });
});

test("toText strips markup and joins parts", () => {
  assert.equal(paragraphBlock.toText({ text: "Hello <strong>world</strong>&nbsp;!" }), "Hello world !".replaceAll(" ", " "));
  assert.equal(headerBlock.toText({ text: "<em>Title</em>", level: 1 }), "Title");
  assert.equal(listBlock.toText({ style: "unordered", items: ["<b>a</b>", { content: "b", items: ["c", ""] }, ""] }), "a\nb\nc");
  assert.equal(quoteBlock.toText({ text: "Words", caption: "Author" }), "Words — Author");
  assert.equal(quoteBlock.toText({ text: "Words", caption: "" }), "Words");
  assert.equal(imageBlock.toText({ file: { url: "", id: "" }, caption: "Cap" }), "Cap");
  assert.equal(videoBlock.toText({ url: "", caption: "" }), "");
  assert.equal(attachmentBlock.toText({ resourceId: "", title: "Doc", type: "", description: "Desc", url: "" }), "Doc — Desc");
});

test("hasMedia tells content blocks from empty placeholders", () => {
  assert.equal(imageBlock.hasMedia?.({ file: { url: "", id: "x" }, caption: "" }), true);
  assert.equal(videoBlock.hasMedia?.({ url: "", caption: "" }), false);
  assert.equal(attachmentBlock.hasMedia?.({ resourceId: "", title: "", type: "", description: "", url: "/f" }), true);
});

test("legacy blocks pass data through and extract text from the usual fields", () => {
  assert.deepEqual(defaultRegistry.normalizeData("code", { code: "x = 1" }), { code: "x = 1" });
  assert.equal(defaultRegistry.toText({ type: "code", data: { code: "x = 1" } }), "x = 1");
  assert.equal(defaultRegistry.toText({ type: "attaches", data: { title: "", file: { name: "report.pdf" } } }), "report.pdf");
  assert.equal(defaultRegistry.toText({ type: "attaches", data: { file: { title: "Report" } } }), "Report");
  assert.equal(defaultRegistry.toText({ type: "table", data: { content: [["a", "<b>b</b>"], "bad", ["c"]] } }), "a b c");
  assert.equal(defaultRegistry.toText({ type: "embed", data: { caption: "Clip", text: 3 } }), "Clip");
  assert.equal(defaultRegistry.toText({ type: "delimiter", data: {} }), "");
  assert.equal(defaultRegistry.hasMedia({ type: "embed", data: { embed: "https://x" } }), true);
  assert.equal(defaultRegistry.hasMedia({ type: "embed", data: {} }), false);
  assert.equal(defaultRegistry.hasMedia({ type: "delimiter", data: { a: 1 } }), false);
});

test("a registry extends with custom blocks and replaces same-named definitions", () => {
  const widget = defineBlock<{ src: string }>({
    type: "widget",
    defaults: () => ({ src: "" }),
    normalize: (data) => ({ src: typeof data.src === "string" ? data.src : "" }),
    toText: (data) => data.src,
  });
  const paragraphUpper = defineBlock<{ text: string }>({
    type: "paragraph",
    defaults: () => ({ text: "" }),
    normalize: (data) => ({ text: String(data.text ?? "") }),
    toText: (data) => data.text.toUpperCase(),
  });
  const registry = defaultRegistry.with(asDefinition(widget), asDefinition(paragraphUpper));
  assert.ok(registry.has("widget"));
  assert.equal(registry.toText({ type: "widget", data: { src: "s" } }), "s");
  assert.equal(registry.toText({ type: "paragraph", data: { text: "low" } }), "LOW");
  assert.equal(defaultRegistry.toText({ type: "paragraph", data: { text: "low" } }), "low");
  assert.deepEqual(createRegistry([]).types, []);
  assert.equal(registry.types.filter((type) => type === "paragraph").length, 1);
});

test("nested lists are flattened beyond the maximum depth and huge lists survive", () => {
  let item: unknown = "leaf";
  for (let level = 0; level < MAX_LIST_DEPTH + 5; level += 1) item = { content: `level ${level}`, items: [item] };
  const data = listBlock.normalize({ style: "unordered", items: [item] });
  let depth = 0;
  let cursor: unknown = data.items[0];
  while (typeof cursor === "object" && cursor !== null && Array.isArray((cursor as { items?: unknown[] }).items)) {
    depth += 1;
    cursor = (cursor as { items: unknown[] }).items[0];
  }
  assert.equal(depth, MAX_LIST_DEPTH);
  const wide = listBlock.normalize({ style: "ordered", items: Array.from({ length: 50_000 }, (_, index) => `item ${index}`) });
  assert.equal(wide.items.length, 50_000);
  assert.equal(listBlock.toText(wide).split("\n").length, 50_000);
});

test("nestedlist normalizes like list, invalid items and depth included", () => {
  assert.equal(defaultRegistry.has("nestedlist"), true);
  assert.deepEqual(defaultRegistry.normalizeData("nestedlist", { style: "ordered", items: [null, {}, "a", { content: "b", items: [null, "c"] }] }), { style: "ordered", items: ["a", { content: "b", items: ["c"] }] });
  assert.deepEqual(defaultRegistry.normalizeData("nestedlist", { items: {} }), { style: "unordered", items: [] });
  assert.equal(defaultRegistry.toText({ type: "nestedlist", data: { style: "unordered", items: ["x", { content: "y", items: ["z"] }] } }), "x\ny\nz");
});
