import { createDocument, documentToHtml, documentToText, type BlockLike, type BlockRegistry, type EleaBlock, type HtmlSanitizer } from "@alien6-studio/elea-content";

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
export function writeBlocksToClipboard(clipboard: Pick<DataTransfer, "setData">, blocks: readonly EleaBlock[], registry: BlockRegistry, sanitizer: HtmlSanitizer): void {
  const document = createDocument(blocks);
  clipboard.setData(BLOCKS_CLIPBOARD_TYPE, JSON.stringify(blocks.map(({ type, data }) => ({ type, data }))));
  clipboard.setData("text/html", documentToHtml(document, { sanitize: (html) => sanitizer.sanitize(html), registry }));
  clipboard.setData("text/plain", documentToText(document, registry));
}

/** Reads whole blocks from a clipboard, or null when it holds none. */
export function readBlocksFromClipboard(clipboard: Pick<DataTransfer, "getData">): BlockLike[] | null {
  const raw = clipboard.getData(BLOCKS_CLIPBOARD_TYPE);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const blocks = parsed.filter((candidate): candidate is BlockLike => typeof candidate === "object" && candidate !== null && typeof (candidate as BlockLike).type === "string");
    return blocks.length > 0 ? blocks : null;
  } catch {
    return null;
  }
}
