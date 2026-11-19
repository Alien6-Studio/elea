import { generateId } from "./id.js";
import type { BlockRegistry } from "./blocks/registry.js";
import { cloneData } from "./blocks/definition.js";

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
}

/** Wraps blocks into a versioned document. Blocks and their data are copied, never shared with the input. */
export function createDocument<TBlock extends EleaBlock>(
  blocks: readonly TBlock[],
  options: CreateDocumentOptions = {},
): EleaDocument<TBlock> {
  return {
    time: options.time ?? Date.now(),
    version: ELEA_DOCUMENT_VERSION,
    blocks: blocks.map((block) => ({ ...block, data: cloneData(block.data) as TBlock["data"] })),
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
  /** Replaces missing block ids; defaults to `generateId`. */
  generateId?: () => string;
}

/** Gives every block an id, applies the registry normalization of known types and stamps time and version. */
export function normalizeDocument(
  input: { blocks: readonly BlockLike[]; time?: unknown; version?: unknown },
  options: NormalizeOptions = {},
): EleaDocument {
  const nextId = options.generateId ?? generateId;
  const seen = new Set<string>();
  const blocks = input.blocks.map((block) => {
    const data = typeof block.data === "object" && block.data !== null && !Array.isArray(block.data) ? (block.data as BlockData) : {};
    // Known types are rebuilt field by field; unknown types are copied so the input is never shared
    const normalizedData = options.registry?.has(block.type) ? options.registry.normalizeData(block.type, data) : cloneData(data);
    let id = typeof block.id === "string" && block.id.length > 0 ? block.id : nextId();
    while (seen.has(id)) id = nextId();
    seen.add(id);
    return { id, type: block.type, data: normalizedData };
  });
  return {
    time: typeof input.time === "number" && Number.isFinite(input.time) ? input.time : Date.now(),
    version: typeof input.version === "string" && input.version.length > 0 ? input.version : ELEA_DOCUMENT_VERSION,
    blocks,
  };
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
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (isDocument(parsed)) return normalizeDocument(parsed, options);
        if (Array.isArray(parsed) && parsed.every(isBlockLike)) return normalizeDocument({ blocks: parsed }, options);
        // Valid JSON that is not a document: nothing to render
        return normalizeDocument({ blocks: [] }, options);
      } catch {
        // Not JSON: treated as text below
      }
    }
    return normalizeDocument({ blocks: textToBlocks(trimmed) }, options);
  }
  if (Array.isArray(value) && value.every(isBlockLike)) return normalizeDocument({ blocks: value }, options);
  return normalizeDocument({ blocks: [] }, options);
}

/** True when the document has no block with visible content, as judged by the registry. */
export function isEmptyDocument(document: EleaDocument, registry: BlockRegistry): boolean {
  return document.blocks.every((block) => registry.toText(block).trim().length === 0 && !registry.hasMedia(block));
}
