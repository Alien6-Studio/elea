// Audit of drawn contours against the rules of the geometry study. It
// works on measured boxes, so the same rules apply to any system: collect the
// boxes from a page with `collectBoxes`, or describe them by hand.
import { concentricRadius, cutCompensation, superellipseCorner } from "./corner.js";
import { gap } from "./measure.js";

export interface AuditedBox {
  /** A name a person can find in the page, such as a selector. */
  label: string;
  /** Index of the nearest ancestor in the list, or -1. */
  parent: number;
  /** Border box, in CSS pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Declared horizontal radii: top left, top right, bottom right, bottom left. */
  radii: readonly [number, number, number, number];
  /** Declared vertical radii of elliptical corners; the horizontal ones when absent. */
  vertical?: readonly [number, number, number, number];
  /** Computed shapes clockwise from the top left; empty or `round` gives an arc. */
  shapes?: readonly [string, string, string, string];
  /** True when a clip path or a mask cuts the box. */
  clipped: boolean;
}

export interface AuditOptions {
  /** Largest accepted difference between a radius and the one a rule gives, in pixels. */
  tolerance?: number;
  /** Smallest radius an inner contour may resolve to. */
  minimumRadius?: number;
  /** The radius scale of the system. A curved contour fails the first rule when it is missing. */
  radiusScale?: readonly number[];
  /** Size of a device pixel in CSS pixels. */
  pixel?: number;
  /** The scales the system offers, each step measured on a contour of the size it is meant for. */
  scales?: readonly AuditedScale[];
}

export interface AuditedScale {
  label: string;
  steps: readonly { name: string; radii: readonly number[] }[];
}

export type RuleId = "radius-and-curve" | "continuity-on-large-contours" | "nested-radii" | "border-not-clip" | "distinct-steps";

export interface Finding {
  label: string;
  message: string;
}

export interface RuleResult {
  rule: RuleId;
  title: string;
  /** A rule holds when no contour breaks it, including when no contour falls under it. */
  passed: boolean;
  /** Number of corners or boxes the rule constrains. */
  assessed: number;
  findings: Finding[];
}

const KEYWORDS: Record<string, number> = { round: 1, squircle: 2, bevel: 0, scoop: -1, notch: -Infinity, square: Infinity };

/** The `superellipse()` parameter of a computed `corner-shape` value; a circular arc when the value is unknown. */
export function curveOf(shape = "round") {
  const value = shape.trim().split(/\s+(?![^(]*\))/)[0] ?? "round";
  const parameter = /^superellipse\(\s*(-?infinity|[-+\d.e]+)\s*\)$/i.exec(value)?.[1];
  if (parameter === undefined) return KEYWORDS[value] ?? 1;
  if (!/infinity/i.test(parameter)) return Number(parameter);
  return parameter.startsWith("-") ? -Infinity : Infinity;
}

/** Radii as drawn, horizontal then vertical: overlapping corners shrink together, as CSS specifies. */
function drawn({ width, height, radii, vertical = radii }: AuditedBox) {
  const [tl, tr, br, bl] = radii;
  const [vtl, vtr, vbr, vbl] = vertical;
  const fit = (length: number, sum: number) => (sum > length ? length / sum : 1);
  const factor = Math.min(fit(width, tl + tr), fit(width, bl + br), fit(height, vtl + vbl), fit(height, vtr + vbr));
  return [radii.map(radius => radius * factor), vertical.map(radius => radius * factor)] as const;
}

/** A scale read from measured boxes, one step per box, for the `scales` option of the audit. */
export function scaleOf(label: string, steps: readonly { name: string; box: AuditedBox }[]): AuditedScale {
  return { label, steps: steps.map(({ name, box }) => ({ name, radii: drawn(box).flat() })) };
}

/** Distance from each corner of `inner` to the same corner of `outer`, along x and y. */
function insets(outer: AuditedBox, inner: AuditedBox): (readonly [number, number])[] {
  const left = inner.x - outer.x;
  const top = inner.y - outer.y;
  const right = outer.x + outer.width - inner.x - inner.width;
  const bottom = outer.y + outer.height - inner.y - inner.height;
  return [[left, top], [right, top], [right, bottom], [left, bottom]];
}

