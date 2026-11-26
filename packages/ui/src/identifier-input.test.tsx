import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Field } from "./Field.js";
import { CardNumberInput, IbanInput, SirenInput, SiretInput } from "./IdentifierInput.js";

afterEach(cleanup);

const labels = { label: "Identifier", segmentLabel: (index: number, count: number) => `Block ${index + 1} of ${count}` };
const blocks = () => screen.getAllByRole<HTMLInputElement>("textbox");
const contents = () => blocks().map(input => input.value);
const paste = (input: HTMLInputElement, text: string) =>
  fireEvent.paste(input, { clipboardData: { getData: () => text } });
const edit = (input: HTMLInputElement, text: string) =>
  fireEvent.input(input, { target: { value: text }, inputType: "insertReplacementText" });

test("partial paste and mobile replacements preserve the other populated blocks", () => {
  const values: string[] = [];
  render(<SirenInput {...labels} defaultValue="123456789" onValueChange={value => values.push(value)} />);
  blocks()[0]!.setSelectionRange(1, 2);
  paste(blocks()[0]!, "00");
  assert.deepEqual(contents(), ["103", "456", "789"]);
  assert.equal(values.at(-1), "103456789");
  edit(blocks()[1]!, "98765");
  assert.deepEqual(contents(), ["103", "987", "789"]);
  assert.equal(values.at(-1), "103987789");
});

test("a full SIRET pasted in any block replaces the identifier, preserving NIC and initial zeroes", () => {
  const ref = createRef<HTMLInputElement>();
  render(<form aria-label="Company"><Field label="SIRET" help="Business registration">{control =>
    <SiretInput {...labels} {...control} name="siret" ref={ref} />
  }</Field></form>);
  const first = blocks()[0]!;
  assert.equal(first, ref.current);
  assert.equal(first.labels?.[0]?.textContent, "SIRET");
  assert.equal(document.getElementById(first.getAttribute("aria-describedby")!)?.textContent, "Business registration");
  paste(blocks()[2]!, "001 234 567 00042");
  assert.deepEqual(contents(), ["001", "234", "567", "00042"]);
  assert.deepEqual([...new window.FormData(first.form!)], [["siret", "00123456700042"]]);
});

test("a controlled IBAN keeps a middle block editable and adopts a replacement from the host", () => {
  function Account() {
    const [value, setValue] = useState("GB82WEST12345698765432");
    return <><IbanInput {...labels} value={value} onValueChange={setValue} />
      <button onClick={() => setValue("BE68539007547034")}>Use second account</button>
      <output>{value}</output></>;
  }
  render(<Account />);
  edit(blocks()[1]!, "");
  assert.deepEqual(contents(), ["GB82", "", "1234", "5698", "7654", "32"]);
  assert.equal(screen.getByRole("status").textContent, "GB8212345698765432");
  edit(blocks()[1]!, "bank");
  assert.deepEqual(contents(), ["GB82", "BANK", "1234", "5698", "7654", "32"]);
  fireEvent.click(screen.getByRole("button", { name: "Use second account" }));
  assert.deepEqual(contents(), ["BE68", "5390", "0754", "7034"]);
  paste(blocks()[2]!, "FR14 2004 1010 0505 0001 3M02 606");
  assert.deepEqual(contents(), ["FR14", "2004", "1010", "0505", "0001", "3M02", "606"]);
});

test("keyboard editing advances, moves across edges and backspaces into the previous block", () => {
  render(<SirenInput {...labels} />);
  const [first, second] = blocks() as [HTMLInputElement, HTMLInputElement];
  edit(first, "123");
  assert.equal(document.activeElement, second);
  fireEvent.keyDown(second, { key: "ArrowLeft" });
  assert.equal(document.activeElement, first);
  assert.equal(first.selectionStart, 3);
  fireEvent.keyDown(first, { key: "ArrowRight" });
  assert.equal(document.activeElement, second);
  fireEvent.keyDown(second, { key: "Backspace" });
  assert.deepEqual(contents(), ["12", "", ""]);
  assert.equal(document.activeElement, first);
  assert.equal(first.selectionStart, 2);
});

