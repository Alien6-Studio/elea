import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { ContentEditor } from "./ContentEditor.js";
import { parseClipboard, parsePastedHtml, parsePastedText } from "./paste.js";
import { ContentProvider } from "./provider.js";
import { placeCaret, resetSelection, selectText } from "./test/dom.js";

afterEach(() => {
  cleanup();
  resetSelection();
});

const sanitizer = createDefaultSanitizer();

test("Office annotations are discarded while dividers and formatted text survive import", () => {
  const html = '<section><p>One<o:p>Office annotation</o:p></p><hr><p><span style="text-decoration:underline">Two</span></p></section>';
  assert.deepEqual(parsePastedHtml(html, sanitizer).blocks, [
    { type: "paragraph", data: { text: "One" } },
    { type: "delimiter", data: {} },
    { type: "paragraph", data: { text: "<u>Two</u>" } },
  ]);
});

test("inline HTML stays inline, sanitized", () => {
  const pasted = parsePastedHtml('<meta charset="utf-8"><span style="font-weight:700">Bold</span> and <i>italic</i> <script>x()</script>', sanitizer);
  assert.deepEqual(pasted, { inline: "<strong>Bold</strong> and <em>italic</em> ", blocks: [] });
});

test("Google Docs clipboard: the bold wrapper with a normal weight is not bold, paragraphs become blocks", () => {
  const html = '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1"><h1 dir="ltr" style="line-height:1.2"><span style="font-size:20pt;font-weight:700">Title</span></h1><p dir="ltr"><span style="font-size:11pt">First </span><span style="font-size:11pt;font-weight:700">bold</span><span style="font-size:11pt"> paragraph.</span></p><ul><li dir="ltr"><p dir="ltr"><span>one</span></p></li><li><p><span style="font-style:italic">two</span></p></li></ul><br></b>';
  const pasted = parsePastedHtml(html, sanitizer);
  assert.equal(pasted.inline, null);
  assert.deepEqual(pasted.blocks, [
    { type: "header", data: { text: "<strong>Title</strong>", level: 1 } },
    { type: "paragraph", data: { text: "First <strong>bold</strong> paragraph." } },
    { type: "list", data: { style: "unordered", items: ["one", "<em>two</em>"] } },
  ]);
});

test("Word clipboard: classes, o:p tags and empty spans go, b and i become strong and em", () => {
  const html = '<html><head><style>p.MsoNormal{margin:0}</style></head><body><p class="MsoNormal" style="margin-bottom:0cm"><b>Head</b><o:p></o:p></p><p class="MsoNormal"><span lang="EN-US">Body with <i>emphasis</i>.<o:p></o:p></span></p><table class="MsoTableGrid"><tr><td><p class="MsoNormal">A</p></td><td><p class="MsoNormal">B</p></td></tr></table></body></html>';
  const pasted = parsePastedHtml(html, sanitizer);
  assert.deepEqual(pasted.blocks, [
    { type: "paragraph", data: { text: "<strong>Head</strong>" } },
    { type: "paragraph", data: { text: "Body with <em>emphasis</em>." } },
    { type: "table", data: { content: [["A", "B"]] } },
  ]);
});

test("web page clipboard: headings, nested lists, quotes, images, code, rules and loose text", () => {
  const html = `<article><h2>Section</h2>Loose <b>text</b> before<div><p>Para one</p><p>Para two</p></div><ol><li>first<ul><li>nested</li></ul></li><li>second</li></ol><blockquote><p>Quote line</p></blockquote><figure><img src="https://example.org/a.png" alt="An image"><figcaption>Caption</figcaption></figure><img src="data:image/png;base64,AA"><pre>const a = 1;</pre><hr><p>  </p><p>Last</p></article>`;
  const pasted = parsePastedHtml(html, sanitizer);
  assert.deepEqual(pasted.blocks, [
    { type: "header", data: { text: "Section", level: 2 } },
    { type: "paragraph", data: { text: "Loose <strong>text</strong> before" } },
    { type: "paragraph", data: { text: "Para one" } },
    { type: "paragraph", data: { text: "Para two" } },
    { type: "list", data: { style: "ordered", items: [{ content: "first", items: ["nested"] }, "second"] } },
    { type: "quote", data: { text: "Quote line", caption: "" } },
    { type: "image", data: { file: { url: "https://example.org/a.png", id: "" }, caption: "Caption", alt: "An image" } },
    { type: "code", data: { code: "const a = 1;" } },
    { type: "delimiter", data: {} },
    { type: "paragraph", data: { text: "Last" } },
  ]);
});

