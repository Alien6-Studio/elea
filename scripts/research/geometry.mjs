// Computes the corner constructions of the "Geometry of interfaces" study and
// writes its figures between the `<!-- figure:id -->` markers of the page.
// Usage: node scripts/research/geometry.mjs [--numbers]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PAGE = fileURLToPath(new URL("../../docs/research/geometry-of-interfaces.md", import.meta.url));
const SAMPLES = 1600;
const CUT = Math.SQRT2 - 1; // Distance from the vertex to a circular corner of radius 1.

// Every corner lives in one frame: the vertex is the origin, the two edges run
// along +x and +y, and the curve goes from (E, 0) to (0, E).
const steps = (count) => Array.from({ length: count + 1 }, (_, index) => index / count);

function superellipse(exponent, a = 1, b = 1, count = SAMPLES) {
  return steps(count).map((step) => {
    const cos = Math.cos((step * Math.PI) / 2);
    const sin = Math.sin((step * Math.PI) / 2);
    const scale = (cos ** exponent + sin ** exponent) ** (-1 / exponent);
    return [a * (1 - sin * scale), b * (1 - cos * scale)];
  });
}

/** Concave corners mirror the convex curve across the chord, as CSS does. */
function concave(exponent) {
  return superellipse(exponent, 1, 1, 200).map(([x, y]) => [1 - y, 1 - x]);
}

/** A cubic Bézier whose two handles sit on the vertex. */
function vertexCubic() {
  return steps(SAMPLES).map((t) => [(1 - t) ** 3, t ** 3]);
}

/** Euler spiral, circular arc, Euler spiral. `share` is the part of the turn made in the spirals. */
function spiralBlend(share) {
  const spiralTurn = (share * Math.PI) / 4;
  const spiral = 2 * spiralTurn;
  const arc = Math.PI / 2 - 2 * spiralTurn;
  const length = 2 * spiral + arc;
  const curvature = (s) => Math.min(1, s / spiral, (length - s) / spiral);
  const points = [[0, 0]];
  let heading = 0;
  const ds = length / (SAMPLES * 8);
  for (let index = 0; index < SAMPLES * 8; index += 1) {
    const [x, y] = points.at(-1);
    const mid = heading + (curvature((index + 0.5) * ds) * ds) / 2;
    points.push([x + Math.cos(mid) * ds, y + Math.sin(mid) * ds]);
    heading += curvature((index + 0.5) * ds) * ds;
  }
  const extent = points.at(-1)[0];
  return points.filter((_, index) => index % 8 === 0).map(([x, y]) => [extent - x, y]);
}

const scale = (points, factor) => points.map(([x, y]) => [x * factor, y * factor]);
const norm = ([x, y]) => Math.hypot(x, y);

/** Scales a corner so that it passes at the same distance from the vertex as a unit circle. */
function matchCut(points) {
  return scale(points, CUT / Math.min(...points.map(norm)));
}

function mengerCurvature(points) {
  return points.map((point, index) => {
    if (index === 0 || index === points.length - 1) return 0;
    const [ax, ay] = points[index - 1];
    const [bx, by] = point;
    const [cx, cy] = points[index + 1];
    const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const product = Math.hypot(bx - ax, by - ay) * Math.hypot(cx - bx, cy - by) * Math.hypot(cx - ax, cy - ay);
    return product === 0 ? 0 : Math.abs((2 * cross) / product);
  });
}

function arcLengths(points) {
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    lengths.push(lengths[index - 1] + Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]));
  }
  return lengths;
}

/** Distance from a point to the contour of a circular corner of radius 1. */
function distanceToCircularCorner([x, y]) {
  if (x > 1) return Math.abs(y);
  if (y > 1) return Math.abs(x);
  return Math.abs(Math.hypot(x - 1, y - 1) - 1);
}

function removedArea(points) {
  let area = 0;
  const ring = [[0, 0], ...points];
  ring.forEach(([x, y], index) => {
    const [nx, ny] = ring[(index + 1) % ring.length];
    area += x * ny - nx * y;
  });
  return Math.abs(area) / 2;
}

function describe(points) {
  const curvature = mengerCurvature(points);
  return {
    extent: points[0][0],
    peakCurvature: Math.max(...curvature),
    endCurvature: curvature[1],
    deviation: Math.max(...points.map(distanceToCircularCorner)),
    removedArea: removedArea(points),
  };
}

