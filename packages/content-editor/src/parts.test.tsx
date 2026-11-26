import { window } from "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { en, fr, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor, type ContentEditorProps } from "./ContentEditor.js";
import { cropperPart, loadEditorParts, part, previewPart, sourcePart, usePart, type Part } from "./parts.js";
import { ContentProvider, type ImageUploadOptions } from "./provider.js";

afterEach(cleanup);

const blocks: EleaBlock[] = [{ id: "p", type: "paragraph", data: { text: "Body" } }];

function Editor(props: Readonly<Partial<ContentEditorProps>>) {
  return <ContentEditor blocks={blocks} onBlocksChange={() => {}} title="Title" onTitleChange={() => {}} summary="" onSummaryChange={() => {}} enableVirtualization={false} {...props} />;
}

const root = () => document.querySelector(".elea-content-editor") as HTMLElement;
/** Whether the blocks are there to edit. */
const editing = () => document.querySelector(".elea-block-slot") !== null;

test("a part loads once, is shared by those who ask together and starts over after a failure", async () => {
  let calls = 0;
  const flaky = part(async () => {
    calls += 1;
    if (calls === 1) throw new Error("offline");
    return { name: "loaded" };
  });
  let heard = 0;
  const unsubscribe = flaky.subscribe(() => { heard += 1; });
  assert.equal(flaky.read(), undefined);
  await assert.rejects(flaky.load(), /offline/);
  assert.equal(flaky.read(), undefined);
  const [first, second] = await Promise.all([flaky.load(), flaky.load()]);
  assert.equal(first, second);
  assert.deepEqual(flaky.read(), { name: "loaded" });
  await flaky.load();
  assert.equal(calls, 2);
  assert.equal(heard, 1);
  unsubscribe();
});

test("a part that cannot load is reported, handed to the caller and asked for again the next time", async () => {
  const reported: unknown[] = [];
  const scope = globalThis as { reportError?: ((error: unknown) => void) | undefined };
  const before = scope.reportError;
  scope.reportError = (error) => reported.push(error);
  let online = false;
  const source: Part<string> = part(async () => {
    if (!online) throw new Error("offline");
    return "there";
  });
  let failures = 0;
  function Probe({ wanted }: Readonly<{ wanted: boolean }>) {
    const [value, waiting] = usePart(source, wanted, () => { failures += 1; });
    return <output data-waiting={waiting}>{value ?? "none"}</output>;
  }
  try {
    const view = render(<Probe wanted={false} />);
    assert.equal(screen.getByRole("status").dataset.waiting, "false");
    await act(async () => { view.rerender(<Probe wanted />); });
    assert.equal(failures, 1);
    assert.equal(reported.length, 1);
    assert.equal(screen.getByRole("status").textContent, "none");
    assert.equal(screen.getByRole("status").dataset.waiting, "false");

    online = true;
    await act(async () => { view.rerender(<Probe wanted={false} />); });
    await act(async () => { view.rerender(<Probe wanted />); });
    assert.equal(screen.getByRole("status").textContent, "there");
    assert.equal(failures, 1);
    // What has loaded is not shown to a caller that does not want it
    view.rerender(<Probe wanted={false} />);
    assert.equal(screen.getByRole("status").textContent, "none");
  } finally {
    scope.reportError = before;
  }
});

test("the blocks stay, marked busy, until the Markdown source has loaded", async () => {
  assert.equal(sourcePart.read(), undefined);
  render(<Editor mode="markdown" />);
  assert.equal(editing(), true);
  assert.equal(document.querySelectorAll(".elea-markdown-editor").length, 0);
  assert.equal(root().getAttribute("aria-busy"), "true");

  await act(async () => { await loadEditorParts("source"); });
  assert.equal(document.querySelectorAll("textarea.elea-markdown-editor__input").length, 1);
  assert.equal(editing(), false);
  assert.equal(root().hasAttribute("aria-busy"), false);
  assert.equal(previewPart.read(), undefined);
});

