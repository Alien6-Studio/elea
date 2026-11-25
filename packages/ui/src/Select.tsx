"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { cx } from "./cx.js";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
}

interface SelectBaseProps {
  options: readonly SelectOption[];
  /** The accessible name of the control; a visible label can reference it with `labelledBy` instead. */
  label?: string | undefined;
  labelledBy?: string | undefined;
  placeholder?: ReactNode | undefined;
  size?: "sm" | "md" | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  /** Hidden inputs carry the value in a form. */
  name?: string | undefined;
  id?: string | undefined;
  className?: string | undefined;
  /** Attributes passed to the trigger, for test hooks and the like. */
  triggerProps?: Record<string, unknown> | undefined;
}

export interface SingleSelectProps extends SelectBaseProps {
  multiple?: false | undefined;
  value: string | null;
  onChange: (value: string) => void;
}

export interface MultipleSelectProps extends SelectBaseProps {
  /** A checklist: several values at once, each option shown with a check. */
  multiple: true;
  value: readonly string[];
  onChange: (values: string[]) => void;
  /** What the trigger shows for a set of values; defaults to the labels joined. */
  summary?: ((values: readonly string[]) => ReactNode) | undefined;
}

export type SelectProps = SingleSelectProps | MultipleSelectProps;

const ChevronIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;

const valuesOf = (props: SelectProps): readonly string[] => {
  if (props.multiple) return props.value;
  return props.value === null ? [] : [props.value];
};

const firstEnabled = (options: readonly SelectOption[]) => options.findIndex((option) => !option.disabled);

function nextEnabled(options: readonly SelectOption[], active: number, step: number): number {
  const indices = options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
  if (indices.length === 0) return active;
  return indices[(indices.indexOf(active) + step + indices.length) % indices.length] as number;
}

function clippingAncestors(button: HTMLElement, doc: Document, view: Window): Element[] {
  const found: Element[] = [];
  for (let parent = button.parentElement; parent && parent !== doc.body; parent = parent.parentElement) {
    if (["auto", "scroll", "hidden", "clip"].includes(view.getComputedStyle(parent).overflowY)) found.push(parent);
  }
  return found;
}

export function watchList(button: HTMLElement | null, list: HTMLElement | null, setOpen: (open: boolean) => void): (() => void) | undefined {
  const doc = button?.ownerDocument;
  const view = doc?.defaultView;
  if (!button || !list || !doc || !view) return undefined;
  const style = view.getComputedStyle(list);
  const maxHeight = Number.parseFloat(style.maxHeight) || Infinity;
  const gap = Number.parseFloat(style.paddingTop) || 0;
  const boundaries = clippingAncestors(button, doc, view);
  const position = () => {
    let top = 0;
    let bottom = view.innerHeight;
    for (const boundary of boundaries) {
      const edge = boundary.getBoundingClientRect().top + boundary.clientTop;
      top = Math.max(top, edge);
      bottom = Math.min(bottom, edge + boundary.clientHeight);
    }
    const rect = button.getBoundingClientRect();
    const above = rect.top - top - 2 * gap;
    const below = bottom - rect.bottom - 2 * gap;
    const upward = below < Math.min(maxHeight, list.scrollHeight + list.offsetHeight - list.clientHeight) && above > below;
    list.toggleAttribute("data-above", upward);
    list.style.setProperty("--elea-list-room", `${Math.max(0, upward ? above : below)}px`);
  };
  position();
  const close = (event: MouseEvent) => {
    if (!button.parentElement?.contains(event.target as Node)) setOpen(false);
  };
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(position);
  observer?.observe(list);
  doc.addEventListener("mousedown", close);
  doc.addEventListener("scroll", position, true);
  view.addEventListener("resize", position);
  return () => {
    observer?.disconnect();
    doc.removeEventListener("mousedown", close);
    doc.removeEventListener("scroll", position, true);
    view.removeEventListener("resize", position);
  };
}

function pickOption(props: SelectProps, option: SelectOption, done: () => void) {
  if (props.disabled || option.disabled) return;
  if (props.multiple) {
    props.onChange(props.value.includes(option.value) ? props.value.filter((value) => value !== option.value) : [...props.value, option.value]);
    return;
  }
  props.onChange(option.value);
  done();
}

function useListFit(open: boolean, disabled: boolean, setOpen: (open: boolean) => void, trigger: RefObject<HTMLElement | null>, list: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return undefined;
    if (disabled) {
      setOpen(false);
      return undefined;
    }
    return watchList(trigger.current, list.current, setOpen);
  }, [open, disabled]);
}

