"use client";

import { en, formatMessage } from "@alien6-studio/elea-content";
import { IconButton } from "@alien6-studio/elea-ui";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AddBlockButton } from "./AddBlockButton.js";
import type { EditorMode } from "./ContentEditor.js";
import { CopyIcon, RedoIcon, ScissorsIcon, TrashIcon, UndoIcon } from "./icons.js";
import type { ListCommand } from "./listCommands.js";
import { QuickAddButtons } from "./QuickAddButtons.js";
import { useContentServices } from "./provider.js";
import type { ActiveFormats, RichTextFieldHandle } from "./RichTextField.js";
import { Toolbar } from "./Toolbar.js";
import { resizeTextarea } from "./hooks/useTextareaResize.js";
import type { DocumentHistory } from "./hooks/useDocumentHistory.js";

interface HistoryButtonsProps {
  documentHistory: DocumentHistory;
  history: boolean | "keyboard";
  controls: ReactNode;
}

export function HistoryButtons({ documentHistory, history, controls }: Readonly<HistoryButtonsProps>) {
  const { messages } = useContentServices();
  if (controls == null && history !== true) return null;
  return (
    <div className="elea-doc-toolbar__group elea-doc-toolbar__group--history">
      {controls ?? <>
        <IconButton variant="disc" label={messages.actions.undo} title={documentHistory.canUndo ? undefined : messages.editor.undoUnavailable ?? en.editor.undoUnavailable} onClick={documentHistory.undo} disabled={!documentHistory.canUndo}><UndoIcon /></IconButton>
        <IconButton variant="disc" label={messages.actions.redo} title={documentHistory.canRedo ? undefined : messages.editor.redoUnavailable ?? en.editor.redoUnavailable} onClick={documentHistory.redo} disabled={!documentHistory.canRedo}><RedoIcon /></IconButton>
      </>}
    </div>
  );
}

interface DocumentToolbarProps {
  mode: EditorMode;
  onAdd: (type: string) => void;
  types: readonly string[] | undefined;
  hasActiveField: boolean;
  /** Gives the document focus when a format control is used while no field has it. */
  onActivate: () => void;
  editorRef: RefObject<RichTextFieldHandle | null>;
  activeFormats: ActiveFormats;
  listCommand: ((command: ListCommand) => void) | undefined;
  /** Shown at the end of the bar, unless the mode picker carries it. */
  history: ReactNode;
  modePicker: boolean;
}

/** How long a command waits for the field it gave focus to; past it, a later focus must not trigger it. */
const PENDING_COMMAND_MS = 1000;

export function DocumentToolbar({ mode, onAdd, types, hasActiveField, onActivate, editorRef, activeFormats, listCommand, history, modePicker }: Readonly<DocumentToolbarProps>) {
  const { messages } = useContentServices();
  const pending = useRef<{ run: (field: RichTextFieldHandle) => void; at: number } | null>(null);
  const activate = useRef(onActivate);
  activate.current = onActivate;
  // The bar never goes inert: without a focused field, a control gives the document focus, then applies
  const fieldRef = useMemo<RefObject<RichTextFieldHandle>>(() => {
    const send = (run: (field: RichTextFieldHandle) => void) => {
      if (editorRef.current) return run(editorRef.current);
      pending.current = { run, at: Date.now() };
      activate.current();
    };
    return { current: {
      applyInlineFormat: tag => send(field => field.applyInlineFormat(tag)),
      applyListFormat: tag => send(field => field.applyListFormat(tag)),
      applyBlockFormat: (tag, wholeParagraph) => send(field => field.applyBlockFormat(tag, wholeParagraph)),
      openLinkInput: () => send(field => field.openLinkInput()),
      clearFormat: () => send(field => field.clearFormat()),
    } };
  }, [editorRef]);
  useEffect(() => {
    const waiting = pending.current;
    if (!hasActiveField || !waiting) return;
    pending.current = null;
    if (Date.now() - waiting.at < PENDING_COMMAND_MS && editorRef.current) waiting.run(editorRef.current);
  }, [hasActiveField, editorRef]);
  return (
    <div className="elea-doc-toolbar">
      <div className="elea-doc-toolbar__group" role="group" aria-label={messages.actions.insert}>
        {mode === "toolbar" ? <>
          <span className="elea-doc-toolbar__label" aria-hidden="true">{messages.actions.insert}</span>
          <QuickAddButtons row onAdd={onAdd} types={types} />
        </> : <AddBlockButton onAdd={onAdd} types={types} />}
      </div>
      <div className="elea-doc-toolbar__group">
        <Toolbar editorRef={fieldRef} activeFormats={activeFormats} compactHeadings={mode === "classic"} inline={!!listCommand} onListCommand={listCommand} />
      </div>
      {!modePicker && history}
    </div>
  );
}

interface SelectionBarProps {
  anchor: Element;
  count: number;
  extra: ReactNode;
  onCopy: () => void;
  onCut: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function SelectionBar({ anchor, count, extra, onCopy, onCut, onDelete, onClear }: Readonly<SelectionBarProps>) {
  const { messages } = useContentServices();
  const label = count === 1 ? messages.selection.one : formatMessage(messages.selection.count, { count });
  return createPortal(
    <div className="elea-toolbar elea-selection-bar" role="toolbar" aria-label={label}>
      <span className="elea-selection-bar__count">{label}</span>
      <button type="button" className="elea-toolbar__button" onClick={onCopy} aria-label={messages.selection.copy} title={messages.selection.copy}>
        <CopyIcon />
      </button>
      <button type="button" className="elea-toolbar__button" onClick={onCut} aria-label={messages.selection.cut} title={messages.selection.cut}>
        <ScissorsIcon />
      </button>
      <button type="button" className="elea-toolbar__button" onClick={onDelete} aria-label={messages.selection.delete} title={messages.selection.delete}>
        <TrashIcon />
      </button>
      {extra}
      <button type="button" className="elea-editor-button elea-editor-button--link" onClick={onClear}>{messages.selection.clear}</button>
    </div>,
    anchor,
  );
}

interface TitleFieldsProps {
  title: string;
  summary: string;
  onTitleChange: ((title: string) => void) | undefined;
  onSummaryChange: ((summary: string) => void) | undefined;
  summaryDisabled: boolean;
  titleRef: RefObject<HTMLTextAreaElement | null>;
  summaryRef: RefObject<HTMLTextAreaElement | null>;
}

export function TitleFields({ title, summary, onTitleChange, onSummaryChange, summaryDisabled, titleRef, summaryRef }: Readonly<TitleFieldsProps>) {
  const { messages } = useContentServices();
  return (
    <>
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
    </>
  );
}

interface ClassicShellProps {
  toolbar: ReactNode;
  empty: boolean;
  onEnd: () => void;
  children: ReactNode;
}

export function ClassicShell({ toolbar, empty, onEnd, children }: Readonly<ClassicShellProps>) {
  const { messages } = useContentServices();
  return (
    <div className="elea-classic-editor">
      {toolbar}
      <div className="elea-classic-editor__canvas">
        {children}
        <button type="button" className="elea-classic-editor__end" aria-label={messages.editor.startWriting} onClick={onEnd}>
          {empty && messages.editor.startWriting}
        </button>
      </div>
    </div>
  );
}