test("the editor stays until the preview has loaded", async () => {
  render(<Editor showPreview />);
  assert.equal(editing(), true);
  assert.equal(root().getAttribute("aria-busy"), "true");

  await act(async () => { await loadEditorParts("preview"); });
  assert.equal(document.querySelector(".elea-content-editor--preview .elea-content-editor__preview-title")?.textContent, "Title");
  assert.equal(editing(), false);
});

test("the optional format picker loads with the cropper after a picture is picked", async () => {
  const { cropFormats, cropCorners, ...legacyMessages } = en;
  render(
    <ContentProvider messages={legacyMessages} imageCrop={{ formats: true }} uploadImage={async () => ({ url: "/up.png", id: "" })}>
      <Editor blocks={[{ id: "i", type: "image", data: { file: {}, caption: "" } }]} />
    </ContentProvider>,
  );
  const input = document.querySelector("input[type=file]") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "photo.png", { type: "image/png" })] } });
  assert.equal(cropperPart.read(), undefined);
  assert.equal(screen.queryByRole("button", { name: en.image.cropConfirm }), null);
  assert.notEqual(document.querySelectorAll("[data-elea-block-id='i'] [aria-busy=true], [data-elea-block-id='i'] :disabled").length, 0);

  await act(async () => { await loadEditorParts("cropper"); });
  const picker = await screen.findByRole("combobox", { name: cropFormats.format });
  assert.equal(picker.textContent, cropFormats.original);
  for (const name of Object.values(cropCorners)) assert.ok(screen.getByRole("button", { name }));
  assert.ok(screen.getByRole<HTMLButtonElement>("button", { name: en.image.cropConfirm }).disabled);
});

test("an image block uses the host's crop preset and dimensions with the active editor language", async () => {
  const labels = fr.cropFormats;
  assert.ok(labels && fr.cropCorners);
  const { container } = render(
    <ContentProvider messages={fr} imageCrop={{
      formats: { defaultValue: "cover", presets: [{ value: "cover", label: "Couverture", aspect: 16 / 9 }] },
      outputSize: { width: 600, height: 400 },
    }}
      uploadImage={async () => ({ url: "/photo.png", id: "" })}>
      <Editor blocks={[{ id: "i", type: "image", data: {} }]} />
    </ContentProvider>,
  );
  const input = container.querySelector<HTMLInputElement>("input[type=file]")!;
  fireEvent.change(input, { target: { files: [new File(["x"], "photo.png", { type: "image/png" })] } });
  const picker = await screen.findByRole("combobox", { name: labels.format });
  assert.equal(picker.textContent, "Couverture");
  assert.ok(screen.getByRole("button", { name: labels.move }));
  for (const name of Object.values(fr.cropCorners)) assert.ok(screen.getByRole("button", { name }));
  const confirm = screen.getByRole<HTMLButtonElement>("button", { name: fr.image.cropConfirm });
  assert.ok(confirm.disabled);
  fireEvent.load(screen.getByRole("group", { name: fr.image.cropImage }).querySelector("img")!);
  assert.equal(confirm.disabled, false);

  fireEvent.click(picker);
  assert.ok(screen.getByRole("option", { name: labels.original }));
  assert.ok(screen.getByRole("option", { name: labels.free }));
  fireEvent.click(screen.getByRole("option", { name: labels.custom }));
  const width = screen.getByRole<HTMLInputElement>("spinbutton", { name: labels.width });
  assert.equal(width.value, "600");
  assert.equal(screen.getByRole<HTMLInputElement>("spinbutton", { name: labels.height }).value, "400");
  fireEvent.change(width, { target: { value: "0" } });
  assert.equal(screen.getByRole("alert").textContent, labels.invalidSize);
  assert.ok(confirm.disabled);
});

