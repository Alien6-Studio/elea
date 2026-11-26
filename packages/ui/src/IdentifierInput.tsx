"use client";

import { forwardRef, useEffect, useRef, useState, type ClipboardEvent, type ForwardedRef, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { cardNetwork } from "./cardNetwork.js";
import { cx } from "./cx.js";
import { ibanFormat, paymentCardFormat, sirenFormat, siretFormat } from "./inputFormats.js";
import type { SegmentedInputFormat } from "./inputMask.js";

export interface IdentifierInputProps extends Pick<InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "form" | "autoComplete" | "disabled" | "required" | "readOnly" | "className" | "aria-describedby" | "aria-invalid"> {
  label: string;
  /** Localized accessible name for each block. The first index is zero. */
  segmentLabel: (index: number, total: number) => string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (raw: string) => void;
}

function split(raw: string, widths: readonly number[]): string[] {
  let offset = 0;
  return widths.map(width => {
    const block = raw.slice(offset, offset + width);
    offset += width;
    return block;
  });
}

function CardMark({ raw }: Readonly<{ raw: string }>) {
  const network = cardNetwork(raw);
  let mark;
  if (network === "mastercard") {
    mark = <g fill="currentColor"><circle cx="52" cy="33" r="6" /><circle cx="60" cy="33" r="6" opacity=".65" /></g>;
  } else if (network === "generic") {
    mark = <path d="M9 34h7m3 0h7m3 0h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
  } else {
    mark = <text x="66" y="38" textAnchor="end" fill="currentColor">{network === "visa" ? "VISA" : "AMEX"}</text>;
  }
  return <span className="elea-card-mark" data-network={network} aria-hidden="true">
    <svg viewBox="0 0 74 46" fill="none" focusable="false">
      <path className="elea-card-mark__etch" d="M28 52C36 23 51 34 80 4M35 54C45 25 63 35 80 12M44 54C54 31 69 32 80 21" />
      <g className="elea-card-mark__chip"><rect x="8" y="9" width="13" height="10" rx="2" />
        <path d="M8 14h4m5 0h4m-8-5v3h3v4h-3v3" /></g>
      <path d="M26 12q2 2 0 4m3-6q4 4 0 8" stroke="currentColor" strokeLinecap="round" />
      {mark}
    </svg>
  </span>;
}

function readIdentifier(text: string, format: SegmentedInputFormat) {
  const raw = format.parse(text);
  const widths = format.segments(raw);
  return { blocks: split(raw, widths), widths };
}

type FocusTarget = { index: number; position: number | "select" };

function moveFocus(group: HTMLFieldSetElement | null, { index, position }: FocusTarget) {
  const input = group?.elements.item(index) as HTMLInputElement | null | undefined;
  if (!input) return;
  input.focus();
  if (position === "select") input.select();
  else input.setSelectionRange(position, position);
}

function IdentifierInput({ format, firstRef, label, segmentLabel, value, defaultValue = "", onValueChange,
  id, name, form, autoComplete, required, disabled, readOnly, className, "aria-describedby": description, "aria-invalid": invalid,
}: Readonly<IdentifierInputProps & { format: SegmentedInputFormat; firstRef: ForwardedRef<HTMLInputElement> }>) {
  const [entry, setEntry] = useState(() => readIdentifier(value ?? defaultValue, format));
  const { blocks, widths: editingWidths } = entry;
  const raw = blocks.join("");
  const supplied = value === undefined ? undefined : format.parse(value);
  const group = useRef<HTMLFieldSetElement>(null);
  const focusTarget = useRef<FocusTarget | null>(null);
  if (supplied !== undefined && supplied !== raw) {
    const replacement = readIdentifier(supplied, format);
    const focused = group.current?.querySelector<HTMLInputElement>("input[data-segment]:focus");
    if (focused) {
      const index = Math.min(Number(focused.dataset.segment), replacement.widths.length - 1);
      focusTarget.current = { index, position: focused.selectionStart ?? 0 };
    }
    setEntry(replacement);
  }
  useEffect(() => {
    if (focusTarget.current) moveFocus(group.current, focusTarget.current);
    focusTarget.current = null;
  }, [blocks]);

  useEffect(() => {
    const owner = group.current?.form;
    if (!owner || value !== undefined) return;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          setEntry(readIdentifier(defaultValue, format));
        }
      });
    }
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [form, value, defaultValue, format]);

  function write(next: string[], focus?: FocusTarget) {
    focusTarget.current = focus ?? null;
    const result = next.join("");
    const prefix = next[0] ?? "";
    const rest = next.slice(1).join("");
    // Keep the current layout while the user replaces the country or network prefix.
    const undecided = !prefix || (prefix.length < 2 && (format === ibanFormat || prefix === "3"));
    const formatValue = rest && format === paymentCardFormat ? prefix.padEnd(4, "0") + rest : result;
    const widths = (rest && undecided ? editingWidths : format.segments(formatValue)).slice();
    if (format === paymentCardFormat && widths[1] !== editingWidths[1]) {
      next = [prefix, ...split(rest, widths.slice(1))];
    }
    // An earlier empty block must not hide any populated block farther to the right.
    next.forEach((block, i) => {
      if (block) widths[i] = Math.max(widths[i] ?? 4, block.length);
    });
    setEntry({ blocks: next, widths });
    if (result !== raw) onValueChange?.(result);
  }

  function replaceAll(text: string) {
    const replacement = readIdentifier(text, format);
    const populated = replacement.blocks.filter(Boolean);
    focusTarget.current = { index: populated.length - 1, position: populated.at(-1)!.length };
    setEntry(replacement);
    if (text !== raw) onValueChange?.(text);
  }

  function isWholeNumber(clean: string) {
    if (format === ibanFormat) {
      const widths = format.segments(clean.slice(0, 2));
      return /^[A-Z]{2}\d{2}/.test(clean) && clean.length >= Math.max(15, widths.reduce((a, b) => a + b, 0));
    }
    if (format === paymentCardFormat) return clean.length >= 13;
    return clean.length === format.segments(clean).reduce((a, b) => a + b, 0);
  }

  function insertAcross(index: number, left: string, inserted: string, right: string) {
    // Keep untouched digits after a partial paste.
    const before = blocks.slice(0, index);
    const suffix = right + blocks.slice(index + 1).join("");
    const widths = format.segments(before.join("") + left + inserted + suffix).slice(index);
    const available = widths.reduce((sum, width) => sum + width, 0) - left.length - suffix.length;
    const accepted = inserted.slice(0, Math.max(0, available));
    const content = left + accepted + suffix;
    const next = before.concat(split(content, widths));
    let position = left.length + accepted.length;
    let part = 0;
    while (part < widths.length - 1 && position > widths[part]!) position -= widths[part++]!;
    write(next, { index: index + part, position });
  }

  function edit(index: number, text: string, caret: number) {
    if (disabled || readOnly) return;
    const clean = format.parse(text);
    const capacity = editingWidths[index]!;
    if (clean.length > capacity) {
      // Native autofill can deliver the whole identifier to its first input.
      if (isWholeNumber(clean)) replaceAll(clean);
      else insertAcross(index, "", format.parse(text.slice(0, caret)), format.parse(text.slice(caret)));
      return;
    }
    const next = editingWidths.map((_, i) => i === index ? clean : (blocks[i] ?? ""));
    const nextRaw = next.join("");
    const nextWidths = format.segments(nextRaw);
    const position = format.parse(text.slice(0, caret)).length;
    const advance = clean.length === capacity && position === capacity && index + 1 < nextWidths.length;
    write(next, advance
      ? { index: index + 1, position: "select" } : { index, position });
  }

  function paste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    if (readOnly || disabled) return;
    event.preventDefault();
    const clean = format.parse(event.clipboardData.getData("text"));
    if (!clean) return;
    if (isWholeNumber(clean)) { replaceAll(clean); return; }

    const input = event.currentTarget;
    const left = input.value.slice(0, input.selectionStart ?? 0);
    const right = input.value.slice(input.selectionEnd ?? input.value.length);
    const text = left + clean + right;
    if (text.length <= editingWidths[index]!) { edit(index, text, left.length + clean.length); return; }
    insertAcross(index, left, clean, right);
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.nativeEvent.isComposing) return;
    const input = event.currentTarget;
    if (input.selectionStart !== input.selectionEnd) return;
    if (index > 0 && input.selectionStart === 0) {
      if (event.key === "Backspace" && !readOnly && !input.value) {
        event.preventDefault();
        const next = blocks.slice();
        next[index - 1] = (next[index - 1] ?? "").slice(0, -1);
        write(next, { index: index - 1, position: next[index - 1]!.length });
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveFocus(group.current, { index: index - 1, position: (blocks[index - 1] ?? "").length });
      }
    }
    if (event.key === "ArrowRight" && input.selectionEnd === input.value.length && index + 1 < editingWidths.length) {
      event.preventDefault();
      moveFocus(group.current, { index: index + 1, position: 0 });
    }
  }

  let offset = 0;
  return <fieldset ref={group} form={form} aria-label={label} aria-describedby={description}
    className={cx("elea-identifier-input", className)}>
    {format === paymentCardFormat && <CardMark raw={blocks[0] ?? ""} />}
    <div className="elea-identifier-input__blocks" dir="ltr">
      {editingWidths.map((width, index) => {
        const start = offset;
        offset += width;
        return <input key={start} data-segment={index}
          className="elea-ui-input elea-identifier-input__block" type="text" size={width}
          id={index === 0 ? id : undefined} ref={index === 0 ? firstRef : undefined}
          aria-label={segmentLabel(index, editingWidths.length)} aria-describedby={description} aria-invalid={invalid}
          inputMode={format.inputMode} autoComplete={index === 0 ? autoComplete ?? format.autoComplete : "off"}
          autoCapitalize={format === ibanFormat ? "characters" : "off"} spellCheck={false}
          disabled={disabled} required={required && index === 0} readOnly={readOnly} form={form} value={blocks[index] ?? ""}
          placeholder={"·".repeat(width)} onKeyDown={event => navigate(event, index)}
          onPaste={event => paste(event, index)}
          onChange={event => edit(index, event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)} />;
      })}
    </div>
    {name && <input type="hidden" name={name} form={form} disabled={disabled} value={raw} />}
  </fieldset>;
}

export const SirenInput = forwardRef<HTMLInputElement, IdentifierInputProps>(function SirenInput(props, ref) {
  return <IdentifierInput {...props} firstRef={ref} format={sirenFormat} />;
});
export const SiretInput = forwardRef<HTMLInputElement, IdentifierInputProps>(function SiretInput(props, ref) {
  return <IdentifierInput {...props} firstRef={ref} format={siretFormat} />;
});
export const IbanInput = forwardRef<HTMLInputElement, IdentifierInputProps>(function IbanInput(props, ref) {
  return <IdentifierInput {...props} firstRef={ref} format={ibanFormat} />;
});
export const CardNumberInput = forwardRef<HTMLInputElement, IdentifierInputProps>(function CardNumberInput(props, ref) {
  return <IdentifierInput {...props} firstRef={ref} format={paymentCardFormat} />;
});
