"use client";

import { isSafeUrl, isSiteRelativeUrl, looksLikeMarkdown, markdownToBlocks, type BlockLike, type HtmlSanitizer, type ListItem } from "@alien6-studio/elea-content";
import { readBlocksFromClipboard } from "./selection.js";
import { clipboardBody } from "./clipboardHtml.js";

/** What a paste turns into: an inline fragment for the current field, or blocks for the document. */
export interface PastedContent {
  /** Sanitized inline HTML when the clipboard holds a single run of text. */
  inline: string | null;
  /** Blocks when the clipboard holds paragraphs, headings, lists, images... */
  blocks: BlockLike[];
}

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "PRE", "TABLE", "IMG", "FIGURE", "HR", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "NAV", "LI", "DL", "DD", "DT"]);
const CONTAINER_TAGS = new Set(["DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "NAV", "BODY", "SPAN", "FONT", "CENTER"]);

/**
 * Lifts the noise of office clipboards before sanitization: Google Docs wraps everything in a
 * bold tag with a normal font weight, Word adds classes, empty spans and `o:p` tags, both use
 * `<b>` and `<i>` where the document means strong and emphasis.
 */
function cleanClipboardTree(root: ParentNode): void {
  normalizeEmphasis(root);
  normalizeSpans(root);
  stripNoise(root);
}

function normalizeEmphasis(root: ParentNode): void {
  for (const element of Array.from(root.querySelectorAll("b, strong, i, em"))) {
    const weightNormal = /font-weight\s*:\s*(normal|400)/i.test(element.getAttribute("style") ?? "");
    const styleNormal = /font-style\s*:\s*normal/i.test(element.getAttribute("style") ?? "");
    if ((element.tagName === "B" || element.tagName === "STRONG") && weightNormal) unwrap(element);
    else if ((element.tagName === "I" || element.tagName === "EM") && styleNormal) unwrap(element);
    else if (element.tagName === "B") rename(element, "strong");
    else if (element.tagName === "I") rename(element, "em");
  }
}

function normalizeSpans(root: ParentNode): void {
  for (const element of Array.from(root.querySelectorAll("span[style]"))) {
    const style = element.getAttribute("style") ?? "";
    if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) rename(element, "strong");
    else if (/font-style\s*:\s*italic/i.test(style)) rename(element, "em");
    else if (/text-decoration\s*:\s*underline/i.test(style)) rename(element, "u");
  }
}

function stripNoise(root: ParentNode): void {
  for (const element of Array.from(root.querySelectorAll("*"))) {
    if (element.tagName.includes(":") || element.tagName === "META" || element.tagName === "STYLE" || element.tagName === "SCRIPT" || element.tagName === "LINK") {
      element.remove();
      continue;
    }
    element.removeAttribute("class");
    element.removeAttribute("id");
    element.removeAttribute("style");
    if (element.tagName === "SPAN" || element.tagName === "FONT") unwrap(element);
  }
}

function unwrap(element: Element): void {
  const fragment = element.ownerDocument.createDocumentFragment();
  while (element.firstChild) fragment.appendChild(element.firstChild);
  element.replaceWith(fragment);
}

function rename(element: Element, tag: string): Element {
  const next = element.ownerDocument.createElement(tag);
  while (element.firstChild) next.appendChild(element.firstChild);
  element.replaceWith(next);
  return next;
}

function hasBlockDescendant(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const element = node as Element;
  if (BLOCK_TAGS.has(element.tagName)) return true;
  return Array.from(element.childNodes).some(hasBlockDescendant);
}

function listItems(list: Element): ListItem[] {
  const items: ListItem[] = [];
  for (const item of Array.from(list.children)) {
    if (item.tagName !== "LI") continue;
    const nested = Array.from(item.children).filter((child) => child.tagName === "UL" || child.tagName === "OL");
    for (const child of nested) child.remove();
    const content = inlineHtml(item);
    const nestedItems = nested.flatMap(listItems);
    items.push(nestedItems.length > 0 ? { content, items: nestedItems } : content);
  }
  return items;
}

/** The inline HTML of a node, nested containers flattened and blank edges trimmed. */
function inlineHtml(node: Node): string {
  const parts = Array.from(node.childNodes, child => {
    if (child.nodeType === Node.TEXT_NODE) return escapeHtml(child.textContent ?? "").replaceAll("\u00a0", "&nbsp;");
    if (child.nodeType !== Node.ELEMENT_NODE) return "";
    const element = child as Element;
    if (CONTAINER_TAGS.has(element.tagName)) return inlineHtml(element);
    if (element.tagName === "P") return `${inlineHtml(element)}<br>`;
    return element.outerHTML;
  });
  return trimEdges(parts.join(""));
}

// Edges are scanned, not matched: nothing backtracks
function stripEdges(text: string, pieces: string[], spaces = false): string {
  let rest = text;
  for (;;) {
    if (spaces) rest = rest.trim();
    const head = pieces.find((piece) => rest.startsWith(piece));
    const tail = pieces.find((piece) => rest.endsWith(piece));
    if (!head && !tail) return rest;
    rest = rest.slice(head?.length ?? 0, tail ? -tail.length : undefined);
  }
}

const trimEdges = (html: string) => stripEdges(html, ["<br>", "&nbsp;"], true);

function paragraphBlock(html: string): BlockLike | null {
  const text = trimEdges(html);
  return text ? { type: "paragraph", data: { text } } : null;
}

/** The block a top-level element becomes: null when it carries nothing, undefined for a container to walk into. */
function elementBlock(element: Element): BlockLike | null | undefined {
  const tag = element.tagName;
  if (/^H[1-6]$/.test(tag)) {
    const text = inlineHtml(element);
    return text ? { type: "header", data: { text, level: Number(tag[1]) } } : null;
  }
  switch (tag) {
    case "UL":
    case "OL": {
      const items = listItems(element);
      return items.length > 0 ? { type: "list", data: { style: tag === "OL" ? "ordered" : "unordered", items } } : null;
    }
    case "BLOCKQUOTE": {
      const text = inlineHtml(element);
      return text ? { type: "quote", data: { text, caption: "" } } : null;
    }
    case "PRE": {
      const code = element.textContent ?? "";
      return code.trim() ? { type: "code", data: { code } } : null;
    }
    case "TABLE": {
      const content = Array.from(element.querySelectorAll("tr")).map((row) => Array.from(row.children).map((cell) => inlineHtml(cell)));
      return content.length > 0 ? { type: "table", data: { content } } : null;
    }
    case "HR":
      return { type: "delimiter", data: {} };
    case "IMG":
    case "FIGURE":
      return imageBlock(element);
    case "P":
      return paragraphBlock(inlineHtml(element));
    default:
      return undefined;
  }
}

function imageBlock(element: Element): BlockLike | null {
  const image = element.tagName === "IMG" ? element : element.querySelector("img");
  const src = image?.getAttribute("src") ?? "";
  const caption = element.tagName === "FIGURE" ? (element.querySelector("figcaption")?.textContent ?? "") : "";
  if (!isSafeUrl(src) && !isSiteRelativeUrl(src)) return null;
  return { type: "image", data: { file: { url: src, id: "" }, caption: caption.trim(), alt: image?.getAttribute("alt") ?? "" } };
}

/** Turns the top-level nodes of a cleaned clipboard tree into blocks. */
function nodesToBlocks(nodes: Node[], blocks: BlockLike[], pending: string[]): void {
  const flushPending = () => {
    const paragraph = pending.length > 0 ? paragraphBlock(pending.join("")) : null;
    if (paragraph) blocks.push(paragraph);
    pending.length = 0;
  };
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) pending.push(escapeHtml(node.textContent));
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const element = node as Element;
    if (!hasBlockDescendant(element)) {
      pending.push(element.outerHTML);
      continue;
    }
    flushPending();
    const block = elementBlock(element);
    if (block) blocks.push(block);
    else if (block === undefined) {
      // Containers: recurse into their children
      nodesToBlocks(Array.from(element.childNodes), blocks, pending);
      flushPending();
    }
  }
  flushPending();
}

