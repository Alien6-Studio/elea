import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useCropFormat, type CropFormatOptions } from "./CropFormatControls.js";
import type { Size } from "./crop.js";

afterEach(cleanup);

const labels = { format: "Format", original: "Original", free: "Free ratio", custom: "Custom", width: "Width", height: "Height", invalidSize: "Enter valid dimensions", move: "Move crop", resize: "Resize crop" };
function Picker({ formats, initial, natural, disabled }: { formats?: CropFormatOptions; initial?: Size; natural?: Size; disabled?: boolean }) {
  const { controls, outputSize, invalid, free } = useCropFormat(formats, initial, natural, disabled);
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
