import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "./ContentEditor.js";
import { resetSelection, selectText } from "./test/dom.js";

afterEach(() => {
  cleanup();
  resetSelection();
});

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });

function Harness({ mode, virtualize = false }: { mode: "default" | "toolbar" | "classic"; virtualize?: boolean }) {
  const [blocks, setBlocks] = useState<EleaBlock[]>([paragraph("a", "Alpha"), { id: "h", type: "header", data: { text: "Title", level: 2 } }, paragraph("b", "Beta")]);
  return (
    <>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} enableVirtualization={virtualize} virtualizationThreshold={1} mode={mode} historyGroupWithinMs={0} />
      <pre data-testid="blocks">{JSON.stringify(blocks.map((block) => [block.id, block.type, block.data.text]))}</pre>
    </>
  );
}
const state = () => JSON.parse(screen.getByTestId("blocks").textContent ?? "[]") as [string, string, string][];
const blockRoot = (id: string) => document.querySelector(`.elea-block-editor[data-elea-block-id="${id}"]`) as HTMLElement;

test("the classic mode shows a fixed bar over a continuous document and nothing around the blocks", async () => {
  render(<Harness mode="classic" />);
  const root = document.querySelector(".elea-content-editor") as HTMLElement;
  assert.ok(root.className.includes("elea-content-editor--classic"));
  assert.equal(document.querySelectorAll(".elea-block-editor__gutter").length, 0);
  assert.equal(document.querySelectorAll(".elea-block-editor__head").length, 0);
  // The document bar: formatting idle until a paragraph has the focus, insertion, history
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  assert.ok(bar);
  assert.ok(bar.querySelector(".elea-doc-toolbar__group--idle"));
  const undo = within(bar).getByRole("button", { name: en.actions.undo }) as HTMLButtonElement;
  assert.equal(undo.disabled, true);
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  assert.equal(bar.querySelector(".elea-doc-toolbar__group--idle"), null);
  // No bubble: the fixed bar formats the focused paragraph
  selectText(alpha, 0, 5);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  assert.equal(document.querySelector("[data-elea-bubble]"), null);
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.bold }));
  assert.equal(alpha.querySelector("strong")?.textContent, "Alpha");
  // Insert from the bar goes after the focused block; the keyboard still moves blocks
  fireEvent.click(within(within(bar).getByRole("group", { name: en.actions.insert })).getByRole("button", { name: en.blockTypes.quote }));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(state().map(([, type]) => type), ["paragraph", "quote", "header", "paragraph"]);
  fireEvent.click(within(bar).getByRole("button", { name: en.actions.undo }));
  assert.equal(state().length, 3);
  fireEvent.click(within(bar).getByRole("button", { name: en.actions.redo }));
  assert.equal(state().length, 4);
  fireEvent.keyDown(alpha, { key: "ArrowDown", ctrlKey: true, shiftKey: true });
  assert.deepEqual(state().map(([id]) => id).slice(0, 2).includes("a"), true);
  fireEvent.blur(alpha, { relatedTarget: document.body });
  assert.ok(bar.querySelector(".elea-doc-toolbar__group--idle"));
});

test("the classic mode also runs through the virtualized list", () => {
  render(<Harness mode="classic" virtualize />);
  assert.ok(document.querySelector(".elea-doc-toolbar"));
  // Beyond the threshold the blocks wait as placeholders
  assert.ok(document.querySelector(".elea-block-slot--placeholder"));
  assert.ok(document.querySelector(".elea-content-editor--classic"));
});

test("the medium mode keeps its margin controls, shows no bar until text is selected, then every format floats", () => {
  render(<Harness mode="default" />);
  assert.equal(document.querySelector(".elea-doc-toolbar"), null);
  assert.equal(document.querySelectorAll(".elea-block-editor__head").length, 0);
  assert.equal(document.querySelectorAll(".elea-block-editor__gutter").length, 3);
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  assert.equal(screen.queryByRole("toolbar"), null);
  selectText(alpha, 0, 5);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  const bubble = document.querySelector("[data-elea-bubble]") as HTMLElement;
  assert.ok(bubble);
  assert.ok(within(bubble).getByRole("button", { name: en.toolbar.h2 }));
  fireEvent.mouseDown(within(bubble).getByRole("button", { name: en.toolbar.bold }));
  assert.equal(alpha.querySelector("strong")?.textContent, "Alpha");
});

test("the toolbar mode keeps the writing surface, fixes a bar above the document and keeps the floating one to the marks", () => {
  render(<Harness mode="toolbar" />);
  assert.ok(document.querySelector(".elea-doc-toolbar"));
  assert.equal(document.querySelectorAll(".elea-block-editor__head").length, 0);
  assert.equal(document.querySelectorAll(".elea-block-editor__gutter").length, 3);
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  assert.ok(bar.querySelector(".elea-doc-toolbar__group--idle"));
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  assert.equal(bar.querySelector(".elea-doc-toolbar__group--idle"), null);
  selectText(alpha, 0, 5);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  const bubble = document.querySelector("[data-elea-bubble]") as HTMLElement;
  assert.equal(within(bubble).queryByRole("button", { name: en.toolbar.h2 }), null);
  assert.ok(within(bubble).getByRole("button", { name: en.toolbar.bold }));
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.h2 }));
  assert.ok(alpha.querySelector("h2"));
});
