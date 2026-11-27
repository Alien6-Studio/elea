"use client";

import { en, formatMessage, generateId, htmlToText, type BlockData, type BlockLike, type EleaBlock } from "@alien6-studio/elea-content";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ClipboardEvent, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { AddBlockButton } from "./AddBlockButton.js";
import type { BlockEditorMap } from "./BlockEditor.js";
import { TextLimitContext, fitPastedBlocks, useEditorTextLimit } from "./editorTextLimit.js";
import { fieldFullySelected } from "./caret.js";
import type { MarkdownDraft } from "./MarkdownEditor.js";
import type { ListCommand } from "./listCommands.js";
import { EMPTY_FORMATS, type ActiveFormats, type RichTextFieldHandle } from "./RichTextField.js";
import { useBlockFocus } from "./hooks/useBlockFocus.js";
import { useBlockManagement } from "./hooks/useBlockManagement.js";
import { useBlockSelection, type BlockSelection } from "./hooks/useBlockSelection.js";
import { useDocumentHistory, type DocumentHistory } from "./hooks/useDocumentHistory.js";
import { useBlockDrag, type DropTarget } from "./hooks/useBlockDrag.js";
import { ClassicShell, DocumentToolbar, HistoryButtons, SelectionBar, TitleFields } from "./editorChrome.js";
import { previewPart, sourcePart, usePart } from "./parts.js";
import { RestrictionsContext, createRestrictions, type EditorMark } from "./restrictions.js";
import { clipboardItem, copyBlock, writeBlocksToClipboard } from "./selection.js";
import { cleanBlocks } from "./paste.js";
import { insertPasted, pastePayload, pasteSite } from "./blockPaste.js";
import { resizeTextarea, useTextareaResize } from "./hooks/useTextareaResize.js";
import { useContentServices, type EditorContextInfo } from "./provider.js";
import { VirtualizedBlockList } from "./VirtualizedBlockList.js";

function textBlock(block: EleaBlock | undefined) {
  if (block?.type !== "paragraph") return null;
  return typeof block.data.text === "string" ? block.data.text : "";
}

function historyAction(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  if (key === "z") return event.shiftKey ? "redo" : "undo";
  return key === "y" ? "redo" : null;
}

function editorClasses(mode: EditorMode, width: ContentEditorProps["width"], className: string | undefined, selecting: boolean) {
  return ["elea-content-editor", `elea-content-editor--${mode}`, width === "full" && "elea-content-editor--full", className, selecting && "elea-content-editor--selecting"].filter(Boolean).join(" ");
}

function sameBlocks(left: EleaBlock[], right: EleaBlock[]) {
  return left === right || (left.length === right.length && left.every((block, index) => block === right[index]));
}

const NO_CONTEXT: EditorContextInfo = {};

