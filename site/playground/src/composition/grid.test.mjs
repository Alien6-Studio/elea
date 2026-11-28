import assert from "node:assert/strict";
import test from "node:test";
import { columnGrid, frameForSpan, rowGrid, spanWidth } from "./grid.mjs";

test("the two divisions of the six-column plate fill the same field", () => {
  const { track, inner, starts } = columnGrid(240, 6, 18, 6);
  assert.equal(track, 29);
  assert.deepEqual(starts, [18, 53, 88, 123, 158, 193]);
  assert.equal(spanWidth(track, 6, 2), 64);
  assert.equal(spanWidth(track, 6, 4), 134);
  for (const split of [2, 3]) {
    assert.equal(spanWidth(track, 6, split) + 6 + spanWidth(track, 6, 6 - split), inner);
  }
});

test("fractional tracks preserve the last margin without rounding and a single track uses no gutter", () => {
  const { track, starts } = columnGrid(317, 7, 13, 4);
  assert.ok(Math.abs(starts.at(-1) + track - 304) < 1e-10);
  assert.deepEqual(columnGrid(40, 1, 3, 80), { track: 34, inner: 34, starts: [3] });
});

test("module boundaries fall on the baseline lattice with one empty step between rows", () => {
  const { modules, baseline } = rowGrid(16, 8, 3, 4);
  assert.deepEqual(modules, [{ start: 16, end: 40 }, { start: 48, end: 72 },
    { start: 80, end: 104 }, { start: 112, end: 136 }]);
  assert.equal(baseline.length, 16);
  for (const { start, end } of modules) {
    assert.ok(baseline.includes(start) && baseline.includes(end));
  }
});

test("impossible grids and fractional counts have no geometric solution", () => {
  for (const args of [[20, 2, 8, 4], [10, 2, 8, 2], [40, 0, 2, 1], [40, 2.5, 4, 1], [Number.NaN, 1, 0, 0]]) {
    assert.throws(() => columnGrid(...args), RangeError);
  }
  assert.throws(() => spanWidth(12, 4, 0), RangeError);
  assert.throws(() => rowGrid(0, 0, 2, 1), RangeError);
});

test("working backwards from each role recovers its measure on the shared ruling", () => {
  for (const [measure, span, frame] of [[23, 4, 39], [33, 4, 54], [12, 2, 42],
    [16, 3, 37], [13, 2, 45], [13, 3, 31], [18, 2, 60], [23, 3, 51]]) {
    assert.equal(frameForSpan(measure, span, 6, 2, 1), frame);
    assert.equal(spanWidth(columnGrid(frame, 6, 2, 1).track, 1, span), measure);
  }
  assert.equal(frameForSpan(18, 4, 12, 2, 1), frameForSpan(18, 2, 6, 2, 1));
  assert.equal(frameForSpan(23, 1, 1, 2, 10), 27);
  assert.throws(() => frameForSpan(23, 7, 6, 2, 1), RangeError);
  assert.throws(() => frameForSpan(1, 2, 6, 2, 1), RangeError);
  assert.throws(() => frameForSpan("23", 4, 6, 2, 1), RangeError);
});
