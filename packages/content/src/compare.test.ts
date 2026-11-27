import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultRegistry } from "./blocks/builtin.js";
import { compareBlocks, compareHtml } from "./compare.js";

const ins = (html: string) => `<ins class="elea-change elea-change--added">${html}</ins>`;
const del = (html: string) => `<del class="elea-change elea-change--removed">${html}</del>`;
const block = (id: string, type: string, data: Record<string, unknown>) => ({ id, type, data });

test("compareHtml marks the words that came and went, and leaves the rest alone", () => {
  assert.equal(compareHtml("same text", "same text"), "same text");
  assert.equal(compareHtml("The quick brown fox", "The slow brown fox jumps"), `The ${del("quick")}${ins("slow")} brown fox${ins(" jumps")}`);
  assert.equal(compareHtml("", "new"), ins("new"));
  assert.equal(compareHtml("old", ""), del("old"));
  assert.equal(compareHtml("fish &amp; chips", "fish &amp; peas"), `fish &amp; ${del("chips")}${ins("peas")}`);
  assert.equal(compareHtml("l’été arrive", "l’hiver arrive"), `${del("l’été")}${ins("l’hiver")} arrive`);
});

test("compareHtml keeps the formatting of each version", () => {
  assert.equal(
    compareHtml("<p>A <strong>bold</strong> claim</p>", "<p>A <strong>bold</strong> and <em>fair</em> claim</p>"),
    `<p>A <strong>bold</strong> ${ins("and ")}<em>${ins("fair")}</em>${ins(" ")}claim</p>`,
  );
  // A word whose formatting changed is removed as it was and added as it is
  assert.equal(compareHtml("a plain word", "a <strong>plain</strong> word"), `a ${del("plain")}<strong>${ins("plain")}</strong> word`);
  assert.equal(compareHtml('see <a href="/a">here</a>', 'see <a href="/b">here</a>'), `see <a href="/a">${del("here")}</a><a href="/b">${ins("here")}</a>`);
  assert.equal(compareHtml("one<br>two", "one<br/>two<br>three"), `one${del("<br>")}${ins("<br/>")}two${ins("<br>three")}`);
});

test("compareHtml shows removed words in their paragraph, and a removed paragraph on its own", () => {
  assert.equal(compareHtml("<p>Quick brown fox</p>", "<p>brown fox</p>"), `<p>${del("Quick ")}brown fox</p>`);
  assert.equal(compareHtml("<p>one</p><p>two</p>", "<p>one</p>"), `<p>one</p><p>${del("two")}</p>`);
  assert.equal(compareHtml("<p>one</p>", "<p>one</p><p>two</p>"), `<p>one</p><p>${ins("two")}</p>`);
});

test("compareHtml reads malformed markup as text instead of failing", () => {
  assert.equal(compareHtml("a < b", "a < c"), `a &lt; ${del("b")}${ins("c")}`);
  assert.equal(compareHtml("open <strong", "open"), `open${del(" &lt;strong")}`);
  assert.equal(compareHtml("stray</em> end", "stray</em> end"), "stray end");
  assert.equal(compareHtml("<!-- note -->kept", "kept"), "kept");
});

test("compareBlocks matches blocks by content and merges an edited text block", () => {
  const before = [
    block("1", "header", { text: "Title", level: 2 }),
    block("2", "paragraph", { text: "The proofs arrive on Monday morning." }),
    block("3", "code", { code: "a" }),
    block("4", "paragraph", { text: "Gone entirely now." }),
  ];
  const after = [
    block("x", "header", { text: "Title", level: 2 }),
    block("y", "paragraph", { text: "The proofs arrive on Tuesday morning." }),
    block("z", "code", { code: "b" }),
    block("w", "quote", { text: "Brand new", caption: "me" }),
  ];
  const changes = compareBlocks(before, after, { registry: defaultRegistry });
  assert.deepEqual(changes.map(({ change, block: { id } }) => [change, id]), [["same", "x"], ["changed", "y"], ["removed", "3"], ["removed", "4"], ["added", "z"], ["added", "w"]]);
  assert.equal(changes[1]?.block.data.text, `The proofs arrive on ${del("Monday")}${ins("Tuesday")} morning.`);
  assert.equal(changes[1]?.previous?.id, "2");
  assert.equal(changes[0]?.previous, undefined);
  assert.deepEqual(compareBlocks([], []), []);
  assert.deepEqual(compareBlocks(before, before).map(({ change }) => change), ["same", "same", "same", "same"]);
});

test("compareBlocks pairs each removed block with the first later version of it", () => {
  const before = [block("1", "paragraph", { text: "Alpha beta gamma delta" }), block("2", "paragraph", { text: "One two three four" })];
  const after = [block("a", "paragraph", { text: "Entirely fresh words here" }), block("b", "paragraph", { text: "Alpha beta gamma epsilon" }), block("c", "header", { text: "One two three four", level: 2 })];
  assert.deepEqual(compareBlocks(before, after).map(({ change, block: { id } }) => [change, id]), [["added", "a"], ["changed", "b"], ["removed", "2"], ["added", "c"]]);
});

test("compareBlocks compares the items of a list, nested ones included", () => {
  const before = [block("1", "list", { style: "unordered", items: ["Read the proofs twice", "Send them back", { content: "Check the plates", items: ["Front", "Back"] }] })];
  const after = [block("2", "list", { style: "unordered", items: ["Read the proofs once", { content: "Check the plates", items: ["Front", "Spine"] }, "Sign the order"] })];
  const [change] = compareBlocks(before, after);
  assert.equal(change?.change, "changed");
  assert.deepEqual(change?.block.data.items, [
    `Read the proofs ${del("twice")}${ins("once")}`,
    del("Send them back"),
    { content: "Check the plates", items: ["Front", del("Back"), ins("Spine")] },
    ins("Sign the order"),
  ]);
  const nested = compareBlocks(
    [block("1", "nestedlist", { items: [{ content: "Kept as it is", items: ["a"] }, { content: "Dropped with its children", items: ["b"] }] })],
    [block("2", "nestedlist", { items: [{ content: "Kept as it is", items: ["a"] }] })],
  );
  assert.deepEqual(nested[0]?.block.data.items, [{ content: "Kept as it is", items: ["a"] }, { content: del("Dropped with its children"), items: [del("b")] }]);
});

test("compareBlocks reports very long differing sequences as replaced", () => {
  const many = (prefix: string) => Array.from({ length: 2_100 }, (_, index) => block(`${prefix}${index}`, "code", { code: `${prefix}${index}` }));
  const changes = compareBlocks(many("a"), many("b"));
  assert.equal(changes.length, 4_200);
  assert.equal(changes[0]?.change, "removed");
  assert.equal(changes.at(-1)?.change, "added");
});
