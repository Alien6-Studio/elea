import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { Accordion } from "./Accordion.js";
import { Slider } from "./Slider.js";
import { Table, TableBody, TableCaption, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow, type TableSort } from "./Table.js";
import { ToastProvider, useToast, type ToastOptions } from "./Toast.js";

afterEach(cleanup);

function Invoices({ onSort, sort }: { onSort?: () => void; sort?: TableSort }) {
  return (
    <Table label="Invoices" density="sm" striped hoverable stickyHeader className="h-64" data-testid="table">
      <TableCaption>Invoices of the quarter</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell align="end" sort={sort} onSort={onSort}>Amount</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow selected><TableHeaderCell scope="row">Acme</TableHeaderCell><TableCell numeric>1 200</TableCell></TableRow>
        <TableRow><TableHeaderCell scope="row">Globex</TableHeaderCell><TableCell align="center" className="x">800</TableCell></TableRow>
      </TableBody>
      <TableFoot><TableRow><TableHeaderCell scope="row">Total</TableHeaderCell><TableCell numeric>2 000</TableCell></TableRow></TableFoot>
    </Table>
  );
}

test("Table scrolls inside a named region and composes native table parts", () => {
  const ref = createRef<HTMLTableElement>();
  render(<Table ref={ref}><TableBody><TableRow><TableCell>Plain</TableCell></TableRow></TableBody></Table>);
  assert.equal(ref.current?.tagName, "TABLE");
  assert.equal(ref.current?.parentElement?.className, "elea-table elea-table--md");
  assert.equal(ref.current?.parentElement?.getAttribute("data-density"), null);
  assert.equal(ref.current?.parentElement?.getAttribute("role"), null);
  assert.equal(ref.current?.parentElement?.getAttribute("tabindex"), null);
  assert.equal(screen.getByRole("cell", { name: "Plain" }).getAttribute("class"), null);
  cleanup();
  render(<Invoices />);
  const region = screen.getByRole("region", { name: "Invoices" });
  assert.equal(region.className, "elea-table elea-table--sm elea-table--striped elea-table--hoverable elea-table--sticky h-64");
  assert.equal(region.dataset["density"], "sm");
  assert.equal(region.tabIndex, 0);
  assert.equal(screen.getByTestId("table").tagName, "TABLE");
  assert.equal(screen.getByRole("table", { name: "Invoices of the quarter" }), screen.getByTestId("table"));
  assert.equal(screen.getByRole("columnheader", { name: "Client" }).getAttribute("scope"), "col");
  assert.equal(screen.getByRole("columnheader", { name: "Client" }).getAttribute("aria-sort"), null);
  assert.equal(screen.getByRole("rowheader", { name: "Acme" }).parentElement?.getAttribute("data-selected"), "true");
  assert.equal(screen.getByRole("rowheader", { name: "Globex" }).parentElement?.getAttribute("data-selected"), null);
  assert.equal(screen.getByRole("cell", { name: "1 200" }).className, "elea-table__cell--end");
  assert.equal(screen.getByRole("cell", { name: "800" }).className, "elea-table__cell--center x");
  assert.equal(screen.getByRole("cell", { name: "2 000" }).closest("tfoot")?.tagName, "TFOOT");
});

test("Table can explicitly select medium spacing within a compact region", () => {
  render(<section data-elea-density="compact"><Table density="md" label="Session log" /></section>);
  assert.equal(screen.getByRole("region", { name: "Session log" }).dataset["density"], "md");
});

