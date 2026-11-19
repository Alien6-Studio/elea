"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useContentServices } from "./provider.js";

export interface RichTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  /** Maximum number of plain-text characters; typing and pasting stop at the limit. */
  maxLength?: number | undefined;
  id?: string | undefined;
}

const NAVIGATION_KEYS = new Set(["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Tab"]);

function elementOf(node: Node | null): HTMLElement | null {
  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
}

/** A one-field rich text with the basic formats: bold, italic, underline, lists. For descriptions and short texts. */
export function RichTextInput({ value, onChange, placeholder, disabled = false, maxLength, id }: RichTextInputProps) {
  const { sanitizer, messages } = useContentServices();
  const effectivePlaceholder = placeholder ?? messages.editor.inputPlaceholder;
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSetValueRef = useRef(value);
  const [isFocused, setIsFocused] = useState(false);

  // Controlled sync rule, the same as RichTextField: a value equal to the last one emitted or
  // applied is an echo and is ignored; any other value is an external replacement and is
  // applied even while the field has focus, with the caret moved to the end
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === lastSetValueRef.current) return;
    editor.innerHTML = value ? sanitizer.sanitize(value) : "";
    lastSetValueRef.current = value;
    if (document.activeElement === editor) {
      const selection = globalThis.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [value, sanitizer]);

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML === "") {
      editorRef.current.innerHTML = sanitizer.sanitize(value);
      lastSetValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plainTextLength = () => editorRef.current?.textContent?.length ?? 0;

  const handleInput = () => {
    if (!editorRef.current) return;
    lastSetValueRef.current = editorRef.current.innerHTML;
    onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!maxLength) return;
    if (NAVIGATION_KEYS.has(event.key) || event.ctrlKey || event.metaKey) return;
    if (plainTextLength() >= maxLength) event.preventDefault();
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData("text/plain");
    event.preventDefault();
    const remaining = maxLength ? maxLength - plainTextLength() : Number.POSITIVE_INFINITY;
    if (remaining <= 0) return;
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text.slice(0, remaining));
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    handleInput();
  };

  const toggleInlineFormat = (tag: "strong" | "em" | "u") => {
    editorRef.current?.focus();
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const existing = elementOf(range.commonAncestorContainer)?.closest(tag);
    if (existing) {
      const fragment = document.createDocumentFragment();
      while (existing.firstChild) fragment.appendChild(existing.firstChild);
      existing.replaceWith(fragment);
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

  const removeInlineFormat = () => {
    editorRef.current?.focus();
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const text = range.toString();
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    // The inline wrappers around the reinserted text go too
    let node: Node | null = textNode.parentNode;
    while (node && node !== editorRef.current) {
      const tag = (node as Element).tagName;
      if (tag === "STRONG" || tag === "EM" || tag === "U" || tag === "B" || tag === "I") {
        const wrapper = node as Element;
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
        wrapper.replaceWith(fragment);
        node = textNode.parentNode;
      } else {
        node = node.parentNode;
      }
    }
    const next = document.createRange();
    next.selectNodeContents(textNode);
    selection.removeAllRanges();
    selection.addRange(next);
    handleInput();
  };

  const insertList = (tag: "ul" | "ol") => {
    editorRef.current?.focus();
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const text = range.toString();
    const lines = text.split("\n").filter((line) => line.trim());
    const list = document.createElement(tag);
    for (const line of lines.length > 0 ? lines : [text]) {
      const item = document.createElement("li");
      item.textContent = line.trim();
      list.appendChild(item);
    }
    range.deleteContents();
    range.insertNode(list);
    const next = document.createRange();
    next.setStartAfter(list);
    next.collapse(true);
    selection.removeAllRanges();
    selection.addRange(next);
    handleInput();
  };

  const button = (label: string, onClick: () => void, children: React.ReactNode) => (
    <button type="button" className="elea-toolbar__button" title={label} aria-label={label} onMouseDown={(event) => { event.preventDefault(); onClick(); }}>
      {children}
    </button>
  );

  return (
    <div className={`elea-richtext-input${isFocused ? " elea-richtext-input--focused" : ""}${disabled ? " elea-richtext-input--disabled" : ""}`}>
      {!disabled && (
        <div className="elea-toolbar" role="toolbar" aria-label={messages.toolbar.removeFormat}>
          {button(messages.toolbar.removeFormat, removeInlineFormat, <span>{messages.toolbar.removeFormat}</span>)}
          <span className="elea-toolbar__separator" />
          {button(messages.toolbar.bold, () => toggleInlineFormat("strong"), <strong>B</strong>)}
          {button(messages.toolbar.italic, () => toggleInlineFormat("em"), <em>I</em>)}
          {button(messages.toolbar.underline, () => toggleInlineFormat("u"), <u>U</u>)}
          <span className="elea-toolbar__separator" />
          {button(messages.toolbar.bulletList, () => insertList("ul"), <span>{messages.toolbar.bulletListLabel}</span>)}
          {button(messages.toolbar.orderedList, () => insertList("ol"), <span>{messages.toolbar.orderedListLabel}</span>)}
        </div>
      )}
      <div
        ref={editorRef}
        id={id}
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        aria-label={effectivePlaceholder}
        aria-disabled={disabled || undefined}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="elea-richtext-input__editable"
        data-placeholder={effectivePlaceholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
