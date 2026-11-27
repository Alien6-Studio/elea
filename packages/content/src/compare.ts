import type { ListItem } from "./blocks/builtin.js";
import { defaultRegistry } from "./blocks/builtin.js";
import type { BlockRegistry } from "./blocks/registry.js";
import type { BlockData, EleaBlock } from "./document.js";
import { htmlToText } from "./html/text.js";

// A step that keeps an item also says which earlier item it kept
type Step<T> = { change: "same" | "removed" | "added"; item: T; previous?: T };

// Beyond this many cell comparisons two sequences are reported as replaced instead of aligned
const MAX_CELLS = 4_000_000;

/** lengths[i][j]: the common length of what follows row i and column j. */
function commonLengths(a: readonly string[], b: readonly string[]): Uint32Array[] {
  const lengths = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    const row = lengths[i] as Uint32Array;
    const next = lengths[i + 1] as Uint32Array;
    for (let j = b.length - 1; j >= 0; j -= 1) {
      row[j] = a[i] === b[j] ? (next[j + 1] as number) + 1 : Math.max(next[j] as number, row[j + 1] as number);
    }
  }
  return lengths;
}

/** The steps between two sequences whose ends differ; `a` and `b` are their keys. */
function alignMiddle<T>(before: readonly T[], after: readonly T[], a: readonly string[], b: readonly string[]): Step<T>[] {
  const removed = (item: T): Step<T> => ({ change: "removed", item });
  const added = (item: T): Step<T> => ({ change: "added", item });
  if (a.length * b.length > MAX_CELLS) return [...before.map(removed), ...after.map(added)];
  const lengths = commonLengths(a, b);
  const steps: Step<T>[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      steps.push({ change: "same", item: after[j] as T, previous: before[i] as T });
      i += 1;
      j += 1;
    } else if (((lengths[i + 1] as Uint32Array)[j] as number) >= ((lengths[i] as Uint32Array)[j + 1] as number)) {
      steps.push(removed(before[i] as T));
      i += 1;
    } else {
      steps.push(added(after[j] as T));
      j += 1;
    }
  }
  return [...steps, ...before.slice(i).map(removed), ...after.slice(j).map(added)];
}

/** The longest common subsequence of two sequences, as the steps that turn one into the other. */
function align<T>(before: readonly T[], after: readonly T[], key: (item: T) => string): Step<T>[] {
  const a = before.map(key);
  const b = after.map(key);
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }
  return [
    ...after.slice(0, start).map((item, index): Step<T> => ({ change: "same", item, previous: before[index] as T })),
    ...alignMiddle(before.slice(start, endA), after.slice(start, endB), a.slice(start, endA), b.slice(start, endB)),
    ...after.slice(endB).map((item, index): Step<T> => ({ change: "same", item, previous: before[endA + index] as T })),
  ];
}

type Pairing<T> = { change: "same" | "removed" | "added"; item: T } | { change: "changed"; item: T; previous: T };

/**
 * Aligns two sequences, then reads a removal and an addition in the same gap as one change
 * when `related` says they are versions of the same thing.
 */
function pair<T>(before: readonly T[], after: readonly T[], key: (item: T) => string, related: (previous: T, item: T) => boolean): Pairing<T>[] {
  const out: Pairing<T>[] = [];
  let removed: T[] = [];
  let added: T[] = [];
  const flush = () => {
    let cursor = 0;
    for (const previous of removed) {
      const match = added.findIndex((item, index) => index >= cursor && related(previous, item));
      if (match === -1) {
        out.push({ change: "removed", item: previous });
        continue;
      }
      for (const item of added.slice(cursor, match)) out.push({ change: "added", item });
      out.push({ change: "changed", item: added[match] as T, previous });
      cursor = match + 1;
    }
    for (const item of added.slice(cursor)) out.push({ change: "added", item });
    removed = [];
    added = [];
  };
  for (const step of align(before, after, key)) {
    if (step.change === "removed") removed.push(step.item);
    else if (step.change === "added") added.push(step.item);
    else {
      flush();
      out.push({ change: "same", item: step.item });
    }
  }
  flush();
  return out;
}

const INLINE_TAGS = new Set(["a", "b", "strong", "i", "em", "u", "s", "strike", "del", "ins", "mark", "code", "span", "cite", "sub", "sup", "small"]);
const VOID_TAGS = new Set(["br", "img", "hr", "input", "wbr"]);
const ENTITY = String.raw`&(?:#x[0-9a-f]+|#\d+|[a-z]+);`;
const WORD = String.raw`[\p{L}\p{N}_]+(?:['’-][\p{L}\p{N}_]+)*`;
// An entity, a word, a run of spaces, or any other single character
const TEXT_PIECE = new RegExp(String.raw`${ENTITY}|${WORD}|\s+|[\s\S]`, "giu");

