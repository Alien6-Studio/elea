"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "./cx.js";

export interface CalendarProps {
  /** Controlled Gregorian date in YYYY-MM-DD form, or null for no selection. */
  value: string | null;
  onChange: (date: string) => void;
  label: string;
  labels: { previousMonth: string; nextMonth: string };
  locale: string;
  /** Initial month in YYYY-MM form when there is no selection. Defaults to the user's local month. */
  defaultMonth?: string | undefined;
  /** Inclusive date limits in YYYY-MM-DD form. */
  min?: string | undefined;
  max?: string | undefined;
  /** First weekday, from Sunday (0) to Saturday (6). Defaults to Monday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  className?: string | undefined;
}

const dayLength = 86_400_000;
const earliest = Date.parse("0001-01-01T00:00:00Z");
const latest = Date.parse("9999-12-31T00:00:00Z");

// UTC midnights represent calendar days. A DST change never shortens or lengthens a day here.
function readDate(value: string): number {
  const day = Date.parse(value + "T00:00:00Z");
  if (!Number.isFinite(day) || day < earliest || day > latest || new Date(day).toISOString().slice(0, 10) !== value) {
    throw new RangeError("Expected a Gregorian date in YYYY-MM-DD form.");
  }
  return day;
}

function monthStart(day: number, offset = 0): number {
  const date = new Date(day);
  return date.setUTCMonth(date.getUTCMonth() + offset, 1);
}

function shiftMonth(day: number, months: number): number {
  const sameDay = monthStart(day, months) + (new Date(day).getUTCDate() - 1) * dayLength;
  return Math.min(sameDay, monthStart(day, months + 1) - dayLength);
}

function localToday(): number {
  const date = new Date();
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** A single-date picker. Moving through the grid leaves the selection under the host's control. */
export function Calendar({ value, onChange, label, labels, locale, defaultMonth, min, max, weekStartsOn = 1, className }: Readonly<CalendarProps>) {
  const selected = value === null ? null : readDate(value);
  const openingMonth = defaultMonth === undefined ? null : readDate(defaultMonth + "-01");
  const lower = min === undefined ? earliest : readDate(min);
  const upper = max === undefined ? latest : readDate(max);
  if (lower > upper) throw new RangeError("Calendar min must not exceed max.");
  const clamp = (day: number) => Math.max(lower, Math.min(upper, day));
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => { setToday(localToday()); }, []);

  const [view, setView] = useState({ value, day: selected ?? openingMonth });
  if (view.value !== value) setView({ value, day: selected ?? view.day });
  const cursor = view.day ?? today;
  const moveFocus = useRef(false);
  const monthId = useId();
  const format = useMemo(() => {
    const options = { timeZone: "UTC", calendar: "gregory" };
    return {
      month: new Intl.DateTimeFormat(locale, { ...options, month: "long", year: "numeric" }),
      weekday: new Intl.DateTimeFormat(locale, { ...options, weekday: "short" }),
      weekdayName: new Intl.DateTimeFormat(locale, { ...options, weekday: "long" }),
      date: new Intl.DateTimeFormat(locale, { ...options, dateStyle: "full" }),
      number: new Intl.NumberFormat(locale),
    };
  }, [locale]);
  const classes = cx("elea-calendar", className);
  if (cursor === null) return <fieldset className={classes} aria-label={label} aria-busy="true" />;

  const active = clamp(cursor);
  const month = monthStart(active);
  const nextMonth = monthStart(active, 1);
  const leadingDays = (new Date(month).getUTCDay() - weekStartsOn + 7) % 7;
  const weekStart = month - leadingDays * dayLength;
  const weekdays = Array.from({ length: 7 }, (_, i) => weekStart + i * dayLength);
  const weekCount = Math.ceil((nextMonth - weekStart) / (7 * dayLength));

  function navigate(event: KeyboardEvent<HTMLButtonElement>, day: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const column = (new Date(day).getUTCDay() - weekStartsOn + 7) % 7;
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const forward = event.key === (rtl ? "ArrowLeft" : "ArrowRight");
        next = day + (forward ? dayLength : -dayLength);
        break;
      }
      case "ArrowDown": next = day + 7 * dayLength; break;
      case "ArrowUp": next = day - 7 * dayLength; break;
      case "Home": next = day - column * dayLength; break;
      case "End": next = day + (6 - column) * dayLength; break;
      case "PageUp": next = shiftMonth(day, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = shiftMonth(day, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    if (clamp(next) !== day) {
      moveFocus.current = true;
      setView({ value, day: clamp(next) });
    }
  }

  function monthButton(offset: number, name: string) {
    const target = clamp(shiftMonth(active, offset));
    return (
      <button type="button" className="elea-calendar__step" aria-label={name} disabled={monthStart(target) === month}
        onClick={() => {
          // A navigation button that becomes disabled cannot retain keyboard focus.
          moveFocus.current = monthStart(target) === monthStart(offset < 0 ? lower : upper);
          setView({ value, day: target });
        }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={offset < 0 ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
        </svg>
      </button>
    );
  }

  function dateCell(day: number) {
    if (day < month || day >= nextMonth) return <td role="gridcell" key={day} />;
    const disabled = day < lower || day > upper;
    return (
      <td role="gridcell" key={day} aria-selected={day === selected}>
        <button type="button" className="elea-calendar__day" disabled={disabled} tabIndex={day === active ? 0 : -1}
          aria-label={format.date.format(day)} aria-current={day === today ? "date" : undefined}
          ref={node => {
            if (node && day === active && moveFocus.current) {
              moveFocus.current = false;
              node.focus();
            }
          }}
          onKeyDown={event => navigate(event, day)}
          onClick={() => {
            setView({ value, day });
            if (day !== selected) onChange(new Date(day).toISOString().slice(0, 10));
          }}>
          {format.number.format(new Date(day).getUTCDate())}
        </button>
      </td>
    );
  }

  return (
    <fieldset className={classes} aria-label={label} lang={locale}>
      <div className="elea-calendar__header">
        <span id={monthId} aria-live="polite" aria-atomic="true">{format.month.format(month)}</span>
        {monthButton(-1, labels.previousMonth)}
        {monthButton(1, labels.nextMonth)}
      </div>
      <table role="grid" aria-label={label} aria-describedby={monthId}>
        <thead><tr>{weekdays.map(day => <th scope="col" key={day} abbr={format.weekdayName.format(day)}>{format.weekday.format(day)}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: weekCount }, (_, week) => (
            <tr key={week}>{weekdays.map(day => dateCell(day + week * 7 * dayLength))}</tr>
          ))}
        </tbody>
      </table>
    </fieldset>
  );
}
