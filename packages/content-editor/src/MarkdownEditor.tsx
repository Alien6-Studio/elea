"use client";

import { en, type BlockData, type EleaBlock } from "@alien6-studio/elea-content";
import { useId, useMemo, useRef } from "react";
import { ImageBlock } from "./blocks/ImageBlock.js";
import { createMarkdownSource, readMarkdownSource } from "./markdownSource.js";
import { useContentServices, type EditorContextInfo } from "./provider.js";

interface MarkdownEditorProps {
  blocks: EleaBlock[];
  draft: MarkdownDraft | undefined;
  onDraftChange: (draft: MarkdownDraft) => void;
  onBlocksChange: (blocks: EleaBlock[]) => void;
  onAddImage: (data: BlockData) => void;
  context: EditorContextInfo;
}

export interface MarkdownDraft {
  text: string;
  blocks: EleaBlock[];
}

const emptyImage: EleaBlock = { id: "", type: "image", data: { file: { url: "", id: "" }, caption: "" } };

export function MarkdownEditor({ blocks, draft, onDraftChange, onBlocksChange, onAddImage, context }: MarkdownEditorProps) {
  const { messages, registry, uploadImage } = useContentServices();
  const labels = messages.source ?? en.source;
  const id = useId();
  const gutter = useRef<HTMLPreElement>(null);
  const projection = useMemo(() => createMarkdownSource(blocks), [blocks]);
  const text = draft && draft.blocks.every((block, index) => block === blocks[index])
    ? [draft.text, ...projection.blocks.slice(draft.blocks.length).map(({ text }) => text)].filter(Boolean).join("\n\n")
    : projection.text;

  const change = (value: string) => {
    const next = readMarkdownSource(value, projection, registry);
    onDraftChange({ text: value, blocks: next });
    if (next.length !== blocks.length || next.some((block, index) => block !== blocks[index])) onBlocksChange(next);
  };

  return (
    <div className="elea-markdown-editor">
      <div className="elea-markdown-editor__source">
        <pre ref={gutter} className="elea-markdown-editor__lines" aria-hidden="true">{text.split("\n").map((_, index) => index + 1).join("\n")}</pre>
        <textarea
          aria-label={labels.label}
          aria-describedby={projection.hasReferences ? id : undefined}
          className="elea-markdown-editor__input"
          rows={16}
          spellCheck={false}
          wrap="off"
          value={text}
          onChange={(event) => change(event.currentTarget.value)}
          onScroll={(event) => {
            if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop;
          }}
        />
      </div>
      {projection.hasReferences && <p className="elea-markdown-editor__hint" id={id}>{labels.blockComments}</p>}
      {uploadImage && (
        <details className="elea-markdown-editor__media">
          <summary>{labels.addImage}</summary>
          <ImageBlock block={emptyImage} onUpdate={onAddImage} onFocus={() => {}} context={context} />
        </details>
      )}
    </div>
  );
}
