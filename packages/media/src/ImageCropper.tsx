"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent } from "react";
import { useObjectUrl } from "./useObjectUrl.js";
import type { CropFormats } from "./createCropFormats.js";
import type { CropButtonProps, CropLayout, CropSliderProps } from "./AdjustableCrop.js";
import { clampOffset, cropRect, displayScale, exportCrop, frameSize, isValidOutputSize, measureCropRect, type CropRect, type CropState, type ExportOptions, type Point, type Size } from "./crop.js";

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
  /** Show an editable output format picker. A selected format sets both the frame and the export. */
  formats?: CropFormats | undefined;
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

function CropSlider({ label, value, onChange, ...range }: Readonly<CropSliderProps>) {
  return <label className="elea-cropper__slider"><span>{label}</span>
    <input type="range" {...range} value={value} onChange={event => onChange(event.currentTarget.valueAsNumber)} />
  </label>;
}

function CropButton({ variant, ...props }: Readonly<CropButtonProps>) {
  return <button type="button" className={variant === "primary" ? "elea-cropper__button elea-cropper__button--primary" : "elea-cropper__button"} {...props} />;
}

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
export function ImageCropper({ src, file, aspect, shape = "rect", maxZoom = 3, maxHeight = 480, export: exportOptions, formats, busy: saving = false, labels, onConfirm, onCancel, actions, className, onChange }: Readonly<ImageCropperProps>) {
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
  const sourceRatio = natural ? natural.width / natural.height : 4 / 3;
  const requestedSize = exportOptions?.outputSize;
  const validSize = isValidOutputSize(requestedSize);
  const ratio = validSize ? requestedSize.width / requestedSize.height : aspect ?? sourceRatio;
  const frame = frameSize(containerWidth, formats ? sourceRatio : ratio, maxHeight);
  const scale = displayScale(image, frame, state);
  const offset = clampOffset(state.offset, image, frame, scale, state.rotation);

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
    if (formats) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { origin: { x: event.clientX, y: event.clientY }, offset };
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

  const confirm = async ({ outputSize, mask }: CropLayout) => {
    const element = imageRef.current;
    const current = { ...state, offset };
    let rect = outputSize || formats ? measureCropRect(image, frame, current) : cropRect(image, frame, current);
    if (mask) {
      rect = {
        x: rect.x + mask.x / scale,
        y: rect.y + mask.y / scale,
        width: mask.width / scale,
        height: mask.height / scale,
      };
    }
    if (!element || !natural) {
      onConfirm(null, rect, current);
      return;
    }
    setExporting(true);
    try {
      const blob = await exportCrop(Object.assign(element, { width: natural.width, height: natural.height }), rect, current.rotation, { ...exportOptions, outputSize });
      onConfirm(blob, rect, current);
    } finally {
      setExporting(false);
    }
  };

  const transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${state.rotation}deg) scale(${scale})`;
  const render = (layout: CropLayout) => {
    const Slider = layout.Slider ?? CropSlider;
    const Button = layout.Button ?? CropButton;
    return (
      <>
        <div
          className="elea-cropper__frame"
          style={{ width: frame.width, height: frame.height }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          role={formats ? "group" : "img"}
          aria-label={labels.image}
        >
          <img ref={imageRef} src={imageSource} alt="" draggable={false} className="elea-cropper__image" style={{ transform }} onLoad={onLoad} />
          {formats ? layout.overlay : <div className="elea-cropper__mask" aria-hidden="true" />}
        </div>
        {layout.controls}
        <div className="elea-cropper__controls">
          <Slider label={labels.zoom} min={1} max={maxZoom} step={0.01} value={state.zoom} onChange={zoom => update({ zoom })} />
          <Slider label={labels.rotation} min={-180} max={180} step={1} value={state.rotation} onChange={rotation => update({ rotation })} />
          <div className="elea-cropper__actions">
            {actions}
            {onCancel && <Button variant="outline" onClick={onCancel} disabled={busy}>{labels.cancel}</Button>}
            <Button variant="primary" onClick={() => void confirm(layout)} disabled={busy || layout.invalid || (!!formats && !natural)}>{labels.confirm}</Button>
          </div>
        </div>
      </>
    );
  };
  return (
    <div className={["elea-cropper", shape === "round" ? "elea-cropper--round" : "", className ?? ""].filter(Boolean).join(" ")} ref={containerRef}>
      {formats ? (
        <Suspense fallback={render({ invalid: true })}>
          {formats({ frame, natural, initialSize: requestedSize, disabled: busy, children: render })}
        </Suspense>
      ) : render({ outputSize: requestedSize, invalid: requestedSize !== undefined && !validSize })}
    </div>
  );
}
