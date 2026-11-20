import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { placeCaret } from "./test/dom.js";
import { en, fr, type EleaBlock } from "@alien6-studio/elea-content";
import { FakeIntersectionObserver, resetSelection } from "./test/dom.js";
import { AddBlockButton } from "./AddBlockButton.js";
import { ContentEditor, type ContentEditorHandle } from "./ContentEditor.js";
import { createRef } from "react";
import { ContentProvider, useContentServices, type PickedAttachment } from "./provider.js";
import { QuickAddButtons } from "./QuickAddButtons.js";
import { RichTextInput } from "./RichTextInput.js";
import { VirtualizedBlockList } from "./VirtualizedBlockList.js";

afterEach(() => {
  cleanup();
  resetSelection();
  FakeIntersectionObserver.reset();
});

const paragraph = (id: string, text = ""): EleaBlock => ({ id, type: "paragraph", data: { text } });

function Harness(props: { initial: EleaBlock[]; preview?: boolean; context?: Record<string, string>; history?: boolean; handle?: React.Ref<ContentEditorHandle> }) {
  const [blocks, setBlocks] = useState(props.initial);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  return (
    <>
      <ContentEditor ref={props.handle} blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} summary={summary} onSummaryChange={setSummary} showPreview={props.preview ?? false} context={props.context} enableVirtualization={false} history={props.history ?? true} historyGroupWithinMs={0} />
      <pre data-testid="blocks">{JSON.stringify(blocks)}</pre>
      <pre data-testid="title">{title}</pre>
    </>
  );
}

test("QuickAddButtons offers the seven blocks and reports the chosen type", () => {
  const chosen: string[] = [];
  render(<QuickAddButtons onAdd={(type) => chosen.push(type)} />);
  const items = screen.getAllByRole("menuitem");
  assert.equal(items.length, 7);
  fireEvent.click(screen.getByRole("menuitem", { name: en.blockTypes.image }));
  fireEvent.click(screen.getByRole("menuitem", { name: en.blockTypes.paragraph }));
  assert.deepEqual(chosen, ["image", "paragraph"]);
  cleanup();
  render(<QuickAddButtons onAdd={() => {}} types={["widget"]} />);
  // A type without a label or an icon is listed by its name
  assert.equal(screen.getByRole("menuitem", { name: "widget" }).textContent, "widget");
});

test("AddBlockButton toggles its menu, closes on Escape and after a choice", () => {
  const chosen: string[] = [];
  render(<AddBlockButton onAdd={(type) => chosen.push(type)} />);
  const trigger = screen.getByRole("button", { name: en.actions.addBlock });
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(trigger);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.ok(screen.getByRole("menu", { name: en.actions.blockTypesMenu }));
  fireEvent.keyDown(trigger, { key: "Escape" });
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("menuitem", { name: en.blockTypes.quote }));
  assert.deepEqual(chosen, ["quote"]);
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(trigger);
  fireEvent.click(trigger);
  assert.equal(screen.queryByRole("menu"), null);
});

test("ContentEditor renders fields and blocks, adds, edits and removes blocks", async () => {
  render(<Harness initial={[paragraph("p1", "First"), { id: "h1", type: "header", data: { text: "Head", level: 2 } }]} />);
  fireEvent.change(screen.getByRole("textbox", { name: en.editor.titlePlaceholder }), { target: { value: "My title" } });
  fireEvent.change(screen.getByRole("textbox", { name: en.editor.summaryPlaceholder }), { target: { value: "Sum" } });
  assert.equal(document.querySelectorAll("[data-elea-block-id]").length, 2);

  fireEvent.click(screen.getByRole("button", { name: en.actions.addBlock }));
  fireEvent.click(screen.getByRole("menuitem", { name: en.blockTypes.list }));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 80)); });
  const blocks = document.querySelectorAll("[data-elea-block-id]");
  assert.equal(blocks.length, 3);
  assert.equal(blocks[2]?.getAttribute("data-elea-block-type"), "list");

  // The whole list is one rich text field; typing in its item reaches the data
  const listField = screen.getByRole("textbox", { name: en.editor.listItemPlaceholder });
  const firstItem = listField.querySelector("li") as HTMLElement;
  firstItem.innerHTML = "item one";
  fireEvent.input(listField);
  assert.deepEqual(JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]")[2].data.items, ["item one"]);

  const headerField = screen.getByRole("textbox", { name: en.editor.headerPlaceholder });
  fireEvent.change(headerField, { target: { value: "New\nhead" } });
  assert.equal((headerField as HTMLTextAreaElement).value, "Newhead");
  fireEvent.click(screen.getByRole("combobox", { name: en.blockTypes.header }));
  fireEvent.click(screen.getByRole("option", { name: "H3" }));
  assert.ok(headerField.className.includes("elea-header-editor__text--3"));
  fireEvent.keyDown(headerField, { key: "Enter" });
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 80)); });
  assert.equal(document.querySelectorAll("[data-elea-block-id]").length, 4);

  // Deletion goes through the block menu in the margin
  fireEvent.click(screen.getAllByRole("button", { name: en.actions.blockMenu })[0] as HTMLElement);
  fireEvent.click(screen.getByRole("menuitem", { name: en.actions.deleteBlock }));
  assert.equal(document.querySelectorAll("[data-elea-block-id]").length, 3);
});

