"use client";

import { useId, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Input, Textarea } from "./Field.js";

/** A value collected with the answer of a confirmation: a reason, a comment, a name typed to confirm. */
export interface ConfirmField {
  label: string;
  placeholder?: string | undefined;
  /** The confirm button stays disabled while the field is empty. */
  required?: boolean | undefined;
  /** A textarea, which Ctrl+Enter or Cmd+Enter confirms from; a single line confirms on Enter. */
  multiline?: boolean | undefined;
  maxLength?: number | undefined;
  defaultValue?: string | undefined;
  /** The confirm button stays disabled until the trimmed value is exactly this one, e.g. the name of what is deleted. */
  expected?: string | undefined;
}

/**
 * What `ConfirmDialog` and `ConfirmPopover` share around their `field`: its value, which starts over each time the
 * confirmation opens, the labelled control, and the confirm button, disabled while the answer is not acceptable and
 * then described by the label of the field that holds it back.
 */
export function useConfirmField(field: ConfirmField | undefined, open: boolean, loading: boolean, onConfirm: (value?: string) => void) {
  const id = useId();
  const initial = field?.defaultValue ?? "";
  const [value, setValue] = useState(initial);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setValue(initial);
  }
  const answer = value.trim();
  const blocked = field !== undefined && ((field.required === true && answer === "") || (field.expected !== undefined && answer !== field.expected));

  const confirm = () => {
    if (blocked || loading) return;
    if (field) onConfirm(answer);
    else onConfirm();
  };
  const button = { onClick: confirm, disabled: blocked, "aria-describedby": blocked ? `${id}-label` : undefined };
  if (!field) return { control: null, button };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing || (field.multiline && !event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    confirm();
  };
  const Control = field.multiline ? Textarea : Input;
  const control = (
    <div className="elea-field">
      <label id={`${id}-label`} htmlFor={id} className="elea-field__label">
        {field.label}
        {field.required && <span className="elea-field__required" aria-hidden="true">*</span>}
      </label>
      <Control
        id={id}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        required={field.required}
        disabled={loading}
        data-elea-focus=""
      />
    </div>
  );
  return { control, button };
}
