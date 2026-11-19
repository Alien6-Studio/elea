import type { AttachmentData, HeaderData, ImageData, ListData, ListItem, QuoteData, VideoData } from "./blocks/builtin.js";
import type { BlockLike, EleaDocument } from "./document.js";
import { decodeHtmlEntities, stripHtmlTags } from "./html/text.js";
import { isSafeUrl, isSiteRelativeUrl } from "./html/policy.js";

/*
 * Markdown is an interchange format for Elea documents: the block document stays the model.
 * Rich text keeps strong, emphasis, links, inline code and line breaks; underline has no
 * Markdown and becomes plain text. Videos and attachments become links, which `fromMarkdown`
 * reads back as paragraphs with links.
 */

// ── Document to Markdown ────────────────────────────────────────────────────

/** Inline HTML (the content of a paragraph) to Markdown inline syntax. */
export function inlineHtmlToMarkdown(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, "  \n")
    .replace(/<\/?(?:p|div)\b[^>]*>/gi, "\n")
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _tag, inner: string) => `**${inner.trim()}**`)
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _tag, inner: string) => `*${inner.trim()}*`)
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_match, inner: string) => `\`${stripHtmlTags(inner)}\``)
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_match, href: string, inner: string) => `[${stripHtmlTags(inner)}](${href})`)
    .replace(/<\/?(?:h[1-6]|blockquote|ul|ol|li)\b[^>]*>/gi, "\n");
  text = decodeHtmlEntities(stripHtmlTags(text));
  return text.replace(/\n{3,}/g, "\n\n").replace(/^\n+|\n+$/g, "").trim();
}

function listToMarkdown(items: readonly ListItem[], ordered: boolean, depth = 0): string[] {
  const lines: string[] = [];
  items.forEach((item, index) => {
    const marker = ordered ? `${index + 1}.` : "-";
    const indent = "  ".repeat(depth);
    if (typeof item === "string") {
      lines.push(`${indent}${marker} ${inlineHtmlToMarkdown(item).replaceAll("\n", " ")}`);
    } else {
      lines.push(`${indent}${marker} ${inlineHtmlToMarkdown(item.content).replaceAll("\n", " ")}`);
      if (item.items?.length) lines.push(...listToMarkdown(item.items, !ordered, depth + 1));
    }
  });
  return lines;
}

/** The Markdown of one block, or null when the block has nothing to say. */
export function blockToMarkdown(block: BlockLike): string | null {
  const data = (typeof block.data === "object" && block.data !== null ? block.data : {}) as Record<string, unknown>;
  switch (block.type) {
    case "paragraph": {
      const text = inlineHtmlToMarkdown(String(data.text ?? ""));
      return text || null;
    }
    case "header": {
      const header = data as unknown as HeaderData;
      const text = inlineHtmlToMarkdown(String(header.text ?? "")).replaceAll("\n", " ");
      return text ? `${"#".repeat(Math.min(6, Math.max(1, Number(header.level) || 2)))} ${text}` : null;
    }
    case "list": {
      const list = data as unknown as ListData;
      const lines = listToMarkdown(Array.isArray(list.items) ? list.items : [], list.style === "ordered");
      return lines.length > 0 ? lines.join("\n") : null;
    }
    case "quote": {
      const quote = data as unknown as QuoteData;
      const text = inlineHtmlToMarkdown(String(quote.text ?? ""));
      if (!text && !quote.caption) return null;
      const lines = text ? text.split("\n").map((line) => `> ${line}`) : [];
      if (quote.caption) lines.push(`> — ${quote.caption}`);
      return lines.join("\n");
    }
    case "image": {
      const image = data as unknown as ImageData;
      const source = image.file?.url || image.file?.id || "";
      return source ? `![${image.alt ?? image.caption ?? ""}](${source}${image.caption ? ` "${image.caption.replaceAll('"', "'")}"` : ""})` : null;
    }
    case "video": {
      const video = data as unknown as VideoData;
      return video.url ? `[${video.caption || video.url}](${video.url})` : null;
    }
    case "attachment": {
      const attachment = data as unknown as AttachmentData;
      const href = attachment.url || attachment.file?.url || "";
      if (!attachment.title && !href) return null;
      return href ? `[${attachment.title || href}](${href})` : attachment.title;
    }
    case "code": {
      const code = String(data.code ?? "");
      return code ? `\`\`\`\n${code}\n\`\`\`` : null;
    }
    case "table": {
      const rows = Array.isArray(data.content) ? (data.content as unknown[]).filter((row): row is unknown[] => Array.isArray(row)) : [];
      if (rows.length === 0) return null;
      const cells = rows.map((row) => row.map((cell) => inlineHtmlToMarkdown(String(cell ?? "")).replaceAll("|", "\\|").replaceAll("\n", " ")));
      const width = Math.max(...cells.map((row) => row.length));
      const line = (row: string[]) => `| ${Array.from({ length: width }, (_, index) => row[index] ?? "").join(" | ")} |`;
      const [head, ...body] = cells;
      return [line(head ?? []), `| ${Array.from({ length: width }, () => "---").join(" | ")} |`, ...body.map(line)].join("\n");
    }
    case "delimiter":
      return "---";
    case "raw":
      return inlineHtmlToMarkdown(String(data.html ?? "")) || null;
    default: {
      const text = typeof data.text === "string" ? inlineHtmlToMarkdown(data.text) : "";
      return text || null;
    }
  }
}

