import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "./ContentEditor.js";
import { dropPositionFor } from "./hooks/useBlockDrag.js";
import { pointAt, resetSelection } from "./test/dom.js";

afterEach(() => {
  cleanup();
  resetSelection();
});

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });

function Harness({ virtual = false }: { virtual?: boolean }) {
  const [blocks, setBlocks] = useState<EleaBlock[]>([paragraph("a", "A"), paragraph("b", "B"), paragraph("c", "C"), paragraph("d", "D")]);
  return (
    <>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} enableVirtualization={virtual} historyGroupWithinMs={0} />
      <pre data-testid="order">{blocks.map((block) => block.id).join("")}</pre>
    </>
  );
}

const order = () => screen.getByTestId("order").textContent;
const grip = (id: string) => document.querySelector(`[data-elea-block-id="${id}"] .elea-block-editor__grip`) as HTMLElement;
const slot = (id: string) => document.querySelector(`[data-elea-block-slot="${id}"]`) as HTMLElement;
const blockRoot = (id: string) => document.querySelector(`.elea-block-editor[data-elea-block-id="${id}"]`) as HTMLElement;
/** jsdom has no DragEvent: the pointer position is set on a plain event by hand. */
const dragOverAt = (target: HTMLElement, data: unknown, clientY: number) => {
  const event = createEvent.dragOver(target, { dataTransfer: data } as never);
  Object.defineProperty(event, "clientY", { value: clientY });
  fireEvent(target, event);
};
const dropAt = (target: HTMLElement, data: unknown, clientY: number) => {
  const event = createEvent.drop(target, { dataTransfer: data } as never);
  Object.defineProperty(event, "clientY", { value: clientY });
  fireEvent(target, event);
};
const transfer = () => {
  const store = new Map<string, string>();
  return { setData: (type: string, value: string) => store.set(type, value), getData: (type: string) => store.get(type) ?? "", effectAllowed: "", dropEffect: "", store };
};

test("dropPositionFor splits a slot at its middle", () => {
  assert.equal(dropPositionFor(10, { top: 0, height: 40 }), "before");
  assert.equal(dropPositionFor(30, { top: 0, height: 40 }), "after");
  assert.equal(dropPositionFor(20, { top: 0, height: 40 }), "after");
});

test("dragging a block by its grip and dropping it on another slot moves it, before or after", () => {
  render(<Harness />);
  const data = transfer();
  fireEvent.dragStart(grip("a"), { dataTransfer: data });
  assert.equal(data.store.get("application/x-elea-block-ids"), "a");
  assert.ok(slot("a").className.includes("elea-block-slot--dragging"));
  dragOverAt(slot("c"), data, 10);
  assert.ok(slot("c").className.includes("elea-block-slot--drop-after"));
  dragOverAt(slot("c"), data, -10);
  assert.ok(slot("c").className.includes("elea-block-slot--drop-before"));
  dragOverAt(slot("a"), data, -10);
  assert.equal(document.querySelector("[class*='elea-block-slot--drop']"), null);
  fireEvent.dragLeave(slot("a"));
  dragOverAt(slot("c"), data, 10);
  dropAt(slot("c"), data, 10);
  assert.equal(order(), "bcad");
  assert.equal(document.querySelector(".elea-block-slot--dragging"), null);
  fireEvent.dragStart(grip("d"), { dataTransfer: transfer() });
  dropAt(slot("b"), data, -10);
  assert.equal(order(), "dbca");
  fireEvent.dragStart(grip("d"), { dataTransfer: transfer() });
  fireEvent.dragEnd(grip("d"));
  dropAt(slot("b"), data, -10);
  assert.equal(order(), "dbca");
  dragOverAt(slot("b"), data, -10);
  assert.equal(document.querySelector("[class*='elea-block-slot--drop']"), null);
});

test("dragging a selected block moves the whole selection, and the keyboard shifts blocks", () => {
  render(<Harness />);
  fireEvent.mouseDown(blockRoot("a"), { button: 0, clientX: 10, clientY: 10 });
  pointAt(blockRoot("b"));
  fireEvent.mouseMove(document, { clientX: 60, clientY: 60, buttons: 1 });
  fireEvent.mouseUp(document);
  const data = transfer();
  fireEvent.dragStart(grip("b"), { dataTransfer: data });
  assert.equal(data.store.get("application/x-elea-block-ids"), "a,b");
  dropAt(slot("d"), data, 10);
  assert.equal(order(), "cdab");

  const root = document.querySelector(".elea-content-editor") as HTMLElement;
  fireEvent.keyDown(root, { key: "ArrowUp", ctrlKey: true, shiftKey: true });
  assert.equal(order(), "cabd");
  fireEvent.keyDown(root, { key: "ArrowUp", ctrlKey: true, shiftKey: true });
  assert.equal(order(), "abcd");
  fireEvent.keyDown(root, { key: "ArrowUp", ctrlKey: true, shiftKey: true });
  assert.equal(order(), "abcd");
  fireEvent.keyDown(root, { key: "Escape" });
  const third = screen.getAllByRole("textbox", { name: en.editor.startWriting })[2] as HTMLElement;
  fireEvent.focus(third);
  fireEvent.keyDown(third, { key: "ArrowDown", metaKey: true, shiftKey: true });
  assert.equal(order(), "abdc");
  fireEvent.keyDown(third, { key: "ArrowDown", metaKey: true, shiftKey: true });
  assert.equal(order(), "abdc");
  fireEvent.keyDown(third, { key: "ArrowUp", metaKey: true, shiftKey: true });
  assert.equal(order(), "abcd");
});

test("the virtualized list carries the same drag wiring", () => {
  render(<Harness virtual />);
  const data = transfer();
  fireEvent.dragStart(grip("b"), { dataTransfer: data });
  dragOverAt(slot("d"), data, 10);
  assert.ok(slot("d").className.includes("elea-block-slot--drop-after"));
  dropAt(slot("d"), data, 10);
  assert.equal(order(), "acdb");
  const handle = grip("a");
  assert.equal(handle.draggable, true);
  assert.equal(handle.hasAttribute("aria-label"), false);
  assert.equal(handle.textContent, en.actions.moveBlock);
});
