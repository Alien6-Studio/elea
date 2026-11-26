import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Breadcrumb } from "./Breadcrumb.js";

afterEach(cleanup);
const items = ["Archive", "Arts", "Print", "Issues", "March", "Proof"].map(label => ({ id: label, label, href: "/" + label }));
const props = { items, label: "Page trail", overflowLabel: "Earlier pages" };

test("the trail exposes ordered ancestors and one current page, including in server output", () => {
  assert.equal(renderToStaticMarkup(<Breadcrumb {...props} items={[]} />), "");
  render(<Breadcrumb {...props} items={[{id: "library", label: "Library"}, ...items.slice(-2)]} separator="›" />);
  assert.equal(screen.getByRole("navigation", { name: "Page trail" }).querySelector("ol"), screen.getByRole("list"));
  assert.equal(screen.getAllByRole("listitem").length, 3);
  assert.equal(screen.getAllByRole("link").length, 1);
  assert.equal(screen.getByRole("link", { name: "March" }).getAttribute("href"), "/March");
  assert.equal(screen.getByText("Proof").getAttribute("aria-current"), "page");
  assert.ok(screen.getAllByText("›").every(node => node.getAttribute("aria-hidden") === "true"));
  assert.equal(screen.queryByRole("button"), null);
});

test("a long trail discloses intermediate ancestors in order and collapses on navigation", () => {
  const { rerender } = render(<Breadcrumb {...props} render={link => <a {...link} data-router="yes" />} />);
  const button = screen.getByRole("button", { name: "Earlier pages", expanded: false });
  assert.equal(screen.queryByRole("link", { name: "Arts" }), null);
  fireEvent.click(button);
  assert.equal(screen.getAllByRole("link").map(link => link.textContent).join("/"), "Archive/Arts/Print/Issues/March");
  assert.ok(screen.getAllByRole("link").every(link => link.dataset.router === "yes"));
  fireEvent.click(button);
  assert.equal(screen.queryByRole("link", { name: "Print" }), null);
  fireEvent.click(button);
  rerender(<Breadcrumb {...props} items={[...items, {id: "new", label: "New proof"}]} maxItems={1} />);
  assert.equal(screen.getAllByRole("link").length, 1);
  assert.ok(screen.getByRole("button", { expanded: false }));
});
