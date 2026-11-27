import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor, type EditorMode } from "./ContentEditor.js";
import { loadEditorParts } from "./parts.js";
import { resetSelection, selectText } from "./test/dom.js";

// The views that load on demand are there from the start: these tests are about what they do
await loadEditorParts();

afterEach(() => {
  cleanup();
  resetSelection();
});

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });

test("full width follows the editor into the preview and the reading measure is restored on request", () => {
  const props = { blocks: [paragraph("p", "A note")], onBlocksChange: () => {}, className: "article-form" };
  const { container, rerender } = render(<ContentEditor {...props} />);
  const root = () => container.querySelector<HTMLElement>(".article-form")!;
  assert.ok(!root().classList.contains("elea-content-editor--full"));
  rerender(<ContentEditor {...props} mode="classic" width="full" />);
  assert.ok(root().classList.contains("elea-content-editor--full"));
  rerender(<ContentEditor {...props} mode="markdown" width="full" showPreview />);
  assert.ok(root().classList.contains("elea-content-editor--full"));
  assert.ok(root().querySelector(".elea-content"));
  rerender(<ContentEditor {...props} width="measure" />);
  assert.ok(!root().classList.contains("elea-content-editor--full"));
});

test("a host with its own history buttons can keep undo and redo shortcuts for the draft", () => {
  const blocks: EleaBlock[] = [];
  function Editor() {
    const [title, setTitle] = useState("First");
    const [mode, setMode] = useState<EditorMode>("default");
    return <ContentEditor blocks={blocks} onBlocksChange={() => {}} title={title} onTitleChange={setTitle} mode={mode} onModeChange={setMode} history="keyboard" historyControls={<button type="button">Previous version</button>} />;
  }
  render(<Editor />);
  assert.equal(screen.queryByRole("button", { name: en.actions.undo }), null);
  const title = screen.getByRole("textbox", { name: en.editor.titlePlaceholder }) as HTMLTextAreaElement;
  fireEvent.change(title, { target: { value: "Second" } });
  fireEvent.keyDown(title, { key: "z", ctrlKey: true });
  assert.equal(title.value, "First");
  fireEvent.keyDown(title, { key: "z", ctrlKey: true, shiftKey: true });
  assert.equal(title.value, "Second");
  fireEvent.click(screen.getByRole("button", { name: new RegExp(en.source.mode) }));
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.source.classic }));
  assert.equal(screen.queryByRole("button", { name: en.actions.redo }), null);
  assert.ok(within(document.querySelector<HTMLElement>(".elea-content-editor__mode")!).getByRole("button", { name: "Previous version" }));
});

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
  // The document bar: formatting, insertion, history; its controls stay usable without a focused field
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  assert.equal(bar.parentElement?.className, "elea-classic-editor");
  assert.equal(bar.nextElementSibling?.className, "elea-classic-editor__canvas");
  assert.equal(bar.querySelector("fieldset, :disabled:not([aria-label^='Undo']):not([aria-label^='Redo'])"), null);
  const undo = within(bar).getByRole("button", { name: en.actions.undo }) as HTMLButtonElement;
  assert.equal(undo.disabled, true);
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  // No bubble: the fixed bar formats the focused paragraph
  selectText(alpha, 0, 5);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  assert.equal(document.querySelector("[data-elea-bubble]"), null);
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.bold }));
  assert.equal(alpha.querySelector("strong")?.textContent, "Alpha");
  // Insert from the bar goes after the focused block; the keyboard still moves blocks
  const insert = within(within(bar).getByRole("group", { name: en.actions.insert }));
  fireEvent.click(insert.getByRole("button", { name: en.actions.addBlock }));
  fireEvent.click(insert.getByRole("menuitem", { name: en.blockTypes.quote }));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(state().map(([, type]) => type), ["paragraph", "quote", "header", "paragraph"]);
  fireEvent.click(within(bar).getByRole("button", { name: en.actions.undo }));
  assert.equal(state().length, 3);
  fireEvent.click(within(bar).getByRole("button", { name: en.actions.redo }));
  assert.equal(state().length, 4);
  fireEvent.keyDown(alpha, { key: "ArrowDown", ctrlKey: true, shiftKey: true });
  assert.deepEqual(state().map(([id]) => id).slice(0, 2).includes("a"), true);
  fireEvent.blur(alpha, { relatedTarget: document.body });
});

test("writing at the end of the classic canvas keeps the last media and reuses the final paragraph", async () => {
  const image: EleaBlock = { id: "photo", type: "image", data: { file: { url: "/photo.png", id: "asset" }, caption: "Landscape" } };
  let current = [image];
  function Editor() {
    const [blocks, setBlocks] = useState(current);
    return <ContentEditor mode="classic" blocks={blocks} onBlocksChange={(next) => { current = next; setBlocks(next); }} />;
  }
  render(<Editor />);
  const end = screen.getByRole("button", { name: en.editor.startWriting });
  fireEvent.click(end);
  assert.equal(current[0], image);
  assert.equal(current[1]?.type, "paragraph");
  const paragraph = screen.getByRole("textbox", { name: en.editor.startWriting });
  await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
  assert.equal(document.activeElement, paragraph);
  fireEvent.click(end);
  assert.equal(current.length, 2);
  fireEvent.click(screen.getByRole("button", { name: en.actions.undo }));
  assert.deepEqual(current, [image]);
});

