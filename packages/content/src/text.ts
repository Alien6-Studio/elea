import type { BlockRegistry } from "./blocks/registry.js";
import type { EleaDocument } from "./document.js";
import { excerpt } from "./html/text.js";

export interface DocumentTextOptions {
  /** Put between blocks; defaults to a blank line. */
  separator?: string;
}

/** Plain text of a whole document, block by block, empty blocks skipped. */
export function documentToText(document: EleaDocument, registry: BlockRegistry, options: DocumentTextOptions = {}): string {
  return document.blocks
    .map((block) => registry.toText(block).trim())
    .filter((text) => text.length > 0)
    .join(options.separator ?? "\n\n");
}

/** A short single-line summary of a document, for cards, calendars and search results. */
export function documentExcerpt(document: EleaDocument, registry: BlockRegistry, maxLength = 150): string {
  return excerpt(documentToText(document, registry, { separator: " " }), maxLength);
}
