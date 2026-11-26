import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./TextControls.js";
import { phoneFormat } from "./phoneFormat.js";

afterEach(cleanup);

test("changing the phone country reformats an uncontrolled native value and keeps the same input", () => {
  const { rerender } = render(<Input type="tel" format={phoneFormat("FR")} />);
  const input = screen.getByRole<HTMLInputElement>("textbox");
  fireEvent.input(input, { target: { value: "2025550123" }, inputType: "insertFromPaste" });
  rerender(<Input type="tel" format={phoneFormat("US")} />);
  assert.equal(screen.getByRole("textbox"), input);
  assert.equal(input.value, "(202) 555-0123");
  assert.equal(input.autocomplete, "tel");
  fireEvent.input(input, { target: { value: "+٤٤ ٢٠ ٧٩٤٦ ٠٠١٨" }, inputType: "insertFromPaste" });
  assert.equal(input.value, "+44 20 7946 0018");
  rerender(<Input type="tel" format={phoneFormat("FR")} />);
  assert.equal(input.value, "+44 20 7946 0018");
});
