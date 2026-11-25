const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  hellip: "…", ndash: "–", mdash: "—", laquo: "«", raquo: "»",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", agrave: "à", acirc: "â", auml: "ä",
  ccedil: "ç", ugrave: "ù", ucirc: "û", uuml: "ü", icirc: "î", iuml: "ï", ocirc: "ô", ouml: "ö",
  copy: "©", reg: "®", euro: "€", deg: "°",
};

/** Decodes named and numeric HTML entities without a DOM. Unknown entities are left as written. */
export function decodeHtmlEntities(text: string): string {
  return text.replaceAll(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match: string, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = hex ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const LINE_BREAKING_TAG = /^(?:br\b|\/(?:p|div|li|h[1-6]|blockquote|tr|pre)\b)/;

/**
 * Removes tags with a linear scan (no regular expression over the whole input, so no
 * catastrophic backtracking). Line-breaking tags become newlines so that text keeps its
 * paragraphs. A `<` that does not start a tag, or never closes, is kept as text.
 */
export function stripHtmlTags(html: string): string {
  let out = "";
  let index = 0;
  while (index < html.length) {
    const char = html[index] as string;
    // As in HTML parsing, "<" starts a tag only before a letter, "/" or "!"
    if (char !== "<" || !/[a-zA-Z/!]/.test(html[index + 1] ?? "")) {
      out += char;
      index += 1;
      continue;
    }
    const end = html.indexOf(">", index);
    if (end === -1) {
      out += html.slice(index);
      break;
    }
    const tag = html.slice(index + 1, end).trim().toLowerCase();
    if (LINE_BREAKING_TAG.test(tag)) out += "\n";
    index = end + 1;
  }
  return out;
}

export interface HtmlToTextOptions {
  /** Collapse runs of whitespace into one space and trim; defaults to true. */
  collapseWhitespace?: boolean;
}

/** Plain text of an HTML fragment: tags removed, entities decoded. */
export function htmlToText(html: string, options: HtmlToTextOptions = {}): string {
  const text = decodeHtmlEntities(stripHtmlTags(html));
  return options.collapseWhitespace === false ? text : text.replaceAll(/\s+/g, " ").trim();
}

/** Shortens text on a word boundary when possible and appends an ellipsis. */
export function excerpt(text: string, maxLength = 150, ellipsis = "…"): string {
  const collapsed = text.replaceAll(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  const cut = collapsed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}${ellipsis}`;
}
