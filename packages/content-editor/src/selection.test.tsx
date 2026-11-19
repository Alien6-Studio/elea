import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "./ContentEditor.js";
import { BLOCKS_CLIPBOARD_TYPE, blockRun, neighbourId, readBlocksFromClipboard } from "./selection.js";
import { pointAt, resetSelection, selectText } from "./test/dom.js";

afterEach(() => {
  cleanup();
  resetSelection();
});

test("blockRun and neighbourId follow the document order", () => {
  const order = ["a", "b", "c", "d"];
  assert.deepEqual(blockRun(order, "b", "d"), ["b", "c", "d"]);
  assert.deepEqual(blockRun(order, "d", "b"), ["b", "c", "d"]);
  assert.deepEqual(blockRun(order, "a", "a"), ["a"]);
  assert.deepEqual(blockRun(order, "x", "a"), []);
  assert.equal(neighbourId(order, "a", -1), "a");
  assert.equal(neighbourId(order, "a", 1), "b");
  assert.equal(neighbourId(order, "d", 1), "d");
  assert.equal(neighbourId(order, "x", 1), "x");
  assert.equal(readBlocksFromClipboard({ getData: () => "" }), null);
  assert.equal(readBlocksFromClipboard({ getData: () => "{not json" }), null);
  assert.equal(readBlocksFromClipboard({ getData: () => "[1, {\"data\": {}}]" }), null);
  assert.deepEqual(readBlocksFromClipboard({ getData: () => JSON.stringify([{ type: "paragraph", data: { text: "x" } }]) }), [{ type: "paragraph", data: { text: "x" } }]);
});

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });
const initial = [paragraph("a", "Alpha"), paragraph("b", "Beta"), { id: "c", type: "header", data: { text: "Gamma", level: 2 } } as EleaBlock, paragraph("d", "Delta")];

function Harness() {
  const [blocks, setBlocks] = useState<EleaBlock[]>(initial);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} enableVirtualization={false} onSelectionChange={(selection) => setSelected(selection.ids)} renderSelectionActions={({ ids }) => <button type="button">custom {ids.length}</button>} />
      <pre data-testid="blocks">{JSON.stringify(blocks.map((block) => block.id))}</pre>
      <pre data-testid="selected">{JSON.stringify(selected)}</pre>
    </>
  );
}

const ids = () => JSON.parse(screen.getByTestId("blocks").textContent ?? "[]") as string[];
const selected = () => JSON.parse(screen.getByTestId("selected").textContent ?? "[]") as string[];
const blockRoot = (id: string) => document.querySelector(`.elea-block-editor[data-elea-block-id="${id}"]`) as HTMLElement;
/** A drag with the mouse from one block to another, followed on the document as the browser reports it. */
const drag = (from: string, to: string) => {
  fireEvent.mouseDown(blockRoot(from), { button: 0, clientX: 10, clientY: 10 });
  pointAt(blockRoot(to));
  fireEvent.mouseMove(document, { clientX: 60, clientY: 60, buttons: 1 });
  fireEvent.mouseUp(document);
};
const fakeClipboard = () => {
  const store = new Map<string, string>();
  return { setData: (type: string, value: string) => store.set(type, value), getData: (type: string) => store.get(type) ?? "", store };
};

test("a drag across blocks selects the run, the bar reports it, Escape and a click release it", () => {
  render(<Harness />);
  drag("a", "c");
  assert.deepEqual(selected(), ["a", "b", "c"]);
  assert.ok(screen.getByRole("toolbar", { name: "3 blocks selected" }));
  assert.ok(screen.getByRole("button", { name: "custom 3" }));
  assert.ok(blockRoot("b").className.includes("elea-block-editor--selected"));
  assert.equal(blockRoot("d").getAttribute("aria-selected"), null);
  drag("a", "a");
  fireEvent.keyDown(document.querySelector(".elea-content-editor") as HTMLElement, { key: "Escape" });
  assert.deepEqual(selected(), []);
  drag("d", "b");
  assert.deepEqual(selected(), ["b", "c", "d"]);
  fireEvent.mouseDown(blockRoot("a"), { button: 0 });
  fireEvent.mouseUp(blockRoot("a"));
  assert.deepEqual(selected(), []);
  drag("b", "c");
  fireEvent.mouseDown(blockRoot("d"), { button: 0, shiftKey: true });
  assert.deepEqual(selected(), ["b", "c", "d"]);
});