test("plain text: single run stays inline with line breaks, blank lines split paragraphs, HTML is escaped", () => {
  assert.deepEqual(parsePastedText("one\ntwo"), { inline: "one<br>two", blocks: [] });
  assert.deepEqual(parsePastedText("<b>x</b>"), { inline: "&lt;b&gt;x&lt;/b&gt;", blocks: [] });
  assert.deepEqual(parsePastedText("a\r\n\r\nb\n\n\nc\nd"), { inline: null, blocks: [{ type: "paragraph", data: { text: "a" } }, { type: "paragraph", data: { text: "b" } }, { type: "paragraph", data: { text: "c<br>d" } }] });
  assert.deepEqual(parsePastedText(""), { inline: "", blocks: [] });
  assert.deepEqual(parsePastedText(" word "), { inline: " word ", blocks: [] });
  assert.deepEqual(parsePastedText("\n\n"), { inline: "", blocks: [] });
  const clipboard = (data: Record<string, string>) => ({ getData: (type: string) => data[type] ?? "" });
  assert.deepEqual(parseClipboard(clipboard({ "text/html": " ", "text/plain": "plain" }), sanitizer), { inline: "plain", blocks: [] });
  assert.equal(parseClipboard(clipboard({ "text/html": "<p>a</p><p>b</p>" }), sanitizer).blocks.length, 2);
});

function Harness({ initial }: { initial: EleaBlock[] }) {
  const [blocks, setBlocks] = useState(initial);
  return (
    <ContentProvider sanitizer={sanitizer}>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} enableVirtualization={false} />
      <pre data-testid="json">{JSON.stringify(blocks.map((block) => [block.type, block.data]))}</pre>
    </ContentProvider>
  );
}

const paste = (target: HTMLElement, data: Record<string, string>) => fireEvent.paste(target, { clipboardData: { getData: (type: string) => data[type] ?? "" } });

test("pasting into a list item keeps every paragraph and formatted word at the selection", () => {
  render(<Harness initial={[{ id: "list", type: "list", data: { style: "unordered", items: ["alpha", "omega"] } }]} />);
  const field = screen.getByRole("textbox", { name: en.editor.listItemPlaceholder });
  const item = field.querySelector("li")!;
  selectText(item, 1, 3);
  paste(field, { "text/html": "<p>sun</p><p><i>moon</i></p>" });
  assert.deepEqual(state()[0]?.[1].items, ["asun<br><em>moon</em>ha", "omega"]);
});

test("a single HTML paragraph replaces just the selected text and an empty clipboard preserves it", () => {
  render(<Harness initial={[{ id: "p", type: "paragraph", data: { text: "abcde" } }]} />);
  const field = screen.getByRole("textbox", { name: en.editor.startWriting });
  selectText(field, 1, 4);
  paste(field, {});
  assert.equal(state()[0]?.[1].text, "abcde");
  paste(field, { "text/html": "<p><b>sun</b></p>" });
  assert.deepEqual(state(), [["paragraph", { text: "a<strong>sun</strong>e" }]]);
});
const state = () => JSON.parse(screen.getByTestId("json").textContent ?? "[]") as [string, Record<string, unknown>][];