export interface ContentEditorProps {
  blocks: EleaBlock[];
  onBlocksChange: (blocks: EleaBlock[]) => void;
  title?: string | undefined;
  onTitleChange?: ((title: string) => void) | undefined;
  summary?: string | undefined;
  onSummaryChange?: ((summary: string) => void) | undefined;
  /** Hides the summary field; the title field hides when `onTitleChange` is absent. */
  summaryDisabled?: boolean | undefined;
  /** Hard limit on the document body’s plain-text UTF-16 length, with a localized counter. */
  maxLength?: number | undefined;
  /** Read-only rendering of the current content, through the viewer. */
  showPreview?: boolean | undefined;
  /** Passed to the host's upload and attachment services. */
  context?: EditorContextInfo | undefined;
  /** Editing components for custom block types. */
  editors?: BlockEditorMap | undefined;
  /**
   * The block types this editor accepts; every type when absent, and the add menus then offer the
   * seven built-in blocks. It governs every way a block appears: menus, toolbar, typing shortcuts,
   * pasting and the document handed in. A paragraph is always accepted: a disallowed block carrying
   * text falls back to it, one without text is left out and reported through `onBlocksLeftOut`.
   */
  blockTypes?: readonly string[] | undefined;
  /** The inline marks this editor accepts; all of them when absent. A disallowed mark keeps its text. */
  marks?: readonly EditorMark[] | undefined;
  /** Called with the blocks without text that `blockTypes` left out, on load and on paste. */
  onBlocksLeftOut?: ((blocks: BlockLike[]) => void) | undefined;
  enableVirtualization?: boolean | undefined;
  virtualizationThreshold?: number | undefined;
  /** Keep the reading measure (default), or fill the host's available width. */
  width?: "measure" | "full" | undefined;
  className?: string | undefined;
  /** Called whenever the multi-block selection changes, with the selected blocks in order. */
  onSelectionChange?: ((selection: BlockSelection, blocks: EleaBlock[]) => void) | undefined;
  /** Extra actions in the selection bar, after the built-in ones. */
  renderSelectionActions?: ((selection: { ids: string[]; blocks: EleaBlock[]; clear: () => void }) => ReactNode) | undefined;
  /** Document history is on by default. Use "keyboard" when the host provides the visible history controls. */
  history?: boolean | "keyboard" | undefined;
  /** Visible history actions when the host keeps its own versions of the document. */
  historyControls?: ReactNode;
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
  blocks: hostBlocks,
  onBlocksChange: hostBlocksChange,
  title = "",
  onTitleChange,
  summary = "",
  onSummaryChange,
  summaryDisabled = false,
  maxLength,
  showPreview = false,
  context = NO_CONTEXT,
  editors,
  blockTypes,
  marks,
  onBlocksLeftOut,
  enableVirtualization = true,
  virtualizationThreshold = 50,
  width,
  className,
  onSelectionChange,
  renderSelectionActions,
  history = true,
  historyControls,
  historyGroupWithinMs = 500,
  mode = "default",
  onModeChange,
}, ref) {
  const { registry, sanitizer, resolveAssetUrl, messages } = useContentServices();
  const leftOutRef = useRef(onBlocksLeftOut);
  leftOutRef.current = onBlocksLeftOut;
  const blockTypesKey = blockTypes?.join("\n");
  const marksKey = marks?.join("\n");
  // The allow-list follows what the host lists, not the identity of the arrays it passes
  const restrictions = useMemo(
    () => (blockTypes || marks ? createRestrictions({ blockTypes, marks, onLeftOut: left => leftOutRef.current?.(left) }) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockTypesKey, marksKey],
  );
  // The document is edited in its accepted form; the host receives it with the first change
  const restricted = useMemo(() => restrictions?.restrict(hostBlocks), [restrictions, hostBlocks]);
  const blocks = restricted?.blocks ?? hostBlocks;
  const onBlocksChange = useCallback((next: EleaBlock[]) => hostBlocksChange(restrictions ? restrictions.admit(next) : next), [restrictions, hostBlocksChange]);
  const reportedLeftOut = useRef(new Set<string>());
  useEffect(() => {
    const fresh = restricted?.leftOut.filter(block => !reportedLeftOut.current.has(block.id)) ?? [];
    for (const block of fresh) reportedLeftOut.current.add(block.id);
    if (fresh.length) leftOutRef.current?.(fresh);
  }, [restricted]);
  const textLimit = useEditorTextLimit(blocks, maxLength, registry);
  // The source view and the preview load when first asked for; the blocks stay until they are there
  const [source, sourceWaiting] = usePart(sourcePart, mode === "markdown");
  const [preview, previewWaiting] = usePart(previewPart, showPreview);
  const isMarkdown = source !== undefined;
  const blockMode = mode === "markdown" ? "default" : mode;
  const [markdownDraft, setMarkdownDraft] = useState<MarkdownDraft>();
  const documentHistory = useDocumentHistory({ blocks, title, summary }, { onBlocksChange, onTitleChange, onSummaryChange, groupWithinMs: historyGroupWithinMs });
  useImperativeHandle(ref, () => documentHistory, [documentHistory]);
  const { addBlock, updateBlock, removeBlock, insertBlocks, convertBlock, moveBlocks, shiftBlocks } = useBlockManagement({ blocks, onBlocksChange, registry, acceptChange: textLimit?.accepts });
  const rootRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const { focusedBlock, setFocusedBlock, scheduleBlockFocus } = useBlockFocus(rootRef);
  const order = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const blockSelection = useBlockSelection(order, rootRef);
  const { selection } = blockSelection;
  const [selectionAnchor, setSelectionAnchor] = useState<Element | null>(null);
  useLayoutEffect(() => {
    const anchor = selection.ids.length > 0
      ? blocksRef.current?.querySelector(":scope > .elea-block-slot > .elea-block-editor--selected") ??
        blocksRef.current?.querySelector(":scope > .elea-block-slot[aria-selected=true]")
      : null;
    setSelectionAnchor(anchor?.closest(".elea-block-slot") ?? null);
  }, [selection.ids, blocks, enableVirtualization, mode, showPreview]);
  const clearSelection = blockSelection.clear;
  useEffect(() => {
    if (isMarkdown) {
      clearSelection();
      setFocusedBlock(null);
    }
  }, [isMarkdown, clearSelection, setFocusedBlock]);
  const selectedIds = useMemo(() => new Set(selection.ids), [selection.ids]);
  const selectedBlocks = useMemo(() => blocks.filter((block) => selectedIds.has(block.id)), [blocks, selectedIds]);

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

  const cutState = useRef({ blocks, selection });
  cutState.current = { blocks, selection };
  const copiedRun = useRef<{ document: EleaBlock[]; ids: string[]; raw: string } | null>(null);

  function replaceSelection(replacements: EleaBlock[]) {
    const index = blocks.indexOf(selectedBlocks[0]!);
    const next = blocks.filter(block => !selectedIds.has(block.id));
    next.splice(index, 0, ...replacements);
    if (!next.length) next.push(copyBlock({ type: "paragraph", data: registry.defaults("paragraph") }));
    return next;
  }

  function deleteSelection() {
    const next = replaceSelection([]);
    onBlocksChange(next);
    const anchor = next[blocks.indexOf(selectedBlocks[0]!)] ?? next.at(-1)!;
    blockSelection.clear();
    setFocusedBlock(anchor.id);
    scheduleBlockFocus(anchor.id, blocks.indexOf(anchor) < blocks.indexOf(selectedBlocks[0]!) ? "end" : "start");
  }

  function copySelection(event: ClipboardEvent | globalThis.ClipboardEvent) {
    if (!selectedBlocks.length || !event.clipboardData) return false;
    const raw = writeBlocksToClipboard(event.clipboardData, selectedBlocks, registry, sanitizer, resolveAssetUrl);
    copiedRun.current = event.type === "cut" ? null : { document: blocks, ids: selection.ids, raw };
    event.preventDefault();
    if (event.type === "cut") deleteSelection();
    return true;
  }

  async function copyFromBar(cut: boolean) {
    // The native copy event can carry custom formats across editors and tabs.
    rootRef.current?.focus({ preventScroll: true });
    const previous = copiedRun.current;
    try {
      if (document.execCommand?.("copy") && copiedRun.current !== previous) {
        if (cut) deleteSelection();
        return;
      }
    } catch { /* use the asynchronous API */ }
    const clipboard = navigator.clipboard;
    if (!clipboard) return;
    const store = new Map<string, string>();
    const raw = writeBlocksToClipboard({ setData: (type, value) => store.set(type, value) }, selectedBlocks, registry, sanitizer, resolveAssetUrl);
    try {
      if (typeof ClipboardItem !== "undefined" && clipboard.write) {
        await clipboard.write([clipboardItem(store)]);
        // A delayed permission prompt must not remove blocks from a newer document.
        if (!rootRef.current || !sameBlocks(cutState.current.blocks, blocks) || cutState.current.selection !== selection) return;
        if (cut) deleteSelection();
        else copiedRun.current = { document: blocks, ids: selection.ids, raw };
      } else if (!cut) {
        await clipboard.writeText(store.get("text/plain")!);
      }
    } catch {
      // Keep the selection available for a native copy or cut shortcut.
    }
  }

  function handleRootPaste(event: ClipboardEvent | globalThis.ClipboardEvent, target: HTMLElement) {
    const data = event.clipboardData;
    if (!data) return;
    const site = pasteSite(target, rootRef.current, blocks, focusedBlock);
    const payload = site && pastePayload(data, site, selectedBlocks.length > 0, sanitizer);
    if (!site || !payload) return;
    event.preventDefault();
    event.stopPropagation();
    let created = payload.incoming.map(copyBlock);
    const lastCopy = copiedRun.current;
    const raw = payload.copied && JSON.stringify(payload.copied);
    // The clipboard format of blocks can be forged by any page: clean them once compared with the last copy
    if (payload.copied) cleanBlocks(created, sanitizer);
    if (restrictions) created = restrictions.admit(created);
    if (!created.length) return;
    const duplicate = lastCopy?.ids === selection.ids && raw === lastCopy.raw && sameBlocks(lastCopy.document, blocks);
    const after = duplicate ? blocks.indexOf(selectedBlocks.at(-1)!) + 1 : undefined;
    const paste = (incoming: EleaBlock[]) => selectedBlocks.length > 0 && !duplicate
      ? replaceSelection(incoming) : insertPasted(blocks, incoming, after, site);
    let next = paste(created);
    if (textLimit && !textLimit.accepts(next)) {
      const usedWithoutPaste = paste([]).reduce((sum, block) => sum + textLimit.text(block).length, 0);
      created = fitPastedBlocks(created, Math.max(textLimit.max, textLimit.count) - usedWithoutPaste, textLimit.text);
      if (!created.length) return;
      next = paste(created);
    }
    onBlocksChange(next);
    const ids = created.map(block => block.id);
    copiedRun.current = raw ? { document: next, ids, raw } : null;
    rootRef.current?.focus({ preventScroll: true });
    blockSelection.setIds(ids);
  }

  // A block selection has keyboard focus but no DOM range. Browsers may target the body.
  useEffect(() => {
    const previous = copiedRun.current;
    if (previous && (previous.ids !== selection.ids || !sameBlocks(previous.document, blocks))) copiedRun.current = null;
    const root = rootRef.current;
    if (isMarkdown || preview || !root) return;
    const doc = root.ownerDocument;
    const forward = (event: globalThis.ClipboardEvent) => {
      if (event.target !== doc.body || doc.activeElement !== root) return;
      if (event.type === "paste") handleRootPaste(event, root);
      else copySelection(event);
    };
    doc.addEventListener("copy", forward);
    doc.addEventListener("cut", forward);
    doc.addEventListener("paste", forward);
    return () => {
      doc.removeEventListener("copy", forward);
      doc.removeEventListener("cut", forward);
      doc.removeEventListener("paste", forward);
    };
  });
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
      if (restrictions && !restrictions.allowsBlock(type)) return;
      convertBlock(id, type, data);
      setFocusedBlock(id);
      scheduleBlockFocus(id, "end");
    },
    [convertBlock, setFocusedBlock, scheduleBlockFocus, restrictions],
  );

  const handleMove = useCallback((ids: readonly string[], target: DropTarget) => moveBlocks(ids, target.id, target.position), [moveBlocks]);
  const drag = useBlockDrag({ onMove: handleMove, selectedIds: selection.ids });

  /** Ctrl+Shift+arrows move the focused block, or the whole selection, one step. */
  function shiftFocusedOrSelected(direction: -1 | 1): boolean {
    const focused = focusedBlock ? [focusedBlock] : [];
    const ids = selection.ids.length > 0 ? selection.ids : focused;
    if (ids.length === 0) return false;
    const moved = shiftBlocks(ids, direction);
    if (moved && focusedBlock && selection.ids.length === 0) scheduleBlockFocus(focusedBlock, "end");
    return moved;
  }

  /** Ctrl+Z and Ctrl+Shift+Z (or Ctrl+Y) act on the document; the fields' own undo is replaced. */
  function handleRootKeyDownCapture(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (event.key.toLowerCase() === "a" && !event.shiftKey) {
      selectAllBlocks(event);
      return;
    }
    if (event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      // The bubbling handler reads Shift+arrows as a selection change; this is a move
      event.stopPropagation();
      shiftFocusedOrSelected(event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    const action = history ? historyAction(event) : null;
    if (action) {
      event.preventDefault();
      documentHistory[action]();
    }
  }

  function selectAllBlocks(event: KeyboardEvent) {
    // Once the field's text is all selected (or the field is empty), select all the blocks
    if (event.target !== event.currentTarget && !(event.target as HTMLElement).closest("[data-elea-block-id]")) return;
    if (selection.ids.length === 0 && !fieldFullySelected(event.target)) return;
    event.preventDefault();
    blockSelection.selectAll();
  }

  /** The selected blocks give way to one paragraph holding `text`, with the caret at its end. */
  function replaceSelectionWith(text: string) {
    const paragraph = copyBlock({ type: "paragraph", data: { ...registry.defaults("paragraph"), text } });
    const next = replaceSelection([paragraph]);
    if (textLimit && !textLimit.accepts(next)) return;
    onBlocksChange(next);
    blockSelection.clear();
    setFocusedBlock(paragraph.id);
    scheduleBlockFocus(paragraph.id, "end");
  }

  function handleRootKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target !== event.currentTarget && (!target.closest("[data-elea-block-id]") || target.closest("button,.elea-selection-bar"))) return;
    if (blockSelection.onKeyDown(event, focusedBlock)) return;
    if (target !== event.currentTarget || selection.ids.length === 0) return;
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
  }

  // The document bar follows the current rich text field, including a list.
  const activeFieldRef = useRef<RichTextFieldHandle | null>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS);
  const [hasActiveField, setHasActiveField] = useState(false);
  const [listCommand, setListCommand] = useState<(command: ListCommand) => void>();
  const handleActiveField = useCallback((handle: RichTextFieldHandle | null, formats: ActiveFormats, command?: (command: ListCommand) => void) => {
    setListCommand(() => command);
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
        id: position === 0 ? id : generateId(),
        type: block.type,
        data: registry.normalizeData(block.type, typeof block.data === "object" && block.data !== null ? (block.data as BlockData) : {}),
      }));
      const next = [...blocks.slice(0, index), ...replacements, ...blocks.slice(index + 1)];
      if (textLimit && !textLimit.accepts(next)) return;
      onBlocksChange(next);
      const target = replacements[Math.min(focus, replacements.length - 1)] as EleaBlock;
      setFocusedBlock(target.id);
      scheduleBlockFocus(target.id, position);
    },
    [blocks, registry, onBlocksChange, setFocusedBlock, scheduleBlockFocus, textLimit],
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
      if (restrictions && !restrictions.allowsBlock(type)) return;
      const id = addBlock(type, afterId, initialText);
      setFocusedBlock(id);
      scheduleBlockFocus(id);
    },
    [addBlock, setFocusedBlock, scheduleBlockFocus, restrictions],
  );
  function focusDocumentEnd() {
    const last = blocks.at(-1);
    if (last?.type === "paragraph") {
      setFocusedBlock(last.id);
      scheduleBlockFocus(last.id, "end");
    } else {
      handleAddBlock("paragraph");
    }
  }
  const lastFieldBlock = useRef<string | null>(null);
  if (hasActiveField && focusedBlock) lastFieldBlock.current = focusedBlock;
  /** A format control used while no field has focus: the field it left takes the command with its last selection, else the end of the document. */
  function activateField() {
    const id = lastFieldBlock.current;
    if (id && blocks.some(block => block.id === id)) setFocusedBlock(id);
    else focusDocumentEnd();
  }

  const handleBlockBlur = useCallback(
    (event?: FocusEvent) => {
      // Clicking a block's own actions or the document bar must not count as leaving it
      const target = event?.relatedTarget as HTMLElement | null | undefined;
      const controls = target?.closest?.(".elea-block-editor, .elea-doc-toolbar, .elea-add-block");
      const workspace = rootRef.current?.closest(".elea-editor-workspace") ?? rootRef.current;
      if (!controls || !workspace?.contains(controls)) setFocusedBlock(null);
    },
    [setFocusedBlock],
  );
  const handleAddBlockAfter = useCallback((id: string, type: string, initialText?: string) => handleAddBlock(type, id, initialText), [handleAddBlock]);
  const handleInsertBlocksAfter = useCallback(
    (id: string, pasted: BlockLike[], after: string) => {
      const trailing = after.trim() ? [{ type: "paragraph", data: { text: after } }] : [];
      const ids = insertBlocks([...(restrictions?.admit(pasted) ?? pasted), ...trailing], id);
      const last = ids.at(-1);
      if (last) {
        setFocusedBlock(last);
        scheduleBlockFocus(last);
      }
    },
    [insertBlocks, setFocusedBlock, scheduleBlockFocus, restrictions],
  );
  const handleSourceImage = useCallback((data: BlockData) => {
    insertBlocks([{ type: "image", data }]);
  }, [insertBlocks]);

  const classes = editorClasses(mode, width, className, blockSelection.dragging);
  const historyButtons = <HistoryButtons documentHistory={documentHistory} history={history} controls={historyControls} />;
  const insertBlock = (type: string) => {
    if (mode === "markdown") onModeChange?.("default");
    handleAddBlock(type, mode === "markdown" ? undefined : focusedBlock ?? undefined);
  };
  const documentToolbar = blockMode !== "default" && (
    <DocumentToolbar mode={mode} onAdd={insertBlock} types={blockTypes} hasActiveField={hasActiveField} onActivate={activateField} editorRef={activeFieldRef} activeFormats={activeFormats} listCommand={listCommand} history={historyButtons} modePicker={!!onModeChange} />
  );
  const selectionBar = !isMarkdown && selection.ids.length > 0 && selectionAnchor && (
    <SelectionBar
      anchor={selectionAnchor}
      count={selection.ids.length}
      extra={renderSelectionActions?.({ ids: selection.ids, blocks: selectedBlocks, clear: blockSelection.clear })}
      onCopy={() => void copyFromBar(false)}
      onCut={() => void copyFromBar(true)}
      onDelete={deleteSelection}
      onClear={blockSelection.clear}
    />
  );

  if (preview) return <preview.EditorPreview className={classes} blocks={blocks} title={title} summary={summary} titled={!!onTitleChange} summaryDisabled={summaryDisabled} />;

  const threshold = enableVirtualization ? virtualizationThreshold : Infinity;
  const onActiveField = blockMode === "default" ? undefined : handleActiveField;
  const blockArea = (
    <div ref={blocksRef} className="elea-content-editor__blocks">
      {source ? (
        <source.MarkdownEditor blocks={blocks} draft={markdownDraft} onDraftChange={setMarkdownDraft} onBlocksChange={onBlocksChange} onAddImage={handleSourceImage} context={context} />
      ) : (
        <VirtualizedBlockList
          blocks={blocks}
          focusedBlock={focusedBlock}
          selectedIds={selection.ids}
          onBlockFocus={setFocusedBlock}
          onBlockBlur={handleBlockBlur}
          onBlockUpdate={updateBlock}
          onBlockRemove={removeBlock}
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
          threshold={threshold}
          mode={blockMode}
          onActiveField={onActiveField}
        />
      )}
    </div>
  );

  const rootHandlers = isMarkdown ? {} : {
    onMouseDown: (event: MouseEvent) => blockSelection.onMouseDown(event, focusedBlock),
    onDragStart: handleRootDragStart,
    onKeyDownCapture: handleRootKeyDownCapture,
    onKeyDown: handleRootKeyDown,
    onCopy: copySelection,
    onCut: copySelection,
    onPasteCapture: (event: ClipboardEvent) => handleRootPaste(event, event.target as HTMLElement),
  };
  const addModes: EditorMode[] = onModeChange ? ["default", "markdown"] : ["default"];

  const editor = (
    <div
      ref={rootRef}
      className={classes}
      tabIndex={-1}
      aria-busy={sourceWaiting || previewWaiting || undefined}
      onFocus={(event) => {
        if (selection.ids.length && event.target !== event.currentTarget && !event.target.closest(".elea-selection-bar")) clearSelection();
      }}
      {...rootHandlers}
    >
      {mode === "toolbar" && documentToolbar}
      {selectionBar}
      <TitleFields title={title} summary={summary} onTitleChange={onTitleChange} onSummaryChange={onSummaryChange} summaryDisabled={summaryDisabled} titleRef={titleRef} summaryRef={summaryRef} />
      <TextLimitContext.Provider value={textLimit}>
        {mode === "classic" ? <ClassicShell toolbar={documentToolbar} empty={!blocks.length} onEnd={focusDocumentEnd}>{blockArea}</ClassicShell> : blockArea}
      </TextLimitContext.Provider>
      {textLimit && <output id={textLimit.counterId} className="elea-field__counter" aria-live="polite" aria-atomic="true">
        {formatMessage(messages.editor.characterCount ?? en.editor.characterCount, { count: textLimit.count, max: textLimit.max })}
      </output>}
      {addModes.includes(mode) && (
        <div className="elea-content-editor__add">
          <AddBlockButton onAdd={onModeChange ? insertBlock : handleAddBlock} types={blockTypes} />
        </div>
      )}
    </div>
  );

  const restrictedEditor = <RestrictionsContext.Provider value={restrictions}>{editor}</RestrictionsContext.Provider>;
  if (!onModeChange) return restrictedEditor;
  return (
    <div className="elea-editor-workspace">
      <div className="elea-content-editor__mode">
        <AddBlockButton
          mode={mode}
          onModeChange={(next) => { clearSelection(); onModeChange(next); }}
        />
        {historyButtons}
      </div>
      {restrictedEditor}
    </div>
  );
});
