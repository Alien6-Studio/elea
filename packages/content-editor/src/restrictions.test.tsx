import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { en, type BlockLike, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "./ContentEditor.js";
import { loadEditorParts } from "./parts.js";
import { createRestrictions, type EditorMark } from "./restrictions.js";
import { BLOCKS_CLIPBOARD_TYPE } from "./selection.js";
import { placeCaret, resetSelection, selectText } from "./test/dom.js";

await loadEditorParts();

afterEach(() => {
  cleanup();
  resetSelection();
});

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });
const FIELD_TYPES = ["paragraph", "list"] as const;
const FIELD_MARKS: readonly EditorMark[] = ["bold", "italic", "underline", "link"];

test("the allow-list turns disallowed text into paragraphs, leaves out blocks without text and strips disallowed marks", () => {
  const restrictions = createRestrictions({ blockTypes: FIELD_TYPES, marks: ["bold", "link"] });
  assert.equal(restrictions.allowsBlock("paragraph"), true);
  assert.equal(restrictions.allowsBlock("header"), false);
  assert.equal(restrictions.allowsMark("italic"), false);
  const kept = [paragraph("p", "Plain <strong>bold</strong>"), { id: "l", type: "list", data: { style: "unordered", items: ["One"] } }];
  assert.equal(restrictions.restrict(kept).blocks, kept);
  const { blocks, leftOut } = restrictions.restrict([
    { id: "h", type: "header", data: { text: "Title", level: 2 } },
    { id: "q", type: "quote", data: { text: "Said <em>so</em>", caption: "Someone" } },
    { id: "c", type: "code", data: { code: "a < b\nc" } },
    { id: "a", type: "attachment", data: { id: "file", title: "Report" } },
    { id: "d", type: "delimiter", data: {} },
    paragraph("p", "<h2>Inside</h2>tail <u>under</u> <a href=\"/x\">link</a>"),
    { id: "l", type: "list", data: { style: "unordered", items: ["<em>One</em>", { content: "<strong>Two</strong>", items: ["<u>Three</u>"] }] } },
  ]);
  assert.deepEqual(blocks, [
    paragraph("h", "Title"),
    paragraph("q", "Said so"),
    paragraph("q-1", "Someone"),
    paragraph("c", "a &lt; b<br>c"),
    paragraph("p", "Inside<br>tail under <a href=\"/x\">link</a>"),
    { id: "l", type: "list", data: { style: "unordered", items: ["One", { content: "<strong>Two</strong>", items: ["Three"] }] } },
  ]);
  assert.deepEqual(leftOut.map(block => block.id), ["a", "d"]);
  // A list the host leaves out keeps every item as a paragraph
  const plain = createRestrictions({ blockTypes: [] });
  assert.deepEqual(plain.restrict([{ id: "l", type: "list", data: { items: ["One", { content: "Two", items: ["Three"] }] } }]).blocks.map(block => block.data),
    [{ text: "One" }, { text: "Two" }, { text: "Three" }]);
  assert.equal(plain.restrictHtml("<ul><li>One</li><li>Two</li></ul>"), "One<br>Two");
  assert.equal(restrictions.restrictHtml('<em>One &amp; two</em><strong style="color: blue">Three</strong>'),
    "One &amp; two<strong>Three</strong>");
});

interface FieldProps {
  initial: EleaBlock[];
  marks?: readonly EditorMark[];
  changes?: EleaBlock[][];
  leftOut?: BlockLike[][];
}

function Field({ initial, marks = FIELD_MARKS, changes, leftOut }: Readonly<FieldProps>) {
  const [blocks, setBlocks] = useState(initial);
  return (
    <ContentEditor mode="classic" blockTypes={FIELD_TYPES} marks={marks} blocks={blocks} enableVirtualization={false}
      onBlocksChange={(next) => { changes?.push(next); setBlocks(next); }} onBlocksLeftOut={(left) => leftOut?.push(left)} />
  );
}

const fields = () => screen.getAllByRole("textbox", { name: en.editor.startWriting }) as HTMLElement[];
const focusField = (field: HTMLElement) => {
  // Unlike browsers, jsdom collapses the selection when a contentEditable is focused
  field.focus = () => {};
  fireEvent.focus(field);
};
const blockTypes = () => Array.from(document.querySelectorAll<HTMLElement>(".elea-block-editor"), block => block.dataset.eleaBlockType);
const pasteBlocks = (field: HTMLElement, blocks: BlockLike[]) =>
  fireEvent.paste(field, { clipboardData: { getData: (type: string) => type === BLOCKS_CLIPBOARD_TYPE ? JSON.stringify(blocks) : "" } });

test("a restricted field renders no control for what the host leaves out", () => {
  render(<Field initial={[paragraph("p", "Alpha")]} />);
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  assert.equal(bar.querySelector(".elea-toolbar__headings"), null);
  assert.equal(within(bar).queryByRole("button", { name: en.toolbar.blockquote }), null);
  assert.equal(within(bar).queryByRole("button", { name: en.toolbar.h2 }), null);
  for (const label of [en.toolbar.bold, en.toolbar.italic, en.toolbar.underline, en.toolbar.link, en.toolbar.bulletList]) assert.ok(within(bar).getByRole("button", { name: label }));
  assert.equal(bar.querySelector(".elea-toolbar__separator + .elea-toolbar__separator, .elea-toolbar__separator:last-child"), null);
  fireEvent.click(within(bar).getByRole("button", { name: en.actions.addBlock }));
  assert.deepEqual(within(bar).getAllByRole("menuitem").map(item => item.textContent), [en.blockTypes.paragraph, en.blockTypes.list]);
});

