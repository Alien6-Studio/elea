"use client";

import type { BlockData, BlockLike, EleaBlock, HeaderData, ListData, ListItem, QuoteData } from "@alien6-studio/elea-content";
import { memo, useCallback, useEffect, useRef, useState, type ComponentType, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";
import { AttachmentBlock } from "./blocks/AttachmentBlock.js";
import { ImageBlock, type MediaBlockProps } from "./blocks/ImageBlock.js";
import { VideoBlock } from "./blocks/VideoBlock.js";
import { blockTypeIcons, TrashIcon } from "./icons.js";
import { useContentServices, type EditorContextInfo } from "./provider.js";
import { EMPTY_FORMATS, RichTextField, type ActiveFormats, type RichTextFieldHandle } from "./RichTextField.js";
import { Toolbar } from "./Toolbar.js";

export type BlockEditorComponent = ComponentType<MediaBlockProps>;
export type BlockEditorMap = Readonly<Record<string, BlockEditorComponent>>;

export interface BlockEditorProps {
  block: EleaBlock;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: (event?: FocusEvent) => void;
  onUpdate: (data: BlockData) => void;
  onRemove: () => void;
  /** A new block of a type goes right after this one, with text carried over from a split. */
  onAddBlockAfter?: ((type: string, initialText?: string) => void) | undefined;
  /** Pasted blocks go right after this one, then a paragraph with the text that followed the caret. */
  onInsertBlocksAfter?: ((blocks: BlockLike[], after: string) => void) | undefined;
  context?: EditorContextInfo | undefined;
  /** Editing components by block type, for custom blocks; built-in types have their own. */
  editors?: BlockEditorMap | undefined;
}

const NO_CONTEXT: EditorContextInfo = {};

const resize = (event: FormEvent<HTMLTextAreaElement>) => {
  const target = event.currentTarget;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
};

function HeaderEditor({ block, onUpdate, onFocus, onBlur, onAddBlockAfter }: Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onAddBlockAfter">) {
  const { messages } = useContentServices();
  const data = block.data as HeaderData;
  return (
    <div className="elea-header-editor">
      <select
        className="elea-select"
        aria-label={messages.blockTypes.header}
        value={data.level ?? 2}
        onChange={(event) => onUpdate({ ...data, level: Number.parseInt(event.target.value, 10) })}
      >
        {[1, 2, 3, 4].map((level) => <option key={level} value={level}>H{level}</option>)}
      </select>
      <textarea
        className={`elea-textarea elea-header-editor__text elea-header-editor__text--${data.level ?? 2}`}
        placeholder={messages.editor.headerPlaceholder}
        aria-label={messages.editor.headerPlaceholder}
        value={data.text ?? ""}
        rows={1}
        onChange={(event) => onUpdate({ ...data, text: event.target.value.replaceAll("\n", "") })}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={resize}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!event.shiftKey) onAddBlockAfter?.("paragraph");
          }
        }}
      />
    </div>
  );
}

/** The text of a list item, whatever its shape. */
function itemContent(item: ListItem): string {
  return typeof item === "string" ? item : item.content;
}

/** The same item with another text; nested items and other fields are kept. */
function withContent(item: ListItem, content: string): ListItem {
  return typeof item === "string" ? content : { ...item, content };
}