interface Wrapper {
  /** Two pieces share a wrapper, and so one element in the result, when its identity is the same. */
  identity: string;
  open: string;
  close: string;
}

interface Piece {
  html: string;
  /** What the comparison reads: the text and the formatting around it. */
  key: string;
  structure: readonly Wrapper[];
  inline: readonly Wrapper[];
}

type Token = { kind: "text"; source: string } | { kind: "open" | "close" | "void"; source: string; name: string };

/** Cuts markup into tags and the text between them. Tags without a name, such as comments, are left out. */
function tokens(html: string): Token[] {
  const out: Token[] = [];
  let index = 0;
  while (index < html.length) {
    const start = html.indexOf("<", index);
    // As in HTML parsing, "<" starts a tag only before a letter, "/" or "!"
    const isTag = start !== -1 && /[a-zA-Z/!]/.test(html[start + 1] ?? "");
    const end = isTag ? html.indexOf(">", start) : -1;
    if (end === -1) {
      const stop = start === -1 || isTag ? html.length : start + 1;
      out.push({ kind: "text", source: html.slice(index, stop).replaceAll("<", "&lt;") });
      index = stop;
      continue;
    }
    out.push({ kind: "text", source: html.slice(index, start) });
    const source = html.slice(start, end + 1);
    const name = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(source)?.[1]?.toLowerCase();
    if (name) out.push({ kind: tagKind(source, name), source, name });
    index = end + 1;
  }
  return out;
}

function tagKind(source: string, name: string): "open" | "close" | "void" {
  if (source[1] === "/") return "close";
  return VOID_TAGS.has(name) || source.endsWith("/>") ? "void" : "open";
}

type Open = Wrapper & { name: string; inline: boolean };

function pieceOf(text: string, open: readonly Open[]): Piece {
  const inline = open.filter((wrapper) => wrapper.inline);
  const key = /^\s+$/.test(text) ? " " : text;
  return { html: text, key: `${key}\u0000${inline.map((wrapper) => wrapper.open).join("")}`, structure: open.filter((wrapper) => !wrapper.inline), inline };
}

/** Splits rich text into words, spaces and signs, each with the elements it sits in. No DOM. */
function pieces(html: string, side: string): Piece[] {
  const out: Piece[] = [];
  const open: Open[] = [];
  let instances = 0;
  for (const token of tokens(html)) {
    if (token.kind === "text") {
      for (const [text] of token.source.matchAll(TEXT_PIECE)) out.push(pieceOf(text, open));
    } else if (token.kind === "void") {
      out.push(pieceOf(token.source, open));
    } else if (token.kind === "close") {
      const at = open.map((wrapper) => wrapper.name).lastIndexOf(token.name);
      open.length = at === -1 ? open.length : at;
    } else {
      const inline = INLINE_TAGS.has(token.name);
      instances += 1;
      open.push({ name: token.name, inline, identity: inline ? token.source : `${side}${instances}`, open: token.source, close: `</${token.name}>` });
    }
  }
  return out;
}

const ADDED: Wrapper = { identity: "+", open: '<ins class="elea-change elea-change--added">', close: "</ins>" };
const REMOVED: Wrapper = { identity: "-", open: '<del class="elea-change elea-change--removed">', close: "</del>" };

const MARKS: Partial<Record<Step<Piece>["change"], Wrapper>> = { added: ADDED, removed: REMOVED };

/** Where each paragraph or item of `before` went, read from the words both versions kept. */
function keptStructures(steps: readonly Step<Piece>[]): Map<string, readonly Wrapper[]> {
  const kept = new Map<string, readonly Wrapper[]>();
  for (const { item, previous } of steps) {
    const identity = previous?.structure.at(-1)?.identity;
    if (identity !== undefined && !kept.has(identity)) kept.set(identity, item.structure);
  }
  return kept;
}

/** Closes and opens elements until the open ones are those wanted; returns the markup written. */
function moveTo(stack: Wrapper[], wanted: readonly Wrapper[]): string {
  let shared = 0;
  while (shared < stack.length && shared < wanted.length && stack[shared]?.identity === wanted[shared]?.identity) shared += 1;
  let out = "";
  while (stack.length > shared) out += (stack.pop() as Wrapper).close;
  for (const wrapper of wanted.slice(shared)) {
    out += wrapper.open;
    stack.push(wrapper);
  }
  return out;
}

/**
 * Rich text holding both versions: words only in `after` sit in `<ins class="elea-change">`,
 * words only in `before` in `<del class="elea-change">`, each inside the formatting it had.
 * A word whose formatting changed counts as removed and added. Sanitize the result as any
 * stored HTML, with a policy that allows `ins` and `del`.
 */
