import { createSanitizer, type HtmlPurifier, type HtmlSanitizer, type SanitizerOptions } from "@alien6-studio/elea-content";
import DOMPurify from "isomorphic-dompurify";

/** A sanitizer on the isomorphic DOMPurify build: the browser's DOM, or jsdom during server rendering. */
export function createDefaultSanitizer(options: SanitizerOptions = {}): HtmlSanitizer {
  return createSanitizer(DOMPurify as unknown as HtmlPurifier, options);
}

/** The sanitizer the viewer uses unless one is passed in; link hosts are unknown, so every absolute link opens in a new tab. */
export const defaultSanitizer: HtmlSanitizer = createDefaultSanitizer();
