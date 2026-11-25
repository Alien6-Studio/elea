"use client";

import { BUILTIN_BLOCK_TYPES } from "@alien6-studio/elea-content";
import { useSurfaceScope } from "@alien6-studio/elea-ui";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { blockTypeIcons } from "./icons.js";
import { useContentServices } from "./provider.js";

export interface SlashMenuProps {
  /** Text typed after the slash; the menu filters on it. */
  query: string;
  rect: DOMRect | null;
  types?: readonly string[] | undefined;
  /** An element of the editor: the menu, sent to the body, takes its theme and its motion from there. */
  origin?: Element | null | undefined;
  onPick: (type: string) => void;
  onClose: () => void;
}

/** Items of the menu for a query: label match first, then type match; every item when the query is empty. */
export function slashMenuItems(types: readonly string[], labels: Readonly<Record<string, string | undefined>>, query: string): { type: string; label: string }[] {
  const needle = query.trim().toLowerCase();
  return types
    .map((type) => ({ type, label: labels[type] ?? type }))
    .filter((item) => !needle || item.label.toLowerCase().includes(needle) || item.type.toLowerCase().includes(needle));
}

/** Keys the field hands to the open menu instead of handling them itself. */
export const SLASH_MENU_KEYS = new Set(["ArrowDown", "ArrowUp", "Enter", "Escape"]);

export interface SlashMenuHandle {
  /** Routes a key the field captured: arrows move, Enter picks, Escape closes. */
  handleKey: (key: string) => void;
}

/**
 * The block menu opened by typing `/` in an empty paragraph. The field keeps the focus and
 * captures the keys, which it forwards through the handle.
 */
export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashMenu({ query, rect, types = BUILTIN_BLOCK_TYPES, origin, onPick, onClose }, ref) {
  const { messages } = useContentServices();
  const labels = messages.blockTypes as Record<string, string | undefined>;
  const items = useMemo(() => slashMenuItems(types, labels, query), [types, labels, query]);
  const [active, setActive] = useState(0);
  const [observeOrigin, scope] = useSurfaceScope();
  const setMenuRef = useCallback((menu: HTMLDivElement | null) => {
    observeOrigin(menu ? origin ?? null : null);
  }, [observeOrigin, origin]);
  useEffect(() => setActive(0), [query]);
  useImperativeHandle(ref, () => ({
    handleKey: (key) => {
      if (key === "ArrowDown") setActive((current) => (items.length === 0 ? 0 : (current + 1) % items.length));
      else if (key === "ArrowUp") setActive((current) => (items.length === 0 ? 0 : (current - 1 + items.length) % items.length));
      else if (key === "Enter") {
        const item = items[active];
        if (item) onPick(item.type);
      } else if (key === "Escape") onClose();
    },
  }));
  const top = (rect?.bottom ?? 0) + 6;
  const left = rect?.left ?? 0;
  if (typeof document === "undefined") return null;
  return createPortal(
    <div ref={setMenuRef} className="elea-slash-menu" {...scope} role="listbox" aria-label={messages.slash.filter} style={{ position: "fixed", top, left }} data-elea-slash-menu data-active-index={active}>
      {items.length === 0 && <div className="elea-slash-menu__empty">{messages.slash.empty}</div>}
      {items.map((item, index) => {
        const Icon = blockTypeIcons[item.type];
        return (
          <button
            key={item.type}
            type="button"
            role="option"
            aria-selected={index === active}
            className={`elea-slash-menu__item${index === active ? " elea-slash-menu__item--active" : ""}`}
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(item.type);
            }}
            onMouseEnter={() => setActive(index)}
          >
            {Icon ? <Icon /> : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
});
