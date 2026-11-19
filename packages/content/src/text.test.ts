import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultRegistry } from "./blocks/builtin.js";
import { createDocument } from "./document.js";
import { documentExcerpt, documentToText } from "./text.js";

const document = createDocument([
  { id: "1", type: "header", data: { text: "Title", level: 2 } },
  { id: "2", type: "paragraph", data: { text: "<p>First <strong>paragraph</strong>&nbsp;here.</p>" } },
  { id: "3", type: "paragraph", data: { text: "" } },
  { id: "4", type: "list", data: { style: "unordered", items: ["one", "two"] } },
  { id: "5", type: "widget", data: { text: "ignored" } },
  { id: "6", type: "image", data: { file: { url: "/a.png", id: "" }, caption: "A caption" } },
]);

test("documentToText joins the text of known blocks and skips empty ones", () => {
  assert.equal(documentToText(document, defaultRegistry), "Title\n\nFirst paragraph here.\n\none\ntwo\n\nA caption");
  assert.equal(documentToText(document, defaultRegistry, { separator: " | " }), "Title | First paragraph here. | one\ntwo | A caption");
});

test("documentExcerpt gives a single short line", () => {
  assert.equal(documentExcerpt(document, defaultRegistry), "Title First paragraph here. one two A caption");
  assert.equal(documentExcerpt(document, defaultRegistry, 12), "Title First…");
  assert.equal(documentExcerpt(createDocument([]), defaultRegistry), "");
});
