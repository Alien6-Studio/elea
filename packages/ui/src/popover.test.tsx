import "./test/dom.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { ConfirmDialog } from "./Dialog.js";
import { Input } from "./Field.js";
import { ConfirmPopover, Popover, type PopoverAnchor } from "./Popover.js";

afterEach(cleanup);

const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

/** jsdom lays nothing out: every panel measures 200 by 100 in a 1024 by 768 viewport. */
function withLayout(run: () => void) {
  const proto = HTMLElement.prototype;
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get: () => 200 });
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get: () => 100 });
  try {
    run();
  } finally {
    Reflect.deleteProperty(proto, "offsetWidth");
    Reflect.deleteProperty(proto, "offsetHeight");
  }
}

const position = (panel: HTMLElement) => [panel.dataset.side, panel.style.left, panel.style.top];

test("Popover places its panel against a virtual anchor, flipped and shifted into the viewport", () => {
  withLayout(() => {
    const show = (anchor: PopoverAnchor, side?: "top" | "bottom", align?: "start" | "center" | "end") => {
      cleanup();
      render(<Popover label="Details" anchor={anchor} open side={side} align={align}>Published</Popover>);
      return position(screen.getByRole("dialog", { name: "Details" }));
    };
    const at = (left: number, top: number) => ({ getBoundingClientRect: () => rect(left, top, 40, 20) });
    assert.deepEqual(show(at(100, 100)), ["bottom", "100px", "128px"]);
    assert.deepEqual(show(at(100, 300), "top"), ["top", "100px", "192px"]);
    assert.deepEqual(show(at(100, 300), "bottom", "end"), ["bottom", "8px", "328px"], "the end of the anchor would push it out on the left");
    assert.deepEqual(show(at(400, 300), "bottom", "end"), ["bottom", "240px", "328px"]);
    assert.deepEqual(show(at(400, 300), "bottom", "center"), ["bottom", "320px", "328px"]);
    assert.deepEqual(show(at(100, 700)), ["top", "100px", "592px"], "no room below: it flips");
    assert.deepEqual(show(at(100, 40), "top"), ["bottom", "100px", "68px"], "no room above: it flips");
    assert.deepEqual(show(at(1000, 740)), ["top", "816px", "632px"], "the bottom right corner keeps it whole");
    document.documentElement.dir = "rtl";
    try {
      assert.deepEqual(show(at(400, 300)), ["bottom", "240px", "328px"], "start is the right edge in a right-to-left page");
    } finally {
      document.documentElement.removeAttribute("dir");
    }
  });
});

test("Popover enters the top layer where the Popover API exists", () => {
  const shown: Element[] = [];
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value(this: Element) { shown.push(this); } });
  try {
    render(<Popover label="Share" defaultOpen trigger={(props) => <button type="button" {...props}>Share</button>}>Link</Popover>);
    // jsdom hides what carries the attribute, since it never opens a popover itself.
    const panel = document.querySelector('[role="dialog"]') as HTMLElement;
    assert.equal(panel.getAttribute("popover"), "manual");
    fireEvent(window, new window.Event("resize"));
    assert.deepEqual(shown, [panel], "it is shown once, then only moved");
  } finally {
    Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
  }
});

test("Popover follows its anchor on scroll and resize, and closes when the anchor is out of sight", () => {
  withLayout(() => {
    const changes: boolean[] = [];
    let top = 100;
    render(
      <div data-testid="scroller">
        <button type="button">Row</button>
      </div>,
    );
    const scroller = screen.getByTestId("scroller");
    const row = screen.getByRole("button", { name: "Row" });
    scroller.getBoundingClientRect = () => rect(0, 50, 500, 300);
    row.getBoundingClientRect = () => rect(100, top, 40, 20);
    const { unmount } = render(<Popover label="Details" anchor={row} open onOpenChange={(open) => changes.push(open)}>Published</Popover>);
    const panel = screen.getByRole("dialog", { name: "Details" });
    assert.equal(panel.style.top, "128px");
    top = 200;
    fireEvent.scroll(scroller);
    assert.equal(panel.style.top, "228px");
    top = 240;
    fireEvent(window, new window.Event("resize"));
    assert.equal(panel.style.top, "268px");
    assert.deepEqual(changes, []);
    top = 20;
    fireEvent.scroll(scroller);
    assert.deepEqual(changes, [false], "the row scrolled out of its container");
    top = 900;
    fireEvent.scroll(document);
    assert.deepEqual(changes, [false, false], "the row left the viewport");
    top = 100;
    row.remove();
    fireEvent.scroll(document);
    assert.deepEqual(changes, [false, false, false], "the row left the page");
    unmount();
  });
});