function ListEditor({ block, onUpdate, onFocus, onBlur }: Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur">) {
  const { messages } = useContentServices();
  const data = block.data as ListData;
  const items: ListItem[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [""];
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocusRef.current === null) return;
    const index = pendingFocusRef.current;
    pendingFocusRef.current = null;
    containerRef.current?.querySelectorAll("textarea")[index]?.focus();
  });

  // Every operation copies the array and touches only the item concerned, so nested
  // items of the neighbours survive edits, insertions and removals
  const change = (index: number, value: string) => {
    const next = items.map((item, position) => (position === index ? withContent(item, value) : item));
    onUpdate({ ...data, items: next });
  };

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const next = [...items];
      next.splice(index + 1, 0, "");
      pendingFocusRef.current = index + 1;
      onUpdate({ ...data, items: next });
      return;
    }
    if (event.key === "Backspace" && event.currentTarget.value === "" && items.length > 1) {
      event.preventDefault();
      const next = [...items];
      next.splice(index, 1);
      pendingFocusRef.current = Math.max(0, index - 1);
      onUpdate({ ...data, items: next });
    }
  };

  return (
    <div className="elea-list-editor" ref={containerRef}>
      {items.map((item, index) => (
        <div key={index} className="elea-list-editor__item">
          <span className="elea-list-editor__marker" aria-hidden="true">{data.style === "ordered" ? `${index + 1}.` : "•"}</span>
          <textarea
            className="elea-textarea"
            placeholder={messages.editor.listItemPlaceholder}
            aria-label={messages.editor.listItemPlaceholder}
            value={itemContent(item)}
            rows={1}
            onChange={(event) => change(index, event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={resize}
            onKeyDown={(event) => keyDown(event, index)}
          />
          {typeof item !== "string" && item.items && item.items.length > 0 && (
            <span className="elea-list-editor__nested" title={item.items.map(itemContent).join(", ")}>
              +{item.items.length}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function QuoteEditor({ block, onUpdate, onFocus, onBlur }: Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur">) {
  const { messages } = useContentServices();
  const data = block.data as QuoteData;
  return (
    <div className="elea-quote-editor">
      <textarea
        className="elea-textarea elea-quote-editor__text"
        placeholder={messages.editor.quotePlaceholder}
        aria-label={messages.editor.quotePlaceholder}
        value={data.text ?? ""}
        rows={2}
        onChange={(event) => onUpdate({ ...data, text: event.target.value })}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={resize}
      />
      <input
        type="text"
        className="elea-input elea-quote-editor__caption"
        placeholder={messages.editor.quoteAuthorPlaceholder}
        aria-label={messages.editor.quoteAuthorPlaceholder}
        value={data.caption ?? ""}
        onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
      />
    </div>
  );
}

/** One block with its delete button, type indicator, toolbar when it is a focused paragraph, and editing field. */
export const BlockEditor = memo(function BlockEditor({ block, isFocused, onFocus, onBlur, onUpdate, onRemove, onAddBlockAfter, onInsertBlocksAfter, context = NO_CONTEXT, editors }: BlockEditorProps) {
  const { messages } = useContentServices();
  const richTextRef = useRef<RichTextFieldHandle>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS);
  const labels = messages.blockTypes as Record<string, string | undefined>;

  const remove = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove();
  }, [onRemove]);

  const renderEditor = () => {
    const Custom = editors?.[block.type];
    if (Custom) return <Custom block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
    switch (block.type) {
      case "header":
        return <HeaderEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onAddBlockAfter={onAddBlockAfter} />;
      case "list":
        return <ListEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} />;
      case "quote":
        return <QuoteEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} />;
      case "image":
        return <ImageBlock block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
      case "video":
        return <VideoBlock block={block} onUpdate={onUpdate} onFocus={onFocus} />;
      case "attachment":
        return <AttachmentBlock block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
      default:
        return (
          <RichTextField
            ref={richTextRef}
            value={typeof block.data.text === "string" ? block.data.text : ""}
            onChange={(text) => onUpdate({ ...block.data, text })}
            onFocus={onFocus}
            onBlur={onBlur}
            onEnter={(_before, after) => onAddBlockAfter?.("paragraph", after)}
            onInsertBlocks={onInsertBlocksAfter}
            onSelectionChange={setActiveFormats}
            placeholder={messages.editor.startWriting}
          />
        );
    }
  };

  const TypeIcon = block.type === "paragraph" ? null : blockTypeIcons[block.type];
  const typeLabel = labels[block.type] ?? block.type;

  return (
    <div className={`elea-block-editor elea-block-editor--${block.type}${isFocused ? " elea-block-editor--focused" : ""}`} data-elea-block-id={block.id} data-elea-block-type={block.type}>
      <button type="button" className="elea-icon-button elea-block-editor__remove" onClick={remove} aria-label={messages.actions.deleteBlock} title={messages.actions.deleteBlock}>
        <TrashIcon />
      </button>
      <div className="elea-block-editor__card">
        {block.type === "paragraph" && isFocused && <Toolbar editorRef={richTextRef} activeFormats={activeFormats} />}
        <div className="elea-block-editor__content">
          {block.type !== "paragraph" && (
            <div className="elea-block-editor__type">
              {TypeIcon ? <TypeIcon /> : null}
              <span>{typeLabel}</span>
            </div>
          )}
          {renderEditor()}
        </div>
      </div>
    </div>
  );
});