test("Table sorts through a button in the heading and states the direction", () => {
  let sorted = 0;
  const { rerender } = render(<Invoices onSort={() => { sorted += 1; }} />);
  const heading = screen.getByRole("columnheader", { name: "Amount" });
  assert.equal(heading.getAttribute("aria-sort"), "none");
  assert.equal(heading.className, "elea-table__cell--end");
  fireEvent.click(screen.getByRole("button", { name: "Amount" }));
  assert.equal(sorted, 1);
  rerender(<Invoices onSort={() => {}} sort="descending" />);
  assert.equal(screen.getByRole("columnheader", { name: "Amount" }).getAttribute("aria-sort"), "descending");
  rerender(<Invoices sort="ascending" />);
  assert.equal(screen.getByRole("columnheader", { name: "Amount" }).getAttribute("aria-sort"), "ascending");
  assert.equal(screen.queryByRole("button"), null);
});

const sections = [
  { value: "billing", label: "Billing", panel: "Invoices are sent monthly." },
  { value: "team", label: "Team", panel: "Invite up to five people." },
  { value: "legacy", label: "Legacy", panel: "Retired.", disabled: true },
  { value: "security", label: "Security", panel: "Two-factor is on." },
] as const;

test("Accordion opens one section at a time and wires each heading to its panel", () => {
  const changes: string[][] = [];
  render(<Accordion items={sections} defaultValue={["billing"]} onChange={(value) => changes.push(value)} headingLevel="h2" variant="contained" className="x" />);
  const billing = screen.getByRole("button", { name: "Billing" });
  const team = screen.getByRole("button", { name: "Team" });
  assert.equal(billing.closest(".elea-accordion")?.className, "elea-accordion elea-accordion--contained x");
  assert.equal(screen.getAllByRole("heading", { level: 2 }).length, 4);
  assert.equal(billing.getAttribute("aria-expanded"), "true");
  assert.equal(team.getAttribute("aria-expanded"), "false");
  const panel = document.getElementById(billing.getAttribute("aria-controls") ?? "");
  assert.equal(panel?.getAttribute("role"), "region");
  assert.equal(panel?.getAttribute("aria-labelledby"), billing.id);
  assert.equal(panel?.textContent, "Invoices are sent monthly.");
  assert.equal(panel?.parentElement?.getAttribute("data-open"), "true");
  fireEvent.click(team);
  assert.equal(billing.getAttribute("aria-expanded"), "false");
  assert.equal(team.getAttribute("aria-expanded"), "true");
  assert.equal(panel?.parentElement?.getAttribute("data-open"), null);
  fireEvent.click(team);
  assert.equal(team.getAttribute("aria-expanded"), "false");
  assert.deepEqual(changes, [["team"], []]);
  assert.equal((screen.getByRole("button", { name: "Legacy" }) as HTMLButtonElement).disabled, true);
});

test("Accordion keeps several sections open, follows a controlled value and moves focus with the arrow keys", () => {
  function Controlled() {
    const [value, setValue] = useState<string[]>(["team"]);
    return <Accordion items={sections} multiple value={value} onChange={setValue} />;
  }
  render(<Controlled />);
  const [billing, team, , security] = screen.getAllByRole("button") as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
  assert.equal(billing.closest(".elea-accordion")?.className, "elea-accordion elea-accordion--separated");
  assert.equal(screen.getAllByRole("heading", { level: 3 }).length, 4);
  fireEvent.click(billing);
  assert.equal(billing.getAttribute("aria-expanded"), "true");
  assert.equal(team.getAttribute("aria-expanded"), "true");
  billing.focus();
  fireEvent.keyDown(billing, { key: "ArrowDown" });
  assert.equal(document.activeElement, team);
  fireEvent.keyDown(team, { key: "ArrowDown" });
  assert.equal(document.activeElement, security);
  fireEvent.keyDown(security, { key: "ArrowDown" });
  assert.equal(document.activeElement, billing);
  fireEvent.keyDown(billing, { key: "ArrowUp" });
  assert.equal(document.activeElement, security);
  fireEvent.keyDown(security, { key: "Home" });
  assert.equal(document.activeElement, billing);
  fireEvent.keyDown(billing, { key: "End" });
  assert.equal(document.activeElement, security);
  fireEvent.keyDown(security, { key: "ArrowDown", ctrlKey: true });
  fireEvent.keyDown(security, { key: "a" });
  assert.equal(document.activeElement, security);
});

