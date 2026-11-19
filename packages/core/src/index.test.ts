import assert from "node:assert/strict";
import { test } from "node:test";
import { ELEA_DOCUMENT_VERSION, createDocument, isDocument } from "./index.js";

test("createDocument wraps copied blocks with time and version", () => {
  const block = { id: "a", type: "paragraph", data: { text: "Hello" } };
  const document = createDocument([block], { time: 42 });
  assert.equal(document.time, 42);
  assert.equal(document.version, ELEA_DOCUMENT_VERSION);
  assert.deepEqual(document.blocks, [block]);
  assert.notEqual(document.blocks[0], block);
});

test("createDocument defaults time to now", () => {
  const before = Date.now();
  const document = createDocument([]);
  assert.ok(document.time >= before);
});

test("isDocument accepts EditorJS-shaped values and rejects the rest", () => {
  assert.equal(isDocument({ blocks: [{ type: "paragraph", data: {} }] }), true);
  assert.equal(isDocument({ blocks: [] }), true);
  assert.equal(isDocument({ blocks: [{ data: {} }] }), false);
  assert.equal(isDocument({ blocks: "no" }), false);
  assert.equal(isDocument(null), false);
  assert.equal(isDocument("{}"), false);
});
