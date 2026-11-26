import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SearchAutocomplete, type SearchAutocompleteProps } from "./SearchAutocomplete.js";

afterEach(cleanup);

const results = [
  { id: "north", label: "Northern edition", description: "Travel", href: "#north" },
  { id: "south", label: "Southern edition", description: "Travel", href: "#south" },
];
const base = { label: "Find editions", status: "2 results", clearLabel: "Clear", results };
function Example(props: Partial<SearchAutocompleteProps>) {
  const [value, setValue] = useState("");
  return <><SearchAutocomplete {...base} value={value} onValueChange={setValue} {...props} /><button>Elsewhere</button></>;
}

test("navigation suggestions preserve input focus, native destinations and host router behavior", () => {
  const selected: string[] = [];
  const opened: boolean[] = [];
  render(<Example onOpenChange={state => opened.push(state)} onResultSelect={item => selected.push(item.id)}
    render={link => <a {...link} data-route={link.href} onClick={event => { event.preventDefault(); link.onClick?.(event); }} />} />);
  const input = screen.getByRole("combobox", { name: "Find editions" });
  fireEvent.focus(input);
  const options = screen.getAllByRole("option");
  assert.equal(input.getAttribute("aria-controls"), screen.getByRole("listbox").id);
  assert.equal(input.hasAttribute("aria-activedescendant"), false);
  fireEvent.keyDown(input, { key: "ArrowDown" });
  assert.equal(input.getAttribute("aria-activedescendant"), options[0]?.id);
  fireEvent.keyDown(input, { key: "ArrowDown" });
  assert.equal(options[1]?.getAttribute("aria-selected"), "true");
  assert.equal(options[1]?.getAttribute("data-route"), "#south");
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  assert.equal(selected.length, 0);
  fireEvent.keyDown(input, { key: "Enter" });
  assert.deepEqual(selected, ["south"]);
  assert.deepEqual(opened, [true, false]);
  assert.equal(input.getAttribute("aria-expanded"), "false");
});

test("escape and outside dismissal preserve the query, updated results never leave a dangling active ID", () => {
  const { rerender } = render(<Example />);
  const input = screen.getByRole<HTMLInputElement>("combobox");
  fireEvent.change(input, { target: { value: "edition" } });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  assert.equal(screen.getByRole("option", { selected: true }).textContent, "Southern editionTravel");
  rerender(<Example results={[]} status="No editions found" />);
  assert.equal(input.hasAttribute("aria-activedescendant"), false);
  assert.equal(screen.getByRole("status").textContent, "No editions found");
  fireEvent.keyDown(input, { key: "Escape" });
  assert.equal(input.value, "edition");
  assert.equal(screen.queryByRole("listbox"), null);
  fireEvent.click(input);
  fireEvent.pointerDown(screen.getByRole("button", { name: "Elsewhere" }));
  assert.equal(screen.queryByRole("listbox"), null);
  fireEvent.click(input);
  fireEvent.blur(input, { relatedTarget: screen.getByRole("button", { name: "Elsewhere" }) });
  assert.equal(screen.queryByRole("listbox"), null);
});

test("automatic first match, clearing, disabled and read-only states follow controlled props", () => {
  const ref = createRef<HTMLInputElement>();
  const selected: string[] = [];
  const onSelect = (item: { id: string }) => selected.push(item.id);
  const { rerender } = render(<SearchAutocomplete {...base} ref={ref} autoSelectFirst value="edition"
    onValueChange={() => {}} onResultSelect={onSelect} />);
  const input = screen.getByRole("combobox");
  assert.ok(ref.current === input);
  fireEvent.focus(input);
  assert.equal(screen.getByRole("option", { selected: true }).getAttribute("href"), "#north");
  fireEvent.click(screen.getByRole("option", { selected: true }), { ctrlKey: true });
  assert.deepEqual(selected, []);
  assert.ok(screen.getByRole("listbox"));
  rerender(<SearchAutocomplete {...base} disabled value="edition" onValueChange={() => {}} />);
  assert.equal(screen.queryByRole("listbox"), null);
  rerender(<SearchAutocomplete {...base} readOnly value="edition" onValueChange={() => {}} />);
  fireEvent.click(input);
  assert.equal(input.getAttribute("aria-expanded"), "false");
  rerender(<SearchAutocomplete {...base} value="edition" onValueChange={() => {}} />);
  assert.equal(screen.queryByRole("listbox"), null);
});
