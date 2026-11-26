import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useCropMask } from "./CropMask.js";
import type { CropRect, Size } from "./crop.js";

afterEach(cleanup);
const stage = { width: 600, height: 400 };
const labels = { move: "Move crop", resize: "Resize crop" };
const corners = { topLeft: "Top left", topRight: "Top right", bottomLeft: "Bottom left", bottomRight: "Bottom right" };
function Mask({ size = stage, ratio, disabled = false, enabled = true, handles = false, initialMask, onPan }: {
  size?: Size; ratio?: number; disabled?: boolean; enabled?: boolean; handles?: boolean; initialMask?: CropRect; onPan?: () => void;
}) {
  const { rect, overlay } = useCropMask(size, ratio, enabled ? { ...labels, corners: handles ? corners : undefined } : undefined, disabled, initialMask);
  return <div onPointerDown={onPan}>{overlay}<output>{JSON.stringify(rect)}</output></div>;
}
function rect(): CropRect {
  return JSON.parse(screen.getByRole("status").textContent!);
}
function expectRect(expected: CropRect) {
  const actual = rect();
  for (const axis of ["x", "y", "width", "height"] as const) {
    assert.ok(Math.abs(actual[axis] - expected[axis]) < 1e-8, `${axis}: ${actual[axis]} vs ${expected[axis]}`);
  }
}
function key(action: keyof typeof labels, key: string, shiftKey = false) {
  return fireEvent.keyDown(screen.getByRole("button", { name: labels[action] }), { key, shiftKey });
}
function drag(action: keyof typeof labels, x: number, y: number) {
  dragHandle(screen.getByRole("button", { name: labels[action] }), x, y);
}
function dragHandle(control: HTMLElement, x: number, y: number) {
  fireEvent.pointerDown(control, { pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 100 });
  fireEvent.pointerMove(control, { pointerId: 1, clientX: 100 + x, clientY: 100 + y });
  fireEvent.pointerUp(control, { pointerId: 1 });
}

test("each crop handle describes its own current position or size", () => {
  render(<><Mask ratio={1} /><Mask ratio={1} /></>);
  const [firstMove, secondMove] = screen.getAllByRole("button", { name: labels.move, description: "x: 140, y: 40" });
  const [firstResize, secondResize] = screen.getAllByRole("button", { name: labels.resize, description: "320 × 320" });
  fireEvent.keyDown(firstMove!, { key: "ArrowRight", shiftKey: true });
  fireEvent.keyDown(firstResize!, { key: "ArrowDown" });
  assert.equal(screen.getByRole("button", { description: "x: 150, y: 40" }), firstMove);
  assert.equal(screen.getByRole("button", { description: "321 × 321" }), firstResize);
  assert.equal(screen.getByRole("button", { description: "x: 140, y: 40" }), secondMove);
  assert.equal(screen.getByRole("button", { description: "320 × 320" }), secondResize);
});

test("each corner resizes from the opposite anchor in both writing directions", () => {
  for (const direction of ["ltr", "rtl"]) {
    for (const [corner, name] of Object.entries(corners)) {
      const view = render(<div dir={direction}><Mask handles /></div>);
      const handle = screen.getByRole("button", { name });
      const left = corner.endsWith("Left");
      const top = corner.startsWith("top");
      dragHandle(handle, left ? 10 : -10, top ? 20 : -20);
      expectRect({ x: left ? 70 : 60, y: top ? 60 : 40, width: 470, height: 300 });
      fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
      expectRect({ x: left ? 80 : 60, y: top ? 60 : 40, width: left ? 460 : 480, height: 300 });
      view.unmount();
    }
  }
});

