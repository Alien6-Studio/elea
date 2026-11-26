import assert from "node:assert/strict";
import { test } from "node:test";
import { ibanFormat, paymentCardFormat, sirenFormat, siretFormat } from "./inputFormats.js";

test("IBAN keeps ASCII letters in the country and account, including during partial edits", () => {
  const raw = ibanFormat.parse("fr00 1234-5678 9abc 0123 45m6 789");
  assert.equal(raw, "FR00123456789ABC012345M6789");
  assert.equal(ibanFormat.format(raw), "FR00 1234 5678 9ABC 0123 45M6 789");
  assert.equal(ibanFormat.parse("r00 12xy"), "R0012XY");
  assert.equal(ibanFormat.parse("fßr０-é3"), "FR3");
  assert.equal(ibanFormat.parse("z".repeat(35)), "Z".repeat(34));
});

test("payment cards follow the current prefix and preserve edits up to the PAN limit", () => {
  const amex = paymentCardFormat.parse("3782 822463 10005");
  assert.equal(paymentCardFormat.format(amex), "3782 822463 10005");
  assert.equal(paymentCardFormat.format("341234567890123"), "3412 345678 90123");
  const other = paymentCardFormat.parse("1234-5678-9012-3456-7890");
  assert.equal(paymentCardFormat.format(other), "1234 5678 9012 3456 789");
  // Replacing the prefix of a long number is a regular edit. Preserve the tail for correction.
  assert.equal(paymentCardFormat.parse(paymentCardFormat.format("37" + other.slice(2))), "37" + other.slice(2));
});

test("SIREN and SIRET preserve leading zeros and keep the five NIC digits together", () => {
  assert.equal(sirenFormat.parse("001 234 567 890"), "001234567");
  assert.equal(sirenFormat.format("001234567"), "001 234 567");
  const raw = siretFormat.parse("001-234-567-00042 99");
  assert.equal(raw, "00123456700042");
  assert.equal(siretFormat.format(raw), "001 234 567 00042");
});

test("every prefix round-trips without a trailing space or eager separator", () => {
  for (const [format, raw] of [
    [ibanFormat, "GB00BANK1234567890"],
    [paymentCardFormat, "378282246310005"],
    [sirenFormat, "123456789"],
    [siretFormat, "12345678901234"],
  ] as const) {
    for (let length = 0; length <= raw.length; length++) {
      const prefix = raw.slice(0, length);
      const display = format.format(prefix);
      assert.equal(display, display.trimEnd());
      assert.equal(format.parse(display), prefix);
    }
  }
});

test("SIREN and SIRET use the same business identifier groups throughout editing", () => {
  assert.deepEqual(sirenFormat.segments(""), [3, 3, 3]);
  assert.deepEqual(siretFormat.segments("00123456700042"), [3, 3, 3, 5]);
});

test("IBAN allocates four-character groups and a final country-specific group", () => {
  for (const [country, length] of Object.entries({ FR: 27, DE: 22, GB: 22, BE: 16, NO: 15, RU: 33, YE: 30 })) {
    const groups = ibanFormat.segments(country);
    assert.equal(groups.reduce((sum, size) => sum + size, 0), length, country);
    assert.ok(groups.slice(0, -1).every(size => size === 4), country);
    assert.equal(groups.at(-1), length % 4 || 4, country);
  }
  // A country correction must leave the remainder of the original account editable.
  assert.deepEqual(ibanFormat.segments("DE" + "0".repeat(25)), [4, 4, 4, 4, 4, 4, 3]);
});

test("IBAN grows an unknown country progressively, up to the electronic format limit", () => {
  assert.deepEqual(ibanFormat.segments(""), [4, 4]);
  assert.deepEqual(ibanFormat.segments("Z"), [4, 4]);
  assert.deepEqual(ibanFormat.segments("ZZ000000"), [4, 4, 4]);
  assert.deepEqual(ibanFormat.segments("Z".repeat(32)), [4, 4, 4, 4, 4, 4, 4, 4, 2]);
  assert.deepEqual(ibanFormat.segments("Z".repeat(34)), [4, 4, 4, 4, 4, 4, 4, 4, 2]);
});

test("card segments follow the prefix and expose room for longer PANs", () => {
  assert.deepEqual(paymentCardFormat.segments(""), [4, 4, 4, 4]);
  assert.deepEqual(paymentCardFormat.segments("340000000000000"), [4, 6, 5]);
  assert.deepEqual(paymentCardFormat.segments("3700000000000001"), [4, 6, 5, 4]);
  assert.deepEqual(paymentCardFormat.segments("40000000000000001"), [4, 4, 4, 4, 3]);
  assert.deepEqual(paymentCardFormat.segments("4000000000000000"), [4, 4, 4, 4]);
});
