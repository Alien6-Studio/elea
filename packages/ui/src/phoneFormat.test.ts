import assert from "node:assert/strict";
import { test } from "node:test";
import { getCountries, getCountryCallingCode, phoneFormat, phoneToE164 } from "./phoneFormat.js";

test("national phone input follows the selected country's numbering plan", () => {
  const uk = phoneFormat("GB");
  assert.equal(uk.format("02079460018"), "020 7946 0018");
  assert.equal(uk.parse("020 7946 0018"), "02079460018");
  assert.equal(phoneToE164("020 7946 0018", "GB"), "+442079460018");
  assert.equal(phoneFormat("US").format("2025550123"), "(202) 555-0123");
  assert.equal(phoneToE164("(202) 555-0123", "US"), "+12025550123");
  assert.equal(uk, phoneFormat("GB"));
  assert.equal(uk.inputMode, "tel");
  assert.equal(uk.autoComplete, "tel");
});

test("a leading plus overrides the default country, including on paste", () => {
  const france = phoneFormat("FR");
  const raw = france.parse("+١ (٢٠٢) ٥٥٥-٠١٢٣");
  assert.equal(raw, "+12025550123");
  assert.equal(france.format(raw), "+1 202 555 0123");
  assert.equal(phoneToE164(france.format(raw), "FR"), "+12025550123");
  assert.equal(france.parse(france.format("01234")), "01234");
  for (const input of ["", "+", "+4", "+44", "0", "01"]) {
    assert.equal(france.parse(france.format(input)), input);
    assert.equal(phoneToE164(input, "FR"), undefined);
  }
});

test("E.164 conversion rejects incomplete, overlong or embedded numbers and extensions", () => {
  for (const input of ["020", "0207946001800000000", "Phone: 020 7946 0018", "020 7946 0018 ext. 7"]) {
    assert.equal(phoneToE164(input, "GB"), undefined);
  }
});

test("country options expose stable codes and calling codes for localized selectors", () => {
  const countries = getCountries();
  assert.ok(countries.includes("FR") && countries.includes("GB") && countries.includes("IT"));
  assert.equal(getCountryCallingCode("FR"), "33");
  assert.equal(getCountryCallingCode("IT"), "39");
  assert.equal(getCountryCallingCode("GB"), "44");
});
