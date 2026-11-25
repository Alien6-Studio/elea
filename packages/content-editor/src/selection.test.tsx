import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "./ContentEditor.js";
import { BLOCKS_CLIPBOARD_TYPE, blockRun, neighbourId, readBlocksFromClipboard } from "./selection.js";
import { placeCaret, pointAt, resetSelection, selectText } from "./test/dom.js";

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
  assert.equal(readBlocksFromClipboard({ getData: () => '[{"type":"paragraph","data":{"text":"valid"}},null]' }), null);
  assert.equal(readBlocksFromClipboard({ getData: () => '[{"type":"list","data":"invalid"}]' }), null);
  assert.deepEqual(readBlocksFromClipboard({ getData: () => JSON.stringify([{ type: "paragraph", data: { text: "x" } }]) }), [{ type: "paragraph", data: { text: "x" } }]);
});

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });
const initial = [paragraph("a", "Alpha"), paragraph("b", "Beta"), { id: "c", type: "header", data: { text: "Gamma", level: 2 } } as EleaBlock, paragraph("d", "Delta")];

function Harness() {
  const [blocks, setBlocks] = useState<EleaBlock[]>(initial);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <ContentEditor blocks={blocks} onBlocksChange={next => setBlocks([...next])} enableVirtualization={false} onSelectionChange={(selection) => setSelected(selection.ids)} renderSelectionActions={({ ids }) => <button type="button">custom {ids.length}</button>} />
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

test("modifier clicks toggle individual blocks in document order and pasting a copied selection duplicates it", () => {
  render(<Harness />);
  const root = document.querySelector<HTMLElement>(".elea-content-editor")!;
  fireEvent.mouseDown(blockRoot("c"), { button: 0, ctrlKey: true });
  fireEvent.mouseDown(blockRoot("a"), { button: 0, metaKey: true });
  fireEvent.mouseDown(blockRoot("d"), { button: 0, metaKey: true });
  fireEvent.mouseDown(blockRoot("d"), { button: 0, metaKey: true });
  assert.deepEqual(selected(), ["a", "c"]);
  const clipboard = fakeClipboard();
  // A document without a DOM range may receive the native copy and paste on the body.
  assert.equal(document.activeElement, root);
  fireEvent.copy(document.body, { clipboardData: clipboard });
  const payload = JSON.parse(clipboard.getData(BLOCKS_CLIPBOARD_TYPE)) as EleaBlock[];
  assert.deepEqual(payload.map(block => block.data.text), ["Alpha", "Gamma"]);
  clipboard.store.delete(BLOCKS_CLIPBOARD_TYPE);
  clipboard.setData("text/html", `<section>${clipboard.getData("text/html")}</section>`);
  fireEvent.paste(document.body, { clipboardData: clipboard });
  const copied = selected();
  assert.deepEqual(ids(), ["a", "b", "c", ...copied, "d"]);
  assert.equal(blockRoot(copied[1]!).dataset.eleaBlockType, "header");
  fireEvent.paste(root, { clipboardData: clipboard });
  assert.deepEqual(ids(), ["a", "b", "c", ...copied, ...selected(), "d"]);
  const other = fakeClipboard();
  other.setData(BLOCKS_CLIPBOARD_TYPE, JSON.stringify([{ type: "delimiter", data: {} }]));
  fireEvent.paste(root, { clipboardData: other });
  assert.deepEqual(ids(), ["a", "b", "c", ...copied, ...selected(), "d"]);
  assert.equal(selected().length, 1);
  assert.equal(blockRoot(selected()[0]!).dataset.eleaBlockType, "delimiter");
});

test("a copied selection can be pasted after a focused block or at the add button", () => {
  render(<Harness />);
  const root = document.querySelector<HTMLElement>(".elea-content-editor")!;
  const clipboard = fakeClipboard();
  drag("a", "b");
  fireEvent.copy(root, { clipboardData: clipboard });
  const header = screen.getByRole("textbox", { name: en.editor.headerPlaceholder });
  fireEvent.mouseDown(header);
  fireEvent.focus(header);
  fireEvent.paste(header, { clipboardData: clipboard });
  const firstCopy = selected();
  assert.deepEqual(ids(), ["a", "b", "c", ...firstCopy, "d"]);
  assert.equal(header.textContent, "Gamma");
  const add = document.querySelector<HTMLButtonElement>(".elea-content-editor__add button")!;
  fireEvent.mouseDown(add);
  fireEvent.focus(add);
  fireEvent.paste(add, { clipboardData: clipboard });
  assert.deepEqual(ids(), ["a", "b", "c", ...firstCopy, "d", ...selected()]);
  assert.equal(selected().length, 2);
});

test("a document edit after copying keeps paste in replacement mode", () => {
  let result: EleaBlock[] = [];
  const host = (blocks: EleaBlock[]) => <ContentEditor blocks={blocks} onBlocksChange={next => { result = next; }} />;
  const view = render(host(initial));
  const root = document.querySelector<HTMLElement>(".elea-content-editor")!;
  drag("a", "b");
  const clipboard = fakeClipboard();
  fireEvent.copy(root, { clipboardData: clipboard });
  view.rerender(host([...initial.slice(0, 3), paragraph("d", "Updated")]));
  fireEvent.paste(root, { clipboardData: clipboard });
  assert.deepEqual(result.map(block => block.data.text), ["Alpha", "Beta", "Gamma", "Updated"]);
  assert.notEqual(result[0]?.id, "a");
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
  assert.deepEqual(ids(), ["a", "b", "c", "d"]);
  drag("c", "d");
  fireEvent.click(screen.getByRole("button", { name: en.selection.clear }));
  assert.deepEqual(selected(), []);
  drag("c", "d");
  fireEvent.click(screen.getByRole("button", { name: en.selection.delete }));
  assert.deepEqual(ids(), ["a", "b"]);
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
  fireEvent.dragStart(blockRoot("a").querySelector(".elea-block-editor__grip")!);
  pointAt(blockRoot("c"));
  fireEvent.mouseMove(document, { clientX: 90, clientY: 200, buttons: 1 });
  assert.deepEqual(selected(), []);
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 10, clientY: 10 });
  fireEvent.mouseMove(document, { clientX: 90, clientY: 200, buttons: 0 });
  assert.deepEqual(selected(), []);
});

