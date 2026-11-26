import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Dialog } from "./Dialog.js";
import { Sheet } from "./Sheet.js";

afterEach(cleanup);

test("a closing dialog releases interaction immediately and discards a cancelled exit on reopen", async () => {
  function Example() {
    const [open, setOpen] = useState(false);
    return <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} motion onClose={() => setOpen(false)} title="Share" closeLabel="Close" />
    </>;
  }
  render(<Example />);
  const opener = screen.getByRole("button", { name: "Open" });
  opener.focus();
  fireEvent.click(opener);
  const backdrop = screen.getByRole("dialog").parentElement!;
  let finish!: () => void;
  let cancel!: () => void;
  backdrop.getAnimations = () => [{
    transitionProperty: "opacity", finished: new Promise<void>((resolve, reject) => { finish = resolve; cancel = reject; }),
  } as unknown as Animation];
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(document.activeElement, opener);
  assert.equal(document.body.style.overflow, "");
  assert.ok(backdrop.hasAttribute("inert"));
  fireEvent.click(opener);
  assert.equal(screen.getByRole("dialog").parentElement, backdrop);
  assert.equal(backdrop.hasAttribute("inert"), false);
  assert.equal(document.activeElement, screen.getByRole("button", { name: "Close" }));
  await act(async () => finish());
  assert.equal(screen.getByRole("dialog").parentElement, backdrop);
  fireEvent.keyDown(document, { key: "Escape" });
  await act(async () => cancel());
  assert.equal(backdrop.isConnected, false);
  assert.equal(document.activeElement, opener);
});

test("closing an underlying modal preserves the active modal's scroll lock and original focus target", () => {
  const modals = (first: boolean, second: boolean) => <>
    <button>Open first</button>
    <Dialog open={first} onClose={() => {}} title="First" closeLabel="Close first" />
    <Dialog open={second} onClose={() => {}} title="Second" closeLabel="Close second" />
  </>;
  const { rerender } = render(modals(false, false));
  const opener = screen.getByRole("button", { name: "Open first" });
  opener.focus();
  rerender(modals(true, false));
  rerender(modals(true, true));
  rerender(modals(false, true));
  assert.equal(document.activeElement, screen.getByRole("button", { name: "Close second" }));
  assert.equal(document.body.style.overflow, "hidden");
  rerender(modals(false, false));
  assert.equal(document.body.style.overflow, "");
  assert.equal(document.activeElement, opener);
});

test("an exiting sheet keeps the content and edge it last displayed", async () => {
  const sheet = (open: boolean) => <Sheet motion open={open} side={open ? "bottom" : "end"}
    title={open ? "Revisions" : ""} closeLabel="Close" onClose={() => {}}>{open ? "First draft" : null}</Sheet>;
  const { rerender } = render(sheet(true));
  const panel = screen.getByRole("dialog", { name: "Revisions" });
  const backdrop = panel.parentElement!;
  let finish!: () => void;
  backdrop.getAnimations = () => [{
    transitionProperty: "opacity", finished: new Promise<void>(resolve => { finish = resolve; }),
  } as unknown as Animation];
  rerender(sheet(false));
  assert.ok(backdrop.hasAttribute("inert"));
  assert.ok(backdrop.classList.contains("elea-sheet-backdrop--bottom"));
  assert.ok(panel.classList.contains("elea-sheet--bottom"));
  assert.match(panel.textContent!, /Revisions.*First draft/);
  await act(async () => finish());
  assert.equal(backdrop.isConnected, false);
});
