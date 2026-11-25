import type { BlockData } from "../document.js";
import { htmlToText } from "../html/text.js";
import { asRecord, asString, cloneData, defineBlock } from "./definition.js";
import { asDefinition, createRegistry, type BlockRegistry } from "./registry.js";

export type ParagraphData = { text: string };
export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeaderData = { text: string; level: HeaderLevel };
/** EditorJS nested list item; plain strings are the common case. `meta.checked` is the state of a task in a checklist. */
export type ListItem = string | { content: string; items?: ListItem[]; childrenMarker?: ListMarker; meta?: { checked: boolean } };
/** A checklist is one at every level: its nested lists hold tasks too, and it takes no marker. */
export type ListStyle = "ordered" | "unordered" | "checklist";
const LIST_MARKER_STYLES = { disc: "unordered", circle: "unordered", square: "unordered", decimal: "ordered", "lower-alpha": "ordered", "lower-roman": "ordered" } as const;
export type ListMarker = keyof typeof LIST_MARKER_STYLES;
export type ListData = { style: ListStyle; items: ListItem[]; marker?: ListMarker };

export function asListMarker(value: unknown): ListMarker | undefined {
  return typeof value === "string" && Object.hasOwn(LIST_MARKER_STYLES, value) ? value as ListMarker : undefined;
}

/** The style a list states, `unordered` when it states none Elea knows. */
export function asListStyle(value: unknown): ListStyle {
  return value === "ordered" || value === "checklist" ? value : "unordered";
}

/** The style of the lists nested in a list: bullets and numbers alternate, tasks stay tasks. */
export function nestedListStyle(style: ListStyle): ListStyle {
  if (style === "checklist") return style;
  return style === "ordered" ? "unordered" : "ordered";
}

export function listStyleForMarker(marker: ListMarker | undefined, fallback: ListStyle): ListStyle {
  return marker ? LIST_MARKER_STYLES[marker] : fallback;
}
export type QuoteData = { text: string; caption: string };
export type FileRef = { url: string; id: string };
export type ImageData = { file: FileRef; caption: string; alt?: string };
export type VideoData = { url: string; caption: string };
export type AttachmentData = {
  resourceId: string;
  title: string;
  type: string;
  description: string;
  url: string;
  file?: FileRef;
};

export const BUILTIN_BLOCK_TYPES = ["paragraph", "header", "list", "quote", "image", "video", "attachment"] as const;
export type BuiltinBlockType = (typeof BUILTIN_BLOCK_TYPES)[number];

/** Legacy EditorJS types that viewers still render but editors do not create. */
export const LEGACY_BLOCK_TYPES = ["embed", "code", "table", "raw", "attaches", "delimiter"] as const;

function asLevel(value: unknown, fallback: HeaderLevel = 2): HeaderLevel {
  const level = typeof value === "number" ? value : Number.parseInt(asString(value), 10);
  return level >= 1 && level <= 6 ? (Math.trunc(level) as HeaderLevel) : fallback;
}

/** Nesting beyond this depth is flattened: deeper lists do not read well and unbounded recursion is a hazard. */
export const MAX_LIST_DEPTH = 8;

/** Whether a task is done; an item that says nothing is still to do. */
export function isListItemChecked(item: ListItem): boolean {
  return typeof item !== "string" && item.meta?.checked === true;
}

function asListItem(value: unknown, depth = 0): ListItem | null {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (typeof record.content !== "string") return null;
  const checked = asRecord(record.meta).checked;
  // EditorJS reads the `items` of every task
  const own = { content: record.content, ...(typeof checked === "boolean" && { meta: { checked }, items: [] }) };
  if (depth >= MAX_LIST_DEPTH || !Array.isArray(record.items)) return own;
  const items = record.items.map((item) => asListItem(item, depth + 1)).filter((item): item is ListItem => item !== null);
  const marker = asListMarker(record.childrenMarker);
  return items.length > 0 ? { ...own, items, ...(marker && { childrenMarker: marker }) } : own;
}

function listItemText(item: ListItem): string {
  if (typeof item === "string") return htmlToText(item);
  const nested = (item.items ?? []).map(listItemText).filter((text) => text.length > 0);
  return [htmlToText(item.content), ...nested].filter((text) => text.length > 0).join("\n");
}

function asFileRef(value: unknown): FileRef {
  const record = asRecord(value);
  const url = asString(record.url);
  // EditorJS image tool wrote `fileId`; the Elea editor writes `id`
  const id = asString(record.id, asString(record.fileId));
  return { url, id };
}

export const paragraphBlock = defineBlock<ParagraphData>({
  type: "paragraph",
  defaults: () => ({ text: "" }),
  normalize: (data) => ({ text: asString(data.text) }),
  toText: (data) => htmlToText(data.text),
});

