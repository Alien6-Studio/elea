"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface MenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean | undefined;
  /** Destructive tone. */
  danger?: boolean | undefined;
  onSelect: () => void;
}

export interface MenuProps {
  /** The trigger, given the props that open the menu and name it. */
  trigger: (props: { "aria-haspopup": "menu"; "aria-expanded": boolean; "aria-controls": string; onClick: () => void; onKeyDown: (event: KeyboardEvent) => void }) => ReactNode;
  items: MenuItem[];
  /** Accessible name of the menu list. */
  label: string;
  align?: "start" | "end" | undefined;
  className?: string | undefined;
}

/**
 * A dropdown menu: the trigger opens it, arrows move, Enter or Space select, Escape and an
 * outside click close it. Items are buttons with `role="menuitem"`.
 */
export function Menu({ trigger, items, label, align = "start", className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);

  const close = useCallback(() => setOpen(false), []);
  const openMenu = useCallback((at = 0) => {
    setActive(at);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onPointerDown);
    listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[active]?.focus();
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, active, close]);

  const move = (direction: 1 | -1) => {
    if (enabled.length === 0) return;
    const current = enabled.findIndex(({ index }) => index === active);
    const next = enabled[(current + direction + enabled.length) % enabled.length];
    if (next) setActive(next.index);
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(enabled[0]?.index ?? 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(enabled.at(-1)?.index ?? 0);
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") { event.preventDefault(); move(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); move(-1); }
    else if (event.key === "Home") { event.preventDefault(); setActive(enabled[0]?.index ?? 0); }
    else if (event.key === "End") { event.preventDefault(); setActive(enabled.at(-1)?.index ?? 0); }
    else if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "Tab") close();
  };

  return (
    <div ref={rootRef} className={cx("elea-menu", className)}>
      {trigger({ "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": id, onClick: () => (open ? close() : openMenu(enabled[0]?.index ?? 0)), onKeyDown: onTriggerKeyDown })}
      {open && (
        <div ref={listRef} id={id} role="menu" aria-label={label} className={cx("elea-menu__list", `elea-menu__list--${align}`)} onKeyDown={onListKeyDown}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={cx("elea-menu__item", item.danger && "elea-menu__item--danger", index === active && "elea-menu__item--active")}
              disabled={item.disabled}
              tabIndex={index === active ? 0 : -1}
              onMouseEnter={() => !item.disabled && setActive(index)}
              onClick={() => {
                close();
                item.onSelect();
              }}
            >
              {item.icon && <span className="elea-menu__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
