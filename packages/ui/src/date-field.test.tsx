import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Calendar } from "./Calendar.js";
import { DateField, type DateFieldProps } from "./DateField.js";
import { Field } from "./Field.js";

afterEach(cleanup);

const base: DateFieldProps = {
  value: null, onChange() {}, label: "Publication date", locale: "en-GB",
  labels: { day: "Day", month: "Month", year: "Year", openCalendar: "Open calendar", previousMonth: "Previous month", nextMonth: "Next month" },
};

function Example(props: Partial<DateFieldProps>) {
  const [value, setValue] = useState<string | null>(props.value ?? null);
  return <form><DateField {...base} {...props} value={value} name="published" onChange={date => { setValue(date); props.onChange?.(date); }} /></form>;
}

const segment = (name: string) => screen.getByRole<HTMLInputElement>("textbox", { name });
const edit = (name: string, value: string) => fireEvent.change(segment(name), { target: { value } });
const submitted = () => document.querySelector<HTMLInputElement>('input[name="published"]')!.value;

test("typing in local order publishes an ISO leap day, and clearing one segment clears the form value", () => {
  const calls: (string | null)[] = [];
  render(<Example onChange={date => calls.push(date)} />);
  assert.deepEqual(screen.getAllByRole("textbox").map(input => input.getAttribute("aria-label")), ["Day", "Month", "Year"]);
  segment("Day").focus();
  edit("Day", "2");
  edit("Day", "29");
  assert.equal(document.activeElement, segment("Month"));
  edit("Month", "2");
  fireEvent.blur(segment("Month"));
  assert.equal(segment("Month").value, "02");
  edit("Year", "2024");
  assert.equal(submitted(), "2024-02-29");
  edit("Year", "");
  assert.equal(submitted(), "");
  assert.equal(segment("Day").value, "29");
  assert.equal(segment("Month").checkValidity(), false);
  edit("Day", "");
  edit("Month", "");
  assert.equal(segment("Month").checkValidity(), true);
  assert.deepEqual(calls, ["2024-02-29", null]);
});

test("rejects impossible dates and dates beyond either inclusive bound", () => {
  render(<Example value="2024-02-28" min="2024-02-28" max="2024-03-02" />);
  for (const value of ["30", "27"]) {
    edit("Day", value);
    assert.equal(segment("Day").getAttribute("aria-invalid"), "true");
    assert.equal(segment("Day").checkValidity(), false);
    assert.equal(submitted(), "");
  }
  edit("Day", "29");
  assert.equal(submitted(), "2024-02-29");
  edit("Year", "2023");
  assert.equal(submitted(), "");
  edit("Year", "2024");
  edit("Month", "03");
  edit("Day", "03");
  assert.equal(submitted(), "");
  edit("Day", "02");
  assert.equal(submitted(), "2024-03-02");
});

test("a host value replaces an unfinished draft and a controlled field honours rejected edits", () => {
  const { rerender } = render(<DateField {...base} />);
  edit("Day", "1");
  rerender(<DateField {...base} value="2030-06-10" />);
  assert.equal(segment("Day").value, "10");
  edit("Day", "20");
  assert.equal(segment("Day").value, "10");
  rerender(<DateField {...base} />);
  assert.equal(segment("Day").value, "");
});

test("passes Field relationships to the localized segments and supports arrow navigation and numeric editing", () => {
  const ref = createRef<HTMLInputElement>();
  render(<Field id="deadline" label="Deadline" required error="Choose a date">{control =>
    <DateField {...base} {...control} ref={ref} label="Deadline" locale="en-US" value="2025-12-01" />
  }</Field>);
  const group = screen.getByRole("group", { name: "Deadline" });
  assert.equal(group.tagName, "FIELDSET");
  assert.equal(within(group).getAllByRole("textbox").length, 3);
  assert.equal(ref.current, segment("Month"));
  assert.equal(segment("Month").labels?.[0]?.textContent, "Deadline");
  for (const input of screen.getAllByRole<HTMLInputElement>("textbox")) {
    assert.equal(input.required, true);
    assert.equal(input.getAttribute("aria-describedby"), "deadline-error");
    assert.equal(input.getAttribute("aria-invalid"), "true");
  }
  segment("Month").focus();
  fireEvent.keyDown(segment("Month"), { key: "ArrowRight" });
  assert.equal(document.activeElement, segment("Day"));
  fireEvent.keyDown(segment("Day"), { key: "ArrowLeft" });
  assert.equal(document.activeElement, segment("Month"));
  cleanup();
  render(<Example value="2025-12-01" />);
  fireEvent.keyDown(segment("Day"), { key: "ArrowUp" });
  assert.equal(submitted(), "2025-12-02");
  fireEvent.keyDown(segment("Day"), { key: "ArrowDown" });
  assert.equal(submitted(), "2025-12-01");
  edit("Year", "text");
  assert.equal(segment("Year").value, "2025");
});

