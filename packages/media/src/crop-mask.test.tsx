import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useCropMask } from "./CropMask.js";
import type { CropRect, Size } from "./crop.js";

afterEach(cleanup);
const stage = { width: 600, height: 400 };
const labels = { move: "Move crop", resize: "Resize crop" };
function Mask({ size = stage, ratio, disabled = false, enabled = true, onPan }: {
  size?: Size; ratio?: number; disabled?: boolean; enabled?: boolean; onPan?: () => void;
}) {
  const { rect, overlay } = useCropMask(size, ratio, enabled ? labels : undefined, disabled);
  return <div onPointerDown={onPan}>{overlay}<output>{JSON.stringify(rect)}</output></div>;
}
function rect(): CropRect {
  return JSON.parse(screen.getByRole("status").textContent!);
}
function key(action: keyof typeof labels, key: string, shiftKey = false) {
  return fireEvent.keyDown(screen.getByRole("button", { name: labels[action] }), { key, shiftKey });
}
function drag(action: keyof typeof labels, x: number, y: number) {
  const control = screen.getByRole("button", { name: labels[action] });
  fireEvent.pointerDown(control, { pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 100 });
  fireEvent.pointerMove(control, { pointerId: 1, clientX: 100 + x, clientY: 100 + y });
  fireEvent.pointerUp(control, { pointerId: 1 });
}

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
