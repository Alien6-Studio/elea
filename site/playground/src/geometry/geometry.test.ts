import assert from "node:assert/strict";
import { test } from "node:test";
import {
  auditContours, curveOf, scaleOf, type AuditedBox, type RuleId,
  concentricRadius, curvatures, cutCompensation, diagonalCurvature, diagonalCut, fitRadii, gap, matchCut,
  measureCorner, offsetContour, polygonArea, rectangleContour, removedArea, scaleCorner, spiralCorner,
  superellipseCorner, superellipseRemovedArea, toPath, vertexCubicCorner, type CornerSpec, type Point,
} from "./index.js";

const close = (actual: number, expected: number, tolerance: number) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

const corners = (radius: number, curve: number) => {
  const corner: CornerSpec = { radius, curve };
  return [corner, corner, corner, corner] as const;
};

test("curve 1 is a circular arc", () => {
  for (const [x, y] of superellipseCorner(1)) close(Math.hypot(x - 1, y - 1), 1, 1e-12);
  const { extent, cut, peakCurvature, deviation } = measureCorner(superellipseCorner(1, 1, 1, 256));
  close(extent, 1, 1e-12);
  close(cut, Math.SQRT2 - 1, 1e-12);
  close(peakCurvature, 1, 1e-4);
  close(deviation, 0, 1e-12);
});

test("a corner is symmetric about its diagonal", () => {
  for (const corner of [superellipseCorner(2), superellipseCorner(-1.5), spiralCorner(0.5), vertexCubicCorner()]) {
    corner.forEach(([x, y], index) => {
      const [mx, my] = corner[corner.length - 1 - index]!;
      close(x, my, 1e-9);
      close(y, mx, 1e-9);
    });
  }
});

test("the sampled cut matches its closed form", () => {
  for (const curve of [-2, -1, 0, 0.5, 1, 1.5, 2, 3, 4]) {
    close(Math.hypot(...superellipseCorner(curve)[48]!), diagonalCut(curve), 1e-9);
  }
});

test("compensation keeps the cut of the circular corner", () => {
  for (const curve of [1.5, 2, 2.5, 3]) {
    const corner = scaleCorner(superellipseCorner(curve), cutCompensation(curve));
    close(measureCorner(corner).cut, diagonalCut(1), 1e-9);
    close(measureCorner(matchCut(superellipseCorner(curve))).extent, cutCompensation(curve), 1e-9);
  }
  close(cutCompensation(2), 1.8409, 5e-5);
});

test("sampled curvature matches the closed form on the diagonal", () => {
  for (const curve of [1, 1.5, 2, 2.5]) {
    const corner = superellipseCorner(curve, 1, 1, 512);
    close(curvatures(corner)[256]!, diagonalCurvature(curve), 1e-3);
  }
  close(diagonalCurvature(2) / cutCompensation(2), 1.3704, 5e-5);
});

test("sampled area matches the gamma closed form", () => {
  close(superellipseRemovedArea(1), 1 - Math.PI / 4, 1e-12);
  for (const curve of [0.5, 1, 2, 3]) {
    close(removedArea(superellipseCorner(curve, 1, 1, 2048)), superellipseRemovedArea(curve), 1e-5);
  }
});

test("limit curves are the bevel, the square and the notch", () => {
  for (const [x, y] of superellipseCorner(0)) close(x + y, 1, 1e-12);
  assert.deepEqual(superellipseCorner(Infinity, 2, 3), [[2, 0], [0, 0], [0, 3]]);
  assert.deepEqual(superellipseCorner(-Infinity, 2, 3), [[2, 0], [2, 3], [0, 3]]);
  close(removedArea(superellipseCorner(-1, 1, 1, 2048)), Math.PI / 4, 1e-5);
});

test("a spiral corner turns a quarter and peaks at the arc curvature", () => {
  const corner = spiralCorner(0.5, 256);
  const [x, y] = corner.at(-1)!;
  close(x, 0, 1e-9);
  close(y, corner[0]![0], 1e-6);
  close(Math.max(...curvatures(corner)), 1, 1e-3);
  close(measureCorner(matchCut(corner)).extent, 1.3026, 5e-4);
});

