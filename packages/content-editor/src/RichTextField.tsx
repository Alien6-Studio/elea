"use client";

import { applyLinkTarget, documentToHtml, en, resolveLinkUrl, type HtmlSanitizer, type BlockLike } from "@alien6-studio/elea-content";
import { parseClipboard, type PastedContent } from "./paste.js";
import { copyBlock } from "./selection.js";
import { TextLimitContext, clipMarkup, fitPastedBlocks, inputText } from "./editorTextLimit.js";
import { editableHtml, selectionOffsets, textPoint } from "./caret.js";
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState, type ClipboardEvent, type CompositionEvent, type CSSProperties, type FocusEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useSurfaceScope } from "@alien6-studio/elea-ui";
import { CheckIcon, CloseIcon, ExternalLinkIcon, TrashIcon } from "./icons.js";
import { useContentServices } from "./provider.js";
import { useRestrictions, type EditorMark } from "./restrictions.js";

export interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  h4: boolean;
  h5: boolean;
  h6: boolean;
  blockquote: boolean;
  ul: boolean;
  ol: boolean;
  /** The caret sits in a link: the link control edits it. */
  link?: boolean | undefined;
}

export const EMPTY_FORMATS: ActiveFormats = {
  bold: false, italic: false, underline: false,
  h1: false, h2: false, h3: false, h4: false, h5: false, h6: false,
  blockquote: false, ul: false, ol: false,
};

/** Where and how the text is selected, for a toolbar that floats above it. */
export interface SelectionInfo {
  collapsed: boolean;
  /** Viewport rectangle of the selection, null when the DOM offers none. */
  rect: DOMRect | null;
}

export type InlineTag = "strong" | "em" | "u";
export type ListTag = "ul" | "ol";
export type BlockTag = "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Formatting commands a toolbar outside the editable area can drive. */
export interface RichTextFieldHandle {
  applyInlineFormat: (tag: InlineTag) => void;
  applyListFormat: (tag: ListTag) => void;
  applyBlockFormat: (tag: BlockTag, wholeParagraph?: boolean) => void;
  openLinkInput: () => void;
  clearFormat: () => void;
}

export interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: (() => void) | undefined;
  onBlur?: ((event?: FocusEvent) => void) | undefined;
  /** Enter after a line break splits this field into two paragraphs at the caret. */
  onEnter?: ((before: string, after: string) => void) | undefined;
  /** A list block can handle Return on an empty item by leaving the list. */
  onListItemReturn?: ((item: HTMLLIElement) => boolean) | undefined;
  /**
   * A paste holding several blocks: the first one stays in this field, the others follow
   * it, and the content that sat after the caret ends up after them.
   */
  onInsertBlocks?: ((blocks: BlockLike[], after: string) => void) | undefined;
  /** Arrow up at the start or arrow down at the end: the caret wants the neighbouring block. */
  onNavigate?: ((direction: "up" | "down") => void) | undefined;
  /** Backspace at the very start: this content joins the previous block. */
  onMergeBackward?: ((html: string) => void) | undefined;
  /** Delete at the very end: the next block joins this one. */
  onMergeForward?: (() => void) | undefined;
  /** A typing shortcut at the start of the block (`# `, `- `, `1. `, `> `) asks for another block type. */
  onConvert?: ((type: string, data: Record<string, unknown>) => void) | undefined;
  /** `/` typed in an empty block opens the block menu; the query follows the slash, null closes it. */
  onSlash?: ((query: string | null, rect: DOMRect | null) => void) | undefined;
  onSelectionChange?: ((formats: ActiveFormats, info: SelectionInfo) => void) | undefined;
  /** One line, as a heading: Enter splits it. */
  singleLine?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

