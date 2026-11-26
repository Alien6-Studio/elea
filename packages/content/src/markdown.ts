import { MAX_LIST_DEPTH, type ListItem } from "./blocks/builtin.js";
import type { BlockLike } from "./document.js";
import { decodeHtmlEntities } from "./html/text.js";
import { isSafeUrl, isSiteRelativeUrl } from "./html/policy.js";
import { alternation, markdownHref } from "./markdownSyntax.js";

const WORD = /[\p{L}\p{N}]/u;

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const MEDIA_BARE_URL = /((?:\\.|[^\s()\\]|\((?:\\.|[^\s()\\])*\))*)/;
const MEDIA_LINE = new RegExp(String.raw`^(!?)\[((?:\\.|[^\]\\])*)\]\((?:<([^<>\n]*)>|${MEDIA_BARE_URL.source})(?:[ \t]+"((?:\\.|[^"\\])*)")?\)$`);

// A standalone media link; the inline matcher below handles links in prose
function mediaLine(line: string) {
  if (!line.startsWith("[") && !line.startsWith("![")) return undefined;
  const match = MEDIA_LINE.exec(line);
  if (!match) return undefined;
  const literal = (text: string) => decodeHtmlEntities(text.replaceAll(ESCAPED, "$1"));
  return { image: !!match[1], label: literal(match[2]!), escapedLabel: match[2]!.includes("\\"), href: markdownHref(literal(match[3] ?? match[4] ?? ""), !!match[1]), title: literal(match[5] ?? ""), empty: !(match[3] || match[4]) };
}

type Scan = { html: string; end: number } | null;
type Find = (key: string, from: number, escapes?: boolean) => number;

function finder(source: string): Find {
  const seen = new Map<string, number>();
  return (key, from, escapes = true) => {
    const known = seen.get(key + escapes);
    if (known !== undefined && (known === -1 || known >= from)) return known;
    let at = from;
    while (at < source.length && !(key.trim() ? source[at] === key : /\s/.test(source[at]!) === (key === " "))) at += escapes && source[at] === "\\" ? 2 : 1;
    const found = at < source.length ? at : -1;
    seen.set(key + escapes, found);
    return found;
  };
}

const literalText = (escaped: string) => unescape(escaped).replaceAll(ESCAPED, "$1");

function titleEnd(source: string, find: Find, image: boolean, start: number, space: number): number {
  const quote = find("", space, false);
  const closing = image && space > start && source[quote] === '"' ? find('"', quote + 1, false) : -1;
  return closing !== -1 && source[closing + 1] === ")" ? closing + 1 : -1;
}

function linkHtml(image: boolean, target: string, inner: string): string {
  if (image) return isSafeUrl(target) || isSiteRelativeUrl(target) ? `<img src="${attribute(escapeHtml(target))}" alt="${attribute(inner)}">` : inner;
  const href = markdownHref(decodeHtmlEntities(target));
  const content = markdownInlineToHtml(unescape(inner));
  return href ? `<a href="${attribute(escapeHtml(href))}">${content}</a>` : content;
}

function scanLink(source: string, index: number, find: Find): Scan {
  const image = source[index] === "!";
  const label = index + (image ? 2 : 1);
  const close = find("]", label);
  const start = close + 2;
  const paren = close !== -1 && source[close + 1] === "(" ? find(")", start) : -1;
  const space = paren > start ? find(" ", start, false) : -1;
  const titled = space !== -1 && space < paren;
  const stop = titled ? titleEnd(source, find, image, start, space) : paren;
  if (stop <= start || !(image || close > label)) return null;
  return { html: linkHtml(image, literalText(source.slice(start, titled ? space : paren)), source.slice(label, close)), end: stop + 1 };
}

function scanEmphasis(source: string, index: number, find: Find): Scan {
  const char = source[index]!;
  // As in CommonMark, "_" inside a word is a plain character
  const inWord = (at: number) => char === "_" && WORD.test(source[at] ?? "");
  const strong = source[index + 1] === char;
  const start = index + (strong ? 2 : 1);
  const close = inWord(index - 1) ? -1 : find(char, start);
  const closes = strong ? source[close + 1] === char && !inWord(close + 2) : source[start] !== char && !/\s/.test(source[start] ?? "") && !inWord(close + 1);
  if (close <= start || !closes) return null;
  const tag = strong ? "strong" : "em";
  return { html: `<${tag}>${markdownInlineToHtml(unescape(source.slice(start, close)))}</${tag}>`, end: close + (strong ? 2 : 1) };
}