test("radii shrink together when they overlap", () => {
  assert.deepEqual(fitRadii({ width: 100, height: 40, corners: corners(30, 1) }), [20, 20, 20, 20]);
  assert.deepEqual(fitRadii({ width: 100, height: 40, corners: corners(8, 1) }), [8, 8, 8, 8]);
});

test("a rectangle contour is closed, bounded and loses four corners", () => {
  const spec = { width: 200, height: 120, corners: corners(40, 2) };
  const contour = rectangleContour(spec, 512);
  for (const [x, y] of contour) assert.ok(x >= -1e-9 && x <= 200 + 1e-9 && y >= -1e-9 && y <= 120 + 1e-9);
  close(polygonArea(contour), 200 * 120 - 4 * 40 * 40 * superellipseRemovedArea(2), 0.5);
  assert.match(toPath(contour), /^M[\d. ]+(L[\d. ]+)+Z$/);
});

test("concentric circular corners keep a constant gap", () => {
  const inset = 12;
  const outer = rectangleContour({ width: 240, height: 160, corners: corners(40, 1) }, 256);
  const radius = concentricRadius(40, inset);
  const inner = rectangleContour({ width: 240 - 2 * inset, height: 160 - 2 * inset, corners: corners(radius, 1) }, 64)
    .map(([x, y]): Point => [x + inset, y + inset]);
  const { min, max } = gap(outer, inner, true);
  close(min, inset, 1e-2);
  close(max, inset, 1e-2);
  const same = rectangleContour({ width: 240 - 2 * inset, height: 160 - 2 * inset, corners: corners(40, 1) }, 64)
    .map(([x, y]): Point => [x + inset, y + inset]);
  assert.ok(gap(outer, same, true).max > inset * 1.1);
  assert.equal(concentricRadius(8, 12, 2), 2);
});

test("an offset contour stays at its distance", () => {
  const outer = rectangleContour({ width: 240, height: 160, corners: corners(48, 2) }, 256);
  const { min, max } = gap(outer, offsetContour(outer, -6), true);
  close(min, 6, 5e-2);
  close(max, 6, 5e-2);
});

test("a contour is computed well within a frame", () => {
  const spec = { width: 320, height: 200, corners: corners(48, 2) };
  rectangleContour(spec);
  const start = performance.now();
  for (let index = 0; index < 200; index += 1) toPath(rectangleContour(spec));
  assert.ok((performance.now() - start) / 200 < 2, "more than 2 ms per contour");
});

const box = (label: string, parent: number, x: number, size: number, radius: number, extra: Partial<AuditedBox> = {}): AuditedBox =>
  ({ label, parent, x, y: x, width: size, height: size, radii: [radius, radius, radius, radius], clipped: false, ...extra });
const result = (boxes: AuditedBox[], rule: RuleId, options = {}) => auditContours(boxes, options).find(entry => entry.rule === rule)!;

test("computed corner shapes resolve to a curve parameter", () => {
  assert.equal(curveOf(), 1);
  assert.equal(curveOf("round"), 1);
  assert.equal(curveOf("squircle"), 2);
  assert.equal(curveOf("superellipse(1.5)"), 1.5);
  assert.equal(curveOf("superellipse(-infinity)"), -Infinity);
  assert.equal(curveOf("square"), Infinity);
});

test("every rule holds or fails, and holds when nothing falls under it", () => {
  const results = auditContours([box("card", -1, 0, 200, 0)]);
  assert.deepEqual(results.map(entry => entry.rule), ["radius-and-curve", "continuity-on-large-contours", "nested-radii", "border-not-clip", "distinct-steps"]);
  assert.ok(results.every(entry => entry.passed && entry.assessed === 0));
});

test("the audit accepts a concentric inner radius and reports a static one", () => {
  const card = box("card", -1, 0, 200, 24);
  assert.equal(result([card, box("media", 0, 8, 184, 16)], "nested-radii").passed, true);
  const report = result([card, box("media", 0, 8, 184, 6)], "nested-radii");
  assert.equal(report.passed, false);
  assert.equal(report.findings.length, 4);
  assert.match(report.findings[0]!.message, /inner radius 6 px, expected 16 px/);
  // Past the outer radius the inner corner has left the corner of the card: the rule constrains nothing.
  assert.equal(result([card, box("media", 0, 40, 120, 6)], "nested-radii").assessed, 0);
  assert.equal(result([card, box("media", 0, 22, 156, 4)], "nested-radii", { minimumRadius: 4 }).passed, true);
});

