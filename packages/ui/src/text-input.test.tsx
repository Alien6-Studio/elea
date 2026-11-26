import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { Field, Input, Textarea } from "./Field.js";

afterEach(cleanup);

test("Field composes the soft counter with help and errors and keeps its native ref", () => {
  const ref = createRef<HTMLTextAreaElement>();
  const { rerender } = render(<Field id="bio" label="Biography" help="Public" error="Check spelling">
    {props => <Textarea {...props} ref={ref} defaultValue="🙂" counter={{ max: 3 }} />}
  </Field>);
  const field = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Biography" });
  assert.equal(ref.current, field);
  const indicator = screen.getByText("2 / 3");
  assert.equal(indicator.getAttribute("aria-live"), "polite");
  assert.deepEqual(field.getAttribute("aria-describedby")?.split(" "), ["bio-help", "bio-error", indicator.id]);
  fireEvent.change(field, { target: { value: "Four" } });
  assert.equal(field.value, "Four");
  assert.equal(indicator.textContent, "4 / 3");
  assert.ok(indicator.classList.contains("elea-field__counter--over"));

  const props = { value: "abc", readOnly: true, counter: { max: 3, format: (n: number, max: number) => `${n} of ${max} characters` } };
  rerender(<Input {...props} />);
  assert.equal(screen.getByRole("textbox").hasAttribute("aria-invalid"), false);
  assert.ok(screen.getByText("3 of 3 characters"));
  rerender(<Input {...props} value="abcd" />);
  assert.equal(screen.getByRole("textbox").getAttribute("aria-invalid"), "true");
  assert.ok(screen.getByText("4 of 3 characters"));
  rerender(<Input {...props} counter={undefined} maxLength={2} />);
  assert.equal(screen.getByRole<HTMLInputElement>("textbox").maxLength, 2);
  assert.equal(screen.getByRole("textbox").hasAttribute("aria-describedby"), false);
});

test("an uncontrolled count follows native reset including an external form owner", async () => {
  const { container } = render(<><form id="settings" /><Input form="settings" name="name" defaultValue="Ada" counter={{ max: 4 }} /></>);
  const input = screen.getByRole<HTMLInputElement>("textbox");
  fireEvent.change(input, { target: { value: "Hannah" } });
  assert.equal(input.getAttribute("aria-invalid"), "true");
  await act(async () => { container.querySelector("form")!.reset(); });
  assert.equal(input.value, "Ada");
  assert.ok(screen.getByText("3 / 4"));
  assert.equal(input.hasAttribute("aria-invalid"), false);
});

test("masked values format on the server, in defaults and controlled props", () => {
  assert.match(renderToString(<Input defaultValue="123456789" mask="### ### ###" />), /value="123 456 789"/);
  const { rerender } = render(<Input value="12345" mask="### ### ###" readOnly counter={{ max: 8 }} />);
  assert.equal(screen.getByRole<HTMLInputElement>("textbox").value, "123 45");
  assert.ok(screen.getByText("6 / 8"));
  rerender(<Input value="9" mask="### ### ###" readOnly counter={{ max: 8 }} />);
  assert.equal(screen.getByRole<HTMLInputElement>("textbox").value, "9");
  assert.ok(screen.getByText("1 / 8"));
});

test("masked edits preserve the logical caret and notify with the displayed value", () => {
  const values: string[] = [];
  const ref = createRef<HTMLInputElement>();
  render(<Input ref={ref} defaultValue="123456" mask="### ### ###" onChange={e => values.push(e.target.value)} />);
  const field = ref.current!;
  const edit = (value: string, caret: number, inputType: string) => fireEvent.input(field, { target: { value, selectionStart: caret, selectionEnd: caret }, inputType });
  edit("1237 456", 4, "insertText");
  assert.equal(field.value, "123 745 6");
  assert.equal(field.selectionStart, 5);
  edit("123745 6", 3, "deleteContentBackward");
  assert.equal(field.value, "127 456");
  assert.equal(field.selectionStart, 2);
  edit("127456", 3, "deleteContentForward");
  assert.equal(field.value, "127 56");
  edit("1-98-76-55-44-32", 16, "insertFromPaste");
  assert.equal(field.value, "198 765 544");
  assert.equal(field.selectionStart, 11);
  assert.equal(values.at(-1), field.value);
});