test("Shift with the arrow keys grows the selection from the focused block", () => {
  render(<Harness />);
  const first = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  fireEvent.focus(first);
  const root = document.querySelector(".elea-content-editor") as HTMLElement;
  fireEvent.keyDown(root, { key: "ArrowDown", shiftKey: true });
  assert.deepEqual(selected(), ["a", "b"]);
  fireEvent.keyDown(root, { key: "ArrowDown", shiftKey: true });
  assert.deepEqual(selected(), ["a", "b", "c"]);
  fireEvent.keyDown(root, { key: "ArrowUp", shiftKey: true });
  assert.deepEqual(selected(), ["a", "b"]);
  fireEvent.keyDown(root, { key: "ArrowUp", shiftKey: true });
  assert.deepEqual(selected(), ["a"]);
  fireEvent.keyDown(root, { key: "ArrowUp", shiftKey: true });
  assert.deepEqual(selected(), ["a"]);
});

test("Delete removes the selection, copy and cut write every clipboard flavour, paste replaces it", () => {
  render(<Harness />);
  const root = document.querySelector(".elea-content-editor") as HTMLElement;
  drag("b", "c");
  const clipboard = fakeClipboard();
  fireEvent.copy(root, { clipboardData: clipboard });
  assert.deepEqual(JSON.parse(clipboard.store.get(BLOCKS_CLIPBOARD_TYPE) ?? "[]"), [{ type: "paragraph", data: { text: "Beta" } }, { type: "header", data: { text: "Gamma", level: 2 } }]);
  assert.match(clipboard.store.get("text/html") ?? "", /<h2 class="elea-heading elea-heading--2">Gamma<\/h2>/);
  assert.equal(clipboard.store.get("text/plain"), "Beta\n\nGamma");

  const pasted = fakeClipboard();
  pasted.setData(BLOCKS_CLIPBOARD_TYPE, JSON.stringify([{ type: "quote", data: { text: "Q", caption: "" } }]));
  fireEvent.paste(root, { clipboardData: pasted });
  assert.equal(ids().length, 3);
  assert.equal(blockRoot(ids()[1] as string).getAttribute("data-elea-block-type"), "quote");
  assert.equal(selected().length, 1);

  fireEvent.keyDown(root, { key: "Delete" });
  assert.deepEqual(ids(), ["a", "d"]);
  assert.deepEqual(selected(), []);

  drag("a", "d");
  const cut = fakeClipboard();
  fireEvent.cut(root, { clipboardData: cut });
  assert.equal(cut.store.get("text/plain"), "Alpha\n\nDelta");
  assert.equal(ids().length, 1);
  assert.equal(blockRoot(ids()[0] as string).getAttribute("data-elea-block-type"), "paragraph");
  fireEvent.keyDown(root, { key: "Backspace" });
  assert.equal(ids().length, 1);
});

test("the selection bar buttons copy, cut and delete", async () => {
  render(<Harness />);
  const written: string[] = [];
  Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => { written.push(text); } }, configurable: true });
  drag("a", "b");
  fireEvent.click(screen.getByRole("button", { name: en.selection.copy }));
  await act(async () => {});
  assert.deepEqual(written, ["Alpha\n\nBeta"]);
  assert.equal(ids().length, 4);
  fireEvent.click(screen.getByRole("button", { name: en.selection.cut }));
  await act(async () => {});
  assert.deepEqual(ids(), ["c", "d"]);
  drag("c", "d");
  fireEvent.click(screen.getByRole("button", { name: en.selection.clear }));
  assert.deepEqual(selected(), []);
  drag("c", "d");
  fireEvent.click(screen.getByRole("button", { name: en.selection.delete }));
  assert.equal(ids().length, 1);
  assert.equal(screen.queryByRole("toolbar"), null);
});

