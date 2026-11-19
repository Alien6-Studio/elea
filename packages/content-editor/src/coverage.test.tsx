import "./test/dom.js";
import { resetSelection } from "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "./ContentEditor.js";
import { EMPTY_FORMATS, type RichTextFieldHandle } from "./RichTextField.js";
import { RichTextInput } from "./RichTextInput.js";
import { Toolbar } from "./Toolbar.js";
import { VirtualizedBlockList } from "./VirtualizedBlockList.js";

afterEach(() => {
  cleanup();
  resetSelection();
});

test("every toolbar button drives the matching command of the handle", () => {
  const calls: string[] = [];
  const handle: RichTextFieldHandle = {
    applyInlineFormat: (tag) => calls.push(`inline:${tag}`),
    applyListFormat: (tag) => calls.push(`list:${tag}`),
    applyBlockFormat: (tag) => calls.push(`block:${tag}`),
    openLinkInput: () => calls.push("link"),
    clearFormat: () => calls.push("clear"),
  };
  render(<Toolbar editorRef={{ current: handle }} activeFormats={{ ...EMPTY_FORMATS, bold: true, h2: true }} />);
  for (const name of [en.toolbar.removeFormat, en.toolbar.bold, en.toolbar.italic, en.toolbar.underline, en.toolbar.bulletList, en.toolbar.orderedList, en.toolbar.h1, en.toolbar.h2, en.toolbar.h3, en.toolbar.h4, en.toolbar.h5, en.toolbar.h6, en.toolbar.blockquote, en.toolbar.link]) {
    fireEvent.mouseDown(screen.getByRole("button", { name }));
  }
  assert.deepEqual(calls, ["clear", "inline:strong", "inline:em", "inline:u", "list:ul", "list:ol", "block:h1", "block:h2", "block:h3", "block:h4", "block:h5", "block:h6", "block:blockquote", "link"]);
  assert.equal(screen.getByRole("button", { name: en.toolbar.bold }).getAttribute("aria-pressed"), "true");
  assert.equal(screen.getByRole("button", { name: en.toolbar.italic }).getAttribute("aria-pressed"), "false");
  cleanup();
  render(<Toolbar editorRef={{ current: null }} activeFormats={EMPTY_FORMATS} />);
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.bold }));
});

test("RichTextInput toolbar buttons all act on the selection", () => {
  const changes: string[] = [];
  render(<RichTextInput value="<p>one two</p>" onChange={(next) => changes.push(next)} id="field" />);
  const field = screen.getByRole("textbox", { name: en.editor.inputPlaceholder });
  field.focus = () => {};
  assert.equal(field.id, "field");
  const select = () => {
    const paragraph = field.querySelector("p") as HTMLElement;
    paragraph.normalize();
    const text = paragraph.firstChild as Node;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 3);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
  };
  for (const [name, tag] of [[en.toolbar.italic, "em"], [en.toolbar.underline, "u"], [en.toolbar.bold, "strong"]] as const) {
    select();
    fireEvent.mouseDown(screen.getByRole("button", { name }));
    assert.equal(field.querySelector(tag)?.textContent, "one", tag);
    fireEvent.mouseDown(screen.getByRole("button", { name }));
    assert.equal(field.querySelector(tag), null);
  }
  (field.querySelector("p") as HTMLElement).normalize();
  const collapsed = document.createRange();
  collapsed.setStart(field.querySelector("p")?.firstChild as Node, 1);
  collapsed.collapse(true);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(collapsed);
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.bold }));
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.removeFormat }));
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.orderedList }));
  assert.ok(field.querySelector("ol li"));
  fireEvent.paste(field, { clipboardData: { getData: () => "more" } });
  assert.ok(changes.length > 0);
});

