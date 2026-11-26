"use client";

import {
  forwardRef, useEffect, useId, useImperativeHandle, useRef, useState,
  type ForwardedRef, type InputHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { applyInputMask, formatInputMask, type InputFormat } from "./inputMask.js";
import { cx } from "./cx.js";

export interface CharacterCounter {
  /** Soft limit, counted in UTF-16 code units to match native maxLength. */
  max: number;
  /** Visible and politely announced counter text, e.g. "12 of 80 characters". */
  format?: ((count: number, max: number) => string) | undefined;
}

type NativeTextValue = InputHTMLAttributes<HTMLInputElement>["value"];

function useTextControl<T extends HTMLInputElement | HTMLTextAreaElement>(
  forwardedRef: ForwardedRef<T>, counter: CharacterCounter | undefined, value: NativeTextValue,
  defaultValue: NativeTextValue, form: string | undefined, describedBy: string | undefined, mask?: string | InputFormat,
) {
  const control = useRef<T>(null);
  const previous = useRef(String(value ?? defaultValue ?? ""));
  const counterId = useId();
  const [uncontrolledCount, setUncontrolledCount] = useState(() => String(defaultValue ?? "").length);
  useImperativeHandle(forwardedRef, () => control.current!, []);
  const enabled = counter !== undefined;
  useEffect(() => {
    const node = control.current;
    if ((!enabled && !mask) || !node || value !== undefined) return;
    const owner = node.form;
    const read = () => {
      if (mask && node instanceof node.ownerDocument.defaultView!.HTMLInputElement) {
        applyInputMask(node, mask, node.value);
      }
      previous.current = node.value;
      if (enabled) setUncontrolledCount(node.value.length);
    };
    read();
    // Native reset updates the value after the cancelable reset event.
    const reset = () => queueMicrotask(read);
    owner?.addEventListener("reset", reset);
    return () => owner?.removeEventListener("reset", reset);
  }, [enabled, form, value, mask]);
  const count = value === undefined ? uncontrolledCount : String(value).length;
  const exceeded = counter !== undefined && count > counter.max;
  const indicator = counter && (
    <span id={counterId} aria-live="polite" aria-atomic="true"
      className={cx("elea-field__counter", exceeded && "elea-field__counter--over")}>
      {counter.format ? counter.format(count, counter.max) : `${count} / ${counter.max}`}
    </span>
  );
  return {
    control, previous, setUncontrolledCount, indicator, exceeded,
    describedBy: counter ? [describedBy, counterId].filter(Boolean).join(" ") : describedBy,
  };
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> {
  invalid?: boolean | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
  counter?: CharacterCounter | undefined;
  /** Digit slots (#) separated by punctuation, e.g. "### ### ###". onChange receives the displayed value. */
  mask?: string | undefined;
  /** Progressive parser and formatter. When present it takes precedence over a digit mask. */
  format?: InputFormat | undefined;
}

/** A native input with an optional grouped digit mask and character count. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  invalid = false, size = "md", className, counter, mask: digitsMask, format, value, defaultValue, onChange,
  onCompositionStart, onCompositionEnd, ...rest
}, ref) {
  const mask = format ?? digitsMask;
  const [composing, setComposing] = useState(false);
  const display = (source: NativeTextValue) => mask && source != null ? formatInputMask(String(source), mask) : source;
  const displayed = composing ? value : display(value);
  const initial = display(defaultValue);
  const count = useTextControl(ref, counter, displayed, initial, rest.form, rest["aria-describedby"], mask);
  return <>
    <input {...rest} ref={count.control} value={displayed} defaultValue={initial}
      inputMode={rest.inputMode ?? format?.inputMode} autoComplete={rest.autoComplete ?? format?.autoComplete}
      className={cx("elea-ui-input", `elea-ui-input--${size}`, invalid && "elea-ui-input--invalid", className)}
      aria-invalid={invalid || count.exceeded || rest["aria-invalid"] || undefined} aria-describedby={count.describedBy}
      onChange={mask || counter ? event => {
        const node = event.currentTarget;
        const native = event.nativeEvent as InputEvent;
        if (mask && !composing && !native.isComposing) {
          applyInputMask(node, mask, String(displayed ?? count.previous.current), native.inputType);
        }
        count.previous.current = node.value;
        if (counter && value === undefined) count.setUncontrolledCount(node.value.length);
        onChange?.(event);
      } : onChange}
      onCompositionStart={mask ? event => { setComposing(true); onCompositionStart?.(event); } : onCompositionStart}
      onCompositionEnd={mask ? event => {
        const node = event.currentTarget;
        setComposing(false);
        onCompositionEnd?.(event);
        // Some browsers deliver the final input before compositionend. Commit any
        // remaining formatting through an input event so controlled hosts receive it.
        if (formatInputMask(node.value, mask) !== node.value) {
          applyInputMask(node, mask, count.previous.current, undefined, true);
          node.dispatchEvent(new node.ownerDocument.defaultView!.Event("input", { bubbles: true }));
        }
      } : onCompositionEnd} />
    {count.indicator}
  </>;
});

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  invalid?: boolean | undefined;
  className?: string | undefined;
  counter?: CharacterCounter | undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  invalid = false, className, counter, value, defaultValue, onChange, ...rest
}, ref) {
  const count = useTextControl(ref, counter, value, defaultValue, rest.form, rest["aria-describedby"]);
  return <>
    <textarea {...rest} ref={count.control} value={value} defaultValue={defaultValue}
      className={cx("elea-ui-input", "elea-ui-textarea", invalid && "elea-ui-input--invalid", className)}
      aria-invalid={invalid || count.exceeded || rest["aria-invalid"] || undefined} aria-describedby={count.describedBy}
      onChange={counter && value === undefined ? event => { count.setUncontrolledCount(event.currentTarget.value.length); onChange?.(event); } : onChange} />
    {count.indicator}
  </>;
});
