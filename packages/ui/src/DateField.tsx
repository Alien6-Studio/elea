"use client";

import { forwardRef, useId, useMemo, useRef, useState, type AriaAttributes, type KeyboardEvent } from "react";
import { IconButton } from "./Button.js";
import { CalendarGrid, type CalendarProps } from "./Calendar.js";
import { Popover, type PopoverTriggerProps } from "./Popover.js";
import { cx } from "./cx.js";

type Segment = "day" | "month" | "year";
type Segments = Record<Segment, string>;

export interface DateFieldLabels extends Segments {
  openCalendar: string;
  previousMonth: string;
  nextMonth: string;
}

export interface DateFieldProps extends Pick<CalendarProps, "value" | "locale" | "label" | "min" | "max" | "weekStartsOn" | "className">, Pick<AriaAttributes, "aria-describedby" | "aria-invalid"> {
  /** A complete in-range Gregorian date, or null as soon as editing clears the selection. */
  onChange: (date: string | null) => void;
  labels: DateFieldLabels;
  /** Field label target and ref both reach the first segment in the locale's date order. */
  id?: string | undefined;
  /** Submit the ISO value, irrespective of the date order used onscreen. */
  name?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
}

const widths = { day: 2, month: 2, year: 4 };
const isSegment = (part: string): part is Segment => part === "day" || part === "month" || part === "year";

function splitDate(value: string | null): Segments {
  return { year: value?.slice(0, 4) ?? "", month: value?.slice(5, 7) ?? "", day: value?.slice(8) ?? "" };
}

function readSegments({ day, month, year }: Segments, min?: string, max?: string): string | null {
  if (year.length !== 4 || month.length !== 2 || day.length !== 2 || year === "0000") return null;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  return (min && iso < min) || (max && iso > max) ? null : iso;
}

