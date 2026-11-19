"use client";

import { useCallback, useState } from "react";

export interface BlockFocus {
  focusedBlock: string | null;
  setFocusedBlock: (id: string | null) => void;
  /** Puts the caret in the editable field of a block, if the block is in the DOM. */
  focusBlockElement: (id: string) => void;
  /** Focuses after the next frame, then once more shortly after, in case the DOM is still updating. */
  scheduleBlockFocus: (id: string) => void;
}

function findEditable(block: Element): HTMLElement | null {
  return block.querySelector<HTMLElement>('[contenteditable="true"]') ?? block.querySelector<HTMLElement>("input, textarea");
}

function placeCaretAtStart(element: HTMLElement): void {
  const selection = globalThis.getSelection?.();
  element.focus();
  if (!selection) return;
  const range = document.createRange();
  if (element.firstChild) {
    range.setStart(element.firstChild, 0);
    range.setEnd(element.firstChild, 0);
  } else {
    range.selectNodeContents(element);
    range.collapse(true);
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

export function useBlockFocus(): BlockFocus {
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);

  const focusBlockElement = useCallback((id: string) => {
    const block = document.querySelector(`[data-elea-block-id="${CSS.escape(id)}"]`);
    const element = block ? findEditable(block) : null;
    if (!element) return;
    // Already focused: the user may be typing, moving the caret would send it back to the start
    if (document.activeElement === element) return;
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.focus();
      return;
    }
    placeCaretAtStart(element);
  }, []);

  const scheduleBlockFocus = useCallback(
    (id: string) => {
      requestAnimationFrame(() => {
        focusBlockElement(id);
        setTimeout(() => focusBlockElement(id), 50);
      });
    },
    [focusBlockElement],
  );

  return { focusedBlock, setFocusedBlock, focusBlockElement, scheduleBlockFocus };
}
