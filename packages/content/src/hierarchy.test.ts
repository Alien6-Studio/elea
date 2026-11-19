import assert from "node:assert/strict";
import { test } from "node:test";
import { annotateHierarchy } from "./hierarchy.js";

const paragraph = (id: string, text: string) => ({ id, type: "paragraph", data: { text } });

test("paragraphs after an introducer ending with a colon are indented", () => {
  const blocks = annotateHierarchy([paragraph("a", "Points :"), paragraph("b", "Detail"), paragraph("c", "Other")]);
  assert.deepEqual(blocks.map((block) => block.meta), [
    { indentLevel: 0, isSubItem: false, isListIntroducer: true },
    { indentLevel: 1, isSubItem: true, isListIntroducer: false },
    { indentLevel: 0, isSubItem: false, isListIntroducer: false },
  ]);
});

test("consecutive list-like paragraphs stay indented", () => {
  const blocks = annotateHierarchy([paragraph("a", "1. First"), paragraph("b", "2. Second"), paragraph("c", "- Dash"), paragraph("d", "plain")]);
  assert.deepEqual(blocks.map((block) => block.meta.indentLevel), [0, 1, 1, 0]);
});

test("non paragraph blocks and missing text never indent", () => {
  const blocks = annotateHierarchy([
    { id: "a", type: "header", data: { text: "Title:" } },
    { id: "b", type: "list", data: { items: ["<li>x</li>"] } },
    paragraph("c", "<ul><li>item</li></ul>"),
  ]);
  assert.deepEqual(blocks.map((block) => block.meta.isSubItem), [false, false, false]);
  assert.equal(blocks[0]?.meta.isListIntroducer, false);
  assert.deepEqual(annotateHierarchy([]), []);
});
