import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { Badge } from "./Badge.js";
import { Select } from "./Select.js";
import { Button, IconButton } from "./Button.js";
import { Checkbox, Toggle } from "./Checkbox.js";
import { cx, nextId } from "./cx.js";
import { ConfirmDialog, Dialog } from "./Dialog.js";
import { Field, Input, Label, Textarea } from "./Field.js";
import { Menu } from "./Menu.js";
import { Pagination, paginationRange } from "./Pagination.js";
import { Tooltip } from "./Tooltip.js";

afterEach(cleanup);

async function violations(element: React.ReactElement): Promise<string[]> {
  const { container } = render(element);
  const results = await axe.run(container, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`);
}

test("cx joins truthy classes and nextId numbers ids", () => {
  assert.equal(cx("a", false, null, undefined, "b"), "a b");
  assert.notEqual(nextId("x"), nextId("x"));
});

test("Button renders variants, sizes, icons, loading and links", () => {
  const clicks: number[] = [];
  const { rerender } = render(<Button onClick={() => clicks.push(1)} icon={<i>i</i>} trailingIcon={<i>t</i>}>Go</Button>);
  const button = screen.getByRole("button", { name: "Go" });
  assert.equal(button.className, "elea-button elea-button--primary elea-button--md");
  assert.equal(button.getAttribute("type"), "button");
  fireEvent.click(button);
  assert.deepEqual(clicks, [1]);
  rerender(<Button variant="danger" size="lg" fullWidth loading loadingLabel="Saving" onClick={() => clicks.push(2)}>Go</Button>);
  const loading = screen.getByRole("button", { name: "Saving" });
  assert.ok(loading.className.includes("elea-button--loading") && loading.className.includes("elea-button--full") && loading.className.includes("elea-button--lg"));
  assert.equal((loading as HTMLButtonElement).disabled, true);
  assert.equal(loading.getAttribute("aria-busy"), "true");
  assert.ok(loading.querySelector(".elea-button__spinner"));
  rerender(<Button href="https://example.org" variant="outline">Visit</Button>);
  const link = screen.getByRole("link", { name: "Visit" });
  assert.equal(link.getAttribute("href"), "https://example.org");
  rerender(<Button href="https://example.org" disabled>Visit</Button>);
  const disabledLink = screen.getByRole("link", { name: "Visit" });
  assert.equal(disabledLink.getAttribute("href"), null);
  assert.equal(disabledLink.getAttribute("aria-disabled"), "true");
  rerender(<IconButton label="Close" size="sm"><span>x</span></IconButton>);
  const icon = screen.getByRole("button", { name: "Close" });
  assert.ok(icon.className.includes("elea-button--icon") && icon.className.includes("elea-button--ghost"));
  assert.equal(icon.getAttribute("title"), "Close");
});

test("Badge tones and variants", () => {
  render(<Badge tone="danger" variant="solid" size="sm" icon={<i>!</i>} className="x">Late</Badge>);
  const badge = screen.getByText("Late");
  assert.equal(badge.className, "elea-badge elea-badge--danger elea-badge--solid elea-badge--sm x");
  assert.ok(badge.querySelector(".elea-badge__icon"));
});

test("Field wires label, help and error to its control", () => {
  const { rerender } = render(
    <Field label="Name" help="Your full name" required requiredMarker="*">
      {(control) => <Input {...control} placeholder="Jane" />}
    </Field>,
  );
  const input = screen.getByRole("textbox", { name: "Name" });
  assert.equal(input.getAttribute("aria-describedby"), `${input.id}-help`);
  assert.equal(input.getAttribute("aria-invalid"), null);
  assert.equal((input as HTMLInputElement).required, true);
  assert.equal(screen.getByText("Your full name").id, `${input.id}-help`);
  rerender(
    <Field label="Name" id="name" error="Required" help="Hint">
      {(control) => <Textarea {...control} invalid />}
    </Field>,
  );
  const area = screen.getByRole("textbox", { name: "Name" });
  assert.equal(area.id, "name");
  assert.equal(area.getAttribute("aria-describedby"), "name-help name-error");
  assert.equal(area.getAttribute("aria-invalid"), "true");
  assert.equal(screen.getByRole("alert").textContent, "Required");
  assert.ok(area.className.includes("elea-ui-textarea") && area.className.includes("elea-ui-input--invalid"));
  render(<Label htmlFor="z">Zed</Label>);
  assert.equal(screen.getByText("Zed").className, "elea-field__label");
  render(<Input size="sm" aria-label="small" />);
  assert.ok(screen.getByRole("textbox", { name: "small" }).className.includes("elea-ui-input--sm"));
});

test("Checkbox and Toggle report changes and expose their state", () => {
  const checked: boolean[] = [];
  render(<Checkbox label="Agree" description="Terms" onCheckedChange={(next) => checked.push(next)} />);
  const box = screen.getByRole("checkbox", { name: /Agree/ });
  fireEvent.click(box);
  assert.deepEqual(checked, [true]);
  cleanup();
  render(<Checkbox aria-label="partial" indeterminate disabled />);
  const partial = screen.getByRole("checkbox", { name: "partial" }) as HTMLInputElement;
  assert.equal(partial.indeterminate, true);
  assert.equal(partial.disabled, true);
  assert.ok(partial.closest("label")?.className.includes("elea-checkbox--disabled"));
  cleanup();
  function Switch() {
    const [on, setOn] = useState(false);
    return <Toggle checked={on} onCheckedChange={setOn} label="Notifications" />;
  }
  render(<Switch />);
  const toggle = screen.getByRole("switch", { name: "Notifications" });
  assert.equal(toggle.getAttribute("aria-checked"), "false");
  fireEvent.click(toggle);
  assert.equal(toggle.getAttribute("aria-checked"), "true");
  assert.ok(toggle.closest("label")?.className.includes("elea-toggle--on"));
});

test("Dialog traps focus, closes on Escape and the backdrop, and returns focus", () => {
  const closes: number[] = [];
  function Host() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>open</button>
        <Dialog open={open} onClose={() => { closes.push(1); setOpen(false); }} title="Confirm" description="Sure?" closeLabel="Close" actions={<Button onClick={() => setOpen(false)}>Ok</Button>}>
          <Input aria-label="inside" />
        </Dialog>
      </>
    );
  }
  render(<Host />);
  const opener = screen.getByRole("button", { name: "open" });
  opener.focus();
  fireEvent.click(opener);
  const dialog = screen.getByRole("dialog", { name: "Confirm" });
  assert.equal(dialog.getAttribute("aria-modal"), "true");
  assert.equal(dialog.getAttribute("aria-describedby") && screen.getByText("Sure?").id, dialog.getAttribute("aria-describedby"));
  assert.ok(document.activeElement === within(dialog).getByRole("button", { name: "Close" }), "first focusable takes focus");
  assert.equal(document.body.style.overflow, "hidden");
  within(dialog).getByRole("button", { name: "Ok" }).focus();
  fireEvent.keyDown(document, { key: "Tab" });
  assert.ok(document.activeElement === within(dialog).getByRole("button", { name: "Close" }), "Tab wraps to the first");
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  assert.ok(document.activeElement === within(dialog).getByRole("button", { name: "Ok" }), "Shift+Tab wraps to the last");
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.deepEqual(closes, [1]);
  assert.ok(document.activeElement === opener, "focus returns to the opener");
  assert.equal(document.body.style.overflow, "");
  fireEvent.click(opener);
  fireEvent.mouseDown(document.querySelector(".elea-dialog-backdrop") as HTMLElement);
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.click(opener);
  fireEvent.mouseDown(screen.getByRole("dialog"));
  assert.ok(screen.getByRole("dialog"));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
  assert.equal(screen.queryByRole("dialog"), null);
});

test("ConfirmDialog wires its two buttons", () => {
  const events: string[] = [];
  render(<ConfirmDialog open onConfirm={() => events.push("confirm")} onCancel={() => events.push("cancel")} title="Delete?" closeLabel="Close" confirmLabel="Delete" cancelLabel="Keep" tone="danger" />);
  fireEvent.click(screen.getByRole("button", { name: "Keep" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  assert.deepEqual(events, ["cancel", "confirm"]);
  assert.ok(screen.getByRole("button", { name: "Delete" }).className.includes("elea-button--danger"));
  cleanup();
  render(<Dialog open={false} onClose={() => {}} title="Hidden" closeLabel="Close" />);
  assert.equal(screen.queryByRole("dialog"), null);
  render(<Dialog open onClose={() => {}} title="Empty" closeLabel="Close" dismissOnBackdrop={false} size="lg" />);
  fireEvent.mouseDown(document.querySelector(".elea-dialog-backdrop") as HTMLElement);
  assert.ok(screen.getByRole("dialog", { name: "Empty" }).className.includes("elea-dialog--lg"));
});

test("Menu opens from its trigger, moves with the keyboard, selects and closes", () => {
  const picked: string[] = [];
  render(
    <Menu
      label="Actions"
      align="end"
      items={[
        { id: "edit", label: "Edit", onSelect: () => picked.push("edit") },
        { id: "off", label: "Off", disabled: true, onSelect: () => picked.push("off") },
        { id: "delete", label: "Delete", danger: true, icon: <i>d</i>, onSelect: () => picked.push("delete") },
      ]}
      trigger={(props) => <button type="button" {...props}>More</button>}
    />,
  );
  const trigger = screen.getByRole("button", { name: "More" });
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  fireEvent.click(trigger);
  const menu = screen.getByRole("menu", { name: "Actions" });
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.getAttribute("aria-controls"), menu.id);
  const items = within(menu).getAllByRole("menuitem");
  assert.ok(document.activeElement === items[0], "first item focused");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  assert.ok(document.activeElement === items[2], "disabled items are skipped");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  assert.ok(document.activeElement === items[0], "wraps around");
  fireEvent.keyDown(menu, { key: "End" });
  assert.ok(document.activeElement === items[2]);
  fireEvent.keyDown(menu, { key: "Home" });
  fireEvent.keyDown(menu, { key: "ArrowUp" });
  assert.ok(document.activeElement === items[2]);
  fireEvent.mouseEnter(items[0] as HTMLElement);
  fireEvent.mouseEnter(items[1] as HTMLElement);
  fireEvent.click(items[2] as HTMLElement);
  assert.deepEqual(picked, ["delete"]);
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  assert.ok(document.activeElement === within(screen.getByRole("menu")).getAllByRole("menuitem")[2]);
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.keyDown(trigger, { key: "Enter" });
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.keyDown(trigger, { key: " " });
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(trigger);
  fireEvent.click(trigger);
  assert.equal(screen.queryByRole("menu"), null);
});

test("Tooltip shows on hover and focus and describes its child", () => {
  render(<Tooltip content="More info" placement="bottom"><button type="button">?</button></Tooltip>);
  const button = screen.getByRole("button", { name: "?" });
  const bubble = screen.getByRole("tooltip");
  assert.equal(button.getAttribute("aria-describedby"), bubble.id);
  assert.equal(bubble.className.includes("elea-tooltip__bubble--visible"), false);
  fireEvent.mouseEnter(button);
  assert.ok(bubble.className.includes("elea-tooltip__bubble--visible"));
  fireEvent.mouseLeave(button);
  assert.equal(bubble.className.includes("elea-tooltip__bubble--visible"), false);
  fireEvent.focus(button);
  assert.ok(bubble.className.includes("elea-tooltip__bubble--bottom"));
  fireEvent.blur(button);
  assert.equal(bubble.className.includes("elea-tooltip__bubble--visible"), false);
});

test("Pagination range and rendering", () => {
  assert.deepEqual(paginationRange(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(paginationRange(1, 20), [1, 2, 3, 4, 5, 6, null, 20]);
  assert.deepEqual(paginationRange(10, 20), [1, null, 8, 9, 10, 11, 12, null, 20]);
  assert.deepEqual(paginationRange(20, 20), [1, null, 15, 16, 17, 18, 19, 20]);
  const pages: number[] = [];
  const labels = { navigation: "Pages", previous: "Previous", next: "Next", page: "Page {page}", summary: "{from}–{to} of {total}" };
  const { rerender } = render(<Pagination page={3} pageCount={10} onPageChange={(page) => pages.push(page)} labels={labels} totalItems={95} pageSize={10} />);
  const nav = screen.getByRole("navigation", { name: "Pages" });
  assert.equal(within(nav).getByText("21–30 of 95").className, "elea-pagination__summary");
  assert.equal(within(nav).getByRole("button", { name: "Page 3" }).getAttribute("aria-current"), "page");
  fireEvent.click(within(nav).getByRole("button", { name: "Next" }));
  fireEvent.click(within(nav).getByRole("button", { name: "Previous" }));
  fireEvent.click(within(nav).getByRole("button", { name: "Page 10" }));
  assert.deepEqual(pages, [4, 2, 10]);
  rerender(<Pagination page={1} pageCount={1} onPageChange={() => {}} labels={labels} />);
  assert.equal(screen.queryByRole("navigation"), null);
  rerender(<Pagination page={1} pageCount={1} onPageChange={() => {}} labels={labels} totalItems={3} pageSize={10} />);
  assert.ok(screen.getByText("1–3 of 3"));
  assert.equal(screen.queryByRole("list"), null);
  rerender(<Pagination page={1} pageCount={2} onPageChange={() => {}} labels={labels} />);
  assert.equal((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled, true);
});

test("the primitives render on the server and pass an axe audit", async () => {
  const markup = renderToStaticMarkup(<Button>Server</Button>);
  assert.equal(markup, '<button class="elea-button elea-button--primary elea-button--md" type="button"><span class="elea-button__label">Server</span></button>');
  const problems = await violations(
    <main>
      <Button icon={<i>i</i>}>Save</Button>
      <IconButton label="Close">x</IconButton>
      <Badge tone="primary">New</Badge>
      <Field label="Email" help="We never share it" error="Invalid">{(control) => <Input {...control} type="email" />}</Field>
      <Checkbox label="Agree" />
      <Toggle checked onCheckedChange={() => {}} label="On" />
      <Tooltip content="Hint"><button type="button">Hover</button></Tooltip>
      <Pagination page={2} pageCount={4} onPageChange={() => {}} labels={{ navigation: "Pages", previous: "Previous", next: "Next", page: "Page {page}" }} />
      <Menu label="Actions" items={[{ id: "a", label: "A", onSelect: () => {} }]} trigger={(props) => <button type="button" {...props}>More</button>} />
    </main>,
  );
  assert.deepEqual(problems, []);
  act(() => {});
});

test("Select picks with the mouse and the keyboard, jumps by typing, and lists a checklist when multiple", async () => {
  const picked: string[] = [];
  const options = [{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "de", label: "Deutsch", disabled: true }, { value: "es", label: "Español" }];
  const { container, rerender } = render(<Select label="Language" value="en" onChange={(value) => picked.push(value)} options={options} name="lang" placeholder="Pick" />);
  const trigger = screen.getByRole("combobox", { name: "Language" });
  assert.equal(trigger.textContent, "English");
  assert.equal((container.querySelector("input[name=lang]") as HTMLInputElement).value, "en");
  fireEvent.click(trigger);
  const list = screen.getByRole("listbox", { name: "Language" });
  assert.equal(within(list).getAllByRole("option").length, 4);
  assert.equal(within(list).getByRole("option", { name: "English" }).getAttribute("aria-selected"), "true");
  fireEvent.click(within(list).getByRole("option", { name: "Français" }));
  assert.deepEqual(picked, ["fr"]);
  assert.equal(screen.queryByRole("listbox"), null);
  // Keyboard: open on the current value, move past the disabled option, pick with Enter
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  assert.equal(trigger.getAttribute("aria-activedescendant"), screen.getByRole("option", { name: "Español" }).id);
  fireEvent.keyDown(trigger, { key: "Enter" });
  assert.deepEqual(picked, ["fr", "es"]);
  fireEvent.keyDown(trigger, { key: " " });
  fireEvent.keyDown(trigger, { key: "End" });
  fireEvent.keyDown(trigger, { key: "Home" });
  assert.equal(trigger.getAttribute("aria-activedescendant"), screen.getByRole("option", { name: "Français" }).id);
  fireEvent.keyDown(trigger, { key: "Escape" });
  assert.equal(screen.queryByRole("listbox"), null);
  // Typing on the closed control picks straight away
  fireEvent.keyDown(trigger, { key: "e" });
  assert.equal(picked.at(-1), "en");
  // A click outside closes
  fireEvent.click(trigger);
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.deepEqual((await axe.run(container)).violations, []);
  rerender(<Select label="Language" value={null} onChange={() => {}} options={options} placeholder="Pick" disabled />);
  assert.equal(screen.getByRole("combobox", { name: "Language" }).textContent, "Pick");
  fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
  assert.equal(screen.queryByRole("listbox"), null);
  cleanup();

  const values: string[][] = [];
  const { container: multi } = render(<Select multiple label="Days" value={["mon"]} onChange={(next) => values.push(next)} options={[{ value: "mon", label: "Monday" }, { value: "tue", label: "Tuesday" }]} summary={(selected) => `${selected.length} day(s)`} />);
  const days = screen.getByRole("combobox", { name: "Days" });
  assert.equal(days.textContent, "1 day(s)");
  fireEvent.click(days);
  assert.equal(screen.getByRole("listbox").getAttribute("aria-multiselectable"), "true");
  fireEvent.click(screen.getByRole("option", { name: "Tuesday" }));
  assert.deepEqual(values.at(-1), ["mon", "tue"]);
  // The list stays open for more picks; picking again unticks
  fireEvent.click(screen.getByRole("option", { name: "Monday" }));
  assert.deepEqual(values.at(-1), []);
  assert.deepEqual((await axe.run(multi)).violations, []);
});
