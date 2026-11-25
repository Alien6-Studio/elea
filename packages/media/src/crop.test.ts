import assert from "node:assert/strict";
import { test } from "node:test";
import { clampOffset, coverScale, cropRect, displayScale, exportCrop, frameSize, rotatedSize } from "./crop.js";

const image = { width: 2000, height: 1000 };
const frame = { width: 400, height: 300 };

test("the covering scale fills the frame on the tighter side", () => {
  assert.equal(coverScale(image, frame), 0.3);
  assert.equal(coverScale({ width: 100, height: 100 }, frame), 4);
  assert.equal(coverScale({ width: 0, height: 0 }, frame), 1);
});

test("rotation widens the bounding box and lowers the covering scale", () => {
  const rotated = rotatedSize({ width: 100, height: 50 }, 90);
  assert.equal(Math.round(rotated.width), 50);
  assert.equal(Math.round(rotated.height), 100);
  assert.ok(coverScale(image, frame, 45) < coverScale(image, frame, 0) * 2);
});

test("the offset never reveals space beyond the image", () => {
  const scale = coverScale(image, frame);
  // 2000 * 0.3 = 600 wide for a 400 frame: 100 px of play each way; no vertical play
  assert.deepEqual(clampOffset({ x: 500, y: 50 }, image, frame, scale), { x: 100, y: 0 });
  assert.deepEqual(clampOffset({ x: -500, y: -50 }, image, frame, scale), { x: -100, y: 0 });
  assert.deepEqual(clampOffset({ x: 30, y: 0 }, image, frame, scale), { x: 30, y: 0 });
});

test("the crop rect maps the frame back to image pixels", () => {
  const centred = cropRect(image, frame, { zoom: 1, rotation: 0, offset: { x: 0, y: 0 } });
  assert.deepEqual(centred, { x: 333.33, y: 0, width: 1333.33, height: 1000 });
  const zoomed = cropRect(image, frame, { zoom: 2, rotation: 0, offset: { x: 0, y: 0 } });
  assert.deepEqual(zoomed, { x: 666.67, y: 250, width: 666.67, height: 500 });
  // Moving the image right shows more of its left side
  const shifted = cropRect(image, frame, { zoom: 1, rotation: 0, offset: { x: 100, y: 0 } });
  assert.equal(shifted.x, 0);
  assert.equal(displayScale(image, frame, { zoom: 2, rotation: 0, offset: { x: 0, y: 0 } }), 0.6);
});

test("the frame follows the container width and the aspect, capped in height", () => {
  assert.deepEqual(frameSize(800, 2, 1000), { width: 800, height: 400 });
  assert.deepEqual(frameSize(800, 1, 300), { width: 300, height: 300 });
  assert.deepEqual(frameSize(0, 1, 300), { width: 1, height: 1 });
});

test("exporting without a document resolves to null", async () => {
  assert.equal(await exportCrop({ width: 10, height: 10 } as never, { x: 0, y: 0, width: 5, height: 5 }, 0), null);
});