test("Slider is a native range that reports numbers, fills its track and words its value", () => {
  const ref = createRef<HTMLInputElement>();
  const values: number[] = [];
  render(<Slider ref={ref} label="Volume" showValue defaultValue={25} min={0} max={50} step={5} formatValue={(value) => `${value} dB`} onChange={(value) => values.push(value)} size="sm" className="x" name="volume" />);
  const slider = screen.getByRole("slider", { name: "Volume" }) as HTMLInputElement;
  assert.equal(ref.current, slider);
  assert.equal(slider.parentElement?.className, "elea-slider elea-slider--sm x");
  assert.equal(slider.type, "range");
  assert.equal(slider.name, "volume");
  assert.equal(slider.step, "5");
  assert.equal(slider.getAttribute("aria-valuetext"), "25 dB");
  assert.equal(slider.style.getPropertyValue("--elea-slider-fill"), "50%");
  assert.equal(screen.getByText("25 dB").getAttribute("aria-hidden"), "true");
  fireEvent.change(slider, { target: { value: "40" } });
  assert.deepEqual(values, [40]);
  assert.equal(slider.value, "40");
  assert.equal(slider.style.getPropertyValue("--elea-slider-fill"), "80%");
  assert.equal(screen.getByText("40 dB").className, "elea-slider__value");
});

test("Slider follows a controlled value, clamps it and needs no header", () => {
  const { rerender } = render(<Slider aria-label="Zoom" value={150} onChange={() => {}} />);
  const slider = screen.getByRole("slider", { name: "Zoom" }) as HTMLInputElement;
  assert.equal(slider.value, "100");
  assert.equal(slider.getAttribute("aria-valuetext"), null);
  assert.equal(slider.parentElement?.className, "elea-slider elea-slider--md");
  assert.equal(slider.parentElement?.children.length, 1);
  fireEvent.change(slider, { target: { value: "30" } });
  assert.equal(slider.value, "100");
  rerender(<Slider aria-label="Zoom" value={30} onChange={() => {}} showValue />);
  assert.equal(slider.value, "30");
  assert.equal(screen.getByText("30").className, "elea-slider__value");
  rerender(<Slider aria-label="Zoom" min={5} max={5} />);
  assert.equal(slider.style.getPropertyValue("--elea-slider-fill"), "0%");
});

function Notifier({ options }: { options: ToastOptions }) {
  const { toast, dismiss } = useToast();
  return (
    <>
      <button type="button" onClick={() => toast(options)}>Notify</button>
      <button type="button" onClick={() => toast({ title: "Other" })}>Other</button>
      <button type="button" onClick={() => dismiss()}>Clear</button>
    </>
  );
}

test("ToastProvider shows toasts in a labelled live region and dismisses them", async () => {
  render(
    <ToastProvider label="Notifications" dismissLabel="Dismiss" position="top-center" motion className="x">
      <Notifier options={{ title: "Saved", description: "Your changes are live.", tone: "success", icon: <i>ok</i>, action: <button type="button">Undo</button>, duration: Infinity }} />
    </ToastProvider>,
  );
  const region = screen.getByRole("region", { name: "Notifications" });
  assert.equal(region.parentElement, document.body);
  assert.equal(region.className, "elea-toasts elea-toasts--top-center x");
  assert.equal(region.getAttribute("aria-live"), "polite");
  assert.equal(region.getAttribute("data-elea-motion"), "on");
  assert.equal(region.children.length, 0);
  fireEvent.click(screen.getByRole("button", { name: "Notify" }));
  const toast = region.firstElementChild as HTMLElement;
  assert.equal(toast.className, "elea-toast elea-toast--success");
  assert.equal(toast.getAttribute("role"), null);
  assert.equal(toast.getAttribute("aria-atomic"), "true");
  assert.equal(toast.querySelector(".elea-toast__title")?.textContent, "Saved");
  assert.equal(toast.querySelector(".elea-toast__description")?.textContent, "Your changes are live.");
  assert.equal(toast.querySelector(".elea-toast__icon")?.getAttribute("aria-hidden"), "true");
  assert.ok(screen.getByRole("button", { name: "Undo" }));
  fireEvent.click(screen.getByRole("button", { name: "Other" }));
  fireEvent.click(screen.getByRole("button", { name: "Other" }));
  assert.equal(region.children.length, 3);
  fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0] as HTMLElement);
  assert.equal(toast.getAttribute("data-leaving"), "true");
  await waitFor(() => assert.equal(region.children.length, 2));
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  await waitFor(() => assert.equal(region.children.length, 0));
});

