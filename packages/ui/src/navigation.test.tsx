import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Navbar } from "./Navbar.js";
import { Sidebar } from "./Sidebar.js";

afterEach(cleanup);

const items = [
  { id: "proofs", href: "#proofs", label: "Proofs", icon: <span>Print</span> },
  { id: "editions", href: "#editions", label: "Editions" },
];
const primary = { label: "Primary navigation", menuLabel: "Sections", items };
const groups = [
  { id: "guides", label: "Guides", items, collapsible: true, defaultExpanded: false },
  { id: "assets", label: "Assets", items: [{ id: "media", href: "#media", label: "Images" }] },
];

// jsdom has no container queries. In a browser this value comes from the Navbar stylesheet.
function setCompact(compact: boolean) {
  const row = screen.getByRole("navigation").firstElementChild as HTMLElement;
  row.style.setProperty("--_elea-navbar-compact", compact ? "1" : "0");
  fireEvent.resize(window);
}

test("Navbar renders a labelled landmark, current router link, brand and actions", () => {
  const ref = createRef<HTMLElement>();
  const markup = renderToStaticMarkup(<Navbar {...primary} />);
  assert.match(markup, /href="#editions"/);
  assert.doesNotMatch(markup, /class="elea-navbar__panel" hidden/);
  const { rerender } = render(<Navbar {...primary} ref={ref} className="masthead" current="proofs"
    render={link => <a {...link} data-router="yes" />} brand={<a href="#home">Home</a>} actions={<button>Account</button>} />);
  assert.equal(ref.current, screen.getByRole("navigation", { name: primary.label }));
  assert.ok(ref.current?.classList.contains("masthead"));
  assert.ok(screen.getByRole("link", { name: "Home" }));
  assert.ok(screen.getByRole("button", { name: "Account" }));
  assert.equal(screen.getByRole("link", { name: "Proofs", current: "page" }).dataset.router, "yes");
  assert.equal(screen.queryByRole("button", { name: "Sections" }), null);
  rerender(<Navbar {...primary} current="editions" />);
  assert.equal(screen.getByRole("link", { current: "page" }).textContent, "Editions");
});

test("the compact disclosure restores focus on Escape and ordinary navigation", () => {
  render(<Navbar {...primary} render={link => <a {...link} onClick={event => { event.preventDefault(); link.onClick?.(event); }} />} />);
  setCompact(true);
  const toggle = screen.getByRole("button", { name: "Sections", expanded: false });
  assert.ok(document.getElementById(toggle.getAttribute("aria-controls")!)?.hidden);
  assert.equal(screen.queryByRole("link"), null);
  fireEvent.click(toggle);
  const destination = screen.getByRole("link", { name: "Proofs" });
  destination.focus();
  fireEvent.keyDown(destination, { key: "Escape" });
  assert.equal(document.activeElement, toggle);
  assert.equal(screen.queryByRole("link"), null);
  fireEvent.click(toggle);
  fireEvent.click(destination, { ctrlKey: true });
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  fireEvent.click(destination);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, toggle);
});

test("Navbar preserves the focused destination when resizing and replaces a hidden toggle", async () => {
  render(<Navbar {...primary} />);
  const destination = screen.getByRole("link", { name: "Editions" });
  destination.focus();
  setCompact(true);
  const toggle = screen.getByRole("button", { expanded: true });
  assert.equal(document.activeElement, destination);
  fireEvent.click(toggle);
  toggle.focus();
  setCompact(false);
  await waitFor(() => assert.equal(document.activeElement, screen.getByRole("link", { name: "Proofs" })));
  assert.equal(screen.queryByRole("button"), null);
});

test("Sidebar exposes labelled lists, native disclosures, custom links and slots", () => {
  const ref = createRef<HTMLElement>();
  render(<Sidebar ref={ref} label="Library" groups={groups} current="editions"
    render={link => <a {...link} data-router="yes" />} header="Workspace" footer={<button>Sign out</button>} />);
  assert.equal(ref.current, screen.getByRole("navigation", { name: "Library" }));
  assert.ok(screen.getByText("Workspace"));
  assert.ok(screen.getByRole("button", { name: "Sign out" }));
  assert.ok(screen.getByRole("list", { name: "Assets" }));
  const section = screen.getByRole("list", { name: "Guides" }).closest("details");
  assert.equal(section?.open, true);
  assert.equal(screen.getByRole("link", { current: "page" }).dataset.router, "yes");
  assert.equal(screen.getByRole("link", { name: "Proofs" }).getAttribute("href"), "#proofs");
  assert.match(renderToStaticMarkup(<Sidebar label="Library" groups={groups} current="editions" />), /<details[^>]* open/);
});

test("Sidebar reveals external navigation while respecting manual group disclosure", () => {
  const { rerender } = render(<Sidebar label="Library" groups={groups} current="media" />);
  const summary = screen.getByText("Guides");
  const section = summary.closest("details")!;
  assert.equal(section.open, false);
  rerender(<Sidebar label="Library" groups={groups} current="proofs" />);
  assert.equal(section.open, true);
  fireEvent.click(summary);
  assert.equal(section.open, false);
  rerender(<Sidebar label="Library" groups={[...groups]} current="proofs" footer="Saved" />);
  assert.equal(section.open, false);
  rerender(<Sidebar label="Library" groups={groups} current="editions" />);
  assert.equal(section.open, true);
  assert.equal(screen.getByRole("link", { current: "page" }).textContent, "Editions");
});

