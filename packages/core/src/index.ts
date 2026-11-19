/**
 * Block document model shared by every Elea package.
 * The on-disk shape stays compatible with EditorJS output: `{ time, version, blocks }`.
 */
export const ELEA_DOCUMENT_VERSION = "0.0.0";

export interface EleaBlock<TData = Record<string, unknown>> {
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

/** Wraps blocks into a versioned document. Blocks are copied, never mutated. */
export function createDocument<TBlock extends EleaBlock>(
  blocks: readonly TBlock[],
  options: CreateDocumentOptions = {},
): EleaDocument<TBlock> {
  return {
    time: options.time ?? Date.now(),
    version: ELEA_DOCUMENT_VERSION,
    blocks: blocks.map((block) => ({ ...block })),
  };
}

/** True when the value has the minimal shape of a block document. */
export function isDocument(value: unknown): value is EleaDocument {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<EleaDocument>;
  return (
    Array.isArray(candidate.blocks) &&
    candidate.blocks.every(
      (block) =>
        typeof block === "object" &&
        block !== null &&
        typeof (block as EleaBlock).type === "string",
    )
  );
}