function dateFormat(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { calendar: "gregory", timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
  const parts = formatter.formatToParts(0);
  const order = parts.map(part => part.type).filter(isSegment);
  const number = new Intl.NumberFormat(locale, { useGrouping: false, numberingSystem: formatter.resolvedOptions().numberingSystem });
  const digits = Array.from({ length: 10 }, (_, index) => number.format(index));
  const ascii = (text: string) => Array.from(text, char => digits.includes(char) ? String(digits.indexOf(char)) : char).join("");
  return { parts, order, digits, ascii };
}

function stepSegment(segments: Segments, part: Segment, direction: number, clampDay: boolean) {
  const limit = { day: 31, month: 12, year: 9999 }[part];
  const number = Math.min(limit, Math.max(1, Number(segments[part]) + direction));
  const next = { ...segments, [part]: String(number).padStart(widths[part], "0") };
  if (clampDay) {
    // Stepping from 31 January to February lands on its last day, including in leap years.
    const last = new Date(`${next.year}-${next.month}-01T00:00:00Z`);
    last.setUTCMonth(last.getUTCMonth() + 1, 0);
    next.day = String(Math.min(Number(next.day), last.getUTCDate())).padStart(2, "0");
  }
  return next;
}

function calendarTrigger(label: string, disabled: boolean | undefined): PopoverTriggerProps["trigger"] {
  return trigger => (
    <IconButton {...trigger} label={label} size="sm" disabled={disabled}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18" />
      </svg>
    </IconButton>
  );
}

/** Localized, independently editable date segments backed by one controlled ISO value. */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField({
  value, onChange, locale, labels, label, id, name, min, max, weekStartsOn, required, disabled, className,
  "aria-describedby": description, "aria-invalid": invalid,
}, ref) {
  const generated = useId();
  const controlId = id ?? generated;
  const { parts, order, digits, ascii } = useMemo(() => dateFormat(locale), [locale]);
  const group = useRef<HTMLFieldSetElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  if (disabled && calendarOpen) setCalendarOpen(false);
  // Only incomplete input lives here. A host-selected ISO date always replaces a previous draft.
  const [draft, setDraft] = useState<Segments | null>(null);
  if (draft && value !== null) setDraft(null);
  const segments = value === null && draft ? draft : splitDate(value);
  const populated = Object.values(segments).some(Boolean);
  const iso = readSegments(segments, min, max);
  const invalidDate = populated && !iso;
  const invalidComplete = invalidDate && order.every(key => segments[key].length === widths[key]);

  function write(next: Segments) {
    const valid = readSegments(next, min, max);
    setDraft(valid ? null : next);
    if (value !== valid) onChange(valid);
  }

  function move(part: Segment, direction: number) {
    const next = order[order.indexOf(part) + direction];
    if (!next) return false;
    const input = group.current?.querySelector<HTMLInputElement>(`[data-segment="${next}"]`);
    input?.focus();
    return Boolean(input);
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>, part: Segment) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const input = event.currentTarget;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const forward = (event.key === "ArrowRight") !== (getComputedStyle(input).direction === "rtl");
      const atEdge = forward ? input.selectionEnd === input.value.length : input.selectionStart === 0;
      if (atEdge && move(part, forward ? 1 : -1)) event.preventDefault();
      return;
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const next = stepSegment(segments, part, event.key === "ArrowUp" ? 1 : -1, Boolean(iso));
    if (iso && !readSegments(next, min, max)) return;
    write(next);
    input.select();
  }

  function chooseDate(date: string) {
    setDraft(null);
    if (date !== value) onChange(date);
    setCalendarOpen(false);
  }

  return (
    <fieldset ref={group} aria-label={label} lang={locale} className={cx("elea-date-field", className)}>
      <div className={cx("elea-date-field__control", "elea-ui-input", Boolean(invalidComplete || invalid === true || invalid === "true") && "elea-ui-input--invalid")}>
        <div className="elea-date-field__segments">
          {parts.map(({ type, value: literal }, index) => {
            if (!isSegment(type)) return <span aria-hidden="true" key={`${type}-${index}`}>{literal}</span>;
            const first = type === order[0];
            return (
              <input key={type} ref={first ? ref : undefined} id={first ? controlId : `${controlId}-${type}`}
                data-segment={type} aria-label={labels[type]} aria-describedby={description} aria-invalid={invalid || invalidComplete || undefined}
                inputMode="numeric" autoComplete="off" required={required} disabled={disabled}
                pattern={invalidDate ? "(?!)" : undefined} placeholder={"–".repeat(widths[type])}
                value={Array.from(segments[type], digit => digits[Number(digit)]).join("")}
                onFocus={event => event.currentTarget.select()}
                onMouseDown={event => {
                  if (event.button !== 0) return;
                  // WebKit places a caret after click, overriding a segment selected only on focus.
                  event.preventDefault();
                  event.currentTarget.focus();
                  event.currentTarget.select();
                }}
                onKeyDown={event => navigate(event, type)}
                onBlur={event => {
                  const text = ascii(event.currentTarget.value);
                  if (type !== "year" && text.length === 1) write({ ...segments, [type]: text.padStart(2, "0") });
                }}
                onChange={event => {
                  const text = ascii(event.target.value);
                  if (/\D/u.test(text) || text.length > widths[type]) return;
                  write({ ...segments, [type]: text });
                  if (text.length === widths[type]) move(type, 1);
                }} />
            );
          })}
        </div>
        <Popover align="end" open={calendarOpen} onOpenChange={setCalendarOpen} label={labels.openCalendar}
          trigger={calendarTrigger(labels.openCalendar, disabled)}>
          <CalendarGrid focusOnOpen label={label} locale={locale} labels={labels} value={value} min={min} max={max}
            weekStartsOn={weekStartsOn} onSelect={chooseDate} />
        </Popover>
      </div>
      {name && <input type="hidden" name={name} value={iso ?? ""} disabled={disabled} />}
    </fieldset>
  );
});
