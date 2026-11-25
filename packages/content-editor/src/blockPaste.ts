import { generateId, type BlockLike, type EleaBlock, type HtmlSanitizer } from "@alien6-studio/elea-content";
import { parseClipboard } from "./paste.js";
import { readBlocksFromClipboard, splitParagraph } from "./selection.js";

export interface PasteSite {
  current: EleaBlock | undefined;
  /** The paste lands on the editor itself or on its add area, not inside a block. */
  open: boolean;
  field: HTMLElement | null;
}

/** Where a paste lands, or null when the field under it keeps the paste for itself. */
export function pasteSite(target: HTMLElement, root: HTMLElement | null, blocks: readonly EleaBlock[], focusedBlock: string | null): PasteSite | null {
  const intoRoot = target === root;
  const open = intoRoot || Boolean(target.closest(".elea-content-editor__add"));
  const id = target.closest<HTMLElement>("[data-elea-block-id]")?.dataset.eleaBlockId ?? (intoRoot ? focusedBlock : null);
  const current = blocks.find(block => block.id === id);
  if (!(current || open) || target.closest("input,textarea")) return null;
  return { current, open, field: target.closest<HTMLElement>("[contenteditable=true]") };
}

/** The blocks a clipboard brings, and those among them that came from an Elea editor. */
export function pastePayload(data: DataTransfer, site: PasteSite, hasSelection: boolean, sanitizer: HtmlSanitizer) {
  const copied = readBlocksFromClipboard(data);
  if (!copied && !(site.open || hasSelection)) return null;
  const pasted = copied ? { blocks: copied, inline: null } : parseClipboard(data, sanitizer);
  const incoming: BlockLike[] = pasted.inline ? [{ type: "paragraph", data: { text: pasted.inline } }] : pasted.blocks;
  return incoming.length ? { incoming, copied } : null;
}

/** The pasted blocks between the two halves of the paragraph they split. */
function withinParagraph(created: EleaBlock[], field: HTMLElement, paragraph: EleaBlock): EleaBlock[] {
  const [before, after] = splitParagraph(field, paragraph);
  const inserted = [...created];
  if (before) inserted.unshift(before);
  if (after) inserted.push(before ? { ...after, id: generateId() } : after);
  return inserted;
}

/** The document with pasted blocks at `at`, inside the paragraph being edited, or after the current block. */
export function insertPasted(blocks: readonly EleaBlock[], created: EleaBlock[], at: number | undefined, site: PasteSite): EleaBlock[] {
  const next = [...blocks];
  const { current, field } = site;
  if (at !== undefined) {
    next.splice(at, 0, ...created);
  } else if (current?.type === "paragraph" && field) {
    next.splice(blocks.indexOf(current), 1, ...withinParagraph(created, field, current));
  } else {
    const empty = blocks.length === 1 && blocks[0]?.type === "paragraph" && !blocks[0].data.text;
    const index = current ? blocks.indexOf(current) + 1 : blocks.length;
    next.splice(empty ? 0 : index, empty ? 1 : 0, ...created);
  }
  return next;
}
