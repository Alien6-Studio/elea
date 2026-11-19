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

/** The bounding box of an image rotated by `rotation` degrees. */
export function rotatedSize(image: Size, rotation: number): Size {
  const radians = rotation * RADIANS;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return { width: image.width * cos + image.height * sin, height: image.width * sin + image.height * cos };
}

/** The smallest scale at which the rotated image covers the frame entirely. */
export function coverScale(image: Size, frame: Size, rotation = 0): number {
  const rotated = rotatedSize(image, rotation);
  if (rotated.width <= 0 || rotated.height <= 0) return 1;
  return Math.max(frame.width / rotated.width, frame.height / rotated.height);
}

/** Keeps the frame inside the image: the offset cannot reveal space beyond an edge. */
export function clampOffset(offset: Point, image: Size, frame: Size, scale: number, rotation = 0): Point {
  const rotated = rotatedSize(image, rotation);
  const maxX = Math.max(0, (rotated.width * scale - frame.width) / 2);
  const maxY = Math.max(0, (rotated.height * scale - frame.height) / 2);
  // `|| 0` turns a negative zero into zero, so clamped values compare as plain numbers
  return { x: Math.min(maxX, Math.max(-maxX, offset.x)) || 0, y: Math.min(maxY, Math.max(-maxY, offset.y)) || 0 };
}

/** The scale on screen for a state: the covering scale times the zoom. */
export function displayScale(image: Size, frame: Size, state: CropState): number {
  return coverScale(image, frame, state.rotation) * state.zoom;
}

/** The frame, mapped to the pixels of the rotated image. */
export function cropRect(image: Size, frame: Size, state: CropState): CropRect {
  const rotated = rotatedSize(image, state.rotation);
  const scale = displayScale(image, frame, state);
  const offset = clampOffset(state.offset, image, frame, scale, state.rotation);
  const width = frame.width / scale;
  const height = frame.height / scale;
  return {
    x: round(rotated.width / 2 - (frame.width / 2 + offset.x) / scale),
    y: round(rotated.height / 2 - (frame.height / 2 + offset.y) / scale),
    width: round(width),
    height: round(height),
  };
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
}

/**
 * Draws the crop of a loaded image to a Blob through a canvas. Resolves to `null` where
 * canvases cannot draw (no 2D context, as under jsdom), so callers can fall back to the file.
 */
export function exportCrop(image: CanvasImageSource & Size, rect: CropRect, rotation: number, options: ExportOptions = {}): Promise<Blob | null> {
  if (typeof document === "undefined") return Promise.resolve(null);
  const rotated = rotatedSize(image, rotation);
  const stage = document.createElement("canvas");
  stage.width = Math.max(1, Math.round(rotated.width));
  stage.height = Math.max(1, Math.round(rotated.height));
  const context = stage.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.translate(stage.width / 2, stage.height / 2);
  context.rotate(rotation * RADIANS);
  context.drawImage(image, -image.width / 2, -image.height / 2);

  const ratio = options.maxWidth && rect.width > options.maxWidth ? options.maxWidth / rect.width : 1;
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(rect.width * ratio));
  output.height = Math.max(1, Math.round(rect.height * ratio));
  const target = output.getContext("2d");
  if (!target) return Promise.resolve(null);
  target.drawImage(stage, rect.x, rect.y, rect.width, rect.height, 0, 0, output.width, output.height);
  return new Promise((resolve) => output.toBlob((blob) => resolve(blob), options.type, options.quality));
}