const px = (value: number) => `${Math.round(value * 10) / 10} px`;
const CORNERS = ["top left", "top right", "bottom right", "bottom left"] as const;
const showRadii = ([horizontal, vertical]: readonly [number, number]) =>
  horizontal === vertical ? px(horizontal) : `${px(horizontal)} / ${px(vertical)}`;

/** Evaluates the rules of the study on a list of boxes and on the scales of the system. */
export function auditContours(boxes: readonly AuditedBox[], options: AuditOptions = {}): RuleResult[] {
  const { tolerance = 1, minimumRadius = 0, radiusScale, pixel = 1 } = options;
  const rounded = boxes.filter(box => box.radii.some(radius => radius > 0));

  const compensation: Finding[] = [];
  const continuity: Finding[] = [];
  let curvedCorners = 0;
  let continuousCorners = 0;
  for (const box of rounded) {
    const [horizontal, vertical] = drawn(box);
    CORNERS.forEach((corner, index) => {
      const curve = curveOf(box.shapes?.[index]);
      const radiusX = horizontal[index]!;
      const radiusY = vertical[index]!;
      if (Math.min(radiusX, radiusY) <= 0 || !Number.isFinite(curve) || curve === 1) return;

      curvedCorners += 1;
      const factor = cutCompensation(curve);
      const referenceX = radiusX / factor;
      const referenceY = radiusY / factor;
      const label = `${box.label} (${corner})`;
      if ([referenceX, referenceY].some(radius => !radiusScale?.some(step => Math.abs(step - radius) <= tolerance))) {
        compensation.push({
          label,
          message: `radius ${showRadii([radiusX, radiusY])} with curve ${curve} cuts like ${showRadii([referenceX, referenceY])}, outside the radius scale`,
        });
      }

      // Convex superellipses above the round exponent have continuous curvature at the joins.
      if (curve <= 1) return;
      continuousCorners += 1;
      const reference = superellipseCorner(1, referenceX, referenceY);
      const contour = superellipseCorner(curve, radiusX, radiusY);
      const { max: deviation } = gap([[radiusX, 0], ...reference, [0, radiusY]], contour);
      if (deviation < pixel) {
        continuity.push({ label, message: `curve ${curve} moves the sampled contour by ${px(deviation)} at most, less than a pixel` });
      }
    });
  }

  const nested: Finding[] = [];
  let pairs = 0;
  boxes.forEach(inner => {
    const outer = boxes[inner.parent];
    if (!outer) return;
    const outerRadii = drawn(outer);
    const innerRadii = drawn(inner);
    insets(outer, inner).forEach(([insetX, insetY], corner) => {
      const outerRadius = [outerRadii[0][corner]!, outerRadii[1][corner]!] as const;
      const innerRadius = [innerRadii[0][corner]!, innerRadii[1][corner]!] as const;
      // Radius subtraction aligns the centres of arcs. Other corner shapes need a parallel contour.
      if (curveOf(outer.shapes?.[corner]) !== 1 || curveOf(inner.shapes?.[corner]) !== 1) return;
      if (Math.min(...innerRadius) <= 0 || Math.min(insetX, insetY) < 0 || Math.abs(insetX - insetY) > tolerance
        || insetX >= outerRadius[0] || insetY >= outerRadius[1]) return;
      pairs += 1;
      const expected = [concentricRadius(outerRadius[0], insetX, minimumRadius),
        concentricRadius(outerRadius[1], insetY, minimumRadius)] as const;
      if (expected.every((radius, axis) => Math.abs(innerRadius[axis]! - radius) <= tolerance)) return;
      nested.push({
        label: `${outer.label} > ${inner.label}`,
        message: `${CORNERS[corner]}: inner radius ${showRadii(innerRadius)}, expected ${showRadii(expected)} (outer ${showRadii(outerRadius)}, inset ${showRadii([insetX, insetY])})`,
      });
    });
  });

  const clipped = rounded.filter(box => box.clipped)
    .map(box => ({ label: box.label, message: "a clip path or a mask cuts this contour, with its border, shadow and focus outline" }));

  // Steps that coincide are one step; steps that differ must differ by something a screen can draw.
  const steps: Finding[] = [];
  let comparisons = 0;
  for (const scale of options.scales ?? []) {
    scale.steps.forEach((step, index) => scale.steps.slice(index + 1).forEach(other => {
      const apart = Math.max(...step.radii.map((radius, component) => Math.abs(radius - (other.radii[component] ?? radius))));
      if (apart === 0) return;
      comparisons += 1;
      if (apart < pixel) steps.push({ label: scale.label, message: `${step.name} and ${other.name} are ${px(apart)} apart at most, less than a pixel` });
    }));
  }

  const rule = (id: RuleId, title: string, assessed: number, findings: Finding[]): RuleResult =>
    ({ rule: id, title, passed: findings.length === 0, assessed, findings });

  return [
    rule("radius-and-curve", "A curve keeps the cut of a radius on the scale", curvedCorners, compensation),
    rule("continuity-on-large-contours", "A continuous curve is used where it moves the contour by a pixel or more", continuousCorners, continuity),
    rule("nested-radii", "Inlaid arcs share a centre", pairs, nested),
    rule("border-not-clip", "A rounded contour is drawn by its border, not by a clip", rounded.length, clipped),
    rule("distinct-steps", "Two steps of a scale are a pixel apart or the same step", comparisons, steps),
  ];
}

