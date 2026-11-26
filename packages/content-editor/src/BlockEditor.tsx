"use client";

import { useTextLimitAttributes } from "./editorTextLimit.js";

import { asListMarker, asListStyle, htmlToText, listStyleForMarker, type BlockData, type BlockLike, type EleaBlock, type HeaderData, type ListData, type ListItem, type QuoteData } from "@alien6-studio/elea-content";
import { memo, useCallback, useEffect, useImperativeHandle, useRef, useState, type ComponentType, type FocusEvent, type SyntheticEvent, type KeyboardEvent, type RefObject } from "react";
import { htmlToItems, htmlToList, itemsToHtml, sameItems } from "./listHtml.js";
import { caretOnEdgeLine, editableHtml } from "./caret.js";
import { applyListCommand, toggleTask, topLevelListItems, type ListCommand } from "./listCommands.js";
import { Select, useSurfaceScope } from "@alien6-studio/elea-ui";
import { AttachesBlock } from "@alien6-studio/elea-content-viewer";
import { AttachmentBlock } from "./blocks/AttachmentBlock.js";
import { ImageBlock, type MediaBlockProps } from "./blocks/ImageBlock.js";
import { VideoBlock } from "./blocks/VideoBlock.js";
import { AddBlockButton } from "./AddBlockButton.js";
import { blockTypeIcons, GripIcon, HeadingIcon, ListIcon, PilcrowIcon, QuoteIcon, TrashIcon } from "./icons.js";
import { useContentServices, type EditorContextInfo } from "./provider.js";
import { EMPTY_FORMATS, RichTextField, type ActiveFormats, type RichTextFieldHandle, type SelectionInfo } from "./RichTextField.js";
import { createPortal } from "react-dom";
import { SLASH_MENU_KEYS, SlashMenu, type SlashMenuHandle } from "./SlashMenu.js";
import { Toolbar } from "./Toolbar.js";

export type BlockEditorComponent = ComponentType<MediaBlockProps>;
export type BlockEditorMap = Readonly<Record<string, BlockEditorComponent>>;

export interface BlockEditorProps {
  block: EleaBlock;
  isFocused: boolean;
  /** Part of a multi-block selection. */
  isSelected?: boolean | undefined;
  onFocus: () => void;
  onBlur: (event?: FocusEvent) => void;
  onUpdate: (data: BlockData) => void;
  onRemove: () => void;
  /** A new block of a type goes right after this one, with text carried over from a split. */
  onAddBlockAfter?: ((type: string, initialText?: string) => void) | undefined;
  /** Pasted blocks go right after this one, then a paragraph with the text that followed the caret. */
  onInsertBlocksAfter?: ((blocks: BlockLike[], after: string) => void) | undefined;
  /** The caret leaves this block upwards or downwards. */
  onNavigate?: ((direction: "up" | "down") => void) | undefined;
  /** Backspace at the start of this block: its text (if any) joins the previous block. */
  onMergeBackward?: ((html: string) => void) | undefined;
  /** Delete at the end of this block: the next block joins it. */
  onMergeForward?: (() => void) | undefined;
  /** This block becomes another type (typing shortcut, slash menu), with the given data. */
  onConvert?: ((type: string, data?: Record<string, unknown>) => void) | undefined;
  /** This block gives way to several, the one at `focus` taking the caret at its start or end. */
  onReplaceWith?: ((blocks: BlockLike[], focus: number, position?: "start" | "end") => void) | undefined;
  /** Block types offered by the slash menu. */
  blockTypes?: readonly string[] | undefined;
  /** Props of the drag grip; absent means the block cannot be dragged. */
  dragHandleProps?: React.HTMLAttributes<HTMLElement> | undefined;
  context?: EditorContextInfo | undefined;
  /** Editing components by block type, for custom blocks; built-in types have their own. */
  editors?: BlockEditorMap | undefined;
  /** `default`: margin controls and a floating bar; `toolbar`: a fixed bar above the document too; `classic`: the fixed bar only, nothing around the block. */
  mode?: "default" | "toolbar" | "classic" | undefined;
  /** Reports the focused rich text field and its commands to the document toolbar. */
  onActiveField?: ((handle: RichTextFieldHandle | null, formats: ActiveFormats, listCommand?: (command: ListCommand) => void) => void) | undefined;
}

