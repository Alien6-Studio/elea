"use client";

import { attachmentBlock, en, fileKind, type AttachmentData } from "@alien6-studio/elea-content";
import { AttachmentIcon } from "@alien6-studio/elea-content-viewer";
import { useLayoutEffect, useRef, useState } from "react";
import { PaperclipIcon } from "../icons.js";
import { useContentServices, type PickedAttachment } from "../provider.js";
import type { MediaBlockProps } from "./ImageBlock.js";
import { MediaActions } from "./MediaActions.js";

export function AttachmentBlock({ block, onUpdate, onFocus, context }: Readonly<MediaBlockProps>) {
  const { messages, renderAttachmentIcon, renderAttachmentPicker } = useContentServices();
  const data = attachmentBlock.normalize(block.data);
  const [replacing, setReplacing] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const changeButton = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const showPicker = replacing || !(block.data.resourceId || data.file?.id || data.file?.url || data.url || data.title);

  useLayoutEffect(() => {
    if (moveFocus.current) {
      (showPicker ? picker.current : changeButton.current)?.focus();
      moveFocus.current = false;
    }
  }, [showPicker]);

  function updateAttachment(attachment?: PickedAttachment) {
    moveFocus.current = true;
    const next: AttachmentData = {
      ...block.data,
      resourceId: attachment?.id ?? "",
      title: attachment?.title ?? "",
      type: attachment?.type ?? "",
      description: attachment?.description ?? "",
      url: attachment?.url ?? "",
    };
    if (attachment?.file) next.file = attachment.file;
    else delete next.file;
    setReplacing(false);
    onUpdate(next);
  }

  function setPickerOpen(open: boolean) {
    moveFocus.current = true;
    setReplacing(open);
  }
  if (showPicker) {
    return (
      <div className="elea-media-block" onClick={onFocus}>
        <div ref={picker} className="elea-picker" role="group" aria-label={messages.attachment.selectTitle} tabIndex={-1}
          onKeyDown={(event) => {
            if (replacing && event.key === "Escape" && !event.defaultPrevented) {
              event.stopPropagation();
              setPickerOpen(false);
            }
          }}>
          <div className="elea-picker__header">
            <PaperclipIcon />
            <span className="elea-picker__title">{messages.attachment.selectTitle}</span>
            {replacing && <button type="button" className="elea-editor-button elea-editor-button--link" onClick={() => setPickerOpen(false)}>{messages.editor.linkCancel}</button>}
          </div>
          <div className="elea-picker__body">
            {renderAttachmentPicker ? renderAttachmentPicker({ onSelect: updateAttachment, context }) : <p className="elea-picker__empty">{messages.attachment.noPicker}</p>}
          </div>
        </div>
      </div>
    );
  }
  const kind = fileKind(data.type, data.title, data.file?.url, data.url);
  return (
    <div className="elea-media-block" onClick={onFocus}>
      <div className="elea-attachment-card elea-media-block__frame">
        <AttachmentIcon type={data.type} kind={kind} blockType="attachment" render={renderAttachmentIcon} />
        <span className="elea-attachment__body">
          <span className="elea-attachment__title">{data.title || data.file?.url || data.url || messages.blockTypes.attachment}</span>
          {data.description && <span className="elea-attachment__description">{data.description}</span>}
          {data.type && <span className="elea-attachment__type">{data.type}</span>}
        </span>
        <MediaActions icon={<PaperclipIcon />} replace={messages.attachment.replace ?? en.attachment.replace} remove={messages.attachment.remove}
          replaceRef={changeButton} canReplace={Boolean(renderAttachmentPicker)} onReplace={() => setPickerOpen(true)} onRemove={() => updateAttachment()} />
      </div>
    </div>
  );
}