test("Popover serves an external anchor without a wrapper, and returns the focus to it", () => {
  const changes: boolean[] = [];
  function Host() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
      <>
        <button type="button" onClick={(event) => setAnchor(event.currentTarget)}>Rename</button>
        <button type="button">Elsewhere</button>
        <section>
          <Popover label="Rename" className="mine" anchor={anchor} open={anchor !== null} onOpenChange={(open) => { changes.push(open); if (!open) setAnchor(null); }}>
            {({ close }) => <><Input aria-label="Name" /><button type="button" onClick={close}>Save</button></>}
          </Popover>
        </section>
      </>
    );
  }
  render(<Host />);
  const opener = screen.getByRole("button", { name: "Rename" });
  const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
  assert.equal(document.querySelector("section")?.childElementCount, 0, "nothing is rendered while it is closed");
  fireEvent.click(opener);
  const panel = screen.getByRole("dialog", { name: "Rename" });
  assert.equal(panel.className, "elea-popover__panel elea-popover__panel--bottom elea-popover__panel--start mine");
  assert.equal(panel.parentElement?.tagName, "SECTION", "the panel comes alone, where the host rendered it");
  assert.ok(document.activeElement === screen.getByRole("textbox", { name: "Name" }));
  fireEvent.mouseDown(opener);
  fireEvent.blur(panel, { relatedTarget: opener });
  assert.deepEqual(changes, [], "the anchor is not outside");
  fireEvent.keyDown(panel, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.ok(document.activeElement === opener, "Escape returns the focus to the anchor");
  fireEvent.click(opener);
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  assert.ok(document.activeElement === opener, "closing from the content does too");
  fireEvent.click(opener);
  act(() => elsewhere.focus());
  assert.equal(screen.queryByRole("dialog"), null);
  assert.ok(document.activeElement === elsewhere, "focus that moved on its own is left alone");
  fireEvent.click(opener);
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("dialog"), null);
  assert.deepEqual(changes, [false, false, false, false]);
});

test("a virtual anchor never takes the focus back", () => {
  function Host() {
    const [open, setOpen] = useState(true);
    return <Popover label="Here" anchor={{ getBoundingClientRect: () => rect(10, 10, 0, 0) }} open={open} onOpenChange={setOpen}><Input aria-label="Note" /></Popover>;
  }
  render(<Host />);
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Here" }), { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.ok(document.activeElement === document.body);
  cleanup();
  render(<Popover label="Nowhere" anchor={null} open>Hidden</Popover>);
  assert.equal(screen.queryByRole("dialog"), null, "open without an anchor shows nothing");
});

