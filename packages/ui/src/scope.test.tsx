import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Dialog } from "./Dialog.js";
import { scopeOf } from "./scope.js";
import { Sheet } from "./Sheet.js";
import { ToastProvider } from "./Toast.js";

afterEach(cleanup);

test("scopeOf reads the nearest theme and the nearest motion switch, and nothing without an element", () => {
  render(
    <div data-elea-theme="outer" data-elea-motion="on">
      <div data-elea-theme="journal"><span data-testid="inside" /></div>
    </div>,
  );
  assert.deepEqual(scopeOf(screen.getByTestId("inside")), { "data-elea-theme": "journal", "data-elea-appearance": undefined, "data-elea-motion": "on" });
  assert.deepEqual(scopeOf(document.body), { "data-elea-theme": undefined, "data-elea-appearance": undefined, "data-elea-motion": undefined });
  assert.deepEqual(scopeOf(null), { "data-elea-theme": undefined, "data-elea-appearance": undefined, "data-elea-motion": undefined });
});

test("a dialog opened from a themed container carries its theme and its motion out of it", () => {
  render(
    <div data-elea-theme="journal" data-elea-motion="on" data-testid="themed">
      <Dialog open onClose={() => {}} title="Rename" closeLabel="Close">Body</Dialog>
    </div>,
  );
  const backdrop = screen.getByRole("dialog").closest(".elea-dialog-backdrop")!;
  assert.equal(screen.getByTestId("themed").contains(backdrop), false);
  assert.equal(backdrop.getAttribute("data-elea-theme"), "journal");
  assert.equal(backdrop.getAttribute("data-elea-motion"), "on");
});

test("a dialog reads its container when it opens, so a theme set since it was mounted is the one it takes", () => {
  const view = (theme: string, open: boolean) => (
    <div data-elea-theme={theme}>
      <Dialog open={open} onClose={() => {}} title="Rename" closeLabel="Close">Body</Dialog>
    </div>
  );
  const { rerender } = render(view("journal", false));
  assert.equal(screen.queryByRole("dialog"), null);
  rerender(view("editorial", false));
  rerender(view("editorial", true));
  assert.equal(screen.getByRole("dialog").parentElement?.getAttribute("data-elea-theme"), "editorial");
});

test("the motion prop of a surface wins over the container, and a page without a theme adds no attribute", () => {
  render(
    <div data-elea-motion="on">
      <Sheet open onClose={() => {}} title="Filters" closeLabel="Close" motion={false}>Body</Sheet>
    </div>,
  );
  const backdrop = screen.getByRole("dialog").closest(".elea-sheet-backdrop")!;
  assert.equal(backdrop.getAttribute("data-elea-motion"), "off");
  assert.equal(backdrop.hasAttribute("data-elea-theme"), false);
});

test("toasts take the theme of the place their provider is rendered at, or the one it is given", () => {
  const { unmount } = render(
    <div data-elea-theme="journal">
      <ToastProvider label="Notifications" dismissLabel="Dismiss"><p>App</p></ToastProvider>
    </div>,
  );
  assert.equal(document.querySelector(".elea-toasts")?.getAttribute("data-elea-theme"), "journal");
  unmount();
  render(
    <ToastProvider label="Notifications" dismissLabel="Dismiss" theme="editorial">
      <div data-elea-theme="journal"><p>App</p></div>
    </ToastProvider>,
  );
  assert.equal(document.querySelector(".elea-toasts")?.getAttribute("data-elea-theme"), "editorial");
});

test("a nested sheet and its host's notifications keep independent portal scopes", () => {
  render(
    <div data-elea-theme="outer" data-elea-motion="on">
      <ToastProvider label="Host notifications" dismissLabel="Dismiss">
        <aside data-elea-theme="inner" data-elea-motion="off">
          <Sheet open title="Details" closeLabel="Close" onClose={() => {}}>Record</Sheet>
        </aside>
      </ToastProvider>
    </div>,
  );
  const sheet = screen.getByRole("dialog", { name: "Details" });
  const notifications = screen.getByRole("region", { name: "Host notifications" });
  assert.deepEqual(scopeOf(sheet), { "data-elea-theme": "inner", "data-elea-appearance": undefined, "data-elea-motion": "off" });
  assert.deepEqual(scopeOf(notifications), { "data-elea-theme": "outer", "data-elea-appearance": undefined, "data-elea-motion": "on" });
  assert.deepEqual(scopeOf(document.body), { "data-elea-theme": undefined, "data-elea-appearance": undefined, "data-elea-motion": undefined });
});

test("open portals follow changes to the nearest appearance without changing the theme or motion", async () => {
  const { container } = render(
    <div data-elea-appearance="light" data-elea-theme="journal" data-elea-motion="on">
      <aside data-elea-appearance="dark" data-testid="local">
        <ToastProvider label="Local notices" dismissLabel="Dismiss">
          <Sheet open title="Details" closeLabel="Close" onClose={() => {}}>Record</Sheet>
        </ToastProvider>
      </aside>
    </div>,
  );
  const sheet = screen.getByRole("dialog", { name: "Details" });
  const notices = screen.getByRole("region", { name: "Local notices" });
  const local = screen.getByTestId("local");
  assert.equal(scopeOf(sheet)["data-elea-appearance"], "dark");
  assert.equal(scopeOf(notices)["data-elea-appearance"], "dark");
  await act(async () => local.setAttribute("data-elea-appearance", "auto"));
  assert.equal(scopeOf(sheet)["data-elea-appearance"], "auto");
  await act(async () => local.setAttribute("data-elea-appearance", "inherit"));
  assert.deepEqual(scopeOf(sheet), {
    "data-elea-theme": "journal", "data-elea-appearance": "light", "data-elea-motion": "on",
  });
  assert.equal(scopeOf(notices)["data-elea-appearance"], "light");
  assert.equal(container.firstElementChild?.getAttribute("data-elea-appearance"), "light");
});