const hierarchy = [
  { id: "collection", label: "Collection", href: "#collection", disclosureLabel: "Collection pages", children: [
    { id: "print", label: "Print", href: "#print", children: items },
  ] },
  { id: "authors", label: "Authors", href: "#authors", children: [
    { id: "biography", label: "Biography", href: "#biography" },
  ] },
];

test("Navbar separates a parent link from its disclosure and Escape closes the innermost group first", () => {
  render(<Navbar {...primary} items={hierarchy} persistentActions={<a href="#account">Account</a>} />);
  setCompact(true);
  assert.ok(screen.getByRole("link", { name: "Account" }));
  const menu = screen.getByRole("button", { name: "Sections" });
  fireEvent.click(menu);
  assert.equal(screen.getByRole("link", { name: "Collection" }).getAttribute("href"), "#collection");
  const collection = screen.getByLabelText("Collection pages", { selector: "summary" });
  fireEvent.click(collection);
  const print = screen.getByLabelText("Print", { selector: "summary" });
  fireEvent.click(print);
  const destination = screen.getByRole("link", { name: "Proofs" });
  destination.focus();
  fireEvent.keyDown(destination, { key: "Escape" });
  assert.equal(print.closest("details")?.open, false);
  assert.ok(document.activeElement === print);
  assert.equal(collection.closest("details")?.open, true);
  fireEvent.keyDown(print, { key: "Escape" });
  assert.ok(document.activeElement === collection);
  assert.equal(collection.closest("details")?.open, false);
  fireEvent.keyDown(collection, { key: "Escape" });
  assert.equal(menu.getAttribute("aria-expanded"), "false");
  assert.ok(document.activeElement === menu);
});

test("Navbar dismisses desktop sections on outside interaction and activated routes", () => {
  const { rerender } = render(<Navbar {...primary} items={hierarchy} collapse="never" />);
  setCompact(true);
  assert.equal(screen.queryByRole("button", { name: "Sections" }), null);
  const summary = screen.getByLabelText("Collection pages", { selector: "summary" });
  const details = summary.closest("details")!;
  fireEvent.click(summary);
  assert.equal(details.open, true);
  fireEvent.pointerDown(document.body);
  assert.equal(details.open, false);
  fireEvent.click(summary);
  const inner = screen.getByRole("link", { name: "Print" });
  inner.focus();
  fireEvent.click(inner);
  assert.equal(details.open, false);
  assert.ok(document.activeElement === summary);
  fireEvent.click(summary);
  rerender(<Navbar {...primary} items={hierarchy} collapse="never" current="biography" />);
  assert.equal(details.open, false);
});

test("Navbar opens a disclosure-only group from its label and restores focus to it when the bar widens", async () => {
  const grouped = [{ id: "collection", label: "Collection", children: items }];
  const { rerender } = render(<Navbar {...primary} items={grouped} />);
  const nav = screen.getByRole("navigation");
  assert.equal(nav.dataset.submenuLayout, "list");
  assert.equal(screen.queryByRole("link", { name: "Collection" }), null);
  const summary = screen.getByText("Collection").closest("summary")!;
  fireEvent.click(summary);
  const link = screen.getByRole("link", { name: "Editions" });
  link.focus();
  fireEvent.keyDown(link, { key: "Escape" });
  assert.equal(summary.parentElement?.hasAttribute("open"), false);
  assert.equal(document.activeElement, summary);
  setCompact(true);
  const toggle = screen.getByRole("button", { name: "Sections" });
  toggle.focus();
  setCompact(false);
  await waitFor(() => assert.equal(document.activeElement, summary));
  rerender(<Navbar {...primary} items={grouped} submenuLayout="columns" />);
  assert.equal(nav.dataset.submenuLayout, "columns");
});

test("Sidebar opens the full active hierarchy on load and on route changes", () => {
  const sections = [{ id: "library", label: "Library pages", collapsible: true, defaultExpanded: false, items: hierarchy }];
  const { rerender } = render(<Sidebar label="Library" groups={sections} current="proofs" />);
  const top = screen.getByText("Library pages").closest("details")!;
  const collection = screen.getByLabelText("Collection pages", { selector: "summary" }).closest("details")!;
  const print = screen.getByLabelText("Print", { selector: "summary" }).closest("details")!;
  const authors = screen.getByLabelText("Authors", { selector: "summary" }).closest("details")!;
  assert.ok(top.open && collection.open && print.open);
  assert.equal(authors.open, false);
  assert.equal(screen.getByRole("link", { current: "page" }).getAttribute("href"), "#proofs");
  top.open = false;
  rerender(<Sidebar label="Library" groups={sections} current="biography" />);
  assert.ok(top.open && authors.open);
  assert.equal(screen.getByRole("link", { current: "page" }).getAttribute("href"), "#biography");
});
