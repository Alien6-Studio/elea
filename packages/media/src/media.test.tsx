import "./test/dom.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { useState } from "react";
import { DropZone, acceptsFile } from "./DropZone.js";
import { ImageCropper } from "./ImageCropper.js";
import { useObjectUrl } from "./useObjectUrl.js";

const png = (name = "pixel.png") => new File([new Uint8Array([137, 80, 78, 71])], name, { type: "image/png" });
const labels = { zoom: "Zoom", rotation: "Rotation", confirm: "Use this image", cancel: "Cancel", image: "Picture to frame" };

test("acceptsFile reads accept lists like the file picker", () => {
  assert.ok(acceptsFile(png(), "image/*"));
  assert.ok(acceptsFile(png(), ".png,.jpg"));
  assert.ok(acceptsFile(png(), "image/png"));
  assert.ok(!acceptsFile(png(), "application/pdf"));
  assert.ok(acceptsFile(png(), undefined));
  assert.ok(!acceptsFile(png(), ","));
});

test("the drop zone delivers picked and dropped files that match, refuses the others", async () => {
  const received: File[][] = [];
  const refused: File[][] = [];
  const { container } = render(<DropZone accept="image/*" label="Add an image" hint="or drop it here" onFiles={(files) => received.push(files)} onRejected={(files) => refused.push(files)} />);
  const input = container.querySelector("input[type=file]") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [png()] } });
  assert.equal(received.length, 1);
  const zone = container.querySelector(".elea-dropzone") as HTMLElement;
  fireEvent.dragOver(zone, { dataTransfer: { files: [] } });
  assert.ok(zone.className.includes("elea-dropzone--active"));
  fireEvent.dragLeave(zone, { dataTransfer: { files: [] } });
  assert.ok(!zone.className.includes("elea-dropzone--active"));
  const pdf = new File(["%PDF"], "a.pdf", { type: "application/pdf" });
  fireEvent.drop(zone, { dataTransfer: { files: [pdf, png("b.png"), png("c.png")] } });
  assert.equal(refused.length, 1);
  assert.equal(received.length, 2);
  // Not multiple: one file at most
  assert.equal(received[1]?.length, 1);
  assert.equal(received[1]?.[0]?.name, "b.png");
  // The label opens the picker from the keyboard
  let clicks = 0;
  input.click = () => { clicks += 1; };
  const label = screen.getByText("Add an image").closest("label") as HTMLElement;
  fireEvent.keyDown(label, { key: "Enter" });
  fireEvent.keyDown(label, { key: " " });
  fireEvent.keyDown(label, { key: "a" });
  assert.equal(clicks, 2);
  assert.deepEqual((await axe.run(container)).violations, []);
  cleanup();
  // Busy and disabled zones are inert
  const { container: inert } = render(<DropZone label="Add" busy busyLabel="Uploading" onFiles={(files) => received.push(files)} error="Too big" />);
  assert.ok(screen.getByText("Uploading"));
  assert.equal(screen.getByRole("alert").textContent, "Too big");
  fireEvent.drop(inert.querySelector(".elea-dropzone") as HTMLElement, { dataTransfer: { files: [png()] } });
  assert.equal(received.length, 2);
  cleanup();
  render(<DropZone label="Custom" onFiles={() => {}} multiple><em>anything</em></DropZone>);
  assert.ok(screen.getByText("anything"));
});

