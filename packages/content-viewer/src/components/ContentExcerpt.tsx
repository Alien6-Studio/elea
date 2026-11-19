import { documentExcerpt, parseDocument, type BlockRegistry, defaultRegistry } from "@alien6-studio/elea-content";
import type { JSX } from "react";

export interface ContentExcerptProps {
  /** A document, its JSON, text or HTML; anything `parseDocument` reads. */
  data: unknown;
  maxLength?: number;
  registry?: BlockRegistry;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/** One short line of plain text for cards, calendars and lists. Renders nothing for empty content. */
export function ContentExcerpt({ data, maxLength = 150, registry = defaultRegistry, as = "p", className }: ContentExcerptProps) {
  const text = documentExcerpt(parseDocument(data, { registry }), registry, maxLength);
  if (!text) return null;
  const Tag = as as "p";
  return <Tag className={["elea-content-excerpt", className].filter(Boolean).join(" ")}>{text}</Tag>;
}
