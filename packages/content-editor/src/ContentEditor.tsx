"use client";

import { createDocument, en, formatMessage, htmlToText, type BlockData, type BlockLike, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ClipboardEvent, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AddBlockButton } from "./AddBlockButton.js";
import { BlockEditor, type BlockEditorMap } from "./BlockEditor.js";
import { fieldFullySelected } from "./caret.js";
import { MarkdownEditor, type MarkdownDraft } from "./MarkdownEditor.js";
import { QuickAddButtons } from "./QuickAddButtons.js";
import { EMPTY_FORMATS, type ActiveFormats, type RichTextFieldHandle } from "./RichTextField.js";
import { Toolbar } from "./Toolbar.js";
import { useBlockFocus } from "./hooks/useBlockFocus.js";
import { useBlockManagement } from "./hooks/useBlockManagement.js";
import { useBlockSelection, type BlockSelection } from "./hooks/useBlockSelection.js";
import { useDocumentHistory, type DocumentHistory } from "./hooks/useDocumentHistory.js";
import { useBlockDrag, type DropTarget } from "./hooks/useBlockDrag.js";
import { CopyIcon, RedoIcon, ScissorsIcon, TrashIcon, UndoIcon } from "./icons.js";
import { writeBlocksToClipboard } from "./selection.js";
import * as pasteModule from "./paste.js";
import { generateId as addBlockIdPlaceholder } from "@alien6-studio/elea-content";
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
  /** Called whenever the multi-block selection changes, with the selected blocks in order. */
  onSelectionChange?: ((selection: BlockSelection, blocks: EleaBlock[]) => void) | undefined;
  /** Extra actions in the selection bar, after the built-in ones. */
  renderSelectionActions?: ((selection: { ids: string[]; blocks: EleaBlock[]; clear: () => void }) => ReactNode) | undefined;
  /** Undo and redo over the whole document on Ctrl+Z and Ctrl+Shift+Z; on by default. */
  history?: boolean | undefined;
  /** Changes closer than this many milliseconds undo together; defaults to 500. */
  historyGroupWithinMs?: number | undefined;
  /**
   * `default`: a bare writing surface, controls in the margin, one floating bar over
   * selections. `toolbar`: the same surface with a fixed bar above the document: formats,
   * insertion, history. `classic`: that bar alone over a continuous document, nothing around
   * the blocks, as a conventional editor. `markdown`: the source with line numbers.
   */
  mode?: EditorMode | undefined;
  /** Shows a mode picker driven by the controlled `mode` prop. */
  onModeChange?: ((mode: EditorMode) => void) | undefined;
}

export type EditorMode = "default" | "toolbar" | "classic" | "markdown";

/** What a host can drive from outside: undo and redo, with their availability. */
export type ContentEditorHandle = DocumentHistory;

/**
 * The block editor: optional title and summary fields, the blocks, and an add button.
 * Content is controlled: every change goes through `onBlocksChange`.
 */