test("the cropper frames the picture, follows the sliders and confirms with the crop window", async () => {
  const confirmed: unknown[] = [];
  const changes: unknown[] = [];
  const { container } = render(<ImageCropper src="data:image/png;base64,iVBORw0KGgo=" aspect={1} labels={labels} onConfirm={(blob, rect, state) => confirmed.push({ blob, rect, state })} onCancel={() => confirmed.push("cancel")} onChange={(state) => changes.push(state)} />);
  const image = container.querySelector("img") as HTMLImageElement;
  Object.defineProperty(image, "naturalWidth", { value: 2000, configurable: true });
  Object.defineProperty(image, "naturalHeight", { value: 1000, configurable: true });
  fireEvent.load(image);
  const frame = screen.getByRole("img", { name: "Picture to frame" });
  // jsdom has no layout: the frame falls back to 640 px wide, then the 480 px height cap squares it
  assert.equal(frame.style.width, "480px");
  assert.equal(frame.style.height, "480px");
  fireEvent.change(screen.getByLabelText("Zoom"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Rotation"), { target: { value: "90" } });
  assert.ok(image.style.transform.includes("rotate(90deg)"));
  assert.ok(image.style.transform.includes("scale("));
  // Dragging moves the image within the clamp
  fireEvent.pointerDown(frame, { clientX: 10, clientY: 10, pointerId: 1 });
  fireEvent.pointerMove(frame, { clientX: 60, clientY: 10, pointerId: 1 });
  fireEvent.pointerUp(frame, { pointerId: 1 });
  fireEvent.pointerMove(frame, { clientX: 500, clientY: 10, pointerId: 1 });
  assert.ok(image.style.transform.includes("calc(-50% + 50px)"));
  fireEvent.wheel(frame, { deltaY: -100 });
  assert.ok(changes.length >= 4);
  fireEvent.click(screen.getByRole("button", { name: "Use this image" }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  const result = confirmed[0] as { blob: unknown; rect: { width: number; height: number }; state: { rotation: number } };
  // No canvas under jsdom: the blob is null and the host keeps the original file
  assert.equal(result.blob, null);
  assert.equal(result.state.rotation, 90);
  assert.ok(result.rect.width > 0 && result.rect.height > 0);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  assert.equal(confirmed[1], "cancel");
  assert.deepEqual((await axe.run(container)).violations, []);
  cleanup();
  // Before the image loads, confirming reports a null picture too
  render(<ImageCropper src="x" labels={labels} onConfirm={(blob) => confirmed.push(blob)} shape="round" />);
  fireEvent.click(screen.getByRole("button", { name: "Use this image" }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(confirmed[2], null);
  assert.ok(container.ownerDocument.querySelector(".elea-cropper--round"));
  cleanup();
  render(<ImageCropper src="x" labels={labels} busy onConfirm={() => confirmed.push("confirm")} onCancel={() => confirmed.push("cancel")} />);
  assert.equal((screen.getByRole("button", { name: "Use this image" }) as HTMLButtonElement).disabled, true);
  assert.equal((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled, true);
});

test("useObjectUrl creates and revokes a URL for the file", () => {
  const created: string[] = [];
  const revoked: string[] = [];
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  URL.createObjectURL = (blob: Blob) => { const url = `blob:${(blob as File).name}`; created.push(url); return url; };
  URL.revokeObjectURL = (url: string) => { revoked.push(url); };
  function Probe({ file }: { file: File | null }) {
    const url = useObjectUrl(file);
    return <output>{url ?? "none"}</output>;
  }
  const { rerender, unmount } = render(<Probe file={png("a.png")} />);
  assert.equal(screen.getByRole("status").textContent, "blob:a.png");
  rerender(<Probe file={png("b.png")} />);
  assert.deepEqual(revoked, ["blob:a.png"]);
  rerender(<Probe file={null} />);
  assert.equal(screen.getByRole("status").textContent, "none");
  unmount();
  assert.deepEqual(created, ["blob:a.png", "blob:b.png"]);
  URL.createObjectURL = original.create;
  URL.revokeObjectURL = original.revoke;
});

test("a stateful host swaps the file and keeps the zone usable", () => {
  function Host() {
    const [file, setFile] = useState<File | null>(null);
    return (
      <>
        <DropZone label="Pick" onFiles={([first]) => setFile(first ?? null)} />
        <output>{file?.name ?? "none"}</output>
      </>
    );
  }
  const { container } = render(<Host />);
  fireEvent.change(container.querySelector("input[type=file]") as HTMLInputElement, { target: { files: [png("z.png")] } });
  assert.equal(screen.getByRole("status").textContent, "z.png");
});