test("the toolbar floats above a text selection and leaves when the caret collapses", () => {
  render(<Harness initial={[paragraph("p1", "Hello there")]} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  // jsdom collapses the selection when a contentEditable takes focus; browsers keep it
  editable.focus = () => {};
  assert.equal(screen.queryByRole("toolbar"), null);
  fireEvent.focus(editable);
  // The caret alone shows nothing: Medium mode has no fixed bar
  assert.equal(screen.queryByRole("toolbar"), null);
  assert.equal(document.querySelector("[data-elea-bubble]"), null);
  const range = document.createRange();
  range.setStart(editable.firstChild as Node, 0);
  range.setEnd(editable.firstChild as Node, 5);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  assert.equal(screen.getAllByRole("toolbar").length, 1);
  const bubble = document.querySelector("[data-elea-bubble]") as HTMLElement;
  assert.ok(bubble);
  // The floating bar carries every format, headings included
  assert.ok(within(bubble).getByRole("button", { name: en.toolbar.h2 }));
  fireEvent.mouseDown(within(bubble).getByRole("button", { name: en.toolbar.bold }));
  assert.equal(editable.querySelector("strong")?.textContent, "Hello");
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  assert.equal(document.querySelector("[data-elea-bubble]"), null);
  assert.equal(screen.queryByRole("toolbar"), null);
  fireEvent.blur(editable, { relatedTarget: document.body });
  assert.equal(screen.queryByRole("toolbar"), null);
  cleanup();

  render(<Harness initial={[paragraph("p1", "<p>Hello <strong>there</strong></p>"), { id: "q", type: "quote", data: { text: "Q", caption: "C" } }]} preview />);
  assert.ok(document.querySelector(".elea-content"));
  assert.equal(document.querySelector("[data-elea-block-id='p1'] .elea-paragraph")?.innerHTML, "<p>Hello <strong>there</strong></p>");
  assert.equal(document.querySelector(".elea-quote__caption")?.textContent, "— C");
});

test("quote, image, video and attachment editors use the host services", async () => {
  const uploads: string[] = [];
  const picked: PickedAttachment = { id: "r1", title: "Report", type: "application/pdf", description: "Desc", url: "https://example.org/r.pdf" };
  render(
    <ContentProvider
      messages={fr}
      uploadImage={async (file, context) => {
        uploads.push(`${file.name}:${context.kind}`);
        return { url: "", id: "img-9" };
      }}
      resolveAssetUrl={(file) => `https://cdn.example/${file.id || file.url}`}
      renderAttachmentPicker={({ onSelect }) => <button type="button" onClick={() => onSelect(picked)}>pick</button>}
    >
      <Harness
        context={{ kind: "article" }}
        initial={[
          { id: "q", type: "quote", data: { text: "", caption: "" } },
          { id: "i", type: "image", data: { file: { url: "", id: "" }, caption: "" } },
          { id: "v", type: "video", data: { url: "", caption: "" } },
          { id: "a", type: "attachment", data: { resourceId: "", title: "", type: "", description: "", url: "" } },
        ]}
      />
    </ContentProvider>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: fr.editor.quotePlaceholder }), { target: { value: "Citation" } });
  fireEvent.change(screen.getByRole("textbox", { name: fr.editor.quoteAuthorPlaceholder }), { target: { value: "Auteur" } });
  assert.equal((screen.getByRole("textbox", { name: fr.editor.quoteAuthorPlaceholder }) as HTMLInputElement).value, "Auteur");

  const fileInput = document.querySelector("input[type=file]") as HTMLInputElement;
  const notImage = new File(["x"], "doc.txt", { type: "text/plain" });
  await act(async () => { fireEvent.change(fileInput, { target: { files: [notImage] } }); });
  assert.equal(screen.getByRole("alert").textContent, fr.image.errorInvalidType);
  const image = new File(["x"], "photo.png", { type: "image/png" });
  await act(async () => { fireEvent.change(fileInput, { target: { files: [image] } }); });
  // The picture is framed first; confirming sends it through the host service
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: fr.image.cropConfirm })); await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(uploads, ["photo.png:article"]);
  const img = document.querySelector("[data-elea-block-id='i'] img") as HTMLImageElement;
  assert.equal(img.getAttribute("src"), "https://cdn.example/img-9");
  fireEvent.change(screen.getByRole("textbox", { name: fr.image.captionPlaceholder }), { target: { value: "Légende" } });
  assert.equal(img.getAttribute("alt"), "Légende");

  const urlInput = screen.getByRole("textbox", { name: fr.video.urlPlaceholder });
  fireEvent.click(screen.getByRole("button", { name: fr.video.addButton }));
  assert.equal(screen.getByRole("alert").textContent, fr.video.errorEmpty);
  fireEvent.change(urlInput, { target: { value: "https://example.org/not-a-video" } });
  fireEvent.keyDown(urlInput, { key: "Enter" });
  assert.equal(screen.getByRole("alert").textContent, fr.video.errorInvalid);
  fireEvent.change(urlInput, { target: { value: "https://youtu.be/dQw4w9WgXcQ" } });
  fireEvent.keyDown(urlInput, { key: "Enter" });
  assert.ok(document.querySelector("[data-elea-block-id='v'] iframe"));
  fireEvent.change(screen.getByRole("textbox", { name: fr.video.captionPlaceholder }), { target: { value: "Clip" } });
  fireEvent.click(screen.getByRole("button", { name: fr.video.changeUrl }));
  assert.ok(screen.getByRole("textbox", { name: fr.video.urlPlaceholder }));

  fireEvent.click(screen.getByRole("button", { name: "pick" }));
  const card = document.querySelector("[data-elea-block-id='a'] .elea-attachment-card") as HTMLElement;
  assert.equal(within(card).getByText("Report").textContent, "Report");
  assert.ok(card.querySelector(".elea-attachment__icon--pdf"));
  fireEvent.click(screen.getByRole("button", { name: fr.attachment.remove }));
  assert.ok(screen.getByRole("button", { name: "pick" }));
});

