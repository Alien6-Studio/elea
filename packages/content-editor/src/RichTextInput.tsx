"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
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

function elementOf(node: Node | null): HTMLElement | null {
  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
}

function unwrap(element: Element) {
  const content = document.createDocumentFragment();
  while (element.firstChild) content.appendChild(element.firstChild);
  element.replaceWith(content);
}

function fieldRange(editor: HTMLElement | null) {
  const selection = globalThis.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  return editor?.contains(range.commonAncestorContainer) ? range : null;
}

function selectRange(range: Range) {
  const selection = globalThis.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/** A one-field rich text with the basic formats: bold, italic, underline, lists. For descriptions and short texts. */
export function RichTextInput({ value, onChange, placeholder, disabled = false, maxLength, id }: Readonly<RichTextInputProps>) {
  const { sanitizer, messages } = useContentServices();
  const effectivePlaceholder = placeholder ?? messages.editor.inputPlaceholder;
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSetValueRef = useRef<string | undefined>(undefined);
  const savedRange = useRef<Range | null>(null);

  // Ignore echoes of our own edits; an external value replaces even a focused field.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === lastSetValueRef.current) return;
    editor.innerHTML = value ? sanitizer.sanitize(value) : "";
    lastSetValueRef.current = value;
    savedRange.current = null;
    if (document.activeElement === editor) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selectRange(range);
    }
  }, [value, sanitizer]);

  const remainingLength = (range: Range | null) => maxLength === undefined ? Infinity
    : maxLength - (editorRef.current?.textContent?.length ?? 0) + (range?.toString().length ?? 0);

  const handleInput = () => {
    if (!editorRef.current) return;
    lastSetValueRef.current = editorRef.current.innerHTML;
    onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (maxLength === undefined || event.ctrlKey || event.metaKey) return;
    if ([...event.key].length === 1 && event.key.length > remainingLength(fieldRange(editorRef.current))) event.preventDefault();
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const range = fieldRange(editorRef.current);
    if (!range || disabled) return;
    const remaining = remainingLength(range);
    if (remaining <= 0) return;
    const html = event.clipboardData.getData("text/html");
    const fragment = html ? range.createContextualFragment(sanitizer.sanitize(html)) : document.createDocumentFragment();
    if (!fragment.hasChildNodes()) fragment.append(event.clipboardData.getData("text/plain"));
    const text = fragment.textContent ?? "";
    if (text.length > remaining) fragment.replaceChildren(text.slice(0, remaining));
    const last = fragment.lastChild;
    if (!last) return;
    range.deleteContents();
    range.insertNode(fragment);
    range.setStartAfter(last);
    range.collapse(true);
    selectRange(range);
    handleInput();
  };

  const toggleInlineFormat = (range: Range, tag: "strong" | "em" | "u") => {
    if (range.collapsed) return;
    const existing = elementOf(range.commonAncestorContainer)?.closest(tag);
    if (existing) {
      unwrap(existing);
    } else {
      const wrapper = document.createElement(tag);
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      range.selectNodeContents(wrapper);
      selectRange(range);
    }
    handleInput();
  };

  const removeInlineFormat = (range: Range) => {
    if (range.collapsed) return;
    const text = range.toString();
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    for (let node = textNode.parentElement; node && node !== editorRef.current;) {
      const parent = node.parentElement;
      if (node.matches("strong,em,u,b,i")) unwrap(node);
      node = parent;
    }
    range.selectNodeContents(textNode);
    selectRange(range);
    handleInput();
  };

  const insertList = (range: Range, tag: "ul" | "ol") => {
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
    range.setStartAfter(list);
    range.collapse(true);
    selectRange(range);
    handleInput();
  };

  const button = (label: string, format: (range: Range) => void, children: React.ReactNode) => (
    <button type="button" className="elea-toolbar__button" title={label} aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        const range = fieldRange(editorRef.current) ?? savedRange.current;
        if (!range || !editorRef.current?.contains(range.commonAncestorContainer)) return;
        editorRef.current.focus();
        selectRange(range);
        format(range);
      }}
    >
      {children}
    </button>
  );

  return (
    <div className={`elea-richtext-input${disabled ? " elea-richtext-input--disabled" : ""}`}>
      {!disabled && (
        <div className="elea-toolbar" role="toolbar" aria-label={messages.toolbar.removeFormat}>
          {button(messages.toolbar.removeFormat, removeInlineFormat, <span>{messages.toolbar.removeFormat}</span>)}
          <span className="elea-toolbar__separator" />
          {button(messages.toolbar.bold, (range) => toggleInlineFormat(range, "strong"), <strong>B</strong>)}
          {button(messages.toolbar.italic, (range) => toggleInlineFormat(range, "em"), <em>I</em>)}
          {button(messages.toolbar.underline, (range) => toggleInlineFormat(range, "u"), <u>U</u>)}
          <span className="elea-toolbar__separator" />
          {button(messages.toolbar.bulletList, (range) => insertList(range, "ul"), <span>{messages.toolbar.bulletListLabel}</span>)}
          {button(messages.toolbar.orderedList, (range) => insertList(range, "ol"), <span>{messages.toolbar.orderedListLabel}</span>)}
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
        onBlur={() => { savedRange.current = fieldRange(editorRef.current)?.cloneRange() ?? null; }}
        className="elea-richtext-input__editable"
        data-placeholder={effectivePlaceholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