const NO_CONTEXT: EditorContextInfo = {};

const resize = (event: SyntheticEvent<HTMLTextAreaElement>) => {
  const target = event.currentTarget;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
};

/** Arrow keys with no line to go to hand the caret to the neighbouring block, as Medium does. */
function fieldNavigation(event: KeyboardEvent<HTMLTextAreaElement>, onNavigate: BlockEditorProps["onNavigate"], onMergeBackward: BlockEditorProps["onMergeBackward"]) {
  const field = event.currentTarget;
  if (event.key === "ArrowUp" && !event.shiftKey && onNavigate && caretOnEdgeLine(field, -1)) { event.preventDefault(); onNavigate("up"); }
  if (event.key === "ArrowDown" && !event.shiftKey && onNavigate && caretOnEdgeLine(field, 1)) { event.preventDefault(); onNavigate("down"); }
  if (event.key === "Backspace" && field.value === "" && onMergeBackward) { event.preventDefault(); onMergeBackward(""); }
}

/** A heading: one line of rich text, which Enter splits. */
function HeaderEditor({ block, onUpdate, onFocus, onBlur, onAddBlockAfter, onNavigate, onMergeBackward, fieldRef, onSelectionChange }: Readonly<HeaderEditorProps>) {
  const { messages } = useContentServices();
  const data = block.data as HeaderData;
  const level = data.level ?? 2;
  return (
    <div className={`elea-header-editor elea-header-editor--${level}`}>
      <RichTextField
        ref={fieldRef}
        singleLine
        className="elea-header-editor__text"
        placeholder={messages.editor.headerPlaceholder}
        value={data.text ?? ""}
        onChange={(text) => onUpdate({ ...data, text })}
        onFocus={onFocus}
        onBlur={onBlur}
        onNavigate={onNavigate}
        onMergeBackward={data.text ? undefined : onMergeBackward}
        onEnter={(_before, after) => onAddBlockAfter?.("paragraph", after)}
        onSelectionChange={onSelectionChange}
      />
      <Select
        className="elea-header-editor__level"
        size="sm"
        label={messages.blockTypes.header}
        value={String(level)}
        onChange={(next) => onUpdate({ ...data, level: Number.parseInt(next, 10) })}
        options={[1, 2, 3, 4, 5, 6].map((value) => ({ value: String(value), label: `H${value}` }))}
      />
    </div>
  );
}

/** The caret sits at the very start of an element: nothing but empty text before it. */
function caretAtStartOf(element: HTMLElement): boolean {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return false;
  const before = document.createRange();
  before.selectNodeContents(element);
  before.setEnd(range.startContainer, range.startOffset);
  return before.toString() === "";
}

/** The list item holding the caret, inside the field. */
function caretItem(field: HTMLElement | null): HTMLLIElement | null {
  const selection = globalThis.getSelection();
  const node = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).startContainer : null;
  const element = node?.nodeType === 1 ? (node as Element) : (node?.parentElement ?? null);
  const item = element?.closest("li") ?? null;
  return item && field?.contains(item) ? item : null;
}

const isEmptyItem = (item: HTMLLIElement) => item.textContent?.trim() === "" && !item.querySelector("ul, ol");

function placeCaret(node: Node, offset: number) {
  const selection = globalThis.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Tells the field its markup changed under the hood, so it emits the new value. */
const notifyInput = (field: HTMLElement) => field.dispatchEvent(new (field.ownerDocument.defaultView ?? globalThis).Event("input", { bubbles: true }));

interface ListEditorProps extends Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onNavigate" | "onMergeForward" | "onAddBlockAfter" | "onConvert" | "onReplaceWith"> {
  fieldRef: RefObject<RichTextFieldHandle | null>;
  commandRef: RefObject<((command: ListCommand) => void) | null>;
  onSelectionChange: (formats: ActiveFormats, info: SelectionInfo) => void;
}