test("without host services the image block cannot upload and the attachment block says so", async () => {
  render(<Harness initial={[{ id: "i", type: "image", data: { file: { url: "", id: "" }, caption: "" } }, { id: "a", type: "attachment", data: { resourceId: "", title: "", type: "", description: "", url: "" } }]} />);
  const fileInput = document.querySelector("input[type=file]") as HTMLInputElement;
  assert.equal(fileInput.disabled, true);
  assert.ok(screen.getByText(en.attachment.noPicker));
  const upload = new File(["x"], "photo.png", { type: "image/png" });
  await act(async () => { fireEvent.change(fileInput, { target: { files: [upload] } }); });
  assert.equal(screen.getByRole("alert").textContent, en.image.errorUpload);
});

test("a failing upload reports the error", async () => {
  render(
    <ContentProvider imageCrop={false} uploadImage={async () => { throw new Error("nope"); }}>
      <Harness initial={[{ id: "i", type: "image", data: { file: { url: "", id: "" }, caption: "" } }]} />
    </ContentProvider>,
  );
  const fileInput = document.querySelector("input[type=file]") as HTMLInputElement;
  await act(async () => { fireEvent.change(fileInput, { target: { files: [new File(["x"], "p.png", { type: "image/png" })] } }); await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.equal(screen.getByRole("alert").textContent, en.image.errorUpload);
  const zone = document.querySelector(".elea-dropzone") as HTMLElement;
  fireEvent.dragOver(zone);
  assert.ok(zone.className.includes("elea-dropzone--active"));
  fireEvent.dragLeave(zone);
  assert.equal(zone.className.includes("elea-dropzone--active"), false);
  await act(async () => { fireEvent.drop(zone, { dataTransfer: { files: [new File(["x"], "d.png", { type: "image/png" })] } }); await new Promise((resolve) => setTimeout(resolve, 0)); });
});

test("custom block editors and the provider defaults", () => {
  const Widget = ({ onUpdate }: { onUpdate: (data: Record<string, unknown>) => void }) => <button type="button" onClick={() => onUpdate({ name: "set" })}>widget</button>;
  const changes: EleaBlock[][] = [];
  render(<ContentEditor blocks={[{ id: "w", type: "widget", data: { name: "" } }]} onBlocksChange={(next) => changes.push(next)} editors={{ widget: Widget }} enableVirtualization={false} blockTypes={["widget"]} />);
  fireEvent.click(screen.getByRole("button", { name: "widget" }));
  assert.deepEqual(changes[0]?.[0]?.data, { name: "set" });
  assert.equal(screen.queryByRole("textbox", { name: en.editor.titlePlaceholder }), null);
  let seen = "";
  const Probe = () => { seen = useContentServices().messages.toolbar.bold; return null; };
  render(<Probe />);
  assert.equal(seen, en.toolbar.bold);
});

test("VirtualizedBlockList renders placeholders beyond the threshold and reveals blocks on intersection", () => {
  const blocks = Array.from({ length: 4 }, (_, index) => (index === 2 ? ({ id: "img", type: "image", data: { file: { url: "", id: "" }, caption: "" } } as EleaBlock) : paragraph(`p${index}`, `${index}`)));
  const noop = () => {};
  const { rerender, unmount } = render(
    <VirtualizedBlockList blocks={blocks} focusedBlock="p3" onBlockFocus={noop} onBlockBlur={noop} onBlockUpdate={noop} onBlockRemove={noop} onAddBlockAfter={noop} threshold={2} />,
  );
  assert.equal(document.querySelectorAll(".elea-block-slot--placeholder").length, 3);
  assert.equal(document.querySelectorAll(".elea-block-editor").length, 1);
  const imagePlaceholder = document.querySelector("[data-elea-block-id='img']") as HTMLElement;
  assert.equal(imagePlaceholder.style.minHeight, "300px");
  const observer = FakeIntersectionObserver.instances.at(-1) as FakeIntersectionObserver;
  assert.deepEqual(observer.options, { rootMargin: "400px 0px", threshold: 0 });
  act(() => observer.enter(document.querySelector("[data-elea-block-id='p0']") as Element));
  assert.equal(document.querySelectorAll(".elea-block-editor").length, 2);
  rerender(<VirtualizedBlockList blocks={blocks} focusedBlock={null} onBlockFocus={noop} onBlockBlur={noop} onBlockUpdate={noop} onBlockRemove={noop} onAddBlockAfter={noop} threshold={10} />);
  assert.equal(document.querySelectorAll(".elea-block-editor").length, 4);
  unmount();
  assert.equal(observer.disconnected, true);
});

test("RichTextInput formats, limits length and syncs its value", () => {
  const changes: string[] = [];
  const { rerender } = render(<RichTextInput value="<p>Hello world</p>" onChange={(next) => changes.push(next)} maxLength={12} />);
  const field = screen.getByRole("textbox", { name: en.editor.inputPlaceholder });
  field.focus = () => {};
  const text = field.querySelector("p")?.firstChild as Node;
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 5);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.bold }));
  assert.equal(field.querySelector("strong")?.textContent, "Hello");
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.removeFormat }));
  assert.equal(field.querySelector("strong"), null);
  fireEvent.keyDown(field, { key: "a" });
  fireEvent.keyDown(field, { key: "ArrowLeft" });
  const end = document.createRange();
  end.selectNodeContents(field.querySelector("p") as Element);
  end.collapse(false);
  selection.removeAllRanges();
  selection.addRange(end);
  fireEvent.paste(field, { clipboardData: { getData: () => "12345" } });
  assert.equal(field.textContent?.length, 12);
  const words = document.createRange();
  words.selectNodeContents(field);
  selection.removeAllRanges();
  selection.addRange(words);
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.bulletList }));
  assert.ok(field.querySelector("ul li"));
  assert.ok(changes.length >= 3);
  rerender(<RichTextInput value="<p>Replaced</p>" onChange={(next) => changes.push(next)} />);
  assert.equal(field.textContent, "Replaced");
  rerender(<RichTextInput value="<p>Replaced</p>" onChange={() => {}} disabled />);
  assert.equal(screen.queryByRole("toolbar"), null);
  assert.equal(field.getAttribute("contenteditable"), "false");
});

