import type { BlockRegistry } from "./blocks/registry.js";
import type { AttachmentData, HeaderData, ImageData, ListItem, ListData, QuoteData, VideoData } from "./blocks/builtin.js";
import type { BlockLike, EleaDocument } from "./document.js";
import { isSafeUrl, isSiteRelativeUrl } from "./html/policy.js";
import { getVideoEmbedUrl } from "./media/video.js";

export interface HtmlSerializerOptions {
  /** Cleans stored rich text before it is written; the viewer's sanitizer, or any function. */
  sanitize?: (html: string) => string;
  /** Turns a stored file reference into a URL; defaults to the stored URL. */
  resolveAssetUrl?: (file: { url: string; id: string }) => string;
  /** Blocks of unknown types are skipped unless a registry gives them text. */
  registry?: BlockRegistry;
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function safe(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return isSafeUrl(trimmed) || isSiteRelativeUrl(trimmed) ? trimmed : null;
}

function listHtml(items: readonly ListItem[], ordered: boolean, clean: (html: string) => string, level = 0): string {
  const tag = ordered ? "ol" : "ul";
  const inner = items
    .map((item) => {
      if (typeof item === "string") return `<li class="elea-list__item">${clean(item)}</li>`;
      const nested = item.items?.length ? listHtml(item.items, !ordered, clean, level + 1) : "";
      return `<li class="elea-list__item"><span>${clean(item.content)}</span>${nested}</li>`;
    })
    .join("");
  return `<${tag} class="elea-list elea-list--${ordered ? "ordered" : "unordered"} elea-list--level-${Math.min(level, 3)}">${inner}</${tag}>`;
}

/**
 * The static HTML of a document, with the same classes as the viewer, for e-mails, feeds,
 * search indexes or any place without React. Every URL is checked, every rich text cleaned.
 */
export function documentToHtml(document: Pick<EleaDocument, "blocks">, options: HtmlSerializerOptions = {}): string {
  const clean = options.sanitize ?? ((html: string) => html);
  const resolve = options.resolveAssetUrl ?? ((file: { url: string; id: string }) => file.url || file.id);
  const parts: string[] = [];
  for (const block of document.blocks as BlockLike[]) {
    const html = blockToHtml(block, clean, resolve, options.registry);
    if (html) parts.push(`<div class="elea-block elea-block--${escapeHtml(block.type)}" data-elea-block-type="${escapeHtml(block.type)}">${html}</div>`);
  }
  return `<div class="elea-content">${parts.join("")}</div>`;
}

function blockToHtml(block: BlockLike, clean: (html: string) => string, resolve: (file: { url: string; id: string }) => string, registry: BlockRegistry | undefined): string | null {
  const data = (typeof block.data === "object" && block.data !== null ? block.data : {}) as Record<string, unknown>;
  switch (block.type) {
    case "paragraph": {
      const text = clean(String(data.text ?? ""));
      return text ? `<div class="elea-paragraph">${text}</div>` : null;
    }
    case "header": {
      const header = data as unknown as HeaderData;
      const level = Math.min(6, Math.max(1, Number(header.level) || 2));
      const text = clean(String(header.text ?? ""));
      return text ? `<h${level} class="elea-heading elea-heading--${level}">${text}</h${level}>` : null;
    }
    case "list": {
      const list = data as unknown as ListData;
      return Array.isArray(list.items) && list.items.length > 0 ? listHtml(list.items, list.style === "ordered", clean) : null;
    }
    case "quote": {
      const quote = data as unknown as QuoteData;
      if (!quote.text && !quote.caption) return null;
      return `<blockquote class="elea-quote"><p class="elea-quote__text">${clean(String(quote.text ?? ""))}</p>${quote.caption ? `<cite class="elea-quote__caption">— ${escapeHtml(quote.caption)}</cite>` : ""}</blockquote>`;
    }
    case "image": {
      const image = data as unknown as ImageData;
      const source = image.file?.url || image.file?.id ? safe(resolve(image.file)) : null;
      if (!source) return null;
      return `<figure class="elea-figure elea-figure--image"><img src="${escapeHtml(source)}" alt="${escapeHtml(image.alt ?? image.caption ?? "")}" class="elea-image" loading="lazy">${image.caption ? `<figcaption class="elea-caption">${escapeHtml(image.caption)}</figcaption>` : ""}</figure>`;
    }
    case "video": {
      const video = data as unknown as VideoData;
      const url = safe(video.url);
      const embed = url ? getVideoEmbedUrl(url) : null;
      if (!url || !embed) return null;
      return `<figure class="elea-figure elea-figure--video"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.caption || url)}</a>${video.caption ? `<figcaption class="elea-caption">${escapeHtml(video.caption)}</figcaption>` : ""}</figure>`;
    }
    case "attachment": {
      const attachment = data as unknown as AttachmentData;
      if (!attachment.resourceId || !attachment.title) return null;
      const href = safe(attachment.url) ?? (attachment.file && (attachment.file.url || attachment.file.id) ? safe(resolve(attachment.file)) : null);
      const body = `<span class="elea-attachment__title">${escapeHtml(attachment.title)}</span>${attachment.description ? `<span class="elea-attachment__description">${escapeHtml(attachment.description)}</span>` : ""}`;
      return `<div class="elea-attachment">${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="elea-attachment__link">${body}</a>` : `<span class="elea-attachment__link elea-attachment__link--static">${body}</span>`}</div>`;
    }
    case "code": {
      const code = String(data.code ?? "");
      return code ? `<pre class="elea-code"><code>${escapeHtml(code)}</code></pre>` : null;
    }
    case "table": {
      const rows = Array.isArray(data.content) ? (data.content as unknown[]).filter((row): row is unknown[] => Array.isArray(row)) : [];
      if (rows.length === 0) return null;
      const body = rows.map((row, rowIndex) => `<tr>${row.map((cell) => (rowIndex === 0 ? `<th>${clean(String(cell ?? ""))}</th>` : `<td>${clean(String(cell ?? ""))}</td>`)).join("")}</tr>`).join("");
      return `<div class="elea-table-wrapper"><table class="elea-table"><tbody>${body}</tbody></table></div>`;
    }
    case "delimiter":
      return '<hr class="elea-delimiter">';
    case "raw": {
      const html = clean(String(data.html ?? ""));
      return html ? `<div class="elea-raw">${html}</div>` : null;
    }
    default: {
      const text = registry?.toText({ type: block.type, data }) ?? "";
      return text ? `<div class="elea-unknown"><p>${escapeHtml(text)}</p></div>` : null;
    }
  }
}
