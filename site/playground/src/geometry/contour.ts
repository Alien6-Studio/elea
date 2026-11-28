import { superellipseCorner, type Point } from "./corner.js";
import { curvatures } from "./measure.js";

export interface CornerSpec {
  radius: number;
  /** CSS `superellipse()` parameter: 1 is a circular arc, 2 a squircle, 0 a bevel. */
  curve: number;
}

export interface RectangleSpec {
  width: number;
  height: number;
  /** Top left, top right, bottom right, bottom left. */
  corners: readonly [CornerSpec, CornerSpec, CornerSpec, CornerSpec];
}

/** Scales the radii down together when two of them overlap on a side, as CSS does. */
export function fitRadii({ width, height, corners }: RectangleSpec): number[] {
  const [tl, tr, br, bl] = corners.map(({ radius }) => Math.max(0, radius)) as [number, number, number, number];
  const factor = Math.min(1, width / (tl + tr || 1), width / (bl + br || 1), height / (tl + bl || 1), height / (tr + br || 1));
  return [tl, tr, br, bl].map(radius => radius * factor);
}

// For each corner: its vertex, the edge the contour arrives on and the edge it leaves on.
const FRAMES = [
  { vertex: [0, 0], arrive: [0, 1], leave: [1, 0] },
  { vertex: [1, 0], arrive: [-1, 0], leave: [0, 1] },
  { vertex: [1, 1], arrive: [0, -1], leave: [-1, 0] },
  { vertex: [0, 1], arrive: [1, 0], leave: [0, -1] },
] as const;

/** The closed contour of a rectangle, clockwise from the top left corner, y pointing down. */
export function rectangleContour(spec: RectangleSpec, samples = 48): Point[] {
  const radii = fitRadii(spec);
  return FRAMES.flatMap(({ vertex, arrive, leave }, index) => {
    const radius = radii[index]!;
    const x = vertex[0] * spec.width;
    const y = vertex[1] * spec.height;
    if (radius === 0) return [[x, y] as Point];
    return superellipseCorner(spec.corners[index]!.curve, radius, radius, samples)
      .map(([a, b]): Point => [x + a * arrive[0] + b * leave[0], y + a * arrive[1] + b * leave[1]]);
  });
}

const round = (value: number) => Math.round(value * 100) / 100;

/** An SVG path, also valid in CSS `clip-path: path()` and `offset-path`. */
export function toPath(points: readonly Point[], closed = true) {
  return points.map(([x, y], index) => `${index ? "L" : "M"}${round(x)} ${round(y)}`).join("") + (closed ? "Z" : "");
}

function normals(points: readonly Point[], closed: boolean): Point[] {
  const last = points.length - 1;
  return points.map((_, index): Point => {
    const [ax, ay] = points[closed ? (index + last) % points.length : Math.max(0, index - 1)]!;
    const [bx, by] = points[closed ? (index + 1) % points.length : Math.min(last, index + 1)]!;
    const length = Math.hypot(bx - ax, by - ay) || 1;
    return [(by - ay) / length, -(bx - ax) / length];
  });
}

/**
 * The parallel curve at `distance` from a contour, on the side of its normals.
 * Exact for smooth contours while the distance stays below the smallest radius
 * of curvature; beyond that the offset folds over itself.
 */
export function offsetContour(points: readonly Point[], distance: number, closed = true): Point[] {
  const directions = normals(points, closed);
  return points.map(([x, y], index): Point => [x + directions[index]![0] * distance, y + directions[index]![1] * distance]);
}

/** Curvature comb: one segment per point, along the normal, as long as the local curvature. */
export function curvatureComb(points: readonly Point[], scale: number, closed = false): (readonly [Point, Point])[] {
  const curvature = curvatures(points, closed);
  const directions = normals(points, closed);
  return points.map((point, index) => {
    const length = curvature[index]! * scale;
    return [point, [point[0] + directions[index]![0] * length, point[1] + directions[index]![1] * length]] as const;
  });
}
