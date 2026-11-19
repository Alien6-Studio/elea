import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { en, fr, type EleaBlock } from "@alien6-studio/elea-content";
import { FakeIntersectionObserver, resetSelection } from "./test/dom.js";
import { AddBlockButton } from "./AddBlockButton.js";
import { ContentEditor } from "./ContentEditor.js";
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

function Harness(props: { initial: EleaBlock[]; preview?: boolean; context?: Record<string, string> }) {
  const [blocks, setBlocks] = useState(props.initial);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  return (
    <>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} summary={summary} onSummaryChange={setSummary} showPreview={props.preview ?? false} context={props.context} enableVirtualization={false} />
      <pre data-testid="blocks">{JSON.stringify(blocks)}</pre>
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
  assert.equal(screen.getByRole("menuitem", { name: "widget" }).textContent, "wi");
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

  const listField = screen.getByRole("textbox", { name: en.editor.listItemPlaceholder });
  fireEvent.change(listField, { target: { value: "item one" } });
  fireEvent.keyDown(listField, { key: "Enter" });
  assert.equal(screen.getAllByRole("textbox", { name: en.editor.listItemPlaceholder }).length, 2);
  const second = screen.getAllByRole("textbox", { name: en.editor.listItemPlaceholder })[1] as HTMLTextAreaElement;
  fireEvent.keyDown(second, { key: "Backspace" });
  assert.equal(screen.getAllByRole("textbox", { name: en.editor.listItemPlaceholder }).length, 1);

  const headerField = screen.getByRole("textbox", { name: en.editor.headerPlaceholder });
  fireEvent.change(headerField, { target: { value: "New\nhead" } });
  assert.equal((headerField as HTMLTextAreaElement).value, "Newhead");
  fireEvent.change(screen.getByRole("combobox", { name: en.blockTypes.header }), { target: { value: "3" } });
  assert.ok(headerField.className.includes("elea-header-editor__text--3"));
  fireEvent.keyDown(headerField, { key: "Enter" });
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 80)); });
  assert.equal(document.querySelectorAll("[data-elea-block-id]").length, 4);

  const removeButtons = screen.getAllByRole("button", { name: en.actions.deleteBlock });
  fireEvent.click(removeButtons[0] as HTMLElement);
  assert.equal(document.querySelectorAll("[data-elea-block-id]").length, 3);
});

test("ContentEditor focus shows the paragraph toolbar and the preview renders through the viewer", () => {
  render(<Harness initial={[paragraph("p1", "<p>Hello <strong>there</strong></p>")]} />);
  const editable = screen.getByRole("textbox", { name: en.editor.startWriting });
  assert.equal(screen.queryByRole("toolbar"), null);
  fireEvent.focus(editable);
  assert.ok(screen.getByRole("toolbar"));
  fireEvent.mouseDown(screen.getByRole("button", { name: en.toolbar.bold }));
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
  await act(async () => { fireEvent.change(fileInput, { target: { files: [image] } }); await new Promise((resolve) => setTimeout(resolve, 0)); });
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
    <ContentProvider uploadImage={async () => { throw new Error("nope"); }}>
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

test("list editing keeps the nested items of untouched entries", async () => {
  const nested = { style: "unordered", items: ["first", { content: "parent", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "last"] };
  render(<Harness initial={[{ id: "l", type: "list", data: nested }]} />);
  const stateOf = () => JSON.parse(document.querySelector("[data-elea-block-id='l']")?.getAttribute("data-state") ?? "null");
  const fields = () => screen.getAllByRole("textbox", { name: en.editor.listItemPlaceholder }) as HTMLTextAreaElement[];
  assert.equal(fields().length, 3);
  assert.equal(document.querySelector(".elea-list-editor__nested")?.textContent, "+2");

  fireEvent.change(fields()[1] as HTMLTextAreaElement, { target: { value: "parent edited" } });
  let items = JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]")[0].data.items;
  assert.deepEqual(items, ["first", { content: "parent edited", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "last"]);

  fireEvent.keyDown(fields()[0] as HTMLTextAreaElement, { key: "Enter" });
  items = JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]")[0].data.items;
  assert.deepEqual(items, ["first", "", { content: "parent edited", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "last"]);

  fireEvent.keyDown(fields()[1] as HTMLTextAreaElement, { key: "Backspace" });
  items = JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]")[0].data.items;
  assert.deepEqual(items, ["first", { content: "parent edited", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "last"]);

  fireEvent.keyDown(fields()[2] as HTMLTextAreaElement, { key: "Backspace" });
  items = JSON.parse(document.querySelector("[data-testid='blocks']")?.textContent ?? "[]")[0].data.items;
  assert.deepEqual(items, ["first", { content: "parent edited", items: ["child a", { content: "child b", items: ["grandchild"] }] }, "last"]);
  void stateOf;
});
