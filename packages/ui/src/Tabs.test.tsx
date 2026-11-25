import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Tabs, type TabItem } from "./Tabs.js";

afterEach(cleanup);

const formats = [
  { value: "preview", label: "Preview", panel: <input aria-label="Title" defaultValue="Draft" /> },
  { value: "html", label: "HTML", panel: "HTML source", disabled: true },
  { value: "json", label: "JSON", panel: "JSON source" },
] as const satisfies readonly TabItem[];

test("tabs move focus and selection together, wrap and skip disabled items", () => {
  const changes: string[] = [];
  render(<Tabs label="Format" items={formats} defaultValue="html" onChange={(next) => changes.push(next)} />);
  const preview = screen.getByRole("tab", { name: "Preview", selected: true });
  const json = screen.getByRole("tab", { name: "JSON" });
  assert.equal(preview.tabIndex, 0);
  assert.equal(json.tabIndex, -1);
  assert.equal((screen.getByRole("tab", { name: "HTML" }) as HTMLButtonElement).disabled, true);
  assert.equal(screen.queryByText("JSON source"), null);
  preview.focus();
  fireEvent.keyDown(preview, { key: "ArrowLeft" });
  assert.equal(document.activeElement, json);
  assert.equal(screen.getByRole("tabpanel", { name: "JSON" }).textContent, "JSON source");
  fireEvent.keyDown(json, { key: "ArrowRight" });
  assert.equal(document.activeElement, preview);
  fireEvent.keyDown(preview, { key: "End" });
  assert.equal(document.activeElement, json);
  fireEvent.keyDown(json, { key: "Home" });
  assert.equal(document.activeElement, preview);
  fireEvent.keyDown(preview, { key: "Tab" });
  fireEvent.keyDown(preview, { key: "ArrowRight", altKey: true });
  fireEvent.click(preview);
  assert.deepEqual(changes, ["json", "preview", "json", "preview"]);
});

test("controlled tabs reflect the host value and can retain an edited panel", () => {
  const changes: string[] = [];
  const onChange = (next: string) => changes.push(next);
  const { rerender } = render(<Tabs label="Format" items={formats} value="preview" keepMounted onChange={onChange} />);
  const title = screen.getByRole<HTMLInputElement>("textbox", { name: "Title" });
  fireEvent.change(title, { target: { value: "Edited" } });
  fireEvent.click(screen.getByRole("tab", { name: "JSON" }));
  assert.deepEqual(changes, ["json"]);
  assert.equal(screen.getByRole("tabpanel", { name: "Preview" }).id, screen.getByRole("tab", { name: "Preview" }).getAttribute("aria-controls"));
  rerender(<Tabs label="Format" items={formats} value="json" keepMounted onChange={onChange} />);
  assert.equal(screen.queryByRole("textbox"), null);
  rerender(<Tabs label="Format" items={formats} value="preview" keepMounted onChange={onChange} />);
  assert.equal(screen.getByRole("textbox", { name: "Title" }), title);
  assert.equal(title.value, "Edited");

  rerender(<Tabs label="Format" items={formats.map((item) => ({ ...item, disabled: true }))} />);
  assert.equal(screen.queryByRole("tabpanel"), null);
  assert.equal(screen.queryByRole("tab", { selected: true }), null);
  rerender(<Tabs label="Format" items={[]} />);
  assert.equal(screen.queryByRole("tablist"), null);
});

test("tabs retain selection when reordered and navigate in the visual direction in RTL", () => {
  const items = [
    { value: "draft", label: "Draft", panel: "Draft text" },
    { value: "review", label: "Review", panel: "Review text" },
    { value: "approved", label: "Approved", panel: "Approved text" },
  ] as const;
  const { rerender } = render(<Tabs label="Stage" items={items} />);
  rerender(<Tabs label="Stage" items={[items[2], items[0], items[1]]} />);
  const draft = screen.getByRole("tab", { name: "Draft", selected: true });
  // JSDOM computes the direction set on an element, without CSS inheritance.
  draft.style.direction = "rtl";
  fireEvent.keyDown(draft, { key: "ArrowLeft" });
  const review = screen.getByRole("tab", { name: "Review", selected: true });
  assert.equal(document.activeElement, review);
  review.style.direction = "rtl";
  fireEvent.keyDown(review, { key: "ArrowRight" });
  assert.equal(document.activeElement, draft);
  assert.equal(draft.getAttribute("aria-selected"), "true");
});

test("tab and panel IDs stay paired across server rendering and hydration", () => {
  const element = <><Tabs label="Format" items={formats} defaultValue="json" /><Tabs label="Compare" items={formats} /></>;
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  const ids = Array.from(container.querySelectorAll("[id]"), (node) => node.id);
  assert.equal(new Set(ids).size, ids.length);
  const errors: unknown[] = [];
  render(element, { container, hydrate: true, onRecoverableError: (error) => errors.push(error) });
  assert.deepEqual(Array.from(container.querySelectorAll("[id]"), (node) => node.id), ids);
  assert.deepEqual(errors, []);
  for (const tab of screen.getAllByRole("tab")) {
    const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
    assert.equal(panel?.getAttribute("aria-labelledby"), tab.id);
  }
  assert.equal(within(screen.getByRole("tablist", { name: "Format" })).getByRole("tab", { selected: true }).textContent, "JSON");
});

test("alternate presentations preserve the selection contract and render on the server", () => {
  for (const presentation of ["segmented", "rail"] as const) {
    const tabs = <Tabs label="Format" items={formats} presentation={presentation} />;
    assert.match(renderToString(tabs), new RegExp(`data-elea-tabs="${presentation}"`));
    const { unmount } = render(tabs);
    const list = screen.getByRole("tablist");
    assert.equal(list.getAttribute("data-elea-tabs"), presentation);
    const preview = within(list).getByRole("tab", { name: "Preview" });
    preview.focus();
    fireEvent.keyDown(preview, { key: "ArrowRight" });
    assert.equal(screen.getByRole("tabpanel", { name: "JSON" }).textContent, "JSON source");
    unmount();
  }
});