function linkPreviewAddress(input: string, base: string): string | undefined {
  const candidate = resolveLinkUrl(input);
  if (!candidate) return undefined;
  try {
    const { href } = new URL(candidate, base);
    return href.startsWith("https://") || href.startsWith("http://") ? href : undefined;
  } catch {
    return undefined;
  }
}

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI"]);
const UNWRAP_TAGS = new Set(["STRONG", "EM", "U", "A", "MARK", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"]);

function elementOf(node: Node | null | undefined): HTMLElement | null {
  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
}

const BLOCK_CONTAINERS = "li, p, h1, h2, h3, h4, h5, h6, blockquote, div";

function addCaretPlaceholder(br: Element): HTMLElement {
  const sentinel = document.createElement("br");
  sentinel.dataset.eleaCaret = "";
  br.after(sentinel);
  return sentinel;
}

function paragraphHtml(element: HTMLElement): string {
  return element.textContent || element.querySelector("br:not([data-elea-caret]),img,hr") ? editableHtml(element) : "";
}

const BLOCK_SELECTOR = "div,p,h1,h2,h3,h4,h5,h6,ol,ul,li,blockquote,pre,hr,table,figure";
const isBlockNode = (node: ChildNode) => node instanceof Element && node.matches(BLOCK_SELECTOR);

/** The bare inline run around the target among sibling nodes, as a [start, end) pair. */
function inlineRun(contents: ChildNode[], target: Node): [number, number] | null {
  const index = contents.findIndex(child => child === target || child.contains(target));
  if (index < 0 || isBlockNode(contents[index]!)) return null;
  let first = index;
  let end = index + 1;
  while (first > 0 && !isBlockNode(contents[first - 1]!)) first--;
  while (end < contents.length && !isBlockNode(contents[end]!)) end++;
  return [first, end];
}

function paragraphScope(editor: HTMLElement, selection: Selection) {
  const range = selection.getRangeAt(0);
  const start = range.startContainer;
  const target = start.childNodes[range.startOffset] ?? start.lastChild ?? start;
  const element = elementOf(target);
  if (!element || !editor.contains(element)) return null;
  const heading = element.closest("h1,h2,h3,h4,h5,h6,p");
  const current = heading && editor.contains(heading) ? heading : null;
  const container = current ?? element.closest("div,blockquote,li") ?? editor;
  let contents = Array.from(container.childNodes);
  let first = 0;
  if (!current && contents.length) {
    // Imported fields may mix bare text with lists or other blocks. Style only this inline run.
    const run = inlineRun(contents, target);
    if (!run) return null;
    first = run[0];
    contents = contents.slice(...run);
  }
  return { current, container, contents, first };
}

function reconnect({ container, current, replacement, parent, offset, first, count }: { container: Node; current: Element | null; replacement: Element | null; parent: Node; offset: number; first: number; count: number }) {
  return (node: Node, at: number): [Node, number] => {
    if (node !== container) return [node, Math.min(at, node.nodeType === Node.TEXT_NODE ? (node as Text).length : node.childNodes.length)];
    if (current) return [replacement ?? parent, at + offset];
    if (at < first) return [container, at];
    if (at > first + count) return [container, at - count + 1];
    return [replacement!, at - first];
  };
}

/** The whole block becomes plain lines. */
function plainField(editor: HTMLElement) {
  // innerText keeps the visual line breaks; some DOM implementations only offer textContent
  const text = (editor as { innerText?: string }).innerText ?? editor.textContent ?? "";
  editor.innerHTML = "";
  text.split("\n").forEach((line, index) => {
    if (index > 0) editor.appendChild(document.createElement("br"));
    if (line) editor.appendChild(document.createTextNode(line));
  });
}

/** The whole list becomes plain lines, one per item. */
function plainList(editor: HTMLElement, selection: Selection, list: Element) {
  const lines = Array.from(list.querySelectorAll("li"), (item) => item.textContent ?? "").filter((line) => line !== "");
  const nodes = lines.flatMap((line, index) => [...(index > 0 ? [document.createElement("br")] : []), document.createTextNode(line)]);
  list.replaceWith(...nodes);
  const next = document.createRange();
  const last = nodes.at(-1);
  if (last) next.setStartAfter(last);
  else next.setStart(editor, editor.childNodes.length);
  next.collapse(true);
  selection.removeAllRanges();
  selection.addRange(next);
}

function plainSelection(editor: HTMLElement, selection: Selection, range: Range) {
  const text = range.toString();
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  let node: Node | null = textNode.parentNode;
  while (node && node !== editor) {
    if (UNWRAP_TAGS.has((node as Element).tagName)) {
      unwrap(node as Element);
      node = textNode.parentNode;
    } else {
      node = node.parentNode;
    }
  }
  const next = document.createRange();
  next.setStartAfter(textNode);
  next.collapse(true);
  selection.removeAllRanges();
  selection.addRange(next);
}

function precedingBreak(range: Range, editor: HTMLElement): Element | null {
  if (!range.collapsed) return null;
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) return null;
  const scope = elementOf(startContainer)?.closest(BLOCK_CONTAINERS) ?? editor;
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.nodeName === "BR" && (node as HTMLElement).dataset.eleaCaret === undefined) || (node.nodeType === Node.TEXT_NODE && node.textContent)
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  });
  let left = startContainer.childNodes[startOffset - 1];
  if (left) {
    while (left.lastChild) left = left.lastChild;
    if (left.nodeName === "BR" && (left as HTMLElement).dataset.eleaCaret === undefined) return left as Element;
    if (left.textContent) return null;
  }
  walker.currentNode = left ?? startContainer;
  const previous = walker.previousNode();
  return previous?.nodeName === "BR" ? previous as Element : null;
}

/**
 * The parts of a range that sit in one block each: a range spanning several list items or
 * lines is split at their boundaries, so a wrapper never crosses a block.
 */
function rangesPerBlock(range: Range, editor: HTMLElement): Range[] {
  const containerOf = (node: Node) => {
    const element = node.nodeType === 1 ? (node as Element) : node.parentElement;
    const block = element?.closest(BLOCK_CONTAINERS);
    return block && editor.contains(block) && block !== editor ? block : editor;
  };
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const groups: { block: Element; nodes: Text[] }[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!range.intersectsNode(node)) continue;
    const block = containerOf(node);
    const group = groups.at(-1);
    if (group?.block === block) group.nodes.push(node as Text);
    else groups.push({ block, nodes: [node as Text] });
  }
  if (groups.length <= 1) return [range];
  return groups.map(({ nodes }) => {
    const first = nodes[0] as Text;
    const last = nodes.at(-1) as Text;
    const piece = document.createRange();
    piece.setStart(first, first === range.startContainer ? range.startOffset : 0);
    piece.setEnd(last, last === range.endContainer ? range.endOffset : last.length);
    return piece;
  });
}

function unwrap(element: Element): void {
  const fragment = document.createDocumentFragment();
  while (element.firstChild) fragment.appendChild(element.firstChild);
  element.replaceWith(fragment);
}

