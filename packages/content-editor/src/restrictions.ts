"use client";

import type { BlockLike } from "@alien6-studio/elea-content";
import { createContext, useContext } from "react";

export const EDITOR_MARKS = ["bold", "italic", "underline", "link"] as const;
/** An inline format a host can allow or leave out. */
export type EditorMark = (typeof EDITOR_MARKS)[number];

const MARK_TAGS: Record<EditorMark, readonly string[]> = { bold: ["strong", "b"], italic: ["em", "i"], underline: ["u"], link: ["a"] };
/** What the toolbar writes inside a paragraph for a heading, a quote or a list. */
const STRUCTURE_TAGS: Record<string, readonly string[]> = { header: ["h1", "h2", "h3", "h4", "h5", "h6"], quote: ["blockquote"], list: ["ul", "ol", "li"] };
const LINE_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI"]);

export interface RestrictionOptions {
  /** Allowed block types; every type when absent. A paragraph is always allowed: disallowed text falls back to it. */
  blockTypes?: readonly string[] | undefined;
  /** Allowed inline marks; all of them when absent. */
  marks?: readonly EditorMark[] | undefined;
  /** Told about the blocks `admit` leaves out. */
  onLeftOut?: ((blocks: BlockLike[]) => void) | undefined;
}

export interface RestrictedBlocks<T> {
  /** The blocks the allow-list accepts; the very same array when nothing had to change. */
  blocks: T[];
  /** Blocks without text that had no fallback. */
  leftOut: T[];
}

/** What a host field accepts: the single rule behind the toolbar, the menus, the shortcuts, loading and pasting. */
export interface EditorRestrictions {
  allowsBlock: (type: string) => boolean;
  allowsMark: (mark: EditorMark) => boolean;
  /** Rich text without the marks and structures the host leaves out; their text stays. */
  restrictHtml: (html: string) => string;
  /** Disallowed blocks carrying text become paragraphs, the others are left out. */
  restrict: <T extends BlockLike>(blocks: readonly T[]) => RestrictedBlocks<T>;
  /** `restrict` for incoming content: the blocks left out are reported to the host. */
  admit: <T extends BlockLike>(blocks: readonly T[]) => T[];
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function itemTexts(items: readonly unknown[]): string[] {
  return items.flatMap((item) => {
    if (typeof item === "string") return [item];
    const { content, items: nested } = (item ?? {}) as { content?: unknown; items?: unknown };
    return [...(typeof content === "string" ? [content] : []), ...(Array.isArray(nested) ? itemTexts(nested) : [])];
  });
}

/** The text a block carries, one entry per paragraph it falls back to; null when it carries none. */
function fallbackTexts(data: Record<string, unknown>): string[] | null {
  if (Array.isArray(data.items)) {
    const texts = itemTexts(data.items).filter(text => text.trim() !== "");
    return texts.length ? texts : [""];
  }
  if (typeof data.text === "string") return [data.text, ...(typeof data.caption === "string" && data.caption.trim() ? [data.caption] : [])];
  if (typeof data.code === "string") return [escapeHtml(data.code).replaceAll("\n", "<br>")];
  return null;
}

function unwrapLine(element: Element): void {
  const line = LINE_TAGS.has(element.tagName);
  const before = element.previousSibling;
  if (line && before && before.nodeName !== "BR") element.before(element.ownerDocument.createElement("br"));
  if (line && element.nextSibling) element.after(element.ownerDocument.createElement("br"));
  element.replaceWith(...Array.from(element.childNodes));
}

export function createRestrictions({ blockTypes, marks, onLeftOut }: RestrictionOptions): EditorRestrictions {
  const types = blockTypes ? new Set(["paragraph", ...blockTypes]) : null;
  const allowsBlock = (type: string) => !types || types.has(type);
  const allowsMark = (mark: EditorMark) => !marks || marks.includes(mark);
  const tags = [
    ...EDITOR_MARKS.filter(mark => !allowsMark(mark)).flatMap(mark => MARK_TAGS[mark]),
    ...Object.entries(STRUCTURE_TAGS).filter(([type]) => !allowsBlock(type)).flatMap(([, names]) => names),
  ];
  const pattern = tags.length ? new RegExp(String.raw`<(?:${tags.join("|")})[\s/>]`, "i") : null;

  const restrictHtml = (html: string): string => {
    if (!pattern?.test(html)) return html;
    const holder = document.createElement("template");
    holder.innerHTML = html;
    for (const element of Array.from(holder.content.querySelectorAll(tags.join(",")))) unwrapLine(element);
    return holder.innerHTML;
  };

  const restrictItems = (items: readonly unknown[]): unknown[] => {
    let changed = false;
    const next = items.map((item) => {
      if (typeof item === "string") {
        const text = restrictHtml(item);
        changed ||= text !== item;
        return text;
      }
      const record = (item ?? {}) as { content?: unknown; items?: unknown };
      const content = typeof record.content === "string" ? restrictHtml(record.content) : record.content;
      const nested = Array.isArray(record.items) ? restrictItems(record.items) : record.items;
      if (content === record.content && nested === record.items) return item;
      changed = true;
      return { ...record, content, items: nested };
    });
    return changed ? next : items as unknown[];
  };

  const restrictText = <T extends BlockLike>(block: T): T => {
    const data = block.data as Record<string, unknown> | null | undefined;
    if (!data || typeof data !== "object") return block;
    const text = typeof data.text === "string" ? restrictHtml(data.text) : data.text;
    const items = Array.isArray(data.items) ? restrictItems(data.items) : data.items;
    if (text === data.text && items === data.items) return block;
    return { ...block, data: { ...data, ...(text !== data.text && { text }), ...(items !== data.items && { items }) } };
  };

  const restrict = <T extends BlockLike>(blocks: readonly T[]): RestrictedBlocks<T> => {
    const kept: T[] = [];
    const leftOut: T[] = [];
    let changed = false;
    for (const block of blocks) {
      if (allowsBlock(block.type)) {
        const next = restrictText(block);
        changed ||= next !== block;
        kept.push(next);
        continue;
      }
      changed = true;
      const texts = fallbackTexts((block.data ?? {}) as Record<string, unknown>);
      if (!texts) {
        leftOut.push(block);
        continue;
      }
      texts.forEach((text, index) => {
        // Ids derive from the source block, so the same document always normalises to the same blocks
        const id = typeof block.id === "string" && index > 0 ? `${block.id}-${index}` : block.id;
        kept.push({ ...(id !== undefined && { id }), type: "paragraph", data: { text: restrictHtml(text) } } as T);
      });
    }
    return { blocks: changed ? kept : blocks as T[], leftOut };
  };

  const admit = <T extends BlockLike>(blocks: readonly T[]): T[] => {
    const accepted = restrict(blocks);
    if (accepted.leftOut.length) onLeftOut?.(accepted.leftOut);
    return accepted.blocks;
  };

  return { allowsBlock, allowsMark, restrictHtml, restrict, admit };
}

/** The allow-list of the editor around; undefined when the host restricts nothing. */
export const RestrictionsContext = createContext<EditorRestrictions | undefined>(undefined);

export function useRestrictions(): EditorRestrictions | undefined {
  return useContext(RestrictionsContext);
}