export const ContentEditor = forwardRef<ContentEditorHandle, ContentEditorProps>(function ContentEditor({
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
  onSelectionChange,
  renderSelectionActions,
  history = true,
  historyGroupWithinMs = 500,
  mode = "default",
  onModeChange,
}, ref) {
  const { registry, messages, sanitizer, resolveAssetUrl } = useContentServices();
  const sourceMessages = messages.source ?? en.source;
  const isMarkdown = mode === "markdown";
  const blockMode = isMarkdown ? "default" : mode;
  const [markdownDraft, setMarkdownDraft] = useState<MarkdownDraft>();
  const documentHistory = useDocumentHistory({ blocks, title, summary }, { onBlocksChange, onTitleChange, onSummaryChange, groupWithinMs: historyGroupWithinMs });
  useImperativeHandle(ref, () => documentHistory, [documentHistory]);
  const { addBlock, updateBlock, removeBlock, insertBlocks, convertBlock, moveBlocks, shiftBlocks } = useBlockManagement({ blocks, onBlocksChange, registry });
  const { focusedBlock, setFocusedBlock, scheduleBlockFocus } = useBlockFocus();
  const order = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const rootRef = useRef<HTMLDivElement>(null);
  const blockSelection = useBlockSelection(order, rootRef);
  const { selection } = blockSelection;
  const [selectionAnchor, setSelectionAnchor] = useState<Element | null>(null);
  useLayoutEffect(() => {
    const anchor = selection.ids.length > 0
      ? rootRef.current?.querySelector(":scope > .elea-content-editor__blocks > .elea-block-slot > .elea-block-editor--selected")
      : null;
    setSelectionAnchor(anchor ?? null);
  }, [selection.ids, blocks, enableVirtualization, isMarkdown, showPreview]);
  const clearSelection = blockSelection.clear;
  useEffect(() => {
    if (isMarkdown) {
      clearSelection();
      setFocusedBlock(null);
    }
  }, [isMarkdown, clearSelection, setFocusedBlock]);
  const selectedBlocks = useMemo(() => blocks.filter((block) => selection.ids.includes(block.id)), [blocks, selection.ids]);

  // The root takes focus while blocks are selected, so copy, cut, paste and keys reach it
  useEffect(() => {
    if (selection.ids.length > 0 && rootRef.current && !rootRef.current.contains(document.activeElement)) rootRef.current.focus();
  }, [selection.ids.length]);
  const lastReported = useRef<string>("");
  useEffect(() => {
    const key = selection.ids.join("|");
    if (key === lastReported.current) return;
    lastReported.current = key;
    onSelectionChange?.(selection, selectedBlocks);
  }, [selection, selectedBlocks, onSelectionChange]);

  /** Removes the selected blocks; an empty document keeps one paragraph. */
  const deleteSelection = useCallback(() => {
    if (selection.ids.length === 0) return;
    const remaining = blocks.filter((block) => !selection.ids.includes(block.id));
    const next = remaining.length > 0 ? remaining : [{ id: addBlockIdPlaceholder(), type: "paragraph", data: registry.defaults("paragraph") }];
    onBlocksChange(next);
    blockSelection.clear();
  }, [selection.ids, blocks, onBlocksChange, registry, blockSelection]);

  const copySelection = useCallback(
    (clipboard: Pick<DataTransfer, "setData">) => {
      if (selectedBlocks.length === 0) return false;
      writeBlocksToClipboard(clipboard, selectedBlocks, registry, sanitizer);
      return true;
    },
    [selectedBlocks, registry, sanitizer],
  );

  /** The bar buttons write through the async clipboard: rich HTML and text when the browser allows, text otherwise. */
  const copyToSystemClipboard = useCallback(() => {
    const store = new Map<string, string>();
    if (!copySelection({ setData: (type, value) => store.set(type, value) })) return;
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
    if (!clipboard) return;
    const html = store.get("text/html") ?? "";
    const text = store.get("text/plain") ?? "";
    if (typeof ClipboardItem !== "undefined" && typeof clipboard.write === "function") {
      void clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]).catch(() => clipboard.writeText?.(text));
    } else {
      void clipboard.writeText?.(text);
    }
  }, [copySelection]);

  const handleRootCopy = useCallback(
    (event: ClipboardEvent) => {
      if (selection.ids.length === 0 || !copySelection(event.clipboardData)) return;
      event.preventDefault();
    },
    [selection.ids.length, copySelection],
  );
  const handleRootCut = useCallback(
    (event: ClipboardEvent) => {
      if (selection.ids.length === 0 || !copySelection(event.clipboardData)) return;
      event.preventDefault();
      deleteSelection();
    },
    [selection.ids.length, copySelection, deleteSelection],
  );
  const handleRootPaste = useCallback(
    (event: ClipboardEvent) => {
      if (selection.ids.length === 0) return;
      event.preventDefault();
      const { parseClipboard } = pasteModule;
      const pasted = parseClipboard(event.clipboardData, sanitizer);
      const incoming: BlockLike[] = pasted.inline !== null ? (pasted.inline ? [{ type: "paragraph", data: { text: pasted.inline } }] : []) : pasted.blocks;
      if (incoming.length === 0) return;
      const last = selection.ids.at(-1) as string;
      const ids = insertBlocks(incoming, last);
      const remaining = blocks.filter((block) => !selection.ids.includes(block.id));
      // insertBlocks already reported the list with the new blocks; drop the replaced ones from it
      const withInserted = [...blocks.slice(0, blocks.findIndex((block) => block.id === last) + 1), ...ids.map((id, index) => ({ id, type: incoming[index]?.type ?? "paragraph", data: registry.normalizeData(incoming[index]?.type ?? "paragraph", (incoming[index]?.data as BlockData) ?? {}) })), ...blocks.slice(blocks.findIndex((block) => block.id === last) + 1)];
      onBlocksChange(withInserted.filter((block) => !selection.ids.includes(block.id) || remaining.includes(block)));
      blockSelection.setIds(ids);
    },
    [selection.ids, sanitizer, insertBlocks, blocks, onBlocksChange, registry, blockSelection],
  );
  const textBlock = (block: EleaBlock | undefined) => (block && block.type === "paragraph" ? (typeof block.data.text === "string" ? block.data.text : "") : null);

  const handleNavigate = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = blocks.findIndex((block) => block.id === id);
      const target = blocks[index + (direction === "up" ? -1 : 1)];
      if (!target) return;
      setFocusedBlock(target.id);
      scheduleBlockFocus(target.id, direction === "up" ? "end" : "start");
    },
    [blocks, setFocusedBlock, scheduleBlockFocus],
  );

  /** Backspace at the start of a block: paragraphs join the previous paragraph, an empty block simply leaves. */
  const handleMergeBackward = useCallback(
    (id: string, html: string) => {
      const index = blocks.findIndex((block) => block.id === id);
      const previous = blocks[index - 1];
      const current = blocks[index];
      if (!previous || !current) return;
      const previousText = textBlock(previous);
      const emptyHtml = htmlToText(html) === "";
      if (previousText !== null && current.type === "paragraph") {
        const junction = htmlToText(previousText, { collapseWhitespace: false }).length;
        const merged = blocks.map((block) => (block.id === previous.id ? { ...block, data: { ...block.data, text: emptyHtml ? previousText : previousText + html } } : block)).filter((block) => block.id !== id);
        onBlocksChange(merged);
        setFocusedBlock(previous.id);
        scheduleBlockFocus(previous.id, junction);
        return;
      }
      if (emptyHtml && blocks.length > 1) {
        onBlocksChange(blocks.filter((block) => block.id !== id));
      }
      setFocusedBlock(previous.id);
      scheduleBlockFocus(previous.id, "end");
    },
    [blocks, onBlocksChange, setFocusedBlock, scheduleBlockFocus],
  );

  /** Delete at the end of a paragraph: the next paragraph joins it. */
  const handleMergeForward = useCallback(
    (id: string) => {
      const index = blocks.findIndex((block) => block.id === id);
      const current = blocks[index];
      const next = blocks[index + 1];
      const currentText = textBlock(current);
      const nextText = textBlock(next);
      if (!current || !next || currentText === null || nextText === null) return;
      const junction = htmlToText(currentText, { collapseWhitespace: false }).length;
      onBlocksChange(blocks.map((block) => (block.id === id ? { ...block, data: { ...block.data, text: currentText + nextText } } : block)).filter((block) => block.id !== next.id));
      scheduleBlockFocus(id, junction);
    },
    [blocks, onBlocksChange, scheduleBlockFocus],
  );

  /** A typing shortcut or the slash menu changes the block's type; the caret follows into the new field. */
  const handleConvert = useCallback(
    (id: string, type: string, data?: Record<string, unknown>) => {
      convertBlock(id, type, data);
      setFocusedBlock(id);
      scheduleBlockFocus(id, "end");
    },
    [convertBlock, setFocusedBlock, scheduleBlockFocus],
  );

  const handleMove = useCallback((ids: readonly string[], target: DropTarget) => moveBlocks(ids, target.id, target.position), [moveBlocks]);
  const drag = useBlockDrag({ onMove: handleMove, selectedIds: selection.ids });

  /** Ctrl+Shift+arrows move the focused block, or the whole selection, one step. */
  const shiftFocusedOrSelected = useCallback(
    (direction: -1 | 1): boolean => {
      const ids = selection.ids.length > 0 ? selection.ids : focusedBlock ? [focusedBlock] : [];
      if (ids.length === 0) return false;
      const moved = shiftBlocks(ids, direction);
      if (moved && focusedBlock && selection.ids.length === 0) scheduleBlockFocus(focusedBlock, "end");
      return moved;
    },
    [selection.ids, focusedBlock, shiftBlocks, scheduleBlockFocus],
  );

  /** Ctrl+Z and Ctrl+Shift+Z (or Ctrl+Y) act on the document; the fields' own undo is replaced. */
  const handleRootKeyDownCapture = useCallback(
    (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (event.key.toLowerCase() === "a" && !event.shiftKey) {
        // Once the field's text is all selected (or the field is empty), select all the blocks
        if (selection.ids.length === 0 && !fieldFullySelected(event.target)) return;
        event.preventDefault();
        blockSelection.selectAll();
        return;
      }
      if (event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        // The bubbling handler reads Shift+arrows as a selection change; this is a move
        event.stopPropagation();
        shiftFocusedOrSelected(event.key === "ArrowUp" ? -1 : 1);
        return;
      }
      if (!history) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        documentHistory.undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        documentHistory.redo();
      }
    },
    [history, documentHistory, shiftFocusedOrSelected, selection.ids.length, blockSelection],
  );

  /** The selected blocks give way to one paragraph holding `text`, with the caret at its end. */
  const replaceSelectionWith = useCallback(
    (text: string) => {
      if (selection.ids.length === 0) return;
      const index = blocks.findIndex((block) => block.id === selection.ids[0]);
      const paragraph: EleaBlock = { id: addBlockIdPlaceholder(), type: "paragraph", data: registry.normalizeData("paragraph", { ...registry.defaults("paragraph"), text }) };
      const remaining = blocks.filter((block) => !selection.ids.includes(block.id));
      const next = [...remaining.slice(0, index), paragraph, ...remaining.slice(index)];
      onBlocksChange(next);
      blockSelection.clear();
      setFocusedBlock(paragraph.id);
      scheduleBlockFocus(paragraph.id, "end");
    },
    [selection.ids, blocks, registry, onBlocksChange, blockSelection, setFocusedBlock, scheduleBlockFocus],
  );

  const handleRootKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (blockSelection.onKeyDown(event, focusedBlock)) return;
      if (selection.ids.length === 0) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // Writing over a block selection replaces it, as it does over a text selection
      if (event.key === "Enter") {
        event.preventDefault();
        replaceSelectionWith("");
        return;
      }
      if (event.key.length === 1) {
        event.preventDefault();
        replaceSelectionWith(event.key);
        return;
      }
      // A plain arrow releases the blocks and puts the caret at the matching edge
      if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
        const id = (backward ? selection.ids[0] : selection.ids.at(-1)) as string;
        blockSelection.clear();
        setFocusedBlock(id);
        scheduleBlockFocus(id, backward ? "start" : "end");
      }
    },
    [blockSelection, focusedBlock, selection.ids, deleteSelection, replaceSelectionWith, setFocusedBlock, scheduleBlockFocus],
  );

  // The fixed bar of the classic mode acts on the focused paragraph's field
  const activeFieldRef = useRef<RichTextFieldHandle | null>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS);
  const [hasActiveField, setHasActiveField] = useState(false);
  const handleActiveField = useCallback((handle: RichTextFieldHandle | null, formats: ActiveFormats) => {
    activeFieldRef.current = handle;
    setHasActiveField(handle !== null);
    setActiveFormats(formats);
  }, []);
  useEffect(() => {
    if (isMarkdown) handleActiveField(null, EMPTY_FORMATS);
  }, [isMarkdown, handleActiveField]);
  /** A block gives way to several; the first keeps its id, the one at `focus` takes the caret. */
  const handleReplaceBlock = useCallback(
    (id: string, incoming: BlockLike[], focus: number, position: "start" | "end" = "start") => {
      const index = blocks.findIndex((block) => block.id === id);
      if (index === -1 || incoming.length === 0) return;
      const replacements: EleaBlock[] = incoming.map((block, position) => ({
        id: position === 0 ? id : addBlockIdPlaceholder(),
        type: block.type,
        data: registry.normalizeData(block.type, typeof block.data === "object" && block.data !== null ? (block.data as BlockData) : {}),
      }));
      onBlocksChange([...blocks.slice(0, index), ...replacements, ...blocks.slice(index + 1)]);
      const target = replacements[Math.min(focus, replacements.length - 1)] as EleaBlock;
      setFocusedBlock(target.id);
      scheduleBlockFocus(target.id, position);
    },
    [blocks, registry, onBlocksChange, setFocusedBlock, scheduleBlockFocus],
  );
  /** Dragging selected text between fields moves words around by accident; only the grips drag. */
  const handleRootDragStart = useCallback((event: React.DragEvent) => {
    if (!(event.target as HTMLElement).closest?.(".elea-block-editor__grip")) event.preventDefault();
  }, []);
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
      // Clicking a block's own actions or the document bar must not count as leaving it
      const target = event?.relatedTarget as HTMLElement | null | undefined;
      if (!target?.closest?.(".elea-block-editor, .elea-doc-toolbar")) setFocusedBlock(null);
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
  const handleSourceImage = useCallback((data: BlockData) => {
    insertBlocks([{ type: "image", data }]);
  }, [insertBlocks]);

  const rendered = useMemo(
    () =>
      isMarkdown ? null : blocks.map((block) => (
        <div
          key={block.id}
          className={["elea-block-slot", drag.dropTarget?.id === block.id ? `elea-block-slot--drop-${drag.dropTarget.position}` : "", drag.dragging?.includes(block.id) ? "elea-block-slot--dragging" : ""].filter(Boolean).join(" ")}
          data-elea-block-slot={block.id}
          {...drag.slotProps(block.id)}
        >
        <BlockEditor
          block={block}
          isFocused={focusedBlock === block.id}
          isSelected={selection.ids.includes(block.id)}
          onFocus={() => handleBlockFocus(block.id)}
          onBlur={handleBlockBlur}
          onUpdate={(data) => handleBlockUpdate(block.id, data)}
          onRemove={() => handleBlockRemove(block.id)}
          onAddBlockAfter={(type, initialText) => handleAddBlockAfter(block.id, type, initialText)}
          onInsertBlocksAfter={(pasted, after) => handleInsertBlocksAfter(block.id, pasted, after)}
          onNavigate={(direction) => handleNavigate(block.id, direction)}
          onMergeBackward={(html) => handleMergeBackward(block.id, html)}
          onMergeForward={() => handleMergeForward(block.id)}
          onConvert={(type, data) => handleConvert(block.id, type, data)}
          onReplaceWith={(incoming, focus, position) => handleReplaceBlock(block.id, incoming, focus, position)}
          blockTypes={blockTypes}
          dragHandleProps={drag.handleProps(block.id)}
          context={context}
          editors={editors}
          mode={blockMode}
          onActiveField={blockMode === "default" ? undefined : handleActiveField}
        />
        </div>
      )),
    [blocks, focusedBlock, selection.ids, handleBlockFocus, handleBlockBlur, handleBlockUpdate, handleBlockRemove, handleAddBlockAfter, handleInsertBlocksAfter, handleNavigate, handleMergeBackward, handleMergeForward, handleConvert, handleReplaceBlock, blockTypes, drag, context, editors, blockMode, isMarkdown, handleActiveField],
  );

  const classes = ["elea-content-editor", `elea-content-editor--${mode}`, className, blockSelection.dragging ? "elea-content-editor--selecting" : ""].filter(Boolean).join(" ");
  const documentToolbar = blockMode !== "default" && (
    <div className="elea-doc-toolbar">
      <div className={`elea-doc-toolbar__group${hasActiveField ? "" : " elea-doc-toolbar__group--idle"}`} aria-disabled={!hasActiveField || undefined}>
        <Toolbar editorRef={activeFieldRef} activeFormats={activeFormats} />
      </div>
      <div className="elea-doc-toolbar__group" role="group" aria-label={messages.actions.insert}>
        <span className="elea-doc-toolbar__label">{messages.actions.insert}</span>
        <QuickAddButtons types={blockTypes} row onAdd={(type) => handleAddBlock(type, focusedBlock ?? undefined)} />
      </div>
      {history && (
        <div className="elea-doc-toolbar__group elea-doc-toolbar__group--history">
          <button type="button" className="elea-icon-button" onClick={documentHistory.undo} disabled={!documentHistory.canUndo} aria-label={messages.actions.undo} title={messages.actions.undo}><UndoIcon /></button>
          <button type="button" className="elea-icon-button" onClick={documentHistory.redo} disabled={!documentHistory.canRedo} aria-label={messages.actions.redo} title={messages.actions.redo}><RedoIcon /></button>
        </div>
      )}
    </div>
  );
  const count = selection.ids.length;
  const selectionBar = count > 0 && selectionAnchor && createPortal(
    <div className="elea-toolbar elea-selection-bar" role="toolbar" aria-label={count === 1 ? messages.selection.one : formatMessage(messages.selection.count, { count })}>
      <span className="elea-selection-bar__count">{count === 1 ? messages.selection.one : formatMessage(messages.selection.count, { count })}</span>
      <button type="button" className="elea-toolbar__button" onClick={copyToSystemClipboard} aria-label={messages.selection.copy} title={messages.selection.copy}>
        <CopyIcon />
      </button>
      <button type="button" className="elea-toolbar__button" onClick={() => { copyToSystemClipboard(); deleteSelection(); }} aria-label={messages.selection.cut} title={messages.selection.cut}>
        <ScissorsIcon />
      </button>
      <button type="button" className="elea-toolbar__button" onClick={deleteSelection} aria-label={messages.selection.delete} title={messages.selection.delete}>
        <TrashIcon />
      </button>
      {renderSelectionActions?.({ ids: selection.ids, blocks: selectedBlocks, clear: blockSelection.clear })}
      <button type="button" className="elea-button elea-button--link" onClick={blockSelection.clear}>{messages.selection.clear}</button>
    </div>,
    selectionAnchor,
  );

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
    <div
      ref={rootRef}
      className={classes}
      tabIndex={-1}
      onMouseDown={isMarkdown ? undefined : (event) => blockSelection.onMouseDown(event, focusedBlock)}
      onDragStart={isMarkdown ? undefined : handleRootDragStart}
      onKeyDownCapture={isMarkdown ? undefined : handleRootKeyDownCapture}
      onKeyDown={isMarkdown ? undefined : handleRootKeyDown}
      onCopy={isMarkdown ? undefined : handleRootCopy}
      onCut={isMarkdown ? undefined : handleRootCut}
      onPaste={isMarkdown ? undefined : handleRootPaste}
    >
      {onModeChange && (
        <label className="elea-content-editor__mode">
          {sourceMessages.mode}
          <select value={mode} onChange={(event) => onModeChange(event.currentTarget.value as EditorMode)}>
            <option value="default">{sourceMessages.writing}</option>
            <option value="toolbar">{sourceMessages.toolbar}</option>
            <option value="classic">{sourceMessages.classic}</option>
            <option value="markdown">{sourceMessages.markdown}</option>
          </select>
        </label>
      )}
      {documentToolbar}
      {!isMarkdown && selectionBar}
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
        {isMarkdown ? (
          <MarkdownEditor blocks={blocks} draft={markdownDraft} onDraftChange={setMarkdownDraft} onBlocksChange={onBlocksChange} onAddImage={handleSourceImage} context={context ?? {}} />
        ) : enableVirtualization ? (
          <VirtualizedBlockList
            blocks={blocks}
            focusedBlock={focusedBlock}
            selectedIds={selection.ids}
            onBlockFocus={handleBlockFocus}
            onBlockBlur={handleBlockBlur}
            onBlockUpdate={handleBlockUpdate}
            onBlockRemove={handleBlockRemove}
            onAddBlockAfter={handleAddBlockAfter}
            onInsertBlocksAfter={handleInsertBlocksAfter}
            onNavigate={handleNavigate}
            onMergeBackward={handleMergeBackward}
            onMergeForward={handleMergeForward}
            onConvert={handleConvert}
            onReplaceWith={handleReplaceBlock}
            blockTypes={blockTypes}
            dragHandleProps={drag.handleProps}
            slotProps={drag.slotProps}
            dropTarget={drag.dropTarget}
            draggingIds={drag.dragging}
            context={context}
            editors={editors}
            threshold={virtualizationThreshold}
            mode={blockMode}
            onActiveField={blockMode === "default" ? undefined : handleActiveField}
          />
        ) : (
          rendered
        )}
      </div>
      {!isMarkdown && (
        <div className="elea-content-editor__add">
          <AddBlockButton onAdd={(type) => handleAddBlock(type)} types={blockTypes} />
        </div>
      )}
    </div>
  );
});