test("card autofill and prefix changes keep the full PAN with one decorative network mark", () => {
  const { container } = render(<CardNumberInput {...labels} />);
  const first = blocks()[0]!;
  assert.equal(first.autocomplete, "cc-number");
  edit(first, "3782 822463 10005");
  assert.deepEqual(contents(), ["3782", "822463", "10005"]);
  assert.ok(container.querySelector('[data-network="amex"][aria-hidden="true"] svg'));
  assert.equal(screen.queryByRole("img"), null);
  edit(first, "4111");
  assert.equal(contents().join(""), "411182246310005");
  assert.deepEqual(contents(), ["4111", "8224", "6310", "005"]);
  assert.ok(container.querySelector('[data-network="visa"]'));
  paste(blocks()[1]!, "5555 5555 5555 4444");
  assert.equal(contents().join(""), "5555555555554444");
  assert.ok(container.querySelector('[data-network="mastercard"]'));
});

test("uncontrolled inputs reset with their owning form and respect readonly and disabled", async () => {
  const view = (state: { disabled?: boolean; readOnly?: boolean }) => <>
    <form id="business" aria-label="Business" /><SirenInput {...labels} {...state}
      form="business" name="siren" defaultValue="001234567" />
  </>;
  const { rerender } = render(view({}));
  const form = screen.getByRole<HTMLFormElement>("form");
  edit(blocks()[1]!, "987");
  assert.equal(new window.FormData(form).get("siren"), "001987567");
  await act(async () => form.reset());
  assert.deepEqual(contents(), ["001", "234", "567"]);
  rerender(view({ readOnly: true }));
  assert.ok(blocks().every(input => input.readOnly));
  paste(blocks()[1]!, "123456789");
  assert.equal(new window.FormData(form).get("siren"), "001234567");
  rerender(view({ disabled: true }));
  assert.ok(blocks().every(input => input.disabled));
  assert.deepEqual([...new window.FormData(form)], []);
});

test("clearing an Amex prefix keeps the remaining blocks available for correction", () => {
  render(<CardNumberInput {...labels} defaultValue="378282246310005" />);
  edit(blocks()[0]!, "");
  assert.deepEqual(contents(), ["", "822463", "10005"]);
  assert.ok(document.querySelector('[data-network="generic"]'));
  edit(blocks()[0]!, "3");
  assert.deepEqual(contents(), ["3", "822463", "10005"]);
  edit(blocks()[0]!, "37");
  assert.deepEqual(contents(), ["37", "822463", "10005"]);
});

test("a complete 16-digit card gains another editing block only when a 17th digit arrives", () => {
  render(<CardNumberInput {...labels} defaultValue="4242424242424242" />);
  assert.deepEqual(contents(), ["4242", "4242", "4242", "4242"]);
  edit(blocks()[3]!, "42429");
  assert.equal(document.activeElement, blocks()[4]);
  assert.deepEqual(contents(), ["4242", "4242", "4242", "4242", "9"]);
  edit(blocks()[4]!, "987");
  assert.equal(contents().join(""), "4242424242424242987");
});

test("a native group identifies invalid editable blocks and retains focus when a host regroups a card", () => {
  const card = (value: string) => <CardNumberInput {...labels} value={value} aria-invalid="true" />;
  const { rerender } = render(card("378282246310005"));
  const group = screen.getByRole("group", { name: labels.label });
  assert.equal(group.tagName, "FIELDSET");
  assert.equal(group.hasAttribute("aria-invalid"), false);
  assert.ok(blocks().every(input => input.getAttribute("aria-invalid") === "true"));
  const first = blocks()[0]!;
  const third = blocks()[2]!;
  third.focus();
  third.setSelectionRange(2, 2);
  rerender(card("4242424242424242"));
  assert.equal(blocks()[0], first);
  assert.equal(document.activeElement, blocks()[2]);
  assert.equal(blocks()[2]!.selectionStart, 2);
});
