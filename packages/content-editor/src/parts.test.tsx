import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor, type ContentEditorProps } from "./ContentEditor.js";
import { cropperPart, loadEditorParts, part, previewPart, sourcePart, usePart, type Part } from "./parts.js";
import { ContentProvider } from "./provider.js";

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

test("a picked picture waits for the cropper, which then frames it", async () => {
  render(
    <ContentProvider uploadImage={async () => ({ url: "/up.png", id: "" })}>
      <Editor blocks={[{ id: "i", type: "image", data: { file: {}, caption: "" } }]} />
    </ContentProvider>,
  );
  const input = document.querySelector("input[type=file]") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "photo.png", { type: "image/png" })] } });
  assert.equal(cropperPart.read(), undefined);
  assert.equal(screen.queryByRole("button", { name: en.image.cropConfirm }), null);
  assert.notEqual(document.querySelectorAll("[data-elea-block-id='i'] [aria-busy=true], [data-elea-block-id='i'] :disabled").length, 0);

  await act(async () => { await loadEditorParts("cropper"); });
  assert.equal(screen.getAllByRole("button", { name: en.image.cropConfirm }).length, 1);
});

test("loadEditorParts brings every part when none is named", async () => {
  await loadEditorParts();
  assert.ok(sourcePart.read()?.MarkdownEditor);
  assert.ok(previewPart.read()?.EditorPreview);
  assert.ok(cropperPart.read()?.ImageCropper);
});
