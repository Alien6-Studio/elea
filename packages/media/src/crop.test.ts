import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { clampOffset, coverScale, cropRect, displayScale, exportCrop, frameSize, isValidOutputSize, measureCropRect, rotatedSize } from "./crop.js";

const image = { width: 2000, height: 1000 };
const frame = { width: 400, height: 300 };

test("the covering scale fills the frame on the tighter side", () => {
  assert.equal(coverScale(image, frame), 0.3);
  assert.equal(coverScale({ width: 100, height: 100 }, frame), 4);
  assert.equal(coverScale({ width: 0, height: 0 }, frame), 1);
});

test("rotation changes the bounding box and keeps the frame covered", () => {
  const rotated = rotatedSize({ width: 100, height: 50 }, 90);
  assert.equal(Math.round(rotated.width), 50);
  assert.equal(Math.round(rotated.height), 100);
  assert.ok(Math.abs(coverScale(image, frame, 45) - 700 / Math.SQRT2 / 1000) < 1e-12);
});

test("the offset never reveals space beyond the image", () => {
  const scale = coverScale(image, frame);
  // 2000 * 0.3 = 600 wide for a 400 frame: 100 px of play each way; no vertical play
  assert.deepEqual(clampOffset({ x: 500, y: 50 }, image, frame, scale), { x: 100, y: 0 });
  assert.deepEqual(clampOffset({ x: -500, y: -50 }, image, frame, scale), { x: -100, y: 0 });
  assert.deepEqual(clampOffset({ x: 30, y: 0 }, image, frame, scale), { x: 30, y: 0 });
});

test("rotating and panning keep every corner of a portrait or landscape frame inside the source", () => {
  for (const rotation of [-135, -32, 17, 45, 90, 127]) {
    const angle = rotation * Math.PI / 180;
    for (const frame of [{ width: 400, height: 225 }, { width: 150, height: 400 }]) {
      const cover = coverScale(image, frame, rotation);
      for (const zoom of [1, 2]) {
        const scale = cover * zoom;
        for (const offset of [{ x: 0, y: 0 }, { x: 4000, y: -3000 }, { x: -3500, y: 4200 }, { x: 4000, y: 4200 }]) {
          const centre = clampOffset(offset, image, frame, scale, rotation);
          for (const x of [-frame.width / 2, frame.width / 2]) {
            for (const y of [-frame.height / 2, frame.height / 2]) {
              // Transform this actual screen corner back to the unrotated source pixels.
              const dx = x - centre.x;
              const dy = y - centre.y;
              const sourceX = image.width / 2 + (Math.cos(angle) * dx + Math.sin(angle) * dy) / scale;
              const sourceY = image.height / 2 + (Math.cos(angle) * dy - Math.sin(angle) * dx) / scale;
              assert.ok(sourceX >= -1e-8 && sourceX <= image.width + 1e-8);
              assert.ok(sourceY >= -1e-8 && sourceY <= image.height + 1e-8);
            }
          }
        }
      }
    }
  }
  assert.equal(coverScale(image, frame, 90), 0.4);
  assert.deepEqual(clampOffset({ x: 80, y: -700 }, image, frame, 0.4, 90), { x: 0, y: -250 });
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
  assert.equal(await exportCrop(image as never, { x: 0, y: 0, width: 5, height: 5 }, 0, { outputSize: frame }), null);
});

test("exact output sizes must fit both the dimension limit and the pixel budget", async () => {
  for (const size of [{ width: 1, height: 1 }, { width: 8192, height: 2048 }, { width: 4096, height: 4096 }]) {
    assert.equal(isValidOutputSize(size), true);
  }
  assert.equal(isValidOutputSize(undefined), false);
  assert.equal(isValidOutputSize(null), false);
  const rect = { ...frame, x: 0, y: 0 };
  for (const size of [{ width: 8193, height: 1 }, { width: 1, height: 8193 }, { width: 8192, height: 2049 },
    { width: 0, height: 10 }, { width: 10, height: -1 }, { width: 10.5, height: 10 }, { width: 10, height: NaN }]) {
    assert.equal(isValidOutputSize(size), false);
    await assert.rejects(exportCrop(image as never, rect, 0, { outputSize: size }), RangeError);
  }
});