/** The list field and its items as the browser lays them out. */
const listField = () => screen.getByRole("textbox", { name: en.editor.listItemPlaceholder }) as HTMLElement;
const listItemsOf = (field: HTMLElement) => [...field.querySelectorAll("li")] as HTMLElement[];
const caretIn = (item: HTMLElement, atEnd = true) => {
  const text = [...item.childNodes].find((node) => node.nodeType === 3) ?? item;
  placeCaret(text, atEnd && text.nodeType === 3 ? (text.textContent ?? "").length : 0);
};
const itemsState = () => JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]")[0].data.items;

test("a nested list is one field: edits reach the data, nested items and marks survive", () => {
  const nested = { style: "unordered", items: ["first", { content: "parent", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "<strong>last</strong>"] };
  render(<Harness initial={[{ id: "l", type: "list", data: nested }]} />);
  const field = listField();
  assert.equal(listItemsOf(field).length, 6);
  // Levels flip their tag as the viewer renders them
  assert.equal(field.querySelector("ul > li > ol > li > ul")?.tagName, "UL");
  const parent = listItemsOf(field)[1] as HTMLElement;
  (parent.firstChild as Text).data = "parent edited";
  fireEvent.input(field);
  assert.deepEqual(itemsState(), ["first", { content: "parent edited", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "<strong>last</strong>"]);
  // An external change (undo, the block menu) rewrites the field; an echo does not
  const html = field.innerHTML;
  fireEvent.input(field);
  assert.equal(field.innerHTML, html);
});

test("the list toolbar persists marker changes and moves a selected run without losing its text", () => {
  render(<Harness initial={[{ id: "l", type: "list", data: { style: "unordered", items: ["first", { content: "parent", items: ["one", "two"] }, "last"] } }]} />);
  const field = listField();
  field.focus();
  fireEvent.focus(field);
  const [first, last] = [...field.querySelectorAll("li > ol > li")];
  assert.ok(first?.firstChild && last?.firstChild);
  const selection = document.getSelection();
  assert.ok(selection);
  selection.setBaseAndExtent(first.firstChild, 0, last.firstChild, 3);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });

  const button = (name: string) => screen.getByRole("button", { name });
  fireEvent.mouseDown(button(en.list.square));
  assert.deepEqual(itemsState()[1], { content: "parent", items: ["one", "two"], childrenMarker: "square" });
  fireEvent.click(button(en.list["lower-roman"]));
  assert.equal(itemsState()[1].childrenMarker, "lower-roman");
  assert.equal(selection.toString().replace(/\s+/g, ""), "onetwo");

  fireEvent.mouseDown(button(en.list.outdent));
  assert.deepEqual(itemsState(), ["first", "parent", "one", "two", "last"]);
  fireEvent.mouseDown(button(en.list.indent));
  assert.deepEqual(itemsState(), ["first", { content: "parent", items: ["one", "two"] }, "last"]);
});

test("outdenting at the first level makes paragraphs and keeps the lists around them", () => {
  render(<Harness initial={[{
    id: "l", type: "list", data: {
      style: "ordered", marker: "lower-roman",
      items: ["before", { content: "<strong>one</strong>", items: ["child"], childrenMarker: "square" }, "two", "after"],
    },
  }]} />);
  const field = listField();
  field.focus();
  fireEvent.focus(field);
  const start = field.querySelector("strong")?.firstChild;
  const end = field.querySelector(":scope > ol > li:last-child")?.firstChild;
  const selection = document.getSelection();
  assert.ok(start && end && selection);
  selection.setBaseAndExtent(start, 0, end, 0);
  act(() => { document.dispatchEvent(new window.Event("selectionchange")); });
  fireEvent.mouseDown(screen.getByRole("button", { name: en.list.outdent }));

  assert.deepEqual(blocksState().map(({ type, data }) => [type, data]), [
    ["list", { style: "ordered", marker: "lower-roman", items: ["before"] }],
    ["paragraph", { text: "<strong>one</strong>" }],
    ["list", { style: "unordered", marker: "square", items: ["child"] }],
    ["paragraph", { text: "two" }],
    ["list", { style: "ordered", marker: "lower-roman", items: ["after"] }],
  ]);
});