export const headerBlock = defineBlock<HeaderData>({
  type: "header",
  defaults: () => ({ text: "", level: 2 }),
  normalize: (data) => ({ text: asString(data.text), level: asLevel(data.level) }),
  toText: (data) => htmlToText(data.text),
});

const listDefinition = {
  defaults: (): ListData => ({ style: "unordered", items: [""] }),
  normalize: (data: BlockData): ListData => {
    const stated = asListStyle(data.style);
    const marker = stated === "checklist" ? undefined : asListMarker(data.marker);
    return {
      style: listStyleForMarker(marker, stated),
      items: Array.isArray(data.items) ? data.items.map((item) => asListItem(item)).filter((item): item is ListItem => item !== null) : [],
      ...(marker && { marker }),
    };
  },
  toText: (data: ListData) => data.items.map(listItemText).filter((text) => text.length > 0).join("\n"),
};

export const listBlock = defineBlock<ListData>({ type: "list", ...listDefinition });
/** EditorJS nested list tool: the same data as a list, under its own type. */
export const nestedListBlock = defineBlock<ListData>({ type: "nestedlist", ...listDefinition });

export const quoteBlock = defineBlock<QuoteData>({
  type: "quote",
  defaults: () => ({ text: "", caption: "" }),
  normalize: (data) => ({ text: asString(data.text), caption: asString(data.caption) }),
  toText: (data) => [htmlToText(data.text), htmlToText(data.caption)].filter((text) => text.length > 0).join(" — "),
});

export const imageBlock = defineBlock<ImageData>({
  type: "image",
  defaults: () => ({ file: { url: "", id: "" }, caption: "" }),
  normalize: (data) => {
    const file = asFileRef(data.file);
    // Legacy content may carry the image URL at the root
    if (!file.url && !file.id && typeof data.url === "string") file.url = data.url;
    const image: ImageData = { file, caption: asString(data.caption) };
    if (typeof data.alt === "string" && data.alt.length > 0) image.alt = data.alt;
    return image;
  },
  toText: (data) => htmlToText(data.caption),
  hasMedia: (data) => data.file.url.length > 0 || data.file.id.length > 0,
});

export const videoBlock = defineBlock<VideoData>({
  type: "video",
  defaults: () => ({ url: "", caption: "" }),
  normalize: (data) => ({ url: asString(data.url), caption: asString(data.caption) }),
  toText: (data) => htmlToText(data.caption),
  hasMedia: (data) => data.url.length > 0,
});

export const attachmentBlock = defineBlock<AttachmentData>({
  type: "attachment",
  defaults: () => ({ resourceId: "", title: "", type: "", description: "", url: "" }),
  normalize: (data) => {
    const attachment: AttachmentData = {
      resourceId: Number.isSafeInteger(data.resourceId) ? String(data.resourceId) : asString(data.resourceId),
      title: asString(data.title),
      type: asString(data.type),
      description: asString(data.description),
      url: asString(data.url),
    };
    if (data.file !== undefined && data.file !== null) attachment.file = asFileRef(data.file);
    return attachment;
  },
  toText: (data) => [htmlToText(data.title), htmlToText(data.description)].filter((text) => text.length > 0).join(" — "),
  hasMedia: (data) => data.resourceId.length > 0 || data.url.length > 0,
});

/** Legacy EditorJS blocks: data passes through, text comes from the usual fields. */
function legacyText(data: BlockData): string {
  const captionOrText = [data.text, data.caption, data.code, data.html, data.title]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => htmlToText(value));
  const file = asRecord(data.file);
  const fileTitle = asString(file.title, asString(file.name));
  if (fileTitle) captionOrText.push(fileTitle);
  if (Array.isArray(data.content)) {
    for (const row of data.content) {
      if (Array.isArray(row)) captionOrText.push(row.map((cell) => htmlToText(asString(cell))).join(" "));
    }
  }
  return captionOrText.filter((text) => text.length > 0).join(" ");
}

export const legacyBlocks = LEGACY_BLOCK_TYPES.map((type) =>
  defineBlock<BlockData>({
    type,
    defaults: () => ({}),
    normalize: (data) => cloneData(data),
    toText: legacyText,
    hasMedia: (data) => type === "embed" || type === "attaches" ? Object.keys(data).length > 0 : false,
  }),
);

export const builtinBlocks = [
  asDefinition(paragraphBlock),
  asDefinition(headerBlock),
  asDefinition(listBlock),
  asDefinition(nestedListBlock),
  asDefinition(quoteBlock),
  asDefinition(imageBlock),
  asDefinition(videoBlock),
  asDefinition(attachmentBlock),
];

/** The seven Elea blocks plus the legacy EditorJS types, read-only. */
export const defaultRegistry: BlockRegistry = createRegistry([...builtinBlocks, ...legacyBlocks]);
