"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject } from "react";
import { caretOnEdgeLine } from "../caret.js";
import { blockRun, neighbourId } from "../selection.js";

export interface BlockSelection {
  /** Selected ids in document order; empty when nothing is selected. */
  ids: string[];
  /** The block the selection started from. */
  anchor: string | null;
}

export interface BlockSelectionHandlers {
  selection: BlockSelection;
  clear: () => void;
  select: (anchor: string, focus?: string) => void;
  selectAll: () => void;
  /** Sets the selection to known ids, for blocks that are not in the current order yet. */
  setIds: (ids: string[]) => void;
  /** Extends the selection one block up or down from its focus, starting from a focused block. */
  extend: (direction: -1 | 1, from: string | null) => void;
  /** True while the mouse drags across blocks; the container turns off native text selection. */
  dragging: boolean;
  /** Shift+click selects from the focused block (or the anchor) to the clicked one; a plain click releases. */
  onMouseDown: (event: MouseEvent, focusedBlock: string | null) => void;
  /** Escape releases; Shift+arrows select blocks once the caret has no line left to go to. Returns true when handled. */
  onKeyDown: (event: KeyboardEvent, focusedBlock: string | null) => boolean;
}

const blockIdOf = (target: EventTarget | null): string | null => (target as HTMLElement | null)?.closest?.<HTMLElement>("[data-elea-block-id]")?.dataset.eleaBlockId ?? null;
const DRAG_THRESHOLD = 4;

/** Ctrl or Cmd+click adds a block to the selection, or takes it out. */
function toggleBlock(selected: readonly string[], order: readonly string[], id: string, focusedBlock: string | null): BlockSelection {
  const chosen = new Set(selected);
  if (!chosen.size && focusedBlock && focusedBlock !== id) chosen.add(focusedBlock);
  if (chosen.has(id)) chosen.delete(id);
  else chosen.add(id);
  const ids = order.filter(blockId => chosen.has(blockId));
  return { ids, anchor: chosen.has(id) ? id : ids[0] ?? null };
}

/**
 * A selection of whole blocks, as an editor like Medium offers, and never at the same time as
 * a text selection: a drag across blocks or Shift with the arrows at the edge of a field selects
 * a run of blocks and takes the caret away; Escape or a plain click releases it.
 */
export function useBlockSelection(order: readonly string[], root: RefObject<HTMLElement | null>): BlockSelectionHandlers {
  const [selection, setSelection] = useState<BlockSelection>({ ids: [], anchor: null });
  const [dragging, setDragging] = useState(false);
  const orderRef = useRef(order);
  orderRef.current = order;
  const press = useRef<{ id: string; x: number; y: number; dragging: boolean } | null>(null);

  // Blocks that disappear leave the selection
  useEffect(() => {
    setSelection((current) => {
      if (!current.ids.length) return current;
      const available = new Set(order);
      const ids = current.ids.filter((id) => available.has(id));
      return ids.length === current.ids.length ? current : { ids, anchor: ids.length > 0 ? current.anchor : null };
    });
  }, [order]);

  const clear = useCallback(() => setSelection((current) => (current.ids.length === 0 && current.anchor === null ? current : { ids: [], anchor: null })), []);

  const select = useCallback((anchor: string, focus: string = anchor) => {
    const ids = blockRun(orderRef.current, anchor, focus);
    setSelection({ ids, anchor });
  }, []);

  /** Blocks and text never select together: the caret leaves its field for the editor root. */
  const takeFocus = useCallback(() => {
    globalThis.getSelection?.()?.removeAllRanges();
    const active = document.activeElement as HTMLElement | null;
    if (active && active !== root.current && root.current?.contains(active)) active.blur();
    root.current?.focus({ preventScroll: true });
  }, [root]);

  const selectAll = useCallback(() => {
    const ids = [...orderRef.current];
    takeFocus();
    setSelection({ ids, anchor: ids[0] ?? null });
  }, [takeFocus]);

  const setIds = useCallback((ids: string[]) => setSelection({ ids, anchor: ids[0] ?? null }), []);


  const extend = useCallback((direction: -1 | 1, from: string | null) => {
    setSelection((current) => {
      const anchor = current.anchor ?? from;
      if (!anchor) return current;
      const ids = current.ids.length > 0 ? current.ids : [anchor];
      // The moving end is the one opposite to the anchor
      const focus = (ids[0] === anchor ? ids.at(-1) : ids[0]) as string;
      const next = neighbourId(orderRef.current, focus, direction);
      return { ids: blockRun(orderRef.current, anchor, next), anchor };
    });
  }, []);

  // The drag is followed on the document, so releasing outside the editor ends it and
  // nothing selects on a later hover
  useEffect(() => {
    const up = () => {
      if (!press.current) return;
      press.current = null;
      setDragging(false);
    };
    const move = (event: globalThis.MouseEvent) => {
      const current = press.current;
      if (!current) return;
      // A release the document never saw (a native drag of selected text swallows it) ends the press
      if (event.buttons === 0) { up(); return; }
      if (!current.dragging && Math.hypot(event.clientX - current.x, event.clientY - current.y) < DRAG_THRESHOLD) return;
      const under = document.elementFromPoint(event.clientX, event.clientY);
      const id = under && root.current?.contains(under) ? blockIdOf(under) : null;
      if (!id) return;
      if (!current.dragging) {
        if (id === current.id) return;
        // Crossing a block boundary: the native text selection gives way to blocks
        current.dragging = true;
        setDragging(true);
        takeFocus();
      }
      select(current.id, id);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    const nativeDrag = (event: DragEvent) => { if (!event.defaultPrevented) up(); };
    document.addEventListener("dragstart", nativeDrag);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("dragstart", nativeDrag);
    };
  }, [root, select, takeFocus]);

  const onMouseDown = useCallback(
    (event: MouseEvent, focusedBlock: string | null) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement).closest?.(".elea-selection-bar")) return;
      const id = blockIdOf(event.target);
      if (!id) { clear(); return; }
      const anchor = selection.anchor ?? focusedBlock;
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
        if ((event.target as Element).closest("a,button,select,input,textarea,[role=button]")) return;
        event.preventDefault();
        setSelection(toggleBlock(selection.ids, orderRef.current, id, focusedBlock));
        takeFocus();
        return;
      }
      if (event.shiftKey && anchor && anchor !== id) {
        event.preventDefault();
        select(anchor, id);
        takeFocus();
        return;
      }
      press.current = { id, x: event.clientX, y: event.clientY, dragging: false };
      if (selection.ids.length > 0) clear();
    },
    [selection, select, clear, takeFocus],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent, focusedBlock: string | null): boolean => {
      if (event.key === "Escape" && selection.ids.length > 0) {
        clear();
        return true;
      }
      if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        if (selection.ids.length === 0) {
          // Text selection comes first: blocks only once the caret has no line left in its field
          if (!focusedBlock || !caretOnEdgeLine(event.target, direction)) return false;
          takeFocus();
        }
        event.preventDefault();
        extend(direction, focusedBlock);
        return true;
      }
      return false;
    },
    [selection.ids.length, clear, extend, takeFocus],
  );

  return { selection, clear, select, selectAll, setIds, extend, dragging, onMouseDown, onKeyDown };
}