test("Shift+arrows extend the text while a line remains, then the blocks; Shift+click runs from the focused block", () => {
  render(<Harness />);
  const header = screen.getByRole("textbox", { name: en.editor.headerPlaceholder });
  header.focus();
  fireEvent.focus(header);
  // A heading has one line: Shift+Down takes the blocks and the caret leaves the field
  placeCaret(header.firstChild as Node, 0);
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

test("a copied run replaces a passage in another editor in one change and undo restores it", () => {
  const source = [
    { id: "source-image", type: "image", tunes: { alignment: "center" }, data: { file: { fileId: "asset", width: 640 }, caption: "Poster" } },
    { id: "source-list", type: "list", data: { style: "ordered", items: [{ content: "One", items: ["Nested"] }] } },
    { id: "source-extension", type: "diagram", data: { points: [[2, 4]] } },
  ];
  const destination = [paragraph("dest", "Replace this now")];
  const updates: EleaBlock[][] = [];
  function Target() {
    const [blocks, setBlocks] = useState<EleaBlock[]>([paragraph("previous", "Previous document")]);
    return <>
      <button onClick={() => setBlocks(destination)}>Load destination</button>
      <ContentEditor blocks={blocks} onBlocksChange={(next) => { updates.push(next); setBlocks(next); }} historyGroupWithinMs={10_000} />
    </>;
  }
  const { container } = render(<>
    <ContentEditor blocks={source} onBlocksChange={() => {}} />
    <Target />
  </>);
  const [from, to] = container.querySelectorAll<HTMLElement>(".elea-content-editor");
  drag("source-image", "source-extension");
  const clipboard = fakeClipboard();
  fireEvent.copy(from!, { clipboardData: clipboard });
  fireEvent.click(screen.getByRole("button", { name: "Load destination" }));
  const field = to!.querySelector<HTMLElement>("[contenteditable=true]")!;
  selectText(field, 8, 12);
  fireEvent.paste(field, { clipboardData: clipboard });
  assert.equal(updates.length, 1);
  const next = updates[0]!;
  assert.equal(next[0]?.data.text, "Replace ");
  assert.equal(next.at(-1)?.data.text, " now");
  const content = (blocks: EleaBlock[]) => blocks.map(({ id: _id, ...block }) => block);
  assert.deepEqual(content(next.slice(1, -1)), content(source));
  assert.equal(new Set(next.map(block => block.id)).size, next.length);
  assert.ok(next.every(block => !source.some(original => original.id === block.id)));
  fireEvent.keyDown(to!, { key: "z", ctrlKey: true });
  assert.deepEqual(updates.at(-1), destination);
  fireEvent.keyDown(to!, { key: "z", ctrlKey: true });
  assert.equal(updates.at(-1)?.[0]?.id, "previous");
});

test("pasting a block between formatted words preserves their emphasis and omits empty edge fragments", () => {
  function Target() {
    const [blocks, setBlocks] = useState([paragraph("dest", "<strong>First</strong><em>Second</em>")]);
    return <><ContentEditor blocks={blocks} onBlocksChange={setBlocks} /><output>{JSON.stringify(blocks)}</output></>;
  }
  const { container } = render(<Target />);
  const clipboard = fakeClipboard();
  clipboard.setData(BLOCKS_CLIPBOARD_TYPE, JSON.stringify([{ type: "delimiter", data: {} }]));
  const field = container.querySelector<HTMLElement>("[contenteditable]")!;
  selectText(field.querySelector("strong")!, 2, 3);
  fireEvent.paste(field, { clipboardData: clipboard });
  const read = () => JSON.parse(container.querySelector("output")!.textContent!) as EleaBlock[];
  assert.deepEqual(read().map(block => block.data.text), ["<strong>Fi</strong>", undefined, "<strong>st</strong><em>Second</em>"]);
  fireEvent.keyDown(container.querySelector(".elea-content-editor")!, { key: "z", ctrlKey: true });
  selectText(field.querySelector("strong")!, 0, 0);
  fireEvent.paste(field, { clipboardData: clipboard });
  assert.deepEqual(read().map(block => block.data.text), [undefined, "<strong>First</strong><em>Second</em>"]);
});

test("a clipboard that rejects a toolbar cut leaves the selected blocks in place", async () => {
  render(<Harness />);
  Object.defineProperty(globalThis, "ClipboardItem", { configurable: true, value: class {} });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
    write: async () => { throw new Error("Permission denied"); },
  } });
  // Some hosts dispatch copy even when the native command ultimately fails.
  Object.defineProperty(document, "execCommand", { configurable: true, value: () => {
    fireEvent.copy(document.activeElement!, { clipboardData: fakeClipboard() });
    return false;
  } });
  drag("a", "c");
  try {
    fireEvent.click(screen.getByRole("button", { name: en.selection.cut }));
    await act(async () => {});
    assert.deepEqual(ids(), ["a", "b", "c", "d"]);
    assert.deepEqual(selected(), ["a", "b", "c"]);
  } finally {
    Reflect.deleteProperty(document, "execCommand");
    Reflect.deleteProperty(globalThis, "ClipboardItem");
  }
});

