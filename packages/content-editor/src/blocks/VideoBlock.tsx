"use client";

import { isVideoUrl, type VideoData } from "@alien6-studio/elea-content";
import { VideoEmbed } from "@alien6-studio/elea-content-viewer";
import { useState } from "react";
import { VideoIcon } from "../icons.js";
import { useContentServices } from "../provider.js";
import type { MediaBlockProps } from "./ImageBlock.js";

export function VideoBlock({ block, onUpdate, onFocus }: Omit<MediaBlockProps, "context">) {
  const { messages } = useContentServices();
  const data = block.data as VideoData;
  const [urlInput, setUrlInput] = useState(data.url ?? "");
  const [error, setError] = useState("");

  const submit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { setError(messages.video.errorEmpty); return; }
    if (!isVideoUrl(trimmed)) { setError(messages.video.errorInvalid); return; }
    setError("");
    onUpdate({ ...data, url: trimmed });
  };

  const change = () => {
    onUpdate({ ...data, url: "" });
    setUrlInput("");
    setError("");
  };

  if (!data.url) {
    return (
      <div className="elea-media-block">
        <div className="elea-dropzone">
          <VideoIcon className="elea-dropzone__icon" />
          <div className="elea-dropzone__form">
            <input
              type="url"
              className="elea-input"
              placeholder={messages.video.urlPlaceholder}
              aria-label={messages.video.urlPlaceholder}
              value={urlInput}
              onChange={(event) => { setUrlInput(event.target.value); setError(""); }}
              onFocus={onFocus}
              onKeyDown={(event) => {
                if (event.key === "Enter") { event.preventDefault(); submit(); }
              }}
            />
            {error && <p className="elea-field-error" role="alert">{error}</p>}
            <button type="button" className="elea-button elea-button--primary" onClick={submit}>{messages.video.addButton}</button>
          </div>
          <p className="elea-dropzone__hint">{messages.video.supportedFormats}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="elea-media-block">
      <VideoEmbed url={data.url} title={data.caption || undefined} messages={messages} />
      <input
        type="text"
        className="elea-media-block__caption"
        placeholder={messages.video.captionPlaceholder}
        aria-label={messages.video.captionPlaceholder}
        value={data.caption ?? ""}
        onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
      />
      <div className="elea-media-block__actions">
        <button type="button" className="elea-button elea-button--link" onClick={change}>{messages.video.changeUrl}</button>
      </div>
    </div>
  );
}
