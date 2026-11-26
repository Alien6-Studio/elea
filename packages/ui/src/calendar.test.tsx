import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Calendar, type CalendarProps } from "./Calendar.js";

afterEach(cleanup);

const base: CalendarProps = {
  label: "Publication date",
  labels: { previousMonth: "Previous month", nextMonth: "Next month" },
  locale: "en-GB",
  value: null,
  onChange: () => {},
};
const grid = () => screen.getByRole("grid", { name: base.label });
function day(iso: string) {
  const table = grid();
  const locale = table.closest<HTMLElement>("[lang]")?.lang;
  const name = new Intl.DateTimeFormat(locale, { dateStyle: "full", calendar: "gregory", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
  return within(table).getByRole<HTMLButtonElement>("button", { name });
}

function move(from: string, key: string, to: string, shiftKey = false) {
  fireEvent.keyDown(day(from), { key, shiftKey });
  assert.equal(document.activeElement, day(to));
  assert.equal(day(to).tabIndex, 0);
  assert.equal(grid().querySelectorAll('button[tabindex="0"]').length, 1);
}

test("keyboard navigation crosses leap days and year boundaries without selecting", () => {
  const changes: string[] = [];
  render(<Calendar {...base} value="2024-01-31" onChange={next => changes.push(next)} />);
  move("2024-01-31", "PageDown", "2024-02-29");
  move("2024-02-29", "ArrowRight", "2024-03-01");
  move("2024-03-01", "ArrowUp", "2024-02-23");
  move("2024-02-23", "ArrowDown", "2024-03-01");
  move("2024-03-01", "ArrowLeft", "2024-02-29");
  move("2024-02-29", "PageUp", "2023-02-28", true);
  move("2023-02-28", "PageDown", "2024-02-28", true);
  assert.deepEqual(changes, []);
  fireEvent.click(day("2024-02-28"));
  assert.deepEqual(changes, ["2024-02-28"]);
  assert.equal(within(grid()).queryByRole("gridcell", { selected: true }), null);
});

test("a localized Sunday-first grid uses its own week boundaries and visual arrow direction", () => {
  render(<Calendar {...base} locale="fr-FR" defaultMonth="2024-12" weekStartsOn={0} />);
  const firstHeader = within(grid()).getAllByRole("columnheader")[0]!;
  assert.equal(firstHeader.getAttribute("abbr"), "dimanche");
  assert.equal(day("2024-12-01").tabIndex, 0);
  move("2024-12-01", "End", "2024-12-07");
  move("2024-12-07", "Home", "2024-12-01");
  day("2024-12-01").style.direction = "rtl";
  move("2024-12-01", "ArrowRight", "2024-11-30");
  day("2024-11-30").style.direction = "rtl";
  move("2024-11-30", "ArrowLeft", "2024-12-01");
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  assert.equal(day("2025-01-01").tabIndex, 0);
});

test("selection follows the host and out-of-range dates cannot be activated", () => {
  const changes: string[] = [];
  const props = { ...base, defaultMonth: "2024-02", min: "2024-02-28", max: "2024-03-03", onChange: (next: string) => changes.push(next) };
  const { rerender } = render(<Calendar {...props} />);
  assert.equal(day("2024-02-27").disabled, true);
  fireEvent.click(day("2024-02-27"));
  assert.deepEqual(changes, []);
  assert.equal(day("2024-02-28").tabIndex, 0);
  assert.equal(screen.getByRole<HTMLButtonElement>("button", { name: "Previous month" }).disabled, true);
  day("2024-02-28").focus();
  move("2024-02-28", "Home", "2024-02-28");
  fireEvent.keyDown(day("2024-02-28"), { key: "ArrowRight", altKey: true });
  fireEvent.keyDown(day("2024-02-28"), { key: "Tab" });
  assert.equal(document.activeElement, day("2024-02-28"));
  fireEvent.click(day("2024-02-29"));
  assert.deepEqual(changes, ["2024-02-29"]);
  assert.equal(within(grid()).queryByRole("gridcell", { selected: true }), null);
  rerender(<Calendar {...props} value="2024-02-29" />);
  assert.equal(day("2024-02-29").parentElement?.getAttribute("aria-selected"), "true");
  fireEvent.click(day("2024-02-29"));
  assert.deepEqual(changes, ["2024-02-29"]);
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  assert.equal(document.activeElement, day("2024-03-03"));
  assert.equal(day("2024-03-04").disabled, true);
  assert.equal(screen.getByRole<HTMLButtonElement>("button", { name: "Next month" }).disabled, true);
  fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
  assert.equal(document.activeElement, day("2024-02-28"));
  rerender(<Calendar {...props} value="2024-03-01" />);
  assert.equal(day("2024-03-01").tabIndex, 0);
  assert.equal(day("2024-03-01").parentElement?.getAttribute("aria-selected"), "true");
});

test("SSR and hydration agree across time zones and locales with non-Gregorian defaults", () => {
  const element = <Calendar {...base} locale="th-TH" value="2024-03-10" />;
  const original = process.env.TZ;
  const container = document.createElement("div");
  try {
    process.env.TZ = "Pacific/Kiritimati";
    container.innerHTML = renderToString(element);
    const month = container.querySelector("[aria-live]")?.textContent;
    assert.match(month ?? "", /2024/);
    const before = container.querySelector('[aria-selected="true"] button')?.getAttribute("aria-label");
    assert.match(before ?? "", /10/);
    process.env.TZ = "America/Los_Angeles";
    const errors: unknown[] = [];
    render(element, { container, hydrate: true, onRecoverableError: error => errors.push(error) });
    assert.deepEqual(errors, []);
    assert.equal(container.querySelector('[aria-selected="true"] button')?.getAttribute("aria-label"), before);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("an empty calendar waits for local today at hydration when an opening month is omitted", () => {
  const element = <Calendar {...base} />;
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  assert.equal(within(container).getByRole("group", { name: base.label }).getAttribute("aria-busy"), "true");
  const errors: unknown[] = [];
  render(element, { container, hydrate: true, onRecoverableError: error => errors.push(error) });
  assert.deepEqual(errors, []);
  const group = within(container).getByRole("group", { name: base.label });
  assert.ok(within(group).getByRole("grid", { name: base.label }));
  assert.equal(container.querySelector('[aria-current="date"]')?.textContent, String(new Date().getDate()));
});

test("invalid or reversed dates are rejected and the supported range is navigable", () => {
  for (const props of [{ value: "2023-02-29" }, { min: "2024-1-1" }, { max: "9999-12-32" }, { defaultMonth: "2024-15" }, { min: "2024-04-01", max: "2024-03-01" }]) {
    assert.throws(() => renderToString(<Calendar {...base} {...props} />), RangeError);
  }
  const { rerender } = render(<Calendar {...base} value="0001-01-01" />);
  assert.equal(screen.getByRole<HTMLButtonElement>("button", { name: "Previous month" }).disabled, true);
  rerender(<Calendar {...base} value="9999-12-31" />);
  assert.equal(screen.getByRole<HTMLButtonElement>("button", { name: "Next month" }).disabled, true);
  assert.equal(grid().querySelector('[aria-selected="true"] button')?.textContent, "31");
});