test("the audit compares drawn radii, so a pill inside a pill is concentric", () => {
  const report = result([box("track", -1, 0, 40, 9999), box("thumb", 0, 4, 32, 9999)], "nested-radii");
  assert.equal(report.passed, true);
  assert.equal(report.assessed, 4);
});

test("the audit reads both radii of an elliptical corner", () => {
  const elliptical = (label: string, parent: number, x: number, size: number, horizontal: number, vertical: number) =>
    box(label, parent, x, size, horizontal, { vertical: [vertical, vertical, vertical, vertical] });
  const card = elliptical("card", -1, 0, 200, 24, 12);
  assert.equal(result([card, elliptical("media", 0, 8, 184, 16, 4)], "nested-radii").passed, true);
  const report = result([card, elliptical("media", 0, 8, 184, 16, 12)], "nested-radii");
  assert.equal(report.passed, false);
  assert.match(report.findings[0]!.message, /inner radius 16 px \/ 12 px, expected 16 px \/ 4 px/);
  // The corner ends at its shorter radius: past it, the inner contour is clear of the curve.
  assert.equal(result([card, elliptical("media", 0, 12, 176, 6, 6)], "nested-radii").assessed, 0);
});

test("the audit tells steps a screen can draw from steps it cannot", () => {
  const step = (name: string, radius: number, size = 40) => ({ name, box: box(name, -1, 0, size, radius) });
  const steps = (...radii: number[]) => ({ scales: [scaleOf("button", radii.map((radius, index) => step(`step ${index + 1}`, radius)))] });
  assert.equal(result([], "distinct-steps", steps(4, 6, 12)).passed, true);
  const report = result([], "distinct-steps", steps(1.5, 2.25, 3));
  assert.equal(report.passed, false);
  assert.equal(report.findings.length, 2);
  assert.match(report.findings[0]!.message, /step 1 and step 2 are 0.8 px apart/);
  // Steps that coincide are one step, as on a square scale or once a pill has taken half the height.
  assert.equal(result([], "distinct-steps", steps(0, 0, 0)).assessed, 0);
  assert.equal(result([], "distinct-steps", steps(20, 9999, 9999)).assessed, 0);
  assert.equal(result([], "distinct-steps", { ...steps(1.5, 2.25), pixel: 0.5 }).passed, true);
});

test("the audit reports a clipped contour and a curve too small to be seen", () => {
  assert.equal(result([box("avatar", -1, 0, 40, 20, { clipped: true })], "border-not-clip").passed, false);
  assert.equal(result([box("avatar", -1, 0, 40, 20)], "border-not-clip").passed, true);
  const shapes = ["squircle", "round", "round", "round"] as const;
  assert.equal(result([box("chip", -1, 0, 24, 4, { shapes })], "continuity-on-large-contours").passed, false);
  assert.equal(result([box("sheet", -1, 0, 600, 80, { shapes })], "continuity-on-large-contours").passed, true);
});

test("the audit checks that a curve keeps the cut of a radius on the scale", () => {
  const scale = [4, 8, 16, 24];
  const shapes = ["superellipse(2)", "round", "round", "round"] as const;
  const compensated = box("sheet", -1, 0, 600, 24 * cutCompensation(2), { shapes });
  assert.equal(result([compensated], "radius-and-curve", { radiusScale: scale }).passed, true);
  assert.equal(result([box("sheet", -1, 0, 600, 24, { shapes })], "radius-and-curve", { radiusScale: scale }).passed, false);
  assert.equal(result([compensated], "radius-and-curve").passed, false);
});

test("the radius scale checks both axes of each shaped corner", () => {
  const factor = cutCompensation(2);
  const shape = box("sheet", -1, 0, 600, 16 * factor, {
    vertical: [11 * factor, 24, 24, 24],
    shapes: ["squircle", "round", "round", "round"],
  });
  const report = result([shape], "radius-and-curve", { radiusScale: [8, 16] });
  assert.equal(report.assessed, 1);
  assert.equal(report.passed, false);
  assert.match(report.findings[0]!.message, /cuts like 16 px \/ 11 px/);
});
