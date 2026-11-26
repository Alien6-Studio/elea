"use client";

import { en, imageBlock, type EleaBlock, type FileRef } from "@alien6-studio/elea-content";
import { safeImageSource } from "@alien6-studio/elea-content-viewer";
import { DropZone } from "@alien6-studio/elea-media";
import { IconButton } from "@alien6-studio/elea-ui";
import { useEffect, useRef, useState } from "react";
import { CropIcon, UploadIcon } from "../icons.js";
import { cropperPart, usePart } from "../parts.js";
import { useContentServices, type EditorContextInfo, type ImageCropSource, type ImageUploadOptions, type ImageUploadStatus } from "../provider.js";
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
  const [activity, setActivity] = useState<ImageUploadStatus | "uploading" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ input: ImageCropSource; fallback?: File } | null>(null);
  const nextFocus = useRef<"adjust" | "picker" | null>(null);
  function closeCrop() {
    if (pending && !pending.fallback) nextFocus.current = "adjust";
    setPending(null);
  }
  const replaceInput = useRef<HTMLInputElement>(null);
  const active = useRef<AbortController | null>(null);
  const latest = useRef({ data, onUpdate });
  useEffect(() => { latest.current = { data, onUpdate }; }, [data, onUpdate]);

  // A picture that changes under a running upload, or a block that goes away, cancels it
  useEffect(() => () => {
    active.current?.abort();
    active.current = null;
    setPending(null);
    setActivity(null);
  }, [file.id, file.url]);

  const upload = async (file: File, crop?: ImageUploadOptions["crop"]) => {
    if (!uploadImage) {
      setError(messages.image.errorUpload);
      return;
    }
    // An SVG can carry scripts: it goes up as the raster picture the cropper exports, or not at all
    if (file.type === "image/svg+xml" && !allowSvgUpload) {
      setError(messages.image.errorSvg ?? messages.image.errorInvalidType);
      closeCrop();
      return;
    }
    if (active.current) return;
    const controller = new AbortController();
    const live = () => active.current === controller;
    active.current = controller;
    setError(null);
    setActivity("uploading");
    try {
      const result = await uploadImage(file, context, { ...(crop && { crop }), signal: controller.signal, report: (status) => { if (live()) setActivity(status); } });
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
    closeCrop();
    setActivity(null);
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
    else setPending({ input: { source: file, name: file.name }, fallback: file });
  };

  const source = file.url || file.id ? safeImageSource(resolveAssetUrl(file)) : null;
  const cropOptions = imageCrop === false ? undefined : imageCrop ?? {};
  const original = source ? cropOptions?.resolveOriginal?.(file) : undefined;
  const status = activity === "uploading" ? { label: messages.image.uploading } : activity;
  // The cropper loads with the first picture to frame; one it cannot reach goes up as picked
  const cropFailed = () => {
    if (pending?.fallback) void upload(pending.fallback);
    else {
      setError(messages.image.errorUpload);
      closeCrop();
    }
  };
  const [cropper, cropperWaiting] = usePart(cropperPart, Boolean(pending && cropOptions), cropFailed);
  const busy = Boolean(status) || cropperWaiting;

  const framing = cropper && pending && cropOptions;
  const showPicture = source && !framing;
  let control;
  if (framing) {
    control = <cropper.ImageFrame input={pending.input} options={cropOptions} messages={messages} defaults={en}
      status={status} allowSvg={allowSvgUpload} onConfirm={upload} onCancel={closeCrop} onFailure={cropFailed} />;
  } else if (source) {
    control = (
      <div className="elea-media-block__frame">
        <img src={source} alt={alt ?? (caption || messages.viewer.imageAlt)} className="elea-media-block__image" />
        <MediaActions
          icon={<UploadIcon />} replace={status?.label ?? messages.image.replace} remove={messages.image.remove}
          busy={busy} canReplace={Boolean(uploadImage)} onReplace={() => replaceInput.current?.click()}
          onRemove={() => {
            nextFocus.current = "picker";
            onUpdate(withImageFile(data, { url: "", id: "" }));
          }}
        >
          {original && uploadImage && <IconButton ref={button => {
            if (button && nextFocus.current === "adjust") {
              nextFocus.current = null;
              button.focus();
            }
          }} variant="disc" label={messages.image.adjustCrop ?? en.image.adjustCrop}
            disabled={busy} onClick={() => {
              setError(null);
              setPending({ input: original });
            }}><CropIcon /></IconButton>}
          <input ref={replaceInput} type="file" accept="image/*" hidden onChange={(event) => { pick(event.target.files?.[0]); event.target.value = ""; }} />
        </MediaActions>
      </div>
    );
  } else {
    control = (
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
    );
  }

  return (
    <div className="elea-media-block" onClick={source || framing ? onFocus : undefined} ref={zone => {
      if (zone && nextFocus.current === "picker") {
        nextFocus.current = null;
        zone.querySelector<HTMLElement>('label[tabindex="0"]')?.focus();
      }
    }}>
      {control}
      <UploadStatus status={status} quiet={!showPicture} />
      {showPicture && <input
        type="text"
        className="elea-media-block__caption"
        placeholder={messages.image.captionPlaceholder}
        aria-label={messages.image.captionPlaceholder}
        value={caption}
        onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
      />}
      {error && (framing || source) && <p className="elea-field-error" role="alert">{error}</p>}
    </div>
  );
}