test("Enter splits an item, Backspace at the start joins it to the previous one, an empty last item leaves the list", async () => {
  render(<Harness initial={[{ id: "l", type: "list", data: { style: "ordered", items: ["one", "two"] } }]} />);
  const field = listField();
  field.focus();
  fireEvent.focus(field);
  caretIn(listItemsOf(field)[0] as HTMLElement);
  fireEvent.keyDown(field, { key: "Enter" });
  assert.deepEqual(itemsState(), ["one", "", "two"]);
  // Backspace at the start of the third item joins it to the empty one
  caretIn(listItemsOf(field)[2] as HTMLElement, false);
  fireEvent.keyDown(field, { key: "Backspace" });
  assert.deepEqual(itemsState(), ["one", "two"]);
  // Backspace at the start of the first item: it becomes a paragraph before the rest
  caretIn(listItemsOf(field)[0] as HTMLElement, false);
  fireEvent.keyDown(field, { key: "Backspace" });
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.text ?? block.data.items]), [["paragraph", "one"], ["list", ["two"]]]);
  cleanup();

  render(<Harness initial={[{ id: "l", type: "list", data: { style: "unordered", items: ["one", ""] } }]} />);
  const second = listField();
  second.focus();
  caretIn(listItemsOf(second)[1] as HTMLElement, false);
  fireEvent.keyDown(second, { key: "Enter" });
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.items ?? block.data.text]), [["list", ["one"]], ["paragraph", ""]]);
  cleanup();

  // Alone and empty, Enter or Backspace turns the list into a paragraph; an empty middle item splits the list
  render(<Harness initial={[{ id: "l", type: "list", data: { style: "unordered", items: [""] } }]} />);
  const alone = listField();
  alone.focus();
  caretIn(listItemsOf(alone)[0] as HTMLElement, false);
  fireEvent.keyDown(alone, { key: "Enter" });
  await tick();
  assert.deepEqual(blocksState().map((block) => block.type), ["paragraph"]);
  cleanup();
  render(<Harness initial={[{ id: "l", type: "list", data: { style: "unordered", items: ["a", "", "c"] } }]} />);
  const middle = listField();
  middle.focus();
  caretIn(listItemsOf(middle)[1] as HTMLElement, false);
  fireEvent.keyDown(middle, { key: "Enter" });
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.items ?? block.data.text]), [["list", ["a"]], ["paragraph", ""], ["list", ["c"]]]);
  cleanup();
  render(<Harness initial={[{ id: "l", type: "list", data: { style: "unordered", items: ["", "b"] } }]} />);
  const leading = listField();
  leading.focus();
  caretIn(listItemsOf(leading)[0] as HTMLElement, false);
  fireEvent.keyDown(leading, { key: "Enter" });
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.items ?? block.data.text]), [["paragraph", ""], ["list", ["b"]]]);
});

test("Tab nests an item under the previous one and Shift+Tab brings it back with what followed", () => {
  render(<Harness initial={[{ id: "l", type: "list", data: { style: "ordered", items: ["one", "two", "three"] } }]} />);
  const field = listField();
  field.focus();
  // The first item has nothing to nest under
  caretIn(listItemsOf(field)[0] as HTMLElement);
  fireEvent.keyDown(field, { key: "Tab" });
  assert.deepEqual(itemsState(), ["one", "two", "three"]);
  caretIn(listItemsOf(field)[1] as HTMLElement);
  fireEvent.keyDown(field, { key: "Tab" });
  assert.deepEqual(itemsState(), [{ content: "one", items: ["two"] }, "three"]);
  // Nested under an ordered list, the sublist flips to bullets
  assert.equal(field.querySelector("li > ul")?.tagName, "UL");
  caretIn(listItemsOf(field)[2] as HTMLElement);
  fireEvent.keyDown(field, { key: "Tab" });
  assert.deepEqual(itemsState(), [{ content: "one", items: ["two", "three"] }]);
  // Enter on an empty nested item brings it up a level instead of leaving the list
  caretIn(listItemsOf(field)[1] as HTMLElement);
  fireEvent.keyDown(field, { key: "Enter" });
  assert.deepEqual(itemsState(), [{ content: "one", items: ["two", "", "three"] }]);
  caretIn(listItemsOf(field)[2] as HTMLElement, false);
  fireEvent.keyDown(field, { key: "Enter" });
  assert.deepEqual(itemsState(), [{ content: "one", items: ["two"] }, { content: "", items: ["three"] }]);
  // Shift+Tab on "two" takes it back up; Backspace at the start of a nested item does the same
  caretIn(listItemsOf(field)[1] as HTMLElement);
  fireEvent.keyDown(field, { key: "Tab", shiftKey: true });
  assert.deepEqual(itemsState(), ["one", "two", { content: "", items: ["three"] }]);
  caretIn(listItemsOf(field)[3] as HTMLElement, false);
  fireEvent.keyDown(field, { key: "Backspace" });
  assert.deepEqual(itemsState(), ["one", "two", "", "three"]);
  // Joining an item that carries children hands them to the previous one
  caretIn(listItemsOf(field)[3] as HTMLElement);
  fireEvent.keyDown(field, { key: "Tab" });
  assert.deepEqual(itemsState(), ["one", "two", { content: "", items: ["three"] }]);
  caretIn(listItemsOf(field)[2] as HTMLElement, false);
  fireEvent.keyDown(field, { key: "Backspace" });
  assert.deepEqual(itemsState(), ["one", { content: "two", items: ["three"] }]);
});

test("code blocks are edited verbatim and the other legacy blocks keep their data", () => {
  const blocks = [
    { id: "c", type: "code", data: { code: "const a = 1;" } },
    { id: "d", type: "delimiter", data: {} },
    { id: "t", type: "table", data: { content: [["Name", "Role"], ["Ada", "Engineer"]] } },
    { id: "r", type: "raw", data: { html: "<marquee>old</marquee>" } },
  ];
  render(<Harness initial={blocks} />);
  const code = screen.getByRole("textbox", { name: en.editor.codePlaceholder }) as HTMLTextAreaElement;
  assert.equal(code.value, "const a = 1;");
  fireEvent.change(code, { target: { value: "const a = 1;\nconst b = 2;" } });
  const state = () => JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]");
  assert.equal(state()[0].data.code, "const a = 1;\nconst b = 2;");
  assert.ok(document.querySelector(".elea-delimiter-editor"));
  // The table and the raw block have no form: shown as text, their data untouched
  const kept = screen.getAllByRole("group");
  assert.equal(kept.length, 2);
  assert.equal(kept[0]?.getAttribute("aria-label"), en.blockTypes.table);
  assert.ok(kept[0]?.textContent?.includes("Ada"));
  assert.deepEqual(state()[2].data, blocks[2]?.data);
  assert.deepEqual(state()[3].data, blocks[3]?.data);
  assert.equal(document.querySelectorAll("[contenteditable='true']").length, 0);
});

