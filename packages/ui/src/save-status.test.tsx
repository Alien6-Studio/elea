import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { SaveStatus } from "./SaveStatus.js";

afterEach(cleanup);

test("SaveStatus keeps one status region whose text follows the state", () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(<SaveStatus ref={ref} state="saving" className="mine" data-testid="status">Saving</SaveStatus>);
  const root = screen.getByTestId("status");
  assert.equal(ref.current, root);
  assert.equal(root.className, "elea-save-status elea-save-status--saving mine");
  assert.equal(root.dataset.state, "saving");
  const region = screen.getByRole("status");
  assert.equal(region.textContent, "Saving");
  assert.ok(region.querySelector('.elea-save-status__icon[aria-hidden="true"] .elea-save-status__spinner'));
  rerender(<SaveStatus state="saved" data-testid="status">Saved at 12:12</SaveStatus>);
  assert.equal(screen.getByRole("status"), region);
  assert.equal(region.textContent, "Saved at 12:12");
  assert.ok(region.querySelector("svg"));
  rerender(<SaveStatus state="idle" data-testid="status" />);
  assert.equal(screen.getByRole("status"), region);
  assert.equal(region.childElementCount, 0);
});

test("SaveStatus offers to retry only after a failure, outside the status region", () => {
  let retries = 0;
  const { rerender } = render(<SaveStatus state="saved" onRetry={() => { retries += 1; }} retryLabel="Retry">Saved</SaveStatus>);
  assert.equal(screen.queryByRole("button"), null);
  rerender(<SaveStatus state="error" onRetry={() => { retries += 1; }} retryLabel="Retry">Not saved</SaveStatus>);
  const button = screen.getByRole("button", { name: "Retry" });
  assert.equal(button.getAttribute("type"), "button");
  assert.equal(screen.getByRole("status").contains(button), false);
  fireEvent.click(button);
  assert.equal(retries, 1);
  rerender(<SaveStatus state="error">Not saved</SaveStatus>);
  assert.equal(screen.queryByRole("button"), null);
});

test("SaveStatus passes an axe audit in each state", async () => {
  const { container } = render(
    <main>
      <SaveStatus state="saving">Saving</SaveStatus>
      <SaveStatus state="saved">Saved at 12:12</SaveStatus>
      <SaveStatus state="error" onRetry={() => {}} retryLabel="Retry">Not saved</SaveStatus>
    </main>,
  );
  const results = await axe.run(container, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false } } });
  assert.deepEqual(results.violations.map((violation) => violation.id), []);
});
