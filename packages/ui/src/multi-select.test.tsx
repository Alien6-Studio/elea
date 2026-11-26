import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { Field } from "./Field.js";
import { MultiSelect, type MultiSelectProps } from "./MultiSelect.js";

afterEach(cleanup);

const options = [
  { value: "dk", label: "Denmark", group: "Nordic" },
  { value: "ie", label: "Ireland", group: "Atlantic" },
  { value: "no", label: "Norway", group: "Nordic" },
  { value: "fi", label: "Finland", group: "Nordic", disabled: true },
  { value: "jp", label: "Japan" },
];
const defaults: MultiSelectProps = {
  value: [], onChange: () => assert.fail("Unexpected selection"), options, label: "Territories",
  labels: { empty: "No territories", remove: label => `Remove ${label}`, selectGroup: group => `Add all ${group}` },
};
function Example(props: Partial<MultiSelectProps>) {
  const [value, onChange] = useState<string[]>([...(props.value ?? [])]);
  return <form aria-label="Edit"><Field label="Territories" help="Pick a territory" required={props.required}>
    {field => <MultiSelect {...defaults} {...props} {...field} name="zone" value={value} onChange={onChange} />}
  </Field><button>Save</button></form>;
}
const input = () => screen.getByRole<HTMLInputElement>("combobox", { name: "Territories" });
const option = (name: string) => screen.getByRole("option", { name });
const button = (name: string) => screen.getByRole<HTMLButtonElement>("button", { name });
const submitted = () => new window.FormData(screen.getByRole<HTMLFormElement>("form")).getAll("zone");
const active = () => document.getElementById(input().getAttribute("aria-activedescendant") ?? "");
const key = (name: string) => fireEvent.keyDown(input(), { key: name });
const type = (text: string) => fireEvent.change(input(), { target: { value: text } });

test("the search has a Field label and independent focus, selection, validation and form values", () => {
  render(<Example required />);
  const field = input();
  assert.equal(screen.getByLabelText("Territories"), field);
  assert.equal(field.getAttribute("aria-describedby"), `${field.id}-help`);
  assert.equal(field.checkValidity(), false);
  field.focus();
  type("IRel");
  assert.equal(field.checkValidity(), false);
  const list = screen.getByRole("listbox", { name: "Territories" });
  assert.equal(list.getAttribute("aria-multiselectable"), "true");
  assert.equal(field.getAttribute("aria-controls"), list.id);
  assert.equal(active(), option("Ireland"));
  const ireland = option("Ireland");
  assert.equal(ireland.getAttribute("tabindex"), "-1");
  ireland.focus();
  assert.equal(document.activeElement, ireland);
  field.focus();
  assert.equal(active()?.getAttribute("aria-selected"), "false");
  key("Enter");
  assert.equal(active(), option("Ireland"));
  assert.equal(active()?.getAttribute("aria-selected"), "true");
  assert.equal(field.checkValidity(), true);
  assert.equal(field.getAttribute("aria-required"), "true");
  key("ArrowDown");
  assert.equal(active(), option("Japan"));
  key("Enter");
  assert.deepEqual(submitted(), ["ie", "jp"]);
  assert.equal(document.activeElement, field);
  key("Escape");
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(field.value, "");
  fireEvent.click(button("Remove Ireland"));
  assert.deepEqual(submitted(), ["jp"]);
  key("Backspace");
  assert.deepEqual(submitted(), []);
  assert.equal(field.checkValidity(), false);
});

test("groups add all enabled options atomically, capacity preserves existing values and removals stay available", () => {
  render(<Example max={2} value={["jp"]} renderOption={(item, state) => <i data-disabled={state.disabled}>{item.label}</i>} />);
  const field = input();
  field.focus();
  key("ArrowUp");
  assert.equal(active(), option("Japan"));
  assert.deepEqual(within(screen.getByRole("group", { name: "Nordic" })).getAllByRole("option")
    .map(item => item.getAttribute("aria-label")), ["Denmark", "Norway", "Finland"]);
  assert.equal(button("Add all Nordic").disabled, true);
  fireEvent.click(button("Add all Nordic"));
  assert.deepEqual(submitted(), ["jp"]);
  fireEvent.click(button("Remove Japan"));
  assert.equal(button("Add all Nordic").disabled, false);
  fireEvent.click(button("Add all Nordic"));
  assert.deepEqual(submitted(), ["dk", "no"]);
  assert.equal(button("Add all Nordic").disabled, true);
  assert.equal(option("Ireland").getAttribute("aria-disabled"), "true");
  assert.equal(option("Ireland").querySelector("i")?.dataset.disabled, "true");
  assert.equal(option("Finland").getAttribute("aria-disabled"), "true");
  fireEvent.click(option("Ireland"));
  fireEvent.mouseEnter(option("Finland"));
  fireEvent.click(option("Finland"));
  fireEvent.mouseEnter(option("Norway"));
  assert.equal(active(), option("Norway"));
  key("ArrowDown");
  assert.equal(active(), option("Denmark"));
  key("ArrowUp");
  assert.equal(active(), option("Norway"));
  fireEvent.click(option("Norway"));
  assert.deepEqual(submitted(), ["dk"]);
  assert.equal(option("Ireland").getAttribute("aria-disabled"), null);
});

