/** Where the caret sits in a field, for the keys that leave a block only at its edges. */

const isTextField = (element: Element): element is HTMLTextAreaElement | HTMLInputElement => element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

/** Resolve a plain-text offset in a rich field, including split text nodes and inline marks. */
export function textPoint(root: Element | DocumentFragment, offset: number): [Node, number] {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (offset <= node.length) return [node, Math.max(0, offset)];
    offset -= node.length;
  }
  return [root, root.childNodes.length];
}

export function selectionOffsets(root: HTMLElement, range: Range | null): [number, number] | undefined {
  if (!range) return undefined;
  const before = range.cloneRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  return [start, start + range.toString().length];
}

/** The extra BR used to draw a caret at the end of a line is never part of a document. */
export function editableHtml(element: HTMLElement): string {
  return element.innerHTML.replaceAll('<br data-elea-caret="">', "");
}

/**
 * True when the caret (or the moving end of the selection) is on the first line (`-1`) or the
 * last line (`1`) of its field, so an arrow in that direction has no line to go to. Text fields
 * are read from their value; rich text from the geometry of the selection, which a runtime
 * without layout reports as empty, counting as an edge.
 */
export function caretOnEdgeLine(target: EventTarget | null, direction: -1 | 1): boolean {
  if (!(target instanceof Element)) return true;
  if (isTextField(target)) {
    const value = target.value;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? value.length;
    return direction === -1 ? !value.slice(0, start).includes("\n") : !value.slice(end).includes("\n");
  }
  const editable = target.closest("[contenteditable='true']");
  const selection = globalThis.getSelection?.();
  if (!editable || !selection || selection.rangeCount === 0) return true;
  const range = selection.getRangeAt(0).cloneRange();
  // The moving end is the focus of the selection: the end when it runs forward, the start otherwise
  const forward = selection.anchorNode === range.startContainer && selection.anchorOffset === range.startOffset;
  range.collapse(!forward);
  const rect = range.getBoundingClientRect?.();
  const box = editable.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0) || box.height === 0) return true;
  const line = rect.height || 1;
  return direction === -1 ? rect.top - box.top < line : box.bottom - rect.bottom < line;
}

/** The whole text of a field is selected, or the field is empty: a second "select all" can widen to the document. */
export function fieldFullySelected(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (isTextField(target)) return target.value === "" || ((target.selectionStart ?? 0) === 0 && (target.selectionEnd ?? 0) === target.value.length);
  const editable = target.closest("[contenteditable='true']");
  if (!editable) return false;
  const text = (editable.textContent ?? "").trim();
  if (text === "") return true;
  const selection = globalThis.getSelection?.();
  return !!selection && selection.toString().trim() === text;
}