test("releasing the mouse outside the editor ends the drag: a later move over blocks selects nothing", () => {
  render(<Harness />);
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 10, clientY: 10 });
  // Released outside: the document sees it, the editor does not
  fireEvent.mouseUp(document.body);
  pointAt(blockRoot("c"));
  fireEvent.mouseMove(document, { clientX: 80, clientY: 300, buttons: 1 });
  assert.deepEqual(selected(), []);
  // A tiny move within the same block is not a drag either
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 10, clientY: 10 });
  pointAt(blockRoot("b"));
  fireEvent.mouseMove(document, { clientX: 11, clientY: 12, buttons: 1 });
  assert.deepEqual(selected(), []);
  fireEvent.mouseMove(document, { clientX: 40, clientY: 90, buttons: 1 });
  assert.deepEqual(selected(), ["a", "b"]);
  // Pointing outside the editor keeps the selection where it was
  pointAt(document.body);
  fireEvent.mouseMove(document, { clientX: 400, clientY: 900, buttons: 1 });
  assert.deepEqual(selected(), ["a", "b"]);
  fireEvent.mouseUp(document);
  // Blocks selected: the caret has left its field for the editor root
  assert.ok(document.activeElement === document.querySelector(".elea-content-editor"));
  // A move reporting no button held (the release was swallowed by a native drag) ends the press
  fireEvent.keyDown(document.querySelector(".elea-content-editor") as HTMLElement, { key: "Escape" });
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 10, clientY: 10 });
  fireEvent.dragStart(blockRoot("a"));
  pointAt(blockRoot("c"));
  fireEvent.mouseMove(document, { clientX: 90, clientY: 200, buttons: 1 });
  assert.deepEqual(selected(), []);
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 10, clientY: 10 });
  fireEvent.mouseMove(document, { clientX: 90, clientY: 200, buttons: 0 });
  assert.deepEqual(selected(), []);
});

test("Shift+arrows extend the text while a line remains, then the blocks; Shift+click runs from the focused block", () => {
  render(<Harness />);
  const header = screen.getByRole("textbox", { name: en.editor.headerPlaceholder }) as HTMLTextAreaElement;
  header.focus();
  fireEvent.focus(header);
  // A heading has one line: Shift+Down takes the blocks and the caret leaves the field
  header.setSelectionRange(0, 0);
  fireEvent.keyDown(header, { key: "ArrowDown", shiftKey: true });
  assert.deepEqual(selected(), ["c", "d"]);
  assert.ok(document.activeElement !== header);
  fireEvent.keyDown(document.querySelector(".elea-content-editor") as HTMLElement, { key: "Escape" });
  assert.deepEqual(selected(), []);
  // Shift+click with a focused block and no selection runs from that block
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  fireEvent.mouseDown(blockRoot("c"), { button: 0, shiftKey: true, clientX: 10, clientY: 10 });
  assert.deepEqual(selected(), ["a", "b", "c"]);
});

test("Ctrl+A takes the block's text first, then every block; typing over blocks replaces them", () => {
  render(<Harness />);
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  // Nothing selected in the field yet: the browser selects its text, the blocks stay
  fireEvent.keyDown(alpha, { key: "a", ctrlKey: true });
  assert.deepEqual(selected(), []);
  // The text already covers the field: the second Ctrl+A widens to the document
  selectText(alpha, 0, 5);
  fireEvent.keyDown(alpha, { key: "a", ctrlKey: true });
  assert.deepEqual(selected(), ["a", "b", "c", "d"]);
  const root = document.querySelector(".elea-content-editor") as HTMLElement;
  // A plain arrow releases the blocks and puts the caret at the matching edge
  fireEvent.keyDown(root, { key: "ArrowDown" });
  assert.deepEqual(selected(), []);
  // Typing over a selection replaces it with a paragraph holding the key
  drag("b", "d");
  assert.deepEqual(selected(), ["b", "c", "d"]);
  fireEvent.keyDown(root, { key: "x" });
  assert.deepEqual(selected(), []);
  assert.equal(ids().length, 2);
  const texts = () => [...document.querySelectorAll("[data-elea-block-id] [contenteditable]")].map((node) => node.textContent);
  assert.deepEqual(texts(), ["Alpha", "x"]);
  // Enter over a selection leaves one empty paragraph; a modifier key does nothing
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 0, clientY: 0 });
  pointAt(blockRoot(ids()[1] as string));
  fireEvent.mouseMove(document, { clientX: 50, clientY: 50, buttons: 1 });
  fireEvent.mouseUp(document);
  assert.equal(selected().length, 2);
  fireEvent.keyDown(root, { key: "s", ctrlKey: true });
  assert.equal(selected().length, 2);
  fireEvent.keyDown(root, { key: "Enter" });
  assert.deepEqual(selected(), []);
  assert.deepEqual(texts(), [""]);
});
