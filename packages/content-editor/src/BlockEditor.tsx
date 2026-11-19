"use client";

import { htmlToText, type BlockData, type BlockLike, type EleaBlock, type HeaderData, type ListData, type ListItem, type QuoteData } from "@alien6-studio/elea-content";
import { memo, useCallback, useEffect, useRef, useState, type ComponentType, type FocusEvent, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { htmlToItems, itemContent, itemsToHtml, sameItems } from "./listHtml.js";
import { Select } from "@alien6-studio/elea-ui";
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
  /** Reports the focused paragraph's field and formats, for a bar outside the block. */
  onActiveField?: ((handle: RichTextFieldHandle | null, formats: ActiveFormats) => void) | undefined;
}

const NO_CONTEXT: EditorContextInfo = {};

const resize = (event: FormEvent<HTMLTextAreaElement>) => {
  const target = event.currentTarget;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
};

/** The caret sits on the first (or last) line of a field: there is no line above (or below) to move to. */
function onFirstLine(field: HTMLTextAreaElement | HTMLInputElement): boolean {
  return !field.value.slice(0, field.selectionStart ?? 0).includes("\n");
}
function onLastLine(field: HTMLTextAreaElement | HTMLInputElement): boolean {
  return !field.value.slice(field.selectionEnd ?? field.value.length).includes("\n");
}

/** Arrow keys with no line to go to hand the caret to the neighbouring block, as Medium does. */
function fieldNavigation(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, onNavigate: BlockEditorProps["onNavigate"], onMergeBackward: BlockEditorProps["onMergeBackward"]): boolean {
  const field = event.currentTarget;
  if (event.key === "ArrowUp" && !event.shiftKey && onNavigate && onFirstLine(field)) { event.preventDefault(); onNavigate("up"); return true; }
  if (event.key === "ArrowDown" && !event.shiftKey && onNavigate && onLastLine(field)) { event.preventDefault(); onNavigate("down"); return true; }
  if (event.key === "Backspace" && field.value === "" && onMergeBackward) { event.preventDefault(); onMergeBackward(""); return true; }
  return false;
}

function HeaderEditor({ block, onUpdate, onFocus, onBlur, onAddBlockAfter, onNavigate, onMergeBackward }: Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onAddBlockAfter" | "onNavigate" | "onMergeBackward">) {
  const { messages } = useContentServices();
  const data = block.data as HeaderData;
  return (
    <div className="elea-header-editor">
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
            return;
          }
          fieldNavigation(event, onNavigate, onMergeBackward);
        }}
      />
      <Select
        className="elea-header-editor__level"
        size="sm"
        label={messages.blockTypes.header}
        value={String(data.level ?? 2)}
        onChange={(level) => onUpdate({ ...data, level: Number.parseInt(level, 10) })}
        options={[1, 2, 3, 4].map((level) => ({ value: String(level), label: `H${level}` }))}
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
  const element = node ? (node.nodeType === 1 ? (node as Element) : node.parentElement) : null;
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
const notifyInput = (field: HTMLElement) => field.dispatchEvent(new window.Event("input", { bubbles: true }));

interface ListEditorProps extends Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onNavigate" | "onMergeForward" | "onAddBlockAfter" | "onConvert" | "onReplaceWith"> {
  fieldRef: RefObject<RichTextFieldHandle | null>;
  onSelectionChange: (formats: ActiveFormats, info: SelectionInfo) => void;
}

/**
 * The whole list in one rich text field, as a writing tool offers it: text selects across items,
 * marks and links apply, Enter adds an item, Enter on an empty one leaves the list, Backspace at
 * the start of an item joins it to the previous one, Tab and Shift+Tab nest and unnest.
 */