function scanInline(source: string, index: number, find: Find): Scan {
  const char = source[index];
  if (char === "\\") return ESCAPABLE.test(source[index + 1] ?? "") ? { html: source[index + 1]!, end: index + 2 } : null;
  if (char === "`") {
    const close = find("`", index + 1, false);
    return close > index + 1 ? { html: `<code>${source.slice(index + 1, close)}</code>`, end: close + 1 } : null;
  }
  if (char === "[" || (char === "!" && source[index + 1] === "[")) return scanLink(source, index, find);
  return char === "*" || char === "_" ? scanEmphasis(source, index, find) : null;
}

/** Markdown inline syntax to rich HTML; unsafe link targets become text. */
export function markdownInlineToHtml(text: string): string {
  const media = mediaLine(text);
  if (media && !media.image && media.href) {
    const label = media.escapedLabel ? escapeHtml(media.label) : markdownInlineToHtml(media.label);
    return `<a href="${attribute(escapeHtml(media.href))}">${label}</a>`;
  }
  const source = escapeHtml(text);
  const find = finder(source);
  let html = "";
  let index = 0;
  while (index < source.length) {
    const scan = scanInline(source, index, find);
    html += scan ? scan.html : source[index];
    index = scan ? scan.end : index + 1;
  }
  return html.replaceAll(/ {2}\n|\\\n/g, "<br>").replaceAll("\n", "<br>");
}

const ESCAPABLE = /[!-/:-@[-`{-~]/;
const ESCAPED = /\\([!-/:-@[-`{-~])/g;

function unescape(text: string): string {
  return text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}

function attribute(text: string): string {
  return text.replaceAll('"', "&quot;");
}

function parseHeading(line: string): { level: number; text: string } | null {
  let level = 0;
  while (line[level] === "#") level++;
  if (level < 1 || level > 6 || !/\s/.test(line[level] ?? "")) return null;
  let end = line.length;
  while (line[end - 1] === "#") end--;
  const text = (/\s/.test(line[end - 1] ?? "") ? line.slice(level, end) : line.slice(level)).trim();
  return text ? { level, text } : null;
}

const LIST_ITEM = /^([ \t]*)([-*+]|\d{1,9}[.)])[ \t]+((?:\S.*)?)$/;
const RULE = /^(?:-{3,}|\*{3,}|_{3,})$/;
const TABLE_SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

function splitTableRow(line: string): string[] {
  return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split(/(?<!\\)\|/).map((cell) => cell.replaceAll(String.raw`\|`, "|").trim());
}

interface ListEntry {
  depth: number;
  contentIndent: number;
  ordered: boolean;
  parts: string[];
}

/** The box that opens a task: `[ ]` to do, `[x]` done. */
const TASK = /^\[([ xX])\](?:[ \t]+|$)/;

