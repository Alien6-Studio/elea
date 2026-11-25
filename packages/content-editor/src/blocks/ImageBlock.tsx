"use client";

import { imageBlock, type EleaBlock, type FileRef } from "@alien6-studio/elea-content";
import { safeImageSource } from "@alien6-studio/elea-content-viewer";
import { DropZone } from "@alien6-studio/elea-media";
import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "../icons.js";
import { cropperPart, usePart } from "../parts.js";
import { useContentServices, type EditorContextInfo, type ImageUploadStatus } from "../provider.js";
import { MediaActions } from "./MediaActions.js";

export interface MediaBlockProps {
  block: EleaBlock;
  onUpdate: (data: EleaBlock["data"]) => void;
  onFocus: () => void;
  context: EditorContextInfo;
}

function withImageFile(data: EleaBlock["data"], file: FileRef) {
  // Replacing or removing the file also supersedes a stored top-level URL.
  const { url: _oldUrl, ...rest } = data;
  return { ...rest, file };
}

/**
 * What the upload is doing: the label in a live region, so a change of phase is heard, and the
 * bar beside it. `quiet` keeps the label for assistive technology where it already shows.
 */
function UploadStatus({ status, quiet = false }: Readonly<{ status: ImageUploadStatus | null; quiet?: boolean }>) {
  const progress = status?.progress;
  return (
    <div className="elea-upload-status">
      <output className={quiet ? "elea-visually-hidden" : "elea-upload-status__label"}>{status?.label}</output>
      {typeof progress === "number" && Number.isFinite(progress) && <progress className="elea-upload-status__bar" max={1} value={Math.min(1, Math.max(0, progress))} aria-label={status?.label} />}
    </div>
  );
}

/**
 * Picks a picture, frames it unless the host turned cropping off, uploads it through the host,
 * then shows it with its caption and the actions to replace or remove it.
 */
export function ImageBlock({ block, onUpdate, onFocus, context }: Readonly<MediaBlockProps>) {
  const { messages, uploadImage, resolveAssetUrl, imageCrop, allowSvgUpload } = useContentServices();
  const data = block.data;
  const { file, caption, alt } = imageBlock.normalize(data);
  const [isUploading, setIsUploading] = useState(false);
  const [reported, setReported] = useState<ImageUploadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const focusAfterRemove = useRef(false);
  const active = useRef<AbortController | null>(null);
  const latest = useRef({ data, onUpdate });
  useEffect(() => { latest.current = { data, onUpdate }; }, [data, onUpdate]);

  // A picture that changes under a running upload, or a block that goes away, cancels it
  useEffect(() => () => {
    if (!active.current) return;
    active.current.abort();
    active.current = null;
    setPending(null);
    setIsUploading(false);
  }, [file.id, file.url]);

  const upload = async (file: File) => {
    if (!uploadImage) {
      setError(messages.image.errorUpload);
      return;
    }
    // An SVG can carry scripts: it goes up as the raster picture the cropper exports, or not at all
    if (file.type === "image/svg+xml" && !allowSvgUpload) {
      setError(messages.image.errorSvg ?? messages.image.errorInvalidType);
      setPending(null);
      return;
    }
    if (active.current) return;
    const controller = new AbortController();
    const live = () => active.current === controller;
    active.current = controller;
    setError(null);
    setReported(null);
    setIsUploading(true);
    try {
      const result = await uploadImage(file, context, { signal: controller.signal, report: (status) => { if (live()) setReported(status); } });
      if (!live()) return;
      active.current = null;
      const current = latest.current;
      current.onUpdate(withImageFile(current.data, result));
    } catch (error_) {
      if (!live()) return;
      active.current = null;
      // Back to the drop zone, the host's reason beside it, so the picture can be picked again
      setError((error_ instanceof Error && error_.message) || messages.image.errorUpload);
    }
    setPending(null);
    setIsUploading(false);
  };

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(messages.image.errorInvalidType);
      return;
    }
    if (!uploadImage) {
      setError(messages.image.errorUpload);
      return;
    }
    setError(null);
    // Framing needs a previewable URL; where the runtime has none, the file goes up as picked
    if (imageCrop === false || typeof URL.createObjectURL !== "function") void upload(file);
    else setPending(file);
  };

  const confirmCrop = (blob: Blob | null) => {
    if (!pending) return;
    // Without a drawable canvas the picture goes up as picked
    const file = blob ? new File([blob], pending.name, { type: blob.type || pending.type }) : pending;
    void upload(file);
  };

  const source = file.url || file.id ? safeImageSource(resolveAssetUrl(file)) : null;
  const cropOptions = imageCrop === false ? undefined : imageCrop ?? {};
  const status = isUploading ? reported ?? { label: messages.image.uploading } : null;
  // The cropper loads with the first picture to frame; one it cannot reach goes up as picked
  const [cropper, cropperWaiting] = usePart(cropperPart, Boolean(pending && cropOptions), () => { if (pending) void upload(pending); });
  const busy = isUploading || cropperWaiting;

  if (cropper && pending && cropOptions) {
    const exportOptions = { type: cropOptions.type, quality: cropOptions.quality, maxWidth: cropOptions.maxWidth };
    return (
      <div className="elea-media-block" onClick={onFocus}>
        <cropper.ImageCropper
          file={pending}
          aspect={cropOptions.aspect}
          shape={cropOptions.shape}
          export={exportOptions}
          busy={isUploading}
          labels={{ zoom: messages.image.cropZoom, rotation: messages.image.cropRotation, confirm: status?.label ?? messages.image.cropConfirm, cancel: messages.image.cropCancel, image: messages.image.cropImage }}
          onConfirm={confirmCrop}
          onCancel={() => setPending(null)}
        />
        <UploadStatus status={status} quiet />
        {error && <p className="elea-field-error" role="alert">{error}</p>}
      </div>
    );
  }

  if (source) {
    return (
      <div className="elea-media-block" onClick={onFocus}>
        <div className="elea-media-block__frame">
          <img src={source} alt={alt ?? (caption || messages.viewer.imageAlt)} className="elea-media-block__image" />
          <MediaActions
            icon={<UploadIcon />} replace={status?.label ?? messages.image.replace} remove={messages.image.remove}
            busy={busy} canReplace={Boolean(uploadImage)} onReplace={() => replaceInput.current?.click()}
            onRemove={() => {
              focusAfterRemove.current = true;
              onUpdate(withImageFile(data, { url: "", id: "" }));
            }}
          >
            <input ref={replaceInput} type="file" accept="image/*" hidden onChange={(event) => { pick(event.target.files?.[0]); event.target.value = ""; }} />
          </MediaActions>
        </div>
        <UploadStatus status={status} />
        <input
          type="text"
          className="elea-media-block__caption"
          placeholder={messages.image.captionPlaceholder}
          aria-label={messages.image.captionPlaceholder}
          value={caption}
          onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
        />
        {error && <p className="elea-field-error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="elea-media-block" onClick={onFocus} ref={zone => {
      if (zone && focusAfterRemove.current) {
        focusAfterRemove.current = false;
        zone.querySelector<HTMLElement>('label[tabindex="0"]')?.focus();
      }
    }}>
      <DropZone
        accept="image/*"
        disabled={!uploadImage}
        busy={busy}
        icon={<UploadIcon />}
        label={messages.image.clickToAdd}
        busyLabel={status?.label}
        hint={messages.image.dragAndDrop}
        error={error}
        onFiles={([file]) => pick(file)}
        onRejected={() => setError(messages.image.errorInvalidType)}
      />
      <UploadStatus status={status} quiet />
    </div>
  );
}
