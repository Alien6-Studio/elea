import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Combobox, type ComboboxProps } from "./Combobox.js";
import { Field } from "./Field.js";

afterEach(cleanup);

const options = [
  { value: "a", label: "Alpine" },
  { value: "b", label: "Boreal", disabled: true },
  { value: "c", label: "Coastal" },
  { value: "d", label: "Desert" },
];
const props: ComboboxProps = { options, label: "Habitat", emptyMessage: "No habitats", value: null, onChange: () => {} };
const field = () => screen.getByRole<HTMLInputElement>("combobox", { name: "Habitat" });
const activeOption = (input: HTMLInputElement) => document.getElementById(input.getAttribute("aria-activedescendant") ?? "");

test("the search hint inherits the translated label and can be customized or omitted", () => {
  const translated = { ...props, label: "Rechercher un habitat" };
  const { rerender } = render(<Combobox {...translated} />);
  const input = screen.getByRole<HTMLInputElement>("combobox", { name: translated.label });
  assert.equal(input.placeholder, translated.label);
  assert.equal(input.parentElement?.querySelector("svg")?.getAttribute("aria-hidden"), "true");
  rerender(<Combobox {...translated} placeholder="Saisissez un nom" />);
  assert.equal(input.placeholder, "Saisissez un nom");
  rerender(<Combobox {...translated} placeholder="" />);
  assert.equal(input.placeholder, "");
});

test("the combobox filters labels and only submits the controlled option value", () => {
  const changes: string[] = [];
  const form = (value: string | null, disabled = false) => (
    <form aria-label="Reserve">
      <Combobox {...props} value={value} disabled={disabled} onChange={next => changes.push(next)} name="habitat" />
    </form>
  );
  const view = render(form("a"));
  const input = field();
  const submitted = () => new window.FormData(screen.getByRole<HTMLFormElement>("form")).get("habitat");
  assert.equal(input.value, "Alpine");
  input.focus();
  fireEvent.change(input, { target: { value: "oA" } });
  const listbox = screen.getByRole("listbox", { name: "Habitat" });
  assert.equal(input.getAttribute("aria-controls"), listbox.id);
  assert.deepEqual(screen.getAllByRole("option").map(node => node.textContent), ["Coastal"]);
  assert.equal(activeOption(input), screen.getByRole("option", { name: "Coastal", selected: true }));
  assert.equal(submitted(), "a");
  fireEvent.keyDown(input, { key: "Enter" });
  assert.deepEqual(changes, ["c"]);
  assert.equal(input.value, "Alpine");
  assert.equal(document.activeElement, input);
  assert.equal(input.getAttribute("aria-activedescendant"), null);
  view.rerender(form("c"));
  assert.equal(input.value, "Coastal");
  assert.equal(submitted(), "c");
  fireEvent.click(input);
  fireEvent.keyDown(input, { key: "ArrowDown" });
  assert.equal(activeOption(input), screen.getByRole("option", { name: "Desert", selected: true }));
  assert.equal(screen.getByRole("option", { name: "Coastal", selected: false }).tabIndex, -1);
  assert.equal(submitted(), "c");
  fireEvent.keyDown(input, { key: "Escape" });
  assert.equal(input.value, "Coastal");
  assert.deepEqual(changes, ["c"]);
  fireEvent.click(input);
  view.rerender(form("c", true));
  assert.equal(input.disabled, true);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(submitted(), null);
  view.rerender(form(null));
  assert.equal(input.value, "");
  assert.equal(input.getAttribute("aria-expanded"), "false");
  assert.equal(submitted(), null);
});