// Record canvas dimensions and drawing commands without relying on a native image encoder under Node.
function recordCanvases(t: TestContext) {
  function createCanvas() {
    const context = { translate: t.mock.fn(), rotate: t.mock.fn(), scale: t.mock.fn(), drawImage: t.mock.fn() };
    return {
      width: 0, height: 0, context, getContext: () => context,
      toBlob: t.mock.fn((callback: BlobCallback, type = "", _quality?: number) => callback(new Blob([], { type }))),
    };
  }
  const canvases: ReturnType<typeof createCanvas>[] = [];
  const document = { createElement: () => { const canvas = createCanvas(); canvases.push(canvas); return canvas; } };
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  t.after(() => Reflect.deleteProperty(globalThis, "document"));
  return canvases;
}

test("exact export upscales uniformly around the crop centre, including rotated and off-centre crops", async t => {
  const canvases = recordCanvases(t);
  const picture = { width: 120, height: 80 } as CanvasImageSource & typeof frame;
  const size = { width: 150, height: 150 };
  // After a quarter turn the image is 80 × 120. An offset 40 × 60 crop contains a centred 40 × 40 square.
  const blob = await exportCrop(picture, { x: 10, y: 40, width: 40, height: 60 }, 90,
    { outputSize: size, maxWidth: 80, type: "image/webp", quality: 0.8 });
  assert.equal(blob?.type, "image/webp");
  assert.equal(canvases.length, 1);
  const [canvas] = canvases;
  assert.equal(canvas!.width, 150);
  assert.equal(canvas!.height, 150);
  const { translate, scale, rotate, drawImage } = canvas!.context;
  assert.deepEqual(translate.mock.calls[0]!.arguments, [75, 75]);
  const [x, y] = translate.mock.calls[1]!.arguments;
  assert.ok(Math.abs(x - 10) < 1e-10 && Math.abs(y + 10) < 1e-10);
  assert.deepEqual(scale.mock.calls[0]!.arguments, [3.75, 3.75]);
  assert.deepEqual(rotate.mock.calls[0]!.arguments, [Math.PI / 2]);
  assert.deepEqual(drawImage.mock.calls[0]!.arguments, [picture, -60, -40]);
  assert.deepEqual(canvas!.toBlob.mock.calls[0]!.arguments.slice(1), ["image/webp", 0.8]);
});

test("a wide fractional crop is trimmed horizontally to an exact portrait output", async t => {
  const canvases = recordCanvases(t);
  await exportCrop(image as never, { x: 200.5, y: 100, width: 400, height: 200 }, 0, { outputSize: { width: 60, height: 120 } });
  const [canvas] = canvases;
  assert.equal(canvas!.width, 60);
  assert.equal(canvas!.height, 120);
  assert.deepEqual(canvas!.context.scale.mock.calls[0]!.arguments, [0.6, 0.6]);
  assert.deepEqual(canvas!.context.translate.mock.calls[1]!.arguments, [599.5, 300]);
});

test("an extreme valid aspect can export a subpixel source strip", async t => {
  const canvases = recordCanvases(t);
  const picture = { width: 16, height: 16 };
  const state = { zoom: 1, rotation: 0, offset: { x: 0, y: 0 } };
  for (const outputSize of [{ width: 8192, height: 1 }, { width: 1, height: 8192 }]) {
    const frame = frameSize(400, outputSize.width / outputSize.height, 480);
    const rect = measureCropRect(picture, frame, state);
    assert.equal(Math.min(rect.width, rect.height), 16 / 8192);
    await exportCrop(picture as never, rect, 0, { outputSize });
    assert.deepEqual(canvases.at(-1)!.context.scale.mock.calls[0]!.arguments, [512, 512]);
    const rounded = cropRect(picture, frame, state);
    assert.equal(Math.min(rounded.width, rounded.height), 0);
    await assert.rejects(exportCrop(picture as never, rounded, 0, { outputSize }), RangeError);
  }
});

test("legacy exports keep their original dimensions and only downscale under maxWidth", async t => {
  const canvases = recordCanvases(t);
  const rect = { x: 10, y: 20, width: 401, height: 201 };
  for (const maxWidth of [undefined, 800, 200]) {
    await exportCrop(image as never, rect, 0, { maxWidth });
    const output = canvases.at(-1)!;
    const stage = canvases.at(-2)!;
    const expected = maxWidth === 200 ? [200, 100] : [401, 201];
    assert.deepEqual([output.width, output.height], expected);
    assert.deepEqual(output.context.drawImage.mock.calls[0]!.arguments, [stage, 10, 20, 401, 201, 0, 0, ...expected]);
  }
});