function Rows({ events, confirm = () => {}, loading = false }: Readonly<{ events: string[]; confirm?: (row: string) => void; loading?: boolean }>) {
  const [target, setTarget] = useState<{ row: string; anchor: HTMLElement } | null>(null);
  return (
    <>
      <ul>
        {["Ada", "Grace", "Linus"].map((row) => (
          <li key={row}>
            <button type="button" aria-haspopup="dialog" onClick={(event) => setTarget({ row, anchor: event.currentTarget })}>Delete {row}</button>
          </li>
        ))}
      </ul>
      <ConfirmPopover
        anchor={target?.anchor ?? null}
        open={target !== null}
        title={`Delete ${target?.row}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        icon={<svg />}
        loading={loading}
        onConfirm={() => { events.push(`confirm ${target?.row}`); confirm(target?.row ?? ""); }}
        onCancel={() => { events.push(`cancel ${target?.row}`); setTarget(null); }}
      />
    </>
  );
}

test("a click in a panel does not reach what is around the popover", () => {
  const reached: string[] = [];
  function Card() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [asked, setAsked] = useState<HTMLElement | null>(null);
    return (
      <div data-testid="card" onClick={() => reached.push("card")}>
        <button type="button" onClick={(event) => setAnchor(event.currentTarget)}>Rename</button>
        <button type="button" onClick={(event) => setAsked(event.currentTarget)}>Delete</button>
        <Popover label="Rename" anchor={anchor} open={anchor !== null} onOpenChange={() => setAnchor(null)}>
          <button type="button" onClick={() => reached.push("save")}>Save</button>
        </Popover>
        <Popover label="Details" trigger={(props) => <button type="button" {...props}>Details</button>}>
          <button type="button" onClick={() => reached.push("copy")}>Copy</button>
        </Popover>
        <ConfirmPopover anchor={asked} open={asked !== null} title="Delete?" confirmLabel="Yes" cancelLabel="No" onConfirm={() => reached.push("confirm")} onCancel={() => setAsked(null)} />
      </div>
    );
  }
  render(<Card />);
  fireEvent.click(screen.getByRole("button", { name: "Rename" }));
  assert.deepEqual(reached, ["card"], "a control of the host still reaches the card");
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  fireEvent.click(screen.getByRole("dialog", { name: "Rename" }));
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Rename" }), { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: "Details" }));
  fireEvent.click(screen.getByRole("button", { name: "Copy" }));
  fireEvent.click(screen.getByRole("dialog", { name: "Details" }));
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Details" }), { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  fireEvent.click(screen.getByRole("button", { name: "Yes" }));
  fireEvent.click(screen.getByRole("alertdialog"));
  assert.deepEqual(reached, ["card", "save", "card", "copy", "card", "confirm"], "the handlers inside the panels run, and the card only hears the three controls of the host");
});

test("one ConfirmPopover serves every row of a list, with the keyboard alone", () => {
  const events: string[] = [];
  render(<Rows events={events} />);
  assert.equal(screen.queryByRole("alertdialog"), null);
  const grace = screen.getByRole("button", { name: "Delete Grace" });
  const linus = screen.getByRole("button", { name: "Delete Linus" });
  grace.focus();
  fireEvent.click(grace);
  const panel = screen.getByRole("alertdialog", { name: "Delete Grace?" });
  assert.equal(panel.getAttribute("aria-modal"), "true");
  assert.equal(document.getElementById(panel.getAttribute("aria-describedby") ?? "")?.textContent, "This cannot be undone.");
  assert.equal(panel.querySelector(".elea-popover__icon")?.className, "elea-popover__icon elea-popover__icon--danger");
  assert.equal(panel.querySelector(".elea-popover__icon")?.getAttribute("aria-hidden"), "true");
  const keep = within(panel).getByRole("button", { name: "Keep" });
  const confirm = within(panel).getByRole("button", { name: "Delete" });
  assert.ok(confirm.className.includes("elea-button--danger"));
  assert.ok(document.activeElement === keep, "the cancel button takes the focus");
  assert.ok(fireEvent.keyDown(keep, { key: "Tab" }), "Tab moves on by itself inside the panel");
  confirm.focus();
  assert.equal(fireEvent.keyDown(confirm, { key: "Tab" }), false);
  assert.ok(document.activeElement === keep, "Tab wraps from the last button to the first");
  assert.equal(fireEvent.keyDown(keep, { key: "Tab", shiftKey: true }), false);
  assert.ok(document.activeElement === confirm, "and back");
  fireEvent.blur(panel, { relatedTarget: linus });
  assert.ok(screen.getByRole("alertdialog"), "focus moving away does not answer for the user");
  fireEvent.keyDown(confirm, { key: "Escape" });
  assert.equal(screen.queryByRole("alertdialog"), null);
  assert.ok(document.activeElement === grace, "Escape cancels and returns the focus to the row button");
  fireEvent.click(linus);
  assert.ok(screen.getByRole("alertdialog", { name: "Delete Linus?" }), "the same instance now serves another row");
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("alertdialog"), null);
  assert.ok(document.activeElement === linus, "an outside press cancels and returns the focus too");
  fireEvent.click(linus);
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep" }));
  assert.deepEqual(events, ["cancel Grace", "cancel Linus", "confirm Linus", "cancel Linus"]);
});

test("ConfirmPopover disables both buttons while loading and keeps the keyboard", () => {
  const events: string[] = [];
  const { rerender } = render(<Rows events={events} />);
  fireEvent.click(screen.getByRole("button", { name: "Delete Ada" }));
  rerender(<Rows events={events} loading />);
  const panel = screen.getByRole("alertdialog");
  const [keep, confirm] = within(panel).getAllByRole("button") as [HTMLButtonElement, HTMLButtonElement];
  assert.ok(keep.disabled && confirm.disabled);
  assert.equal(confirm.getAttribute("aria-busy"), "true", "the confirm button shows progress");
  assert.ok(document.activeElement === panel, "the panel holds the focus the disabled buttons dropped");
  assert.equal(fireEvent.keyDown(panel, { key: "Tab" }), false, "with nothing to reach, Tab stays");
  fireEvent.click(confirm);
  assert.deepEqual(events, []);
  fireEvent.keyDown(panel, { key: "Escape" });
  assert.deepEqual(events, ["cancel Ada"]);
});

test("ConfirmPopover takes each tone, and works without a description or an icon", async () => {
  for (const tone of ["primary", "success", "info"] as const) {
    cleanup();
    const anchor = document.body.appendChild(document.createElement("button"));
    anchor.textContent = "Publish";
    render(<main><ConfirmPopover anchor={anchor} open title="Publish?" confirmLabel="Publish" cancelLabel="Not yet" tone={tone} side="top" align="end" className="mine" onConfirm={() => {}} onCancel={() => {}} /></main>);
    const panel = screen.getByRole("alertdialog", { name: "Publish?" });
    assert.equal(panel.className, "elea-popover__panel elea-popover__panel--top elea-popover__panel--end mine");
    assert.equal(panel.getAttribute("aria-describedby"), null);
    assert.equal(panel.querySelector(".elea-popover__icon"), null);
    assert.ok(within(panel).getByRole("button", { name: "Publish" }).className.includes(`elea-button--${tone}`));
    const results = await axe.run(panel, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false } } });
    assert.deepEqual(results.violations.map((violation) => violation.id), []);
    anchor.remove();
  }
});

test("ConfirmDialog shares the tones and the icon of ConfirmPopover", () => {
  for (const tone of ["danger", "primary", "success", "info"] as const) {
    cleanup();
    render(<ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Archive?" closeLabel="Close" confirmLabel="Archive" cancelLabel="Keep" tone={tone} icon={<svg />} />);
    const dialog = screen.getByRole("dialog", { name: "Archive?" });
    assert.equal(dialog.querySelector(".elea-dialog__title > [aria-hidden]")?.className, `elea-dialog__icon elea-dialog__icon--${tone}`);
    assert.ok(within(dialog).getByRole("button", { name: "Archive" }).className.includes(`elea-button--${tone}`));
  }
  cleanup();
  render(<ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Archive?" closeLabel="Close" confirmLabel="Archive" cancelLabel="Keep" />);
  assert.equal(document.querySelector(".elea-dialog__icon"), null);
});

test("the popover sheet styles every tone and leaves the placement to the script", () => {
  const css = (name: string) => readFileSync(new URL(`./css/${name}.css`, import.meta.url), "utf8");
  assert.match(css("popover"), /\.elea-popover__panel \{[^}]*position: fixed;[^}]*inset: auto;[^}]*margin: 0;/);
  assert.doesNotMatch(css("popover"), /panel--(top|bottom|start|end|center)/);
  for (const tone of ["danger", "success", "info"]) {
    assert.ok(css("popover").includes(`.elea-popover__icon--${tone}`));
    assert.ok(css("dialog").includes(`.elea-dialog__icon--${tone}`));
  }
  for (const tone of ["success", "info"]) assert.ok(css("button").includes(`.elea-button--${tone} {`));
  // The info tone has its own colour everywhere, apart from the links.
  for (const name of ["alert", "badge", "progress"]) assert.ok(css(name).includes(`--elea-${name}-color: var(--elea-color-action-info-ink,`));
  assert.ok(css("toast").includes("--elea-toast-color: var(--elea-color-action-info-on-container, var(--elea-color-info));"));
  assert.ok(css("button").includes("background: var(--elea-color-action-info, var(--_elea-button-status));"));
});
