"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Input, Label } from "./Field.js";
import { cx } from "./cx.js";

export interface ColorPickerProps {
  /** Controlled sRGB colour in #RRGGBB form. */
  value: string;
  /** Receives a lowercase #rrggbb from the swatch or a committed text edit. */
  onChange: (value: string) => void;
  /** Visible label for the native colour picker. */
  label: string;
  /** Accessible name of the hex input, including the colour it edits. */
  hexLabel: string;
  /** Text shown when Enter or blur commits an invalid hex input. */
  invalidMessage: string;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

function readHex(text: string) {
  const digits = text.trim().replace(/^#/, "");
  return /^[0-9a-f]{6}$/i.test(digits) ? `#${digits.toLowerCase()}` : undefined;
}

/** A platform colour picker paired with an editable six-digit hex value. */
export function ColorPicker({ value, onChange, label, hexLabel, invalidMessage, disabled, className }: Readonly<ColorPickerProps>) {
  const id = useId();
  const current = readHex(value);
  const [draft, setDraft] = useState<{ base: string; text: string; invalid: boolean } | null>(null);
  if (!current) throw new RangeError("Expected a six-digit hex colour");
  // A preset or a form reset supersedes any unfinished edit, without replacing the focused input.
  if (draft && draft.base !== current) setDraft(null);
  const errorId = `${id}-error`;

  function select(next: string) {
    setDraft(null);
    if (next !== current) onChange(next);
  }
  function commit() {
    if (!draft || disabled) return;
    const next = readHex(draft.text);
    if (next) select(next);
    else setDraft({ ...draft, invalid: true });
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!draft || event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setDraft(null);
    }
  }

  return (
    <div className={cx("elea-field", "elea-color-picker", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="elea-color-picker__controls">
        <Input id={id} type="color" className="elea-color-picker__swatch" value={current} disabled={disabled}
          onChange={event => select(event.currentTarget.value)} />
        <Input type="text" className="elea-color-picker__hex" aria-label={hexLabel} value={draft?.text ?? current.toUpperCase()}
          autoComplete="off" spellCheck={false} autoCapitalize="off" disabled={disabled}
          invalid={draft?.invalid} aria-describedby={draft?.invalid ? errorId : undefined}
          onChange={event => setDraft({ base: current, text: event.currentTarget.value, invalid: false })}
          onBlur={commit} onKeyDown={onKeyDown} />
      </div>
      {draft?.invalid && <p id={errorId} className="elea-field__error" role="alert">{invalidMessage}</p>}
    </div>
  );
}
