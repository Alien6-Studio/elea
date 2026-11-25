import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultRegistry } from "./blocks/builtin.js";
import { ELEA_DOCUMENT_VERSION, createDocument, isDocument, isEmptyDocument, normalizeDocument, parseDocument, prepareEditorBlocks } from "./document.js";

const ids = () => {
  let counter = 0;
  return () => `id-${++counter}`;
};

test("editable drafts keep extension data, stable unique ids and the original input", () => {
  const rows = [
    { type: "header", data: { level: 2, text: "Guide" } },
    { id: 1, type: "diagram", data: { nodes: ["A"] }, tunes: { layout: "wide" } },
    { id: "1", type: "nestedlist", data: { items: [{ content: "A", items: ["B"] }] } },
  ];
  const blocks = prepareEditorBlocks(rows);
  assert.deepEqual(prepareEditorBlocks(JSON.stringify({ blocks: rows })), blocks);
  assert.deepEqual(blocks.map(({ id }) => id), ["elea-block-1", "1", "3"]);
  assert.deepEqual(blocks[1], { ...rows[1], id: "1" });
  assert.notEqual(Reflect.get(blocks[1]!, "tunes"), rows[1]?.tunes);
  assert.notEqual(blocks[1]?.data, rows[1]?.data);
  const saved = createDocument(blocks, { version: "2.30.0" });
  assert.equal(saved.version, "2.30.0");
  assert.deepEqual(saved.blocks, blocks);
  assert.notEqual(Reflect.get(saved.blocks[1]!, "tunes"), Reflect.get(blocks[1]!, "tunes"));
  assert.deepEqual(blocks[2]?.data, rows[2]?.data);
  for (const input of [null, [], { blocks: [] }, {}]) {
    assert.deepEqual(prepareEditorBlocks(input), [{ id: "1", type: "paragraph", data: { text: "" } }]);
  }
  for (const text of ["<em>Draft</em>\n\nNext", "[unfinished"]) {
    assert.deepEqual(prepareEditorBlocks(text), [{ id: "1", type: "paragraph", data: { text } }]);
  }
  assert.equal(prepareEditorBlocks([{}])[0]?.type, "paragraph");
});

test("createDocument wraps copied blocks with time and version", () => {
  const block = { id: "a", type: "paragraph", data: { text: "Hello" } };
  const document = createDocument([block], { time: 42 });
  assert.equal(document.time, 42);
  assert.equal(document.version, ELEA_DOCUMENT_VERSION);
  assert.deepEqual(document.blocks, [block]);
  assert.notEqual(document.blocks[0], block);
  assert.notEqual(document.blocks[0]?.data, block.data);
  assert.ok(createDocument([]).time >= 0);
});

test("isDocument accepts EditorJS-shaped values and rejects the rest", () => {
  assert.equal(isDocument({ blocks: [{ type: "paragraph", data: {} }] }), true);
  assert.equal(isDocument({ blocks: [] }), true);
  assert.equal(isDocument({ blocks: [{ data: {} }] }), false);
  assert.equal(isDocument({ blocks: "no" }), false);
  assert.equal(isDocument(null), false);
  assert.equal(isDocument("{}"), false);
});

test("normalizeDocument fills ids, keeps unknown types and stamps time and version", () => {
  const document = normalizeDocument(
    { blocks: [{ type: "paragraph" }, { id: "", type: "widget", data: { any: 1 } }, { id: "x", type: "header", data: { text: "T", level: "3" } }] },
    { registry: defaultRegistry, generateId: ids() },
  );
  assert.deepEqual(document.blocks, [
    { id: "id-1", type: "paragraph", data: { text: "" } },
    { id: "id-2", type: "widget", data: { any: 1 } },
    { id: "x", type: "header", data: { text: "T", level: 3 } },
  ]);
  assert.equal(document.version, ELEA_DOCUMENT_VERSION);
  assert.equal(typeof document.time, "number");
});

test("normalizeDocument keeps a valid time and version and deduplicates ids", () => {
  const document = normalizeDocument(
    { time: 7, version: "2.28.2", blocks: [{ id: "same", type: "paragraph", data: { text: "a" } }, { id: "same", type: "paragraph", data: { text: "b" } }] },
    { generateId: ids() },
  );
  assert.equal(document.time, 7);
  assert.equal(document.version, "2.28.2");
  assert.deepEqual(document.blocks.map((block) => block.id), ["same", "id-1"]);
});

test("stored ids are reserved even when a generator proposes collisions", () => {
  const source = {
    blocks: [
      { type: "paragraph", data: { text: "No stored id" } },
      { id: "stored", type: "paragraph", data: { text: "First instance" } },
      { id: "stored", type: "paragraph", data: { text: "Duplicate" } },
      { id: "elea-block-1", type: "paragraph", data: { text: "Fallback-shaped id" } },
    ],
  };
  const options = { generateId: () => "stored" };
  const fromObject = parseDocument(source, options);
  assert.deepEqual(fromObject.blocks.map((block) => block.id), ["elea-block-2", "stored", "elea-block-3", "elea-block-1"]);
  assert.deepEqual(parseDocument(JSON.stringify(source), options).blocks, fromObject.blocks);
  assert.equal(parseDocument({ blocks: [{ type: "paragraph" }] }, { generateId: () => "" }).blocks[0]?.id, "elea-block-1");
});