// Focus moves on the next frame and retries 50 ms later; wait for both outside act, then flush React
const tick = async () => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  await act(async () => {});
};
const blocksState = () => JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]") as EleaBlock[];

test("writing flow: Enter makes a paragraph, arrows cross blocks, Backspace and Delete merge paragraphs", async () => {
  render(<Harness initial={[paragraph("a", "Hello world"), { id: "h", type: "header", data: { text: "Head", level: 2 } }, paragraph("b", "Second")]} />);
  const editable = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  placeCaret(editable.firstChild as Node, 5);
  fireEvent.keyDown(editable, { key: "Enter" });
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.text]), [["paragraph", "Hello"], ["paragraph", " world"], ["header", "Head"], ["paragraph", "Second"]]);
  const second = screen.getAllByRole("textbox", { name: en.editor.startWriting })[1] as HTMLElement;
  assert.ok(document.activeElement === second, "focus should be on the expected field");

  placeCaret(second.firstChild as Node, 0);
  fireEvent.keyDown(second, { key: "Backspace" });
  await tick();
  assert.deepEqual(blocksState().map((block) => block.data.text), ["Hello world", "Head", "Second"]);
  const merged = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  assert.ok(document.activeElement === merged, "focus should be on the expected field");
  assert.equal(window.getSelection()?.getRangeAt(0).startOffset, 5);

  placeCaret(merged.firstChild as Node, 11);
  fireEvent.keyDown(merged, { key: "ArrowDown" });
  await tick();
  const headerField = screen.getByRole("textbox", { name: en.editor.headerPlaceholder }) as HTMLTextAreaElement;
  assert.ok(document.activeElement === headerField, "focus should be on the expected field");
  fireEvent.keyDown(headerField, { key: "ArrowDown" });
  await tick();
  const last = screen.getAllByRole("textbox", { name: en.editor.startWriting })[1] as HTMLElement;
  assert.ok(document.activeElement === last, "focus should be on the expected field");
  fireEvent.keyDown(last, { key: "ArrowUp" });
  await tick();
  assert.ok(document.activeElement === headerField, "focus should be on the expected field");
  assert.equal(headerField.selectionStart, 4);
  fireEvent.keyDown(headerField, { key: "ArrowUp" });
  await tick();
  assert.ok(document.activeElement === screen.getAllByRole("textbox", { name: en.editor.startWriting })[0], "focus should be on the expected field");

  fireEvent.change(headerField, { target: { value: "" } });
  fireEvent.keyDown(headerField, { key: "Backspace" });
  await tick();
  assert.deepEqual(blocksState().map((block) => block.type), ["paragraph", "paragraph"]);
  const first = screen.getAllByRole("textbox", { name: en.editor.startWriting })[0] as HTMLElement;
  placeCaret(first.firstChild as Node, 11);
  fireEvent.keyDown(first, { key: "Delete" });
  await tick();
  assert.deepEqual(blocksState().map((block) => block.data.text), ["Hello worldSecond"]);
});

const typeInto = (editable: HTMLElement, text: string) => {
  editable.textContent = text;
  placeCaret(editable.firstChild as Node, text.length);
  fireEvent.input(editable);
};

test("typing shortcuts turn an empty paragraph into a heading, a list or a quote", async () => {
  render(<Harness initial={[paragraph("p", "")]} />);
  typeInto(screen.getByRole("textbox", { name: en.editor.startWriting }), "## ");
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.level]), [["header", 2]]);
  assert.ok(document.activeElement === screen.getByRole("textbox", { name: en.editor.headerPlaceholder }), "the heading field takes the caret");
  cleanup();
  render(<Harness initial={[paragraph("p", "")]} />);
  typeInto(screen.getByRole("textbox", { name: en.editor.startWriting }), "- ");
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.style]), [["list", "unordered"]]);
  cleanup();
  render(<Harness initial={[paragraph("p", "")]} />);
  typeInto(screen.getByRole("textbox", { name: en.editor.startWriting }), "1. ");
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.style]), [["list", "ordered"]]);
  cleanup();
  render(<Harness initial={[paragraph("p", "")]} />);
  typeInto(screen.getByRole("textbox", { name: en.editor.startWriting }), "> ");
  await tick();
  assert.deepEqual(blocksState().map((block) => block.type), ["quote"]);
  cleanup();
  render(<Harness initial={[paragraph("p", "")]} />);
  typeInto(screen.getByRole("textbox", { name: en.editor.startWriting }), "#hashtag ");
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.text]), [["paragraph", "#hashtag "]]);
});

test("the slash menu lists, filters and picks block types from the keyboard", async () => {
  render(<Harness initial={[paragraph("p", "")]} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  fireEvent.focus(editable);
  typeInto(editable, "/");
  const menu = screen.getByRole("listbox");
  assert.equal(within(menu).getAllByRole("option").length, 7);
  typeInto(editable, "/qu");
  assert.deepEqual(within(screen.getByRole("listbox")).getAllByRole("option").map((option) => option.textContent), [en.blockTypes.quote]);
  typeInto(editable, "/zzz");
  assert.ok(within(screen.getByRole("listbox")).getByText(en.slash.empty));
  typeInto(editable, "/");
  fireEvent.keyDown(editable, { key: "ArrowDown" });
  fireEvent.keyDown(editable, { key: "ArrowDown" });
  fireEvent.keyDown(editable, { key: "ArrowUp" });
  assert.equal(within(screen.getByRole("listbox")).getAllByRole("option")[1]?.getAttribute("aria-selected"), "true");
  typeInto(editable, "/he");
  fireEvent.keyDown(editable, { key: "Enter" });
  await tick();
  assert.deepEqual(blocksState().map((block) => [block.type, block.data.text]), [["header", ""]]);
  assert.equal(screen.queryByRole("listbox"), null);
  cleanup();

  render(<Harness initial={[paragraph("p", "")]} />);
  const field = screen.getByRole("textbox", { name: en.editor.startWriting });
  fireEvent.focus(field);
  typeInto(field, "/");
  fireEvent.keyDown(field, { key: "Escape" });
  assert.equal(screen.queryByRole("listbox"), null);
  typeInto(field, "/");
  fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: en.blockTypes.image }));
  await tick();
  assert.deepEqual(blocksState().map((block) => block.type), ["image"]);
  cleanup();

  render(<Harness initial={[paragraph("p", "")]} />);
  const other = screen.getByRole("textbox", { name: en.editor.startWriting });
  fireEvent.focus(other);
  typeInto(other, "/a b");
  assert.equal(screen.queryByRole("listbox"), null);
  typeInto(other, "/");
  fireEvent.blur(other, { relatedTarget: document.body });
  assert.equal(screen.queryByRole("listbox"), null);
});