test("a host can reopen the original and saved framing, cancel edits, and upload a new rendition", async (t) => {
  const canvas = window.HTMLCanvasElement.prototype;
  const noop = () => {};
  t.mock.method(canvas, "getContext", () => ({ translate: noop, scale: noop, rotate: noop, drawImage: noop }));
  t.mock.method(canvas, "toBlob", (done: BlobCallback) => done(new Blob(["rendition"], { type: "image/png" })));
  const original = new File(["original"], "cover.png", { type: "image/png" });
  const uploads: ImageUploadOptions[] = [];
  function Host() {
    const [value, change] = useState<EleaBlock[]>([{ id: "i", type: "image", data: { caption: "Glacier" } }]);
    return <ContentProvider imageCrop={{
      formats: true, resolveOriginal: file => uploads[Number(file.id) - 1]?.crop,
    }} uploadImage={async (_file, _context, options) => {
      uploads.push(options);
      return { id: String(uploads.length), url: `/rendition-${uploads.length}.png` };
    }}><Editor blocks={value} onBlocksChange={change} /></ContentProvider>;
  }
  const { container } = render(<Host />);
  const button = (name: string) => screen.getByRole("button", { name });
  async function loadOriginal() {
    const frame = await screen.findByRole("group", { name: en.image.cropImage });
    const image = frame.querySelector("img")!;
    Object.defineProperties(image, { naturalWidth: { value: 960 }, naturalHeight: { value: 640 } });
    fireEvent.load(image);
  }

  const input = container.querySelector<HTMLInputElement>("input[type=file]")!;
  fireEvent.change(input, { target: { files: [original] } });
  await screen.findByRole("combobox", { name: en.cropFormats.format });
  await loadOriginal();
  const move = button(en.cropFormats.move);
  fireEvent.keyDown(move, { key: "ArrowLeft", shiftKey: true });
  fireEvent.change(screen.getByLabelText(en.image.cropZoom), { target: { value: "1.5" } });
  fireEvent.click(button(en.image.cropConfirm));
  await screen.findByRole("img", { name: "Glacier" });
  assert.equal(uploads.length, 1);
  const saved = uploads[0]!.crop!;
  assert.equal(saved.source, original);
  assert.ok(saved.recipe.mask);
  assert.equal(saved.recipe.zoom, 1.5);
  assert.equal(saved.recipe.format, "original");

  fireEvent.click(button(en.image.adjustCrop));
  await loadOriginal();
  assert.equal(screen.getByLabelText<HTMLInputElement>(en.image.cropZoom).value, "1.5");
  fireEvent.change(screen.getByLabelText(en.image.cropZoom), { target: { value: "2" } });
  fireEvent.click(button(en.image.cropCancel));
  assert.equal(button(en.image.adjustCrop), document.activeElement);
  assert.equal(screen.getByRole("img", { name: "Glacier" }).getAttribute("src"), "/rendition-1.png");
  assert.equal(uploads.length, 1);

  fireEvent.click(button(en.image.adjustCrop));
  await loadOriginal();
  assert.equal(screen.getByLabelText<HTMLInputElement>(en.image.cropZoom).value, "1.5");
  fireEvent.keyDown(button(en.cropCorners.bottomRight), { key: "ArrowLeft", shiftKey: true });
  fireEvent.click(button(en.image.cropConfirm));
  const rendition = await screen.findByRole("img", { name: "Glacier" });
  assert.equal(rendition.getAttribute("src"), "/rendition-2.png");
  assert.equal(uploads[1]?.crop?.source, original);
  assert.notDeepEqual(uploads[1]?.crop?.recipe.mask, saved.recipe.mask);
});

test("loadEditorParts brings every part when none is named", async () => {
  await loadEditorParts();
  assert.ok(sourcePart.read()?.MarkdownEditor);
  assert.ok(previewPart.read()?.EditorPreview);
  assert.ok(cropperPart.read()?.ImageCropper);
});
