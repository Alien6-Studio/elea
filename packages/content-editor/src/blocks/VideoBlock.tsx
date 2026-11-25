"use client";

import { en, isVideoUrl, type VideoData } from "@alien6-studio/elea-content";
import { VideoEmbed } from "@alien6-studio/elea-content-viewer";
import { useRef, useState } from "react";
import { LinkIcon, VideoIcon } from "../icons.js";
import { useContentServices } from "../provider.js";
import type { MediaBlockProps } from "./ImageBlock.js";
import { MediaActions } from "./MediaActions.js";

export function VideoBlock({ block, onUpdate, onFocus }: Readonly<Omit<MediaBlockProps, "context">>) {
  const { messages } = useContentServices();
  const data = block.data as VideoData;
  const [urlInput, setUrlInput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const changeButton = useRef<HTMLButtonElement>(null);

  const closeForm = () => {
    setUrlInput(null);
    setError("");
    requestAnimationFrame(() => changeButton.current?.focus());
  };

  const submit = () => {
    const trimmed = urlInput?.trim();
    if (!trimmed) { setError(messages.video.errorEmpty); return; }
    if (!isVideoUrl(trimmed)) { setError(messages.video.errorInvalid); return; }
    onUpdate({ ...data, url: trimmed });
    closeForm();
  };

  if (!data.url || urlInput !== null) {
    return (
      <div className="elea-media-block">
        <div className="elea-dropzone elea-video-form">
          <VideoIcon className="elea-dropzone__icon" />
          <div className="elea-dropzone__form">
            <input
              type="url"
              className="elea-input"
              placeholder={messages.video.urlPlaceholder}
              aria-label={messages.video.urlPlaceholder}
              value={urlInput ?? ""}
              autoFocus={urlInput !== null}
              onChange={(event) => { setUrlInput(event.target.value); setError(""); }}
              onFocus={onFocus}
              onKeyDown={(event) => {
                if (event.key === "Enter") { event.preventDefault(); submit(); }
                if (event.key === "Escape" && data.url) { event.stopPropagation(); closeForm(); }
              }}
            />
            {error && <p className="elea-field-error" role="alert">{error}</p>}
            <button type="button" className="elea-editor-button elea-editor-button--primary" onClick={submit}>{data.url ? messages.video.changeUrl : messages.video.addButton}</button>
            {data.url && <button type="button" className="elea-editor-button" onClick={closeForm}>{messages.editor.linkCancel}</button>}
          </div>
          <p className="elea-dropzone__hint">{messages.video.supportedFormats}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="elea-media-block">
      <div className="elea-media-block__frame">
        <VideoEmbed url={data.url} title={data.caption || undefined} messages={messages} />
        <MediaActions
          icon={<LinkIcon />} replace={messages.video.changeUrl} remove={messages.video.remove ?? en.video.remove}
          replaceRef={changeButton} onReplace={() => setUrlInput(data.url)}
          onRemove={() => { onUpdate({ ...data, url: "" }); setUrlInput(""); }}
        />
      </div>
      <input
        type="text"
        className="elea-media-block__caption"
        placeholder={messages.video.captionPlaceholder}
        aria-label={messages.video.captionPlaceholder}
        value={data.caption ?? ""}
        onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
      />
    </div>
  );
}
