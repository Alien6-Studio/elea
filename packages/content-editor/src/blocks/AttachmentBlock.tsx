"use client";

import { fileKind, type AttachmentData } from "@alien6-studio/elea-content";
import { CloseIcon, PaperclipIcon } from "../icons.js";
import { useContentServices, type PickedAttachment } from "../provider.js";
import type { MediaBlockProps } from "./ImageBlock.js";

export function AttachmentBlock({ block, onUpdate, onFocus, context }: MediaBlockProps) {
  const { messages, renderAttachmentPicker } = useContentServices();
  const data = block.data as AttachmentData;

  const select = (attachment: PickedAttachment) => {
    const next: AttachmentData = {
      resourceId: attachment.id,
      title: attachment.title,
      type: attachment.type ?? "",
      description: attachment.description ?? "",
      url: attachment.url ?? "",
    };
    if (attachment.file) next.file = attachment.file;
    onUpdate(next);
  };

  const remove = () => onUpdate({ resourceId: "", title: "", type: "", description: "", url: "" });

  if (!data.resourceId) {
    return (
      <div className="elea-media-block" onClick={onFocus}>
        <div className="elea-picker">
          <div className="elea-picker__header">
            <PaperclipIcon />
            <span className="elea-picker__title">{messages.attachment.selectTitle}</span>
          </div>
          <div className="elea-picker__body">
            {renderAttachmentPicker ? renderAttachmentPicker({ onSelect: select, context }) : <p className="elea-picker__empty">{messages.attachment.noPicker}</p>}
          </div>
        </div>
      </div>
    );
  }
  const kind = fileKind(data.type);
  return (
    <div className="elea-media-block" onClick={onFocus}>
      <div className="elea-attachment-card">
        <span className={`elea-attachment__icon elea-attachment__icon--${kind}`} aria-hidden="true" data-kind={kind} />
        <span className="elea-attachment__body">
          <span className="elea-attachment__title">{data.title}</span>
          {data.description && <span className="elea-attachment__description">{data.description}</span>}
          {data.type && <span className="elea-attachment__type">{data.type}</span>}
        </span>
        <button type="button" className="elea-icon-button" onClick={remove} aria-label={messages.attachment.remove} title={messages.attachment.remove}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
