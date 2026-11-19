import type { HtmlSanitizer } from "@alien6-studio/elea-content";
import type { CSSProperties, JSX } from "react";

export interface SanitizedHtmlProps {
  html: string;
  sanitizer: HtmlSanitizer;
  /** Container element; defaults to `div`. */
  as?: keyof JSX.IntrinsicElements;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  id?: string | undefined;
}

/** Renders stored HTML through the sanitizer, so the markup is part of the first server-rendered HTML. */
export function SanitizedHtml({ html, sanitizer, as = "div", className, style, id }: SanitizedHtmlProps) {
  const Tag = as as "div";
  return <Tag id={id} className={className} style={style} dangerouslySetInnerHTML={{ __html: sanitizer.sanitize(html) }} />;
}
