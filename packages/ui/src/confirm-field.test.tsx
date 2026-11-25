import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import type { ConfirmField } from "./ConfirmField.js";
import { ConfirmDialog } from "./Dialog.js";
import { ConfirmPopover } from "./Popover.js";

let anchor: HTMLButtonElement;
beforeEach(() => {
  anchor = document.body.appendChild(document.createElement("button"));
  anchor.textContent = "Ask";
});
afterEach(() => {
  cleanup();
  anchor.remove();
});

interface Asked {
  field?: ConfirmField;
  open?: boolean;
  loading?: boolean;
  description?: string;
  onConfirm?: (...values: Array<string | undefined>) => void;
  onCancel?: () => void;
}

const labels = { title: "Sure?", confirmLabel: "Confirm", cancelLabel: "Cancel" };

/** The two confirmations, which answer to the same contract: every test below runs against both. */
const kinds = [
  {
    name: "ConfirmDialog",
    role: "dialog",
    /** Where the focus starts without a field. */
    entry: "Close",
    view: ({ open = true, onConfirm = () => {}, onCancel = () => {}, ...rest }: Asked) => <ConfirmDialog {...labels} {...rest} open={open} onConfirm={onConfirm} onCancel={onCancel} closeLabel="Close" />,
  },
  {
    name: "ConfirmPopover",
    role: "alertdialog",
    entry: "Cancel",
    view: ({ open = true, onConfirm = () => {}, onCancel = () => {}, ...rest }: Asked) => <ConfirmPopover {...labels} {...rest} anchor={anchor} open={open} onConfirm={onConfirm} onCancel={onCancel} />,
  },
] as const;

const type = (control: HTMLElement, value: string) => fireEvent.change(control, { target: { value } });
const button = (name: string) => screen.getByRole("button", { name }) as HTMLButtonElement;
const focused = (element: Element) => document.activeElement === element;