test("the async HTML clipboard carries every block before a toolbar cut removes its source", async () => {
  render(<Harness />);
  const clipboard = fakeClipboard();
  class Item { constructor(readonly formats: Record<string, Blob>) {} }
  Object.defineProperty(globalThis, "ClipboardItem", { configurable: true, value: Item });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
    write: async ([item]: Item[]) => {
      for (const [type, blob] of Object.entries(item!.formats)) clipboard.setData(type, await blob.text());
    },
  } });
  try {
    drag("b", "c");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: en.selection.cut })); });
    assert.deepEqual(ids(), ["a", "d"]);
    assert.deepEqual(readBlocksFromClipboard(clipboard), initial.slice(1, 3).map(({ id: _id, ...block }) => block));
    assert.match(clipboard.getData("text/html"), /<h2[^>]*>Gamma<\/h2>/);
    assert.equal(clipboard.getData("text/plain"), "Beta\n\nGamma");
  } finally {
    Reflect.deleteProperty(globalThis, "ClipboardItem");
  }
});

test("a toolbar cut writes the native clipboard when the browser dispatches copy on the body", () => {
  render(<Harness />);
  const clipboard = fakeClipboard();
  Object.defineProperty(document, "execCommand", { configurable: true, value: () => {
    fireEvent.copy(document.body, { clipboardData: clipboard });
    return true;
  } });
  try {
    drag("b", "c");
    fireEvent.click(screen.getByRole("button", { name: en.selection.cut }));
    assert.deepEqual(ids(), ["a", "d"]);
    assert.deepEqual(readBlocksFromClipboard(clipboard), initial.slice(1, 3).map(({ id: _id, ...block }) => block));
    // The temporary handler has been removed; another copy from the page is native again.
    assert.equal(fireEvent.copy(document.body, { clipboardData: fakeClipboard() }), true);
  } finally {
    Reflect.deleteProperty(document, "execCommand");
  }
});

