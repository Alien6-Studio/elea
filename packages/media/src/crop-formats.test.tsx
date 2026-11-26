import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useCropFormat, type CropFormatOptions } from "./CropFormatControls.js";
import { createCropFormats } from "./createCropFormats.js";
import { ImageCropper } from "./ImageCropper.js";
import type { CropRecipe, CropRect, Size } from "./crop.js";

afterEach(cleanup);

const labels = { format: "Format", original: "Original", free: "Free ratio", custom: "Custom", width: "Width", height: "Height", invalidSize: "Enter valid dimensions", move: "Move crop", resize: "Resize crop" };
function Picker({ formats, initial, natural, disabled, recipe }: { formats?: CropFormatOptions; initial?: Size; natural?: Size; disabled?: boolean; recipe?: CropRecipe }) {
  const { controls, outputSize, invalid, free } = useCropFormat(formats, initial, natural, disabled, recipe);
  return <>{controls}<output data-invalid={invalid} data-free={free}>{outputSize ? `${outputSize.width}×${outputSize.height}` : "original"}</output></>;
}
const select = () => screen.getByRole<HTMLButtonElement>("combobox", { name: labels.format });
function choose(name: string) {
  fireEvent.click(select());
  fireEvent.click(screen.getByRole("option", { name }));
}
const dimension = (axis: "width" | "height") => screen.getByRole<HTMLInputElement>("spinbutton", { name: labels[axis] });
const change = (node: HTMLElement, value: string) => fireEvent.change(node, { target: { value } });

test("formats opt in to the Elea select; presets and original immediately select their export dimensions", () => {
  const initial = { width: 300, height: 200 };
  const { container, rerender } = render(<Picker initial={initial} />);
  const output = container.querySelector("output")!;
  assert.equal(screen.queryByRole("combobox"), null);
  assert.equal(output.textContent, "300×200");
  rerender(<Picker formats={{ labels }} />);
  assert.equal(select().textContent, labels.original);
  assert.equal(output.textContent, "original");
  for (const [name, size] of [["1:1 · 1080 × 1080", "1080×1080"], ["16:9 · 1600 × 900", "1600×900"], ["4:5 · 1080 × 1350", "1080×1350"], [labels.original, "original"]] as const) {
    choose(name);
    assert.equal(output.textContent, size);
    assert.equal(output.dataset.invalid, "false");
    assert.equal(screen.queryByRole("spinbutton"), null);
  }
  choose(labels.free);
  assert.equal(output.textContent, "original");
  assert.equal(output.dataset.free, "true");
});

test("a named preset can specify a ratio without resampling or an exact output size", () => {
  const formats: CropFormatOptions = {
    labels, defaultValue: "cover",
    presets: [
      { value: "card", label: "Article card", aspect: 4 / 5 },
      { value: "cover", label: "Publication cover", outputSize: { width: 960, height: 480 } },
    ],
  };
  const { container } = render(<Picker formats={formats} />);
  assert.equal(select().textContent, "Publication cover");
  assert.equal(container.querySelector("output")?.textContent, "960×480");
  choose("Article card");
  assert.equal(container.querySelector("output")?.textContent, "original");
  assert.equal(container.querySelector("output")?.dataset.free, "false");
  fireEvent.click(select());
  assert.deepEqual(screen.getAllByRole("option").map(item => item.textContent),
    [labels.original, labels.free, "Article card", "Publication cover", labels.custom]);
  assert.throws(() => createCropFormats({ labels, presets: [{ value: "free", label: "Card", aspect: 1 }] }), TypeError);
  assert.throws(() => createCropFormats({ labels, presets: [{ value: "card", label: "Card", aspect: NaN }] }), RangeError);
  assert.throws(() => createCropFormats({ labels, presets: [{ value: "cover", label: "Cover", outputSize: { width: 0, height: 400 } }] }), RangeError);
});

