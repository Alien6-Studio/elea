import type { BlockData } from "../document.js";

/**
 * Everything the core knows about one block type. Rendering and editing
 * components live in the React packages and are looked up by `type`.
 */
export interface BlockDefinition<TData extends BlockData = BlockData> {
  readonly type: string;
  /** Data of a freshly inserted block. */
  defaults(): TData;
  /** Coerces stored data of any shape into valid data; never throws. */
  normalize(data: BlockData): TData;
  /** Plain text of the block, for excerpts, search and accessibility. */
  toText(data: TData): string;
  /** True when the block carries media or a file rather than text. */
  hasMedia?(data: TData): boolean;
}

export type AnyBlockDefinition = BlockDefinition<BlockData>;

export function defineBlock<TData extends BlockData>(definition: BlockDefinition<TData>): BlockDefinition<TData> {
  return definition;
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function asRecord(value: unknown): BlockData {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as BlockData) : {};
}

/** A deep copy of block data, so normalized documents never share objects with their input. */
export function cloneData<T extends object>(data: T): T {
  try {
    return structuredClone(data);
  } catch {
    // Functions or other non-cloneable values: fall back to a JSON round trip, dropping them
    return JSON.parse(JSON.stringify(data)) as T;
  }
}