/**
 * The whole list in one rich text field, as a writing tool offers it: text selects across items,
 * marks and links apply, Enter adds an item, Enter on an empty one leaves the list, Backspace at
 * the start of an item joins it to the previous one, Tab and Shift+Tab nest and unnest. In a
 * checklist, a press on the box of a task or Ctrl/Cmd+Enter ticks it.
 */
function ListEditor({ block, onUpdate, onFocus, onBlur, onNavigate, onMergeForward, onAddBlockAfter, onConvert, onReplaceWith, fieldRef, commandRef, onSelectionChange }: Readonly<ListEditorProps>) {
  const { messages } = useContentServices();
  const data = block.data as ListData;
  const stated = asListStyle(data.style);
  const marker = stated === "checklist" ? undefined : asListMarker(data.marker);
  const style = listStyleForMarker(marker, stated);
  const items: ListItem[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [""];
  const [html, setHtml] = useState(() => itemsToHtml(items, style, marker));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const field = () => wrapperRef.current?.querySelector<HTMLElement>("[contenteditable='true']") ?? null;
  const runCommand = (command: ListCommand) => {
    const editable = field();
    if (!editable) return false;
    const result = applyListCommand(editable, command, onReplaceWith ? block.type : undefined);
    if (typeof result === "object") {
      onReplaceWith?.(result.blocks, result.focus, "end");
      return true;
    }
    if (result) notifyInput(editable);
    return result;
  };
  useImperativeHandle(commandRef, () => runCommand);

  // The field owns its markup while people type; items that change elsewhere (undo, the block
  // menu, a paste) rewrite it
  useEffect(() => {
    const current = htmlToList(html);
    if (current.style === style && current.marker === marker && sameItems(current.items, items)) return;
    setHtml(itemsToHtml(items, style, marker));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, style, marker]);

  const change = (next: string) => {
    setHtml(next);
    const parsed = htmlToList(next);
    if (parsed.items.length === 0) return;
    if (parsed.style !== style || parsed.marker !== marker || !sameItems(parsed.items, items)) {
      const updated = { ...data, ...parsed };
      if (!parsed.marker) delete updated.marker;
      onUpdate(updated);
    }
  };

  // A press on the box of a task, which sits in the padding of its item, ticks it
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const press = (event: MouseEvent) => {
      const editable = field();
      const target = event.target as Element | null;
      const item = target?.tagName === "LI" ? target : null;
      if (!editable || !item || event.button !== 0) return;
      const box = Number.parseFloat(getComputedStyle(item).paddingLeft) || 0;
      if (event.clientX - item.getBoundingClientRect().left >= box || !toggleTask(editable, item)) return;
      event.preventDefault();
      notifyInput(editable);
    };
    wrapper.addEventListener("mousedown", press);
    return () => wrapper.removeEventListener("mousedown", press);
  }, []);

  const currentItems = () => {
    const editable = field();
    return htmlToItems(editable ? editableHtml(editable) : html);
  };

  const leaveEmptyItem = (item: HTMLLIElement) => {
    if (!isEmptyItem(item)) return false;
    const selection = item.ownerDocument.getSelection();
    if (selection && !selection.isCollapsed) selection.collapseToStart();
    if (runCommand("outdent")) return true;
    const current = currentItems();
    if (current.length === 1) onConvert?.("paragraph");
    else if (!item.nextElementSibling && item.parentElement === field()?.firstElementChild) {
      onUpdate({ ...data, items: current.slice(0, -1) });
      onAddBlockAfter?.("paragraph");
    }
    return true;
  };

  /** Backspace at the start of an item: nested, it goes up a level; first, it leaves the list; else it joins the one before. */
  const backspace = (editable: HTMLElement, item: HTMLLIElement) => {
    if (item.parentElement !== editable.firstElementChild) runCommand("outdent");
    else if (topLevelListItems(editable)[0] !== item) {
      joinWithPrevious(item);
      notifyInput(editable);
    } else if (!runCommand("outdent") && currentItems().length === 1) onConvert?.("paragraph");
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const editable = field();
    if (!editable || !editable.contains(event.target as Node) || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      runCommand(event.shiftKey ? "outdent" : "indent");
      return;
    }
    const item = caretItem(editable);
    if (!item) return;
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      if (!toggleTask(editable, item)) return;
      event.preventDefault();
      event.stopPropagation();
      notifyInput(editable);
      return;
    }
    if (event.key === "Backspace" && !event.shiftKey && !event.ctrlKey && !event.metaKey && caretAtStartOf(item)) {
      event.preventDefault();
      event.stopPropagation();
      backspace(editable, item);
    }
  };

  return (
    <div className="elea-list-editor" ref={wrapperRef} onKeyDownCapture={keyDown}>
      <RichTextField
        onListItemReturn={leaveEmptyItem}
        ref={fieldRef}
        className="elea-list-editor__field"
        value={html}
        onChange={change}
        onFocus={onFocus}
        onBlur={onBlur}
        onNavigate={onNavigate}
        onMergeForward={onMergeForward}
        onSelectionChange={onSelectionChange}
        placeholder={messages.editor.listItemPlaceholder}
      />
    </div>
  );
}

