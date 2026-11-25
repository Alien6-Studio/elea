import { asText } from "./blocks/definition.js";
import type { BlockRegistry } from "./blocks/registry.js";
import { asListMarker, asListStyle, isListItemChecked, listStyleForMarker, nestedListStyle, type AttachmentData, type ImageData, type ListItem, type ListData, type ListMarker, type ListStyle, type QuoteData, type VideoData } from "./blocks/builtin.js";
import type { BlockLike, EleaDocument } from "./document.js";
import { isSafeUrl, isSiteRelativeUrl } from "./html/policy.js";
import { htmlToText } from "./html/text.js";
import { getVideoEmbedUrl } from "./media/video.js";

export interface HtmlSerializerOptions {
  /**
   * Cleans stored rich text before it is written; the viewer's sanitizer, or any function.
   * Without it rich text is written as plain text: stored markup is never trusted as is.
   */
  sanitize?: (html: string) => string;
  /** Turns a stored file reference into a URL; defaults to the stored URL. */
  resolveAssetUrl?: (file: { url: string; id: string }) => string;
  /** Blocks of unknown types are skipped unless a registry gives them text. */
  registry?: BlockRegistry;
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/** The fallback without a sanitizer: tags removed, text escaped, line breaks kept. */
function plainText(html: string): string {
  return escapeHtml(htmlToText(html, { collapseWhitespace: false }).trim()).replaceAll("\n", "<br>");
}

function safe(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return isSafeUrl(trimmed) || isSiteRelativeUrl(trimmed) ? trimmed : null;
}

/** A task of a checklist: a checkbox nobody can change carries its state, its text names it. */
function taskHtml(item: ListItem, clean: (html: string) => string): string {
  const content = clean(typeof item === "string" ? item : item.content);
  return `<label class="elea-list__task"><input type="checkbox" class="elea-list__check" disabled${isListItemChecked(item) ? " checked" : ""}><span>${content}</span></label>`;
}

function listHtml(items: readonly ListItem[], style: ListStyle, clean: (html: string) => string, level = 0, marker?: ListMarker): string {
  const tasks = style === "checklist";
  const shape = tasks ? style : listStyleForMarker(marker, style);
  const tag = shape === "ordered" ? "ol" : "ul";
  const below = tasks ? style : nestedListStyle(style);
  const inner = items
    .map((item) => {
      if (typeof item === "string" && !tasks) return `<li class="elea-list__item">${clean(item)}</li>`;
      const nested = typeof item !== "string" && item.items?.length ? listHtml(item.items, below, clean, level + 1, asListMarker(item.childrenMarker)) : "";
      const own = typeof item === "string" || tasks ? taskHtml(item, clean) : `<span>${clean(item.content)}</span>`;
      return `<li class="elea-list__item">${own}${nested}</li>`;
    })
    .join("");
  const markerClass = marker && !tasks ? ` elea-list-marker-${marker}` : "";
  return `<${tag} class="elea-list elea-list--${shape} elea-list--level-${Math.min(level, 3)}${markerClass}">${inner}</${tag}>`;
}

/**
 * The static HTML of a document, with the same classes as the viewer, for e-mails, feeds,
 * search indexes or any place without React. Every URL is checked; rich text goes through
 * `sanitize`, and is reduced to plain text when no sanitizer is given.
 */
export function documentToHtml(document: Pick<EleaDocument, "blocks">, options: HtmlSerializerOptions = {}): string {
  const clean = options.sanitize ?? plainText;
  const resolve = options.resolveAssetUrl ?? ((file: { url: string; id: string }) => file.url || file.id);
  const parts: string[] = [];
  for (const block of document.blocks as BlockLike[]) {
    const html = blockToHtml(block, clean, resolve, options.registry);
    if (html) parts.push(`<div class="elea-block elea-block--${escapeHtml(block.type)}" data-elea-block-type="${escapeHtml(block.type)}">${html}</div>`);
  }
  return `<div class="elea-content">${parts.join("")}</div>`;
}

type Clean = (html: string) => string;
type Resolve = (file: { url: string; id: string }) => string;
type Data = Record<string, unknown>;

const figcaption = (caption: string | undefined) => caption ? `<figcaption class="elea-caption">${escapeHtml(caption)}</figcaption>` : "";

function quoteHtml(quote: QuoteData, clean: Clean): string | null {
  if (!quote.text && !quote.caption) return null;
  const caption = quote.caption ? `<cite class="elea-quote__caption">— ${escapeHtml(quote.caption)}</cite>` : "";
  return `<blockquote class="elea-quote"><p class="elea-quote__text">${clean(String(quote.text ?? ""))}</p>${caption}</blockquote>`;
}

function imageHtml(image: ImageData, resolve: Resolve): string | null {
  const source = image.file?.url || image.file?.id ? safe(resolve(image.file)) : null;
  if (!source) return null;
  return `<figure class="elea-figure elea-figure--image"><img src="${escapeHtml(source)}" alt="${escapeHtml(image.alt ?? image.caption ?? "")}" class="elea-image" loading="lazy">${figcaption(image.caption)}</figure>`;
}

function videoHtml(video: VideoData): string | null {
  const url = safe(video.url);
  if (!url || !getVideoEmbedUrl(url)) return null;
  return `<figure class="elea-figure elea-figure--video"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.caption || url)}</a>${figcaption(video.caption)}</figure>`;
}

function attachmentHtml(attachment: AttachmentData, resolve: Resolve): string | null {
  if (!attachment.resourceId || !attachment.title) return null;
  const href = safe(attachment.url) ?? (attachment.file && (attachment.file.url || attachment.file.id) ? safe(resolve(attachment.file)) : null);
  const description = attachment.description ? `<span class="elea-attachment__description">${escapeHtml(attachment.description)}</span>` : "";
  const body = `<span class="elea-attachment__title">${escapeHtml(attachment.title)}</span>${description}`;
  const link = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="elea-attachment__link">${body}</a>`
    : `<span class="elea-attachment__link elea-attachment__link--static">${body}</span>`;
  return `<div class="elea-attachment">${link}</div>`;
}

function tableHtml(data: Data, clean: Clean): string | null {
  const rows = Array.isArray(data.content) ? (data.content as unknown[]).filter((row): row is unknown[] => Array.isArray(row)) : [];
  if (rows.length === 0) return null;
  const body = rows.map((row, rowIndex) => {
    const tag = rowIndex === 0 ? "th" : "td";
    const cells = row.map((cell) => `<${tag}>${clean(asText(cell))}</${tag}>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<div class="elea-table-wrapper"><table class="elea-table"><tbody>${body}</tbody></table></div>`;
}

const dataOf = (block: BlockLike) => (typeof block.data === "object" && block.data !== null ? block.data : {}) as Data;

function blockToHtml(block: BlockLike, clean: Clean, resolve: Resolve, registry: BlockRegistry | undefined): string | null {
  const data = dataOf(block);
  switch (block.type) {
    case "paragraph": {
      const text = clean(asText(data.text));
      return text ? `<div class="elea-paragraph">${text}</div>` : null;
    }
    case "header": {
      const level = Math.min(6, Math.max(1, Number(data.level) || 2));
      const text = clean(asText(data.text));
      return text ? `<h${level} class="elea-heading elea-heading--${level}">${text}</h${level}>` : null;
    }
    case "list":
    case "nestedlist": {
      const list = data as unknown as ListData;
      return Array.isArray(list.items) && list.items.length > 0 ? listHtml(list.items, asListStyle(list.style), clean, 0, asListMarker(list.marker)) : null;
    }
    case "quote":
      return quoteHtml(data as unknown as QuoteData, clean);
    case "image":
      return imageHtml(data as unknown as ImageData, resolve);
    case "video":
      return videoHtml(data as unknown as VideoData);
    case "attachment":
      return attachmentHtml(data as unknown as AttachmentData, resolve);
    case "code": {
      const code = asText(data.code);
      return code ? `<pre class="elea-code"><code>${escapeHtml(code)}</code></pre>` : null;
    }
    case "table":
      return tableHtml(data, clean);
    case "delimiter":
      return '<hr class="elea-delimiter">';
    case "raw": {
      const html = clean(asText(data.html));
      return html ? `<div class="elea-raw">${html}</div>` : null;
    }
    default: {
      const text = registry?.toText({ type: block.type, data }) ?? "";
      return text ? `<div class="elea-unknown"><p>${escapeHtml(text)}</p></div>` : null;
    }
  }
}