test("pasting inline HTML keeps the formatting at the caret", () => {
  render(<Harness initial={[{ id: "p", type: "paragraph", data: { text: "Hello world" } }]} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  placeCaret(editable.firstChild as Node, 5);
  paste(editable, { "text/html": "<b>bold</b> and <a href=\"javascript:x\">bad</a>" });
  assert.equal(editable.innerHTML, 'Hello<strong>bold</strong> and <a>bad</a> world');
  assert.equal(state()[0]?.[1].text, editable.innerHTML);
});

test("pasting several blocks fills the field, inserts the rest after it and keeps the trailing text", async () => {
  render(<Harness initial={[{ id: "p", type: "paragraph", data: { text: "Start|end" } }, { id: "q", type: "paragraph", data: { text: "Untouched" } }]} />);
  const editable = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  placeCaret(editable.firstChild as Node, 5);
  await act(async () => {
    paste(editable, { "text/html": "<p>First <i>pasted</i></p><h2>Heading</h2><ul><li>item</li></ul>" });
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  const blocks = state();
  assert.deepEqual(blocks.map(([type]) => type), ["paragraph", "header", "list", "paragraph", "paragraph"]);
  assert.equal(blocks[0]?.[1].text, "StartFirst <em>pasted</em>");
  assert.deepEqual(blocks[1]?.[1], { text: "Heading", level: 2 });
  assert.deepEqual(blocks[2]?.[1], { style: "unordered", items: ["item"] });
  assert.equal(blocks[3]?.[1].text, "|end");
  assert.equal(blocks[4]?.[1].text, "Untouched");
  const editors = document.querySelectorAll("[data-elea-block-id]");
  assert.equal(editors.length, 5);
  assert.ok(within(editors[3] as HTMLElement).getByRole("textbox", { name: en.editor.startWriting }));
});

test("a paste starting with a non-text block goes entirely after the field", async () => {
  render(<Harness initial={[{ id: "p", type: "paragraph", data: { text: "Only" } }]} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  placeCaret(editable.firstChild as Node, 4);
  await act(async () => {
    paste(editable, { "text/html": "<h1>Big</h1><p>after</p>" });
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  assert.deepEqual(state().map(([type]) => type), ["paragraph", "header", "paragraph"]);
  assert.equal(state()[0]?.[1].text, "Only");
  // The focus moved to the inserted blocks; the user clicks back into the first field
  placeCaret(editable.firstChild as Node, 4);
  await act(async () => {
    paste(editable, { "text/plain": "p1\n\np2" });
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  assert.equal(state().length, 4);
  paste(editable, { "text/html": "<p></p>" });
  assert.equal(state().length, 4);
});

test("pasted Markdown becomes blocks, a single Markdown line stays inline", () => {
  const pasted = parsePastedText("# Title\n\nSome **bold** text with a [link](https://example.org) and a [bad](javascript:x).\n\n- one\n- two\n  - nested\n\n> quoted\n> — Someone\n\n```js\nconst a = 1;\n```\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n---\n\n![alt](https://example.org/i.png \"cap\")", sanitizer);
  assert.equal(pasted.inline, null);
  assert.deepEqual(pasted.blocks, [
    { type: "header", data: { text: "Title", level: 1 } },
    { type: "paragraph", data: { text: 'Some <strong>bold</strong> text with a <a href="https://example.org" target="_blank" rel="noopener noreferrer">link</a> and a bad.' } },
    { type: "list", data: { style: "unordered", items: ["one", { content: "two", childrenMarker: "disc", items: ["nested"] }] } },
    { type: "quote", data: { text: "quoted", caption: "Someone" } },
    { type: "code", data: { code: "const a = 1;", language: "js" } },
    { type: "table", data: { content: [["A", "B"], ["1", "2"]] } },
    { type: "delimiter", data: {} },
    { type: "image", data: { file: { url: "https://example.org/i.png", id: "" }, caption: "cap", alt: "alt" } },
  ]);
  assert.deepEqual(parsePastedText("just **bold** words", sanitizer), { inline: "just <strong>bold</strong> words", blocks: [] });
  assert.deepEqual(parsePastedText("1. first\n2. second"), { inline: null, blocks: [{ type: "list", data: { style: "ordered", items: ["first", "second"] } }] });
});

test("a pasted nested list keeps its structure through later edits of the parent", async () => {
  render(<Harness initial={[{ id: "p", type: "paragraph", data: { text: "Start" } }]} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  placeCaret(editable.firstChild as Node, 5);
  await act(async () => {
    paste(editable, { "text/html": "<ul><li>parent<ul><li>child</li></ul></li><li>sibling</li></ul>" });
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  assert.deepEqual(state()[1]?.[1], { style: "unordered", items: [{ content: "parent", items: ["child"] }, "sibling"] });
  const field = screen.getByRole("textbox", { name: en.editor.listItemPlaceholder }) as HTMLElement;
  ((field.querySelector("li") as HTMLElement).firstChild as Text).data = "parent renamed";
  fireEvent.input(field);
  assert.deepEqual(state()[1]?.[1], { style: "unordered", items: [{ content: "parent renamed", items: ["child"] }, "sibling"] });
});

test("blocks carried by the clipboard are cleaned like any other paste", () => {
  const forged = JSON.stringify([
    { type: "paragraph", data: { text: 'Hi <img src="x" onerror="alert(1)"><a href="javascript:alert(1)">there</a>' } },
    { type: "list", data: { style: "unordered", items: ['<svg onload="alert(1)"></svg>one', { content: "<script>alert(1)</script>two", items: ["<b onclick=\"x()\">three</b>"] }] } },
    { type: "table", data: { content: [['<i onmouseover="x()">cell</i>', 4], "row"] } },
    { type: "raw", data: { html: "<iframe src=\"javascript:alert(1)\"></iframe>kept" } },
    { type: "delimiter" },
  ]);
  const clipboard = { getData: (type: string) => (type === "application/x-elea-blocks" ? forged : "") };
  const parsed = JSON.stringify(parseClipboard(clipboard, sanitizer).blocks);
  assert.ok(!/onerror|onload|onclick|onmouseover|javascript:|<script|<iframe/.test(parsed), parsed);
  assert.ok(parsed.includes("there") && parsed.includes("<b>three</b>") && parsed.includes("<i>cell</i>") && parsed.includes("kept"));

  render(<Harness initial={[{ id: "p", type: "paragraph", data: { text: "" } }]} />);
  paste(screen.getByRole("textbox", { name: en.editor.startWriting }), { "application/x-elea-blocks": forged });
  const pasted = JSON.stringify(state());
  assert.ok(pasted.includes("there") && pasted.includes("three"), pasted);
  assert.ok(!/onerror|onload|onclick|onmouseover|javascript:|<script|<iframe/.test(pasted), pasted);
});

test("clipboard blocks keep their kind: headings, quotes, code, tables, figures and rejected images", () => {
  const html = '<h2>Title</h2><blockquote>Said<br></blockquote><pre> code </pre><pre> </pre><table><tr><td>a</td><td><b>b</b></td></tr></table>'
    + '<figure><img src="https://example.com/a.png" alt="A"><figcaption> Cap </figcaption></figure><img src="javascript:alert(1)"><ol><li>one<ul><li>deep</li></ul></li></ol><p><br></p><div><p>in div</p>tail</div>';
  assert.deepEqual(parsePastedHtml(html, sanitizer).blocks, [
    { type: "header", data: { text: "Title", level: 2 } },
    { type: "quote", data: { text: "Said", caption: "" } },
    { type: "code", data: { code: " code " } },
    { type: "table", data: { content: [["a", "<strong>b</strong>"]] } },
    { type: "image", data: { file: { url: "https://example.com/a.png", id: "" }, caption: "Cap", alt: "A" } },
    { type: "list", data: { style: "ordered", items: [{ content: "one", items: ["deep"] }] } },
    { type: "paragraph", data: { text: "in div" } },
    { type: "paragraph", data: { text: "tail" } },
  ]);
});
