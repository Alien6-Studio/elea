import { asListMarker, attachmentBlock, imageBlock, isListItemChecked, listBlock, listStyleForMarker, nestedListStyle, type FileRef, type HeaderData, type ListItem, type ListMarker, type ListStyle, type QuoteData } from "./blocks/builtin.js";
import { asRecord, asString, asText } from "./blocks/definition.js";
import type { BlockData, BlockLike, EleaDocument } from "./document.js";
import { decodeHtmlEntities } from "./html/text.js";
import { alternation, markdownHref } from "./markdownSyntax.js";

// The editor needs the parser for paste, and loads this serializer with the Markdown writing mode.
const MARKS: Record<string, "strong" | "em" | "code" | "a"> = { strong: "strong", b: "strong", em: "em", i: "em", code: "code", a: "a" };
const LINE_TAG = /^(?:p|div|h[1-6]|blockquote|ul|ol|li)$/;

// "_" inside a word never opens syntax
function escapeText(text: string): string {
  return text.replaceAll(/[\\`*[]|(?<![\p{L}\p{N}])_|_(?![\p{L}\p{N}])/gu, String.raw`\$&`);
}

const LINE_START = new RegExp(String.raw`^([ \t]*)(${alternation(/#{1,6}(?=\s)/, /[-+](?=[ \t])/, />/, /\d{1,9}(?=[.)][ \t])/)})`, "gm");
const RULE_START = /^([ \t]*)(-{3,}[ \t]*)$/gm;

// A marker that would start a heading, list, quote or rule is escaped
function escapeLineStarts(text: string): string {
  return text.replaceAll(RULE_START, String.raw`$1\$2`).replace(LINE_START,
    (_match, indent: string, marker: string) => (/\d/.test(marker) ? `${indent}${marker}\\` : `${indent}\\${marker}`));
}

function linkDestination(url: string): string {
  return url.replaceAll(/[<>\s]/g, encodeURIComponent).replaceAll(/[()\\]/g, String.raw`\$&`);
}

interface Mark {
  kind: "" | "strong" | "em" | "code" | "a";
  href: string;
  text: string;
}

function closeMark({ kind, href, text }: Mark): string {
  if (kind === "code") return text ? `\`${text}\`` : "";
  const body = text.trim();
  if (!body || (kind === "a" && !href)) return text;
  // Emphasis cannot start or end with a space
  const start = text.indexOf(body);
  const mark = kind === "strong" ? "**" : "*";
  const wrapped = kind === "a" ? `[${body}](${linkDestination(href)})` : mark + body + mark;
  return text.slice(0, start) + wrapped + text.slice(start + body.length);
}

const TAG_START = /[a-zA-Z/!]/;
const TAG_NAME = /^(\/?)([a-z][a-z0-9]*)/i;
const HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i;

function findTag(html: string, from: number): [start: number, end: number] {
  let start = html.indexOf("<", from);
  while (start !== -1 && !TAG_START.test(html[start + 1] ?? "")) start = html.indexOf("<", start + 1);
  return [start, start === -1 ? -1 : html.indexOf(">", start)];
}

type OpenMarks = Record<"strong" | "em" | "code" | "a", number>;

function openMark(marks: Mark[], open: OpenMarks, kind: keyof OpenMarks, tag: string) {
  const href = kind === "a" ? HREF.exec(tag) : null;
  marks.push({ kind, href: decodeHtmlEntities(href?.[1] ?? href?.[2] ?? href?.[3] ?? ""), text: "" });
  open[kind]++;
}

function closeOpenMarks(marks: Mark[], open: OpenMarks, kind: keyof OpenMarks) {
  for (let closed = false; !closed;) {
    const mark = marks.pop()!;
    closed = mark.kind === kind;
    open[mark.kind as typeof kind]--;
    marks.at(-1)!.text += closed ? closeMark(mark) : mark.text;
  }
}

function applyTag(marks: Mark[], open: OpenMarks, tagHtml: string) {
  const tag = TAG_NAME.exec(tagHtml.slice(1, -1));
  const name = tag?.[2]?.toLowerCase() ?? "";
  const kind = Object.hasOwn(MARKS, name) && MARKS[name];
  const closing = Boolean(tag?.[1]);
  if (open.code && !(kind === "code" && closing)) return;
  if (name === "br") marks.at(-1)!.text += "  \n";
  else if (LINE_TAG.test(name)) marks.at(-1)!.text += "\n";
  else if (kind && !closing) openMark(marks, open, kind, tagHtml);
  else if (kind && open[kind]) closeOpenMarks(marks, open, kind);
}

/** Inline HTML (the content of a paragraph) to Markdown inline syntax. */
export function inlineHtmlToMarkdown(html: string): string {
  const marks: Mark[] = [{ kind: "", href: "", text: "" }];
  const open = { strong: 0, em: 0, code: 0, a: 0 };
  let index = 0;
  while (index < html.length) {
    const [start, end] = findTag(html, index);
    const text = decodeHtmlEntities(html.slice(index, end === -1 ? html.length : start));
    marks.at(-1)!.text += open.code ? text : escapeText(text);
    if (end === -1) break;
    index = end + 1;
    applyTag(marks, open, html.slice(start, index));
  }
  const text = marks.map((mark) => mark.text).join("");
  return text.replaceAll(/\n{3,}/g, "\n\n").trim();
}

function listToMarkdown(items: readonly ListItem[], style: ListStyle, depth = 0, marker?: ListMarker): string[] {
  const lines: string[] = [];
  const tasks = style === "checklist";
  const numbered = !tasks && listStyleForMarker(marker, style) === "ordered";
  items.forEach((item, index) => {
    const marker = numbered ? `${index + 1}.` : "-";
    const indent = "  ".repeat(depth);
    const box = isListItemChecked(item) ? "[x] " : "[ ] ";
    const content = escapeLineStarts(inlineHtmlToMarkdown(typeof item === "string" ? item : item.content));
    const continuation = indent + " ".repeat(marker.length + 1);
    lines.push(`${indent}${marker} ${tasks ? box : ""}${content.replaceAll("\n", "\n" + continuation)}`);
    if (typeof item !== "string" && item.items?.length) lines.push(...listToMarkdown(item.items, nestedListStyle(style), depth + 1, asListMarker(item.childrenMarker)));
  });
  return lines;
}

export interface MarkdownExportOptions {
  /** Public URL for a stored file. A repository id alone is not a Markdown destination. */
  resolveAssetUrl?: (file: FileRef) => string;
}

function mediaLink(label: string, url: string, image = false, title = ""): string | null {
  const labelText = label.replaceAll("&", "&amp;").replaceAll(/[[\]\\*_`]/g, String.raw`\$&`);
  if (!markdownHref(url, image)) return labelText || null;
  const destination = linkDestination(url.replaceAll("&", "&amp;"));
  const quoted = title.replaceAll("&", "&amp;").replaceAll(/["\\]/g, String.raw`\$&`);
  const titled = title ? ` "${quoted}"` : "";
  return `${image ? "!" : ""}[${labelText}](${destination}${titled})`;
}

type AssetUrl = (file: FileRef) => string;

function headerToMarkdown(header: HeaderData): string | null {
  const text = inlineHtmlToMarkdown(String(header.text ?? "")).replaceAll("\n", " ");
  return text ? `${"#".repeat(Math.min(6, Math.max(1, Number(header.level) || 2)))} ${text}` : null;
}

function quoteToMarkdown(quote: QuoteData): string | null {
  const text = escapeLineStarts(inlineHtmlToMarkdown(String(quote.text ?? "")));
  if (!text && !quote.caption) return null;
  const lines = text ? text.split("\n").map((line) => `> ${line}`) : [];
  if (quote.caption) lines.push(`> — ${quote.caption}`);
  return lines.join("\n");
}

function imageToMarkdown(data: BlockData, resolveAssetUrl: AssetUrl): string | null {
  const image = imageBlock.normalize(data);
  const resolved = image.file.url || image.file.id ? resolveAssetUrl(image.file) : "";
  const source = !image.file.url && resolved === image.file.id ? "" : resolved;
  return mediaLink(image.alt ?? image.caption, source, true, image.caption);
}

function attachmentToMarkdown(data: BlockData, resolveAssetUrl: AssetUrl): string | null {
  const attachment = attachmentBlock.normalize(data);
  const file = asRecord(data.file);
  let href = "";
  if (markdownHref(attachment.url)) href = attachment.url;
  else if (attachment.file && (attachment.file.id || attachment.file.url)) href = resolveAssetUrl(attachment.file);
  return mediaLink(attachment.title || asString(file.title) || asString(file.name) || href, href);
}

function codeToMarkdown(data: BlockData): string | null {
  const code = asText(data.code);
  if (!code) return null;
  // The fence outlasts any backtick run in the code
  const fence = "`".repeat(Math.max(3, ...Array.from(code.matchAll(/`+/g), (run) => run[0].length + 1)));
  const language = asString(data.language).trim();
  return `${fence}${/^[^\s`]+$/.test(language) ? language : ""}\n${code}\n${fence}`;
}

function tableToMarkdown(data: BlockData): string | null {
  const rows = Array.isArray(data.content) ? (data.content as unknown[]).filter((row): row is unknown[] => Array.isArray(row)) : [];
  if (rows.length === 0) return null;
  const cells = rows.map((row) => row.map((cell) => inlineHtmlToMarkdown(asText(cell)).replaceAll("|", String.raw`\|`).replaceAll("\n", " ")));
  const width = Math.max(...cells.map((row) => row.length));
  const line = (row: string[]) => `| ${Array.from({ length: width }, (_, index) => row[index] ?? "").join(" | ")} |`;
  const [head, ...body] = cells;
  return [line(head ?? []), `| ${Array.from({ length: width }, () => "---").join(" | ")} |`, ...body.map(line)].join("\n");
}

/** The Markdown of one block, or null when the block has nothing to say. */
export function blockToMarkdown(block: BlockLike, { resolveAssetUrl = file => file.url }: MarkdownExportOptions = {}): string | null {
  const data = asRecord(block.data);
  switch (block.type) {
    case "paragraph":
      return escapeLineStarts(inlineHtmlToMarkdown(asText(data.text))) || null;
    case "header":
      return headerToMarkdown(data as unknown as HeaderData);
    case "list":
    case "nestedlist": {
      const list = listBlock.normalize(data);
      const lines = listToMarkdown(list.items, list.style, 0, list.marker);
      return lines.length > 0 ? lines.join("\n") : null;
    }
    case "quote":
      return quoteToMarkdown(data as unknown as QuoteData);
    case "image":
      return imageToMarkdown(data, resolveAssetUrl);
    case "embed":
    case "video": {
      const url = asString(data.url) || asString(data.source) || asString(data.embed);
      return mediaLink(asString(data.caption) || url, url);
    }
    case "attaches":
    case "attachment":
      return attachmentToMarkdown(data, resolveAssetUrl);
    case "code":
      return codeToMarkdown(data);
    case "table":
      return tableToMarkdown(data);
    case "delimiter":
      return "---";
    case "raw":
      return escapeLineStarts(inlineHtmlToMarkdown(asText(data.html))) || null;
    default:
      return (typeof data.text === "string" && escapeLineStarts(inlineHtmlToMarkdown(data.text))) || null;
  }
}

/** The whole document as Markdown, blocks separated by a blank line. */
export function documentToMarkdown(document: Pick<EleaDocument, "blocks">, options?: MarkdownExportOptions): string {
  return document.blocks
    .map(block => blockToMarkdown(block, options) ?? (block.type === "paragraph" ? "" : null))
    .filter((text): text is string => text !== null)
    .join("\n\n");
}