test("a toast leaves by itself, waits while it is hovered or focused, and is replaced under the same id", async () => {
  function Saver() {
    const { toast } = useToast();
    return (
      <>
        <button type="button" onClick={() => toast({ id: "save", title: "Saving", duration: Infinity })}>Start</button>
        <button type="button" onClick={() => toast({ id: "save", title: "Failed", tone: "danger" })}>Fail</button>
      </>
    );
  }
  render(<ToastProvider label="Notifications" dismissLabel="Dismiss" duration={40} max={2}><Saver /><Notifier options={{ title: "Brief" }} /></ToastProvider>);
  const region = screen.getByRole("region", { name: "Notifications" });
  assert.equal(region.className, "elea-toasts elea-toasts--bottom-end");
  assert.equal(region.getAttribute("data-elea-motion"), null);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  fireEvent.click(screen.getByRole("button", { name: "Notify" }));
  fireEvent.click(screen.getByRole("button", { name: "Other" }));
  assert.deepEqual(Array.from(region.children, (toast) => toast.querySelector(".elea-toast__title")?.textContent), ["Brief", "Other"]);
  await waitFor(() => assert.equal(region.children.length, 0));

  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  fireEvent.pointerEnter(region);
  fireEvent.click(screen.getByRole("button", { name: "Fail" }));
  assert.equal(region.children.length, 1);
  assert.equal(screen.getByRole("alert").querySelector(".elea-toast__title")?.textContent, "Failed");
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(region.children.length, 1);
  assert.equal(region.firstElementChild?.getAttribute("data-leaving"), null);
  fireEvent.pointerLeave(region);
  screen.getByRole("button", { name: "Dismiss" }).focus();
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(region.children.length, 1);
  screen.getByRole("button", { name: "Dismiss" }).blur();
  await waitFor(() => assert.equal(region.children.length, 0));
});

test("useToast needs its provider", () => {
  function Orphan() {
    useToast();
    return null;
  }
  const error = console.error;
  console.error = () => {};
  try {
    assert.throws(() => render(<Orphan />), /useToast needs a ToastProvider/);
  } finally {
    console.error = error;
  }
});

test("the data components render on the server and pass an axe audit", async () => {
  const page = (
    <ToastProvider label="Notifications" dismissLabel="Dismiss">
      <main>
        <h1>Account</h1>
        <Invoices onSort={() => {}} sort="ascending" />
        <Accordion items={sections} defaultValue={["billing"]} headingLevel="h2" />
        <Slider label="Volume" showValue defaultValue={30} />
        <Notifier options={{ title: "Saved", description: "Done", duration: Infinity }} />
      </main>
    </ToastProvider>
  );
  const html = renderToStaticMarkup(page);
  assert.match(html, /<div role="region" aria-label="Invoices" tabindex="0" class="elea-table/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /type="range"/);
  assert.doesNotMatch(html, /elea-toasts/);
  render(page);
  fireEvent.click(screen.getByRole("button", { name: "Notify" }));
  const results = await axe.run(document.body, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false } } });
  assert.deepEqual(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`), []);
});