/** Parses clipboard HTML into either an inline fragment or blocks, every piece sanitized. */
export function parsePastedHtml(html: string, sanitizer: HtmlSanitizer): PastedContent {
  const body = clipboardBody(html);
  cleanClipboardTree(body);
  const nodes = Array.from(body.childNodes);
  if (!nodes.some(hasBlockDescendant)) {
    // Edge spaces are meaningful inside a run of text; only stray line breaks go
    const inline = stripEdges(sanitizer.sanitize(body.innerHTML), ["\n", "<br>"]);
    return { inline, blocks: [] };
  }
  const blocks: BlockLike[] = [];
  nodesToBlocks(nodes, blocks, []);
  cleanBlocks(blocks, sanitizer);
  return { inline: null, blocks };
}

/** Cleans in place every rich text a block carries: text, list items, table cells, raw HTML. */
export function cleanBlocks(blocks: BlockLike[], sanitizer: HtmlSanitizer): void {
  const clean = (value: string) => sanitizer.sanitize(value);
  const items = (list: ListItem[]): ListItem[] => list.map(item => typeof item === "string" ? clean(item) : {
    ...item, content: clean(item.content), ...(item.items && { items: items(item.items) }),
  });
  for (const block of blocks) {
    const data = block.data as Record<string, unknown> | undefined;
    if (!data) continue;
    if (typeof data.text === "string") data.text = clean(data.text);
    if (typeof data.html === "string") data.html = clean(data.html);
    if (Array.isArray(data.items)) data.items = items(data.items);
    if (Array.isArray(data.content)) data.content = (data.content as unknown[]).map(row => Array.isArray(row) ? row.map(cell => clean(String(cell ?? ""))) : row);
  }
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * Plain text: Markdown is read as such (a heading, a list, a fence, emphasis or links give it
 * away), otherwise one block per blank-line separated paragraph, single newlines kept as line
 * breaks.
 */
export function parsePastedText(text: string, sanitizer?: HtmlSanitizer): PastedContent {
  const normalized = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (looksLikeMarkdown(normalized)) {
    const blocks = markdownToBlocks(normalized);
    if (sanitizer) cleanBlocks(blocks, sanitizer);
    if (blocks.length === 1 && blocks[0]?.type === "paragraph") return { inline: String((blocks[0].data as { text: string }).text), blocks: [] };
    return { inline: null, blocks };
  }
  const paragraphs = normalized.split(/\n[ \t]*\n/).map((chunk) => chunk.trim()).filter((chunk) => chunk.length > 0);
  if (paragraphs.length <= 1) return { inline: escapeHtml(stripEdges(normalized, ["\n"])).replaceAll("\n", "<br>"), blocks: [] };
  return { inline: null, blocks: paragraphs.map((chunk) => ({ type: "paragraph", data: { text: escapeHtml(chunk).replaceAll("\n", "<br>") } })) };
}

/** Reads the clipboard of a paste event: rich HTML when there is some, plain text otherwise. */
export function parseClipboard(clipboard: Pick<DataTransfer, "getData">, sanitizer: HtmlSanitizer): PastedContent {
  // Blocks copied from an Elea editor travel whole, attachments and media included.
  // Any page can forge that clipboard format, so their rich text is cleaned like any paste.
  const blocks = readBlocksFromClipboard(clipboard);
  if (blocks) {
    cleanBlocks(blocks, sanitizer);
    return { inline: null, blocks };
  }
  const html = clipboard.getData("text/html");
  if (html?.trim()) return parsePastedHtml(html, sanitizer);
  return parsePastedText(clipboard.getData("text/plain") ?? "", sanitizer);
}
