"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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

/**
 * A select built from a button and a listbox, so it is styled by the tokens on every platform,
 * and a checklist when `multiple`. Arrows move, Enter and Space pick, Escape closes, typing
 * jumps to the matching option; the trigger keeps the focus.
 */
export function Select(props: SelectProps) {
  const { options, label, labelledBy, placeholder, size = "md", disabled = false, invalid = false, name, id: givenId, className, triggerProps } = props;
  const generated = useId();
  const id = givenId ?? generated;
  const listId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selectedValues: readonly string[] = props.multiple ? props.value : props.value === null ? [] : [props.value];
  const enabled = options.filter((option) => !option.disabled);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((option) => selectedValues.includes(option.value))));
  const typed = useRef({ text: "", at: 0 });

  useEffect(() => {
    if (!open) return undefined;
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const openList = () => {
    if (disabled) return;
    const current = options.findIndex((option) => selectedValues.includes(option.value));
    setActive(current >= 0 ? current : options.findIndex((option) => !option.disabled));
    setOpen(true);
  };

  const pick = (option: SelectOption) => {
    if (option.disabled) return;
    if (props.multiple) {
      const next = props.value.includes(option.value) ? props.value.filter((value) => value !== option.value) : [...props.value, option.value];
      props.onChange(next);
      return;
    }
    props.onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const move = (step: number) => {
    if (enabled.length === 0) return;
    const indices = options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
    const position = indices.indexOf(active);
    const next = indices[(position + step + indices.length) % indices.length] as number;
    setActive(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openList(); else move(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openList(); else move(-1);
        return;
      case "Home":
        if (open) { event.preventDefault(); setActive(options.findIndex((option) => !option.disabled)); }
        return;
      case "End":
        if (open) { event.preventDefault(); setActive(options.length - 1 - [...options].reverse().findIndex((option) => !option.disabled)); }
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) { openList(); return; }
        if (options[active]) pick(options[active] as SelectOption);
        return;
      case "Escape":
        if (open) { event.preventDefault(); setOpen(false); }
        return;
      case "Tab":
        setOpen(false);
        return;
      default:
        break;
    }
    // Typing jumps to the option whose text starts with the letters typed in a row
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      typed.current = { text: now - typed.current.at < 600 ? typed.current.text + event.key : event.key, at: now };
      const needle = typed.current.text.toLowerCase();
      const index = options.findIndex((option) => !option.disabled && String(textOf(option.label)).toLowerCase().startsWith(needle));
      if (index === -1) return;
      if (open) setActive(index);
      else if (!props.multiple) props.onChange((options[index] as SelectOption).value);
    }
  };

  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  const shown = props.multiple
    ? selectedOptions.length === 0 ? placeholder : props.summary ? props.summary(props.value) : selectedOptions.map((option, index) => <span key={option.value}>{index > 0 ? ", " : ""}{option.label}</span>)
    : selectedOptions[0]?.label ?? placeholder;

  return (
    <div ref={rootRef} className={cx("elea-ui-select", `elea-ui-select--${size}`, open && "elea-ui-select--open", className)}>
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
        onKeyDown={onKeyDown}
        {...triggerProps}
      >
        <span className={cx("elea-ui-select__value", selectedOptions.length === 0 && "elea-ui-select__value--placeholder")}>{shown}</span>
        <span className="elea-ui-select__chevron"><ChevronIcon /></span>
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-multiselectable={props.multiple || undefined} aria-label={label} aria-labelledby={labelledBy} className="elea-ui-select__list">
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
                {props.multiple && <span className={cx("elea-ui-select__check", selected && "elea-ui-select__check--on")} aria-hidden="true">{selected && <CheckIcon />}</span>}
                <span className="elea-ui-select__label">{option.label}</span>
                {!props.multiple && selected && <span className="elea-ui-select__mark" aria-hidden="true"><CheckIcon /></span>}
              </li>
            );
          })}
        </ul>
      )}
      {name && selectedValues.map((value) => <input key={value} type="hidden" name={name} value={value} />)}
    </div>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}
