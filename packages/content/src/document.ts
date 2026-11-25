import { generateId } from "./id.js";
import type { BlockRegistry } from "./blocks/registry.js";
import { asRecord, cloneData } from "./blocks/definition.js";

/** Version of the document schema written by `createDocument` and `normalizeDocument`. */
export const ELEA_DOCUMENT_VERSION = "1.0.0";

export type BlockData = Record<string, unknown>;

/** One block of a document; the shape EditorJS writes, so existing content loads as is. */
export interface EleaBlock<TData extends BlockData = BlockData> {
  id: string;
  type: string;
  data: TData;
}

export interface EleaDocument<TBlock extends EleaBlock = EleaBlock> {
  time: number;
  version: string;
  blocks: TBlock[];
}

export interface CreateDocumentOptions {
  /** Creation time in milliseconds since the epoch; defaults to `Date.now()`. */
  time?: number;
  /** Version expected by the destination, for example when saving back to EditorJS. */
  version?: string;
}

/** Wraps blocks into a versioned document. Blocks and their data are copied, never shared with the input. */
export function createDocument<TBlock extends EleaBlock>(
  blocks: readonly TBlock[],
  options: CreateDocumentOptions = {},
): EleaDocument<TBlock> {
  return {
    time: options.time ?? Date.now(),
    version: options.version ?? ELEA_DOCUMENT_VERSION,
    blocks: blocks.map((block) => cloneData(block)),
  };
}

/** Loose block shape accepted on input: id and data may be missing. */
export interface BlockLike {
  id?: unknown;
  type: string;
  data?: unknown;
}

function isBlockLike(value: unknown): value is BlockLike {
  return typeof value === "object" && value !== null && typeof (value as BlockLike).type === "string";
}

/** True when the value has the minimal shape of a block document: an array of typed blocks. */
export function isDocument(value: unknown): value is { blocks: BlockLike[]; time?: unknown; version?: unknown } {
  if (typeof value !== "object" || value === null) return false;
  const blocks = (value as { blocks?: unknown }).blocks;
  return Array.isArray(blocks) && blocks.every(isBlockLike);
}

export interface NormalizeOptions {
  /** Known block types; unknown types are kept untouched so legacy content survives. */
  registry?: BlockRegistry;
  /** Proposes a replacement for a missing or duplicate ID at the given zero-based block index. */
  generateId?: (index: number) => string;
}

function isBlockId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** Gives every block an id, applies the registry normalization of known types and stamps time and version. */
export function normalizeDocument(
  input: { blocks: readonly BlockLike[]; time?: unknown; version?: unknown },
  options: NormalizeOptions = {},
): EleaDocument {
  const nextId = options.generateId ?? generateId;
  // An earlier block with a missing id must not take an id already stored on a later block.
  const storedIds = new Set(input.blocks.flatMap(({ id }) => isBlockId(id) ? [id] : []));
  const seen = new Set<string>();
  let fallbackIndex = 0;

  function replacementId(index: number): string {
    const proposed = nextId(index);
    if (isBlockId(proposed) && !storedIds.has(proposed) && !seen.has(proposed)) return proposed;

    let fallback: string;
    do {
      fallback = `elea-block-${++fallbackIndex}`;
    } while (storedIds.has(fallback) || seen.has(fallback));
    return fallback;
  }

  const blocks = input.blocks.map((block, index) => {
    const data = typeof block.data === "object" && block.data !== null && !Array.isArray(block.data) ? (block.data as BlockData) : {};
    // Known types are rebuilt field by field; unknown types are copied so the input is never shared
    const normalizedData = options.registry?.has(block.type) ? options.registry.normalizeData(block.type, data) : cloneData(data);
    const id = isBlockId(block.id) && !seen.has(block.id) ? block.id : replacementId(index);
    seen.add(id);
    const { id: _id, type, data: _data, ...extensions } = block;
    return { ...(Object.keys(extensions).length ? cloneData(extensions) : undefined), id, type, data: normalizedData };
  });
  return {
    time: typeof input.time === "number" && Number.isFinite(input.time) ? input.time : Date.now(),
    version: typeof input.version === "string" && input.version.length > 0 ? input.version : ELEA_DOCUMENT_VERSION,
    blocks,
  };
}

/** Opens a stored document for editing. Keep plugin data and stable IDs; a blank draft starts with one paragraph. */
export function prepareEditorBlocks(value: unknown): EleaBlock[] {
  const paragraph = (text: string) => [{ id: "1", type: "paragraph", data: { text } }];
  let source = value;
  if (typeof value === "string") {
    if (!/^\s*[[{]/.test(value)) return paragraph(value);
    try {
      source = JSON.parse(value);
    } catch {
      return paragraph(value);
    }
  }
  const rows = Array.isArray(source) ? source : asRecord(source).blocks;
  if (!Array.isArray(rows) || !rows.length) return paragraph("");
  const blocks = rows.map((row) => {
    const record = asRecord(row);
    const id = typeof record.id === "number" ? String(record.id) : record.id;
    const type = typeof record.type === "string" && record.type ? record.type : "paragraph";
    return { ...record, id, type, data: record.data ?? { text: "" } };
  });
  return normalizeDocument({ blocks }, { generateId: (index) => String(index + 1) }).blocks;
}

/** Splits plain text on blank lines; HTML is kept as one paragraph per blank-line separated chunk. */
function textToBlocks(text: string): BlockLike[] {
  return text
    .split(/\n[ \t]*\n/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => ({ type: "paragraph", data: { text: chunk.replaceAll("\n", "<br>") } }));
}

/**
 * Reads whatever a store returns and produces a normalized document:
 * a document object, its JSON string, plain text, HTML, `null` or anything else.
 * Never throws; unreadable input yields an empty document.
 */
export function parseDocument(value: unknown, options: NormalizeOptions = {}): EleaDocument {
  if (isDocument(value)) return normalizeDocument(value, options);
  if (typeof value === "string") return parseText(value.trim(), options);
  if (Array.isArray(value) && value.every(isBlockLike)) return normalizeDocument({ blocks: value }, options);
  return normalizeDocument({ blocks: [] }, options);
}

function parseText(trimmed: string, options: NormalizeOptions): EleaDocument {
  if (/^[[{]/.test(trimmed)) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (isDocument(parsed)) return normalizeDocument(parsed, options);
      if (Array.isArray(parsed) && parsed.every(isBlockLike)) return normalizeDocument({ blocks: parsed }, options);
      // Valid JSON, but not a document
      return normalizeDocument({ blocks: [] }, options);
    } catch {
      // Not JSON: read as text below
    }
  }
  return normalizeDocument({ blocks: textToBlocks(trimmed) }, options);
}

/** True when the document has no block with visible content, as judged by the registry. */
export function isEmptyDocument(document: EleaDocument, registry: BlockRegistry): boolean {
  return document.blocks.every((block) => registry.toText(block).trim().length === 0 && !registry.hasMedia(block));
}
