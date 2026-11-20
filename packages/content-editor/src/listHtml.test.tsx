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
