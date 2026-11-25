import { asRecord, blockToMarkdown, cloneData, decodeHtmlEntities, en, generateId, htmlToText, markdownToBlocks, type BlockLike, type BlockRegistry, type EleaBlock, type MarkdownExportOptions } from "@alien6-studio/elea-content";

export interface MarkdownDraft {
  text: string;
  blocks: EleaBlock[];
  /** Retain the originals of portable representations for cut, paste and duplication. */
  references: ReadonlyMap<string, readonly ProjectedBlock[]>;
}

function signature({ type, data }: BlockLike): string {
  return JSON.stringify([type, data]);
}

const emptyParagraph = { type: "paragraph", data: { text: "" } };

type SourceOptions = MarkdownExportOptions & { labels?: Readonly<Record<string, string>> };

// A pending visual line survives switching modes, including a break inside a formatted run.
function withTrailingBreak(block: EleaBlock, text: string): string {
  const trailingBreak = typeof block.data.text === "string" && /<br\s*\/?>\s*(?:<\/\w+>\s*)*$/i.test(block.data.text);
  if (!trailingBreak) return text;
  if (block.type === "paragraph") return `${text}  \n`;
  if (block.type !== "quote") return text;
  const lines = text ? text.split("\n") : [];
  const caption = block.data.caption ? lines.pop() : undefined;
  lines.push(">");
  if (caption) lines.push(caption);
  return lines.join("\n");
}

