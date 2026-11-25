/** Geometry of an image crop: pure functions, no DOM, shared by the component and the canvas export. */

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** A crop window in the pixels of the rotated image. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** How the image sits in the frame: zoom over the covering scale, rotation in degrees, image center offset from the frame center in frame pixels. */
export interface CropState {
  zoom: number;
  rotation: number;
  offset: Point;
}

const RADIANS = Math.PI / 180;

function rotationAxes(rotation: number) {
  const radians = rotation * RADIANS;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return rotation % 90 === 0 ? { cos: Math.round(cos), sin: Math.round(sin) } : { cos, sin };
}

function projectedSize(size: Size, cos: number, sin: number): Size {
  return {
    width: size.width * Math.abs(cos) + size.height * Math.abs(sin),
    height: size.width * Math.abs(sin) + size.height * Math.abs(cos),
  };
}

/** The bounding box of an image rotated by `rotation` degrees. */
export function rotatedSize(image: Size, rotation: number): Size {
  const { cos, sin } = rotationAxes(rotation);
  return projectedSize(image, cos, sin);
}

/** The smallest scale at which the rotated image covers the frame entirely. */
export function coverScale(image: Size, frame: Size, rotation = 0): number {
  if (image.width <= 0 || image.height <= 0) return 1;
  const required = rotatedSize(frame, -rotation);
  return Math.max(required.width / image.width, required.height / image.height);
}

/** Keeps the frame inside the image: the offset cannot reveal space beyond an edge. */
export function clampOffset(offset: Point, image: Size, frame: Size, scale: number, rotation = 0): Point {
  const { cos, sin } = rotationAxes(rotation);
  // In the image's axes its edges are horizontal and vertical, so we can clamp the two coordinates independently.
  const required = projectedSize(frame, cos, sin);
  const maxX = Math.max(0, (image.width * scale - required.width) / 2);
  const maxY = Math.max(0, (image.height * scale - required.height) / 2);
  const localX = Math.min(maxX, Math.max(-maxX, cos * offset.x + sin * offset.y));
  const localY = Math.min(maxY, Math.max(-maxY, cos * offset.y - sin * offset.x));
  return { x: (cos * localX - sin * localY) || 0, y: (sin * localX + cos * localY) || 0 };
}

/** The scale on screen for a state: the covering scale times the zoom. */
export function displayScale(image: Size, frame: Size, state: CropState): number {
  return coverScale(image, frame, state.rotation) * state.zoom;
}

/** Keep subpixel dimensions through a fixed-size export, even if the source crop is thinner than 0.01px. */
export function measureCropRect(image: Size, frame: Size, state: CropState): CropRect {
  const rotated = rotatedSize(image, state.rotation);
  const scale = displayScale(image, frame, state);
  const offset = clampOffset(state.offset, image, frame, scale, state.rotation);
  return {
    x: rotated.width / 2 - (frame.width / 2 + offset.x) / scale,
    y: rotated.height / 2 - (frame.height / 2 + offset.y) / scale,
    width: frame.width / scale,
    height: frame.height / scale,
  };
}

/** The frame, mapped to the pixels of the rotated image and rounded to two decimal places. */
export function cropRect(image: Size, frame: Size, state: CropState): CropRect {
  const rect = measureCropRect(image, frame, state);
  return { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) };
}

/** The frame size for a container width and an aspect ratio, capped in height. */
export function frameSize(containerWidth: number, aspect: number, maxHeight: number): Size {
  const width = Math.max(1, containerWidth);
  const height = width / aspect;
  if (height <= maxHeight) return { width, height };
  return { width: maxHeight * aspect, height: maxHeight };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface ExportOptions {
  /** MIME type of the output; defaults to the PNG of the canvas. */
  type?: string | undefined;
  /** Encoder quality for lossy types, 0 to 1. */
  quality?: number | undefined;
  /** The output is scaled down to this width when the crop is wider. */
  maxWidth?: number | undefined;
  /** Exact output pixels, including upscaling. Takes precedence over maxWidth. */
  outputSize?: Size | undefined;
}

export const MAX_OUTPUT_DIMENSION = 8192;
export const MAX_OUTPUT_PIXELS = 16_777_216;

/** The exact-size canvas is capped at 64 MiB of RGBA pixels. */
export function isValidOutputSize(size: Size | null | undefined): size is Size {
  if (!size) return false;
  const { width, height } = size;
  return Number.isInteger(width) && width > 0 && width <= MAX_OUTPUT_DIMENSION
    && Number.isInteger(height) && height > 0 && height <= MAX_OUTPUT_DIMENSION
    && width * height <= MAX_OUTPUT_PIXELS;
}

function exactCropCanvas(image: CanvasImageSource & Size, rect: CropRect, rotation: number, size: Size): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const rotated = rotatedSize(image, rotation);
  const scale = coverScale(rect, size);
  // Map the crop centre to the canvas centre. Uniform scaling clips excess source pixels on both sides.
  context.translate(size.width / 2, size.height / 2);
  context.scale(scale, scale);
  context.translate((rotated.width - rect.width) / 2 - rect.x, (rotated.height - rect.height) / 2 - rect.y);
  context.rotate(rotation * RADIANS);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  return canvas;
}

function cropCanvas(image: CanvasImageSource & Size, rect: CropRect, rotation: number, maxWidth?: number): HTMLCanvasElement | null {
  const rotated = rotatedSize(image, rotation);
  const stage = document.createElement("canvas");
  stage.width = Math.max(1, Math.round(rotated.width));
  stage.height = Math.max(1, Math.round(rotated.height));
  const context = stage.getContext("2d");
  if (!context) return null;
  context.translate(stage.width / 2, stage.height / 2);
  context.rotate(rotation * RADIANS);
  context.drawImage(image, -image.width / 2, -image.height / 2);

  const ratio = maxWidth && rect.width > maxWidth ? maxWidth / rect.width : 1;
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(rect.width * ratio));
  output.height = Math.max(1, Math.round(rect.height * ratio));
  const target = output.getContext("2d");
  if (!target) return null;
  target.drawImage(stage, rect.x, rect.y, rect.width, rect.height, 0, 0, output.width, output.height);
  return output;
}

/**
 * Draws the crop of a loaded image to a Blob through a canvas. Resolves to `null` where
 * canvases cannot draw. An exact output centre-crops a mismatched rectangle to fit.
 */
export function exportCrop(image: CanvasImageSource & Size, rect: CropRect, rotation: number, options: ExportOptions = {}): Promise<Blob | null> {
  const size = options.outputSize;
  if (size !== undefined && !isValidOutputSize(size)) {
    return Promise.reject(new RangeError(`Output dimensions must be whole pixels from 1 to ${MAX_OUTPUT_DIMENSION}, with at most ${MAX_OUTPUT_PIXELS} pixels in total.`));
  }
  if (size && (rect.width <= 0 || rect.height <= 0 || ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite))) {
    return Promise.reject(new RangeError("The source crop must have finite coordinates and positive dimensions."));
  }
  if (typeof document === "undefined") return Promise.resolve(null);
  const output = size ? exactCropCanvas(image, rect, rotation, size) : cropCanvas(image, rect, rotation, options.maxWidth);
  if (!output) return Promise.resolve(null);
  return new Promise((resolve) => output.toBlob((blob) => resolve(blob), options.type, options.quality));
}