test("undo and redo walk the document history, title included, and a new edit drops the redo branch", async () => {
  const handle = createRef<ContentEditorHandle>();
  render(<Harness initial={[paragraph("p", "one")]} handle={handle} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  const root = document.querySelector(".elea-content-editor") as HTMLElement;
  assert.equal(handle.current?.canUndo, false);
  typeInto(editable, "one two");
  typeInto(editable, "one two three");
  fireEvent.change(screen.getByRole("textbox", { name: en.editor.titlePlaceholder }), { target: { value: "Title" } });
  assert.equal(handle.current?.canUndo, true);
  assert.equal(handle.current?.canRedo, false);

  fireEvent.keyDown(editable, { key: "z", ctrlKey: true });
  assert.equal(screen.getByTestId("title").textContent, "");
  assert.equal(blocksState()[0]?.data.text, "one two three");
  fireEvent.keyDown(editable, { key: "z", ctrlKey: true });
  assert.equal(blocksState()[0]?.data.text, "one two");
  assert.equal(editable.innerHTML, "one two");
  fireEvent.keyDown(root, { key: "Z", ctrlKey: true, shiftKey: true });
  assert.equal(blocksState()[0]?.data.text, "one two three");
  fireEvent.keyDown(root, { key: "y", metaKey: true });
  assert.equal(screen.getByTestId("title").textContent, "Title");
  assert.equal(handle.current?.canRedo, false);
  act(() => handle.current?.undo());
  act(() => handle.current?.undo());
  act(() => handle.current?.undo());
  assert.equal(blocksState()[0]?.data.text, "one");
  assert.equal(handle.current?.canUndo, false);
  act(() => handle.current?.undo());
  assert.equal(handle.current?.canRedo, true);
  typeInto(screen.getByRole("textbox", { name: en.editor.startWriting }), "fresh");
  assert.equal(handle.current?.canRedo, false);
  act(() => handle.current?.redo());
  assert.equal(blocksState()[0]?.data.text, "fresh");
});

test("history can be switched off and typing bursts undo together", async () => {
  const handle = createRef<ContentEditorHandle>();
  const { unmount } = render(<Harness initial={[paragraph("p", "one")]} history={false} handle={handle} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  typeInto(editable, "one two");
  fireEvent.keyDown(editable, { key: "z", ctrlKey: true });
  assert.equal(blocksState()[0]?.data.text, "one two");
  unmount();

  function Grouped() {
    const [blocks, setBlocks] = useState<EleaBlock[]>([paragraph("p", "a")]);
    return (
      <>
        <ContentEditor blocks={blocks} onBlocksChange={setBlocks} enableVirtualization={false} historyGroupWithinMs={10_000} />
        <pre data-testid="blocks">{JSON.stringify(blocks)}</pre>
      </>
    );
  }
  render(<Grouped />);
  const field = screen.getByRole("textbox", { name: en.editor.startWriting });
  typeInto(field, "ab");
  typeInto(field, "abc");
  typeInto(field, "abcd");
  fireEvent.keyDown(field, { key: "z", ctrlKey: true });
  assert.equal(blocksState()[0]?.data.text, "a");
  fireEvent.keyDown(field, { key: "z", ctrlKey: true, shiftKey: true });
  assert.equal(blocksState()[0]?.data.text, "abcd");
});

test("the block menu changes the shape of a text block and keeps its text", () => {
  render(<Harness initial={[paragraph("p", "<p>First <strong>line</strong></p><p>Second</p>"), { id: "h", type: "header", data: { text: "Title", level: 2 } }, { id: "l", type: "list", data: { style: "unordered", items: ["one", { content: "two", items: ["deep"] }] } }, { id: "i", type: "image", data: { file: { url: "", id: "" }, caption: "" } }]} />);
  const state = () => JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]");
  const menuOf = (id: string) => within(document.querySelector(`[data-elea-block-id='${id}']`) as HTMLElement).getByRole("button", { name: en.actions.blockMenu });

  // The paragraph becomes a bullet list: one item per paragraph, marks dropped
  fireEvent.click(menuOf("p"));
  assert.equal(screen.getByRole("menuitemradio", { name: en.blockTypes.paragraph }).getAttribute("aria-checked"), "true");
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.toolbar.bulletList }));
  assert.equal(state()[0].type, "list");
  assert.deepEqual(state()[0].data.items, ["First line", "Second"]);
  assert.equal(screen.queryByRole("menu"), null);
  // The same type only changes shape: numbered, items kept
  fireEvent.click(menuOf("p"));
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.toolbar.orderedList }));
  assert.equal(state()[0].data.style, "ordered");
  assert.deepEqual(state()[0].data.items, ["First line", "Second"]);
  // Picking the current shape changes nothing
  fireEvent.click(menuOf("p"));
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.toolbar.orderedList }));
  assert.equal(state()[0].data.style, "ordered");
  // Heading level, then heading to quote
  fireEvent.click(menuOf("h"));
  assert.equal(screen.getByRole("menuitemradio", { name: en.toolbar.h2 }).getAttribute("aria-checked"), "true");
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.toolbar.h3 }));
  assert.equal(state()[1].data.level, 3);
  assert.equal(state()[1].data.text, "Title");
  fireEvent.click(menuOf("h"));
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.blockTypes.quote }));
  assert.equal(state()[1].type, "quote");
  assert.equal(state()[1].data.text, "Title");
  // A nested list becomes paragraphs, one per top-level item
  fireEvent.click(menuOf("l"));
  fireEvent.click(screen.getByRole("menuitemradio", { name: en.blockTypes.paragraph }));
  assert.equal(state()[2].type, "paragraph");
  assert.equal(state()[2].data.text, "<p>one</p><p>two</p>");
  // A media block offers deletion only; Escape and a click outside close the menu
  fireEvent.click(menuOf("i"));
  assert.equal(screen.queryByRole("menuitemradio"), null);
  assert.ok(screen.getByRole("menuitem", { name: en.actions.deleteBlock }));
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(menuOf("i"));
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(menuOf("i"));
  fireEvent.click(screen.getByRole("menuitem", { name: en.actions.deleteBlock }));
  assert.equal(state().length, 3);
});

