import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { defaultRegistry, en, fr, type EleaBlock } from "@alien6-studio/elea-content";
import type { MediaBlockProps } from "./blocks/ImageBlock.js";
import { ContentEditor } from "./ContentEditor.js";
import { ContentProvider } from "./provider.js";
import { placeCaret, resetSelection, selectText } from "./test/dom.js";
import { loadEditorParts } from "./parts.js";

afterEach(() => { cleanup(); resetSelection(); });

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });

function Limited({ initial, max, mode = "default" }: Readonly<{ initial: EleaBlock[]; max: number; mode?: "default" | "markdown" }>) {
  const [blocks, update] = useState(initial);
  return <ContentProvider messages={fr}>
    <ContentEditor blocks={blocks} onBlocksChange={update} maxLength={max} mode={mode} title="Title" onTitleChange={() => {}} />
    <div data-testid="stored">{JSON.stringify(blocks)}</div>
  </ContentProvider>;
}
const saved = (): EleaBlock[] => JSON.parse(screen.getByTestId("stored").textContent!);
const count = () => screen.getByRole("status").textContent;
const paste = (target: HTMLElement, plain: string, html = "") => fireEvent.paste(target, {
  clipboardData: { getData: (key: string) => ({ "text/plain": plain, "text/html": html })[key] ?? "" },
});

test("a localized document counter counts text, spaces and decoded entities across fields", () => {
  render(<Limited initial={[paragraph("a", "A  <strong>B&amp;</strong>"), { id: "list", type: "list", data: { style: "unordered", items: [{ content: "x", items: ["😀"] }] } }]} max={9} />);
  const field = screen.getByRole("textbox", { name: fr.editor.startWriting });
  assert.equal(count(), "8 / 9 caractères");
  assert.equal(field.getAttribute("aria-describedby"), screen.getByRole("status").id);
  assert.equal(screen.getByRole("status").getAttribute("aria-live"), "polite");
  const add = (data: string) => fireEvent(field, new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data }));
  placeCaret(field.firstChild!, 1);
  assert.equal(add("a"), true);
  assert.equal(add("😀"), false);
  field.innerHTML += "x";
  fireEvent.input(field);
  assert.equal(count(), "9 / 9 caractères");
  assert.equal(add("a"), false);
  field.innerHTML += "y";
  fireEvent.input(field);
  assert.equal(field.textContent, "A  B&x");
  assert.equal(count(), "9 / 9 caractères");
});

test("a paste reserves the replaced selection and never splits an emoji", () => {
  render(<Limited initial={[paragraph("a", "abCDef"), paragraph("b", "12")]} max={9} />);
  const field = screen.getAllByRole("textbox", { name: fr.editor.startWriting })[0]!;
  selectText(field, 2, 4);
  paste(field, "X😀YZ", "<strong>X😀YZ</strong>");
  assert.equal(field.innerHTML, "ab<strong>X😀</strong>ef");
  assert.equal(count(), "9 / 9 caractères");
  assert.equal(saved()[1]!.data.text, "12");
  selectText(field, 0, 1);
  paste(field, "😀");
  assert.equal(field.textContent, "abX😀ef");
});

test("oversized structured paste keeps whole blocks, escapes the clipped last run, and preserves surrounding text", () => {
  const { container } = render(<Limited initial={[paragraph("a", "")]} max={5} />);
  paste(container.querySelector(".elea-content-editor")!, "", "<h2>ab</h2><p>&lt;b&gt;long</p>");
  const blocks = saved();
  assert.deepEqual(blocks.map(b => b.type), ["header", "paragraph"]);
  assert.equal(blocks[0]!.data.text, "ab");
  assert.equal(blocks[1]!.data.text, "&lt;b&gt;");
  assert.equal(count(), "5 / 5 caractères");
});

