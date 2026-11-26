import type { en, EleaMessages } from "@alien6-studio/elea-content";
import { createCropFormats, ImageCropper, type ImageCropperProps } from "@alien6-studio/elea-media";
import { useEffect, useRef } from "react";
import type { ImageCropOptions, ImageCropSource, ImageUploadOptions, ImageUploadStatus } from "../provider.js";

export { ImageCropper } from "@alien6-studio/elea-media";

interface FramingProps {
  input: ImageCropSource;
  defaults: typeof en;
  options: ImageCropOptions;
  messages: EleaMessages;
  allowSvg?: boolean | undefined;
  status: ImageUploadStatus | null;
  onCancel: () => void;
  onConfirm: (file: File, crop?: ImageUploadOptions["crop"]) => void;
  onFailure: () => void;
}

export function ImageFrame({ input, messages, options, defaults, status, allowSvg, onConfirm, onCancel, onFailure }: Readonly<FramingProps>) {
  const live = useRef(false);
  useEffect(() => {
    live.current = true;
    return () => { live.current = false; };
  }, []);
  const { aspect, shape, formats, resolveOriginal, ...exportOptions } = options;
  const original = input.source;
  const image = messages.image;
  const confirm: ImageCropperProps["onConfirm"] = (blob, _rect, _state, recipe) => {
    if (!live.current) return;
    if (!blob) return onFailure();
    const keep = resolveOriginal && recipe &&
      (typeof original === "string" || original.type !== "image/svg+xml" || allowSvg);
    onConfirm(new File([blob], input.name ?? "crop", { type: blob.type }), keep ? { ...input, recipe } : undefined);
  };
  return (
    <ImageCropper file={typeof original === "string" ? undefined : original}
      src={typeof original === "string" ? original : undefined}
      initialCrop={input.recipe} onConfirm={confirm} onCancel={onCancel} busy={Boolean(status)}
      aspect={aspect} shape={shape} export={exportOptions}
      formats={formats ? createCropFormats({
        ...(typeof formats === "object" && formats),
        labels: { ...(messages.cropFormats ?? defaults.cropFormats), corners: messages.cropCorners ?? defaults.cropCorners },
      }) : undefined}
      labels={{ zoom: image.cropZoom, rotation: image.cropRotation, confirm: status?.label ?? image.cropConfirm, cancel: image.cropCancel, image: image.cropImage }}
    />
  );
}
