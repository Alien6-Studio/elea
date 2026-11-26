"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Input, type InputProps } from "./TextControls.js";
import { cx } from "./cx.js";

export interface SearchFieldProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "counter" | "format" | "mask" | "children" | "aria-label"> {
  /** Localized name of the searchbox, also its placeholder unless one is supplied. */
  label: string;
  /** Provide a localized name to show a clear button when the query is editable and nonempty. */
  clearLabel?: string | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((query: string) => void) | undefined;
}

/** A native search input for live filtering or an enclosing search form. The ref targets the input; className and style size the wrapper. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({
  label, clearLabel, value, defaultValue, onValueChange, onChange, placeholder = label,
  disabled, readOnly, className, style, form, ...props
}, ref) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  const [hasText, setHasText] = useState(Boolean(defaultValue));
  const controlled = value !== undefined;
  useEffect(() => {
    const node = input.current;
    if (controlled || !node) return;
    const owner = node.form;
    const read = () => setHasText(node.value !== "");
    read();
    const reset = () => queueMicrotask(read);
    owner?.addEventListener("reset", reset);
    return () => owner?.removeEventListener("reset", reset);
  }, [controlled, defaultValue, form]);

  const canClear = Boolean(clearLabel) && !disabled && !readOnly;
  function clear() {
    const node = input.current;
    if (!node?.value) return;
    // Edit the native input so React and form-level input listeners receive the same change as typing.
    node.focus();
    node.setRangeText("", 0, node.value.length);
    node.dispatchEvent(new node.ownerDocument.defaultView!.Event("input", { bubbles: true, composed: true }));
  }

  return (
    <div className={cx("elea-search-field", canClear && "elea-search-field--clearable", className)} style={style}>
      <svg className="elea-search-field__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
      </svg>
      <Input {...props} ref={input} type="search" aria-label={label} placeholder={placeholder} form={form}
        value={value} defaultValue={defaultValue} disabled={disabled} readOnly={readOnly}
        onChange={event => {
          const query = event.currentTarget.value;
          if (!controlled) setHasText(query !== "");
          onChange?.(event);
          onValueChange?.(query);
        }} />
      {canClear && (controlled ? value !== "" : hasText) && (
        <button type="button" className="elea-search-field__clear" aria-label={clearLabel} onClick={clear}>
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
      )}
    </div>
  );
});
