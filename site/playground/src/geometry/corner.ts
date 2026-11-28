// Corner curves. Every corner lives in one frame: the vertex is the origin, the
// two edges run along +x and +y, and the curve goes from (extent, 0) to (0, extent).

export type Point = readonly [number, number];

const steps = (count: number) => Array.from({ length: count + 1 }, (_, index) => index / count);

/** The exponent of the superellipse that CSS `superellipse(curve)` draws. */
export const exponentOf = (curve: number) => 2 ** curve;

/** Distance from the vertex to a superellipse corner of radius 1, measured on the diagonal. */
export function diagonalCut(curve: number) {
  const depth = 2 ** (-1 / exponentOf(Math.abs(curve)));
  return Math.SQRT2 * (curve < 0 ? depth : 1 - depth);
}

/** Factor to apply to a radius so that `curve` removes the same depth as a circular arc. */
export const cutCompensation = (curve: number) => diagonalCut(1) / diagonalCut(curve);

/** Radius of an inner corner that shares its centre with the outer one. */
export const concentricRadius = (outer: number, inset: number, minimum = 0) => Math.max(minimum, outer - inset);

/**
 * A quarter superellipse inside a box of `radiusX` by `radiusY`. Negative curves
 * mirror the convex corner across its chord, as CSS does; the infinities give
 * the square and the notch.
 */
export function superellipseCorner(curve: number, radiusX = 1, radiusY = radiusX, count = 96): Point[] {
  if (curve === Infinity) return [[radiusX, 0], [0, 0], [0, radiusY]];
  if (curve === -Infinity) return [[radiusX, 0], [radiusX, radiusY], [0, radiusY]];
  const exponent = exponentOf(Math.abs(curve));
  return steps(count).map((step): Point => {
    const cos = Math.cos((step * Math.PI) / 2);
    const sin = Math.sin((step * Math.PI) / 2);
    const scale = (cos ** exponent + sin ** exponent) ** (-1 / exponent);
    const x = 1 - sin * scale;
    const y = 1 - cos * scale;
    return curve < 0 ? [radiusX * (1 - y), radiusY * (1 - x)] : [radiusX * x, radiusY * y];
  });
}

/** A cubic Bézier whose two handles sit on the vertex. */
export function vertexCubicCorner(count = 96): Point[] {
  return steps(count).map((t): Point => [(1 - t) ** 3, t ** 3]);
}

/** Euler spiral, circular arc, Euler spiral. `share` is the part of the turn made in the spirals. */
export function spiralCorner(share = 0.5, count = 96): Point[] {
  const spiral = (share * Math.PI) / 2;
  const length = Math.PI / 2 + spiral;
  const curvature = (s: number) => (spiral === 0 ? 1 : Math.min(1, s / spiral, (length - s) / spiral));
  const oversampling = 16;
  const ds = length / (count * oversampling);
  const points: [number, number][] = [[0, 0]];
  let heading = 0;
  for (let index = 0; index < count * oversampling; index += 1) {
    const [x, y] = points[index]!;
    const turn = curvature((index + 0.5) * ds) * ds;
    points.push([x + Math.cos(heading + turn / 2) * ds, y + Math.sin(heading + turn / 2) * ds]);
    heading += turn;
  }
  const extent = points.at(-1)![0];
  return points.filter((_, index) => index % oversampling === 0).map(([x, y]): Point => [extent - x, y]);
}

export const scaleCorner = (points: readonly Point[], factor: number) => points.map(([x, y]): Point => [x * factor, y * factor]);

/** Scales a corner so that it passes at the same distance from the vertex as a circular arc of radius 1. */
export function matchCut(points: readonly Point[]): Point[] {
  return scaleCorner(points, diagonalCut(1) / Math.min(...points.map(([x, y]) => Math.hypot(x, y))));
}