/** The item's content joins the end of the previous item's text; its children follow as the previous item's. */
function joinWithPrevious(item: HTMLLIElement) {
  const previous = item.previousElementSibling as HTMLLIElement | null;
  if (!previous) return;
  const previousSublist = [...previous.children].find((child) => child.tagName === "UL" || child.tagName === "OL") ?? null;
  const ownSublist = [...item.children].find((child) => child.tagName === "UL" || child.tagName === "OL") ?? null;
  if (ownSublist) ownSublist.remove();
  // The junction: a text node so the caret can sit between the two contents
  const junction = document.createTextNode("");
  previous.insertBefore(junction, previousSublist);
  const trailingBreak = previous.lastChild?.nodeName === "BR" ? previous.lastChild : null;
  trailingBreak?.remove();
  while (item.firstChild) previous.insertBefore(item.firstChild, previousSublist);
  if (ownSublist) {
    if (previousSublist) { while (ownSublist.firstChild) previousSublist.appendChild(ownSublist.firstChild); } else previous.appendChild(ownSublist);
  }
  item.remove();
  placeCaret(junction, 0);
}

/** Multi-line code, kept verbatim: Enter inserts a line, the arrows leave the block at its edges. */
function CodeEditor({ block, onUpdate, onFocus, onBlur, onNavigate, onMergeBackward }: Readonly<Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onNavigate" | "onMergeBackward">>) {
  const { messages } = useContentServices();
  const code = typeof block.data.code === "string" ? block.data.code : "";
  const lengthAttributes = useTextLimitAttributes(code);
  return (
    <div className="elea-code">
      <textarea
        {...lengthAttributes}
        className="elea-textarea elea-code-editor"
        placeholder={messages.editor.codePlaceholder}
        aria-label={messages.editor.codePlaceholder}
        value={code}
        rows={2}
        spellCheck={false}
        onChange={(event) => onUpdate({ ...block.data, code: event.target.value })}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={resize}
        onKeyDown={(event) => fieldNavigation(event, onNavigate, onMergeBackward)}
      />
    </div>
  );
}

/** A block the editor has no form for: its content stays as it is and is shown as text. */
function KeptBlock({ block, label }: Readonly<{ block: EleaBlock; label: string }>) {
  const { messages, registry } = useContentServices();
  const TypeIcon = blockTypeIcons[block.type];
  const text = registry.toText(block).trim();
  return (
    <div className="elea-kept-block" role="group" aria-label={label} title={messages.editor.keptBlock}>
      <span className="elea-kept-block__type">{TypeIcon ? <TypeIcon /> : null}{label}</span>
      {text && <p className="elea-kept-block__text">{text.length > 240 ? `${text.slice(0, 240)}\u2026` : text}</p>}
    </div>
  );
}

type HeaderEditorProps = Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onNavigate" | "onMergeBackward" | "onAddBlockAfter"> &
  Pick<ListEditorProps, "fieldRef" | "onSelectionChange">;
type QuoteEditorProps = HeaderEditorProps & { onBodyFocus: (active: boolean) => void };