function startsBlock(body: string, nextLine: string | undefined): boolean {
  const text = body.trimEnd();
  return !!parseHeading(text) || RULE.test(text) || /^(?:```|>|<!--|!\[)/.test(body)
    || (body.includes("|") && TABLE_SEPARATOR.test(nextLine?.trim() ?? ""));
}

function addEntry(entries: ListEntry[], ancestors: ListEntry[], line: string, match: RegExpExecArray, restartable: boolean): boolean {
  const depth = Math.min(MAX_LIST_DEPTH, Math.floor(match[1]!.length / 2));
  const ordered = /^\d/.test(match[2]!);
  // The editor restarts markers in adjacent list blocks
  const restart = restartable && (!ordered || Number.parseInt(match[2]!, 10) === 1);
  if (depth === 0 && entries.length && (entries[0]!.ordered !== ordered || restart)) return false;
  const entry = { depth, ordered, contentIndent: line.length - match[3]!.length, parts: [match[3]!] };
  while (ancestors.length && ancestors.at(-1)!.depth >= depth) ancestors.pop();
  ancestors.push(entry);
  entries.push(entry);
  return true;
}

function addContinuation(ancestors: ListEntry[], line: string, body: string, blank: boolean): boolean {
  const indent = line.length - body.length;
  let level = ancestors.length - 1;
  while (level >= 0 && ancestors[level]!.contentIndent > indent) level--;
  const parent = ancestors[level];
  if (blank && !parent) return false;
  const item = parent ?? ancestors.at(-1)!;
  const previous = item.parts.at(-1)!;
  const lineBreak = previous.endsWith("  ") || previous.endsWith("\\") ? "\n" : " ";
  item.parts.push(blank ? "\n\n" : lineBreak, body);
  return true;
}

function entryToItem(entry: ListEntry, tasks: boolean): ListItem {
  const source = entry.parts.join("");
  const box = tasks ? TASK.exec(source) : null;
  if (!box) return markdownInlineToHtml(source);
  return { content: markdownInlineToHtml(source.slice(box[0].length)), meta: { checked: box[1] !== " " }, items: [] };
}

function entriesToItems(entries: ListEntry[], tasks: boolean): ListItem[] {
  let cursor = 0;
  function build(depth: number, defaultOrdered: boolean): ListItem[] {
    const items: ListItem[] = [];
    while (cursor < entries.length) {
      const entry = entries[cursor]!;
      if (entry.depth < depth) break;
      if (entry.depth === depth) {
        items.push(entryToItem(entry, tasks));
        cursor++;
        continue;
      }
      const children = build(entry.depth, !defaultOrdered);
      const last = items.pop() ?? "";
      const parent = typeof last === "string" ? { content: last } : last;
      items.push({ ...parent, items: [...(parent.items ?? []), ...children],
        ...(!tasks && entry.ordered === defaultOrdered && { childrenMarker: entry.ordered ? "decimal" : "disc" }) });
    }
    return items;
  }
  return build(0, entries[0]!.ordered);
}

function readList(lines: string[], start: number, preserveEmptyParagraphs: boolean | undefined) {
  const entries: ListEntry[] = [];
  const ancestors: ListEntry[] = [];
  let index = start;
  let next = start;
  while (index < lines.length) {
    const line = lines[index]!;
    const body = line.trimStart();
    if (!body) {
      index++;
      continue;
    }
    const blank = index > next;
    if (preserveEmptyParagraphs && index - next > 1) break;
    const match = LIST_ITEM.exec(line);
    const taken = match
      ? addEntry(entries, ancestors, line, match, !!preserveEmptyParagraphs && blank)
      : !startsBlock(body, lines[index + 1]) && addContinuation(ancestors, line, body, blank);
    if (!taken) break;
    next = ++index;
  }
  // A list is a checklist when every item opens with a box; a box here and there is text.
  const tasks = entries.every((entry) => TASK.test(entry.parts[0]!));
  const style = entries[0]!.ordered ? "ordered" : "unordered";
  return { data: { style: tasks ? "checklist" : style, items: entriesToItems(entries, tasks) }, next };
}

export interface MarkdownParseOptions {
  /** Retain intentional empty paragraph blocks while editing a document in source mode. */
  preserveEmptyParagraphs?: boolean;
  /** Resolves a standalone comment outside code fences to an existing block. */
  resolveComment?: (comment: string) => BlockLike | undefined;
}

interface Parse {
  markdown: string;
  lines: string[];
  blocks: BlockLike[];
  paragraph: string[];
  options: MarkdownParseOptions;
}

function flushParagraph(parse: Parse) {
  if (parse.paragraph.length === 0) return;
  const text = markdownInlineToHtml(parse.paragraph.join("\n"));
  if (text.trim()) parse.blocks.push({ type: "paragraph", data: { text } });
  parse.paragraph = [];
}

type BlockReader = (parse: Parse, index: number, trimmed: string) => [BlockLike, number] | null;

function readBlank(parse: Parse, start: number): number {
  const { lines, paragraph, options } = parse;
  let index = start;
  while (index < lines.length && !lines[index]?.trim()) index++;
  if (options.preserveEmptyParagraphs && paragraph.length) {
    const blanks = index - start;
    if (blanks === 1 && index === lines.length || blanks > 1 && / {2}$/.test(paragraph.at(-1)!)) paragraph.push("");
  }
  flushParagraph(parse);
  if (options.preserveEmptyParagraphs && parse.markdown) {
    const boundaries = Number(start === 0) + Number(index === lines.length);
    const count = Math.floor((index - start - 1 + boundaries) / 2);
    for (let empty = 0; empty < count; empty++) parse.blocks.push({ type: "paragraph", data: { text: "" } });
  }
  return index;
}

const readComment: BlockReader = ({ options }, index, trimmed) => {
  if (!options.resolveComment || !trimmed.startsWith("<!--") || !trimmed.endsWith("-->")) return null;
  const block = options.resolveComment(trimmed.slice(4, -3).trim());
  return block ? [block, index + 1] : null;
};

const readFence: BlockReader = ({ lines }, index, trimmed) => {
  if (!trimmed.startsWith("```")) return null;
  const code: string[] = [];
  // A fence closes on backticks at least as long as its opening
  const fence = trimmed.length - trimmed.replace(/^`+/, "").length;
  const language = trimmed.slice(fence).trim();
  const closes = (candidate: string) => candidate.length >= fence && candidate.replaceAll("`", "") === "";
  let next = index + 1;
  while (next < lines.length && !closes(lines[next]!.trim())) code.push(lines[next++]!);
  return [{ type: "code", data: { code: code.join("\n"), ...(language && { language }) } }, next + 1];
};

const readHeading: BlockReader = (_parse, index, trimmed) => {
  const heading = parseHeading(trimmed);
  return heading && [{ type: "header", data: { text: markdownInlineToHtml(heading.text), level: heading.level } }, index + 1];
};

const readRule: BlockReader = (_parse, index, trimmed) => (RULE.test(trimmed) ? [{ type: "delimiter", data: {} }, index + 1] : null);

const readImage: BlockReader = ({ options }, index, trimmed) => {
  const image = trimmed.startsWith("![") ? mediaLine(trimmed) : undefined;
  if (!image?.image || !(image.href || options.preserveEmptyParagraphs && image.empty)) return null;
  return [{ type: "image", data: { file: { url: image.href, id: "" }, caption: image.title, alt: image.label } }, index + 1];
};

const readQuote: BlockReader = ({ lines }, index, trimmed) => {
  if (!trimmed.startsWith(">")) return null;
  const quoteLines: string[] = [];
  let next = index;
  while (next < lines.length && lines[next]!.trim().startsWith(">")) quoteLines.push(lines[next++]!.trim().replace(/^>\s?/, ""));
  const captionIndex = quoteLines.findIndex((candidate) => /^[—-]\s*\S/.test(candidate));
  const caption = captionIndex === -1 ? "" : (quoteLines.splice(captionIndex, 1)[0] ?? "").replace(/^[—-]\s*/, "");
  return [{ type: "quote", data: { text: markdownInlineToHtml(quoteLines.join("\n")), caption } }, next];
};

const readListBlock: BlockReader = ({ lines, options }, index) => {
  if (!LIST_ITEM.test(lines[index]!)) return null;
  const list = readList(lines, index, options.preserveEmptyParagraphs);
  return [{ type: "list", data: list.data }, list.next];
};

const readTable: BlockReader = ({ lines }, index, trimmed) => {
  if (!trimmed.includes("|") || index + 1 >= lines.length || !TABLE_SEPARATOR.test(lines[index + 1]!.trim())) return null;
  const content: string[][] = [splitTableRow(trimmed).map(markdownInlineToHtml)];
  let next = index + 2;
  while (next < lines.length && lines[next]!.includes("|")) content.push(splitTableRow(lines[next++]!).map(markdownInlineToHtml));
  return [{ type: "table", data: { content } }, next];
};

const BLOCK_READERS = [readComment, readFence, readHeading, readRule, readImage, readQuote, readListBlock, readTable];

/** Parses Markdown into blocks. */
export function markdownToBlocks(markdown: string, options: MarkdownParseOptions = {}): BlockLike[] {
  const parse: Parse = { markdown, lines: markdown.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n"), blocks: [], paragraph: [], options };
  let index = 0;
  while (index < parse.lines.length) {
    const line = parse.lines[index]!;
    const trimmed = line.trim();
    if (trimmed === "") {
      index = readBlank(parse, index);
      continue;
    }
    let hit: [BlockLike, number] | null = null;
    for (const read of BLOCK_READERS) hit ??= read(parse, index, trimmed);
    if (hit) {
      flushParagraph(parse);
      parse.blocks.push(hit[0]);
    } else parse.paragraph.push(line);
    index = hit ? hit[1] : index + 1;
  }
  flushParagraph(parse);
  return parse.blocks;
}

const STRUCTURE = new RegExp(`^(?:${alternation(/#{1,6}\s/, LIST_ITEM, />/, /```/, RULE, /!\[[^\]]*\]\(/, /\|.*\|/)})`);

/** True when plain text reads like Markdown. */
export function looksLikeMarkdown(text: string): boolean {
  const structural = text.split(/\r?\n/).some((line) => STRUCTURE.test(line.trim()));
  if (structural || /\*\*[^*]+\*\*/.test(text)) return true;

  let open = text.indexOf("[");
  while (open !== -1) {
    const close = text.indexOf("]", open + 1);
    if (close === -1) return false;
    const target = close + 2;
    if (close > open + 1 && text[close + 1] === "(" && (
      text.startsWith("/", target) || text.startsWith("http://", target) || text.startsWith("https://", target)
    )) return true;
    open = text.indexOf("[", close + 1);
  }
  return false;
}
