import { asListMarker, defaultRegistry, MAX_LIST_DEPTH, nestedListStyle, type ListItem, type ListStyle } from "../blocks/builtin.js";
import { asRecord } from "../blocks/definition.js";
import type { BlockData, BlockLike, EleaBlock } from "../document.js";
import { generateId } from "../id.js";
import { escapeHtml, safeUrl, serializeBlocks, type HtmlSerializerOptions } from "../serialize.js";
import { linkTargetAttributes } from "./links.js";

export interface HtmlImportOptions extends Pick<HtmlSerializerOptions, "sanitize"> {
  /** Use the editor’s alternating list levels for unmarked sublists, as in clipboard pastes. */
  listNesting?: "html" | "alternate";
  /** Supply a DOM implementation when running outside a browser, for example jsdom.window.document. */
  document?: Document;
}

export type HtmlExportOptions = HtmlSerializerOptions & Pick<HtmlImportOptions, "document">;

function parseFragment(html: string, provided?: Document): DocumentFragment {
  const doc = provided ?? globalThis.document;
  if (!doc) throw new Error("HTML conversion requires a document. Pass { document } when using a server DOM.");
  // Template contents stay inert, including images, custom elements and scripts.
  const template = doc.createElement("template");
  template.innerHTML = html;
  return template.content;
}

