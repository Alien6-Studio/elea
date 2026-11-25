import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import axe from "axe-core";
import { DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "./Dialog.js";
import { MenuContent, MenuGroup, MenuItem, MenuRoot, MenuSeparator, MenuTrigger } from "./Menu.js";
import { SheetRoot } from "./Sheet.js";
import { Tab, TabList, TabPanel, TabsRoot } from "./Tabs.js";

afterEach(cleanup);

async function violations(node: Element) {
  const results = await axe.run(node, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  return results.violations.map((violation) => violation.id);
}

test("composed tabs keep the list and the panels apart, with free tab content", async () => {
  const changes: string[] = [];
  const { container } = render(
    <TabsRoot defaultValue="open issues" onChange={(next) => changes.push(next)} className="mine">
      <header>
        <TabList label="Issues" className="row">
          <Tab value="open issues">Open <span>12</span></Tab>
          <Tab value="closed" data-testid="closed">Closed</Tab>
          <Tab value="archived" disabled>Archived</Tab>
        </TabList>
      </header>
      <main>
        <TabPanel value="open issues">Open list</TabPanel>
        <TabPanel value="closed" keepMounted><input aria-label="Filter" /></TabPanel>
        <TabPanel value="archived" className="quiet">Archived list</TabPanel>
      </main>
    </TabsRoot>,
  );
  assert.equal(container.firstElementChild?.className, "elea-tabs mine");
  assert.equal(screen.getByRole("tablist", { name: "Issues" }).className, "elea-tabs__list row");
  const open = screen.getByRole("tab", { name: "Open 12", selected: true });
  const closed = screen.getByTestId("closed");
  assert.doesNotMatch(open.id, /\s/, "a value with a space still makes one ID");
  assert.equal(screen.getByRole("tabpanel", { name: "Open 12" }).id, open.getAttribute("aria-controls"));
  assert.equal(screen.queryByText("Archived list"), null);
  assert.ok(container.querySelector(".quiet[hidden]"));
  const filter = screen.getByLabelText("Filter") as HTMLInputElement;
  assert.ok(filter.closest("[hidden]"), "a kept panel stays mounted while hidden");
  assert.deepEqual(await violations(container), []);

  fireEvent.change(filter, { target: { value: "bug" } });
  open.focus();
  fireEvent.keyDown(within(open).getByText("12"), { key: "ArrowRight" });
  assert.equal(document.activeElement, closed);
  assert.equal(closed.getAttribute("aria-selected"), "true");
  assert.equal(filter.closest("[hidden]"), null);
  assert.equal(filter.value, "bug");
  fireEvent.keyDown(closed, { key: "ArrowRight" });
  assert.equal(document.activeElement, open, "the disabled tab is skipped");
  fireEvent.keyDown(open, { key: "End" });
  fireEvent.keyDown(closed, { key: "Home" });
  fireEvent.keyDown(open, { key: "ArrowRight", ctrlKey: true });
  fireEvent.keyDown(open, { key: "a" });
  fireEvent.click(open);
  assert.deepEqual(changes, ["closed", "open issues", "closed", "open issues"]);
});

test("composed tabs follow the host's value and start empty without one", () => {
  function Controlled() {
    const [value, setValue] = useState("a");
    return (
      <TabsRoot value={value} onChange={setValue}>
        <TabList label="Letters"><Tab value="a">A</Tab><Tab value="b">B</Tab></TabList>
        <TabPanel value="a">Alpha</TabPanel>
        <TabPanel value="b">Beta</TabPanel>
      </TabsRoot>
    );
  }
  const { unmount } = render(<Controlled />);
  fireEvent.click(screen.getByRole("tab", { name: "B" }));
  assert.equal(screen.getByRole("tabpanel", { name: "B" }).textContent, "Beta");
  unmount();

  render(
    <TabsRoot>
      <TabList label="Letters"><Tab value="a">A</Tab></TabList>
      <TabPanel value="a">Alpha</TabPanel>
    </TabsRoot>,
  );
  assert.equal(screen.queryByRole("tab", { selected: true }), null);
  assert.equal(screen.queryByText("Alpha"), null);
  fireEvent.click(screen.getByRole("tab", { name: "A" }));
  assert.equal(screen.getByRole("tabpanel", { name: "A" }).textContent, "Alpha");
});

test("a part outside its root says which root it needs", () => {
  const silenced = console.error;
  console.error = () => {};
  try {
    assert.throws(() => renderToString(<Tab value="a">A</Tab>), /inside <TabsRoot>/);
    assert.throws(() => renderToString(<MenuItem onSelect={() => {}}>A</MenuItem>), /inside <MenuRoot>/);
    assert.throws(() => renderToString(<DialogTitle>A</DialogTitle>), /inside <DialogRoot> or <SheetRoot>/);
  } finally {
    console.error = silenced;
  }
});

test("a composed menu takes separators and groups, and moves across them", async () => {
  const chosen: string[] = [];
  const { container } = render(
    <MenuRoot className="mine">
      <MenuTrigger>{(props) => <button type="button" {...props}>Actions</button>}</MenuTrigger>
      <MenuContent label="Actions" align="end" className="wide">
        <MenuItem onSelect={() => chosen.push("rename")} icon="✎">Rename</MenuItem>
        <MenuSeparator />
        <MenuGroup label="Share">
          <MenuItem onSelect={() => chosen.push("link")} className="link">Copy link</MenuItem>
          <MenuItem onSelect={() => chosen.push("mail")} disabled>Send by mail</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem onSelect={() => chosen.push("delete")} danger>Delete</MenuItem>
      </MenuContent>
    </MenuRoot>,
  );
  const trigger = screen.getByRole("button", { name: "Actions" });
  assert.equal(container.firstElementChild?.className, "elea-menu mine");
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(trigger);
  const menu = screen.getByRole("menu", { name: "Actions" });
  assert.equal(menu.className, "elea-menu__list elea-menu__list--end wide");
  assert.equal(trigger.getAttribute("aria-controls"), menu.id);
  assert.equal(within(menu).getAllByRole("separator").length, 2);
  const group = within(menu).getByRole("group", { name: "Share" });
  const rename = within(menu).getByRole("menuitem", { name: "Rename" });
  const link = within(group).getByRole("menuitem", { name: "Copy link" });
  const remove = within(menu).getByRole("menuitem", { name: "Delete" });
  assert.equal(link.className, "elea-menu__item link");
  assert.equal(remove.className, "elea-menu__item elea-menu__item--danger");
  assert.equal(document.activeElement, rename);
  assert.deepEqual(await violations(container), []);

  fireEvent.keyDown(rename, { key: "ArrowDown" });
  assert.equal(document.activeElement, link);
  fireEvent.keyDown(link, { key: "ArrowDown" });
  assert.equal(document.activeElement, remove, "the disabled item of the group is skipped");
  fireEvent.keyDown(remove, { key: "ArrowDown" });
  assert.equal(document.activeElement, rename);
  fireEvent.keyDown(rename, { key: "ArrowUp" });
  assert.equal(document.activeElement, remove);
  fireEvent.keyDown(remove, { key: "a" });
  assert.equal(document.activeElement, remove);
  fireEvent.mouseEnter(link);
  assert.equal(document.activeElement, link);
  fireEvent.click(link);
  assert.deepEqual(chosen, ["link"]);
  assert.equal(screen.queryByRole("menu"), null);
  assert.equal(document.activeElement, trigger);
});

test("a composed dialog is named and described by its parts", async () => {
  function Example({ described }: Readonly<{ described: boolean }>) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Open</button>
        <DialogRoot open={open} onClose={() => setOpen(false)} size="lg" className="mine">
          <DialogHeader className="head">
            <DialogTitle className="name">Invite people</DialogTitle>
            <DialogClose label="Close" className="x" />
          </DialogHeader>
          {described && <DialogDescription className="lead">They get an email.</DialogDescription>}
          <DialogBody className="scroll"><input aria-label="Email" /></DialogBody>
          <DialogFooter className="end"><button type="button">Send</button></DialogFooter>
        </DialogRoot>
      </>
    );
  }
  const { rerender } = render(<Example described />);
  const opener = screen.getByRole("button", { name: "Open" });
  opener.focus();
  fireEvent.click(opener);
  const dialog = screen.getByRole("dialog", { name: "Invite people" });
  assert.equal(dialog.className, "elea-dialog elea-dialog--lg mine");
  assert.equal(dialog.parentElement?.className, "elea-dialog-backdrop");
  const description = screen.getByText("They get an email.");
  assert.equal(description.className, "elea-dialog__description lead");
  assert.equal(dialog.getAttribute("aria-describedby"), description.id);
  assert.equal(dialog.querySelector(".elea-dialog__header.head > h2.elea-dialog__title.name")?.textContent, "Invite people");
  assert.ok(dialog.querySelector(".elea-dialog__body.scroll"));
  assert.ok(dialog.querySelector(".elea-dialog__actions.end"));
  const close = screen.getByRole("button", { name: "Close" });
  assert.equal(close.className, "elea-dialog__close x");
  assert.equal(document.activeElement, close);
  assert.deepEqual(await violations(document.body), []);

  rerender(<Example described={false} />);
  assert.equal(screen.getByRole("dialog").getAttribute("aria-describedby"), null, "a description that leaves takes its reference along");
  fireEvent.click(close);
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(document.activeElement, opener);
});

test("a composed sheet takes the dialog parts under its own classes", () => {
  let closed = 0;
  render(
    <SheetRoot open onClose={() => { closed += 1; }} side="start" size="sm" className="mine" dismissOnBackdrop={false} motion>
      <DialogHeader><DialogTitle>Filters</DialogTitle></DialogHeader>
      <DialogBody>Content</DialogBody>
      <DialogFooter><button type="button">Apply</button></DialogFooter>
    </SheetRoot>,
  );
  const sheet = screen.getByRole("dialog", { name: "Filters" });
  assert.equal(sheet.className, "elea-sheet elea-sheet--start elea-sheet--sm mine");
  assert.equal(sheet.parentElement?.className, "elea-sheet-backdrop elea-sheet-backdrop--start");
  assert.equal(sheet.parentElement?.dataset.eleaMotion, "on");
  assert.ok(sheet.querySelector(".elea-sheet__header > .elea-sheet__title"));
  assert.ok(sheet.querySelector(".elea-sheet__body"));
  assert.equal(document.activeElement, screen.getByRole("button", { name: "Apply" }), "without a close control the first action takes the focus");
  fireEvent.mouseDown(sheet.parentElement as Element);
  assert.equal(closed, 0);
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(closed, 1);
});
