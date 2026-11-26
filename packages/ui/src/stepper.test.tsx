import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Stepper, StepperPanel, StepperSkeleton, type StepperStep } from "./Stepper.js";

afterEach(cleanup);

const steps: readonly StepperStep[] = [
  { id: "draft", label: <strong>Draft</strong>, description: "Edit the copy", badge: 0 },
  { id: "attachments", label: "Attachments", disabled: true },
  { id: "review", label: "Review", badge: <span>2</span>, badgeLabel: "2 copy edits" },
  { id: "publish", label: "Publish" },
];

test("a controlled stepper exposes ordered steps, current position, descriptions and badge counts", () => {
  const requests: StepperStep[] = [];
  const props = { label: "Publication", steps, onSelect: (step: StepperStep) => requests.push(step) };
  const { rerender } = render(<Stepper {...props} current="review" />);
  const nav = within(screen.getByRole("navigation", { name: "Publication" }));
  assert.equal(nav.getByRole("list").tagName, "OL");
  assert.deepEqual(nav.getAllByRole("listitem").map(item => item.dataset.state), ["done", "done", "current", "upcoming"]);
  assert.ok(nav.getAllByRole("listitem")[0]?.querySelector(".elea-stepper__indicator svg"));
  assert.equal(nav.getByRole("button", { name: "Draft", description: "Edit the copy 0" }).textContent, "Draft");
  const review = nav.getByRole("button", { name: "Review", description: "2 copy edits", current: "step" });
  fireEvent.click(nav.getByRole("button", { name: "Attachments" }));
  fireEvent.click(nav.getByRole("button", { name: "Publish" }));
  assert.deepEqual(requests, [steps[3]]);
  assert.equal(review.getAttribute("aria-current"), "step");
  rerender(<Stepper {...props} current={3} />);
  assert.equal(nav.getByRole("button", { current: "step" }).textContent, "Publish");
});

test("linear navigation allows returning to earlier steps while its footer advances past disabled steps", () => {
  const requests: StepperStep[] = [];
  const props = { steps, linear: true, onSelect: (step: StepperStep) => requests.push(step) };
  const panel = (current: number) => <>
    <Stepper {...props} current={current} label="Workflow" />
    <StepperPanel {...props} current={current} previousLabel="Back" nextLabel="Continue" finish={<button type="submit">Finish</button>} />
  </>;
  const { rerender } = render(panel(0));
  assert.ok(screen.getByRole<HTMLButtonElement>("button", { name: "Back" }).disabled);
  assert.ok(screen.getByRole<HTMLButtonElement>("button", { name: "Review" }).disabled);
  fireEvent.click(screen.getByRole("button", { name: "Review" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  assert.deepEqual(requests, [steps[2]]);
  rerender(panel(2));
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  fireEvent.click(screen.getByRole("button", { name: "Draft" }));
  assert.deepEqual(requests, [steps[2], steps[0], steps[0]]);
  rerender(panel(3));
  assert.ok(screen.getByRole("button", { name: "Finish" }));
  assert.equal(screen.queryByRole("button", { name: "Continue" }), null);
  rerender(<StepperPanel {...props} current={3} previousLabel="Back" nextLabel="Continue" />);
  assert.ok(screen.getByRole<HTMLButtonElement>("button", { name: "Continue" }).disabled);
});

test("arrows, Home and End move focus only, following orientation and reading direction", () => {
  const requests: StepperStep[] = [];
  const props = { label: "Workflow", steps, current: 0, onSelect: (step: StepperStep) => requests.push(step) };
  const { rerender } = render(<Stepper {...props} />);
  const draft = screen.getByRole("button", { name: "Draft" });
  const review = screen.getByRole("button", { name: "Review" });
  const publish = screen.getByRole("button", { name: "Publish" });
  draft.focus();
  fireEvent.keyDown(draft, { key: "ArrowRight" });
  assert.equal(document.activeElement, review);
  fireEvent.keyDown(review, { key: "End" });
  assert.equal(document.activeElement, publish);
  publish.style.direction = "rtl";
  fireEvent.keyDown(publish, { key: "ArrowRight" });
  assert.equal(document.activeElement, review);
  fireEvent.keyDown(review, { key: "Home" });
  assert.equal(document.activeElement, draft);
  rerender(<Stepper {...props} orientation="vertical" />);
  for (const key of ["ArrowRight", "Tab", "Enter", " "]) assert.ok(fireEvent.keyDown(draft, { key }));
  assert.ok(fireEvent.keyDown(draft, { key: "ArrowDown", altKey: true }));
  assert.equal(document.activeElement, draft);
  fireEvent.keyDown(draft, { key: "ArrowDown" });
  assert.equal(document.activeElement, review);
  fireEvent.keyDown(review, { key: "ArrowUp" });
  assert.equal(document.activeElement, draft);
  assert.deepEqual(requests, []);
});

test("empty sequences, unknown positions and a noninteractive loading layout render safely", () => {
  const props = { label: "Flow", onSelect: () => undefined };
  assert.equal(renderToString(<Stepper {...props} current={0} steps={[]} />), "");
  for (const current of ["missing", -1, 0.5, 10]) {
    assert.equal(renderToString(<StepperPanel {...props} steps={steps} current={current} previousLabel="Back" nextLabel="Continue" />), "");
  }
  const { container, rerender } = render(<StepperSkeleton />);
  assert.equal(container.querySelectorAll("li").length, 3);
  assert.equal(screen.queryByRole("list"), null);
  assert.equal(screen.queryByRole("button", { hidden: true }), null);
  rerender(<StepperSkeleton steps={4} orientation="vertical" />);
  assert.equal(container.querySelectorAll('[data-orientation="vertical"] li').length, 4);
  for (const count of [0, -1, Infinity]) assert.equal(renderToString(<StepperSkeleton steps={count} />), "");
});