test("normalizeDocument without a registry leaves data untouched", () => {
  const document = normalizeDocument({ blocks: [{ id: "a", type: "header", data: { level: "3" } }] });
  assert.deepEqual(document.blocks[0]?.data, { level: "3" });
});

test("parseDocument reads a document object, its JSON and a bare block array", () => {
  const options = { registry: defaultRegistry, generateId: ids() };
  const source = { time: 1, version: "2.28.2", blocks: [{ id: "a", type: "paragraph", data: { text: "Hi" } }] };
  assert.deepEqual(parseDocument(source, options).blocks, source.blocks);
  assert.deepEqual(parseDocument(JSON.stringify(source), options).blocks, source.blocks);
  assert.deepEqual(parseDocument(JSON.stringify(source.blocks), options).blocks, source.blocks);
  assert.deepEqual(parseDocument(source.blocks, options).blocks, source.blocks);
});

test("parseDocument turns plain text and HTML into paragraphs", () => {
  const options = { generateId: ids() };
  const text = parseDocument("First line\nsecond line\n\n  Second paragraph  \n\n\n", options);
  assert.deepEqual(text.blocks, [
    { id: "id-1", type: "paragraph", data: { text: "First line<br>second line" } },
    { id: "id-2", type: "paragraph", data: { text: "Second paragraph" } },
  ]);
  const html = parseDocument("<p>Rich <strong>text</strong></p>", options);
  assert.equal(html.blocks[0]?.data.text, "<p>Rich <strong>text</strong></p>");
});

test("parseDocument never throws and yields an empty document for unreadable input", () => {
  for (const value of [null, undefined, "", "   ", 42, true, {}, { blocks: "x" }, "[1, 2]", "{\"a\":1}", [1]]) {
    assert.deepEqual(parseDocument(value).blocks, [], `input ${String(value)}`);
  }
  // Text that merely starts like JSON is text
  assert.equal(parseDocument("{not json").blocks[0]?.data.text, "{not json");
});

test("isEmptyDocument looks at text and media of known blocks", () => {
  const empty = createDocument([{ id: "a", type: "paragraph", data: { text: "<p><br></p>" } }, { id: "b", type: "image", data: { file: { url: "", id: "" }, caption: "" } }]);
  assert.equal(isEmptyDocument(empty, defaultRegistry), true);
  const withImage = createDocument([{ id: "b", type: "image", data: { file: { url: "/img.png", id: "" }, caption: "" } }]);
  assert.equal(isEmptyDocument(withImage, defaultRegistry), false);
  const withText = createDocument([{ id: "a", type: "paragraph", data: { text: "Hello" } }]);
  assert.equal(isEmptyDocument(withText, defaultRegistry), false);
});

test("normalization never shares objects with its input, known or unknown types alike", () => {
  const nested = { deep: { list: [1, 2] } };
  const input = { blocks: [{ id: "k", type: "list", data: { style: "ordered", items: ["a"] } }, { id: "u", type: "widget", data: nested }] };
  const before = JSON.stringify(input);
  const document = normalizeDocument(input, { registry: defaultRegistry });
  (document.blocks[0]?.data.items as string[]).push("b");
  (document.blocks[1]?.data.deep as { list: number[] }).list.push(3);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(document.blocks[1]?.data, { deep: { list: [1, 2, 3] } });
  const withFunction = normalizeDocument({ blocks: [{ id: "f", type: "widget", data: { run: () => 1, keep: "x" } }] });
  assert.deepEqual(withFunction.blocks[0]?.data, { keep: "x" });
});

test("malformed blocks and large documents are handled", () => {
  const document = normalizeDocument({ blocks: [{ id: 42, type: "paragraph", data: ["not", "an", "object"] }, { id: "ok", type: "paragraph", data: null }] }, { registry: defaultRegistry, generateId: ids() });
  assert.deepEqual(document.blocks.map((block) => block.data), [{ text: "" }, { text: "" }]);
  assert.equal(document.blocks[0]?.id, "id-1");
  const many = Array.from({ length: 20_000 }, (_, index) => ({ type: "paragraph", data: { text: `p${index}` } }));
  const large = parseDocument({ blocks: many }, { registry: defaultRegistry });
  assert.equal(large.blocks.length, 20_000);
  assert.equal(new Set(large.blocks.map((block) => block.id)).size, 20_000);
  assert.equal(parseDocument(JSON.stringify({ blocks: many })).blocks.length, 20_000);
});

test("an EditorJS export round-trips with its ids, time and version intact", () => {
  const exported = { time: 1_700_000_000_000, version: "2.28.2", blocks: [{ id: "e1", type: "paragraph", data: { text: "Hi" } }, { id: "e2", type: "attaches", data: { file: { url: "https://example.org/a.pdf", name: "a.pdf" } } }] };
  const document = parseDocument(exported, { registry: defaultRegistry });
  assert.deepEqual(JSON.parse(JSON.stringify(document)), exported);
  assert.equal(JSON.stringify(createDocument(document.blocks, { time: exported.time })), JSON.stringify({ time: exported.time, version: ELEA_DOCUMENT_VERSION, blocks: exported.blocks }));
});
