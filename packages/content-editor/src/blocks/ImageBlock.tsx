"use client";

import type { EleaBlock, ImageData } from "@alien6-studio/elea-content";
import { DropZone, ImageCropper, useObjectUrl } from "@alien6-studio/elea-media";
import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "../icons.js";
import { useContentServices, type EditorContextInfo } from "../provider.js";

export interface MediaBlockProps {
  block: EleaBlock;
  onUpdate: (data: EleaBlock["data"]) => void;
  onFocus: () => void;
  context: EditorContextInfo;
}

/**
 * Picks a picture, frames it unless the host turned cropping off, uploads it through the host,
 * then shows it with its caption and the actions to replace or remove it.
 */
export function ImageBlock({ block, onUpdate, onFocus, context }: MediaBlockProps) {
  const { messages, uploadImage, resolveAssetUrl, imageCrop } = useContentServices();
  const data = block.data as ImageData;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const pendingUrl = useObjectUrl(pending);
  const replaceInput = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);
  const latest = useRef({ data, onUpdate });
  useEffect(() => { latest.current = { data, onUpdate }; }, [data, onUpdate]);

  const upload = async (file: File) => {
    if (!uploadImage) {
      setError(messages.image.errorUpload);
      return;
    }
    if (uploading.current) return;
    uploading.current = true;
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadImage(file, context);
      const current = latest.current;
      current.onUpdate({ ...current.data, file: { url: result.url, id: result.id } });
      setPending(null);
    } catch {
      // Back to the drop zone, the error beside it, so the picture can be picked again
      setPending(null);
      setError(messages.image.errorUpload);
    } finally {
      uploading.current = false;
      setIsUploading(false);
    }
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

  const hasImage = Boolean(data.file?.url || data.file?.id);
  const cropOptions = imageCrop === false ? undefined : imageCrop ?? {};

  if (pending && pendingUrl && cropOptions) {
    const exportOptions = { type: cropOptions.type, quality: cropOptions.quality, maxWidth: cropOptions.maxWidth };
    return (
      <div className="elea-media-block" onClick={onFocus}>
        <ImageCropper
          src={pendingUrl}
          aspect={cropOptions.aspect}
          shape={cropOptions.shape}
          export={exportOptions}
          busy={isUploading}
          labels={{ zoom: messages.image.cropZoom, rotation: messages.image.cropRotation, confirm: isUploading ? messages.image.uploading : messages.image.cropConfirm, cancel: messages.image.cropCancel, image: messages.image.cropImage }}
          onConfirm={confirmCrop}
          onCancel={() => setPending(null)}
        />
        {error && <p className="elea-field-error" role="alert">{error}</p>}
      </div>
    );
  }

  if (hasImage) {
    return (
      <div className="elea-media-block" onClick={onFocus}>
        <img src={resolveAssetUrl(data.file)} alt={data.alt ?? (data.caption || messages.viewer.imageAlt)} className="elea-media-block__image" />
        <input
          type="text"
          className="elea-media-block__caption"
          placeholder={messages.image.captionPlaceholder}
          aria-label={messages.image.captionPlaceholder}
          value={data.caption ?? ""}
          onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
        />
        <div className="elea-media-block__actions">
          <input ref={replaceInput} type="file" accept="image/*" className="elea-visually-hidden" tabIndex={-1} aria-hidden="true" onChange={(event) => { pick(event.target.files?.[0]); event.target.value = ""; }} />
          <button type="button" className="elea-button elea-button--outline" onClick={() => replaceInput.current?.click()} disabled={isUploading}>{isUploading ? messages.image.uploading : messages.image.replace}</button>
          <button type="button" className="elea-button elea-button--outline" onClick={() => onUpdate({ ...data, file: { url: "", id: "" } })} disabled={isUploading}>{messages.image.remove}</button>
        </div>
        {error && <p className="elea-field-error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="elea-media-block" onClick={onFocus}>
      <DropZone
        accept="image/*"
        disabled={!uploadImage}
        busy={isUploading}
        icon={<UploadIcon />}
        label={messages.image.clickToAdd}
        busyLabel={messages.image.uploading}
        hint={messages.image.dragAndDrop}
        error={error}
        onFiles={([file]) => pick(file)}
        onRejected={() => setError(messages.image.errorInvalidType)}
      />
    </div>
  );
}