export function reveal(list: HTMLElement | null, index: number, items = list) {
  const option = items?.children[index] as HTMLElement | undefined;
  if (!list || !option) return;
  const top = option.offsetTop;
  if (top < list.scrollTop) list.scrollTop = top;
  else if (top + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + option.offsetHeight - list.clientHeight;
}

interface ListControl {
  props: SelectProps;
  open: boolean;
  active: number;
  typed: RefObject<{ text: string; at: number }>;
  setOpen: (open: boolean) => void;
  setActive: (index: number) => void;
  openList: () => void;
  pick: (option: SelectOption) => void;
}

function keyActions({ props, open, active, setOpen, setActive, openList, pick }: ListControl): Record<string, () => boolean> {
  const step = (by: number) => () => {
    if (open) setActive(nextEnabled(props.options, active, by));
    else openList();
    return true;
  };
  const whenOpen = (act: () => void) => () => {
    if (open) act();
    return open;
  };
  const choose = () => {
    const option = props.options[active];
    if (!open) openList();
    else if (option) pick(option);
    return true;
  };
  return {
    ArrowDown: step(1),
    ArrowUp: step(-1),
    Home: whenOpen(() => setActive(firstEnabled(props.options))),
    End: whenOpen(() => setActive(props.options.length - 1 - [...props.options].reverse().findIndex((option) => !option.disabled))),
    Enter: choose,
    " ": choose,
    Escape: whenOpen(() => setOpen(false)),
    Tab: () => {
      setOpen(false);
      return false;
    },
  };
}

function typeAhead(event: KeyboardEvent, { props, open, typed, setActive }: ListControl) {
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
  const now = Date.now();
  typed.current = { text: now - typed.current.at < 600 ? typed.current.text + event.key : event.key, at: now };
  const needle = typed.current.text.toLowerCase();
  const index = props.options.findIndex((option) => !option.disabled && textOf(option.label).toLowerCase().startsWith(needle));
  if (index === -1) return;
  if (open) setActive(index);
  else if (!props.multiple) props.onChange((props.options[index] as SelectOption).value);
}

function handleKey(event: KeyboardEvent, control: ListControl) {
  if (control.props.disabled) return;
  if (keyActions(control)[event.key]?.()) event.preventDefault();
  else typeAhead(event, control);
}

function shownOf(props: SelectProps, selected: readonly SelectOption[], placeholder: ReactNode): ReactNode {
  if (!props.multiple) return selected[0]?.label ?? placeholder;
  if (selected.length === 0) return placeholder;
  if (props.summary) return props.summary(props.value);
  return selected.map((option, index) => <span key={option.value}>{index > 0 ? ", " : ""}{option.label}</span>);
}

interface SelectListProps {
  id: string;
  listId: string;
  control: ListControl;
  listRef: RefObject<HTMLUListElement | null>;
}

function SelectList({ id, listId, control, listRef }: Readonly<SelectListProps>) {
  const { props, active, setActive, pick } = control;
  const { options, label, labelledBy, multiple } = props;
  const selectedValues = valuesOf(props);
  return (
    <ul ref={listRef} id={listId} role="listbox" aria-multiselectable={multiple || undefined} aria-label={label} aria-labelledby={labelledBy} className="elea-ui-select__list">
      {options.map((option, index) => {
        const selected = selectedValues.includes(option.value);
        return (
          <li
            key={option.value}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={selected}
            aria-disabled={option.disabled || undefined}
            className={cx("elea-ui-select__option", index === active && "elea-ui-select__option--active", selected && "elea-ui-select__option--selected", option.disabled && "elea-ui-select__option--disabled")}
            onMouseEnter={() => { if (!option.disabled) setActive(index); }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(option)}
          >
            {multiple && <span className={cx("elea-ui-select__check", selected && "elea-ui-select__check--on")} aria-hidden="true">{selected && <CheckIcon />}</span>}
            <span className="elea-ui-select__label">{option.label}</span>
            {!multiple && selected && <span className="elea-ui-select__mark" aria-hidden="true"><CheckIcon /></span>}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A select built from a button and a listbox, so it is styled by the tokens on every platform,
 * and a checklist when `multiple`. Arrows move, Enter and Space pick, Escape closes, typing
 * jumps to the matching option; the trigger keeps the focus.
 */
export function Select(props: Readonly<SelectProps>) {
  const { options, label, labelledBy, placeholder, size = "md", disabled = false, invalid = false, name, id: givenId, className, triggerProps } = props;
  const generated = useId();
  const id = givenId ?? generated;
  const listId = `${id}-listbox`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selectedValues = valuesOf(props);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((option) => selectedValues.includes(option.value))));
  const typed = useRef({ text: "", at: 0 });

  useListFit(open, disabled, setOpen, triggerRef, listRef);
  useEffect(() => reveal(listRef.current, active), [open, active]);

  const openList = () => {
    if (disabled) return;
    const selected = options.findIndex((option) => selectedValues.includes(option.value));
    setActive(selected >= 0 ? selected : firstEnabled(options));
    setOpen(true);
  };

  const pick = (option: SelectOption) => pickOption(props, option, () => {
    setOpen(false);
    triggerRef.current?.focus();
  });

  const control = { props, open, active, typed, setOpen, setActive, openList, pick };

  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));

  return (
    <div className={cx("elea-ui-select", `elea-ui-select--${size}`, open && "elea-ui-select--open", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={cx("elea-ui-select__trigger", invalid && "elea-ui-select__trigger--invalid")}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-invalid={invalid || undefined}
        aria-activedescendant={open && options[active] ? `${id}-option-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(event) => handleKey(event, control)}
        {...triggerProps}
      >
        <span className={cx("elea-ui-select__value", selectedOptions.length === 0 && "elea-ui-select__value--placeholder")}>{shownOf(props, selectedOptions, placeholder)}</span>
        <span className="elea-ui-select__chevron"><ChevronIcon /></span>
      </button>
      {open && <SelectList id={id} listId={listId} control={control} listRef={listRef} />}
      {name && selectedValues.map((value) => <input key={value} type="hidden" name={name} value={value} disabled={disabled} />)}
    </div>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}
