"use client";

import type { EleaBlock, ImageData } from "@alien6-studio/elea-content";
import { useState, type DragEvent } from "react";
import { UploadIcon } from "../icons.js";
import { useContentServices, type EditorContextInfo } from "../provider.js";

export interface MediaBlockProps {
  block: EleaBlock;
  onUpdate: (data: EleaBlock["data"]) => void;
  onFocus: () => void;
  context: EditorContextInfo;
}

export function ImageBlock({ block, onUpdate, onFocus, context }: MediaBlockProps) {
  const { messages, uploadImage, resolveAssetUrl } = useContentServices();
  const data = block.data as ImageData;
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(messages.image.errorInvalidType);
      return;
    }
    if (!uploadImage) {
      setError(messages.image.errorUpload);
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadImage(file, context);
      onUpdate({ ...data, file: { url: result.url, id: result.id } });
    } catch {
      setError(messages.image.errorUpload);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (event: DragEvent) => { event.preventDefault(); event.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (event: DragEvent) => { event.preventDefault(); event.stopPropagation(); setIsDragging(false); };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  const hasImage = Boolean(data.file?.url || data.file?.id);
  const inputId = `elea-image-${block.id}`;

  return (
    <div className="elea-media-block" onClick={onFocus}>
      {hasImage ? (
        <div className="elea-media-block__preview">
          <img src={resolveAssetUrl(data.file)} alt={data.caption || messages.viewer.imageAlt} className="elea-media-block__image" />
          <input
            type="text"
            className="elea-media-block__caption"
            placeholder={messages.image.captionPlaceholder}
            aria-label={messages.image.captionPlaceholder}
            value={data.caption ?? ""}
            onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
          />
        </div>
      ) : (
        <div className={`elea-dropzone${isDragging ? " elea-dropzone--active" : ""}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <input
            type="file"
            accept="image/*"
            id={inputId}
            className="elea-visually-hidden"
            disabled={!uploadImage}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <label htmlFor={inputId} className="elea-dropzone__label">
            <UploadIcon className="elea-dropzone__icon" />
            <span className="elea-dropzone__title">{isUploading ? messages.image.uploading : messages.image.clickToAdd}</span>
            <span className="elea-dropzone__hint">{messages.image.dragAndDrop}</span>
          </label>
          {error && <p className="elea-field-error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
