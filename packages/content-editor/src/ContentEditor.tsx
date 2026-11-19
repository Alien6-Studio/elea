"use client";

import { createDocument, type BlockData, type BlockLike, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { useCallback, useEffect, useMemo, type FocusEvent } from "react";
import { AddBlockButton } from "./AddBlockButton.js";
import { BlockEditor, type BlockEditorMap } from "./BlockEditor.js";
import { useBlockFocus } from "./hooks/useBlockFocus.js";
import { useBlockManagement } from "./hooks/useBlockManagement.js";
import { resizeTextarea, useTextareaResize } from "./hooks/useTextareaResize.js";
import { useContentServices, type EditorContextInfo } from "./provider.js";
import { VirtualizedBlockList } from "./VirtualizedBlockList.js";

export interface ContentEditorProps {
  blocks: EleaBlock[];
  onBlocksChange: (blocks: EleaBlock[]) => void;
  title?: string | undefined;
  onTitleChange?: ((title: string) => void) | undefined;
  summary?: string | undefined;
  onSummaryChange?: ((summary: string) => void) | undefined;
  /** Hides the summary field; the title field hides when `onTitleChange` is absent. */
  summaryDisabled?: boolean | undefined;
  /** Read-only rendering of the current content, through the viewer. */
  showPreview?: boolean | undefined;
  /** Passed to the host's upload and attachment services. */
  context?: EditorContextInfo | undefined;
  /** Editing components for custom block types. */
  editors?: BlockEditorMap | undefined;
  /** Block types offered by the add menus; defaults to the seven built-in blocks. */
  blockTypes?: readonly string[] | undefined;
  enableVirtualization?: boolean | undefined;
  virtualizationThreshold?: number | undefined;
  className?: string | undefined;
}

/**
 * The block editor: optional title and summary fields, the blocks, and an add button.
 * Content is controlled: every change goes through `onBlocksChange`.
 */
export function ContentEditor({
  blocks,
  onBlocksChange,
  title = "",
  onTitleChange,
  summary = "",
  onSummaryChange,
  summaryDisabled = false,
  showPreview = false,
  context,
  editors,
  blockTypes,
  enableVirtualization = true,
  virtualizationThreshold = 50,
  className,
}: ContentEditorProps) {
  const { registry, messages, sanitizer, resolveAssetUrl } = useContentServices();
  const { addBlock, updateBlock, removeBlock, insertBlocks } = useBlockManagement({ blocks, onBlocksChange, registry });
  const { focusedBlock, setFocusedBlock, scheduleBlockFocus } = useBlockFocus();
  const titleRef = useTextareaResize<HTMLTextAreaElement>(title);
  const summaryRef = useTextareaResize<HTMLTextAreaElement>(summary);

  // Back from the preview, the fields are mounted again and need their height
  useEffect(() => {
    if (showPreview) return;
    const timer = setTimeout(() => {
      if (titleRef.current) resizeTextarea(titleRef.current);
      if (summaryRef.current) resizeTextarea(summaryRef.current);
    }, 0);
    return () => clearTimeout(timer);
  }, [showPreview, titleRef, summaryRef]);

  const handleAddBlock = useCallback(
    (type: string, afterId?: string, initialText?: string) => {
      const id = addBlock(type, afterId, initialText);
      setFocusedBlock(id);
      scheduleBlockFocus(id);
    },
    [addBlock, setFocusedBlock, scheduleBlockFocus],
  );
  const handleBlockUpdate = useCallback((id: string, data: BlockData) => updateBlock(id, data), [updateBlock]);
  const handleBlockRemove = useCallback((id: string) => removeBlock(id), [removeBlock]);
  const handleBlockFocus = useCallback((id: string) => setFocusedBlock(id), [setFocusedBlock]);
  const handleBlockBlur = useCallback(
    (event?: FocusEvent) => {
      // Clicking a block's own actions must not count as leaving it
      const target = event?.relatedTarget as HTMLElement | null | undefined;
      if (!target?.closest?.(".elea-block-editor")) setFocusedBlock(null);
    },
    [setFocusedBlock],
  );
  const handleAddBlockAfter = useCallback((id: string, type: string, initialText?: string) => handleAddBlock(type, id, initialText), [handleAddBlock]);
  const handleInsertBlocksAfter = useCallback(
    (id: string, pasted: BlockLike[], after: string) => {
      const trailing = after.trim() ? [{ type: "paragraph", data: { text: after } }] : [];
      const ids = insertBlocks([...pasted, ...trailing], id);
      const last = ids.at(-1);
      if (last) {
        setFocusedBlock(last);
        scheduleBlockFocus(last);
      }
    },
    [insertBlocks, setFocusedBlock, scheduleBlockFocus],
  );

  const rendered = useMemo(
    () =>
      blocks.map((block) => (
        <BlockEditor
          key={block.id}
          block={block}
          isFocused={focusedBlock === block.id}
          onFocus={() => handleBlockFocus(block.id)}
          onBlur={handleBlockBlur}
          onUpdate={(data) => handleBlockUpdate(block.id, data)}
          onRemove={() => handleBlockRemove(block.id)}
          onAddBlockAfter={(type, initialText) => handleAddBlockAfter(block.id, type, initialText)}
          onInsertBlocksAfter={(pasted, after) => handleInsertBlocksAfter(block.id, pasted, after)}
          context={context}
          editors={editors}
        />
      )),
    [blocks, focusedBlock, handleBlockFocus, handleBlockBlur, handleBlockUpdate, handleBlockRemove, handleAddBlockAfter, handleInsertBlocksAfter, context, editors],
  );

  const classes = ["elea-content-editor", className].filter(Boolean).join(" ");

  if (showPreview) {
    return (
      <div className={`${classes} elea-content-editor--preview`}>
        <article className="elea-content-editor__preview">
          {(onTitleChange || title) && (
            <header className="elea-content-editor__preview-header">
              <h1 className="elea-content-editor__preview-title">{title}</h1>
              {!summaryDisabled && summary && <p className="elea-content-editor__preview-summary">{summary}</p>}
            </header>
          )}
          <ContentView data={createDocument(blocks)} registry={registry} sanitizer={sanitizer} resolveAssetUrl={resolveAssetUrl} messages={messages} />
        </article>
      </div>
    );
  }

  return (
    <div className={classes}>
      {onTitleChange && (
        <textarea
          ref={titleRef}
          className="elea-textarea elea-content-editor__title"
          placeholder={messages.editor.titlePlaceholder}
          aria-label={messages.editor.titlePlaceholder}
          value={title}
          rows={1}
          onChange={(event) => onTitleChange(event.target.value)}
          onInput={(event) => resizeTextarea(event.currentTarget)}
        />
      )}
      {onSummaryChange && !summaryDisabled && (
        <textarea
          ref={summaryRef}
          className="elea-textarea elea-content-editor__summary"
          placeholder={messages.editor.summaryPlaceholder}
          aria-label={messages.editor.summaryPlaceholder}
          value={summary}
          rows={1}
          onChange={(event) => onSummaryChange(event.target.value)}
          onInput={(event) => resizeTextarea(event.currentTarget)}
        />
      )}
      <div className="elea-content-editor__blocks">
        {enableVirtualization ? (
          <VirtualizedBlockList
            blocks={blocks}
            focusedBlock={focusedBlock}
            onBlockFocus={handleBlockFocus}
            onBlockBlur={handleBlockBlur}
            onBlockUpdate={handleBlockUpdate}
            onBlockRemove={handleBlockRemove}
            onAddBlockAfter={handleAddBlockAfter}
            onInsertBlocksAfter={handleInsertBlocksAfter}
            context={context}
            editors={editors}
            threshold={virtualizationThreshold}
          />
        ) : (
          rendered
        )}
      </div>
      <div className="elea-content-editor__add">
        <AddBlockButton onAdd={(type) => handleAddBlock(type)} types={blockTypes} />
      </div>
    </div>
  );
}
