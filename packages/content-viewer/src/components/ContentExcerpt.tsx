import { documentExcerpt, parseDocument, type BlockRegistry, defaultRegistry } from "@alien6-studio/elea-content";
import type { JSX } from "react";

export interface ContentExcerptProps {
  /** A document, its JSON, text or HTML; anything `parseDocument` reads. */
  data: unknown;
  maxLength?: number;
  registry?: BlockRegistry;
  /** Limit the excerpt to these block types, in document order. */
  blockTypes?: readonly string[];
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/** One short line of plain text for cards, calendars and lists. Renders nothing for empty content. */
export function ContentExcerpt({ data, maxLength = 150, registry = defaultRegistry, blockTypes, as = "p", className }: Readonly<ContentExcerptProps>) {
  const document = parseDocument(data, { registry });
  if (blockTypes) document.blocks = document.blocks.filter((block) => blockTypes.includes(block.type));
  const text = documentExcerpt(document, registry, maxLength);
  if (!text) return null;
  const Tag = as as "p";
  return <Tag className={["elea-content-excerpt", className].filter(Boolean).join(" ")}>{text}</Tag>;
}