/** The whole document as Markdown, blocks separated by a blank line. */
export function documentToMarkdown(document: Pick<EleaDocument, "blocks">): string {
  return document.blocks
    .map(blockToMarkdown)
    .filter((text): text is string => text !== null)
    .join("\n\n");
}

// ── Markdown to document ────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** Markdown inline syntax to the rich HTML the editor and viewer use. Unsafe link targets become text. */
export function markdownInlineToHtml(text: string): string {
  const parts: string[] = [];
  let rest = escapeHtml(text);
  const pattern = /`([^`]+)`|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*?)\*|_([^_\s][^_]*?)_/;
  while (rest.length > 0) {
    const match = pattern.exec(rest);
    if (!match) {
      parts.push(rest);
      break;
    }
    parts.push(rest.slice(0, match.index));
    const [whole, code, imageAlt, imageSource, linkText, linkHref, bold1, bold2, em1, em2] = match;
    if (code !== undefined) parts.push(`<code>${code}</code>`);
    else if (imageSource !== undefined) parts.push(isSafeUrl(imageSource) || isSiteRelativeUrl(imageSource) ? `<img src="${imageSource}" alt="${imageAlt ?? ""}">` : (imageAlt ?? ""));
    else if (linkHref !== undefined) parts.push(isSafeUrl(linkHref) || isSiteRelativeUrl(linkHref) ? `<a href="${linkHref}">${markdownInlineToHtml(unescape(linkText ?? ""))}</a>` : markdownInlineToHtml(unescape(linkText ?? "")));
    else if (bold1 !== undefined || bold2 !== undefined) parts.push(`<strong>${markdownInlineToHtml(unescape(bold1 ?? bold2 ?? ""))}</strong>`);
    else if (em1 !== undefined || em2 !== undefined) parts.push(`<em>${markdownInlineToHtml(unescape(em1 ?? em2 ?? ""))}</em>`);
    rest = rest.slice(match.index + whole.length);
  }
  return parts.join("").replace(/ {2}\n|\\\n/g, "<br>").replaceAll("\n", "<br>");
}

function unescape(text: string): string {
  return text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}

const HEADING = /^(#{1,6})\s+(.+?)\s*#*$/;
const UNORDERED = /^(\s*)[-*+]\s+(.*)$/;
const ORDERED = /^(\s*)\d+[.)]\s+(.*)$/;
const TABLE_SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

function splitTableRow(line: string): string[] {
  return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split(/(?<!\\)\|/).map((cell) => cell.replaceAll("\\|", "|").trim());
}

interface ParsedList {
  style: "ordered" | "unordered";
  items: ListItem[];
}

/** Builds nested list items from consecutive list lines, two spaces of indentation per level. */
function parseList(lines: string[]): ParsedList {
  const first = lines[0] ?? "";
  const style: "ordered" | "unordered" = ORDERED.test(first) ? "ordered" : "unordered";
  const entries = lines.map((line) => {
    const match = ORDERED.exec(line) ?? UNORDERED.exec(line);
    return { depth: Math.floor((match?.[1]?.length ?? 0) / 2), text: match?.[2] ?? line.trim() };
  });
  const build = (start: number, depth: number): { items: ListItem[]; next: number } => {
    const items: ListItem[] = [];
    let index = start;
    while (index < entries.length) {
      const entry = entries[index] as { depth: number; text: string };
      if (entry.depth < depth) break;
      if (entry.depth > depth) {
        const nested = build(index, entry.depth);
        const previous = items.pop();
        if (previous === undefined) items.push({ content: "", items: nested.items });
        else if (typeof previous === "string") items.push({ content: previous, items: nested.items });
        else items.push({ content: previous.content, items: [...(previous.items ?? []), ...nested.items] });
        index = nested.next;
        continue;
      }
      items.push(markdownInlineToHtml(entry.text));
      index += 1;
    }
    return { items, next: index };
  };
  return { style, items: build(0, 0).items };
}

/** Parses Markdown into blocks: headings, paragraphs, lists, quotes, fenced code, tables, rules, images. */
export function markdownToBlocks(markdown: string): BlockLike[] {
  const lines = markdown.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
  const blocks: BlockLike[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = markdownInlineToHtml(paragraph.join("\n"));
    if (text.trim()) blocks.push({ type: "paragraph", data: { text } });
    paragraph = [];
  };
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] as string;
    const trimmed = line.trim();
    if (trimmed === "") {
      flushParagraph();
      index += 1;
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushParagraph();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] as string).trim().startsWith("```")) code.push(lines[index] as string), (index += 1);
      index += 1;
      blocks.push({ type: "code", data: { code: code.join("\n") } });
      continue;
    }
    const heading = HEADING.exec(trimmed);
    if (heading?.[1] && heading[2] !== undefined) {
      flushParagraph();
      blocks.push({ type: "header", data: { text: markdownInlineToHtml(heading[2]), level: heading[1].length } });
      index += 1;
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "delimiter", data: {} });
      index += 1;
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(trimmed);
    if (image?.[2] && (isSafeUrl(image[2]) || isSiteRelativeUrl(image[2]))) {
      flushParagraph();
      blocks.push({ type: "image", data: { file: { url: image[2], id: "" }, caption: image[3] ?? "", alt: image[1] ?? "" } });
      index += 1;
      continue;
    }
    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (index < lines.length && (lines[index] as string).trim().startsWith(">")) quoteLines.push((lines[index] as string).trim().replace(/^>\s?/, "")), (index += 1);
      const captionIndex = quoteLines.findIndex((candidate) => /^[—-]\s*\S/.test(candidate));
      const caption = captionIndex === -1 ? "" : (quoteLines.splice(captionIndex, 1)[0] ?? "").replace(/^[—-]\s*/, "");
      blocks.push({ type: "quote", data: { text: markdownInlineToHtml(quoteLines.join("\n")), caption } });
      continue;
    }
    if (UNORDERED.test(line) || ORDERED.test(line)) {
      flushParagraph();
      const listLines: string[] = [];
      while (index < lines.length && (UNORDERED.test(lines[index] as string) || ORDERED.test(lines[index] as string))) listLines.push(lines[index] as string), (index += 1);
      const list = parseList(listLines);
      blocks.push({ type: "list", data: { style: list.style, items: list.items } });
      continue;
    }
    if (trimmed.includes("|") && index + 1 < lines.length && TABLE_SEPARATOR.test((lines[index + 1] as string).trim())) {
      flushParagraph();
      const content: string[][] = [splitTableRow(trimmed).map(markdownInlineToHtml)];
      index += 2;
      while (index < lines.length && (lines[index] as string).includes("|")) content.push(splitTableRow(lines[index] as string).map(markdownInlineToHtml)), (index += 1);
      blocks.push({ type: "table", data: { content } });
      continue;
    }
    paragraph.push(line);
    index += 1;
  }
  flushParagraph();
  return blocks;
}

/** True when plain text reads like Markdown: a heading, a list, a quote, a fence, a rule, a link or emphasis. */
export function looksLikeMarkdown(text: string): boolean {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return false;
  const structural = lines.filter((line) => /^(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s?|```|(?:-{3,}|\*{3,}|_{3,})$|!\[[^\]]*\]\(|\|.*\|)/.test(line)).length;
  if (structural > 0) return true;
  return /\*\*[^*]+\*\*|\[[^\]]+\]\((https?:\/\/|\/)/.test(text);
}