test("an external over-limit value stays editable and IME only commits a fitting composition", () => {
  const changes: EleaBlock[][] = [];
  const view = (text: string) => <ContentEditor blocks={[paragraph("a", text)]} onBlocksChange={next => changes.push(next)} maxLength={3} />;
  const { rerender } = render(view("ab"));
  const field = screen.getByRole("textbox", { name: en.editor.startWriting });
  selectText(field, 1, 2);
  fireEvent.compositionStart(field);
  field.textContent = "ab漢字";
  fireEvent.input(field);
  assert.equal(changes.length, 0);
  fireEvent.compositionEnd(field, { data: "漢字" });
  assert.equal(field.textContent, "ab");
  assert.equal(document.getSelection()?.toString(), "b");
  assert.equal(changes.length, 0);
  fireEvent.compositionStart(field);
  field.textContent = "ab漢";
  fireEvent.input(field);
  fireEvent.compositionEnd(field, { data: "漢" });
  assert.equal(changes.at(-1)?.[0]!.data.text, "ab漢");
  rerender(view("legacy"));
  assert.equal(count(), "6 / 3 characters");
  field.textContent = "legac";
  fireEvent.input(field);
  assert.equal(changes.at(-1)?.[0]!.data.text, "legac");
});

test("Markdown counts rendered text and rejects a source edit exceeding the body limit", async () => {
  await loadEditorParts("source");
  render(<Limited initial={[paragraph("a", "ab")]} max={3} mode="markdown" />);
  const source = await screen.findByRole<HTMLTextAreaElement>("textbox", { name: fr.source!.label });
  fireEvent.change(source, { target: { value: "**abc**" } });
  assert.equal(count(), "3 / 3 caractères");
  fireEvent.change(source, { target: { value: "**abcd**" } });
  assert.equal(source.value, "**abc**");
  assert.equal(count(), "3 / 3 caractères");
  source.setSelectionRange(3, 4);
  paste(source, "12345");
  assert.equal(source.value, "**a1c**");
  assert.equal(source.selectionStart, 4);
  assert.equal(count(), "3 / 3 caractères");
});

test("native captions and code fields share the available length including a replaced selection", () => {
  render(<Limited initial={[
    { id: "q", type: "quote", data: { text: "<em>abc</em>", caption: "x" } },
    { id: "c", type: "code", data: { code: "y" } },
  ]} max={7} />);
  const caption = screen.getByRole<HTMLInputElement>("textbox", { name: fr.editor.quoteAuthorPlaceholder });
  const code = screen.getByRole<HTMLTextAreaElement>("textbox", { name: fr.editor.codePlaceholder });
  assert.equal(caption.maxLength, 3);
  assert.equal(code.maxLength, 3);
  fireEvent.change(caption, { target: { value: "xyz" } });
  assert.equal(count(), "7 / 7 caractères");
  assert.equal(code.maxLength, 1);
  fireEvent.change(code, { target: { value: "too long" } });
  assert.equal(code.value, "y");
  assert.equal(code.getAttribute("aria-describedby"), screen.getByRole("status").id);
});

test("a truncated list paste retains its markers, hierarchy and formatted text", () => {
  const { container } = render(<Limited initial={[paragraph("a", "")]} max={4} />);
  const list = { type: "list", data: { style: "ordered", marker: "lower-alpha",
    items: [{ content: "<em>ab</em>", items: ["<strong>cde</strong>"], childrenMarker: "disc" }, "f"] } };
  fireEvent.paste(container.querySelector(".elea-content-editor")!, { clipboardData: {
    getData: (type: string) => type === "application/x-elea-blocks" ? JSON.stringify([list]) : "",
  } });
  assert.equal(count(), "4 / 4 caractères");
  assert.deepEqual(saved()[0]?.data, { style: "ordered", marker: "lower-alpha", items: [
    { content: "<em>ab</em>", childrenMarker: "disc", items: ["<strong>cd</strong>"] },
  ] });
});

test("custom blocks count the registry's plain text and a rejected update does not leak into a later change", () => {
  const registry = defaultRegistry.with({ type: "card", defaults: () => ({}), normalize: data => data,
    toText: data => String(data.label), hasMedia: () => false });
  const original = { id: "user-chosen", type: "card", data: { label: "abc", extra: "preserve" } };
  const changes: EleaBlock[][] = [];
  const Card = ({ block, onUpdate }: MediaBlockProps) => <button onClick={() => {
    onUpdate({ label: "too long", extra: "discard" });
    onUpdate({ ...block.data, label: "OK" });
  }}>Update card</button>;
  render(<ContentProvider registry={registry}>
    <ContentEditor blocks={[original]} onBlocksChange={next => changes.push(next)} maxLength={3} editors={{ card: Card }} />
  </ContentProvider>);
  assert.equal(count(), "3 / 3 characters");
  fireEvent.click(screen.getByRole("button", { name: "Update card" }));
  assert.deepEqual(changes, [[{ ...original, data: { label: "OK", extra: "preserve" } }]]);
});
