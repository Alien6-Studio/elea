"use client";

import { useEffect, useId, useRef, useState, type AriaAttributes, type KeyboardEvent } from "react";
import { cx } from "./cx.js";
import { Input } from "./Field.js";
import { reveal, watchList } from "./Select.js";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface ComboboxProps extends Pick<AriaAttributes, "aria-describedby" | "aria-invalid"> {
  value: string | null;
  onChange: (value: string) => void;
  options: readonly ComboboxOption[];
  /** Accessible name of the editable field and its list. */
  label: string;
  /** Announced when the search has no results. */
  emptyMessage: string;
  /** Search hint while the input is empty. Defaults to the localized label. */
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  id?: string | undefined;
  className?: string | undefined;
}

interface Search {
  /** A null query displays the selected label while browsing the complete list. */
  query: string | null;
  activeValue: string | null;
}

/** An editable single-choice field. Only choosing an enabled option commits a value. */
export function Combobox({ value, onChange, options, label, emptyMessage, placeholder, disabled, name, id, className, ...aria }: Readonly<ComboboxProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;
  const input = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const composing = useRef(false);
  const [search, setSearch] = useState<Search | null>(null);
  const expanded = search !== null && !disabled;
  const selected = options.find(option => option.value === value);
  const needle = search?.query?.toLowerCase() ?? "";
  const matches = needle ? options.filter(option => option.label.toLowerCase().includes(needle)) : options;
  const enabled = matches.filter(option => !option.disabled);
  const active = enabled.find(option => option.value === search?.activeValue) ?? enabled[0];
  const index = active ? matches.indexOf(active) : -1;

  useEffect(() => {
    if (disabled) setSearch(null);
    if (expanded) return watchList(input.current, popup.current, () => setSearch(null));
    return undefined;
  }, [disabled, expanded]);
  useEffect(() => {
    if (expanded) reveal(popup.current, index, list.current);
  }, [expanded, index, active?.value]);

  const choose = (option: ComboboxOption) => {
    if (disabled || option.disabled) return;
    setSearch(null);
    onChange(option.value);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || composing.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const current = active ? enabled.indexOf(active) : -1;
      const next = expanded && current >= 0
        ? enabled[(current + step + enabled.length) % enabled.length]
        : step > 0 ? enabled[0] : enabled.at(-1);
      setSearch({ query: search?.query ?? null, activeValue: next?.value ?? null });
    } else if (expanded && event.key === "Enter") {
      event.preventDefault();
      if (active) choose(active);
    } else if (expanded && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setSearch(null);
    }
  };

  return (
    <div className={cx("elea-ui-select", "elea-combobox", expanded && "elea-ui-select--open", className)}>
      <Input {...aria} ref={input} id={inputId} role="combobox" autoComplete="off"
        aria-label={label} aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && active ? `${listId}-${index}` : undefined}
        disabled={disabled} placeholder={placeholder ?? label} value={(expanded ? search.query : null) ?? selected?.label ?? ""}
        onFocus={event => event.currentTarget.select()}
        onClick={() => { if (!expanded && !disabled) setSearch({ query: null, activeValue: value }); }}
        onChange={event => setSearch({ query: event.currentTarget.value, activeValue: null })}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; }}
        onBlur={() => { composing.current = false; setSearch(null); }}
        onKeyDown={onKeyDown}
      />
      <svg className="elea-combobox__search-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
      </svg>
      {expanded && (
        <div ref={popup} className="elea-ui-select__list">
          <ul ref={list} role="listbox" id={listId} aria-label={label} className="elea-combobox__options">
            {matches.map((option, i) => (
              <li key={option.value} id={`${listId}-${i}`} role="option"
                aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
                className={cx("elea-ui-select__option", option === active && "elea-ui-select__option--active",
                  option.value === value && "elea-ui-select__option--selected", option.disabled && "elea-ui-select__option--disabled")}
                onMouseDown={event => event.preventDefault()}
                onMouseEnter={() => { if (!option.disabled) setSearch({ ...search, activeValue: option.value }); }}
                onClick={() => choose(option)}
              >{option.label}</li>
            ))}
          </ul>
          {matches.length === 0 && <p role="status" className="elea-combobox__empty">{emptyMessage}</p>}
        </div>
      )}
      {name && selected && <input type="hidden" name={name} value={selected.value} disabled={disabled} />}
    </div>
  );
}