const STRUCTURED = "p,h1,h2,h3,h4,h5,h6,ul,ol,blockquote,pre,table,img,figure,hr";
const BLOCKS = STRUCTURED + ",div,section,article,header,footer,main,aside,nav,li,dl,dd,dt";
const IGNORE = new Set(["SCRIPT", "STYLE", "HEAD", "META", "LINK", "BASE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "NOSCRIPT", "TEXTAREA", "TITLE", "FORM"]);
const MARKS = new Map([["B", "strong"], ["STRONG", "strong"], ["I", "em"], ["EM", "em"], ["U", "u"], ["S", "s"], ["STRIKE", "s"], ["DEL", "del"], ["CODE", "code"]]);
const isElement = (node: Node): node is Element => node.nodeType === 1;
const ignored = (el: Element) => el.namespaceURI !== "http://www.w3.org/1999/xhtml" || typeof el.tagName !== "string" || IGNORE.has(el.tagName);

function inlineChildren(node: ParentNode): string {
  return Array.from(node.childNodes, inlineNode).join("");
}

function inlineLink(node: Element, content: string): string {
  const href = safeUrl(node.getAttribute("href") ?? "");
  if (!href) return content;
  const external = linkTargetAttributes(href).target ? ' target="_blank" rel="noopener noreferrer"' : "";
  const title = node.getAttribute("title");
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
  return `<a href="${escapeHtml(href)}"${titleAttribute}${external}>${content}</a>`;
}

// Only emit known elements and freshly escaped attributes. Source markup is never inserted in the result.
function inlineNode(node: Node): string {
  if (node.nodeType === 3) return escapeHtml(node.textContent ?? "").replaceAll("\u00a0", "&nbsp;");
  if (!isElement(node) || ignored(node)) return "";
  const tag = node.tagName;
  if (tag === "BR") return "<br>";
  if (tag === "IMG") {
    const src = safeUrl(node.getAttribute("src") ?? "");
    return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(node.getAttribute("alt") ?? "")}">` : "";
  }
  const content = inlineChildren(node);
  if (tag === "A") return inlineLink(node, content);
  const mark = MARKS.get(tag);
  if (mark) return `<${mark}>${content}</${mark}>`;
  return tag === "P" || tag === "DIV" ? content + "<br>" : content;
}

function trimmed(html: string): string {
  let text = html.trim();
  while (text.startsWith("<br>") || text.startsWith("&nbsp;")) text = text.slice(text.startsWith("<br>") ? 4 : 6).trimStart();
  while (text.endsWith("<br>") || text.endsWith("&nbsp;")) text = text.slice(0, text.endsWith("<br>") ? -4 : -6).trimEnd();
  return text;
}

type Clean = (html: string) => string;

function markerOf(list: Element) {
  const prefix = "elea-list-marker-";
  return asListMarker(Array.from(list.classList).find(name => name.startsWith(prefix))?.slice(prefix.length));
}

function listStyle(list: Element): ListStyle {
  return list.tagName === "OL" ? "ordered" : "unordered";
}

function childMarker(list: Element, expected: ListStyle, nesting: HtmlImportOptions["listNesting"]) {
  const marker = markerOf(list);
  if (marker || nesting === "alternate" || listStyle(list) === expected) return marker;
  return list.tagName === "OL" ? "decimal" : "disc";
}

function listItems(list: Element, style: ListStyle, clean: Clean, nesting: HtmlImportOptions["listNesting"], depth = 0): ListItem[] {
  return Array.from(list.children).filter(item => item.tagName === "LI").map(item => {
    const nested = Array.from(item.children).filter(child => child.matches("ol,ul"));
    const checkbox = item.querySelector(':scope > input[type="checkbox"], :scope > label > input[type="checkbox"]');
    const content = clean(trimmed(Array.from(item.childNodes).filter(node => !isElement(node) || !nested.includes(node)).map(inlineNode).join("")));
    const children = depth < MAX_LIST_DEPTH ? nested.flatMap(child => listItems(child, nestedListStyle(style), clean, nesting, depth + 1)) : [];
    if (style === "checklist") return { content, items: children, meta: { checked: Boolean(checkbox?.hasAttribute("checked")) } };
    const first = nested[0];
    if (!first || !children.length) return content;
    const marker = childMarker(first, nestedListStyle(style), nesting);
    return { content, items: children, ...(marker && { childrenMarker: marker }) };
  });
}

function readList(element: Element, clean: Clean, nesting: HtmlImportOptions["listNesting"]) {
  const tasks = element.classList.contains("elea-list--checklist") || Boolean(element.querySelector(':scope > li > input[type="checkbox"], :scope > li > label > input[type="checkbox"]'));
  const style = tasks ? "checklist" : listStyle(element);
  const items = listItems(element, style, clean, nesting);
  const marker = !tasks && markerOf(element);
  return items.length ? { type: "list", data: { style, items, ...(marker && { marker }) } } : null;
}

function readQuote(element: Element, clean: Clean) {
  const cite = element.querySelector(":scope > cite");
  let caption = cite?.textContent?.trim() ?? "";
  if (cite?.classList.contains("elea-quote__caption")) caption = caption.replace(/^— /, "");
  const children = Array.from(element.childNodes).filter(node => node !== cite);
  const text = clean(trimmed(children.map(inlineNode).join("")));
  return text || caption ? { type: "quote", data: { text, caption } } : null;
}

function readFigure(element: Element) {
  const image = element.tagName === "IMG" ? element : element.querySelector("img");
  const caption = element.querySelector("figcaption")?.textContent?.trim() ?? "";
  const src = safeUrl(image?.getAttribute("src") ?? "");
  if (src) return { type: "image", data: { file: { url: src, id: "" }, caption, alt: image?.getAttribute("alt") ?? "" } };
  const href = element.classList.contains("elea-figure--video") && safeUrl(element.querySelector("a")?.getAttribute("href") ?? "");
  return href ? { type: "video", data: { url: href, caption } } : null;
}

function elementBlock(element: Element, clean: Clean, nesting: HtmlImportOptions["listNesting"]): Omit<EleaBlock, "id"> | null {
  const tag = element.tagName;
  const textOf = (node: Element) => clean(trimmed(inlineChildren(node)));
  if (/^H[1-6]$/.test(tag)) {
    const text = textOf(element);
    return text ? { type: "header", data: { text, level: Number(tag[1]) } } : null;
  }
  switch (tag) {
    case "P": {
      const text = textOf(element);
      return { type: "paragraph", data: { text } };
    }
    case "OL":
    case "UL":
      return readList(element, clean, nesting);
    case "BLOCKQUOTE":
      return readQuote(element, clean);
    case "PRE": {
      const code = element.textContent ?? "";
      return code.trim() ? { type: "code", data: { code } } : null;
    }
    case "TABLE": {
      const rows = Array.from((element as HTMLTableElement).rows, row => Array.from(row.cells, textOf));
      return rows.length ? { type: "table", data: { content: rows } } : null;
    }
    case "HR":
      return { type: "delimiter", data: {} };
    case "FIGURE":
    case "IMG":
      return readFigure(element);
    default:
      return null;
  }
}

function readBlocks(root: ParentNode, clean: Clean, nesting: HtmlImportOptions["listNesting"], add: (type: string, data: BlockData) => void): void {
  let inline = "";
  const flush = () => {
    const text = clean(trimmed(inline));
    if (text) add("paragraph", { text });
    inline = "";
  };
  for (const node of root.childNodes) {
    if (isElement(node) && ignored(node)) continue;
    if (!isElement(node) || (!node.matches(BLOCKS) && !node.querySelector(BLOCKS))) {
      inline += inlineNode(node);
      continue;
    }
    flush();
    if (node.matches(STRUCTURED)) {
      const block = elementBlock(node, clean, nesting);
      if (block) add(block.type, block.data);
    } else {
      readBlocks(node, clean, nesting, add);
    }
  }
  flush();
}

/** Convert a form HTML string, or the children of a parsed container, into blocks with fresh editing IDs. */
export function htmlToBlocks(html: string | Element | DocumentFragment, options: HtmlImportOptions = {}): EleaBlock[] {
  if (typeof html === "string" && !html.trim()) return [];
  const blocks: EleaBlock[] = [];
  readBlocks(typeof html === "string" ? parseFragment(html, options.document) : html, options.sanitize ?? (text => text), options.listNesting,
    (type, data) => blocks.push({ id: generateId(), type, data }));
  return blocks;
}

/** Semantic HTML for storage in a form. Inline formatting and link targets follow ELEA's policy. */
export function blocksToHtml(blocks: readonly BlockLike[], options: HtmlExportOptions = {}): string {
  const sanitize = options.sanitize ?? (html => inlineChildren(parseFragment(html, options.document)));
  const registry = options.registry ?? defaultRegistry;
  const normalized = blocks.map(({ type, data }) => ({ type, data: registry.normalizeData(type, asRecord(data)) }));
  return serializeBlocks(normalized, { ...options, sanitize }, false);
}