test("uses the locale's digits and Gregorian years, including in locales with another default calendar", () => {
  render(<Example value="2024-03-31" locale="ar-EG-u-nu-arab" />);
  assert.equal(segment("Year").value, "٢٠٢٤");
  edit("Day", "١٩");
  assert.equal(submitted(), "2024-03-19");
  edit("Day", "12");
  assert.equal(segment("Day").value, "١٢");
});

test("choosing a day returns focus to the trigger and Escape preserves the value", () => {
  render(<Example value="2024-02-28" min="2024-02-27" max="2024-03-02" />);
  const trigger = screen.getByRole("button", { name: "Open calendar" });
  fireEvent.click(trigger);
  const grid = screen.getByRole("grid", { name: "Publication date" });
  assert.equal(within(grid).getByRole<HTMLButtonElement>("button", { name: /26 February 2024/ }).disabled, true);
  assert.equal(document.activeElement, within(grid).getByRole("button", { name: /28 February 2024/ }));
  const selected = within(grid).getByRole("button", { name: /29 February 2024/ });
  selected.focus();
  fireEvent.click(selected);
  assert.equal(submitted(), "2024-02-29");
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(document.activeElement, trigger);
  fireEvent.click(trigger);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(document.activeElement, trigger);
  assert.equal(submitted(), "2024-02-29");
});

test("native forms enforce required and partial dates and submit exactly one ISO entry", () => {
  const { rerender } = render(<Example required />);
  const form = document.querySelector("form")!;
  const entries = () => Array.from(new window.FormData(form).entries());
  assert.equal(form.checkValidity(), false);
  rerender(<Example required={false} />);
  assert.equal(form.checkValidity(), true);
  edit("Month", "01");
  assert.equal(form.checkValidity(), false);
  edit("Day", "01");
  edit("Year", "2028");
  assert.equal(form.checkValidity(), true);
  assert.deepEqual(entries(), [["published", "2028-01-01"]]);
  fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
  rerender(<Example disabled />);
  assert.equal(screen.queryByRole("dialog"), null);
  assert.deepEqual(entries(), []);
  assert.equal(segment("Year").disabled, true);
  assert.equal(form.checkValidity(), true);
});

test("replacing a prefilled year retains the day and month through partial and invalid input", () => {
  render(<Example value="2024-02-29" />);
  const year = segment("Year");
  fireEvent.mouseDown(year, { button: 0 });
  assert.equal(document.activeElement, year);
  assert.deepEqual([year.selectionStart, year.selectionEnd], [0, 4]);
  for (const text of ["2", "20", "202", "2025"]) {
    edit("Year", text);
    assert.equal(submitted(), "");
    assert.equal(segment("Month").value, "02");
    assert.equal(segment("Day").value, "29");
  }
  edit("Year", "2028");
  assert.equal(submitted(), "2028-02-29");
});

test("stepping a valid segment retains a valid day in short months and stops at the field bounds", () => {
  render(<Example value="2028-01-31" min="2028-01-31" max="2028-02-29" />);
  fireEvent.keyDown(segment("Day"), { key: "ArrowDown" });
  assert.equal(submitted(), "2028-01-31");
  fireEvent.keyDown(segment("Month"), { key: "ArrowUp" });
  assert.equal(submitted(), "2028-02-29");
  fireEvent.keyDown(segment("Month"), { key: "ArrowUp" });
  assert.equal(submitted(), "2028-02-29");
});

test("choosing the selected day dismisses the picker without re-emitting it, preserving Calendar's public behaviour", () => {
  const calls: (string | null)[] = [];
  const onChange = (date: string | null) => calls.push(date);
  const { unmount } = render(<Example value="2028-02-29" onChange={onChange} />);
  const trigger = screen.getByRole("button", { name: "Open calendar" });
  fireEvent.click(trigger);
  const leapDay = screen.getByRole("button", { name: /29 February 2028/ });
  assert.equal(document.activeElement, leapDay);
  fireEvent.click(leapDay);
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(document.activeElement, trigger);
  unmount();
  render(<Calendar {...base} value="2028-02-29" onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: /29 February 2028/ }));
  assert.deepEqual(calls, []);
});

test("opening an empty picker focuses today's day clamped to its date window", () => {
  render(<Example min="2080-04-02" max="2080-04-02" />);
  fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
  assert.equal(document.activeElement, screen.getByRole("button", { name: /\b2 April 2080/ }));
});
