"use client";

import { en } from "@alien6-studio/elea-content";
import { IconButton } from "@alien6-studio/elea-ui";
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { EditorMode } from "./ContentEditor.js";
import { CheckIcon, CloseIcon, PencilIcon, PlusIcon } from "./icons.js";
import { useContentServices } from "./provider.js";
import { QuickAddButtons } from "./QuickAddButtons.js";

export interface AddBlockButtonProps {
  onAdd: (type: string) => void;
  types?: readonly string[] | undefined;
  mode?: EditorMode | undefined;
  onModeChange?: ((mode: EditorMode) => void) | undefined;
}

interface ModeButtonProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onAdd?: never;
  types?: never;
}

const modes = ["default", "toolbar", "classic", "markdown"] as const;

export function AddBlockButton({ onAdd, types, mode, onModeChange }: AddBlockButtonProps | ModeButtonProps) {
  const { messages } = useContentServices();
  const labels = messages.source ?? en.source;
  const modeLabel = (value: EditorMode) => value === "default" ? labels.writing : labels[value];
  const withModes = mode !== undefined && onModeChange !== undefined;
  // Keep a visited menu mounted so its surface can fold back into the trigger.
  const [open, setOpen] = useState<boolean | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    const container = root.current;
    const panel = menu.current;
    const button = trigger.current;
    if (!open || !container || !panel || !button) return;
    const position = () => {
      const rect = button.getBoundingClientRect();
      const edge = (button.closest(".elea-content-editor") ?? document.documentElement).getBoundingClientRect();
      const right = edge.right - rect.left - 8;
      const left = rect.right - edge.left - 8;
      const below = window.innerHeight - rect.top - 8;
      const above = rect.bottom - 8;
      container.toggleAttribute("data-left", left > right);
      container.style.setProperty("--elea-menu-room", `${Math.max(left, right)}px`);
      const height = panel.offsetHeight;
      container.toggleAttribute("data-above", height > below && above > below);
    };
    const dismiss = (event: PointerEvent) => {
      if (!container.contains(event.target as Node)) setOpen(false);
    };
    position();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(position);
    observer?.observe(panel);
    const choice = panel.querySelector<HTMLElement>('[aria-checked="true"]') ?? panel.querySelector("button");
    choice?.focus({ preventScroll: panel.scrollWidth <= panel.clientWidth });
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      observer?.disconnect();
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);

  function close() {
    trigger.current?.focus({ preventScroll: true });
    setOpen(false);
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "Tab" && open) {
      close();
      return;
    }
    const first = event.key === "Home";
    const last = event.key === "End";
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
    if (!first && !last && !forward && !backward) return;
    event.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }
    const items = Array.from(menu.current?.querySelectorAll("button") ?? []);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = (current + (forward ? 1 : -1) + items.length) % items.length;
    if (last) next = items.length - 1;
    if (first) next = 0;
    items[next]?.focus();
  }

  let triggerIcon = <PlusIcon />;
  if (withModes) triggerIcon = <PencilIcon />;
  if (open) triggerIcon = <CloseIcon />;

  return (
    <div ref={root} className="elea-add-block" data-mode-picker={withModes ? "" : undefined} data-open={open ?? undefined} onKeyDown={navigate}
      onBlur={(event) => { if (open && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <span aria-hidden="true" className="elea-add-block__surface" />
      {open !== null && (
        <svg className="elea-add-block__drops" viewBox="0 0 104 44" aria-hidden="true" focusable="false">
          <defs>
            <filter id={`${id}-neck`} filterUnits="userSpaceOnUse" x="-6" y="-6" width="116" height="56">
              <feGaussianBlur stdDeviation="3.2" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
            </filter>
          </defs>
          <g fill="currentColor" filter={`url(#${id}-neck)`}>
            <circle cx="22" cy="22" r="22" />
            <circle className="elea-add-block__drop" cx="22" cy="22" r="22" />
          </g>
        </svg>
      )}
      <IconButton ref={trigger} variant="disc" className="elea-add-block__trigger"
        onClick={() => setOpen(!open)}
        label={withModes ? `${labels.mode} · ${modeLabel(mode)}` : messages.actions.addBlock}
        aria-haspopup="menu" aria-controls={open === null ? undefined : id} aria-expanded={!!open}>
        {triggerIcon}
      </IconButton>
      {open !== null && (
        <div ref={menu} id={id} role="menu" aria-orientation="horizontal" className="elea-add-block__menu"
          aria-label={withModes ? labels.mode : messages.actions.blockTypesMenu} inert={!open} aria-hidden={!open}>
          {withModes ? modes.map((value) => (
            <button key={value} type="button" tabIndex={-1} role="menuitemradio" aria-checked={mode === value}
              onClick={() => { close(); onModeChange(value); }}>
              {modeLabel(value)}{mode === value && <CheckIcon />}
            </button>
          )) : onAdd && (
            <QuickAddButtons types={types} onAdd={(type) => { close(); onAdd(type); }} />
          )}
        </div>
      )}
    </div>
  );
}
