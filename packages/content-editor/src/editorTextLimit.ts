"use client";

import { asRecord, asString, htmlToText, type BlockLike, type BlockRegistry, type EleaBlock, type ListItem } from "@alien6-studio/elea-content";
import { textPoint } from "./caret.js";
import { createContext, useContext, useId, useMemo } from "react";

/** Count the same UTF-16 units as a text control, excluding the editor's markup. */
export const inputText = (html: string) => htmlToText(html, { collapseWhitespace: false, lineBreaks: false });

function itemText(item: unknown): string {
  if (typeof item === "string") return inputText(item);
  const { content, items } = asRecord(item);
  return inputText(asString(content)) + (Array.isArray(items) ? items.map(itemText).join("") : "");
}

function blockText(block: BlockLike, registry: BlockRegistry): string {
  const data = asRecord(block.data);
  switch (block.type) {
    case "paragraph":
    case "header": return inputText(asString(data.text));
    case "quote": return inputText(asString(data.text)) + asString(data.caption);
    case "list":
    case "nestedlist": return Array.isArray(data.items) ? data.items.map(itemText).join("") : "";
    case "image":
    case "video": return asString(data.caption);
    case "code": return asString(data.code);
    default: return registry.toText({ type: block.type, data });
  }
}

/** Keep a whole code point at the end of a paste, even when the last unit is a surrogate. */
export function textPrefix(text: string, capacity: number): string {
  const prefix = text.slice(0, Math.max(0, capacity));
  const last = prefix.codePointAt(prefix.length - 1) ?? 0;
  return last >= 0xd800 && last <= 0xdbff ? prefix.slice(0, -1) : prefix;
}

export interface EditorTextLimit {
  count: number;
  max: number;
  remaining: number;
  counterId: string;
  text: (block: BlockLike) => string;
  accepts: (blocks: EleaBlock[]) => boolean;
}
export const TextLimitContext = createContext<EditorTextLimit | undefined>(undefined);

/** Let the browser enforce the shared allowance on ordinary inputs, including pasted selections. */
export function useTextLimitAttributes(value: string) {
  const limit = useContext(TextLimitContext);
  return limit && { maxLength: Math.min(0x7fffffff, value.length + limit.remaining), "aria-describedby": limit.counterId };
}

export function useEditorTextLimit(blocks: EleaBlock[], maxLength: number | undefined, registry: BlockRegistry) {
  const counterId = useId();
  const text = useMemo(() => {
    const cache = new WeakMap<BlockLike, string>();
    return (block: BlockLike) => {
      const cached = cache.get(block);
      if (cached !== undefined) return cached;
      const result = blockText(block, registry);
      cache.set(block, result);
      return result;
    };
  }, [registry]);
  return useMemo<EditorTextLimit | undefined>(() => {
    if (maxLength === undefined || !Number.isSafeInteger(maxLength) || maxLength < 0) return undefined;
    const length = (items: EleaBlock[]) => items.reduce((sum, block) => sum + text(block).length, 0);
    const count = length(blocks);
    return { count, max: maxLength, counterId, text, remaining: Math.max(0, maxLength - count),
      accepts: (next) => length(next) <= Math.max(count, maxLength) };
  }, [blocks, maxLength, counterId, text]);
}

/** Keep the prefix of a sanitized rich run, including marks and links across the cut. */
export function clipMarkup(html: string, capacity: number): string {
  if (capacity <= 0) return "";
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;
  const prefix = textPrefix(root.textContent, capacity);
  if (!prefix) return "";
  const tail = document.createRange();
  tail.selectNodeContents(root);
  tail.setStart(...textPoint(root, prefix.length));
  tail.deleteContents();
  return root.textContent ? template.innerHTML : "";
}

function clipItems(items: ListItem[], capacity: number): ListItem[] {
  const fitted: ListItem[] = [];
  for (const item of items) {
    if (capacity <= 0) break;
    const content = typeof item === "string" ? item : item.content;
    const length = inputText(content).length;
    const clipped = length > capacity ? clipMarkup(content, capacity) : content;
    capacity -= length;
    if (typeof item === "string") fitted.push(clipped);
    else {
      const children = clipItems(item.items ?? [], capacity);
      fitted.push({ ...item, content: clipped, ...(item.items && { items: children }) });
      capacity -= children.reduce((sum, child) => sum + itemText(child).length, 0);
    }
  }
  return fitted;
}

function clipBlock<T extends BlockLike>(block: T, capacity: number): T | undefined {
  if (capacity <= 0) return undefined;
  const data = asRecord(block.data);
  switch (block.type) {
    case "paragraph":
    case "header":
    case "quote": {
      const clipped = clipMarkup(asString(data.text), capacity);
      const caption = block.type === "quote" ? { caption: textPrefix(asString(data.caption), capacity - inputText(clipped).length) } : {};
      return clipped || caption.caption ? { ...block, data: { ...data, text: clipped, ...caption } } : undefined;
    }
    case "list":
    case "nestedlist": return { ...block, data: { ...data, items: clipItems(data.items as ListItem[], capacity) } };
    case "code": return { ...block, data: { ...data, code: textPrefix(asString(data.code), capacity) } };
    case "image":
    case "video": return { ...block, data: { ...data, caption: textPrefix(asString(data.caption), capacity) } };
    default: return undefined;
  }
}

/** Opaque extension blocks are copied atomically; editable text keeps its formatting. */
export function fitPastedBlocks<T extends BlockLike>(incoming: T[], capacity: number, text: EditorTextLimit["text"]): T[] {
  const accepted: T[] = [];
  for (const block of incoming) {
    const length = text(block).length;
    if (length > capacity) {
      const clipped = clipBlock(block, capacity);
      if (clipped) accepted.push(clipped);
      break;
    }
    accepted.push(block);
    capacity -= length;
  }
  return accepted;
}