for (const { name, role, entry, view } of kinds) {
  test(`${name} without a field renders as before and confirms with no argument`, () => {
    const counts: number[] = [];
    render(view({ description: "For good.", onConfirm: (...values) => counts.push(values.length) }));
    const panel = screen.getByRole(role, { name: "Sure?" });
    assert.equal(panel.querySelectorAll("input, textarea, label, .elea-field").length, 0);
    assert.equal(focused(within(panel).getByRole("button", { name: entry })), true, "the focus starts where it did");
    assert.equal(button("Confirm").disabled, false);
    assert.equal(button("Confirm").hasAttribute("aria-describedby"), false);
    fireEvent.click(button("Confirm"));
    assert.deepEqual(counts, [0], "neither a value nor the click event reaches the host");
  });

  test(`${name} collects an optional value, trimmed, from a labelled field that takes the focus`, async () => {
    const values: unknown[] = [];
    render(view({ field: { label: "Reason", placeholder: "Optional", maxLength: 80 }, description: "The author is told.", onConfirm: (value) => values.push(value) }));
    const panel = screen.getByRole(role, { name: "Sure?" });
    const input = within(panel).getByRole("textbox", { name: "Reason" }) as HTMLInputElement;
    assert.equal(input.tagName, "INPUT");
    assert.equal(input.placeholder, "Optional");
    assert.equal(input.maxLength, 80);
    assert.equal(input.required, false);
    assert.equal(focused(input), true, "the focus starts in the field");
    assert.equal(Boolean(input.compareDocumentPosition(button("Cancel")) & Node.DOCUMENT_POSITION_FOLLOWING), true, "the field sits before the actions");
    assert.equal(button("Confirm").disabled, false);
    fireEvent.click(button("Confirm"));
    type(input, "  Off topic \n");
    fireEvent.click(button("Confirm"));
    assert.deepEqual(values, ["", "Off topic"]);
    const results = await axe.run(panel, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false } } });
    assert.deepEqual(results.violations.map((violation) => violation.id), []);
  });

  test(`${name} confirms on Enter from a single line, on Ctrl+Enter or Cmd+Enter from several, and cancels on Escape`, () => {
    const events: unknown[] = [];
    const props = { onConfirm: (value?: string) => events.push(value), onCancel: () => events.push("cancelled") };
    const { rerender } = render(view({ ...props, field: { label: "Reason", defaultValue: "Late" } }));
    const input = screen.getByRole("textbox", { name: "Reason" });
    assert.equal(fireEvent.keyDown(input, { key: "Enter" }), false);
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "a" });
    assert.deepEqual(events, ["Late"], "a key of an input method or another key confirms nothing");
    fireEvent.keyDown(input, { key: "Escape" });
    assert.deepEqual(events, ["Late", "cancelled"]);

    rerender(view({ ...props, field: { label: "Comment", multiline: true } }));
    const area = screen.getByRole("textbox", { name: "Comment" });
    assert.equal(area.tagName, "TEXTAREA");
    type(area, "Two\nlines");
    assert.equal(fireEvent.keyDown(area, { key: "Enter" }), true, "Enter breaks the line");
    assert.equal(events.length, 2);
    fireEvent.keyDown(area, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(area, { key: "Enter", metaKey: true });
    assert.deepEqual(events.slice(2), ["Two\nlines", "Two\nlines"]);
  });

  test(`${name} keeps the confirm button disabled, and says why, while a required field is empty`, () => {
    const values: unknown[] = [];
    render(view({ field: { label: "Comment", required: true, multiline: true }, onConfirm: (value) => values.push(value) }));
    const area = screen.getByRole("textbox", { name: "Comment" }) as HTMLTextAreaElement;
    assert.equal(area.required, true);
    assert.equal(screen.getByText("*").getAttribute("aria-hidden"), "true");
    const confirm = button("Confirm");
    assert.equal(confirm.disabled, true);
    assert.equal(document.getElementById(confirm.getAttribute("aria-describedby") ?? "")?.textContent, "Comment*", "the button is described by the label of the field that holds it back");
    type(area, "   ");
    assert.equal(confirm.disabled, true, "spaces are not an answer");
    fireEvent.keyDown(area, { key: "Enter", ctrlKey: true });
    fireEvent.click(confirm);
    assert.deepEqual(values, []);
    type(area, "Not sourced");
    assert.equal(confirm.disabled, false);
    assert.equal(confirm.hasAttribute("aria-describedby"), false);
    fireEvent.click(confirm);
    assert.deepEqual(values, ["Not sourced"]);
  });

  test(`${name} waits for the expected value, exactly`, () => {
    const values: unknown[] = [];
    const label = "Type the name of the project to delete it";
    render(view({ field: { label, expected: "elea" }, onConfirm: (value) => values.push(value) }));
    const input = screen.getByRole("textbox", { name: label });
    const confirm = button("Confirm");
    for (const attempt of ["", "ele", "Elea", "elea-ui"]) {
      type(input, attempt);
      assert.equal(confirm.disabled, true, `"${attempt}" is not the name`);
      assert.equal(document.getElementById(confirm.getAttribute("aria-describedby") ?? "")?.textContent, label);
      fireEvent.keyDown(input, { key: "Enter" });
    }
    type(input, "elea ");
    assert.equal(confirm.disabled, false, "a space around the name does not count");
    fireEvent.keyDown(input, { key: "Enter" });
    assert.deepEqual(values, ["elea"]);
  });

  test(`${name} disables its field with its buttons while loading`, () => {
    const events: unknown[] = [];
    const props = { field: { label: "Reason", defaultValue: "Late" }, onConfirm: (value?: string) => events.push(value), onCancel: () => events.push("cancelled") };
    const { rerender } = render(view(props));
    rerender(view({ ...props, loading: true }));
    const input = screen.getByRole("textbox", { name: "Reason" }) as HTMLInputElement;
    assert.equal(input.disabled, true);
    assert.equal(input.value, "Late", "what was typed stays in sight");
    assert.equal(button("Cancel").disabled && button("Confirm").disabled, true);
    assert.equal(button("Confirm").getAttribute("aria-busy"), "true");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(button("Confirm"));
    assert.deepEqual(events, []);
    fireEvent.keyDown(screen.getByRole(role), { key: "Escape" });
    assert.deepEqual(events, ["cancelled"]);
  });

  test(`${name} starts its field over each time it opens`, () => {
    const field = { label: "Reason", defaultValue: "Duplicate" };
    const { rerender } = render(view({ field }));
    type(screen.getByRole("textbox"), "Something else");
    rerender(view({ field, open: false }));
    assert.equal(screen.queryByRole("textbox"), null);
    rerender(view({ field, open: true }));
    const input = screen.getByRole("textbox", { name: "Reason" }) as HTMLInputElement;
    assert.equal(input.value, "Duplicate");
    assert.equal(focused(input), true);
    rerender(view({ field, open: false }));
    rerender(view({ field: { label: "Reason" }, open: true }));
    assert.equal((screen.getByRole("textbox") as HTMLInputElement).value, "");
  });
}
