"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Where the caret lands: the start, the end, or a character offset of the field's text. */
export type CaretPosition = "start" | "end" | number;

export interface BlockFocus {
  focusedBlock: string | null;
  setFocusedBlock: (id: string | null) => void;
  /** Puts the caret in the editable field of a block, if the block is in the DOM. */
  focusBlockElement: (id: string, position?: CaretPosition) => void;
  /** Focuses after the next frame, with a retry if the field is still mounting. */
  scheduleBlockFocus: (id: string, position?: CaretPosition) => void;
}

function findEditable(block: Element): HTMLElement | null {
  return block.querySelector<HTMLElement>('[contenteditable="true"]') ?? block.querySelector<HTMLElement>("input, textarea");
}

function placeCaret(element: HTMLElement, position: CaretPosition): void {
  const selection = globalThis.getSelection?.();
  element.focus();
  if (!selection) return;
  const range = document.createRange();
  if (position === "end") {
    range.selectNodeContents(element);
    range.collapse(false);
  } else if (position === "start" || position <= 0) {
    if (element.firstChild) range.setStart(element.firstChild, 0);
    else range.setStart(element, 0);
    range.collapse(true);
  } else {
    // Walk the text nodes to the character offset; past the end means the end
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let remaining = position;
    let placed = false;
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      if (remaining <= node.data.length) {
        range.setStart(node, remaining);
        placed = true;
        break;
      }
      remaining -= node.data.length;
    }
    if (!placed) range.selectNodeContents(element);
    range.collapse(placed);
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

export function useBlockFocus(): BlockFocus {
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);
  const focusRequest = useRef(0);

  useEffect(() => () => { focusRequest.current += 1; }, []);

  const focusBlockElement = useCallback((id: string, position: CaretPosition = "start") => {
    const block = document.querySelector(`[data-elea-block-id="${CSS.escape(id)}"]`);
    const element = block ? findEditable(block) : null;
    if (!element) return false;
    // Already focused: the user may be typing, moving the caret would send it back to the start
    if (document.activeElement === element) return true;
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      const field = element as HTMLInputElement | HTMLTextAreaElement;
      field.focus();
      const offset = position === "start" ? 0 : position === "end" ? field.value.length : Math.min(position, field.value.length);
      try {
        field.setSelectionRange(offset, offset);
      } catch {
        // Some input types refuse a selection range
      }
    } else {
      placeCaret(element, position);
    }
    return document.activeElement === element;
  }, []);

  const scheduleBlockFocus = useCallback(
    (id: string, position: CaretPosition = "start") => {
      const request = ++focusRequest.current;
      const previous = document.activeElement;
      const canFocus = () => {
        const active = document.activeElement;
        return request === focusRequest.current && (active === previous || active === document.body);
      };
      requestAnimationFrame(() => {
        if (!canFocus() || focusBlockElement(id, position)) return;
        setTimeout(() => {
          if (canFocus()) focusBlockElement(id, position);
        }, 50);
      });
    },
    [focusBlockElement],
  );

  return { focusedBlock, setFocusedBlock, focusBlockElement, scheduleBlockFocus };
}
