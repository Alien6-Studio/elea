import assert from "node:assert/strict";
import { test } from "node:test";
import { auditLayout, type LayoutRuleId, type MeasuredLayout } from "./audit.js";

// Four columns of 100 px with a 20 px gutter, in a viewport of 500 px with a 10 px margin
const ruled: MeasuredLayout = {
  viewport: 500,
  extent: 500,
  starts: [10, 130, 250, 370],
  ends: [110, 230, 350, 470],
  headings: [{ label: "h1", left: 10, right: 470 }],
  blocks: [{ label: "figure", left: 130, right: 470 }],
  groups: [{ label: "nav", left: 250, right: 300 }],
  measures: [{ label: "aside", width: 100, measure: 100 }],
};

const broken = (layout: MeasuredLayout) => auditLayout(layout).filter(result => !result.passed).map(result => result.rule);
const findings = (layout: MeasuredLayout, rule: LayoutRuleId) => auditLayout(layout).find(result => result.rule === rule)!.findings;

test("a page composed on its columns holds every rule", () => {
  assert.deepEqual(broken(ruled), []);
  assert.deepEqual(auditLayout(ruled).map(result => result.assessed), [1, 1, 1, 1, 1]);
});

test("a rule holds when nothing falls under it", () => {
  assert.deepEqual(broken({ ...ruled, headings: [], blocks: [], groups: [], measures: [] }), []);
});

test("an edge within a pixel of a line is on it", () => {
  assert.deepEqual(broken({ ...ruled, headings: [{ label: "h1", left: 130.9, right: 470 }], blocks: [{ label: "figure", left: 9.2, right: 470.8 }] }), []);
});

test("a page wider than its viewport scrolls sideways", () => {
  assert.deepEqual(findings({ ...ruled, extent: 540 }, "no-sideways-scroll"), [{ label: "page", message: "scrolls 40 px sideways" }]);
});

test("a heading answers for its start alone", () => {
  assert.deepEqual(broken({ ...ruled, headings: [{ label: "h2", left: 130, right: 300 }] }), []);
  assert.deepEqual(findings({ ...ruled, headings: [{ label: "h2", left: 142, right: 470 }] }, "headings-on-lines"),
    [{ label: "h2", message: "starts 12.0 px after the nearest line" }]);
});

test("a block answers for both of its edges", () => {
  assert.deepEqual(findings({ ...ruled, blocks: [{ label: "figure", left: 130, right: 340 }] }, "blocks-on-lines"),
    [{ label: "figure", message: "ends 10.0 px before the nearest line" }]);
  assert.deepEqual(findings({ ...ruled, blocks: [{ label: "figure", left: 125, right: 480 }] }, "blocks-on-lines"),
    [{ label: "figure", message: "starts 5.0 px before the nearest line, ends 10.0 px after the nearest line" }]);
});

test("a group is anchored by either edge", () => {
  assert.deepEqual(broken({ ...ruled, groups: [{ label: "nav", left: 300, right: 470 }] }), []);
  assert.deepEqual(findings({ ...ruled, groups: [{ label: "nav", left: 260, right: 300 }] }, "groups-on-lines"),
    [{ label: "nav", message: "starts 10.0 px after the nearest line, ends 50.0 px before the nearest line" }]);
});

test("a block narrower than its measure breaks it", () => {
  assert.deepEqual(broken({ ...ruled, measures: [{ label: "aside", width: 99.5, measure: 100 }] }), []);
  assert.deepEqual(findings({ ...ruled, measures: [{ label: "aside", width: 88, measure: 100 }] }, "measures-held"),
    [{ label: "aside", message: "is 12.0 px narrower than its measure" }]);
});