test("arrows skip disabled choices and each option keeps DOM focus on the input", () => {
  const changes: string[] = [];
  render(<Combobox {...props} onChange={next => changes.push(next)} />);
  const input = field();
  input.focus();
  fireEvent.keyDown(input, { key: "ArrowUp" });
  assert.equal(activeOption(input)?.textContent, "Desert");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  assert.equal(activeOption(input)?.textContent, "Alpine");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  assert.equal(activeOption(input)?.textContent, "Coastal");
  const boreal = screen.getByRole("option", { name: "Boreal" });
  assert.equal(boreal.getAttribute("aria-disabled"), "true");
  fireEvent.mouseEnter(boreal);
  fireEvent.click(boreal);
  assert.deepEqual(changes, []);
  const alpine = screen.getByRole("option", { name: "Alpine" });
  fireEvent.mouseEnter(alpine);
  assert.equal(activeOption(input), alpine);
  assert.equal(fireEvent.mouseDown(alpine), false);
  fireEvent.click(alpine);
  assert.deepEqual(changes, ["a"]);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(document.activeElement, input);
});

test("empty results and disabled-only matches never commit; Escape and blur restore the label", () => {
  render(<Combobox {...props} value="a" onChange={assert.fail} />);
  const input = field();
  fireEvent.change(input, { target: { value: "nowhere" } });
  assert.equal(screen.getByRole("status").textContent, "No habitats");
  assert.equal(screen.queryByRole("option"), null);
  assert.equal(activeOption(input), null);
  fireEvent.keyDown(input, { key: "ArrowDown" });
  assert.equal(fireEvent.keyDown(input, { key: "Enter" }), false);
  fireEvent.keyDown(input, { key: "Escape" });
  assert.equal(input.value, "Alpine");
  fireEvent.change(input, { target: { value: "Bor" } });
  assert.equal(activeOption(input), null);
  fireEvent.keyDown(input, { key: "Enter" });
  assert.equal(fireEvent.keyDown(input, { key: "Tab" }), true);
  fireEvent.blur(input);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(input.value, "Alpine");
});

test("IME and native text editing keep their keys while Escape dismisses only the open list", () => {
  const changes: string[] = [];
  const bubbled: string[] = [];
  render(<div onKeyDown={event => bubbled.push(event.key)}><Combobox {...props} onChange={value => changes.push(value)} /></div>);
  const input = field();
  fireEvent.click(input);
  fireEvent.compositionStart(input);
  assert.equal(fireEvent.keyDown(input, { key: "Enter" }), true);
  assert.equal(fireEvent.keyDown(input, { key: "Escape" }), true);
  fireEvent.compositionEnd(input);
  assert.equal(fireEvent.keyDown(input, { key: "Enter", isComposing: true }), true);
  assert.equal(fireEvent.keyDown(input, { key: "Enter", keyCode: 229 }), true);
  assert.equal(fireEvent.keyDown(input, { key: "Home" }), true);
  assert.equal(fireEvent.keyDown(input, { key: "ArrowUp", ctrlKey: true }), true);
  assert.equal(screen.getByRole("listbox").id, input.getAttribute("aria-controls"));
  assert.deepEqual(changes, []);
  bubbled.length = 0;
  fireEvent.keyDown(input, { key: "Escape" });
  assert.deepEqual(bubbled, []);
  fireEvent.keyDown(input, { key: "Escape" });
  assert.deepEqual(bubbled, ["Escape"]);
});

test("server markup includes the committed label and Field help and error associations", () => {
  const html = renderToStaticMarkup(
    <Field id="habitat" label="Habitat" help="Choose a habitat" error="Check this choice">
      {control => <Combobox {...props} {...control} value="a" name="zone" />}
    </Field>
  );
  const fragment = document.createElement("template");
  fragment.innerHTML = html;
  const input = fragment.content.querySelector<HTMLInputElement>('[role="combobox"]')!;
  assert.equal(input.value, "Alpine");
  assert.equal(input.id, fragment.content.querySelector("label")?.htmlFor);
  assert.equal(input.getAttribute("aria-describedby"), "habitat-help habitat-error");
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(input.getAttribute("aria-expanded"), "false");
  assert.equal(fragment.content.querySelector('[role="listbox"]'), null);
  assert.equal(fragment.content.querySelector<HTMLInputElement>('input[name="zone"]')?.value, "a");
});
