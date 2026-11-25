import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { ColorPicker, type ColorPickerProps } from "./ColorPicker.js";

afterEach(cleanup);

const props: ColorPickerProps = {
  value: "#08745E", onChange: assert.fail, label: "Brand colour",
  hexLabel: "Brand colour hex", invalidMessage: "Use six hexadecimal digits.",
};
const swatch = () => screen.getByLabelText<HTMLInputElement>(props.label);
const hex = () => screen.getByRole<HTMLInputElement>("textbox", { name: props.hexLabel });
const edit = (text: string) => fireEvent.change(hex(), { target: { value: text } });

test("the picker names both inputs and renders the same colour on the server", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<ColorPicker {...props} />), "text/html");
  const native = doc.querySelector<HTMLInputElement>('input[type="color"]');
  assert.equal(native?.labels?.[0]?.textContent, props.label);
  assert.equal(native?.value, "#08745e");
  const text = doc.querySelector<HTMLInputElement>('input[type="text"]');
  assert.equal(text?.getAttribute("aria-label"), props.hexLabel);
  assert.equal(text?.value, "#08745E");
  assert.throws(() => renderToStaticMarkup(<ColorPicker {...props} value="#zz0000" />), RangeError);
});

test("native and hex input request a controlled change only when a complete colour is chosen", () => {
  const changes: string[] = [];
  const onChange = (next: string) => changes.push(next);
  const view = render(<ColorPicker {...props} onChange={onChange} />);
  fireEvent.change(swatch(), { target: { value: "#abcdef" } });
  assert.deepEqual(changes, ["#abcdef"]);
  assert.equal(swatch().value, "#08745e", "the host owns the selected colour");
  edit("AbC");
  edit("AbCdEf");
  fireEvent.keyDown(hex(), { key: "Enter", isComposing: true });
  assert.equal(changes.length, 1);
  fireEvent.keyDown(hex(), { key: "Enter" });
  assert.deepEqual(changes, ["#abcdef", "#abcdef"]);
  view.rerender(<ColorPicker {...props} value="#abcdef" onChange={onChange} />);
  assert.equal(hex().value, "#ABCDEF");
  edit("#12cDEF");
  fireEvent.blur(hex());
  assert.equal(changes.at(-1), "#12cdef");
  edit("ABCDEF");
  fireEvent.blur(hex());
  assert.equal(changes.length, 3, "an unchanged colour does not emit a duplicate change");
});

test("validation describes the text field, and Escape discards an unfinished edit", () => {
  render(<ColorPicker {...props} />);
  for (const invalid of ["", "#abd", "##004455", "#id0000", "#001122ff"]) {
    edit(invalid);
    assert.equal(screen.queryByRole("alert"), null);
    fireEvent.blur(hex());
    const alert = screen.getByRole("alert");
    assert.equal(alert.textContent, props.invalidMessage);
    assert.equal(hex().getAttribute("aria-describedby"), alert.id);
    assert.equal(hex().getAttribute("aria-invalid"), "true");
    assert.equal(swatch().value, "#08745e");
    assert.equal(hex().value, invalid);
    assert.equal(fireEvent.keyDown(hex(), { key: "Escape" }), false);
    assert.equal(hex().value, "#08745E");
  }
  assert.equal(screen.queryByRole("alert"), null);
  assert.equal(fireEvent.keyDown(hex(), { key: "Escape" }), true, "idle Escape remains available to the host");
});

test("a new controlled colour supersedes drafts and errors while preserving the focused input", () => {
  const view = render(<ColorPicker {...props} />);
  const focused = hex();
  focused.focus();
  edit("invalid");
  fireEvent.keyDown(focused, { key: "Enter" });
  view.rerender(<ColorPicker {...props} value="#001122" />);
  assert.equal(document.activeElement, focused);
  assert.equal(hex().value, "#001122");
  assert.equal(screen.queryByRole("alert"), null);
  view.rerender(<ColorPicker {...props} disabled />);
  assert.equal(hex().value, "#08745E", "an old draft does not return when its preset is selected again");
  assert.equal(hex().disabled, true);
  assert.equal(swatch().disabled, true);
});