test("a controlled mask lets composition finish before formatting the committed value", () => {
  const events: string[] = [];
  function Form() {
    const [value, setValue] = useState("123");
    return <Input value={value} mask="### ###" onChange={e => { events.push(e.target.value); setValue(e.target.value); }} />;
  }
  render(<Form />);
  const field = screen.getByRole<HTMLInputElement>("textbox");
  fireEvent.compositionStart(field);
  fireEvent.input(field, { target: { value: "1234" }, isComposing: true, inputType: "insertCompositionText" });
  assert.equal(field.value, "1234");
  fireEvent.compositionEnd(field);
  assert.equal(field.value, "123 4");
  assert.equal(events.at(-1), "123 4");
});

test("a populated uncontrolled control keeps its text, ref and focus when features are toggled", () => {
  const ref = createRef<HTMLInputElement>();
  const { rerender } = render(<Input ref={ref} defaultValue="" />);
  const input = ref.current!;
  input.focus();
  fireEvent.change(input, { target: { value: "123456" } });
  rerender(<Input ref={ref} counter={{ max: 5 }} mask="### ###" defaultValue="" />);
  assert.equal(ref.current, input);
  assert.equal(document.activeElement, input);
  assert.equal(input.value, "123 456");
  assert.ok(screen.getByText("7 / 5"));
  rerender(<Input ref={ref} defaultValue="" />);
  assert.equal(document.activeElement, input);
  assert.equal(input.value, "123 456");
  assert.equal(input.getAttribute("aria-describedby"), null);
});

test("native reset restores a formatted uncontrolled default and separator deletion", async () => {
  const { container } = render(<form><Input defaultValue="123456" mask="### ###" /></form>);
  const input = screen.getByRole<HTMLInputElement>("textbox");
  fireEvent.input(input, { target: { value: "111222" }, inputType: "insertFromPaste" });
  await act(async () => { container.querySelector("form")!.reset(); });
  assert.equal(input.value, "123 456");
  fireEvent.input(input, { target: { value: "123456", selectionStart: 3, selectionEnd: 3 }, inputType: "deleteContentBackward" });
  assert.equal(input.value, "124 56");
});

test("an inserted mask separator also respects native maxLength", () => {
  render(<Input defaultValue="123" maxLength={4} mask="### ###" counter={{ max: 5 }} />);
  const input = screen.getByRole<HTMLInputElement>("textbox");
  fireEvent.input(input, { target: { value: "1234" }, inputType: "insertText" });
  assert.equal(input.value, "123");
  assert.ok(screen.getByText("3 / 5"));
});

test("a progressive format preserves alphanumeric edit positions and the submitted display value", () => {
  const grouped = {
    parse: (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    format: (raw: string) => raw.match(/.{1,4}/g)?.join(" ") ?? "",
    inputMode: "text" as const,
  };
  const ref = createRef<HTMLInputElement>();
  const changes: string[] = [];
  function Example() {
    const [value, setValue] = useState("ab12cd34");
    return <form><Input ref={ref} name="reference" format={grouped} value={value}
      onChange={event => { changes.push(event.target.value); setValue(grouped.parse(event.target.value)); }} /></form>;
  }
  render(<Example />);
  const field = ref.current!;
  assert.equal(field.value, "AB12 CD34");
  fireEvent.input(field, { target: { value: "AB12 xCD34", selectionStart: 6, selectionEnd: 6 }, inputType: "insertText" });
  assert.equal(field.value, "AB12 XCD3 4");
  assert.equal(field.selectionStart, 6);
  fireEvent.input(field, { target: { value: "AB12XCD3 4", selectionStart: 4, selectionEnd: 4 }, inputType: "deleteContentBackward" });
  assert.equal(field.value, "AB1X CD34");
  assert.equal(field.selectionStart, 3);
  assert.equal(changes.at(-1), "AB1X CD34");
  assert.equal(new field.ownerDocument.defaultView!.FormData(field.form!).get("reference"), field.value);
});

test("a format respects the native length limit after grouping and lets hosts override entry hints", () => {
  const format = { parse: (text: string) => text.replace(/-/g, ""), format: (raw: string) => raw.length > 2 ? raw.slice(0, 2) + "-" + raw.slice(2) : raw, inputMode: "numeric" as const, autoComplete: "cc-number" };
  const { rerender } = render(<Input format={format} maxLength={4} />);
  const field = screen.getByRole<HTMLInputElement>("textbox");
  assert.equal(field.inputMode, "numeric");
  assert.equal(field.autocomplete, "cc-number");
  fireEvent.input(field, { target: { value: "1234", selectionStart: 4, selectionEnd: 4 }, inputType: "insertFromPaste" });
  assert.equal(field.value, "12-3");
  rerender(<Input format={format} inputMode="text" autoComplete="off" />);
  assert.equal(field.inputMode, "text");
  assert.equal(field.autocomplete, "off");
});
