import "./test/dom.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanContent, htmlToItems, htmlToList, itemsToHtml, sameItems } from "./listHtml.js";

test("items become nested list markup, the tag flipping at each level, and come back as items", () => {
  const items = ["one", { content: "two <strong>bold</strong>", items: ["deep", { content: "deeper", items: ["deepest"] }] }, ""];
  const html = itemsToHtml(items, "unordered");
  assert.equal(html, "<ul><li>one</li><li>two <strong>bold</strong><ol><li>deep</li><li>deeper<ul><li>deepest</li></ul></li></ol></li><li><br></li></ul>");
  assert.deepEqual(htmlToItems(html), items);
  assert.ok(itemsToHtml(["a"], "ordered").startsWith("<ol>"));
  assert.ok(itemsToHtml([{ content: "a", items: ["b"] }], "ordered").includes("<ul><li>b</li></ul>"));
});

test("markup from the browser is read leniently: stray text, breaks and non-item children are dropped", () => {
  assert.deepEqual(htmlToItems("<p>stray</p><ul><li>a<br></li><li>b<br><br></li><!-- x --><span>no</span></ul>text<ol><li>c</li></ol>"), ["a", "b", "c"]);
  assert.deepEqual(htmlToItems(""), []);
  assert.deepEqual(htmlToItems("<ul><li><br></li></ul>"), [""]);
  assert.equal(cleanContent("x<br/><br>  "), "x");
});

test("sameItems compares values whatever the shape", () => {
  assert.ok(sameItems(["a", { content: "b" }], ["a", "b"]));
  assert.ok(sameItems([{ content: "a", items: ["c"] }], [{ content: "a", items: [{ content: "c" }] }]));
  assert.ok(!sameItems(["a"], ["a", "b"]));
  assert.ok(!sameItems(["a"], ["b"]));
  assert.ok(!sameItems([{ content: "a", items: ["c"] }], [{ content: "a", items: ["d"] }]));
});

test("the field keeps explicit markers at the root and at a nested level", () => {
  const items = ["first", { content: "parent", items: ["child"], childrenMarker: "lower-roman" as const }];
  const markup = itemsToHtml(items, "unordered", "circle");
  assert.match(markup, /^<ul class="elea-list-marker-circle">/);
  assert.match(markup, /<ol class="elea-list-marker-lower-roman">/);
  assert.deepEqual(htmlToList(markup), { style: "unordered", marker: "circle", items });
  assert.equal(sameItems(items, ["first", { content: "parent", items: ["child"] }]), false);
});

test("a nested list whose tag does not alternate gets a marker that keeps its look", () => {
  assert.deepEqual(htmlToItems("<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>"), [
    { content: "a", childrenMarker: "circle", items: [{ content: "b", items: ["c"] }] },
  ]);
  assert.deepEqual(htmlToItems("<ol><li>a<ol><li>b</li></ol></li></ol>"), [{ content: "a", childrenMarker: "lower-alpha", items: ["b"] }]);
  assert.deepEqual(htmlToItems("<ul><li>a<ol><li>b<ol><li>c</li></ol></li></ol></li></ul>"), [
    { content: "a", items: [{ content: "b", childrenMarker: "lower-roman", items: ["c"] }] },
  ]);
});

test("a checklist keeps the state of each task through the field", () => {
  const items = [{ content: "done", meta: { checked: true }, items: [] }, { content: "to do", meta: { checked: false }, items: [{ content: "sub", meta: { checked: true }, items: [] }] }];
  const html = itemsToHtml(items, "checklist");
  assert.equal(html, '<ul class="elea-list-checklist"><li class="elea-list-checked">done</li><li>to do<ul><li class="elea-list-checked">sub</li></ul></li></ul>');
  assert.deepEqual(htmlToList(html), { style: "checklist", items });
  // Plain strings are tasks to do, and a marker stays out
  assert.equal(itemsToHtml(["a"], "checklist", "decimal"), '<ul class="elea-list-checklist"><li>a</li></ul>');
  assert.ok(sameItems(["a"], [{ content: "a", meta: { checked: false } }]));
  assert.ok(!sameItems([{ content: "a", meta: { checked: true } }], [{ content: "a", meta: { checked: false } }]));
});