test("locked corner drag keeps the ratio, stays in bounds, and clears guides on cancellation", () => {
  render(<Mask ratio={2} handles />);
  const handle = screen.getByRole("button", { name: corners.topLeft });
  const window = handle.parentElement!;
  assert.equal(window.hasAttribute("data-dragging"), false);
  fireEvent.pointerDown(handle, { pointerId: 7, isPrimary: true, button: 0, clientX: 50, clientY: 50 });
  assert.ok(window.hasAttribute("data-dragging"));
  fireEvent.pointerMove(handle, { pointerId: 7, clientX: -200, clientY: -200 });
  assert.deepEqual(rect(), { x: 0, y: 50, width: 540, height: 270 });
  fireEvent.pointerCancel(handle, { pointerId: 7 });
  assert.equal(window.hasAttribute("data-dragging"), false);
  fireEvent.pointerMove(handle, { pointerId: 7, clientX: 100, clientY: 100 });
  assert.deepEqual(rect(), { x: 0, y: 50, width: 540, height: 270 });
});

test("restored masks use normalized stage coordinates, including at another display size", () => {
  const initialMask = { x: 0.25, y: 0.125, width: 0.5, height: 0.75 };
  const view = render(<Mask initialMask={initialMask} size={{ width: 300, height: 200 }} ratio={1} />);
  assert.deepEqual(rect(), { x: 75, y: 25, width: 150, height: 150 });
  view.rerender(<Mask initialMask={initialMask} size={stage} ratio={1} />);
  assert.deepEqual(rect(), { x: 150, y: 50, width: 300, height: 300 });
  view.unmount();
  render(<Mask initialMask={{ ...initialMask, width: NaN }} />);
  assert.deepEqual(rect(), { x: 60, y: 40, width: 480, height: 320 });
});

test("locked and free masks share the same rectangle when unlocking; resizing free axes is independent", () => {
  const { rerender } = render(<Mask ratio={1} />);
  assert.deepEqual(rect(), { x: 140, y: 40, width: 320, height: 320 });
  rerender(<Mask />);
  assert.deepEqual(rect(), { x: 140, y: 40, width: 320, height: 320 });
  key("resize", "ArrowRight", true);
  key("resize", "ArrowUp");
  assert.deepEqual(rect(), { x: 140, y: 40, width: 330, height: 319 });
  rerender(<Mask ratio={16 / 9} />);
  const locked = rect();
  assert.equal(locked.width / locked.height, 16 / 9);
  assert.ok(Math.abs(locked.x + locked.width / 2 - 305) < 1e-8);
  assert.ok(Math.abs(locked.y + locked.height / 2 - 199.5) < 1e-8);
  rerender(<Mask />);
  assert.deepEqual(rect(), locked);
});

test("drag and keyboard move or resize inside the stage; the image does not pan under the mask", () => {
  let pans = 0;
  render(<Mask ratio={2} onPan={() => { pans++; }} />);
  drag("move", -1000, 1000);
  assert.deepEqual(rect(), { x: 0, y: 160, width: 480, height: 240 });
  drag("resize", -180, 0);
  assert.deepEqual(rect(), { x: 0, y: 160, width: 300, height: 150 });
  assert.equal(pans, 0);
  assert.equal(key("move", "ArrowUp", true), false);
  assert.deepEqual(rect(), { x: 0, y: 150, width: 300, height: 150 });
  drag("resize", 1000, 1000);
  assert.deepEqual(rect(), { x: 0, y: 150, width: 500, height: 250 });
  assert.equal(key("resize", "Tab"), true);
});

test("resizing the stage preserves proportional crop coordinates; absent and disabled controls cannot alter it", () => {
  const { rerender } = render(<Mask ratio={1} />);
  key("move", "ArrowRight", true);
  rerender(<Mask ratio={1} size={{ width: 300, height: 200 }} disabled />);
  const resized = rect();
  assert.ok(Math.abs(resized.x - 75) < 1e-8);
  assert.deepEqual([resized.y, resized.width, resized.height], [20, 160, 160]);
  key("move", "ArrowRight");
  assert.deepEqual(rect(), resized);
  rerender(<Mask enabled={false} />);
  assert.equal(screen.queryByRole("button"), null);
  assert.deepEqual(rect(), { x: 0, y: 0, width: 600, height: 400 });
});
