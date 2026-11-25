"use client";

import { en, type BlockData, type EleaBlock } from "@alien6-studio/elea-content";
import { useMemo, useRef } from "react";
import { ImageBlock } from "./blocks/ImageBlock.js";
import { createMarkdownSource, readMarkdownSource, type MarkdownDraft } from "./markdownSource.js";
import { useContentServices, type EditorContextInfo } from "./provider.js";

interface MarkdownEditorProps {
  blocks: EleaBlock[];
  draft: MarkdownDraft | undefined;
  onDraftChange: (draft: MarkdownDraft) => void;
  onBlocksChange: (blocks: EleaBlock[]) => void;
  onAddImage: (data: BlockData) => void;
  context: EditorContextInfo;
}

export type { MarkdownDraft } from "./markdownSource.js";

const emptyImage: EleaBlock = { id: "", type: "image", data: { file: { url: "", id: "" }, caption: "" } };

export function MarkdownEditor({ blocks, draft, onDraftChange, onBlocksChange, onAddImage, context }: Readonly<MarkdownEditorProps>) {
  const { messages, registry, resolveAssetUrl, uploadImage } = useContentServices();
  const labels = messages.source ?? en.source;
  const gutter = useRef<HTMLPreElement>(null);
  const projection = useMemo(() => createMarkdownSource(blocks, { resolveAssetUrl, labels: messages.blockTypes }), [blocks, resolveAssetUrl, messages.blockTypes]);
  const currentDraft = draft && (draft.blocks.length > 0 || blocks.length === 0)
    && draft.blocks.every((block, index) => block === blocks[index]) ? draft : undefined;
  const text = currentDraft
    ? [currentDraft.text, ...projection.blocks.slice(currentDraft.blocks.length).map(({ text }) => text)].join("\n\n")
    : projection.text;

  const change = (value: string) => {
    const next = readMarkdownSource(value, projection, registry, currentDraft?.references);
    onDraftChange(next);
    if (next.blocks.length !== blocks.length || next.blocks.some((block, index) => block !== blocks[index])) onBlocksChange(next.blocks);
  };

  return (
    <div className="elea-markdown-editor">
      <div className="elea-markdown-editor__source">
        <pre ref={gutter} className="elea-markdown-editor__lines" aria-hidden="true">{text.split("\n").map((_, index) => index + 1).join("\n")}</pre>
        <textarea
          aria-label={labels.label}
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
      {uploadImage && (
        <details className="elea-markdown-editor__media">
          <summary>{labels.addImage}</summary>
          <ImageBlock block={emptyImage} onUpdate={onAddImage} onFocus={() => {}} context={context} />
        </details>
      )}
    </div>
  );
}