function ListEditor({ block, onUpdate, onFocus, onBlur, onNavigate, onMergeForward, onAddBlockAfter, onConvert, onReplaceWith, fieldRef, onSelectionChange }: ListEditorProps) {
  const { messages } = useContentServices();
  const data = block.data as ListData;
  const style: ListData["style"] = data.style === "ordered" ? "ordered" : "unordered";
  const items: ListItem[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [""];
  const [html, setHtml] = useState(() => itemsToHtml(items, style));
  const styleRef = useRef(style);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const field = () => wrapperRef.current?.querySelector<HTMLElement>("[contenteditable='true']") ?? null;

  // The field owns its markup while people type; items that change elsewhere (undo, the block
  // menu, a paste) rewrite it
  useEffect(() => {
    if (styleRef.current === style && sameItems(htmlToItems(html), items)) return;
    styleRef.current = style;
    setHtml(itemsToHtml(items, style));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, style]);

  const change = (next: string) => {
    setHtml(next);
    const parsed = htmlToItems(next);
    if (parsed.length === 0) return;
    if (!sameItems(parsed, items)) onUpdate({ ...data, items: parsed });
  };

  const currentItems = () => htmlToItems(field()?.innerHTML ?? html);

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const editable = field();
    const item = caretItem(editable);
    if (!editable || !item) return;
    const topLevel = [...editable.querySelectorAll(":scope > ul > li, :scope > ol > li")] as HTMLLIElement[];
    const index = topLevel.indexOf(item);

    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) unnest(item, editable); else nest(item);
      notifyInput(editable);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && isEmptyItem(item)) {
      event.preventDefault();
      event.stopPropagation();
      const parent = item.parentElement as HTMLElement;
      const nested = parent !== editable.firstElementChild;
      if (nested) { unnest(item, editable); notifyInput(editable); return; }
      // An empty top-level item leaves the list: at the end as a new paragraph, in the middle by splitting the list
      const before = currentItems().slice(0, index);
      const after = currentItems().slice(index + 1);
      if (before.length === 0 && after.length === 0) { onConvert?.("paragraph"); return; }
      if (after.length === 0) { onUpdate({ ...data, items: before }); onAddBlockAfter?.("paragraph"); return; }
      if (before.length === 0) { onReplaceWith?.([{ type: "paragraph", data: { text: "" } }, { type: "list", data: { ...data, items: after } }], 0); return; }
      onReplaceWith?.([{ type: "list", data: { ...data, items: before } }, { type: "paragraph", data: { text: "" } }, { type: "list", data: { ...data, items: after } }], 1);
      return;
    }
    if (event.key === "Backspace" && !event.shiftKey && !event.ctrlKey && !event.metaKey && caretAtStartOf(item)) {
      const parent = item.parentElement as HTMLElement;
      if (parent !== editable.firstElementChild) {
        // Nested: the item goes up a level
        event.preventDefault();
        event.stopPropagation();
        unnest(item, editable);
        notifyInput(editable);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (index === 0) {
        // The first item becomes a paragraph before the rest of the list, or the whole block when alone
        const rest = currentItems().slice(1);
        const text = itemContent(currentItems()[0] as ListItem);
        if (rest.length === 0) { onConvert?.("paragraph"); return; }
        onReplaceWith?.([{ type: "paragraph", data: { text } }, { type: "list", data: { ...data, items: rest } }], 0, "end");
        return;
      }
      joinWithPrevious(item);
      notifyInput(editable);
    }
  };

  return (
    <div className="elea-list-editor" ref={wrapperRef} onKeyDownCapture={keyDown}>
      <RichTextField
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

/** The item moves under the previous one, as its last child; the first item has nowhere to go. */
function nest(item: HTMLLIElement) {
  const previous = item.previousElementSibling as HTMLLIElement | null;
  if (!previous) return;
  const parentTag = (item.parentElement as HTMLElement).tagName === "OL" ? "ul" : "ol";
  let sublist = [...previous.children].find((child) => child.tagName === "UL" || child.tagName === "OL") as HTMLElement | undefined;
  if (!sublist) {
    sublist = document.createElement(parentTag);
    previous.appendChild(sublist);
  }
  sublist.appendChild(item);
}

/** The item goes up after its parent item, taking the items that followed it along as its children. */
function unnest(item: HTMLLIElement, editable: HTMLElement) {
  const list = item.parentElement as HTMLElement;
  const parentItem = list.parentElement as HTMLElement;
  if (parentItem === editable || parentItem.tagName !== "LI") return;
  const following = [] as Element[];
  let sibling = item.nextElementSibling;
  while (sibling) { following.push(sibling); sibling = sibling.nextElementSibling; }
  if (following.length > 0) {
    const carried = document.createElement(list.tagName.toLowerCase());
    for (const element of following) carried.appendChild(element);
    item.appendChild(carried);
  }
  parentItem.parentNode?.insertBefore(item, parentItem.nextSibling);
  if (list.children.length === 0) list.remove();
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
function CodeEditor({ block, onUpdate, onFocus, onBlur, onNavigate, onMergeBackward }: Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onNavigate" | "onMergeBackward">) {
  const { messages } = useContentServices();
  const code = typeof block.data.code === "string" ? block.data.code : "";
  return (
    <textarea
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
  );
}

/** A block the editor has no form for: its content stays as it is and is shown as text. */
function KeptBlock({ block, label }: { block: EleaBlock; label: string }) {
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

function QuoteEditor({ block, onUpdate, onFocus, onBlur, onNavigate, onMergeBackward, onAddBlockAfter }: Pick<BlockEditorProps, "block" | "onUpdate" | "onFocus" | "onBlur" | "onNavigate" | "onMergeBackward" | "onAddBlockAfter">) {
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
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onAddBlockAfter?.("paragraph"); return; }
          fieldNavigation(event, onNavigate, onMergeBackward);
        }}
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

interface BlockMenuProps {
  block: EleaBlock;
  onUpdate: (data: BlockData) => void;
  onConvert: BlockEditorProps["onConvert"];
  onRemove: () => void;
  /** The trigger shows the type's name next to its icon. */
  labelled?: boolean | undefined;
  label: string;
}

interface BlockShape {
  id: string;
  type: string;
  label: string;
  icon: React.JSX.Element;
  data: Record<string, unknown>;
  /** The block already has this shape. */
  current: (block: EleaBlock) => boolean;
}

/** The menu in the margin: the shapes a text block can take, and the deletion of any block. */
function BlockMenu({ block, onUpdate, onConvert, onRemove, labelled = false, label }: BlockMenuProps) {
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

  const textual = ["paragraph", "header", "list", "quote"].includes(block.type) && onConvert !== undefined;
  const level = (value: number) => (candidate: EleaBlock) => candidate.type === "header" && (candidate.data.level ?? 2) === value;
  const shapes: BlockShape[] = textual
    ? [
        { id: "paragraph", type: "paragraph", label: messages.blockTypes.paragraph, icon: <PilcrowIcon />, data: {}, current: (candidate) => candidate.type === "paragraph" },
        ...[1, 2, 3, 4].map((value) => ({ id: `h${value}`, type: "header", label: messages.toolbar[`h${value}` as "h1"], icon: <HeadingIcon />, data: { level: value }, current: level(value) })),
        { id: "ul", type: "list", label: messages.toolbar.bulletList, icon: <ListIcon />, data: { style: "unordered" }, current: (candidate) => candidate.type === "list" && candidate.data.style !== "ordered" },
        { id: "ol", type: "list", label: messages.toolbar.orderedList, icon: <ListIcon />, data: { style: "ordered" }, current: (candidate) => candidate.type === "list" && candidate.data.style === "ordered" },
        { id: "quote", type: "quote", label: messages.blockTypes.quote, icon: <QuoteIcon />, data: {}, current: (candidate) => candidate.type === "quote" },
      ]
    : [];
  const pick = (shape: BlockShape) => {
    setOpen(false);
    if (shape.current(block)) return;
    // The same type keeps its content and only changes shape; another type converts it
    if (shape.type === block.type) onUpdate({ ...block.data, ...shape.data });
    else onConvert?.(shape.type, shape.data);
  };
  const Icon = block.type === "paragraph" ? PilcrowIcon : blockTypeIcons[block.type];
  return (
    <div className="elea-block-menu" ref={rootRef}>
      <button
        type="button"
        className={labelled ? "elea-block-menu__trigger elea-block-menu__trigger--labelled" : "elea-icon-button elea-block-menu__trigger"}
        aria-label={messages.actions.blockMenu}
        title={messages.actions.blockMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      >
        {Icon ? <Icon /> : <PilcrowIcon />}
        {labelled && <span>{label}</span>}
      </button>
      {open && (
        <div role="menu" aria-label={messages.actions.blockMenu} className="elea-block-menu__list" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
          {shapes.map((shape) => (
            <button key={shape.id} type="button" role="menuitemradio" aria-checked={shape.current(block)} className={`elea-block-menu__item${shape.current(block) ? " elea-block-menu__item--current" : ""}`} onClick={() => pick(shape)}>
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
  const { messages } = useContentServices();
  const richTextRef = useRef<RichTextFieldHandle>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS);
  // The toolbar floats above a text selection and leaves when the caret collapses
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo>({ collapsed: true, rect: null });
  const [slash, setSlash] = useState<{ query: string; rect: DOMRect | null } | null>(null);
  const slashRef = useRef<SlashMenuHandle>(null);
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
  const reportedRef = useRef(false);
  useEffect(() => {
    if (!onActiveField) return;
    if (block.type === "paragraph" && isFocused) {
      reportedRef.current = true;
      onActiveField(richTextRef.current, activeFormats);
    } else if (reportedRef.current) {
      reportedRef.current = false;
      onActiveField(null, EMPTY_FORMATS);
    }
  }, [onActiveField, block.type, isFocused, activeFormats]);
  const classic = mode === "classic";
  const labels = messages.blockTypes as Record<string, string | undefined>;
  const typeLabel = labels[block.type] ?? block.type;

  const remove = useCallback(() => onRemove(), [onRemove]);
  const isEmptyParagraph = block.type === "paragraph" && htmlToText(typeof block.data.text === "string" ? block.data.text : "").trim() === "";

  const renderEditor = () => {
    const Custom = editors?.[block.type];
    if (Custom) return <Custom block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
    switch (block.type) {
      case "header":
        return <HeaderEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onAddBlockAfter={onAddBlockAfter} onNavigate={onNavigate} onMergeBackward={onMergeBackward} />;
      case "list":
        return <ListEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onNavigate={onNavigate} onMergeForward={onMergeForward} onAddBlockAfter={onAddBlockAfter} onConvert={onConvert} onReplaceWith={onReplaceWith} fieldRef={richTextRef} onSelectionChange={handleSelectionChange} />;
      case "quote":
        return <QuoteEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onNavigate={onNavigate} onMergeBackward={onMergeBackward} onAddBlockAfter={onAddBlockAfter} />;
      case "image":
        return <ImageBlock block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
      case "video":
        return <VideoBlock block={block} onUpdate={onUpdate} onFocus={onFocus} />;
      case "attachment":
        return <AttachmentBlock block={block} onUpdate={onUpdate} onFocus={onFocus} context={context} />;
      case "code":
        return <CodeEditor block={block} onUpdate={onUpdate} onFocus={onFocus} onBlur={onBlur} onNavigate={onNavigate} onMergeBackward={onMergeBackward} />;
      case "delimiter":
        return <hr className="elea-delimiter-editor" aria-label={typeLabel} />;
      default:
        // Rich text needs a text field; the other EditorJS shapes (table, raw, embed, attaches) keep their data
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
          {isEmptyParagraph && isFocused && onConvert && (
            <AddBlockButton types={blockTypes} onAdd={(type) => onConvert(type)} />
          )}
          <BlockMenu block={block} onUpdate={onUpdate} onConvert={onConvert} onRemove={remove} label={typeLabel} />
          {dragHandleProps && (
            <span className="elea-icon-button elea-block-editor__grip" aria-label={messages.actions.moveBlock} title={`${typeLabel} \u00b7 ${messages.actions.moveBlock}`} {...dragHandleProps}>
              <GripIcon />
            </span>
          )}
        </div>
      )}
      <div
        className="elea-block-editor__card"
        onKeyDownCapture={(event) => {
          // While the slash menu is open, its keys never reach the field
          if (slash && SLASH_MENU_KEYS.has(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            slashRef.current?.handleKey(event.key);
          }
        }}
      >
        {(block.type === "paragraph" ? !classic : block.type === "list") && isFocused && !selectionInfo.collapsed && typeof document !== "undefined" && createPortal(
          <div className="elea-bubble" style={{ position: "fixed", top: Math.max(8, (selectionInfo.rect?.top ?? 8) - 48), left: selectionInfo.rect?.left ?? 8 }} data-elea-bubble>
            {/* With no fixed bar, the floating one carries every format, as Medium's does; list items take the marks only */}
            <Toolbar editorRef={richTextRef} activeFormats={activeFormats} inline={mode !== "default" || block.type === "list"} />
          </div>,
          document.body,
        )}
        {slash && isFocused && <SlashMenu ref={slashRef} query={slash.query} rect={slash.rect} types={blockTypes} onPick={pickFromSlash} onClose={() => setSlash(null)} />}
        <div className="elea-block-editor__content">{renderEditor()}</div>
      </div>
    </div>
  );
});
