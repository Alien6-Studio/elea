import "./test/dom.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { caretOnEdgeLine, fieldFullySelected } from "./caret.js";
import { selectText } from "./test/dom.js";

test("text fields report their edge lines from the value and the caret", () => {
  const area = document.createElement("textarea");
  area.value = "first\nsecond\nthird";
  document.body.append(area);
  area.setSelectionRange(2, 2);
  assert.equal(caretOnEdgeLine(area, -1), true);
  assert.equal(caretOnEdgeLine(area, 1), false);
  area.setSelectionRange(8, 8);
  assert.equal(caretOnEdgeLine(area, -1), false);
  assert.equal(caretOnEdgeLine(area, 1), false);
  area.setSelectionRange(15, 15);
  assert.equal(caretOnEdgeLine(area, 1), true);
  // A selection spanning lines: the moving end decides
  area.setSelectionRange(2, 15);
  assert.equal(caretOnEdgeLine(area, 1), true);
  assert.equal(caretOnEdgeLine(area, -1), true);
  assert.equal(fieldFullySelected(area), false);
  area.setSelectionRange(0, area.value.length);
  assert.equal(fieldFullySelected(area), true);
  area.value = "";
  assert.equal(fieldFullySelected(area), true);
  area.remove();
  // Anything that is not a field counts as an edge and as nothing to widen
  assert.equal(caretOnEdgeLine(null, 1), true);
  assert.equal(fieldFullySelected(null), false);
  assert.equal(fieldFullySelected(document.body), false);
});

test("rich text fields read the selection geometry, empty under jsdom, and whether all the text is selected", () => {
  const editable = document.createElement("div");
  editable.setAttribute("contenteditable", "true");
  editable.textContent = "Hello world";
  document.body.append(editable);
  assert.equal(caretOnEdgeLine(editable, 1), true);
  assert.equal(fieldFullySelected(editable), false);
  selectText(editable, 0, 11);
  assert.equal(fieldFullySelected(editable), true);
  assert.equal(caretOnEdgeLine(editable, -1), true);
  selectText(editable, 0, 5);
  assert.equal(fieldFullySelected(editable), false);
  // Layout present: a caret on the first of two lines has a line below
  const range = globalThis.getSelection()?.getRangeAt(0) as Range;
  range.getBoundingClientRect = () => ({ top: 0, bottom: 20, height: 20, width: 5, left: 0, right: 5, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  editable.getBoundingClientRect = () => ({ top: 0, bottom: 40, height: 40, width: 200, left: 0, right: 200, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  Range.prototype.cloneRange = function cloneRange(this: Range) { return this; };
  assert.equal(caretOnEdgeLine(editable, -1), true);
  assert.equal(caretOnEdgeLine(editable, 1), false);
  editable.textContent = "";
  assert.equal(fieldFullySelected(editable), true);
  editable.remove();
});
