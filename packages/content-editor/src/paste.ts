"use client";

import { isSafeUrl, looksLikeMarkdown, markdownToBlocks, type BlockLike, type HtmlSanitizer, type ListItem } from "@alien6-studio/elea-content";
import { readBlocksFromClipboard } from "./selection.js";

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
  for (const element of Array.from(root.querySelectorAll("b, strong, i, em"))) {
    const weightNormal = /font-weight\s*:\s*(normal|400)/i.test(element.getAttribute("style") ?? "");
    const styleNormal = /font-style\s*:\s*normal/i.test(element.getAttribute("style") ?? "");
    if ((element.tagName === "B" || element.tagName === "STRONG") && weightNormal) unwrap(element);
    else if ((element.tagName === "I" || element.tagName === "EM") && styleNormal) unwrap(element);
    else if (element.tagName === "B") rename(element, "strong");
    else if (element.tagName === "I") rename(element, "em");
  }
  for (const element of Array.from(root.querySelectorAll("span[style]"))) {
    const style = element.getAttribute("style") ?? "";
    if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) rename(element, "strong");
    else if (/font-style\s*:\s*italic/i.test(style)) rename(element, "em");
    else if (/text-decoration\s*:\s*underline/i.test(style)) rename(element, "u");
  }
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
    for (const child of nested) item.removeChild(child);
    const content = inlineHtml(item);
    const nestedItems = nested.flatMap(listItems);
    items.push(nestedItems.length > 0 ? { content, items: nestedItems } : content);
  }
  return items;
}

/** The inline HTML of a node, nested containers flattened and blank edges trimmed. */
function inlineHtml(node: Node): string {
  const holder = node.ownerDocument?.createElement("div") ?? document.createElement("div");
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE && CONTAINER_TAGS.has((child as Element).tagName)) holder.insertAdjacentHTML("beforeend", inlineHtml(child));
    else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === "P") holder.insertAdjacentHTML("beforeend", `${inlineHtml(child)}<br>`);
    else holder.appendChild(child.cloneNode(true));
  }
  return holder.innerHTML.replace(/^(\s|<br>|&nbsp;)+|(\s|<br>|&nbsp;)+$/g, "").trim();
}

function pushParagraph(blocks: BlockLike[], html: string): void {
  const text = html.replace(/^(\s|<br>|&nbsp;)+|(\s|<br>|&nbsp;)+$/g, "").trim();
  if (text) blocks.push({ type: "paragraph", data: { text } });
}

/** Turns the top-level nodes of a cleaned clipboard tree into blocks. */
function nodesToBlocks(nodes: Node[], blocks: BlockLike[], pending: string[]): void {
  const flushPending = () => {
    if (pending.length > 0) pushParagraph(blocks, pending.join(""));
    pending.length = 0;
  };
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) pending.push(node.textContent);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const element = node as Element;
    const tag = element.tagName;
    if (!hasBlockDescendant(element)) {
      pending.push(element.outerHTML);
      continue;
    }
    flushPending();
    if (/^H[1-6]$/.test(tag)) {
      const text = inlineHtml(element);
      if (text) blocks.push({ type: "header", data: { text, level: Number(tag[1]) } });
    } else if (tag === "UL" || tag === "OL") {
      const items = listItems(element);
      if (items.length > 0) blocks.push({ type: "list", data: { style: tag === "OL" ? "ordered" : "unordered", items } });
    } else if (tag === "BLOCKQUOTE") {
      const text = inlineHtml(element).replace(/(<br>)+$/g, "");
      if (text) blocks.push({ type: "quote", data: { text, caption: "" } });
    } else if (tag === "PRE") {
      const code = element.textContent ?? "";
      if (code.trim()) blocks.push({ type: "code", data: { code } });
    } else if (tag === "TABLE") {
      const content = Array.from(element.querySelectorAll("tr")).map((row) => Array.from(row.children).map((cell) => inlineHtml(cell)));
      if (content.length > 0) blocks.push({ type: "table", data: { content } });
    } else if (tag === "HR") {
      blocks.push({ type: "delimiter", data: {} });
    } else if (tag === "IMG" || tag === "FIGURE") {
      const image = tag === "IMG" ? element : element.querySelector("img");
      const src = image?.getAttribute("src") ?? "";
      const caption = tag === "FIGURE" ? (element.querySelector("figcaption")?.textContent ?? "") : "";
      if (isSafeUrl(src)) blocks.push({ type: "image", data: { file: { url: src, id: "" }, caption: caption.trim(), alt: image?.getAttribute("alt") ?? "" } });
    } else if (tag === "P") {
      pushParagraph(blocks, inlineHtml(element));
    } else {
      // Containers: recurse into their children
      nodesToBlocks(Array.from(element.childNodes), blocks, pending);
      flushPending();
    }
  }
  flushPending();
}