test("a pending clipboard permission cannot apply a cut after the editor unmounts", async () => {
  const updates: EleaBlock[][] = [];
  const { unmount } = render(<ContentEditor blocks={initial} onBlocksChange={next => updates.push(next)} />);
  let grant!: () => void;
  const permission = new Promise<void>(resolve => { grant = resolve; });
  Object.defineProperty(globalThis, "ClipboardItem", { configurable: true, value: class {} });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { write: () => permission } });
  try {
    drag("a", "b");
    fireEvent.click(screen.getByRole("button", { name: en.selection.cut }));
    unmount();
    await act(async () => grant());
    assert.deepEqual(updates, []);
  } finally {
    Reflect.deleteProperty(globalThis, "ClipboardItem");
  }
});

test("moving keyboard focus from selected blocks to a text field restores native typing and copying", () => {
  const updates: EleaBlock[][] = [];
  render(<ContentEditor blocks={initial} onBlocksChange={blocks => updates.push(blocks)} title="Title" onTitleChange={() => {}} />);
  const title = screen.getByRole("textbox", { name: en.editor.titlePlaceholder });
  for (const field of [title, blockRoot("a").querySelector<HTMLElement>("[contenteditable]")!]) {
    drag("a", "b");
    act(() => field.focus());
    assert.equal(screen.queryByRole("toolbar", { name: "2 blocks selected" }), null);
    assert.equal(fireEvent.keyDown(field, { key: "x" }), true);
    assert.equal(fireEvent.copy(field, { clipboardData: fakeClipboard() }), true);
    assert.deepEqual(updates, []);
  }
});

test("Enter and Space on a selection action keep their native button behavior", () => {
  render(<Harness />);
  drag("a", "b");
  const button = screen.getByRole("button", { name: en.selection.copy });
  act(() => button.focus());
  for (const key of ["Enter", " "]) assert.equal(fireEvent.keyDown(button, { key }), true);
  assert.deepEqual(ids(), ["a", "b", "c", "d"]);
  assert.deepEqual(selected(), ["a", "b"]);
});
