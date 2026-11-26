"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { CropRect, Point, Size } from "./crop.js";

interface Selection {
  /** Centre and side lengths as fractions of the stage. */
  center: Point;
  span: Size;
  aspect: number | undefined;
}
const corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;
type Corner = typeof corners[number];
export type CropCornerLabels = Record<Corner, string>;
type Action = "move" | Corner;
type Control = Action | "resize";
interface Drag {
  id: number;
  origin: Point;
  selection: Selection;
  action: Action;
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

function initialSelection(mask: CropRect | undefined, aspect: number | undefined): Selection {
  if (mask && [mask.x, mask.y, mask.width, mask.height].every(Number.isFinite) &&
    mask.width > 0 && mask.width <= 1 && mask.height > 0 && mask.height <= 1) {
    return remember(mask, { width: 1, height: 1 }, aspect);
  }
  return { center: { x: 0.5, y: 0.5 }, span: { width: 0.8, height: 0.8 }, aspect };
}

function actionFor(control: Control, button: HTMLButtonElement): Action {
  // The original, single resize handle follows the host's writing direction.
  if (control === "resize") return getComputedStyle(button).direction === "rtl" ? "bottomLeft" : "bottomRight";
  return control;
}

function adjust(action: Action, rect: CropRect, stage: Size, aspect: number | undefined, dx: number, dy: number): CropRect {
  if (action === "move") return { ...rect,
    x: clamp(rect.x + dx, 0, stage.width - rect.width), y: clamp(rect.y + dy, 0, stage.height - rect.height),
  };
  const left = action.endsWith("Left");
  const top = action.startsWith("top");
  const oppositeX = left ? rect.x + rect.width : rect.x;
  const oppositeY = top ? rect.y + rect.height : rect.y;
  const roomX = left ? oppositeX : stage.width - oppositeX;
  const roomY = top ? oppositeY : stage.height - oppositeY;
  const across = left ? -dx : dx;
  const down = top ? -dy : dy;
  let width = clamp(rect.width + across, MIN_SIDE, roomX);
  let height = clamp(rect.height + down, MIN_SIDE, roomY);
  if (aspect !== undefined) {
    const delta = Math.abs(across) >= Math.abs(down * aspect) ? across : down * aspect;
    // A very wide or tall format can have a subpixel short edge.
    const minWidth = MIN_SIDE * Math.min(1, aspect);
    width = clamp(rect.width + delta, minWidth, Math.min(roomX, roomY * aspect));
    height = width / aspect;
  }
  return { x: left ? oppositeX - width : oppositeX, y: top ? oppositeY - height : oppositeY, width, height };
}

const steps: Record<string, Point | undefined> = {
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
};

/** The movable window and its rectangle in stage pixels, shared by the preview and export. */
export function useCropMask(stage: Size, aspect: number | undefined, labels: { move: string; resize: string; corners?: CropCornerLabels | undefined } | undefined, disabled: boolean, initialMask?: CropRect): {
  rect: CropRect;
  overlay: ReactNode;
} {
  const ratio = aspect !== undefined && Number.isFinite(aspect) && aspect > 0 ? aspect : undefined;
  const [selection, setSelection] = useState<Selection>(() => initialSelection(initialMask, ratio));
  const [drag, setDrag] = useState<Drag | null>(null);
  const descriptionId = useId();
  if (!labels || stage.width <= 0 || stage.height <= 0) return { rect: { x: 0, y: 0, ...stage }, overlay: null };

  let rect = bounds(selection, stage);
  if (ratio !== selection.aspect) {
    // Capture the actual old window before switching aspect, including when unlocking it.
    const next = remember(rect, stage, ratio);
    setSelection(next);
    rect = bounds(next, stage);
  }
  function start(event: PointerEvent<HTMLButtonElement>, control: Control) {
    event.stopPropagation();
    if (disabled || event.button !== 0 || (drag && !event.isPrimary)) return;
    if (!labels?.corners) {
      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ id: event.pointerId, origin: { x: event.clientX, y: event.clientY }, selection: remember(rect, stage, ratio),
      action: actionFor(control, event.currentTarget) });
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || !drag || drag.id !== event.pointerId) return;
    event.stopPropagation();
    if (drag.selection.aspect !== ratio) return;
    const next = adjust(drag.action, bounds(drag.selection, stage), stage, ratio, event.clientX - drag.origin.x, event.clientY - drag.origin.y);
    setSelection(remember(next, stage, ratio));
  }
  function stop(event: PointerEvent<HTMLButtonElement>) {
    if (!drag || drag.id !== event.pointerId) return;
    event.stopPropagation();
    setDrag(null);
  }
  function key(event: KeyboardEvent<HTMLButtonElement>, control: Control) {
    const step = steps[event.key];
    if (disabled || !step || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    const amount = event.shiftKey ? 10 : 1;
    const action = actionFor(control, event.currentTarget);
    setSelection(remember(adjust(action, rect, stage, ratio, step.x * amount, step.y * amount), stage, ratio));
  }
  const control = (action: Control, label: string, description: string) => (
    <button key={action} type="button" className={action === "move" ? "elea-cropper__move" : "elea-cropper__resize"}
      data-corner={action === "move" || action === "resize" ? undefined : action} aria-label={label} aria-describedby={`${descriptionId}-${action}`}
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown"
      disabled={disabled} onKeyDown={event => key(event, action)} onPointerDown={event => start(event, action)}
      onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
      <span hidden id={`${descriptionId}-${action}`}>{description}</span>
    </button>
  );
  const cornerLabels = labels.corners;
  const dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  const overlay = <div className="elea-cropper__crop-window" data-guides={cornerLabels ? "" : undefined}
    data-dragging={drag ? "" : undefined} style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
    {control("move", labels.move, `x: ${Math.round(rect.x)}, y: ${Math.round(rect.y)}`)}
    {cornerLabels ? corners.map(corner => control(corner, cornerLabels[corner], dimensions)) : control("resize", labels.resize, dimensions)}
  </div>;
  return { rect, overlay };
}
