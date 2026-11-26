import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SearchField } from "./SearchField.js";

afterEach(cleanup);

test("SearchField exposes the native search input, host instructions and localized controls", () => {
  const ref = createRef<HTMLInputElement>();
  render(<>
    <p id="hint">Enter an author or a title.</p>
    <SearchField ref={ref} label="Rechercher" placeholder="Titre ou auteur" clearLabel="Effacer"
      aria-describedby="hint" id="query" className="library-query" defaultValue="Ice field" size="sm" />
  </>);
  const field = screen.getByRole<HTMLInputElement>("searchbox", { name: "Rechercher", description: "Enter an author or a title." });
  assert.ok(ref.current === field);
  assert.equal(field.id, "query");
  assert.equal(field.placeholder, "Titre ou auteur");
  assert.ok(field.classList.contains("elea-ui-input--sm"));
  assert.ok(field.parentElement?.classList.contains("library-query"));
  assert.equal(screen.getByRole<HTMLButtonElement>("button", { name: "Effacer" }).type, "button");
  assert.match(renderToStaticMarkup(<SearchField label="Find" name="q" defaultValue="Archive" />), /type="search"/);
});

test("typing and clearing an uncontrolled search notify native and value listeners once", () => {
  const changes: string[] = [];
  const values: string[] = [];
  const inputs: string[] = [];
  render(<form onInput={event => inputs.push((event.target as HTMLInputElement).value)}>
    <SearchField label="Search" clearLabel="Clear" onChange={event => changes.push(event.currentTarget.value)} onValueChange={value => values.push(value)} />
  </form>);
  const field = screen.getByRole<HTMLInputElement>("searchbox");
  assert.equal(screen.queryByRole("button"), null);
  fireEvent.input(field, { target: { value: "Etchings" } });
  const clear = screen.getByRole("button", { name: "Clear" });
  clear.focus();
  fireEvent.click(clear);
  assert.deepEqual(values, ["Etchings", ""]);
  assert.deepEqual(changes, values);
  assert.deepEqual(inputs, values);
  assert.equal(field.value, "");
  assert.ok(document.activeElement === field);
  assert.equal(screen.queryByRole("button"), null);
});

test("a controlled search reflects external edits and the owning form's submitted value", () => {
  let submitted: FormDataEntryValue | null = null;
  function Form() {
    const [query, setQuery] = useState("Archive");
    return <>
      <form id="filters" onSubmit={event => {
        event.preventDefault();
        submitted = new event.currentTarget.ownerDocument.defaultView!.FormData(event.currentTarget).get("q");
      }} />
      <SearchField label="Find an edition" name="q" form="filters" value={query} onValueChange={setQuery} clearLabel="Clear" />
      <button onClick={() => setQuery("Monograph")}>Restore</button>
    </>;
  }
  render(<Form />);
  const field = screen.getByRole<HTMLInputElement>("searchbox");
  assert.equal(field.placeholder, "Find an edition");
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  assert.equal(field.value, "");
  fireEvent.click(screen.getByRole("button", { name: "Restore" }));
  assert.equal(field.value, "Monograph");
  assert.ok(field.form);
  fireEvent.submit(field.form);
  assert.equal(submitted, "Monograph");
});

test("an uncontrolled search follows native reset and only editable fields offer clearing", async () => {
  const options = { label: "Filter", defaultValue: "Starting query", clearLabel: "Clear" };
  const { rerender } = render(<form><SearchField {...options} /></form>);
  const field = screen.getByRole<HTMLInputElement>("searchbox");
  fireEvent.click(screen.getByRole("button"));
  await act(async () => field.form?.reset());
  assert.equal(field.value, "Starting query");
  assert.ok(screen.getByRole("button", { name: "Clear" }));
  rerender(<form><SearchField {...options} readOnly /></form>);
  assert.equal(screen.queryByRole("button"), null);
  rerender(<form><SearchField {...options} disabled /></form>);
  assert.equal(screen.queryByRole("button"), null);
  rerender(<form><SearchField {...options} clearLabel={undefined} /></form>);
  assert.equal(screen.queryByRole("button"), null);
});
