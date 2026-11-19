import type { EleaBlock } from "./document.js";

/** Presentation hints derived from neighbouring blocks, for legacy flat content. */
export interface HierarchyMeta {
  indentLevel: number;
  isSubItem: boolean;
  /** A paragraph ending with a colon that introduces the next blocks. */
  isListIntroducer: boolean;
}

export type AnnotatedBlock<TBlock extends EleaBlock = EleaBlock> = TBlock & { meta: HierarchyMeta };

const LIST_MARKER = /^(\d+\.|[•◦▪▫-]|[a-z]\)|[A-Z]\))\s/;

function text(block: EleaBlock): string {
  return typeof block.data.text === "string" ? block.data.text.trim() : "";
}

function endsWithColon(block: EleaBlock): boolean {
  return block.type === "paragraph" && text(block).endsWith(":");
}

function looksLikeListItem(value: string): boolean {
  return LIST_MARKER.test(value) || value.includes("<li>") || value.includes("<ul>") || value.includes("<ol>");
}

function indentAfter(current: EleaBlock, previous: EleaBlock): Pick<HierarchyMeta, "indentLevel" | "isSubItem"> {
  if (endsWithColon(previous)) return { indentLevel: 1, isSubItem: true };
  if (current.type === "paragraph" && previous.type === "paragraph") {
    const value = text(current);
    const previousValue = text(previous);
    if (looksLikeListItem(value) && (previousValue.endsWith(":") || LIST_MARKER.test(previousValue))) {
      return { indentLevel: 1, isSubItem: true };
    }
  }
  return { indentLevel: 0, isSubItem: false };
}

/**
 * Content written as flat paragraphs (older CMS exports) reads better when the paragraphs
 * following an introducer, or consecutive list-like paragraphs, are indented. The blocks
 * themselves are not changed; the hints travel in `meta`.
 */
export function annotateHierarchy<TBlock extends EleaBlock>(blocks: readonly TBlock[]): AnnotatedBlock<TBlock>[] {
  return blocks.map((block, index) => {
    const previous = blocks[index - 1];
    const indent = previous ? indentAfter(block, previous) : { indentLevel: 0, isSubItem: false };
    return { ...block, meta: { ...indent, isListIntroducer: endsWithColon(block) } };
  });
}
