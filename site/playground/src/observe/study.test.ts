import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "./model.js";
import { eligibleDuration, exposureTrace, firstQualification, outcomeContrast, outcomeRates, outcomes, uninterruptedTrace } from "./study.js";

test("a hidden interval clears the pending dwell instead of accumulating it", () => {
  assert.equal(firstQualification(exposureTrace), 1050);
  assert.equal(firstQualification(exposureTrace.slice(0, 2)), null);
  assert.equal(firstQualification([{ start: 0, end: 600, ratio: 0.75, visible: true }]), null);
  assert.equal(firstQualification([
    { start: 0, end: 600, ratio: 0.75, visible: true },
    { start: 600, end: 800, ratio: 0.5, visible: true },
  ]), 600);
});

test("equal activation counts can coexist with different bounds on saving", () => {
  const [leading, trailing] = outcomes;
  assert.equal(leading.activated, trailing.activated);
  const a = outcomeRates(leading);
  const b = outcomeRates(trailing);
  assert.deepEqual(a, { missing: 20, observed: 70, lower: 56, upper: 76 });
  assert.equal(b.missing, 5);
  assert.equal(b.observed.toFixed(1), "63.2");
  assert.deepEqual([b.lower, b.upper], [60, 65]);
  const contrast = outcomeContrast();
  assert.deepEqual([contrast.lower, contrast.upper, contrast.observed.toFixed(1)], [-9, 16, "6.8"]);
});

test("the atlas compares equal accumulated time and keeps order within a shared time bucket", () => {
  assert.equal(eligibleDuration(exposureTrace), 950);
  assert.equal(eligibleDuration(uninterruptedTrace), 950);
  assert.equal(firstQualification(uninterruptedTrace), 600);
  assert.deepEqual(sample.slice(-2).map(row => [row.index, row.elapsedMs, row.event.kind]), [
    [4, 2260, "interaction.activated"], [5, 2260, "task.outcome"],
  ]);
});