test("marks the host leaves out have no control, no shortcut and do not survive a paste", () => {
  render(<Field initial={[paragraph("p", "Alpha")]} marks={["italic"]} />);
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  assert.equal(within(bar).queryByRole("button", { name: en.toolbar.bold }), null);
  assert.equal(within(bar).queryByRole("button", { name: en.toolbar.link }), null);
  assert.ok(within(bar).getByRole("button", { name: en.toolbar.italic }));
  const field = fields()[0]!;
  focusField(field);
  selectText(field, 0, 5);
  assert.equal(fireEvent.keyDown(field, { key: "b", ctrlKey: true }), false);
  assert.equal(field.querySelector("strong"), null);
  fireEvent.keyDown(field, { key: "k", ctrlKey: true });
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.keyDown(field, { key: "i", ctrlKey: true });
  assert.equal(field.querySelector("em")?.textContent, "Alpha");
  placeCaret(field, field.childNodes.length);
  fireEvent.paste(field, { clipboardData: { getData: (type: string) => type === "text/html" ? " <strong>bold</strong> <em>slanted</em> <a href=\"https://example.org\">site</a>" : "" } });
  assert.equal(field.querySelector("strong, a"), null);
  assert.equal(field.textContent, "Alpha bold slanted site");
  assert.equal(field.querySelectorAll("em").length, 2);
});

test("typing shortcuts create nothing the host leaves out", async () => {
  render(<Field initial={[paragraph("p", "")]} />);
  const type = (text: string) => {
    const field = fields()[0]!;
    field.textContent = text;
    placeCaret(field.firstChild as Node, text.length);
    fireEvent.input(field);
  };
  type("## ");
  type("> ");
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(blockTypes(), ["paragraph"]);
  assert.equal(fields()[0]!.textContent, "> ");
  type("- ");
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(blockTypes(), ["list"]);
});

test("pasted blocks fall back to paragraphs with their text; a block without text is left out and reported once", () => {
  const changes: EleaBlock[][] = [];
  const leftOut: BlockLike[][] = [];
  render(<Field initial={[paragraph("p", "Alpha")]} changes={changes} leftOut={leftOut} />);
  const field = fields()[0]!;
  focusField(field);
  placeCaret(field.firstChild as Node, 5);
  pasteBlocks(field, [
    { type: "header", data: { text: "Title", level: 2 } },
    { type: "quote", data: { text: "Said", caption: "" } },
    { type: "code", data: { code: "let a" } },
  ]);
  assert.deepEqual(changes.at(-1)?.map(block => [block.type, block.data.text]), [["paragraph", "Alpha"], ["paragraph", "Title"], ["paragraph", "Said"], ["paragraph", "let a"]]);
  assert.equal(leftOut.length, 0);
  const before = changes.length;
  placeCaret(field.firstChild as Node, 5);
  pasteBlocks(field, [{ type: "attachment", data: { id: "file", title: "Report" } }]);
  assert.equal(changes.length, before);
  assert.equal(leftOut.length, 1);
  assert.deepEqual(leftOut[0]?.map(block => block.type), ["attachment"]);
});

test("a loaded document is edited in its accepted form and reaches the host with the first change, not on load", () => {
  const changes: EleaBlock[][] = [];
  const leftOut: BlockLike[][] = [];
  const initial: EleaBlock[] = [{ id: "h", type: "header", data: { text: "Title", level: 2 } }, { id: "a", type: "attachment", data: { id: "file", title: "Report" } }, paragraph("p", "Body")];
  const { rerender } = render(<Field initial={initial} changes={changes} leftOut={leftOut} />);
  assert.deepEqual(blockTypes(), ["paragraph", "paragraph"]);
  assert.equal(fields()[0]!.textContent, "Title");
  assert.equal(changes.length, 0);
  assert.deepEqual(leftOut.map(left => left.map(block => block.id)), [["a"]]);
  rerender(<Field initial={initial} changes={changes} leftOut={leftOut} />);
  assert.equal(leftOut.length, 1);
  const field = fields()[1]!;
  field.textContent = "Body!";
  fireEvent.input(field);
  assert.deepEqual(changes.at(-1), [paragraph("h", "Title"), paragraph("p", "Body!")]);
  assert.equal(leftOut.length, 1);
});

test("the link shortcut in a link shows its address, which can be changed and saved", () => {
  const changes: EleaBlock[][] = [];
  render(<Field initial={[paragraph("p", "See <a href=\"https://example.org\">the site</a>")]} changes={changes} />);
  const field = fields()[0]!;
  focusField(field);
  placeCaret(field.querySelector("a")!.firstChild as Node, 2);
  fireEvent.keyDown(field, { key: "k", ctrlKey: true });
  const input = screen.getByRole("textbox", { name: en.editor.linkUrlPrompt }) as HTMLInputElement;
  assert.equal(input.value, "https://example.org");
  assert.equal(screen.getByRole("link", { name: en.editor.linkOpen }).getAttribute("href"), "https://example.org/");
  assert.ok(screen.getByRole("button", { name: en.editor.linkRemove }));
  fireEvent.change(input, { target: { value: "https://example.com/next" } });
  fireEvent.keyDown(input, { key: "Enter" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(field.querySelectorAll("a").length, 1);
  assert.match(String(changes.at(-1)?.[0]?.data.text), /^See <a href="https:\/\/example.com\/next"[^>]*>the site<\/a>$/);
});

test("a format control used while no field has focus gives the document focus, then applies", () => {
  render(<Field initial={[paragraph("p", "Alpha")]} />);
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  const field = fields()[0]!;
  focusField(field);
  selectText(field, 0, 5);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  fireEvent.blur(field, { relatedTarget: document.body });
  resetSelection();
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.bold }));
  assert.equal(fields()[0]!.querySelector("strong")?.textContent, "Alpha");
});
