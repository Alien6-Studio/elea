"use client";

import { applyLinkTarget, resolveLinkUrl, type BlockLike } from "@alien6-studio/elea-content";
import { parseClipboard } from "./paste.js";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ClipboardEvent, type CompositionEvent, type CSSProperties, type FocusEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, CloseIcon } from "./icons.js";
import { useContentServices } from "./provider.js";

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
}

export const EMPTY_FORMATS: ActiveFormats = {
  bold: false, italic: false, underline: false,
  h1: false, h2: false, h3: false, h4: false, h5: false, h6: false,
  blockquote: false, ul: false, ol: false,
};

export type InlineTag = "strong" | "em" | "u";
export type ListTag = "ul" | "ol";
export type BlockTag = "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Formatting commands a toolbar outside the editable area can drive. */
export interface RichTextFieldHandle {
  applyInlineFormat: (tag: InlineTag) => void;
  applyListFormat: (tag: ListTag) => void;
  applyBlockFormat: (tag: BlockTag) => void;
  openLinkInput: () => void;
  clearFormat: () => void;
}

export interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: (() => void) | undefined;
  onBlur?: ((event?: FocusEvent) => void) | undefined;
  /** Shift+Enter: the content after the caret leaves this editor to start a new block. */
  onEnter?: ((before: string, after: string) => void) | undefined;
  /**
   * A paste holding several blocks: the first one stays in this field, the others follow
   * it, and the content that sat after the caret ends up after them.
   */
  onInsertBlocks?: ((blocks: BlockLike[], after: string) => void) | undefined;
  onSelectionChange?: ((formats: ActiveFormats) => void) | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI"]);
