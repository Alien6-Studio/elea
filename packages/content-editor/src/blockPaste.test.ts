import "./test/dom.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { EleaBlock } from "@alien6-studio/elea-content";
import { insertPasted, pasteSite } from "./blockPaste.js";

const para = (id: string, text = id): EleaBlock => ({ id, type: "paragraph", data: { text } });
const ids = (blocks: EleaBlock[]) => blocks.map(block => block.id);

function mount(html: string) {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

test("a paste inside a block lands on that block, and the editor root falls back to the focused one", () => {
  const root = mount('<div data-elea-block-id="b"><div contenteditable="true" id="f">x</div></div>');
  const blocks = [para("a"), para("b")];
  const inside = pasteSite(root.querySelector<HTMLElement>("#f")!, root, blocks, "a");
  assert.equal(inside?.current?.id, "b");
  assert.equal(inside?.open, false);
  assert.equal(inside?.field?.id, "f");
  const onRoot = pasteSite(root, root, blocks, "a");
  assert.equal(onRoot?.current?.id, "a");
  assert.equal(onRoot?.open, true);
  root.remove();
});

test("a paste into a plain input keeps the paste, one into a rich text field goes to the blocks", () => {
  const root = mount('<div data-elea-block-id="a"><input id="i"><div id="h" contenteditable="true"></div></div>');
  const blocks = [para("a")];
  assert.equal(pasteSite(root.querySelector<HTMLElement>("#i")!, root, blocks, null), null);
  assert.ok(pasteSite(root.querySelector<HTMLElement>("#h")!, root, blocks, null));
  assert.equal(pasteSite(document.body, root, blocks, null), null);
  root.remove();
});

test("pasted blocks go at the given index, after the current block, or at the end", () => {
  const blocks = [para("a"), para("b")];
  const created = [para("n")];
  const site = (current: EleaBlock | undefined) => ({ current, open: false, field: null });
  assert.deepEqual(ids(insertPasted(blocks, created, 1, site(undefined))), ["a", "n", "b"]);
  assert.deepEqual(ids(insertPasted(blocks, created, undefined, site(blocks[0]))), ["a", "n", "b"]);
  assert.deepEqual(ids(insertPasted(blocks, created, undefined, site(undefined))), ["a", "b", "n"]);
});

test("pasted blocks replace a lone empty paragraph", () => {
  const blocks = [para("a", "")];
  const next = insertPasted(blocks, [para("n")], undefined, { current: blocks[0], open: true, field: null });
  assert.deepEqual(ids(next), ["n"]);
});
