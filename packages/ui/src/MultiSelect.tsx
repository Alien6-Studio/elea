"use client";

import { useEffect, useId, useRef, useState, type AriaAttributes, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { Badge } from "./Badge.js";
import { ignoresKey, type ComboboxOption } from "./Combobox.js";
import { cx } from "./cx.js";
import { ChoiceList, ChoiceRow, reveal, watchList } from "./Select.js";

export interface MultiSelectOption extends ComboboxOption {
  /** Options with the same group share a heading. */
  group?: string | undefined;
}

export interface MultiSelectLabels {
  empty: string;
  remove: (label: string) => string;
  /** Label of the option that adds a new tag. Defaults to the entered text. */
  create?: ((value: string) => string) | undefined;
  /** Supply a label to offer selection of all enabled options in each named group. */
  selectGroup?: ((group: string) => string) | undefined;
}

export interface MultiSelectProps extends Pick<AriaAttributes, "aria-describedby" | "aria-invalid"> {
  options: readonly MultiSelectOption[];
  value: readonly string[];
  onChange: (value: string[]) => void;
  label: string;
  labels: MultiSelectLabels;
  placeholder?: string | undefined;
  creatable?: boolean | undefined;
  max?: number | undefined;
  renderOption?: ((option: MultiSelectOption, state: { selected: boolean; disabled: boolean }) => ReactNode) | undefined;
  id?: string | undefined;
  name?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
}

function groupedOptions(options: MultiSelectOption[]) {
  const groups = new Map<string | undefined, MultiSelectOption[]>();
  for (const option of options) {
    const members = groups.get(option.group);
    if (members) members.push(option);
    else groups.set(option.group, [option]);
  }
  return groups;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
  </svg>;
}

/** A searchable, controlled list of choices. Each committed value becomes a removable tag. */
export function MultiSelect({ options, value, onChange, label, labels, placeholder, creatable, max = Infinity,
  renderOption, id, name, className, disabled, required, ...aria }: Readonly<MultiSelectProps>) {
  const generated = useId();
  const inputId = id ?? generated;
  const listId = `${inputId}-listbox`;
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const expanded = open && !disabled;
  const selected = new Set(value);
  const choices = new Map(options.map(option => [option.value, option]));
  // Keep free tags and previously committed values accessible when a host refreshes its options.
  for (const entry of selected) {
    if (!choices.has(entry)) choices.set(entry, { label: entry, value: entry });
  }
  const entries = Array.from(choices.values());
  const text = query.trim();
  const needle = text.toLowerCase();
  const matches = entries.filter(option => option.label.toLowerCase().includes(needle) || option.value.toLowerCase() === needle);
  const canCreate = creatable && text && !entries.some(option => [option.label, option.value].some(part => part.toLowerCase() === needle));
  const creation: MultiSelectOption | undefined = canCreate ? { value: text, label: labels.create?.(text) ?? text } : undefined;
  const groups = groupedOptions(matches);
  const visible = Array.from(groups.values()).flat();
  if (creation) visible.push(creation);
  const limit = Math.max(0, Math.floor(max));
  const unavailable = (option: MultiSelectOption) => !!option.disabled || (!selected.has(option.value) && selected.size >= limit);
  const enabled = visible.filter(option => !unavailable(option));
  const active = enabled.find(option => option.value === cursor) ?? enabled[0];
  const indices = new Map(visible.map((option, index) => [option.value, index]));
  const activeId = active ? `${listId}-${indices.get(active.value)}` : undefined;

  function close() {
    setOpen(false);
    setQuery("");
    setCursor(null);
  }
  useEffect(() => {
    if (disabled) close();
    if (expanded) return watchList(trigger.current, popup.current, close);
    return undefined;
  }, [disabled, expanded]);
  useEffect(() => {
    const row = activeId ? popup.current?.ownerDocument.getElementById(activeId) : null;
    if (row?.parentElement) reveal(popup.current, Array.from(row.parentElement.children).indexOf(row), row.parentElement);
  }, [expanded, activeId]);

  function remove(entry: string) {
    if (disabled || choices.get(entry)?.disabled) return;
    input.current?.focus();
    onChange(value.filter(item => item !== entry));
  }
  function toggle(option: MultiSelectOption) {
    if (disabled || unavailable(option)) return;
    if (selected.has(option.value)) remove(option.value);
    else onChange([...value, option.value]);
    setQuery("");
    setCursor(option.value);
    input.current?.focus();
  }
  function moveCursor(step: 1 | -1) {
    const edge = step === 1 ? enabled[0] : enabled.at(-1);
    const index = active ? enabled.indexOf(active) : -1;
    const next = expanded && index >= 0 ? enabled.at((index + step) % enabled.length) : edge;
    setCursor(next?.value ?? null);
    setOpen(true);
  }
  function closeOnBlur(event: FocusEvent<HTMLInputElement | HTMLButtonElement>) {
    if (trigger.current?.parentElement?.contains(event.relatedTarget)) return;
    composing.current = false;
    close();
  }
  function onEscape(event: KeyboardEvent) {
    if (event.key !== "Escape" || !expanded || composing.current || ignoresKey(event)) return;
    event.preventDefault();
    event.stopPropagation();
    close();
    input.current?.focus();
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled || composing.current || ignoresKey(event)) return;
    const { key } = event;
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      moveCursor(key === "ArrowDown" ? 1 : -1);
    } else if (expanded && key === "Enter") {
      event.preventDefault();
      if (active) toggle(active);
    } else if (key === "Backspace" && !query) {
      const entry = [...value].reverse().find(item => !choices.get(item)?.disabled);
      if (entry !== undefined) {
        event.preventDefault();
        remove(entry);
      }
    } else {
      onEscape(event);
    }
  }
  const row = (option: MultiSelectOption) => {
    const checked = selected.has(option.value);
    const locked = unavailable(option);
    return <ChoiceRow key={option.value} id={`${listId}-${indices.get(option.value)}`}
      label={option.label} active={option === active} multiple selected={checked} disabled={locked}
      prefix={option === creation ? <span aria-hidden="true">+</span> : undefined}
      onActivate={() => setCursor(option.value)} onPick={() => toggle(option)}>
      {option !== creation && renderOption ? renderOption(option, { selected: checked, disabled: locked }) : option.label}
    </ChoiceRow>;
  };

  // A required multiselect validates the committed tags. Typing a search alone cannot satisfy it.
  const selectionConstraint = required && !selected.size ? { required: true, pattern: "(?!)" } : {};
  return <div className={cx("elea-ui-select", "elea-multi-select", className)}>
    <div ref={trigger} className={cx("elea-ui-select__trigger", "elea-multi-select__trigger",
      aria["aria-invalid"] && aria["aria-invalid"] !== "false" && "elea-ui-select__trigger--invalid")} data-disabled={disabled || undefined}>
      {Array.from(selected, entry => {
        const option = choices.get(entry)!;
        return <button key={entry} type="button" disabled={disabled || option.disabled} className="elea-multi-select__tag"
          aria-label={labels.remove(option.label)} onBlur={closeOnBlur} onKeyDown={onEscape} onClick={() => remove(entry)}>
          <Badge tone="primary" size="sm"><span className="elea-multi-select__tag-label">{option.label}</span><span aria-hidden="true">×</span></Badge>
        </button>;
      })}
      <label className="elea-multi-select__search" htmlFor={inputId}>
        <SearchIcon />
        <input {...aria} ref={input} id={inputId} role="combobox" aria-label={label} aria-required={required || undefined}
          aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
          aria-activedescendant={expanded ? activeId : undefined} disabled={disabled}
          {...selectionConstraint}
          placeholder={placeholder ?? label} value={query} autoComplete="off"
          onClick={() => setOpen(true)} onChange={event => { setQuery(event.currentTarget.value); setCursor(null); setOpen(true); }}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onBlur={closeOnBlur} onKeyDown={onKeyDown} />
      </label>
    </div>
    {expanded && <div ref={popup} className="elea-ui-select__list">
      <ChoiceList id={listId} aria-label={label} multiple>
        {Array.from(groups, ([group, members]) => group === undefined ? members.map(row)
          : <fieldset key={`group:${group}`} className="elea-multi-select__group">
            <legend>{group}</legend>
            {members.map(row)}
          </fieldset>)}
        {creation && row(creation)}
      </ChoiceList>
      {!visible.length && <output htmlFor={inputId} className="elea-multi-select__empty">{labels.empty}</output>}
      {!needle && labels.selectGroup && Array.from(groups, ([group, members]) => {
        if (group === undefined) return null;
        const missing = members.filter(option => !option.disabled && !selected.has(option.value));
        return <button key={group} type="button" className="elea-multi-select__bulk"
          onBlur={closeOnBlur} onKeyDown={onEscape} disabled={!missing.length || selected.size + missing.length > limit}
          onClick={() => { input.current?.focus(); onChange([...value, ...missing.map(option => option.value)]); }}>
          {labels.selectGroup!(group)}
        </button>;
      })}
    </div>}
    {name && Array.from(selected, entry => <input key={entry} type="hidden" name={name} value={entry} disabled={disabled} />)}
  </div>;
}