/** Lines of a fragment, delimited by `<br>` or block elements; trailing breaks and blank text dropped. */
function splitFragmentIntoLines(fragment: DocumentFragment): Node[][] {
  const lines: Node[][] = [];
  let current: Node[] = [];
  const flush = () => {
    while (current.length > 0) {
      const last = current.at(-1) as Node;
      if (last.nodeName === "BR" || (last.nodeType === Node.TEXT_NODE && !last.textContent?.trim())) current.pop();
      else break;
    }
    if (current.length > 0) lines.push(current);
    current = [];
  };
  for (const node of Array.from(fragment.childNodes)) {
    if (node.nodeName === "BR") {
      flush();
    } else if (BLOCK_TAGS.has(node.nodeName)) {
      flush();
      const children = Array.from((node as Element).childNodes).filter((child) => !(child.nodeName === "BR" && !child.nextSibling));
      if (children.length > 0) lines.push(children);
    } else {
      current.push(node);
    }
  }
  flush();
  return lines;
}

function paragraphText(block: BlockLike | undefined) {
  return block?.type === "paragraph" ? (block.data as { text?: string } | undefined)?.text : undefined;
}

function inlinePaste(paste: PastedContent, acceptsBlocks: boolean, sanitizer: HtmlSanitizer) {
  if (paste.inline !== null) return paste.inline;
  const first = paragraphText(paste.blocks[0]);
  if (paste.blocks.length === 1 && first !== undefined) return first;
  if (acceptsBlocks || !paste.blocks.length) return null;
  // A list or standalone rich field keeps the whole paste inside its editable surface.
  if (paste.blocks.every(block => paragraphText(block) !== undefined)) return paste.blocks.map(paragraphText).join("<br>");
  return documentToHtml({ blocks: paste.blocks.map(copyBlock) }, { sanitize: html => sanitizer.sanitize(html) });
}

/** Pasted lines join in a field of one line. */
const pastedLine = (html: string, single?: boolean) => (single ? html.replaceAll(/<br\s*\/?>/gi, " ") : html);

/**
 * Rich text on a contentEditable element. Formatting commands are exposed through the
 * handle so a toolbar outside the DOM subtree can drive them; the last selection inside
 * the editor is remembered so focus can be restored after a toolbar click.
 */