function withPortableBody(block: EleaBlock, text: string, options: SourceOptions): string {
  if (block.type === "image" && !text.startsWith("![")) {
    const caption = typeof block.data.caption === "string" ? block.data.caption.replaceAll(/["\\]/g, String.raw`\$&`) : "";
    const title = caption ? ` "${caption}"` : "";
    return `![${text}](${title})`;
  }
  const video = block.type === "video" || block.type === "embed";
  const attachment = block.type === "attachment" || block.type === "attaches";
  if (video && !text.startsWith("[") || attachment && !text) {
    const label = text || options.labels?.[block.type] || en.blockTypes[block.type as keyof typeof en.blockTypes];
    return `[${label}]()`;
  }
  return text;
}

function projectBlock(block: EleaBlock, options: SourceOptions) {
  let text = withPortableBody(block, withTrailingBreak(block, blockToMarkdown(block, options) ?? ""), options);
  let [part, extra] = markdownToBlocks(text, { preserveEmptyParagraphs: true });
  if (extra && block.type === "paragraph") {
    // Legacy rich text can contain several HTML paragraphs in one document block.
    text = text.split("\n").filter(Boolean).join("  \n");
    [part, extra] = markdownToBlocks(text);
  }
  if ((!part && block.type !== "paragraph") || extra) {
    // An unsupported extension has no portable body. A visible code span can be
    // moved or deleted without exposing its id, configuration or private data.
    const label = block.type.replaceAll("`", "").replaceAll(/\s+/g, " ").trim() || "block";
    text = `\`${label}\``;
    [part] = markdownToBlocks(text);
  }
  const parsed = part ?? emptyParagraph;
  return { block, text, parsed, key: signature(parsed) };
}

export function createMarkdownSource(blocks: readonly EleaBlock[], options: SourceOptions = {}) {
  const projected = blocks.map(block => projectBlock(block, options));
  return { blocks: projected, text: projected.map(({ text }) => text).join("\n\n") };
}

type ProjectedBlock = ReturnType<typeof projectBlock>;

function standaloneLink(part: BlockLike) {
  const html = asRecord(part.data).text;
  if (part.type !== "paragraph" || typeof html !== "string") return undefined;
  const prefix = '<a href="';
  const end = html.indexOf('">', prefix.length);
  if (!html.startsWith(prefix) || end < 0 || !html.endsWith("</a>")) return undefined;
  const label = html.slice(end + 2, -4);
  if (label.includes("</a>")) return undefined;
  return { url: decodeHtmlEntities(html.slice(prefix.length, end)), label: htmlToText(label) };
}

const MEDIA_TYPES = new Set(["video", "embed", "attachment", "attaches"]);

function mediaEdit(part: BlockLike, candidate: ProjectedBlock, previous: EleaBlock): EleaBlock | undefined {
  const { type, data } = previous;
  const link = standaloneLink(part);
  if (!link) {
    // Some resources have a title but no downloadable URL.
    if (type !== "attachment" || part.type !== "paragraph" || standaloneLink(candidate.parsed)) return undefined;
    const text = asRecord(part.data).text;
    return { ...previous, data: { ...data, title: htmlToText(typeof text === "string" || typeof text === "number" ? String(text) : "") } };
  }
  const sameUrl = standaloneLink(candidate.parsed)?.url === link.url;
  if (type === "video") return { ...previous, data: { ...data, url: link.url, caption: link.label } };
  if (type === "embed") return { ...previous, data: { ...data, ...(sameUrl ? {} : { source: link.url, embed: link.url }), caption: link.label } };
  if (type === "attaches") return { ...previous, data: { ...data, title: link.label, ...(sameUrl ? {} : { file: { url: link.url } }) } };
  return { ...previous, data: { ...data, title: link.label, ...(sameUrl ? {} : { url: link.url }) } };
}

function mergeEdit(part: BlockLike, candidate: ProjectedBlock, previous: EleaBlock, registry: BlockRegistry): EleaBlock {
  const { data } = previous;
  const changed = registry.normalizeData(part.type, asRecord(part.data));
  const before = asRecord(candidate.parsed.data);
  const next = asRecord(part.data);
  if (part.type === "quote") {
    // A change to the attribution must preserve formatting that Markdown
    // cannot represent in the original body, such as underline.
    return { ...previous, data: { ...data,
      ...(before.text !== next.text && { text: changed.text }),
      ...(before.caption !== next.caption && { caption: changed.caption }),
    } };
  }
  if (part.type === "image") {
    const image = { ...data };
    if (before.alt !== next.alt) image.alt = next.alt;
    if (before.caption !== next.caption) image.caption = next.caption;
    if (asRecord(before.file).url !== asRecord(next.file).url) {
      delete image.url;
      image.file = changed.file;
    }
    return { ...previous, data: image };
  }
  return { ...previous, data: { ...data, ...changed } };
}

function applyEdit(part: BlockLike, candidate: ProjectedBlock | undefined, registry: BlockRegistry): EleaBlock {
  const previous = candidate?.block;
  if (previous && candidate) {
    const edited = MEDIA_TYPES.has(previous.type) ? mediaEdit(part, candidate, previous) : undefined;
    if (edited) return edited;
    if (previous.type === part.type || (previous.type === "nestedlist" && part.type === "list")) return mergeEdit(part, candidate, previous, registry);
  }
  return { id: previous?.id ?? generateId(), type: part.type, data: registry.normalizeData(part.type, asRecord(part.data)) };
}

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** Reserve unchanged blocks first so neighbouring edits and moves preserve their identities. */
export function readMarkdownSource(text: string, source: ReturnType<typeof createMarkdownSource>, registry: BlockRegistry, prior?: MarkdownDraft["references"]): MarkdownDraft {
  const current = new Map(source.blocks.map(entry => [entry.block.id, entry]));
  const retained = [...(prior?.values() ?? [])].flat()
    .filter(entry => current.get(entry.block.id)?.block.type !== entry.block.type);
  for (const entry of source.blocks) {
    if (signature(entry.block) !== entry.key) retained.push(entry);
  }
  const references = groupBy(retained, entry => entry.key);
  const byId = new Map(retained.map(entry => [entry.block.id, entry]));
  const parsed = markdownToBlocks(text, { preserveEmptyParagraphs: true });
  const keys = parsed.map(signature);
  const matches = keys.map((key, index) => source.blocks[index]?.key === key ? source.blocks[index]?.block : undefined);
  const used = new Set(matches.flatMap(block => block ? [block.id] : []));
  const remaining = source.blocks.filter(({ block }) => !used.has(block.id)).reverse();
  const originals = groupBy(remaining, entry => entry.key);
  keys.forEach((key, index) => {
    if (matches[index]) return;
    const original = originals.get(key)?.pop()?.block;
    if (original) {
      matches[index] = original;
      used.add(original.id);
      return;
    }
    const copies = references.get(key);
    if (copies?.length) {
      const available = copies.find(({ block }) => !used.has(block.id) && !current.has(block.id));
      const kept = available?.block ?? { ...cloneData(copies[0]!.block), id: generateId() };
      matches[index] = kept;
      used.add(kept.id);
    }
  });

  // Match edited media and text by their representation when insertion shifted their indices.
  const kind = (part: BlockLike) => standaloneLink(part) ? "link" : part.type;
  const byKind = groupBy(remaining.filter(({ block }) => !used.has(block.id)), entry => kind(entry.parsed));
  const candidates = parsed.map((part, index) => {
    if (matches[index]) return undefined;
    const candidate = byKind.get(kind(part))?.pop();
    if (candidate) used.add(candidate.block.id);
    return candidate;
  });
  const blocks = parsed.map((part, index) => {
    const matched = matches[index];
    if (matched) return matched;
    let candidate = candidates[index];
    const positional = source.blocks[index];
    if (!candidate && positional && !used.has(positional.block.id)) {
      candidate = positional;
      used.add(positional.block.id);
    }
    // An incomplete link temporarily parses as a paragraph while its URL is being typed;
    // its bracket is escaped once that paragraph is projected again.
    if (candidate?.block.type === "paragraph" && /^!?\\?\[/.test(candidate.text) && (part.type === "image" || standaloneLink(part))) {
      candidate = byId.get(candidate.block.id) ?? candidate;
    }
    return applyEdit(part, candidate, registry);
  });
  return { text, blocks, references };
}