test("a confirmed crop reopens from the original at a new viewport with the same source pixels", async () => {
  const controls = { zoom: "Zoom", rotation: "Rotation", confirm: "Use image", cancel: "Cancel", image: "Picture" };
  const formats = createCropFormats({ labels, presets: [{ value: "card", label: "Article card", aspect: 4 / 5 }], defaultValue: "card" });
  const saved: { rect: CropRect; recipe: CropRecipe }[] = [];
  const confirm = (_blob: Blob | null, rect: CropRect, _state: unknown, recipe?: CropRecipe) => {
    assert.ok(recipe);
    saved.push({ rect, recipe });
  };
  const source = { src: "original.jpg", formats, labels: controls, onConfirm: confirm };
  function loadImage(container: HTMLElement) {
    const image = container.querySelector("img")!;
    Object.defineProperties(image, { naturalWidth: { value: 1200 }, naturalHeight: { value: 800 } });
    fireEvent.load(image);
  }
  const first = render(<ImageCropper {...source} maxHeight={300} />);
  await screen.findByRole("combobox");
  loadImage(first.container);
  assert.equal(select().textContent, "Article card");
  fireEvent.keyDown(screen.getByRole("button", { name: labels.move }), { key: "ArrowLeft", shiftKey: true });
  fireEvent.change(screen.getByLabelText(controls.zoom), { target: { value: "1.5" } });
  fireEvent.change(screen.getByLabelText(controls.rotation), { target: { value: "11" } });
  fireEvent.click(screen.getByRole("button", { name: controls.confirm }));
  await waitFor(() => assert.equal(saved.length, 1));
  const { rect, recipe } = saved[0]!;
  assert.equal(recipe.format, "card");
  assert.equal(recipe.outputSize, undefined);
  assert.ok(Math.abs(rect.width / rect.height - 4 / 5) < 1e-10);
  first.unmount();

  const second = render(<ImageCropper {...source} initialCrop={JSON.parse(JSON.stringify(recipe)) as CropRecipe} maxHeight={150} />);
  await screen.findByRole("combobox");
  loadImage(second.container);
  assert.equal(screen.getByLabelText<HTMLInputElement>(controls.rotation).value, "11");
  assert.equal(screen.getByLabelText<HTMLInputElement>(controls.zoom).value, "1.5");
  fireEvent.click(screen.getByRole("button", { name: controls.confirm }));
  await waitFor(() => assert.deepEqual(saved[1]?.rect, rect));
});

test("an old preset falls back to its saved dimensions or to a movable free crop", () => {
  const recipe: CropRecipe = {
    format: "old-card", rotation: 0, zoom: 1, aspect: 2, offset: { x: 0, y: 0 },
    mask: { x: 0.25, y: 0.1, width: 0.5, height: 0.8 },
  };
  const formats = { labels, presets: [] };
  const { rerender } = render(<Picker formats={formats} recipe={recipe} />);
  assert.equal(select().textContent, labels.free);
  rerender(<Picker formats={formats} recipe={recipe} initial={{ width: 1200, height: 960 }} />);
  assert.equal(select().textContent, labels.custom);
  assert.equal(dimension("width").value, "1200");
  assert.equal(dimension("height").value, "960");
});

test("custom dimensions use loaded image dimensions, keep drafts across formats and retain the last valid frame", () => {
  const formats: CropFormatOptions = { labels, defaultValue: "custom" };
  const { container, rerender } = render(<Picker formats={formats} />);
  const output = container.querySelector("output")!;
  assert.equal(output.textContent, "1080×1080");
  rerender(<Picker formats={formats} natural={{ width: 1800, height: 1200 }} />);
  assert.equal(dimension("width").value, "1800");
  change(dimension("width"), "900");
  change(dimension("height"), "");
  assert.equal(output.textContent, "900×1200");
  assert.equal(output.dataset.invalid, "true");
  assert.equal(dimension("width").getAttribute("aria-invalid"), null);
  assert.equal(dimension("height").getAttribute("aria-describedby"), screen.getByRole("alert").id);

  choose("4:5 · 1080 × 1350");
  assert.equal(output.textContent, "1080×1350");
  assert.equal(screen.queryByRole("alert"), null);
  choose(labels.custom);
  assert.equal(dimension("height").value, "");
  assert.equal(dimension("width").value, "900");
  change(dimension("height"), "450");
  assert.equal(output.textContent, "900×450");
  assert.equal(output.dataset.invalid, "false");
});

test("custom inputs report axis and area limits and can be disabled together", () => {
  const formats = { labels };
  const initial = { width: 320, height: 240 };
  const { container, rerender } = render(<Picker formats={formats} initial={initial} />);
  assert.equal(select().textContent, labels.custom);
  for (const invalidWidth of ["0", "2.5", "8193"]) {
    change(dimension("width"), invalidWidth);
    assert.equal(dimension("width").getAttribute("aria-invalid"), "true");
    assert.equal(dimension("height").getAttribute("aria-invalid"), null);
    assert.equal(container.querySelector("output")?.textContent, "320×240");
  }
  change(dimension("width"), "8192");
  change(dimension("height"), "2049");
  assert.equal(dimension("width").getAttribute("aria-invalid"), "true");
  assert.equal(dimension("height").getAttribute("aria-invalid"), "true");
  change(dimension("height"), "2048");
  assert.equal(screen.queryByRole("alert"), null);
  assert.equal(container.querySelector("output")?.textContent, "8192×2048");
  rerender(<Picker formats={formats} initial={initial} disabled />);
  assert.ok(select().disabled && dimension("width").disabled && dimension("height").disabled);

  const html = renderToStaticMarkup(<Picker formats={{ labels, defaultValue: "landscape" }} />);
  assert.match(html, /role="combobox"/);
  assert.match(html, /16:9 · 1600 × 900/);
  assert.match(html, /1600×900/);
});
