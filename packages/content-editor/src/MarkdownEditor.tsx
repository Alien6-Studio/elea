"use client";

import { en, type BlockData, type EleaBlock } from "@alien6-studio/elea-content";
import { TextLimitContext, textPrefix } from "./editorTextLimit.js";
import { useContext, useMemo, useRef, type ClipboardEvent } from "react";
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
  const limit = useContext(TextLimitContext);
  const labels = messages.source ?? en.source;
  const gutter = useRef<HTMLPreElement>(null);
  const projection = useMemo(() => createMarkdownSource(blocks, { resolveAssetUrl, labels: messages.blockTypes }), [blocks, resolveAssetUrl, messages.blockTypes]);
  const currentDraft = draft && (draft.blocks.length > 0 || blocks.length === 0)
    && draft.blocks.every((block, index) => block === blocks[index]) ? draft : undefined;
  const text = currentDraft
    ? [currentDraft.text, ...projection.blocks.slice(currentDraft.blocks.length).map(({ text }) => text)].join("\n\n")
    : projection.text;

  const parse = (value: string) => readMarkdownSource(value, projection, registry, currentDraft?.references);
  const change = (value: string) => {
    const next = parse(value);
    if (limit && !limit.accepts(next.blocks)) return;
    onDraftChange(next);
    if (next.blocks.length !== blocks.length || next.blocks.some((block, index) => block !== blocks[index])) onBlocksChange(next.blocks);
  };

  const paste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!limit) return;
    const field = event.currentTarget;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const incoming = event.clipboardData.getData("text/plain").replaceAll(/\r\n?/g, "\n");
    const withInsert = (insert: string) => text.slice(0, start) + insert + text.slice(end);
    if (limit.accepts(parse(withInsert(incoming)).blocks)) return;
    event.preventDefault();
    // Markdown syntax can consume several source characters for one visible character.
    let low = 0;
    let high = incoming.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (limit.accepts(parse(withInsert(textPrefix(incoming, middle))).blocks)) low = middle;
      else high = middle - 1;
    }
    const clipped = textPrefix(incoming, low);
    if (!clipped) return;
    field.setRangeText(clipped, start, end, "end");
    change(field.value);
  };

  return (
    <div className="elea-markdown-editor">
      <div className="elea-markdown-editor__source">
        <pre ref={gutter} className="elea-markdown-editor__lines" aria-hidden="true">{text.split("\n").map((_, index) => index + 1).join("\n")}</pre>
        <textarea
          aria-label={labels.label}
          aria-describedby={limit?.counterId}
          className="elea-markdown-editor__input"
          rows={16}
          spellCheck={false}
          wrap="off"
          value={text}
          onChange={(event) => change(event.currentTarget.value)}
          onPaste={limit ? paste : undefined}
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
