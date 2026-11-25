import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { Button } from "./Button.js";
import { ConfirmDialog, Dialog } from "./Dialog.js";
import { Input } from "./Field.js";
import { Popover } from "./Popover.js";
import { Select } from "./Select.js";
import { Sheet } from "./Sheet.js";

afterEach(cleanup);

test("Popover opens from its trigger, takes the focus and gives it back on Escape", () => {
  const changes: boolean[] = [];
  render(
    <>
      <Popover label="Share" side="top" align="end" className="mine" onOpenChange={(open) => changes.push(open)} trigger={(props) => <button type="button" {...props}>Share</button>}>
        <Input aria-label="Email" />
      </Popover>
      <button type="button">Elsewhere</button>
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Share" });
  assert.equal(trigger.getAttribute("aria-haspopup"), "dialog");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.keyDown(trigger, { key: "Escape" });
  assert.deepEqual(changes, [], "Escape does nothing while the popover is closed");
  fireEvent.click(trigger);
  const panel = screen.getByRole("dialog", { name: "Share" });
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.getAttribute("aria-controls"), panel.id);
  assert.equal(panel.getAttribute("aria-modal"), null);
  assert.equal(panel.className, "elea-popover__panel elea-popover__panel--top elea-popover__panel--end");
  assert.equal(panel.parentElement?.className, "elea-popover mine");
  assert.ok(document.activeElement === screen.getByRole("textbox", { name: "Email" }), "the first control takes the focus");
  fireEvent.keyDown(panel, { key: "a" });
  assert.ok(screen.getByRole("dialog"));
  fireEvent.keyDown(panel, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.ok(document.activeElement === trigger, "focus returns to the trigger");
  fireEvent.click(trigger);
  fireEvent.click(trigger);
  assert.equal(screen.queryByRole("dialog"), null, "the trigger closes an open popover");
  assert.deepEqual(changes, [true, false, true, false]);
});

test("Popover closes on an outside press and when the focus moves away", () => {
  render(
    <>
      <Popover label="Details" trigger={(props) => <button type="button" {...props}>Details</button>}>
        <p>Published on Monday.</p>
      </Popover>
      <button type="button">Elsewhere</button>
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
  fireEvent.click(trigger);
  const panel = screen.getByRole("dialog", { name: "Details" });
  assert.equal(panel.className, "elea-popover__panel elea-popover__panel--bottom elea-popover__panel--start");
  assert.ok(document.activeElement === panel, "without a control the panel itself takes the focus");
  fireEvent.mouseDown(panel);
  assert.ok(screen.getByRole("dialog"), "a press inside keeps it open");
  fireEvent.blur(panel, { relatedTarget: trigger });
  fireEvent.blur(panel, { relatedTarget: null });
  assert.ok(screen.getByRole("dialog"), "focus staying inside, or going nowhere, keeps it open");
  fireEvent.mouseDown(elsewhere);
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.click(trigger);
  fireEvent.blur(screen.getByRole("dialog"), { relatedTarget: elsewhere });
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.blur(trigger, { relatedTarget: elsewhere });
});

test("Popover can be controlled and closed from its content", () => {
  const changes: boolean[] = [];
  function Host() {
    const [open, setOpen] = useState(true);
    return (
      <Popover label="Filters" align="center" open={open} onOpenChange={(next) => { changes.push(next); setOpen(next); }} trigger={(props) => <button type="button" {...props}>Filters</button>}>
        {({ close }) => <button type="button" onClick={close}>Apply</button>}
      </Popover>
    );
  }
  render(<Host />);
  const apply = screen.getByRole("button", { name: "Apply" });
  assert.ok(document.activeElement === apply);
  assert.ok(screen.getByRole("dialog").className.includes("elea-popover__panel--center"));
  fireEvent.click(apply);
  assert.equal(screen.queryByRole("dialog"), null);
  assert.ok(document.activeElement === screen.getByRole("button", { name: "Filters" }));
  assert.deepEqual(changes, [false]);
  cleanup();
  render(<Popover label="Stuck" open trigger={(props) => <button type="button" {...props}>Stuck</button>}>Still here</Popover>);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  assert.ok(screen.getByRole("dialog"), "a controlled popover stays open until its owner closes it");
});

test("Escape in a Popover leaves the Dialog around it open", () => {
  const closes: number[] = [];
  render(
    <Dialog open onClose={() => closes.push(1)} title="Edit" closeLabel="Close">
      <Popover label="Help" trigger={(props) => <button type="button" {...props}>Help</button>}>Use a short title.</Popover>
    </Dialog>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Help" }));
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Help" }), { key: "Escape" });
  assert.equal(screen.queryByRole("dialog", { name: "Help" }), null);
  assert.deepEqual(closes, []);
  fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
  assert.deepEqual(closes, [1]);
});

test("Sheet docks a modal panel to an edge and behaves as a dialog", () => {
  const closes: number[] = [];
  function Host() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>open</button>
        <Sheet open={open} onClose={() => { closes.push(1); setOpen(false); }} title="Filters" description="Narrow the list." closeLabel="Close" actions={<Button>Apply</Button>}>
          <Input aria-label="Author" />
        </Sheet>
      </>
    );
  }
  render(<Host />);
  const opener = screen.getByRole("button", { name: "open" });
  opener.focus();
  fireEvent.click(opener);
  const sheet = screen.getByRole("dialog", { name: "Filters" });
  assert.equal(sheet.getAttribute("aria-modal"), "true");
  assert.equal(sheet.className, "elea-sheet elea-sheet--end elea-sheet--md");
  assert.equal(sheet.parentElement?.className, "elea-sheet-backdrop elea-sheet-backdrop--end");
  assert.equal(sheet.parentElement?.parentElement, document.body);
  assert.equal(screen.getByText("Narrow the list.").id, sheet.getAttribute("aria-describedby"));
  assert.ok(document.activeElement === within(sheet).getByRole("button", { name: "Close" }));
  assert.equal(document.body.style.overflow, "hidden");
  within(sheet).getByRole("button", { name: "Apply" }).focus();
  fireEvent.keyDown(document, { key: "Tab" });
  assert.ok(document.activeElement === within(sheet).getByRole("button", { name: "Close" }), "Tab wraps to the first");
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.ok(document.activeElement === opener, "focus returns to the opener");
  assert.equal(document.body.style.overflow, "");
  fireEvent.click(opener);
  fireEvent.mouseDown(screen.getByRole("dialog"));
  assert.ok(screen.getByRole("dialog"));
  fireEvent.mouseDown(document.querySelector(".elea-sheet-backdrop") as HTMLElement);
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.click(opener);
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
  assert.equal(screen.queryByRole("dialog"), null);
  assert.deepEqual(closes, [1, 1, 1]);
});

test("Sheet takes a side, a size and its own motion, and can ignore the backdrop", () => {
  render(<Sheet open onClose={() => assert.fail("the backdrop is inert")} title="Details" closeLabel="Close" side="bottom" size="lg" motion dismissOnBackdrop={false} className="mine" />);
  const sheet = screen.getByRole("dialog", { name: "Details" });
  assert.equal(sheet.className, "elea-sheet elea-sheet--bottom elea-sheet--lg mine");
  assert.equal(sheet.getAttribute("aria-describedby"), null);
  assert.equal(sheet.querySelector(".elea-sheet__actions"), null);
  const backdrop = sheet.parentElement as HTMLElement;
  assert.equal(backdrop.className, "elea-sheet-backdrop elea-sheet-backdrop--bottom");
  assert.equal(backdrop.getAttribute("data-elea-motion"), "on");
  fireEvent.mouseDown(backdrop);
  assert.ok(screen.getByRole("dialog"));
});

test("the overlays render on the server and pass an axe audit", async () => {
  const page = (
    <main>
      <h1>Articles</h1>
      <Popover label="Share" defaultOpen trigger={(props) => <button type="button" {...props}>Share</button>}>
        <Input aria-label="Email" />
      </Popover>
      <Popover label="Closed" trigger={(props) => <button type="button" {...props}>Closed</button>}>Hidden</Popover>
      <Sheet open onClose={() => {}} title="Filters" description="Narrow the list." closeLabel="Close" side="start" size="sm" actions={<Button>Apply</Button>}>
        <Input aria-label="Author" />
      </Sheet>
    </main>
  );
  const html = renderToStaticMarkup(page);
  assert.match(html, /role="dialog" aria-label="Share"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /elea-sheet/);
  render(page);
  assert.ok(screen.getByRole("dialog", { name: "Filters" }).className.includes("elea-sheet--start elea-sheet--sm"));
  const results = await axe.run(document.body, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false } } });
  assert.deepEqual(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`), []);
});

test("Escape closes the foremost modal alone, and a list open inside it first", () => {
  const closes: string[] = [];
  function Host() {
    const [asking, setAsking] = useState(true);
    return (
      <Sheet open onClose={() => closes.push("sheet")} title="Record" closeLabel="Close">
        <Select label="Status" options={[{ value: "a", label: "Active" }, { value: "b", label: "Archived" }]} value="a" onChange={() => {}} />
        <ConfirmDialog open={asking} title="Discard the changes?" confirmLabel="Discard" cancelLabel="Keep" closeLabel="Close" onConfirm={() => {}} onCancel={() => { closes.push("confirm"); setAsking(false); }} />
      </Sheet>
    );
  }
  render(<Host />);
  // Tab belongs to the confirmation too: it cycles there, not in the sheet under it
  const confirm = screen.getByRole("dialog", { name: "Discard the changes?" });
  const discard = within(confirm).getByRole("button", { name: "Discard" });
  discard.focus();
  fireEvent.keyDown(discard, { key: "Tab" });
  assert.ok(document.activeElement === within(confirm).getByRole("button", { name: "Close" }));
  fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
  assert.deepEqual(closes, ["confirm"]);
  assert.equal(screen.queryByRole("dialog", { name: "Discard the changes?" }), null);
  assert.ok(screen.getByRole("dialog", { name: "Record" }));

  const select = screen.getByRole("combobox", { name: "Status" });
  select.focus();
  fireEvent.keyDown(select, { key: "ArrowDown" });
  assert.equal(select.getAttribute("aria-expanded"), "true");
  fireEvent.keyDown(select, { key: "Escape" });
  assert.equal(select.getAttribute("aria-expanded"), "false");
  assert.deepEqual(closes, ["confirm"]);
  fireEvent.keyDown(select, { key: "Escape" });
  assert.deepEqual(closes, ["confirm", "sheet"]);
});