test("free tags survive option refreshes, cannot duplicate a label or ID, and support translated action labels", () => {
  render(<Example creatable labels={{ ...defaults.labels, create: text => `Créer «${text}»` }} />);
  type("  Wadden Sea  ");
  assert.equal(active(), option("Créer «Wadden Sea»"));
  key("Enter");
  assert.deepEqual(submitted(), ["Wadden Sea"]);
  assert.ok(button("Remove Wadden Sea"));
  type("wadden SEA");
  assert.equal(screen.getAllByRole("option").length, 1);
  assert.equal(option("Wadden Sea").getAttribute("aria-selected"), "true");
  type("DK");
  assert.equal(screen.getAllByRole("option").length, 1);
  assert.equal(active(), option("Denmark"));
  type("Denmark");
  assert.equal(screen.getAllByRole("option").length, 1);
  key("Enter");
  assert.deepEqual(submitted(), ["Wadden Sea", "dk"]);
  type("wadd");
  key("Backspace");
  assert.deepEqual(submitted(), ["Wadden Sea", "dk"]);
  type("");
  key("Backspace");
  assert.deepEqual(submitted(), ["Wadden Sea"]);
});

test("controlled values, disabled tags and a disabled control respect the host", () => {
  const changes: string[][] = [];
  const form = (value: string[], disabled = false) => <form aria-label="Edit">
    <MultiSelect {...defaults} name="zone" value={value} disabled={disabled} onChange={next => changes.push(next)} />
  </form>;
  const { rerender } = render(form(["no", "fi"]));
  assert.equal(button("Remove Finland").disabled, true);
  key("Backspace");
  assert.deepEqual(changes, [["fi"]]);
  assert.deepEqual(submitted(), ["no", "fi"]);
  rerender(form(["fi"]));
  key("Backspace");
  assert.equal(changes.length, 1);
  fireEvent.click(input());
  assert.ok(screen.getByRole("listbox"));
  rerender(form(["fi"], true));
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(input().disabled, true);
  assert.deepEqual(submitted(), []);
});

test("IME confirmation and text navigation do not select; focus leaving the composite or clicking outside closes it", () => {
  const bubbled: string[] = [];
  render(<div onKeyDown={event => bubbled.push(event.key)}><Example /></div>);
  const field = input();
  field.focus();
  type("Japan");
  fireEvent.compositionStart(field);
  assert.equal(key("Enter"), true);
  assert.equal(key("Escape"), true);
  fireEvent.compositionEnd(field);
  assert.equal(fireEvent.keyDown(field, { key: "Enter", keyCode: 229 }), true);
  assert.equal(fireEvent.keyDown(field, { key: "ArrowDown", shiftKey: true }), true);
  assert.equal(key("Home"), true);
  assert.deepEqual(submitted(), []);
  const before = bubbled.length;
  key("Escape");
  assert.equal(bubbled.length, before);
  assert.equal(key("Escape"), true);
  fireEvent.click(field);
  fireEvent.blur(field, { relatedTarget: button("Add all Nordic") });
  assert.ok(screen.getByRole("listbox"));
  fireEvent.keyDown(button("Add all Nordic"), { key: "Escape" });
  assert.equal(screen.queryByRole("listbox"), null);
  fireEvent.click(field);
  fireEvent.blur(field, { relatedTarget: button("Save") });
  assert.equal(screen.queryByRole("listbox"), null);
  type("absent");
  assert.equal(screen.getByRole("status").textContent, "No territories");
  assert.equal(screen.queryByRole("option"), null);
  key("Enter");
  assert.deepEqual(submitted(), []);
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(field.value, "");
});
