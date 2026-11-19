import type { BlockData, EleaBlock } from "../document.js";
import type { AnyBlockDefinition, BlockDefinition } from "./definition.js";

export interface BlockRegistry {
  readonly types: readonly string[];
  has(type: string): boolean;
  get(type: string): AnyBlockDefinition | undefined;
  /** Default data of a type; `{}` for an unknown type. */
  defaults(type: string): BlockData;
  /** Normalized data of a type; unknown types pass through untouched. */
  normalizeData(type: string, data: BlockData): BlockData;
  toText(block: Pick<EleaBlock, "type" | "data">): string;
  hasMedia(block: Pick<EleaBlock, "type" | "data">): boolean;
  /** A registry extended with more definitions; a same-named definition replaces the previous one. */
  with(...definitions: readonly AnyBlockDefinition[]): BlockRegistry;
}

export function createRegistry(definitions: readonly AnyBlockDefinition[]): BlockRegistry {
  const byType = new Map<string, AnyBlockDefinition>();
  for (const definition of definitions) byType.set(definition.type, definition);
  return {
    types: [...byType.keys()],
    has: (type) => byType.has(type),
    get: (type) => byType.get(type),
    defaults: (type) => byType.get(type)?.defaults() ?? {},
    normalizeData: (type, data) => byType.get(type)?.normalize(data) ?? data,
    toText: (block) => byType.get(block.type)?.toText(block.data) ?? "",
    hasMedia: (block) => byType.get(block.type)?.hasMedia?.(block.data) ?? false,
    with: (...more) => createRegistry([...byType.values(), ...more]),
  };
}

/** Narrow a definition for registration; keeps call sites readable. */
export function asDefinition<TData extends BlockData>(definition: BlockDefinition<TData>): AnyBlockDefinition {
  return definition as unknown as AnyBlockDefinition;
}
