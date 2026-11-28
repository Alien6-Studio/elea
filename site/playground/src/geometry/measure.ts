import { exponentOf, type Point } from "./corner.js";

/** Unsigned curvature at each vertex of a polyline, from the circle through three neighbours. */
export function curvatures(points: readonly Point[], closed = false): number[] {
  const last = points.length - 1;
  return points.map(([bx, by], index) => {
    if (!closed && (index === 0 || index === last)) return 0;
    const [ax, ay] = points[(index + last) % points.length]!;
    const [cx, cy] = points[(index + 1) % points.length]!;
    const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const product = Math.hypot(bx - ax, by - ay) * Math.hypot(cx - bx, cy - by) * Math.hypot(cx - ax, cy - ay);
    return product === 0 ? 0 : Math.abs((2 * cross) / product);
  });
}

/** Curvature of a superellipse corner of radius 1 where it crosses the diagonal. */
export function diagonalCurvature(curve: number) {
  const exponent = exponentOf(curve);
  return (exponent - 1) * 2 ** (1 / exponent - 0.5);
}

export function arcLengths(points: readonly Point[]): number[] {
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [x, y] = points[index]!;
    const [px, py] = points[index - 1]!;
    lengths.push(lengths[index - 1]! + Math.hypot(x - px, y - py));
  }
  return lengths;
}

export function polygonArea(ring: readonly Point[]) {
  let area = 0;
  ring.forEach(([x, y], index) => {
    const [nx, ny] = ring[(index + 1) % ring.length]!;
    area += x * ny - nx * y;
  });
  return Math.abs(area) / 2;
}

/** Area between the vertex and a corner curve: what the corner removes from the square. */
export const removedArea = (corner: readonly Point[]) => polygonArea([[0, 0], ...corner]);

// Lanczos approximation, g = 7.
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

export function gamma(value: number): number {
  if (value < 0.5) return Math.PI / (Math.sin(Math.PI * value) * gamma(1 - value));
  const x = value - 1;
  const series = LANCZOS.reduce((sum, coefficient, index) => (index ? sum + coefficient / (x + index) : coefficient), 0);
  const t = x + 7.5;
  return Math.sqrt(2 * Math.PI) * t ** (x + 0.5) * Math.exp(-t) * series;
}

/** Closed form of `removedArea` for a convex superellipse corner of radius 1. */
export function superellipseRemovedArea(curve: number) {
  const exponent = exponentOf(curve);
  return 1 - gamma(1 + 1 / exponent) ** 2 / gamma(1 + 2 / exponent);
}

/** Distance from a point to the contour of a circular corner of radius 1. */
export function distanceToCircularCorner([x, y]: Point) {
  if (x > 1) return Math.abs(y);
  if (y > 1) return Math.abs(x);
  return Math.abs(Math.hypot(x - 1, y - 1) - 1);
}

export interface CornerMeasures {
  /** Distance from the vertex at which the curve leaves the edge. */
  extent: number;
  /** Distance from the vertex to the curve. */
  cut: number;
  peakCurvature: number;
  /** Largest distance to a circular corner of radius 1. */
  deviation: number;
  removedArea: number;
}

export function measureCorner(corner: readonly Point[]): CornerMeasures {
  return {
    extent: corner[0]![0],
    cut: Math.min(...corner.map(([x, y]) => Math.hypot(x, y))),
    peakCurvature: Math.max(...curvatures(corner)),
    deviation: Math.max(...corner.map(distanceToCircularCorner)),
    removedArea: removedArea(corner),
  };
}

function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/** Smallest and largest distance from the points of `inner` to the polyline `outer`. */
export function gap(outer: readonly Point[], inner: readonly Point[], closed = false) {
  const segments = closed ? outer.length : outer.length - 1;
  let min = Infinity;
  let max = 0;
  for (const point of inner) {
    let nearest = Infinity;
    for (let index = 0; index < segments; index += 1) {
      nearest = Math.min(nearest, distanceToSegment(point, outer[index]!, outer[(index + 1) % outer.length]!));
    }
    min = Math.min(min, nearest);
    max = Math.max(max, nearest);
  }
  return { min, max };
}