/**
 * Measures the boxes that draw a contour under `selector`. It runs in a page and
 * refers to nothing outside its body, so it can be handed to a browser driver.
 * A figure that draws a broken rule on purpose is marked `data-geometry-specimen`
 * and left out with everything inside it.
 */
export function collectBoxes(selector = "body"): AuditedBox[] {
  const boxes: AuditedBox[] = [];
  const indexes = new Map<Element, number>();
  // A computed radius can still be a percentage or a function: a hidden probe resolves it to pixels.
  const basis = document.createElement("div");
  basis.dataset.geometrySpecimen = "";
  basis.style.cssText = "position:absolute;visibility:hidden;height:0";
  const probe = basis.appendChild(document.createElement("div"));
  document.documentElement.append(basis);
  for (const root of document.querySelectorAll(selector)) {
    for (const element of [root, ...root.querySelectorAll("*")]) {
      if (indexes.has(element) || !element.checkVisibility() || element.closest("[data-geometry-specimen]")) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const painted = !/^(rgba\(.*,\s*0\)|transparent)$/.test(style.backgroundColor) || style.backgroundImage !== "none"
        || style.boxShadow !== "none" || (Number.parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none");
      if (!painted || rect.width === 0 || rect.height === 0) continue;
      const corners = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius]
        .map(value => value.trim().split(/\s+(?![^(]*\))/));
      // Horizontal then vertical radius of each corner. No helper is named here: the function travels as source.
      const resolved = corners.flatMap(([horizontal = "0px", second = horizontal]) => [
        [horizontal, rect.width] as const,
        [second, second === horizontal && !/[%(]/.test(second) ? rect.width : rect.height] as const,
      ]).map(([value, length]) => {
        if (/^[\d.e+-]+px$/.test(value)) return Number.parseFloat(value);
        basis.style.width = `${length}px`;
        probe.style.width = value;
        return Number.parseFloat(getComputedStyle(probe).width) || 0;
      });
      const radii = resolved.filter((_, index) => index % 2 === 0);
      const vertical = resolved.filter((_, index) => index % 2 === 1);
      let parent = -1;
      for (let ancestor = element.parentElement; ancestor && parent < 0; ancestor = ancestor.parentElement) {
        parent = indexes.get(ancestor) ?? -1;
      }
      indexes.set(element, boxes.length);
      boxes.push({
        label: element.tagName.toLowerCase() + [...element.classList].map(name => `.${name}`).join(""),
        parent,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        radii: radii as [number, number, number, number],
        vertical: vertical as [number, number, number, number],
        shapes: [
          style.getPropertyValue("corner-top-left-shape"),
          style.getPropertyValue("corner-top-right-shape"),
          style.getPropertyValue("corner-bottom-right-shape"),
          style.getPropertyValue("corner-bottom-left-shape"),
        ],
        clipped: style.clipPath !== "none" || (style.maskImage || "none") !== "none",
      });
    }
  }
  basis.remove();
  return boxes;
}
