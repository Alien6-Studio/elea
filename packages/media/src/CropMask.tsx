"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { CropRect, Point, Size } from "./crop.js";

interface Selection {
  /** Centre and side lengths as fractions of the stage. */
  center: Point;
  span: Size;
  aspect: number | undefined;
}
type Action = "move" | "resize";
interface Drag {
  id: number;
  origin: Point;
  selection: Selection;
  action: Action;
  rtl: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const MIN_SIDE = 24;

function bounds(selection: Selection, stage: Size): CropRect {
  const { aspect, span, center } = selection;
  let width = span.width * stage.width;
  let height = span.height * stage.height;
  if (aspect !== undefined) {
    const coverage = Math.max(span.width, span.height);
    width = Math.min(stage.width, stage.height * aspect) * coverage;
    height = width / aspect;
  }
  return {
    x: clamp(center.x * stage.width - width / 2, 0, stage.width - width),
    y: clamp(center.y * stage.height - height / 2, 0, stage.height - height),
    width, height,
  };
}

function remember(rect: CropRect, stage: Size, aspect: number | undefined): Selection {
  return {
    center: { x: (rect.x + rect.width / 2) / stage.width, y: (rect.y + rect.height / 2) / stage.height },
    span: { width: rect.width / stage.width, height: rect.height / stage.height },
    aspect,
  };
}

function adjust(action: Action, rect: CropRect, stage: Size, aspect: number | undefined, dx: number, dy: number, rtl: boolean): CropRect {
  if (action === "move") return { ...rect,
    x: clamp(rect.x + dx, 0, stage.width - rect.width), y: clamp(rect.y + dy, 0, stage.height - rect.height),
  };
  const end = rect.x + rect.width;
  const roomX = rtl ? end : stage.width - rect.x;
  const roomY = stage.height - rect.y;
  const across = rtl ? -dx : dx;
  let width = clamp(rect.width + across, MIN_SIDE, roomX);
  let height = clamp(rect.height + dy, MIN_SIDE, roomY);
  if (aspect !== undefined) {
    const delta = Math.abs(across) >= Math.abs(dy * aspect) ? across : dy * aspect;
    // A very wide or tall format can have a subpixel short edge.
    const minWidth = MIN_SIDE * Math.min(1, aspect);
    width = clamp(rect.width + delta, minWidth, Math.min(roomX, roomY * aspect));
    height = width / aspect;
  }
  return { x: rtl ? end - width : rect.x, y: rect.y, width, height };
}

const steps: Record<string, Point | undefined> = {
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
};

/** The movable window and its rectangle in stage pixels, shared by the preview and export. */
export function useCropMask(stage: Size, aspect: number | undefined, labels: { move: string; resize: string } | undefined, disabled: boolean): {
  rect: CropRect;
  overlay: ReactNode;
} {
  const ratio = aspect !== undefined && Number.isFinite(aspect) && aspect > 0 ? aspect : undefined;
  const [selection, setSelection] = useState<Selection>({ center: { x: 0.5, y: 0.5 }, span: { width: 0.8, height: 0.8 }, aspect: ratio });
  const drag = useRef<Drag | null>(null);
  if (!labels || stage.width <= 0 || stage.height <= 0) return { rect: { x: 0, y: 0, ...stage }, overlay: null };

  let rect = bounds(selection, stage);
  if (ratio !== selection.aspect) {
    // Capture the actual old window before switching aspect, including when unlocking it.
    const next = remember(rect, stage, ratio);
    setSelection(next);
    rect = bounds(next, stage);
  }
  function start(event: PointerEvent<HTMLButtonElement>, action: Action) {
    event.stopPropagation();
    if (disabled || event.button !== 0 || (drag.current && !event.isPrimary)) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { id: event.pointerId, origin: { x: event.clientX, y: event.clientY }, selection: remember(rect, stage, ratio), action,
      rtl: getComputedStyle(event.currentTarget).direction === "rtl" };
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const from = drag.current;
    if (disabled || !from || from.id !== event.pointerId) return;
    event.stopPropagation();
    if (from.selection.aspect !== ratio) return;
    const next = adjust(from.action, bounds(from.selection, stage), stage, ratio, event.clientX - from.origin.x, event.clientY - from.origin.y, from.rtl);
    setSelection(remember(next, stage, ratio));
  }
  function stop(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.id !== event.pointerId) return;
    event.stopPropagation();
    drag.current = null;
  }
  function key(event: KeyboardEvent<HTMLButtonElement>, action: Action) {
    const step = steps[event.key];
    if (disabled || !step || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    const amount = event.shiftKey ? 10 : 1;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    setSelection(remember(adjust(action, rect, stage, ratio, step.x * amount, step.y * amount, rtl), stage, ratio));
  }
  const control = (action: Action, label: string, description: string) => (
    <button type="button" className={`elea-cropper__${action}`} aria-label={label} aria-description={description}
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown"
      disabled={disabled} onKeyDown={event => key(event, action)} onPointerDown={event => start(event, action)}
      onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} />
  );
  const overlay = <div className="elea-cropper__crop-window" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
    {control("move", labels.move, `x: ${Math.round(rect.x)}, y: ${Math.round(rect.y)}`)}
    {control("resize", labels.resize, `${Math.round(rect.width)} × ${Math.round(rect.height)}`)}
  </div>;
  return { rect, overlay };
}