test("the classic toolbar follows focus backwards through paragraphs and a list", () => {
  const list: EleaBlock = { id: "list", type: "list", data: { items: ["One", "Two"], style: "unordered" } };
  function Editor() {
    const [blocks, setBlocks] = useState([paragraph("p", "Alpha"), list]);
    return <ContentEditor mode="classic" blocks={blocks} onBlocksChange={setBlocks} />;
  }
  render(<Editor />);
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  const listField = blockRoot("list").querySelector<HTMLElement>("[contenteditable]")!;
  act(() => listField.focus());
  assert.ok(within(bar).getByRole("button", { name: en.list.indent }));
  selectText(listField.querySelector("li")!, 0, 3);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  assert.equal(document.querySelector("[data-elea-bubble]"), null);
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.bold }));
  assert.equal(listField.querySelector("li strong")?.textContent, "One");
  const alpha = blockRoot("p").querySelector<HTMLElement>("[contenteditable]")!;
  act(() => alpha.focus());
  selectText(alpha, 0, 5);
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.italic }));
  assert.equal(alpha.querySelector("em")?.textContent, "Alpha");
});

test("the classic style picker changes the heading level and returns to body text with the same selection", async () => {
  render(<Harness mode="classic" />);
  const alpha = blockRoot("a").querySelector<HTMLElement>("[contenteditable]")!;
  act(() => alpha.focus());
  selectText(alpha, 0, 5);
  const report = () => act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  report();
  const bar = within(document.querySelector<HTMLElement>(".elea-doc-toolbar")!);
  const picker = bar.getByRole("combobox", { name: en.blockTypes.header });
  async function choose(label: string) {
    fireEvent.click(picker);
    fireEvent.click(bar.getByRole("option", { name: label }));
    await act(async () => {});
    report();
    assert.equal(document.activeElement, alpha);
  }
  await choose(en.toolbar.h2);
  const heading = alpha.querySelector("h2")!;
  assert.equal(heading.textContent, "Alpha");
  selectText(heading, 1, 4);
  report();
  await choose(en.toolbar.h3);
  assert.equal(alpha.innerHTML, "<h3>Alpha</h3>");
  assert.equal(window.getSelection()?.toString(), "lph");
  await choose(en.blockTypes.paragraph);
  assert.equal(alpha.innerHTML, "Alpha");
  assert.equal(window.getSelection()?.toString(), "lph");
});

test("the classic mode also runs through the virtualized list", () => {
  render(<Harness mode="classic" virtualize />);
  assert.ok(document.querySelector(".elea-doc-toolbar"));
  // Beyond the threshold the blocks wait as placeholders
  assert.ok(document.querySelector(".elea-block-slot--placeholder"));
  assert.ok(document.querySelector(".elea-content-editor--classic"));
});