export function compareHtml(before: string, after: string): string {
  const steps = align(pieces(before, "b"), pieces(after, "a"), (piece) => piece.key);
  const kept = keptStructures(steps);
  let structure: readonly Wrapper[] | undefined = steps.find((step) => step.change !== "removed")?.item.structure;
  const stack: Wrapper[] = [];
  let out = "";
  for (const { change, item } of steps) {
    // What was removed is shown where it stood: in the paragraph that kept its other words,
    // or in a paragraph of its own when none of them remain
    const own = item.structure.at(-1);
    if (change !== "removed") structure = item.structure;
    else if (own) structure = kept.get(own.identity) ?? item.structure;
    else structure ??= item.structure;
    const mark = MARKS[change];
    out += moveTo(stack, mark ? [...structure, ...item.inline, mark] : [...structure, ...item.inline]) + item.html;
  }
  return out + moveTo(stack, []);
}

export type BlockChangeKind = "same" | "added" | "removed" | "changed";

/** One block of a comparison, in reading order. */
export interface BlockChange {
  change: BlockChangeKind;
  /**
   * The block to show. A changed text block holds both versions: its rich text carries the
   * `<ins>` and `<del>` of `compareHtml`, and a list keeps the items that were removed.
   */
  block: EleaBlock;
  /** The earlier version of a changed block. */
  previous?: EleaBlock;
}

export interface CompareBlocksOptions {
  /** Reads the text of each block, to tell an edited block from a replaced one. */
  registry?: BlockRegistry;
}

const TEXT_TYPES = new Set(["paragraph", "header", "quote"]);
const LIST_TYPES = new Set(["list", "nestedlist"]);

const words = (text: string) => text.split(/\s+/).filter(Boolean);

/** Two texts are versions of one another when half of the longer one is kept, in order. */
function alike(before: string, after: string): boolean {
  const a = words(before);
  const b = words(after);
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return false;
  const kept = align(a, b, (word) => word).filter((step) => step.change === "same").length;
  return kept * 2 >= longest;
}

const itemContent = (item: ListItem) => (typeof item === "string" ? item : item.content);
const itemChildren = (item: ListItem) => (typeof item === "string" ? [] : item.items ?? []);
const wrap = (wrapper: Wrapper, html: string) => (html ? `${wrapper.open}${html}${wrapper.close}` : html);

function markItem(item: ListItem, wrapper: Wrapper): ListItem {
  if (typeof item === "string") return wrap(wrapper, item);
  const marked: ListItem = { ...item, content: wrap(wrapper, item.content) };
  if (item.items) marked.items = item.items.map((child) => markItem(child, wrapper));
  return marked;
}

function compareItems(before: readonly ListItem[], after: readonly ListItem[]): ListItem[] {
  const pairs = pair(before, after, (item) => JSON.stringify(item), (previous, item) => alike(htmlToText(itemContent(previous)), htmlToText(itemContent(item))));
  return pairs.map((entry) => {
    if (entry.change !== "changed") {
      if (entry.change === "same") return entry.item;
      return markItem(entry.item, entry.change === "added" ? ADDED : REMOVED);
    }
    const content = compareHtml(itemContent(entry.previous), itemContent(entry.item));
    const children = compareItems(itemChildren(entry.previous), itemChildren(entry.item));
    if (typeof entry.item === "string" && children.length === 0) return content;
    const merged: ListItem = { ...(typeof entry.item === "string" ? {} : entry.item), content };
    if (children.length > 0) merged.items = children;
    return merged;
  });
}

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asItems = (value: unknown) => (Array.isArray(value) ? (value as ListItem[]) : []);

function merge(previous: EleaBlock, block: EleaBlock): BlockData {
  if (LIST_TYPES.has(block.type)) return { ...block.data, items: compareItems(asItems(previous.data.items), asItems(block.data.items)) };
  return { ...block.data, text: compareHtml(asText(previous.data.text), asText(block.data.text)) };
}

/**
 * Compares two versions of a document block by block. Blocks are matched by content, not by
 * id. A paragraph, heading, quote or list that kept half of its words is one changed block
 * with both versions inside; any other difference is a block removed, a block added, or both.
 */
export function compareBlocks(before: readonly EleaBlock[], after: readonly EleaBlock[], options: CompareBlocksOptions = {}): BlockChange[] {
  const registry = options.registry ?? defaultRegistry;
  const related = (previous: EleaBlock, block: EleaBlock) =>
    previous.type === block.type && (TEXT_TYPES.has(block.type) || LIST_TYPES.has(block.type)) && alike(registry.toText(previous), registry.toText(block));
  return pair(before, after, (block) => `${block.type}\u0000${JSON.stringify(block.data)}`, related).map((entry) =>
    entry.change === "changed"
      ? { change: "changed", block: { ...entry.item, data: merge(entry.previous, entry.item) }, previous: entry.previous }
      : { change: entry.change, block: entry.item },
  );
}
