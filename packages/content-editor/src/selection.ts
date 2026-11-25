import { asRecord, createDocument, generateId, documentToHtml, documentToText, isDocument, type BlockLike, type BlockRegistry, type EleaBlock, type HtmlSanitizer, type FileRef } from "@alien6-studio/elea-content";
import { BLOCKS_ATTRIBUTE, clipboardBody } from "./clipboardHtml.js";
import { editableHtml } from "./caret.js";

/** The clipboard type carrying whole blocks between Elea editors; other targets get HTML and text. */
export const BLOCKS_CLIPBOARD_TYPE = "application/x-elea-blocks";

/** The ids between two blocks, inclusive, in document order. */
export function blockRun(order: readonly string[], anchor: string, focus: string): string[] {
  const start = order.indexOf(anchor);
  const end = order.indexOf(focus);
  if (start === -1 || end === -1) return [];
  const [from, to] = start <= end ? [start, end] : [end, start];
  return order.slice(from, to + 1);
}

/** The id next to a block in a direction, or the block itself at the edge. */
export function neighbourId(order: readonly string[], id: string, direction: -1 | 1): string {
  const index = order.indexOf(id);
  if (index === -1) return id;
  return order[Math.min(order.length - 1, Math.max(0, index + direction))] ?? id;
}

/** Writes the selected blocks to a clipboard: Elea blocks, HTML and plain text. */
export function writeBlocksToClipboard(clipboard: Pick<DataTransfer, "setData">, blocks: readonly EleaBlock[], registry: BlockRegistry, sanitizer: HtmlSanitizer, resolveAssetUrl?: (file: FileRef) => string): string {
  const content = createDocument(blocks);
  const raw = JSON.stringify(blocks.map(({ id: _id, ...block }) => block));
  const html = documentToHtml(content, { sanitize: (value) => sanitizer.sanitize(value), registry, ...(resolveAssetUrl && { resolveAssetUrl }) });
  const attribute = raw.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  clipboard.setData("text/html", `<div ${BLOCKS_ATTRIBUTE}="${attribute}">${html}</div>`);
  clipboard.setData("text/plain", documentToText(content, registry));
  // Some clipboard implementations only accept the standard HTML and text formats.
  try { clipboard.setData(BLOCKS_CLIPBOARD_TYPE, raw); } catch { /* HTML also carries the blocks. */ }
  return raw;
}

/** Reads whole blocks from a clipboard, or null when it holds none. */
export function readBlocksFromClipboard(clipboard: Pick<DataTransfer, "getData">): BlockLike[] | null {
  let raw = clipboard.getData(BLOCKS_CLIPBOARD_TYPE);
  if (!raw) {
    const html = clipboard.getData("text/html");
    if (html.includes(BLOCKS_ATTRIBUTE)) raw = clipboardBody(html).querySelector(`[${BLOCKS_ATTRIBUTE}]`)?.getAttribute(BLOCKS_ATTRIBUTE) ?? "";
  }
  if (!raw) return null;
  try {
    const document = { blocks: JSON.parse(raw) as unknown };
    if (!isDocument(document) || !document.blocks.length) return null;
    return document.blocks.every(block => block.type && (block.data === undefined || asRecord(block.data) === block.data)) ? document.blocks : null;
  } catch {
    return null;
  }
}

/** Async clipboard writes accept the standard HTML and plain-text formats. */
export function clipboardItem(formats: ReadonlyMap<string, string>): ClipboardItem {
  return new ClipboardItem({
    "text/html": new Blob([formats.get("text/html")!], { type: "text/html" }),
    "text/plain": new Blob([formats.get("text/plain")!], { type: "text/plain" }),
  });
}

/** Split the containing paragraph at the paste selection without touching its DOM. */
export function splitParagraph(field: HTMLElement, block: EleaBlock): (EleaBlock | null)[] {
  const selection = field.ownerDocument.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!range || !field.contains(range.commonAncestorContainer)) return field.textContent || (field.innerHTML && field.innerHTML !== "<br>") ? [block] : [];
  return [true, false].map((before) => {
    const part = range.cloneRange();
    part.selectNodeContents(field);
    if (before) part.setEnd(range.startContainer, range.startOffset);
    else part.setStart(range.endContainer, range.endOffset);
    const holder = field.ownerDocument.createElement("div");
    holder.append(part.cloneContents());
    const text = editableHtml(holder);
    if (!holder.textContent && (!text || !holder.querySelector("br,img,hr") || text === "<br>")) return null;
    return { ...block, data: { ...block.data, text } };
  });
}

export function copyBlock(block: BlockLike): EleaBlock {
  return { ...block, id: generateId(), data: asRecord(block.data) };
}
