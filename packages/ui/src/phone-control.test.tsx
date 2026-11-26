import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Field } from "./Field.js";
import { PhoneInput, type CountryCode } from "./phone.js";

afterEach(cleanup);

const labels = { country: "Country or region", empty: "No matching countries" };

function PhoneForm() {
  const [country, setCountry] = useState<CountryCode>("FR");
  const [value, setValue] = useState("");
  return <form aria-label="Contact">
    <Field label="Telephone" help="Include the area code" required>{control =>
      <PhoneInput {...control} name="telephone" labels={labels} locale="en" country={country}
        onCountryChange={setCountry} value={value} onValueChange={setValue} />
    }</Field>
    <output>{value}</output>
  </form>;
}

test("labels the telephone, preserves partial input and submits a complete E.164 value", () => {
  render(<PhoneForm />);
  const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Telephone" });
  const form = screen.getByRole<HTMLFormElement>("form");
  const submitted = () => new window.FormData(form).get("telephone");
  const paste = (value: string) => fireEvent.input(input, { target: { value }, inputType: "insertFromPaste" });
  assert.equal(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent, "Include the area code");
  assert.equal(input.validity.valueMissing, true);
  assert.equal(input.autocomplete, "tel");
  paste("01 99");
  assert.equal(screen.getByRole("status").textContent, "0199");
  assert.equal(form.checkValidity(), false);
  assert.equal(submitted(), "");
  paste("01 99 00 00 12");
  assert.equal(input.value, "01 99 00 00 12");
  assert.equal(screen.getByRole("status").textContent, "0199000012");
  assert.equal(form.checkValidity(), true);
  assert.equal(submitted(), "+33199000012");
  paste("+٤٤ ٢٠ ٧٩٤٦ ٠٠١٨");
  assert.equal(input.value, "+44 20 7946 0018");
  assert.equal(submitted(), "+442079460018");
});

test("searches all country options by code and reformats the same number on keyboard selection", () => {
  render(<PhoneForm />);
  const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Telephone" });
  const country = screen.getByRole<HTMLInputElement>("combobox", { name: labels.country });
  fireEvent.input(input, { target: { value: "2025550123" } });
  fireEvent.change(country, { target: { value: "nonexistent" } });
  assert.ok(screen.getByText(labels.empty));
  fireEvent.change(country, { target: { value: "(+1)" } });
  assert.ok(screen.getByRole("option", { name: "United States (+1)" }));
  fireEvent.change(country, { target: { value: "United States" } });
  fireEvent.keyDown(country, { key: "Enter" });
  assert.equal(country.value, "United States (+1)");
  assert.equal(input.value, "(202) 555-0123");
  assert.equal(new window.FormData(input.form!).get("telephone"), "+12025550123");
});

test("uses the host locale, native form owner and ref and respects disabled and read-only", () => {
  const ref = createRef<HTMLInputElement>();
  const base = { labels, locale: "fr", country: "GB" as const, onCountryChange() {},
    value: "", onValueChange() {}, name: "mobile", form: "external", "aria-label": "Mobile" };
  const view = (state: { disabled?: boolean; readOnly?: boolean }) => <>
    <form id="external" aria-label="External" /><PhoneInput {...base} {...state} ref={ref} />
  </>;
  const { rerender } = render(view({}));
  const country = screen.getByRole<HTMLInputElement>("combobox");
  const form = screen.getByRole<HTMLFormElement>("form");
  assert.equal(ref.current, screen.getByRole("textbox", { name: "Mobile" }));
  assert.equal(ref.current?.form, form);
  assert.equal(country.value, "Royaume-Uni (+44)");
  assert.equal(form.checkValidity(), true);
  assert.deepEqual([...new window.FormData(form)], [["mobile", ""]]);
  rerender(view({ readOnly: true }));
  assert.ok(country.disabled && ref.current?.readOnly);
  rerender(view({ disabled: true }));
  assert.ok(country.disabled && ref.current?.disabled);
  assert.deepEqual([...new window.FormData(form)], []);
});