test("inserting from the toolbar respects each classic editor's own caret", () => {
  const initial = [paragraph("one", "One"), paragraph("two", "Two")];
  const changes: EleaBlock[][] = [];
  function Editor() {
    const [blocks, setBlocks] = useState(initial);
    return <ContentEditor mode="classic" onModeChange={() => {}} blocks={blocks} onBlocksChange={next => { changes.push(next); setBlocks(next); }} />;
  }
  render(<><Editor /><Editor /></>);
  const [first, second] = document.querySelectorAll<HTMLElement>(".elea-editor-workspace");
  const body = within(first!).getAllByRole("textbox", { name: en.editor.startWriting })[0]!;
  const open = (workspace: HTMLElement) => {
    const button = within(workspace).getByRole("button", { name: en.actions.addBlock });
    act(() => button.focus());
    fireEvent.click(button);
  };
  act(() => body.focus());
  open(first!);
  fireEvent.click(within(first!).getByRole("menuitem", { name: en.blockTypes.image }));
  assert.deepEqual(changes.at(-1)?.map(block => block.type), ["paragraph", "image", "paragraph"]);
  act(() => body.focus());
  open(second!);
  fireEvent.click(within(second!).getByRole("menuitem", { name: en.blockTypes.image }));
  assert.deepEqual(changes.at(-1)?.map(block => block.type), ["paragraph", "paragraph", "image"]);
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

test("the toolbar mode keeps the writing surface, fixes a bar above the document and formats selected text in that bar", () => {
  render(<Harness mode="toolbar" />);
  assert.ok(document.querySelector(".elea-doc-toolbar"));
  assert.equal(document.querySelectorAll(".elea-block-editor__head").length, 0);
  assert.equal(document.querySelectorAll(".elea-block-editor__gutter").length, 3);
  const bar = document.querySelector(".elea-doc-toolbar") as HTMLElement;
  const alpha = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  alpha.focus = () => {};
  fireEvent.focus(alpha);
  selectText(alpha, 0, 5);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  assert.equal(document.querySelector("[data-elea-bubble]"), null);
  assert.equal(screen.getAllByRole("toolbar").length, 1);
  fireEvent.mouseDown(within(bar).getByRole("button", { name: en.toolbar.h2 }));
  assert.ok(alpha.querySelector("h2"));
});

test("Toolbar exposes the configured insert actions and leaves an empty paragraph available for writing", () => {
  function Editor() {
    const [blocks, setBlocks] = useState([paragraph("empty", ""), paragraph("end", "End")]);
    return <ContentEditor blocks={blocks} onBlocksChange={setBlocks} mode="toolbar" blockTypes={["list", "quote"]} />;
  }
  render(<Editor />);
  const insert = within(screen.getByRole("group", { name: en.actions.insert }));
  assert.deepEqual(insert.getAllByRole("button").map(button => button.textContent), ["List", "Quote"]);
  const types = () => Array.from(document.querySelectorAll("[data-elea-block-type]"), block => block.getAttribute("data-elea-block-type"));
  fireEvent.click(insert.getByRole("button", { name: "Add Quote" }));
  assert.deepEqual(types(), ["paragraph", "paragraph", "quote"]);

  const empty = within(blockRoot("empty")).getByRole("textbox");
  fireEvent.focus(empty);
  assert.equal(screen.queryByRole("button", { name: en.actions.addBlock }), null);
  fireEvent.click(insert.getByRole("button", { name: "Add List" }));
  assert.deepEqual(types(), ["paragraph", "list", "paragraph", "quote"]);
  const item = screen.getByRole("textbox", { name: en.editor.listItemPlaceholder });
  fireEvent.focus(item);
  assert.equal((screen.getByRole("button", { name: en.list.indent }) as HTMLButtonElement).matches(":disabled"), false);
});

test("switching through Markdown edits the same document and keeps stored images and custom blocks", () => {
  const initial: EleaBlock[] = [
    paragraph("p", "<p>Keep <u>the emphasis</u></p>"),
    { id: "h", type: "header", data: { text: "Title", level: 2 } },
    { id: "photo", type: "image", data: { file: { url: "/assets/a.png", id: "file-a" }, caption: "Before", alt: "Photo" } },
    { id: "document", type: "attachment", data: { resourceId: "resource", title: "Report", extensionData: { edition: 2 } } },
    { id: "custom", type: "callout", data: { content: "Keep this" } },
  ];
  let current = initial;
  function Editor() {
    const [blocks, setBlocks] = useState(initial);
    const [mode, setMode] = useState<EditorMode>("default");
    return <ContentEditor blocks={blocks} onBlocksChange={(next) => { current = next; setBlocks([...next]); }} mode={mode} onModeChange={setMode} />;
  }
  render(<Editor />);
  function choose(name: string) {
    fireEvent.click(screen.getByRole("button", { name: /Editor mode/ }));
    const menu = within(screen.getByRole("menu", { name: "Editor mode" }));
    assert.equal(menu.getAllByRole("menuitemradio").length, 4);
    assert.equal(menu.queryAllByRole("menuitem").length, 0);
    fireEvent.click(menu.getByRole("menuitemradio", { name }));
  }
  choose("Markdown");
  assert.equal(current, initial);
  const source = screen.getByRole("textbox", { name: "Markdown source" }) as HTMLTextAreaElement;
  assert.match(source.value, /## Title/);
  assert.doesNotMatch(source.value, /elea:block/);
  assert.match(source.value, /!\[Photo\]/);
  const edited = source.value.replace("## Title", "### Revised title").replace('"Before"', '"After"') + "\n\nNew **paragraph**\n";
  fireEvent.change(source, { target: { value: edited } });
  assert.equal(source.value, edited);
  assert.equal(current[0], initial[0]);
  assert.deepEqual(current[1], { id: "h", type: "header", data: { text: "Revised title", level: 3 } });
  assert.deepEqual(current[2], { ...initial[2], data: { ...initial[2]?.data, caption: "After" } });
  assert.equal(current[3], initial[3]);
  assert.equal(current[4], initial[4]);
  assert.deepEqual(current[5]?.data, { text: "New <strong>paragraph</strong><br>" });

  choose("Classic");
  assert.ok(document.querySelector(".elea-doc-toolbar"));
  assert.ok(document.querySelector("[data-elea-block-id='p'] u"));
  assert.ok(document.querySelector(`[data-elea-block-id="${current[5]?.id}"] strong + br`));
  assert.equal(screen.queryByRole("textbox", { name: "Markdown source" }), null);
  choose("Markdown");
  assert.equal((screen.getByRole("textbox", { name: "Markdown source" }) as HTMLTextAreaElement).value, edited);
});
