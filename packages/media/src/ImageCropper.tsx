"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent } from "react";
import { useObjectUrl } from "./useObjectUrl.js";
import { clampOffset, cropRect, displayScale, exportCrop, frameSize, type CropRect, type CropState, type ExportOptions, type Point, type Size } from "./crop.js";

export interface ImageCropperLabels {
  zoom: string;
  rotation: string;
  confirm: string;
  cancel: string;
  /** Accessible name of the picture being framed. */
  image: string;
}

export interface ImageCropperProps {
  /** The source of the image to crop: an object URL, an image data URL or a web address. */
  src?: string | undefined;
  /** The picked file to crop, in place of `src`: the cropper makes its preview address and releases it. */
  file?: Blob | null | undefined;
  /** Width over height of the crop; the image's own ratio when absent. */
  aspect?: number | undefined;
  /** A round mask for avatars; the exported image stays rectangular. */
  shape?: "rect" | "round" | undefined;
  /** Largest zoom over the covering scale; defaults to 3. */
  maxZoom?: number | undefined;
  /** Height cap of the frame in pixels; defaults to 480. */
  maxHeight?: number | undefined;
  export?: ExportOptions | undefined;
  /** Keeps the confirm and cancel controls unavailable while the host saves the image. */
  busy?: boolean | undefined;
  labels: ImageCropperLabels;
  /** The exported picture, or `null` where canvases cannot draw; the crop window in rotated image pixels. */
  onConfirm: (blob: Blob | null, rect: CropRect, state: CropState) => void;
  onCancel?: (() => void) | undefined;
  /** Extra actions beside confirm and cancel. */
  actions?: ReactNode | undefined;
  className?: string | undefined;
  /** Called with every change, for hosts that track the state. */
  onChange?: ((state: CropState) => void) | undefined;
}

const INITIAL: CropState = { zoom: 1, rotation: 0, offset: { x: 0, y: 0 } };
const FALLBACK_WIDTH = 640;

function cropImageSource(src: string): string | undefined {
  const url = src.trim();
  if (!url) return undefined;
  try {
    const { protocol } = new URL(url, "https://relative.invalid/");
    const isImageData = protocol === "data:" && /^data:image\/[a-z0-9.+-]+[;,]/i.test(url);
    if (protocol === "https:" || protocol === "http:" || protocol === "blob:" || isImageData) {
      return url.replaceAll(/[<>"]/g, encodeURIComponent);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Frames an image: drag to move it, zoom with the wheel or the slider, rotate with the slider.
 * The frame always stays covered, so the export never has empty corners.
 */
export function ImageCropper({ src, file, aspect, shape = "rect", maxZoom = 3, maxHeight = 480, export: exportOptions, busy: saving = false, labels, onConfirm, onCancel, actions, className, onChange }: Readonly<ImageCropperProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<Size | null>(null);
  const [containerWidth, setContainerWidth] = useState(FALLBACK_WIDTH);
  const [state, setState] = useState<CropState>(INITIAL);
  const [exporting, setExporting] = useState(false);
  const preview = useObjectUrl(file);
  const imageSource = useMemo(() => cropImageSource(preview ?? src ?? ""), [preview, src]);
  const busy = saving || exporting;
  const drag = useRef<{ origin: Point; offset: Point } | null>(null);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const measure = () => setContainerWidth(element.getBoundingClientRect().width || FALLBACK_WIDTH);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setState(INITIAL);
    setNatural(null);
  }, [src, file]);

  const image = natural ?? { width: 1, height: 1 };
  const ratio = aspect ?? (natural ? natural.width / natural.height : 4 / 3);
  const frame = frameSize(containerWidth, ratio, maxHeight);
  const scale = displayScale(image, frame, state);

  const update = useCallback((next: Partial<CropState>) => {
    setState((previous) => {
      const merged = { ...previous, ...next };
      const nextScale = displayScale(image, frame, merged);
      const result = { ...merged, offset: clampOffset(merged.offset, image, frame, nextScale, merged.rotation) };
      onChange?.(result);
      return result;
    });
  }, [image, frame, onChange]);

  const onLoad = () => {
    const element = imageRef.current;
    if (!element) return;
    setNatural({ width: element.naturalWidth || frame.width, height: element.naturalHeight || frame.height });
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { origin: { x: event.clientX, y: event.clientY }, offset: state.offset };
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    if (!drag.current) return;
    update({ offset: { x: drag.current.offset.x + event.clientX - drag.current.origin.x, y: drag.current.offset.y + event.clientY - drag.current.origin.y } });
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    update({ zoom: Math.min(maxZoom, Math.max(1, state.zoom - event.deltaY / 500)) });
  };

  const confirm = async () => {
    const element = imageRef.current;
    const rect = cropRect(image, frame, state);
    if (!element || !natural) {
      onConfirm(null, rect, state);
      return;
    }
    setExporting(true);
    try {
      const blob = await exportCrop(Object.assign(element, { width: natural.width, height: natural.height }), rect, state.rotation, exportOptions);
      onConfirm(blob, rect, state);
    } finally {
      setExporting(false);
    }
  };

  const transform = `translate(calc(-50% + ${state.offset.x}px), calc(-50% + ${state.offset.y}px)) rotate(${state.rotation}deg) scale(${scale})`;
  return (
    <div className={["elea-cropper", shape === "round" ? "elea-cropper--round" : "", className ?? ""].filter(Boolean).join(" ")} ref={containerRef}>
      <div
        className="elea-cropper__frame"
        style={{ width: frame.width, height: frame.height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        role="img"
        aria-label={labels.image}
      >
        <img ref={imageRef} src={imageSource} alt="" draggable={false} className="elea-cropper__image" style={{ transform }} onLoad={onLoad} />
        <div className="elea-cropper__mask" aria-hidden="true" />
      </div>
      <div className="elea-cropper__controls">
        <label className="elea-cropper__slider">
          <span>{labels.zoom}</span>
          <input type="range" min={1} max={maxZoom} step={0.01} value={state.zoom} onChange={(event) => update({ zoom: Number(event.target.value) })} />
        </label>
        <label className="elea-cropper__slider">
          <span>{labels.rotation}</span>
          <input type="range" min={-180} max={180} step={1} value={state.rotation} onChange={(event) => update({ rotation: Number(event.target.value) })} />
        </label>
        <div className="elea-cropper__actions">
          {actions}
          {onCancel && <button type="button" className="elea-cropper__button" onClick={onCancel} disabled={busy}>{labels.cancel}</button>}
          <button type="button" className="elea-cropper__button elea-cropper__button--primary" onClick={() => void confirm()} disabled={busy}>{labels.confirm}</button>
        </div>
      </div>
    </div>
  );
}