function QuoteEditor({ block, onUpdate, onFocus, onBlur, onNavigate, onMergeBackward, onAddBlockAfter, fieldRef, onSelectionChange, onBodyFocus }: QuoteEditorProps) {
  const { messages } = useContentServices();
  const data = block.data as QuoteData;
  const captionAttributes = useTextLimitAttributes(data.caption ?? "");
  return (
    <div className="elea-quote-editor">
      <RichTextField
        ref={fieldRef}
        className="elea-quote-editor__text"
        placeholder={messages.editor.quotePlaceholder}
        value={data.text ?? ""}
        onChange={(text) => onUpdate({ ...data, text })}
        onFocus={() => { onBodyFocus(true); onFocus(); }}
        onBlur={onBlur}
        onNavigate={onNavigate}
        onMergeBackward={data.text ? undefined : onMergeBackward}
        onEnter={(_before, after) => onAddBlockAfter?.("paragraph", after)}
        onSelectionChange={onSelectionChange}
      />
      <input
        type="text"
        {...captionAttributes}
        className="elea-input elea-quote-editor__caption"
        placeholder={messages.editor.quoteAuthorPlaceholder}
        aria-label={messages.editor.quoteAuthorPlaceholder}
        value={data.caption ?? ""}
        onFocus={() => { onBodyFocus(false); onFocus(); }}
        onBlur={onBlur}
        onChange={(event) => onUpdate({ ...data, caption: event.target.value })}
      />
    </div>
  );
}

interface BlockShape {
  id: string;
  type: string;
  label: string;
  icon: React.JSX.Element;
  data: Record<string, unknown>;
  /** The block already has this shape. */
  current: boolean;
}

