"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface AccordionItem<Value extends string = string> {
  /** Unique across the items in this group. */
  value: Value;
  label: ReactNode;
  panel: ReactNode;
  disabled?: boolean | undefined;
}

export interface AccordionProps<Value extends string = string> {
  items: readonly AccordionItem<Value>[];
  /** The open sections. */
  value?: readonly Value[] | undefined;
  defaultValue?: readonly Value[] | undefined;
  onChange?: ((value: Value[]) => void) | undefined;
  /** Several sections can stay open at once; otherwise opening one closes the others. */
  multiple?: boolean | undefined;
  /** Heading level that fits the page outline; `h3` by default. */
  headingLevel?: "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
  variant?: "separated" | "contained" | undefined;
  className?: string | undefined;
}

function navigate(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const triggers = Array.from(event.currentTarget.closest(".elea-accordion")?.querySelectorAll<HTMLButtonElement>(":scope > .elea-accordion__item > * > .elea-accordion__trigger:enabled") ?? []);
  const current = triggers.indexOf(event.currentTarget);
  let position: number;
  switch (event.key) {
    case "Home": position = 0; break;
    case "End": position = triggers.length - 1; break;
    case "ArrowDown": position = (current + 1) % triggers.length; break;
    case "ArrowUp": position = (current - 1 + triggers.length) % triggers.length; break;
    default: return;
  }
  event.preventDefault();
  triggers[position]?.focus();
}

/** Stacked sections that open and close under their heading; the arrow keys move between headings. */
export function Accordion<Value extends string>({ items, value, defaultValue, onChange, multiple = false, headingLevel: Heading = "h3", variant = "separated", className }: Readonly<AccordionProps<Value>>) {
  const id = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState<readonly Value[]>(defaultValue ?? []);
  const open = value ?? uncontrolledValue;

  function toggle(item: AccordionItem<Value>) {
    const added = multiple ? [...open, item.value] : [item.value];
    const next = open.includes(item.value) ? open.filter((other) => other !== item.value) : added;
    if (value === undefined) setUncontrolledValue(next);
    onChange?.(next);
  }

  return (
    <div className={cx("elea-accordion", `elea-accordion--${variant}`, className)}>
      {items.map((item, index) => {
        const expanded = open.includes(item.value);
        return (
          <div key={item.value} className="elea-accordion__item" data-open={expanded || undefined}>
            <Heading className="elea-accordion__heading">
              <button type="button" id={`${id}-trigger-${index}`} aria-expanded={expanded} aria-controls={`${id}-panel-${index}`} disabled={item.disabled} className="elea-accordion__trigger" onClick={() => toggle(item)} onKeyDown={navigate}>
                {item.label}
                <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </Heading>
            <div role="region" id={`${id}-panel-${index}`} aria-labelledby={`${id}-trigger-${index}`} className="elea-accordion__panel">
              <div className="elea-accordion__content">{item.panel}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