test("an empty focused paragraph offers the add menu in its margin and converts in place", () => {
  render(<Harness initial={[paragraph("p", "")]} />);
  // Only the plus at the bottom of the editor before the paragraph takes the focus
  assert.equal(screen.getAllByRole("button", { name: en.actions.addBlock }).length, 1);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  editable.focus = () => {};
  fireEvent.focus(editable);
  // The margin shows the plus; the bottom one is there too, so two in all
  const buttons = screen.getAllByRole("button", { name: en.actions.addBlock });
  assert.equal(buttons.length, 2);
  fireEvent.click(buttons[0] as HTMLElement);
  fireEvent.click(screen.getByRole("menuitem", { name: en.blockTypes.quote }));
  const state = JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]");
  assert.equal(state.length, 1);
  assert.equal(state[0].type, "quote");
});

test("pictures are framed before upload, then replaced or removed from under the picture", async () => {
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  URL.createObjectURL = () => "blob:preview";
  URL.revokeObjectURL = () => {};
  const uploads: string[] = [];
  const { unmount } = render(
    <ContentProvider uploadImage={async (file) => { uploads.push(`${file.name}:${file.type}`); return { url: `https://cdn.example/${file.name}`, id: "" }; }}>
      <Harness initial={[{ id: "i", type: "image", data: { file: { url: "", id: "" }, caption: "Kept" } }]} />
    </ContentProvider>,
  );
  const fileInput = () => document.querySelector("[data-elea-block-id='i'] input[type=file]") as HTMLInputElement;
  await act(async () => { fireEvent.change(fileInput(), { target: { files: [new File(["x"], "photo.png", { type: "image/png" })] } }); });
  // The cropper shows the preview; cancelling returns to the drop zone
  assert.ok(screen.getByRole("img", { name: en.image.cropImage }));
  fireEvent.click(screen.getByRole("button", { name: en.image.cropCancel }));
  assert.equal(screen.queryByRole("img", { name: en.image.cropImage }), null);
  await act(async () => { fireEvent.change(fileInput(), { target: { files: [new File(["x"], "photo.png", { type: "image/png" })] } }); });
  // No canvas under jsdom: confirming sends the file as picked
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: en.image.cropConfirm })); await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(uploads, ["photo.png:image/png"]);
  const img = document.querySelector("[data-elea-block-id='i'] img") as HTMLImageElement;
  assert.equal(img.getAttribute("src"), "https://cdn.example/photo.png");
  assert.equal(img.getAttribute("alt"), "Kept");
  // Replace opens a picker; a new file goes through the frame again
  let clicks = 0;
  (document.querySelector("[data-elea-block-id='i'] .elea-media-block__actions input[type=file]") as HTMLInputElement).click = () => { clicks += 1; };
  fireEvent.click(screen.getByRole("button", { name: en.image.replace }));
  assert.equal(clicks, 1);
  await act(async () => { fireEvent.change(document.querySelector("[data-elea-block-id='i'] .elea-media-block__actions input[type=file]") as HTMLInputElement, { target: { files: [new File(["y"], "other.png", { type: "image/png" })] } }); });
  assert.ok(screen.getByRole("img", { name: en.image.cropImage }));
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: en.image.cropConfirm })); await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.deepEqual(uploads, ["photo.png:image/png", "other.png:image/png"]);
  // Remove brings the drop zone back and keeps the caption for the next picture
  fireEvent.click(screen.getByRole("button", { name: en.image.remove }));
  assert.ok(fileInput());
  const state = JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]");
  assert.equal(state[0].data.file.url, "");
  assert.equal(state[0].data.caption, "Kept");
  unmount();
  // With cropping off the picture goes straight up
  render(
    <ContentProvider imageCrop={false} uploadImage={async (file) => { uploads.push(file.name); return { url: "https://cdn.example/direct.png", id: "" }; }}>
      <Harness initial={[{ id: "i", type: "image", data: { file: { url: "", id: "" }, caption: "" } }]} />
    </ContentProvider>,
  );
  await act(async () => { fireEvent.change(fileInput(), { target: { files: [new File(["z"], "direct.png", { type: "image/png" })] } }); await new Promise((resolve) => setTimeout(resolve, 0)); });
  assert.equal(uploads.at(-1), "direct.png");
  assert.ok(document.querySelector("[data-elea-block-id='i'] img"));
  URL.createObjectURL = original.create;
  URL.revokeObjectURL = original.revoke;
});