/** The menu in the margin: the shapes a text block can take, and the deletion of any block. */
function BlockMenu({ block, onUpdate, onConvert, onRemove }: Readonly<Pick<BlockEditorProps, "block" | "onUpdate" | "onConvert" | "onRemove">>) {
  const { messages } = useContentServices();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const shapes: BlockShape[] = open && onConvert && ["paragraph", "header", "list", "quote"].includes(block.type)
    ? [
        { id: "paragraph", type: "paragraph", label: messages.blockTypes.paragraph, icon: <PilcrowIcon />, data: {}, current: block.type === "paragraph" },
        ...([1, 2, 3, 4] as const).map(level => ({ id: `h${level}`, type: "header", label: messages.toolbar[`h${level}`], icon: <HeadingIcon />, data: { level }, current: block.type === "header" && (block.data.level ?? 2) === level })),
        { id: "ul", type: "list", label: messages.toolbar.bulletList, icon: <ListIcon />, data: { style: "unordered" }, current: block.type === "list" && block.data.style !== "ordered" },
        { id: "ol", type: "list", label: messages.toolbar.orderedList, icon: <ListIcon />, data: { style: "ordered" }, current: block.type === "list" && block.data.style === "ordered" },
        { id: "quote", type: "quote", label: messages.blockTypes.quote, icon: <QuoteIcon />, data: {}, current: block.type === "quote" },
      ]
    : [];
  const pick = (shape: BlockShape) => {
    setOpen(false);
    if (shape.current) return;
    // The same type keeps its content and only changes shape; another type converts it
    if (shape.type === block.type) {
      const data = { ...block.data, ...shape.data };
      if (shape.type === "list") delete data.marker;
      onUpdate(data);
    } else onConvert?.(shape.type, shape.data);
  };
  const Icon = blockTypeIcons[block.type] ?? PilcrowIcon;
  return (
    <div className="elea-block-menu" ref={rootRef}>
      <button
        type="button"
        className="elea-icon-button elea-block-menu__trigger"
        aria-label={messages.actions.blockMenu}
        title={messages.actions.blockMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      >
        <Icon />
      </button>
      {open && (
        <div role="menu" aria-label={messages.actions.blockMenu} className="elea-block-menu__list" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
          {shapes.map((shape) => (
            <button key={shape.id} type="button" role="menuitemradio" aria-checked={shape.current} className={`elea-block-menu__item${shape.current ? " elea-block-menu__item--current" : ""}`} onClick={() => pick(shape)}>
              {shape.icon}
              <span>{shape.label}</span>
            </button>
          ))}
          {shapes.length > 0 && <span className="elea-block-menu__separator" />}
          <button type="button" role="menuitem" className="elea-block-menu__item elea-block-menu__item--danger" onClick={() => { setOpen(false); onRemove(); }}>
            <TrashIcon />
            <span>{messages.actions.deleteBlock}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/** One block with its delete button, type indicator, toolbar when it is a focused paragraph, and editing field. */
export const BlockEditor = memo(function BlockEditor({ block, isFocused, isSelected = false, onFocus, onBlur, onUpdate, onRemove, onAddBlockAfter, onInsertBlocksAfter, onNavigate, onMergeBackward, onMergeForward, onConvert, onReplaceWith, blockTypes, dragHandleProps, context = NO_CONTEXT, editors, mode = "default", onActiveField }: BlockEditorProps) {
  const services = useContentServices();
  const { messages } = services;
  const richTextRef = useRef<RichTextFieldHandle>(null);
  const listCommandRef = useRef<((command: ListCommand) => void) | null>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS);
  const [quoteBodyFocused, setQuoteBodyFocused] = useState(false);
  // The toolbar floats above a text selection and leaves when the caret collapses
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo>({ collapsed: true, rect: null });
  const [slash, setSlash] = useState<{ query: string; rect: DOMRect | null } | null>(null);
  const slashRef = useRef<SlashMenuHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const handleSelectionChange = useCallback((formats: ActiveFormats, info: SelectionInfo) => {
    setActiveFormats(formats);
    setSelectionInfo(info);
  }, []);
  const handleSlash = useCallback((query: string | null, rect: DOMRect | null) => setSlash(query === null ? null : { query, rect }), []);
  const pickFromSlash = useCallback(
    (type: string) => {
      setSlash(null);
      // The slash and its filter text are not content: the block is emptied before it changes type
      onUpdate({ ...block.data, text: "" });
      onConvert?.(type);
    },
    [onConvert, onUpdate, block.data],
  );
  useEffect(() => {
    if (!isFocused) {
      setSlash(null);
      setSelectionInfo({ collapsed: true, rect: null });
    }
  }, [isFocused]);
  const classic = mode === "classic";
  const list = block.type === "list" || block.type === "nestedlist";
  // A heading takes the floating bar in every mode
  const heading = block.type === "header";
  const showBubble = (heading || (mode === "default" && (block.type === "paragraph" || list))) && isFocused && !selectionInfo.collapsed;
  const [observeCard, bubbleScope] = useSurfaceScope(showBubble);
  const setCardRef = useCallback((card: HTMLDivElement | null) => {
    cardRef.current = card;
    observeCard(card);
  }, [observeCard]);
  const reportsField = isFocused && (block.type === "paragraph" || (mode !== "default" && (list || (block.type === "quote" && quoteBodyFocused))));
  const applyListCommand = useCallback((command: ListCommand) => listCommandRef.current?.(command), []);
  // Release the previous field before any block reports its newly focused field.
  useEffect(() => {
    if (reportsField && onActiveField) return () => onActiveField(null, EMPTY_FORMATS);
  }, [reportsField, onActiveField]);
  useEffect(() => {
    if (reportsField) onActiveField?.(richTextRef.current, activeFormats, list ? applyListCommand : undefined);
  }, [reportsField, onActiveField, activeFormats, list, applyListCommand]);
  const labels = messages.blockTypes as Record<string, string | undefined>;
  const typeLabel = labels[block.type] ?? block.type;

  const showAddButton = mode === "default" && isFocused && block.type === "paragraph" && htmlToText(typeof block.data.text === "string" ? block.data.text : "").trim() === "";

  const renderEditor = () => {
    const Custom = editors?.[block.type];
    if (Custom) return <Custom block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
    switch (block.type) {
      case "header":
        return <HeaderEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onAddBlockAfter={onAddBlockAfter} onNavigate={onNavigate} onMergeBackward={onMergeBackward} fieldRef={richTextRef} onSelectionChange={handleSelectionChange} />;
      case "list":
      case "nestedlist":
        return <ListEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onNavigate={onNavigate} onMergeForward={onMergeForward} onAddBlockAfter={onAddBlockAfter} onConvert={onConvert} onReplaceWith={onReplaceWith} fieldRef={richTextRef} commandRef={listCommandRef} onSelectionChange={handleSelectionChange} />;
      case "quote":
        return <QuoteEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onNavigate={onNavigate} onMergeBackward={onMergeBackward} onAddBlockAfter={onAddBlockAfter} fieldRef={richTextRef} onSelectionChange={handleSelectionChange} onBodyFocus={setQuoteBodyFocused} />;
      case "image":
        return <ImageBlock block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
      case "video":
        return <VideoBlock block={block} onUpdate={onUpdate} onFocus={onFocus} />;
      case "attachment":
        return <AttachmentBlock block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
      case "attaches":
        return <AttachesBlock block={block} context={services} />;
      case "code":
        return <CodeEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onNavigate={onNavigate} onMergeBackward={onMergeBackward} />;
      case "delimiter":
        return <hr className="elea-delimiter-editor" aria-label={typeLabel} />;
      default:
        // Rich text needs a text field; the other EditorJS shapes (table, raw, embed) keep their data
        if (block.type !== "paragraph" && typeof block.data.text !== "string") return <KeptBlock block={block} label={typeLabel} />;
        return (
          <RichTextField
            ref={richTextRef}
            value={typeof block.data.text === "string" ? block.data.text : ""}
            onChange={(text) => onUpdate({ ...block.data, text })}
            onFocus={onFocus}
            onBlur={onBlur}
            onEnter={(_before, after) => onAddBlockAfter?.("paragraph", after)}
            onInsertBlocks={onInsertBlocksAfter}
            onNavigate={onNavigate}
            onMergeBackward={onMergeBackward}
            onMergeForward={onMergeForward}
            onConvert={onConvert}
            onSlash={handleSlash}
            onSelectionChange={handleSelectionChange}
            placeholder={messages.editor.startWriting}
          />
        );
    }
  };

  return (
    <div className={`elea-block-editor elea-block-editor--${block.type} elea-block-editor--${mode}${isFocused ? " elea-block-editor--focused" : ""}${isSelected ? " elea-block-editor--selected" : ""}`} data-elea-block-id={block.id} data-elea-block-type={block.type} aria-selected={isSelected || undefined}>
      {!classic && (
        <div className="elea-block-editor__gutter">
          {showAddButton && onConvert && (
            <AddBlockButton types={blockTypes} onAdd={onConvert} />
          )}
          <BlockMenu block={block} onUpdate={onUpdate} onConvert={onConvert} onRemove={onRemove} />
          {dragHandleProps && (
            <span className="elea-icon-button elea-block-editor__grip" title={`${typeLabel} \u00b7 ${messages.actions.moveBlock}`} {...dragHandleProps}>
              <GripIcon />
              <span className="elea-visually-hidden">{messages.actions.moveBlock}</span>
            </span>
          )}
        </div>
      )}
      <div
        ref={setCardRef}
        className="elea-block-editor__card"
        onKeyDownCapture={(event) => {
          // While the slash menu is open, its keys never reach the field
          if (slash && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229 && SLASH_MENU_KEYS.has(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            slashRef.current?.handleKey(event.key);
          }
        }}
      >
        {showBubble && typeof document !== "undefined" && createPortal(
          <div className="elea-bubble" {...bubbleScope} style={{ position: "fixed", top: Math.max(8, (selectionInfo.rect?.top ?? 8) - 48), left: selectionInfo.rect?.left ?? 8 }} data-elea-bubble>
            <Toolbar editorRef={richTextRef} activeFormats={activeFormats} inline={list || heading} onListCommand={list ? (command) => listCommandRef.current?.(command) : undefined} />
          </div>,
          document.body,
        )}
        {slash && isFocused && <SlashMenu ref={slashRef} origin={cardRef.current} query={slash.query} rect={slash.rect} types={blockTypes} onPick={pickFromSlash} onClose={() => setSlash(null)} />}
        <div className="elea-block-editor__content">{renderEditor()}</div>
      </div>
    </div>
  );
});