export const RichTextField = forwardRef<RichTextFieldHandle, RichTextFieldProps>(function RichText(
  { value, onChange, onFocus, onBlur, onEnter, onListItemReturn, onInsertBlocks, onNavigate, onMergeBackward, onMergeForward, onConvert, onSlash, onSelectionChange, singleLine, placeholder, className, style },
  ref,
) {
  const { sanitizer, messages, siteHostnames } = useContentServices();
  const restrictions = useRestrictions();
  const allowsMark = (mark: EditorMark) => restrictions?.allowsMark(mark) ?? true;
  const restrictHtml = (html: string) => restrictions?.restrictHtml(html) ?? html;
  const linkOptions = siteHostnames ? { siteHostnames } : {};
  const effectivePlaceholder = placeholder ?? messages.editor.startWriting;
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const beforeEdit = useRef<[number, number] | undefined>(undefined);
  const textLimit = useContext(TextLimitContext);
  const limitRef = useRef(textLimit);
  limitRef.current = textLimit;
  const lastValueRef = useRef(value);
  const lastSelectionRef = useRef<Range | null>(null);
  // Commands run from memoized callbacks and from the imperative handle: they read the
  // props through this ref so a parent re-render never leaves them with stale callbacks
  const latest = useRef({ onChange, onEnter, onListItemReturn, onInsertBlocks, onNavigate, onMergeBackward, onMergeForward, onConvert, onSlash, onSelectionChange, singleLine, sanitizer, linkOptions });
  latest.current = { onChange, onEnter, onListItemReturn, onInsertBlocks, onNavigate, onMergeBackward, onMergeForward, onConvert, onSlash, onSelectionChange, singleLine, sanitizer, linkOptions };
  // A value that arrives while the field is composing text is applied once the composition ends
  const pendingValueRef = useRef<string | null>(null);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [observeEditor, linkScope] = useSurfaceScope(showLinkInput);
  const setEditorRef = useCallback((editor: HTMLDivElement | null) => {
    editorRef.current = editor;
    observeEditor(editor);
  }, [observeEditor]);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [linkUrlError, setLinkUrlError] = useState(false);
  const [linkPopoverPosition, setLinkPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const savedSelectionForLinkRef = useRef<Range | null>(null);
  /** The link under the caret when the popover opened: it is edited, not nested. */
  const [editedLink, setEditedLink] = useState<HTMLAnchorElement | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const writeContent = (editor: HTMLElement, next: string) => {
    editor.innerHTML = next ? sanitizer.sanitize(next) : "";
    let end = editor.lastChild;
    while (end?.lastChild) end = end.lastChild;
    return end?.nodeName === "BR" && !end.parentElement?.closest("li") ? addCaretPlaceholder(end as Element) : null;
  };

  // DOM sync: the stored value is sanitized on the way in, never trusted as is
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML === "") {
      writeContent(editorRef.current, value);
      lastValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Writes a value into the field; the caret goes to the end when the field has focus. */
  const applyValue = (next: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const sentinel = writeContent(editor, next);
    lastValueRef.current = next;
    if (document.activeElement === editor) {
      const selection = globalThis.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      if (sentinel) range.setEndBefore(sentinel);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      lastSelectionRef.current = range.cloneRange();
    }
  };

  // Controlled sync rule: `lastValueRef` holds the last value this field emitted or applied.
  // A `value` equal to it is an echo of our own input and is ignored, whatever the focus.
  // A different `value` is an external replacement and wins, focused or not, with the caret
  // moved to the end; during a composition it waits for the composition to end.
  useEffect(() => {
    if (!editorRef.current || value === lastValueRef.current) return;
    if (isComposingRef.current) {
      pendingValueRef.current = value;
      return;
    }
    applyValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, sanitizer]);

  const getActiveFormats = (): ActiveFormats => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return EMPTY_FORMATS;
    const element = elementOf(selection.getRangeAt(0).startContainer);
    if (!element || !editorRef.current.contains(element)) return EMPTY_FORMATS;
    return {
      bold: !!element.closest("strong, b"),
      italic: !!element.closest("em"),
      underline: !!element.closest("u"),
      h1: !!element.closest("h1"), h2: !!element.closest("h2"), h3: !!element.closest("h3"),
      h4: !!element.closest("h4"), h5: !!element.closest("h5"), h6: !!element.closest("h6"),
      blockquote: !!element.closest("blockquote"),
      ul: !!element.closest("ul"),
      ol: !!element.closest("ol"),
      link: !!element.closest("a"),
    };
  };

  useEffect(() => {
    const saveSelection = () => {
      const selection = globalThis.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        lastSelectionRef.current = range.cloneRange();
        const rect = typeof range.getBoundingClientRect === "function" ? range.getBoundingClientRect() : null;
        latest.current.onSelectionChange?.(getActiveFormats(), { collapsed: selection.isCollapsed, rect: rect && (rect.width > 0 || rect.height > 0) ? rect : null });
      }
    };
    document.addEventListener("selectionchange", saveSelection);
    return () => document.removeEventListener("selectionchange", saveSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const INPUT_RULES: ReadonlyArray<{ pattern: RegExp; convert: (match: RegExpExecArray) => { type: string; data: Record<string, unknown> } }> = [
    { pattern: /^(#{1,6}) $/, convert: (match) => ({ type: "header", data: { text: "", level: (match[1] as string).length } }) },
    { pattern: /^[-*] $/, convert: () => ({ type: "list", data: { style: "unordered", items: [""] } }) },
    { pattern: /^1[.)] $/, convert: () => ({ type: "list", data: { style: "ordered", items: [""] } }) },
    { pattern: /^> $/, convert: () => ({ type: "quote", data: { text: "", caption: "" } }) },
  ];

  /** Typing `# `, `- `, `1. ` or `> ` at the start of an empty block turns it into the matching block. */
  const applyInputRule = (editor: HTMLDivElement): boolean => {
    const convert = latest.current.onConvert;
    if (!convert || editor.querySelector("*")) return false;
    const text = editor.textContent ?? "";
    for (const rule of INPUT_RULES) {
      const match = rule.pattern.exec(text.replaceAll("\u00a0", " "));
      if (match) {
        const target = rule.convert(match);
        if (restrictions && !restrictions.allowsBlock(target.type)) return false;
        editor.innerHTML = "";
        convert(target.type, target.data);
        return true;
      }
    }
    return false;
  };

  /** `/` alone at the start of an empty block opens the block menu; what follows filters it. */
  const reportSlash = (editor: HTMLDivElement) => {
    const slash = latest.current.onSlash;
    if (!slash) return;
    const text = (editor.textContent ?? "").replaceAll("\u00a0", " ");
    if (!editor.querySelector("*") && text.startsWith("/") && !text.includes(" ")) {
      const range = editorRange();
      const rect = range && typeof range.getBoundingClientRect === "function" ? range.getBoundingClientRect() : null;
      slash(text.slice(1), rect ?? editor.getBoundingClientRect());
    } else {
      slash(null, null);
    }
  };

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const limit = limitRef.current;
    if (limit && isComposingRef.current) return;
    const html = editableHtml(editor);
    if (limit && inputText(html).length > inputText(lastValueRef.current).length + limit.remaining) {
      applyValue(lastValueRef.current);
      const selection = editor.ownerDocument.getSelection();
      if (beforeEdit.current && selection) {
        const range = editor.ownerDocument.createRange();
        range.setStart(...textPoint(editor, beforeEdit.current[0]));
        range.setEnd(...textPoint(editor, beforeEdit.current[1]));
        selection.removeAllRanges();
        selection.addRange(range);
      }
      beforeEdit.current = undefined;
      return;
    }
    beforeEdit.current = undefined;
    if (applyInputRule(editor)) return;
    lastValueRef.current = html;
    latest.current.onChange(html);
    reportSlash(editor);
  };

  /** Focus the editor and bring back the last selection, unless a live one exists. */
  const restoreSelection = () => {
    const selection = globalThis.getSelection();
    const live = selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode);
    editorRef.current?.focus();
    if (live || !lastSelectionRef.current) return;
    selection?.removeAllRanges();
    selection?.addRange(lastSelectionRef.current);
  };

  /** Inserts sanitized inline HTML at the caret and leaves the caret after it. */
  const insertInlineHtml = (html: string, range: Range, selection: Selection) => {
    range.deleteContents();
    if (!html) return;
    const fragment = range.createContextualFragment(html);
    const last = fragment.lastChild;
    range.insertNode(fragment);
    if (last) {
      range.setStartAfter(last);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    const editor = editorRef.current;
    const selection = globalThis.getSelection();
    const range = editorRange();
    if (!editor || !selection || !range) return;
    const { sanitizer: currentSanitizer, onInsertBlocks: insertBlocks } = latest.current;
    const pasted = parseClipboard(event.clipboardData, currentSanitizer);
    const limit = limitRef.current;
    const capacity = (limit?.remaining ?? Infinity) + range.toString().length;
    if (limit) pasted.blocks = fitPastedBlocks(pasted.blocks, capacity, limit.text, currentSanitizer.policy);
    const [first, ...rest] = pasted.blocks;
    const firstText = paragraphText(first);
    let inline = inlinePaste(pasted, !!insertBlocks, currentSanitizer);
    if (inline !== null) {
      inline = restrictHtml(inline);
      if (limit && inputText(inline).length > capacity) inline = clipMarkup(inline, capacity, currentSanitizer.policy);
      if (!inline) return;
      insertInlineHtml(currentSanitizer.sanitize(pastedLine(inline, latest.current.singleLine)), range, selection);
      handleInput();
      return;
    }
    if (!first || !insertBlocks) return;
    const after = extractContentAfterCaret(range, editor);
    if (typeof firstText === "string") insertInlineHtml(currentSanitizer.sanitize(restrictHtml(firstText)), range, selection);
    else range.deleteContents();
    handleInput();
    insertBlocks(typeof firstText === "string" ? rest : pasted.blocks, after);
  };

  const extractContentAfterCaret = (range: Range, element: HTMLElement): string => {
    const after = range.cloneRange();
    after.selectNodeContents(element);
    after.setStart(range.endContainer, range.endOffset);
    const holder = document.createElement("div");
    holder.appendChild(after.cloneContents());
    after.deleteContents();
    return paragraphHtml(holder);
  };

  const stripOuterBlockTag = (html: string): string => {
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const only = holder.childNodes.length === 1 ? holder.firstElementChild : null;
    return only?.matches("h1,h2,h3,h4,h5,h6,blockquote") ? only.innerHTML : html;
  };

  /** The current range when it sits inside this editor; a stale selection elsewhere is ignored. */
  const editorRange = (): Range | null => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return null;
    const range = selection.getRangeAt(0);
    return editorRef.current.contains(range.commonAncestorContainer) ? range : null;
  };

  const splitParagraph = (range: Range, separator?: Element) => {
    const { onEnter: enter, onChange: change } = latest.current;
    if (!enter || !editorRef.current) return;
    const after = extractContentAfterCaret(range, editorRef.current);
    separator?.remove();
    const before = paragraphHtml(editorRef.current);
    lastValueRef.current = before;
    change(before);
    enter(before, stripOuterBlockTag(after));
  };

  const toggleInlineFormat = (tag: InlineTag) => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    const existing = elementOf(range.commonAncestorContainer)?.closest(tag);
    if (existing) {
      unwrap(existing);
      handleInput();
      return;
    }
    // A selection across items or lines gets one wrapper per block, so the markup stays valid
    const pieces = rangesPerBlock(range, editorRef.current);
    const wrappers = pieces.map((piece) => {
      const wrapper = document.createElement(tag);
      wrapper.appendChild(piece.extractContents());
      piece.insertNode(wrapper);
      return wrapper;
    });
    const first = wrappers[0];
    const last = wrappers.at(-1);
    if (first && last) {
      const next = document.createRange();
      next.setStart(first, 0);
      next.setEnd(last, last.childNodes.length);
      selection.removeAllRanges();
      selection.addRange(next);
    }
    handleInput();
  };

  const insertList = (tag: ListTag) => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    const closest = elementOf(range.commonAncestorContainer)?.closest("ul, ol");
    if (closest?.tagName.toLowerCase() === tag) {
      // Toggle off: list items become lines
      const fragment = document.createDocumentFragment();
      Array.from(closest.querySelectorAll("li")).forEach((item, index) => {
        if (index > 0) fragment.appendChild(document.createElement("br"));
        while (item.firstChild) fragment.appendChild(item.firstChild);
      });
      closest.replaceWith(fragment);
      handleInput();
      return;
    }
    const list = document.createElement(tag);
    if (range.collapsed) {
      const item = document.createElement("li");
      list.appendChild(item);
      range.insertNode(list);
      const next = document.createRange();
      next.setStart(item, 0);
      next.collapse(true);
      selection.removeAllRanges();
      selection.addRange(next);
    } else {
      const lines = splitFragmentIntoLines(range.extractContents());
      if (lines.length === 0) lines.push([]);
      for (const line of lines) {
        const item = document.createElement("li");
        for (const node of line) item.appendChild(node);
        list.appendChild(item);
      }
      range.insertNode(list);
      const next = document.createRange();
      next.selectNodeContents(list);
      selection.removeAllRanges();
      selection.addRange(next);
    }
    handleInput();
  };

  // The style picker formats a whole paragraph, including inline markup around the caret.
  const setParagraphHeading = (tag: BlockTag) => {
    const editor = editorRef.current;
    const selection = globalThis.getSelection();
    if (!editor || !selection?.anchorNode || !selection.focusNode || !selection.rangeCount) return;
    const scope = paragraphScope(editor, selection);
    if (!scope) return;
    const { current, container, contents, first } = scope;
    const parent = current?.parentNode ?? container;
    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    const replacement = current?.localName === tag ? null : document.createElement(tag);
    const offset = current && !replacement ? Array.from(parent.childNodes).indexOf(current) : 0;
    if (current) current.replaceWith(...(replacement ? [replacement] : contents));
    else container.insertBefore(replacement!, contents[0] ?? null);
    replacement?.append(...contents);
    // Moving children adjusts live DOM ranges. Reconnect both ends to the original nodes.
    const boundary = reconnect({ container, current, replacement, parent, offset, first, count: contents.length });
    selection.setBaseAndExtent(...boundary(anchorNode, anchorOffset), ...boundary(focusNode, focusOffset));
    lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
    latest.current.onSelectionChange?.(getActiveFormats(), { collapsed: selection.isCollapsed, rect: null });
    handleInput();
  };

  const toggleBlockFormat = (tag: BlockTag) => {
    const editor = editorRef.current;
    const selection = globalThis.getSelection();
    if (!editor || !selection) return;
    if (!selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const existing = elementOf(range.commonAncestorContainer)?.closest(tag);
      if (existing) {
        unwrap(existing);
      } else {
        const wrapper = document.createElement(tag);
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
        const next = document.createRange();
        next.selectNodeContents(wrapper);
        selection.removeAllRanges();
        selection.addRange(next);
      }
    } else {
      // No selection: the whole block takes or loses the format
      const only = editor.childNodes.length === 1 ? (editor.firstChild as Element) : null;
      if (only?.tagName?.toLowerCase() === tag) {
        unwrap(only);
      } else {
        const wrapper = document.createElement(tag);
        while (editor.firstChild) wrapper.appendChild(editor.firstChild);
        editor.appendChild(wrapper);
        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    handleInput();
  };

  const createLinkAtRange = (url: string, range: Range) => {
    const anchor = document.createElement("a");
    anchor.href = url.replaceAll(/[<>"]/g, encodeURIComponent);
    applyLinkTarget(anchor, latest.current.linkOptions);
    if (range.collapsed) anchor.textContent = url;
    else anchor.appendChild(range.extractContents());
    range.insertNode(anchor);
    const selection = globalThis.getSelection();
    const next = document.createRange();
    next.selectNodeContents(anchor);
    selection?.removeAllRanges();
    selection?.addRange(next);
    handleInput();
  };

  const openLinkInput = () => {
    if (!allowsMark("link")) return;
    const selection = globalThis.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : lastSelectionRef.current;
    // Inside an existing link: the same popover edits it instead of nesting one
    const existingLink = elementOf(range?.startContainer)?.closest("a") ?? null;
    setEditedLink(existingLink);
    savedSelectionForLinkRef.current = range ? range.cloneRange() : null;
    const selected = existingLink?.getAttribute("href") ?? (range ? range.toString().trim() : "");
    const rangeRect = (existingLink ?? range)?.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
    const anchorRect = rangeRect && rangeRect.height > 0 ? rangeRect : editorRect;
    if (anchorRect) setLinkPopoverPosition({ top: anchorRect.bottom + 6, left: anchorRect.left });
    setLinkInputValue(selected.startsWith("http") ? selected : "");
    setLinkUrlError(false);
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  };

  const closeLinkInput = () => {
    setShowLinkInput(false);
    setLinkInputValue("");
    setLinkUrlError(false);
    setLinkPopoverPosition(null);
    setEditedLink(null);
    editorRef.current?.focus();
  };

  const removeLink = () => {
    if (editedLink?.isConnected) {
      unwrap(editedLink);
      handleInput();
    }
    closeLinkInput();
  };

  const submitLink = () => {
    const trimmed = linkInputValue.trim();
    if (!trimmed) {
      closeLinkInput();
      return;
    }
    const url = resolveLinkUrl(trimmed);
    if (!url) {
      setLinkUrlError(true);
      return;
    }
    const range = savedSelectionForLinkRef.current;
    if (editedLink?.isConnected) {
      editedLink.href = url.replaceAll(/[<>"]/g, encodeURIComponent);
      applyLinkTarget(editedLink, latest.current.linkOptions);
      handleInput();
    } else if (range) createLinkAtRange(url, range);
    setEditedLink(null);
    editorRef.current?.focus();
    setShowLinkInput(false);
    setLinkInputValue("");
    setLinkUrlError(false);
  };

  const clearFormat = () => {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection();
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const listContainer = elementOf(range.commonAncestorContainer)?.closest("ul, ol");
    if (range.collapsed) plainField(editor);
    else if (listContainer && editor.contains(listContainer)) plainList(editor, selection, listContainer);
    else plainSelection(editor, selection, range);
    handleInput();
  };

  // Rebuilt on every render on purpose: each command closes over this render's handlers
  useImperativeHandle(ref, () => ({
    applyInlineFormat: (tag) => { restoreSelection(); toggleInlineFormat(tag); },
    applyListFormat: (tag) => { restoreSelection(); insertList(tag); },
    applyBlockFormat: (tag, wholeParagraph) => { restoreSelection(); if (wholeParagraph) setParagraphHeading(tag); else toggleBlockFormat(tag); },
    openLinkInput: () => { restoreSelection(); openLinkInput(); },
    clearFormat: () => { clearFormat(); },
  }));

  const handleFormattingShortcut = (event: KeyboardEvent): boolean => {
    if (!event.ctrlKey && !event.metaKey) return false;
    switch (event.key) {
      // A mark the host leaves out still swallows its shortcut, or the browser would apply it
      case "b": event.preventDefault(); if (allowsMark("bold")) toggleInlineFormat("strong"); return true;
      case "i": event.preventDefault(); if (allowsMark("italic")) toggleInlineFormat("em"); return true;
      case "u": event.preventDefault(); if (allowsMark("underline")) toggleInlineFormat("u"); return true;
      case "k": event.preventDefault(); openLinkInput(); return true;
      default: return false;
    }
  };

  const caretElement = (): HTMLElement | null => {
    const range = editorRange();
    return range ? elementOf(range.startContainer) : null;
  };

  const isAtStartOf = (element: HTMLElement): boolean => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    if (range.startOffset !== 0) return false;
    let node: Node | null = range.startContainer;
    while (node && node !== element) {
      if (node.previousSibling) return false;
      node = node.parentNode;
    }
    return true;
  };

  const isAtEndOf = (element: HTMLElement): boolean => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    const container = range.endContainer;
    const length = container.nodeType === Node.TEXT_NODE ? (container.textContent?.length ?? 0) : container.childNodes.length;
    if (range.endOffset !== length) return false;
    let node: Node | null = container;
    while (node && node !== element) {
      // A trailing sentinel line break does not count as content after the caret
      let next = node.nextSibling;
      while (next?.nodeName === "BR" && !next.nextSibling) next = next.nextSibling;
      if (next) return false;
      node = node.parentNode;
    }
    return true;
  };

  const insertLineBreak = () => {
    const selection = globalThis.getSelection();
    const range = editorRange();
    const editor = editorRef.current;
    if (!selection || !range || !editor) return;
    range.deleteContents();
    const br = document.createElement("br");
    range.insertNode(br);
    const tail = document.createRange();
    tail.selectNodeContents(br.closest(BLOCK_CONTAINERS) ?? editor);
    tail.setStartAfter(br);
    const following = tail.cloneContents();
    if (!following.textContent && !following.querySelector("br,img,hr")) {
      addCaretPlaceholder(br);
    }
    // WebKit resolves the caret visually when the selection is applied. The
    // trailing placeholder must already be in the DOM for that position to exist.
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    handleInput();
  };

  const splitListItemAtCaret = (item: HTMLElement) => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const after = range.cloneRange();
    after.selectNodeContents(item);
    after.setStart(range.endContainer, range.endOffset);
    const next = document.createElement("li");
    next.appendChild(after.extractContents());
    item.parentNode?.insertBefore(next, item.nextSibling);
    const caret = document.createRange();
    caret.setStart(next, 0);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);
    handleInput();
  };

  /** Backspace at the start of an item: the item leaves the list as plain text, the list splits around it. */
  const ejectListItem = (item: HTMLElement) => {
    const selection = globalThis.getSelection();
    const list = item.parentElement;
    if (!selection || !list) return;
    const fragment = document.createDocumentFragment();
    while (item.firstChild) fragment.appendChild(item.firstChild);
    const siblings = Array.from(list.children);
    const at = siblings.indexOf(item);
    const tag = list.tagName.toLowerCase();
    const sublist = (elements: Element[]) => {
      const part = document.createElement(tag);
      part.append(...elements);
      return elements.length > 0 ? [part] : [];
    };
    const nodes = Array.from(fragment.childNodes);
    const br = document.createElement("br");
    list.replaceWith(...sublist(siblings.slice(0, at)), ...nodes, br, ...sublist(siblings.slice(at + 1)));
    const caret = document.createRange();
    const first = nodes[0];
    if (first) caret.setStart(first, 0);
    else caret.setStartBefore(br);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);
    handleInput();
  };

  /** Enter inside a heading: the heading ends, the rest continues as plain text in the same block. */
  const exitHeadingInline = (heading: HTMLElement) => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const after = range.cloneRange();
    after.selectNodeContents(heading);
    after.setStart(range.endContainer, range.endOffset);
    const fragment = after.extractContents();
    const hasText = fragment.childNodes.length > 0 && fragment.textContent !== "";
    const caretAnchor = hasText ? fragment.firstChild as Node : document.createElement("br");
    heading.after(hasText ? fragment : caretAnchor, document.createElement("br"));
    const caret = document.createRange();
    caret.setStartAfter(caretAnchor);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);
    handleInput();
  };

  const handleReturn = (soft: boolean) => {
    const range = editorRange();
    const editor = editorRef.current;
    if (!editor || !range) return;
    if (latest.current.singleLine) {
      if (!soft) splitParagraph(range);
      return;
    }
    if (!soft) {
      const element = elementOf(range.startContainer);
      const item = element?.closest("li");
      if (item) {
        if (!latest.current.onListItemReturn?.(item)) splitListItemAtCaret(item);
        return;
      }
      const heading = element?.closest("h1,h2,h3,h4,h5,h6");
      if (heading) { exitHeadingInline(heading as HTMLElement); return; }
      const separator = latest.current.onEnter && precedingBreak(range, editor);
      if (separator) { splitParagraph(range, separator); return; }
    }
    insertLineBreak();
  };

  // Mobile keyboards can send a beforeinput without a keydown. Use the native
  // event to read inputType. Preventing the desktop keydown suppresses beforeinput.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onBeforeInput = (event: InputEvent) => {
      if (!event.cancelable || event.defaultPrevented || event.isComposing || isComposingRef.current) return;
      const limit = limitRef.current;
      if (limit) beforeEdit.current = selectionOffsets(editor, editorRange());
      if (limit && event.inputType === "insertText" && event.data && event.data.length > limit.remaining + (editorRange()?.toString().length ?? 0)) {
        event.preventDefault();
        return;
      }
      if (event.inputType !== "insertParagraph" && event.inputType !== "insertLineBreak") return;
      event.preventDefault();
      handleReturn(event.inputType === "insertLineBreak");
    };
    editor.addEventListener("beforeinput", onBeforeInput);
    return () => editor.removeEventListener("beforeinput", onBeforeInput);
    // handleReturn reads editor state and callbacks through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backspaceAtStart = (event: KeyboardEvent, editor: HTMLElement): boolean => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return false;
    const item = caretElement()?.closest("li");
    if (item && isAtStartOf(item)) {
      event.preventDefault();
      ejectListItem(item);
      return true;
    }
    if (!latest.current.onMergeBackward || !isAtStartOf(editor)) return false;
    event.preventDefault();
    latest.current.onMergeBackward(editableHtml(editor));
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const editor = editorRef.current;
    if (!editor || event.nativeEvent.isComposing || isComposingRef.current || event.nativeEvent.keyCode === 229) return;
    if (event.key === "Enter") {
      event.preventDefault();
      handleReturn(event.shiftKey);
      return;
    }
    if (event.key === "Backspace" && !event.shiftKey && !event.ctrlKey && !event.metaKey && backspaceAtStart(event, editor)) return;
    if (event.key === "Delete" && latest.current.onMergeForward && isAtEndOf(editor)) {
      event.preventDefault();
      latest.current.onMergeForward();
      return;
    }
    if (event.key === "ArrowUp" && !event.shiftKey && latest.current.onNavigate && isAtStartOf(editor)) {
      event.preventDefault();
      latest.current.onNavigate("up");
      return;
    }
    if (event.key === "ArrowDown" && !event.shiftKey && latest.current.onNavigate && isAtEndOf(editor)) {
      event.preventDefault();
      latest.current.onNavigate("down");
      return;
    }
    handleFormattingShortcut(event);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
    if (limitRef.current && editorRef.current) beforeEdit.current = selectionOffsets(editorRef.current, editorRange());
  };
  const handleCompositionEnd = (event: CompositionEvent) => {
    isComposingRef.current = false;
    if (event.data) handleInput();
    if (pendingValueRef.current !== null) {
      const pending = pendingValueRef.current;
      pendingValueRef.current = null;
      if (pending !== lastValueRef.current) applyValue(pending);
    }
  };

  const isEmpty = !value || value === "<br>";
  const editorRect = editorRef.current?.getBoundingClientRect();
  const popoverTop = linkPopoverPosition?.top ?? (editorRect?.bottom ?? 100) + 6;
  const popoverLeft = linkPopoverPosition?.left ?? editorRect?.left ?? 20;

  const openAddress = editedLink ? linkPreviewAddress(linkInputValue, editedLink.ownerDocument.baseURI) : undefined;
  const linkOpenLabel = messages.editor.linkOpen ?? en.editor.linkOpen;
  const linkRemoveLabel = messages.editor.linkRemove ?? en.editor.linkRemove;
  const linkPopover = showLinkInput && typeof document !== "undefined"
    ? createPortal(
        <div role="dialog" aria-label={messages.editor.linkUrlPrompt} className="elea-link-popover" {...linkScope} style={{ position: "fixed", top: popoverTop, left: popoverLeft }}>
          <input
            ref={linkInputRef}
            type="url"
            value={linkInputValue}
            onChange={(event) => { setLinkInputValue(event.target.value); setLinkUrlError(false); }}
            onKeyDown={(event) => {
              if (event.key === "Enter") { event.preventDefault(); submitLink(); }
              if (event.key === "Escape") { event.preventDefault(); closeLinkInput(); }
            }}
            placeholder={messages.editor.linkUrlPlaceholder}
            aria-label={messages.editor.linkUrlPrompt}
            aria-invalid={linkUrlError}
            className={`elea-link-popover__input${linkUrlError ? " elea-link-popover__input--invalid" : ""}`}
          />
          {linkUrlError && <span className="elea-link-popover__error" role="alert">{messages.editor.linkUrlInvalid}</span>}
          <button type="button" className="elea-link-popover__button elea-link-popover__button--confirm" onMouseDown={(event) => { event.preventDefault(); submitLink(); }} aria-label={messages.editor.linkConfirm}>
            <CheckIcon />
          </button>
          {editedLink && <>
            <a className="elea-link-popover__button" href={openAddress} target="_blank" rel="noopener noreferrer" aria-label={linkOpenLabel} title={linkOpenLabel}>
              <ExternalLinkIcon />
            </a>
            <button type="button" className="elea-link-popover__button" onMouseDown={(event) => { event.preventDefault(); removeLink(); }} aria-label={linkRemoveLabel} title={linkRemoveLabel}>
              <TrashIcon />
            </button>
          </>}
          <button type="button" className="elea-link-popover__button" onMouseDown={(event) => { event.preventDefault(); closeLinkInput(); }} aria-label={messages.editor.linkCancel}>
            <CloseIcon />
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div
      className="elea-richtext"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur?.(event);
      }}
    >
      {linkPopover}
      <div className="elea-richtext__area">
        {isEmpty && <div className="elea-richtext__placeholder" aria-hidden="true">{effectivePlaceholder}</div>}
        <div
          ref={setEditorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={effectivePlaceholder}
          tabIndex={0}
          aria-describedby={textLimit?.counterId}
          onInput={handleInput}
          onFocus={onFocus}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={["elea-richtext__editable", className].filter(Boolean).join(" ")}
          style={style}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
});