const OUTER_BLOCK_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "blockquote"]);
const UNWRAP_TAGS = new Set(["STRONG", "EM", "U", "A", "MARK", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"]);

function elementOf(node: Node | null | undefined): HTMLElement | null {
  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
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

/**
 * Rich text on a contentEditable element. Formatting commands are exposed through the
 * handle so a toolbar outside the DOM subtree can drive them; the last selection inside
 * the editor is remembered so focus can be restored after a toolbar click.
 */
export const RichTextField = forwardRef<RichTextFieldHandle, RichTextFieldProps>(function RichText(
  { value, onChange, onFocus, onBlur, onEnter, onInsertBlocks, onSelectionChange, placeholder, className, style },
  ref,
) {
  const { sanitizer, messages, siteHostnames } = useContentServices();
  const linkOptions = siteHostnames ? { siteHostnames } : {};
  const effectivePlaceholder = placeholder ?? messages.editor.startWriting;
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const lastValueRef = useRef(value);
  const lastSelectionRef = useRef<Range | null>(null);
  // Commands run from memoized callbacks and from the imperative handle: they read the
  // props through this ref so a parent re-render never leaves them with stale callbacks
  const latest = useRef({ onChange, onEnter, onInsertBlocks, onSelectionChange, sanitizer, linkOptions });
  latest.current = { onChange, onEnter, onInsertBlocks, onSelectionChange, sanitizer, linkOptions };
  // A value that arrives while the field is composing text is applied once the composition ends
  const pendingValueRef = useRef<string | null>(null);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [linkUrlError, setLinkUrlError] = useState(false);
  const [linkPopoverPosition, setLinkPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const savedSelectionForLinkRef = useRef<Range | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // DOM sync: the stored value is sanitized on the way in, never trusted as is
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML === "") {
      editorRef.current.innerHTML = sanitizer.sanitize(value);
      lastValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Writes a value into the field; the caret goes to the end when the field has focus. */
  const applyValue = (next: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = next ? sanitizer.sanitize(next) : "";
    lastValueRef.current = next;
    if (document.activeElement === editor) {
      const selection = globalThis.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
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
      bold: !!element.closest("strong"),
      italic: !!element.closest("em"),
      underline: !!element.closest("u"),
      h1: !!element.closest("h1"), h2: !!element.closest("h2"), h3: !!element.closest("h3"),
      h4: !!element.closest("h4"), h5: !!element.closest("h5"), h6: !!element.closest("h6"),
      blockquote: !!element.closest("blockquote"),
      ul: !!element.closest("ul"),
      ol: !!element.closest("ol"),
    };
  };

  useEffect(() => {
    const saveSelection = () => {
      const selection = globalThis.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
        latest.current.onSelectionChange?.(getActiveFormats());
      }
    };
    document.addEventListener("selectionchange", saveSelection);
    return () => document.removeEventListener("selectionchange", saveSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastValueRef.current = html;
    latest.current.onChange(html);
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
    if (pasted.inline !== null) {
      insertInlineHtml(pasted.inline, range, selection);
      handleInput();
      return;
    }
    const [first, ...rest] = pasted.blocks;
    if (!first) return;
    const after = insertBlocks ? extractContentAfterCaret(range, editor) : "";
    const firstIsText = first.type === "paragraph" && typeof (first.data as { text?: unknown }).text === "string";
    if (firstIsText) {
      insertInlineHtml((first.data as { text: string }).text, range, selection);
      handleInput();
      if (insertBlocks) insertBlocks(rest, after);
    } else {
      handleInput();
      if (insertBlocks) insertBlocks(pasted.blocks, after);
    }
  };

  const extractContentAfterCaret = (range: Range, element: HTMLElement): string => {
    const after = range.cloneRange();
    after.selectNodeContents(element);
    after.setStart(range.endContainer, range.endOffset);
    const holder = document.createElement("div");
    holder.appendChild(after.cloneContents());
    after.deleteContents();
    return holder.innerHTML;
  };

  const stripOuterBlockTag = (html: string): string => {
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const only = holder.childNodes.length === 1 ? holder.firstElementChild : null;
    return only && OUTER_BLOCK_TAGS.has(only.tagName.toLowerCase()) ? only.innerHTML : html;
  };

  /** The current range when it sits inside this editor; a stale selection elsewhere is ignored. */
  const editorRange = (): Range | null => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return null;
    const range = selection.getRangeAt(0);
    return editorRef.current.contains(range.commonAncestorContainer) ? range : null;
  };

  const handleEnterKey = () => {
    const { onEnter: enter, onChange: change } = latest.current;
    if (!enter || !editorRef.current) return;
    const range = editorRange();
    const after = range ? extractContentAfterCaret(range, editorRef.current) : "";
    const before = editorRef.current.innerHTML;
    lastValueRef.current = before;
    change(before);
    enter(before, stripOuterBlockTag(after));
  };

  const toggleInlineFormat = (tag: InlineTag) => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
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
    handleInput();
  };

  const insertList = (tag: ListTag) => {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    const closest = elementOf(range.commonAncestorContainer)?.closest("ul, ol");
    if (closest && closest.tagName.toLowerCase() === tag) {
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
    anchor.href = url;
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
    const selection = globalThis.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : lastSelectionRef.current;
    // Inside an existing link: remove it instead of nesting one
    const existingLink = elementOf(range?.startContainer)?.closest("a");
    if (existingLink) {
      unwrap(existingLink);
      handleInput();
      return;
    }
    savedSelectionForLinkRef.current = range ? range.cloneRange() : null;
    const selected = range ? range.toString().trim() : "";
    const rangeRect = range?.getBoundingClientRect();
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
    editorRef.current?.focus();
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
    if (range) createLinkAtRange(url, range);
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
    if (range.collapsed) {
      // Whole block becomes plain lines
      // innerText keeps the visual line breaks; some DOM implementations only offer textContent
      const text = (editor as { innerText?: string }).innerText ?? editor.textContent ?? "";
      editor.innerHTML = "";
      text.split("\n").forEach((line, index) => {
        if (index > 0) editor.appendChild(document.createElement("br"));
        if (line) editor.appendChild(document.createTextNode(line));
      });
    } else {
      const text = range.toString();
      const listContainer = elementOf(range.commonAncestorContainer)?.closest("ul, ol");
      if (listContainer && editor.contains(listContainer)) {
        // The whole list becomes plain lines, one per item
        const lines = Array.from(listContainer.querySelectorAll("li")).map((item) => item.textContent ?? "");
        const parent = listContainer.parentNode as Node;
        const insertRef = listContainer.nextSibling;
        listContainer.remove();
        let lastInserted: Node | null = null;
        lines.filter((line) => line !== "").forEach((line, index) => {
          if (index > 0) parent.insertBefore(document.createElement("br"), insertRef);
          const textNode = document.createTextNode(line);
          parent.insertBefore(textNode, insertRef);
          lastInserted = textNode;
        });
        const next = document.createRange();
        if (lastInserted) next.setStartAfter(lastInserted);
        else next.setStart(editor, editor.childNodes.length);
        next.collapse(true);
        selection.removeAllRanges();
        selection.addRange(next);
      } else {
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
    }
    handleInput();
  };

  // Rebuilt on every render on purpose: each command closes over this render's handlers
  useImperativeHandle(ref, () => ({
    applyInlineFormat: (tag) => { restoreSelection(); toggleInlineFormat(tag); },
    applyListFormat: (tag) => { restoreSelection(); insertList(tag); },
    applyBlockFormat: (tag) => { restoreSelection(); toggleBlockFormat(tag); },
    openLinkInput: () => { restoreSelection(); openLinkInput(); },
    clearFormat: () => { clearFormat(); },
  }));

  const handleFormattingShortcut = (event: KeyboardEvent): boolean => {
    if (!event.ctrlKey && !event.metaKey) return false;
    switch (event.key) {
      case "b": event.preventDefault(); toggleInlineFormat("strong"); return true;
      case "i": event.preventDefault(); toggleInlineFormat("em"); return true;
      case "u": event.preventDefault(); toggleInlineFormat("u"); return true;
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

  const insertLineBreak = () => {
    const selection = globalThis.getSelection();
    const range = editorRange();
    if (!selection || !range) return;
    range.deleteContents();
    const br = document.createElement("br");
    range.insertNode(br);
    const after = document.createRange();
    after.setStartAfter(br);
    after.collapse(true);
    selection.removeAllRanges();
    selection.addRange(after);
    // A trailing break needs a sentinel so the caret can sit on the new line
    if (!br.nextSibling || (br.nextSibling.nodeType === Node.TEXT_NODE && br.nextSibling.textContent === "")) {
      br.parentNode?.insertBefore(document.createElement("br"), br.nextSibling);
    }
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
    const before: Element[] = [];
    const afterItems: Element[] = [];
    let found = false;
    for (const child of Array.from(list.children)) {
      if (child === item) { found = true; continue; }
      (found ? afterItems : before).push(child);
    }
    const parent = list.parentNode as Node;
    const insertRef = list.nextSibling;
    const tag = list.tagName.toLowerCase();
    list.remove();
    if (before.length > 0) {
      const listBefore = document.createElement(tag);
      for (const element of before) listBefore.appendChild(element);
      parent.insertBefore(listBefore, insertRef);
    }
    const nodes = Array.from(fragment.childNodes);
    for (const node of nodes) parent.insertBefore(node, insertRef);
    const br = document.createElement("br");
    parent.insertBefore(br, insertRef);
    if (afterItems.length > 0) {
      const listAfter = document.createElement(tag);
      for (const element of afterItems) listAfter.appendChild(element);
      parent.insertBefore(listAfter, insertRef);
    }
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
    const parent = heading.parentNode as Node;
    const insertRef = heading.nextSibling;
    let caretAnchor: Node;
    if (fragment.childNodes.length > 0 && fragment.textContent !== "") {
      caretAnchor = fragment.firstChild as Node;
      parent.insertBefore(fragment, insertRef);
      parent.insertBefore(document.createElement("br"), insertRef);
    } else {
      const first = document.createElement("br");
      parent.insertBefore(first, insertRef);
      parent.insertBefore(document.createElement("br"), insertRef);
      caretAnchor = first;
    }
    const caret = document.createRange();
    caret.setStartAfter(caretAnchor);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);
    handleInput();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) { handleEnterKey(); return; }
      const element = caretElement();
      const item = element?.closest("li");
      if (item) { splitListItemAtCaret(item); return; }
      const heading = element?.closest("h1,h2,h3,h4,h5,h6");
      if (heading) { exitHeadingInline(heading as HTMLElement); return; }
      insertLineBreak();
      return;
    }
    if (event.key === "Backspace") {
      const selection = globalThis.getSelection();
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const item = caretElement()?.closest("li");
        if (item && isAtStartOf(item)) {
          event.preventDefault();
          ejectListItem(item);
          return;
        }
      }
    }
    handleFormattingShortcut(event);
  };

  const handleCompositionStart = () => { isComposingRef.current = true; };
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

  const linkPopover = showLinkInput && typeof document !== "undefined"
    ? createPortal(
        <div role="dialog" aria-label={messages.editor.linkUrlPrompt} className="elea-link-popover" style={{ position: "fixed", top: popoverTop, left: popoverLeft }}>
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
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={effectivePlaceholder}
          tabIndex={0}
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