/** Parses clipboard HTML into either an inline fragment or blocks, every piece sanitized. */
export function parsePastedHtml(html: string, sanitizer: HtmlSanitizer): PastedContent {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  cleanClipboardTree(parsed.body);
  const nodes = Array.from(parsed.body.childNodes);
  if (!nodes.some(hasBlockDescendant)) {
    // Edge spaces are meaningful inside a run of text; only stray line breaks go
    const inline = sanitizer.sanitize(parsed.body.innerHTML).replace(/^(\n|<br>)+|(\n|<br>)+$/g, "");
    return { inline, blocks: [] };
  }
  const blocks: BlockLike[] = [];
  nodesToBlocks(nodes, blocks, []);
  for (const block of blocks) {
    const data = block.data as Record<string, unknown>;
    if (typeof data.text === "string") data.text = sanitizer.sanitize(data.text);
    if (Array.isArray(data.items)) data.items = sanitizeItems(data.items as ListItem[], sanitizer);
    if (Array.isArray(data.content)) data.content = (data.content as string[][]).map((row) => row.map((cell) => sanitizer.sanitize(cell)));
  }
  return { inline: null, blocks };
}

function sanitizeItems(items: ListItem[], sanitizer: HtmlSanitizer): ListItem[] {
  return items.map((item) => (typeof item === "string" ? sanitizer.sanitize(item) : { content: sanitizer.sanitize(item.content), ...(item.items ? { items: sanitizeItems(item.items, sanitizer) } : {}) }));
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
    const clean = (html: string) => (sanitizer ? sanitizer.sanitize(html) : html);
    for (const block of blocks) {
      const data = block.data as Record<string, unknown>;
      if (typeof data.text === "string") data.text = clean(data.text);
      if (Array.isArray(data.items)) data.items = sanitizeItems(data.items as ListItem[], { sanitize: clean } as HtmlSanitizer);
      if (Array.isArray(data.content)) data.content = (data.content as string[][]).map((row) => row.map(clean));
    }
    if (blocks.length === 1 && blocks[0]?.type === "paragraph") return { inline: String((blocks[0].data as { text: string }).text), blocks: [] };
    return { inline: null, blocks };
  }
  const paragraphs = normalized.split(/\n[ \t]*\n/).map((chunk) => chunk.trim()).filter((chunk) => chunk.length > 0);
  if (paragraphs.length <= 1) return { inline: escapeHtml(normalized.replace(/^\n+|\n+$/g, "")).replaceAll("\n", "<br>"), blocks: [] };
  return { inline: null, blocks: paragraphs.map((chunk) => ({ type: "paragraph", data: { text: escapeHtml(chunk).replaceAll("\n", "<br>") } })) };
}

/** Reads the clipboard of a paste event: rich HTML when there is some, plain text otherwise. */
export function parseClipboard(clipboard: Pick<DataTransfer, "getData">, sanitizer: HtmlSanitizer): PastedContent {
  // Blocks copied from an Elea editor travel whole, attachments and media included
  const blocks = readBlocksFromClipboard(clipboard);
  if (blocks) return { inline: null, blocks };
  const html = clipboard.getData("text/html");
  if (html && html.trim()) return parsePastedHtml(html, sanitizer);
  return parsePastedText(clipboard.getData("text/plain") ?? "", sanitizer);
}