function distanceToSegment([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/** Smallest and largest distance from an inner corner to an outer contour, edges included. */
function gap(outer, inner) {
  const contour = [[50, 0], ...outer, [0, 50]];
  const distances = inner.map((point) => {
    let best = Infinity;
    for (let index = 1; index < contour.length; index += 1) best = Math.min(best, distanceToSegment(point, contour[index - 1], contour[index]));
    return best;
  });
  return { min: Math.min(...distances), max: Math.max(...distances) };
}

const inset = (points, distance) => points.map(([x, y]) => [x + distance, y + distance]);

/** Searches the superellipse corner that stays closest to a constant inset. */
function fitInset(outer, distance) {
  let best = { error: Infinity };
  for (let radius = 0.2; radius <= 1.2; radius += 0.01) {
    for (let k = 0.6; k <= 3; k += 0.05) {
      const { min, max } = gap(outer, inset(superellipse(2 ** k, radius, radius, 120), distance));
      const error = Math.max(max - distance, distance - min) / distance;
      if (error < best.error) best = { error, radius, k };
    }
  }
  return best;
}

const families = {
  circle: { label: "Circular arc", points: superellipse(2) },
  squircle: { label: "Superellipse, exponent 4", points: matchCut(superellipse(4)) },
  spiral: { label: "Spiral, arc, spiral", points: matchCut(spiralBlend(0.5)) },
  cubic: { label: "Cubic, handles on the vertex", points: matchCut(vertexCubic()) },
};

function numbers() {
  const outer = superellipse(4, 1, 1, 400);
  const circle = superellipse(2, 1, 1, 400);
  const ellipse = superellipse(2, 1.5, 0.625, 400);
  const report = { families: Object.fromEntries(Object.entries(families).map(([id, { points }]) => [id, describe(points)])) };
  report.compensation = Object.fromEntries([1.5, 2, 2.5, 3].map((k) => [k, (1 - 2 ** -0.5) / (1 - 2 ** (-1 / 2 ** k))]));
  report.equalArea = Math.sqrt(removedArea(superellipse(2)) / removedArea(superellipse(4)));
  report.nesting = {};
  for (const distance of [0.25, 0.5]) {
    report.nesting[distance] = {
      sameRadius: gap(circle, inset(superellipse(2, 1, 1, 200), distance)),
      concentricCircle: gap(circle, inset(superellipse(2, 1 - distance, 1 - distance, 200), distance)),
      scaledSquircle: gap(outer, inset(superellipse(4, 1 - distance, 1 - distance, 200), distance)),
      fittedSquircle: fitInset(outer, distance),
    };
  }
  report.ellipse = gap(ellipse, inset(superellipse(2, 1.5 - 0.3125, 0.625 - 0.3125, 200), 0.3125));
  return report;
}

// Figures -------------------------------------------------------------------

const round = (value) => Number(value.toFixed(2));
const path = (points, map) => points.map((point, index) => `${index ? "L" : "M"}${map(point).map(round).join(" ")}`).join("");
const text = (x, y, content, attrs = "") => `<text x="${round(x)}" y="${round(y)}" ${attrs}>${content}</text>`;
const line = (x1, y1, x2, y2, cls) => `<path class="${cls}" d="M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}"/>`;
const thin = (points, every = 8) => points.filter((_, index) => index % every === 0 || index === points.length - 1);

function figure(id, width, height, title, body, caption) {
  return `<figure class="geo-figure" id="figure-${id}">
<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="figure-${id}-title">
<title id="figure-${id}-title">${title}</title>
${body}
</svg>
<figcaption>${caption}</figcaption>
</figure>`;
}

function cutFigure(report) {
  const size = 236;
  const depth = 1.45;
  const map = ([x, y]) => [50 + x * size, 50 + y * size];
  const reach = 50 + 2.6 * size;
  const body = [line(50, 50, reach, 50, "geo-rule"), line(50, 50, 50, 50 + depth * size, "geo-rule"), line(50, 50, 50 + 0.62 * size, 50 + 0.62 * size, "geo-guide")];
  Object.entries(families).forEach(([id, { label, points }], index) => {
    const { extent } = report.families[id];
    const y = 262 + index * 34;
    body.push(`<path class="geo-curve geo-curve--${id}" d="${path(thin(points).filter(([, y]) => y <= depth), map)}"/>`,
      line(50 + extent * size, 42, 50 + extent * size, 58, "geo-tick"), text(50 + extent * size, 32, `${extent.toFixed(2)}`, 'text-anchor="middle"'),
      `<path class="geo-curve geo-curve--${id}" d="M392 ${y}h44"/>`, text(448, y + 4.5, label));
  });
  const meet = 50 + (CUT / Math.SQRT2) * size;
  body.push(`<circle class="geo-dot" cx="${round(meet)}" cy="${round(meet)}" r="3.5"/>`, text(meet + 16, meet + 26, "Shared cut, 0.41 r", 'class="geo-note"'),
    text(reach + 14, 54.5, "r", 'class="geo-note"'));
  return figure("cut", 760, 410, "Four corner curves drawn through the same point on the diagonal", body.join("\n"),
    "Four corners that remove the same depth from the vertex. The figures on the top edge give the distance, in radii of the circular arc, at which each curve leaves the edge.");
}

function curvatureFigure() {
  const left = 60;
  const width = 640;
  const base = 280;
  const mapX = (s) => left + ((s + 2.2) / 4.4) * width;
  const mapY = (k) => base - k * 150;
  const body = [line(left, base, left + width, base, "geo-rule"), line(left, base, left, mapY(1.6), "geo-rule")];
  for (const k of [0.5, 1, 1.5]) body.push(line(left - 5, mapY(k), left, mapY(k), "geo-tick"), text(left - 10, mapY(k) + 4.5, k.toFixed(1), 'text-anchor="end"'));
  for (const s of [-2, -1, 0, 1, 2]) body.push(line(mapX(s), base, mapX(s), base + 5, "geo-tick"), text(mapX(s), base + 22, String(s), 'text-anchor="middle"'));
  body.push(text(left + width, base + 44, "Distance along the contour from the middle of the corner, in r", 'text-anchor="end" class="geo-note"'),
    text(left, mapY(1.6) - 12, "Curvature × r", 'class="geo-note"'));
  for (const [id, { points }] of Object.entries(families)) {
    const lengths = arcLengths(points);
    const half = lengths.at(-1) / 2;
    const curvature = mengerCurvature(points);
    const profile = points.map((_, index) => [lengths[index] - half, curvature[index]]);
    if (id === "circle") { profile[0][1] = 1; profile[profile.length - 1][1] = 1; }
    const full = [[-2.2, 0], [-half, 0], ...thin(profile), [half, 0], [2.2, 0]];
    body.push(`<path class="geo-curve geo-curve--${id}" d="${path(full, ([s, k]) => [mapX(s), mapY(k)])}"/>`);
  }
  return figure("curvature", 760, 340, "Curvature along the contour for the four corners", body.join("\n"),
    "Curvature of the four corners of the previous figure. The circular arc jumps from zero to 1/r. The three others start from zero, and pay for it with a higher peak and a longer transition.");
}

function familyFigure() {
  const cases = [["−∞", "notch", null], ["−1", "scoop", -2], ["0", "bevel", 1], ["0.5", "", 2 ** 0.5], ["1", "round", 2], ["2", "squircle", 4], ["∞", "square", Infinity]];
  const body = cases.map(([k, name, exponent], index) => {
    const x = 20 + index * 104;
    const map = ([px, py]) => [x + 84 - px * 84, 30 + py * 84];
    let d;
    if (exponent === null) d = `M${x} 30V114H${x + 84}`;
    else if (exponent === Infinity) d = `M${x} 30H${x + 84}V114`;
    else d = path(exponent < 0 ? concave(-exponent) : superellipse(exponent, 1, 1, 200), map);
    return [`<path class="geo-rule" d="M${x} 30H${x + 84}V114"/>`, `<path class="geo-curve geo-curve--ink" d="${d}"/>`,
      text(x + 42, 142, `K = ${k}`, 'text-anchor="middle"'), text(x + 42, 162, name, 'text-anchor="middle" class="geo-note"')].join("\n");
  });
  return figure("family", 760, 176, "Superellipse corners from notch to square", body.join("\n"),
    "One number per corner. CSS <code>superellipse(K)</code> draws a quarter superellipse of exponent 2<sup>K</sup> inside the box set by <code>border-radius</code>.");
}

function nestingFigure() {
  const radius = 130;
  const distance = 0.35;
  const panels = [
    ["Equal radii", superellipse(2), inset(superellipse(2), distance)],
    ["Radius minus inset", superellipse(2), inset(superellipse(2, 1 - distance, 1 - distance), distance)],
    ["Superellipse, scaled", superellipse(4), inset(superellipse(4, 1 - distance, 1 - distance), distance)],
  ];
  const body = panels.map(([label, outer, inner], index) => {
    const x = 24 + index * 250;
    const map = ([px, py]) => [x + px * radius, 24 + py * radius];
    const ratio = gap(thin(outer, 4), thin(inner, 8)).max / distance;
    const outerMid = outer[outer.length >> 1];
    const innerMid = inner[inner.length >> 1];
    const edge = x + 1.5 * radius;
    return [
      `<path class="geo-curve geo-curve--ink" d="M${x + 1.62 * radius} 24${path(thin(outer), map).replace("M", "L")}V${24 + 1.62 * radius}"/>`,
      `<path class="geo-curve geo-curve--ink" d="M${x + 1.62 * radius} ${24 + distance * radius}${path(thin(inner), map).replace("M", "L")}V${24 + 1.62 * radius}"/>`,
      line(...map(outerMid), ...map(innerMid), "geo-measure"), line(edge, 24, edge, 24 + distance * radius, "geo-measure"),
      text(edge + 8, 24 + (distance * radius) / 2 + 4.5, "d"),
      text(map(innerMid)[0] + 10, map(innerMid)[1] + 16, `${ratio.toFixed(2)} d`),
      text(x, 270, label, 'class="geo-note"'),
    ].join("\n");
  });
  return figure("nesting", 760, 284, "The gap between an outer and an inner corner in three constructions", body.join("\n"),
    "The gap between two nested contours, measured on the edge and on the diagonal. Subtracting the inset from the radius keeps the gap constant for circular arcs.");
}

function opticalFigure() {
  const unit = 7;
  const centre = 110;
  const body = [
    `<rect class="geo-curve geo-curve--ink" x="${centre - 9 * unit}" y="${centre - 9 * unit}" width="${18 * unit}" height="${18 * unit}"/>`,
    `<circle class="geo-curve geo-curve--circle" cx="${centre}" cy="${centre}" r="${9 * unit}"/>`,
    `<circle class="geo-curve geo-curve--squircle" cx="${centre}" cy="${centre}" r="${10 * unit}"/>`,
    `<circle class="geo-curve geo-curve--cubic" cx="${centre}" cy="${centre}" r="${round((18 / Math.sqrt(Math.PI)) * unit)}"/>`,
    text(230, 62, "Square, side 18"), text(230, 92, "Circle of the same width, 18"), text(230, 122, "Keyline circle, 20"), text(230, 152, "Circle of the same area, 20.31"),
    `<path class="geo-curve geo-curve--ink" d="M196 57h24"/>`, `<path class="geo-curve geo-curve--circle" d="M196 87h24"/>`,
    `<path class="geo-curve geo-curve--squircle" d="M196 117h24"/>`, `<path class="geo-curve geo-curve--cubic" d="M196 147h24"/>`,
  ];
  [[540, "Centred on its box"], [680, "Centred on its centroid"]].forEach(([x, label], index) => {
    const side = 70;
    const height = (side * Math.sqrt(3)) / 2;
    const shift = index ? height / 6 : 0;
    const leftEdge = x - height / 2 + shift;
    body.push(`<circle class="geo-curve geo-curve--ink" cx="${x}" cy="${centre}" r="62"/>`,
      `<path class="geo-fill" d="M${round(leftEdge)} ${centre - side / 2}L${round(leftEdge + height)} ${centre}L${round(leftEdge)} ${centre + side / 2}Z"/>`,
      line(x, centre - 70, x, centre + 70, "geo-guide"), text(x, 206, label, 'text-anchor="middle" class="geo-note"'));
  });
  return figure("optical", 760, 220, "Equal width, equal area and centroid constructions", body.join("\n"),
    "Left: three candidate sizes for a circle meant to weigh as much as a square. Right: a triangle centred on its bounding box and on its centroid, one sixth of its height apart.");
}

const report = numbers();
if (process.argv.includes("--numbers")) {
  console.log(JSON.stringify(report, (_, value) => (typeof value === "number" ? Number(value.toFixed(4)) : value), 1));
} else {
  const figures = { cut: cutFigure(report), curvature: curvatureFigure(), family: familyFigure(), nesting: nestingFigure(), optical: opticalFigure() };
  let page = readFileSync(PAGE, "utf8");
  for (const [id, markup] of Object.entries(figures)) {
    const pattern = new RegExp(String.raw`<!-- figure:${id} -->[\s\S]*?<!-- /figure:${id} -->`);
    if (!pattern.test(page)) throw new Error(`Missing marker for figure ${id}`);
    page = page.replace(pattern, () => `<!-- figure:${id} -->\n${markup}\n<!-- /figure:${id} -->`);
  }
  writeFileSync(PAGE, page);
}