function Virtual(props: { initial: EleaBlock[] }) {
  const [blocks, setBlocks] = useState(props.initial);
  const [focused, setFocused] = useState<string | null>(null);
  const log: string[] = [];
  return (
    <VirtualizedBlockList
      blocks={blocks}
      focusedBlock={focused}
      onBlockFocus={(id) => setFocused(id)}
      onBlockBlur={() => setFocused(null)}
      onBlockUpdate={(id, data) => setBlocks((previous) => previous.map((block) => (block.id === id ? { ...block, data } : block)))}
      onBlockRemove={(id) => setBlocks((previous) => previous.filter((block) => block.id !== id))}
      onAddBlockAfter={(id, type) => {
        log.push(`${id}:${type}`);
        setBlocks((previous) => [...previous, { id: `${id}-next`, type, data: { text: "" } }]);
      }}
      threshold={100}
    />
  );
}

test("VirtualizedBlockList wires focus, update, removal and insertion to the block editors", async () => {
  render(<Virtual initial={[{ id: "h", type: "header", data: { text: "", level: 2 } }, { id: "p", type: "paragraph", data: { text: "" } }]} />);
  const header = screen.getByRole("textbox", { name: en.editor.headerPlaceholder });
  fireEvent.focus(header);
  assert.ok(document.querySelector("[data-elea-block-id='h']")?.className.includes("elea-block-editor--focused"));
  fireEvent.change(header, { target: { value: "Title" } });
  assert.equal((header as HTMLTextAreaElement).value, "Title");
  fireEvent.blur(header);
  assert.equal(document.querySelector(".elea-block-editor--focused"), null);
  fireEvent.keyDown(header, { key: "Enter" });
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.equal(document.querySelectorAll("[data-elea-block-id]").length, 3);
  const paragraph = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  fireEvent.focus(paragraph);
  fireEvent.input(paragraph);
  fireEvent.keyDown(paragraph, { key: "Enter", shiftKey: true });
  fireEvent.click(screen.getAllByRole("button", { name: en.actions.deleteBlock })[0] as HTMLElement);
  assert.equal(document.querySelector("[data-elea-block-id='h']"), null);
});

test("ContentEditor preview without a title and with the summary hidden", () => {
  render(<ContentEditor blocks={[{ id: "p", type: "paragraph", data: { text: "Body" } }]} onBlocksChange={() => {}} showPreview summaryDisabled title="T" summary="S" />);
  assert.equal(document.querySelector(".elea-content-editor__preview-title")?.textContent, "T");
  assert.equal(document.querySelector(".elea-content-editor__preview-summary"), null);
  cleanup();
  render(<ContentEditor blocks={[{ id: "p", type: "paragraph", data: { text: "Body" } }]} onBlocksChange={() => {}} showPreview className="x" />);
  assert.equal(document.querySelector(".elea-content-editor__preview-header"), null);
  assert.ok(document.querySelector(".elea-content-editor.x"));
  cleanup();
  render(<ContentEditor blocks={[{ id: "p", type: "paragraph", data: { text: "" } }]} onBlocksChange={() => {}} summary="s" onSummaryChange={() => {}} />);
  fireEvent.change(screen.getByRole("textbox", { name: en.editor.summaryPlaceholder }), { target: { value: "new" } });
  fireEvent.input(screen.getByRole("textbox", { name: en.editor.summaryPlaceholder }));
  assert.equal(screen.queryByRole("textbox", { name: en.editor.titlePlaceholder }), null);
});

test("RichTextInput applies an external value while focused and ignores its own echo", () => {
  const changes: string[] = [];
  const { rerender } = render(<RichTextInput value="<p>one</p>" onChange={(next) => changes.push(next)} />);
  const field = screen.getByRole("textbox", { name: en.editor.inputPlaceholder });
  field.focus();
  rerender(<RichTextInput value="<p>two</p>" onChange={(next) => changes.push(next)} />);
  assert.equal(field.innerHTML, "<p>two</p>");
  (field.firstChild as HTMLElement).insertAdjacentText("beforeend", "!");
  fireEvent.input(field);
  assert.equal(changes.at(-1), "<p>two!</p>");
  rerender(<RichTextInput value="<p>two!</p>" onChange={(next) => changes.push(next)} />);
  assert.equal(field.innerHTML, "<p>two!</p>");
  field.blur();
  rerender(<RichTextInput value="<p>three</p>" onChange={(next) => changes.push(next)} />);
  assert.equal(field.innerHTML, "<p>three</p>");
});
