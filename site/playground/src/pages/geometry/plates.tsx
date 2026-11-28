import { Badge } from "@alien6-studio/elea-ui";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { type CSSProperties, type ReactNode, useId } from "react";
import {
  arcLengths, curvatureComb, curvatures, cutCompensation, diagonalCurvature, diagonalCut, exponentOf, gap, matchCut,
  measureCorner, offsetContour, scaleCorner, spiralCorner, superellipseCorner, toPath, vertexCubicCorner, type Point,
} from "../../geometry/index.js";

export const statuses = {
  geometry: { label: "Demonstrable geometry", tone: "info", note: "Follows from the construction and is checked by the module's tests." },
  perception: { label: "Perception to test", tone: "warning", note: "A hypothesis about what the eye reads. Nothing here measures it." },
  artistic: { label: "Artistic decision", tone: "secondary", note: "A choice of character. It is neither proved nor tested." },
} as const;
export type Status = keyof typeof statuses;

const PLATES = 6;
const fixed = (value: number, digits = 3) => value.toFixed(digits);

export function Plate({ number, title, status, wide = false, basis = "Computed, unit r", drawing, children }: Readonly<{
  number: number; title: string; status: Status; wide?: boolean; basis?: string; drawing: ReactNode; children: ReactNode;
}>) {
  const id = useId();
  return (
    <section className="geo-plate" aria-labelledby={id}>
      <header className="geo-plate__head">
        <p className="geo-plate__number">Plate {number} of {PLATES}</p>
        <h3 id={id}>{title}</h3>
        <Badge tone={statuses[status].tone} variant="outline" size="sm">{statuses[status].label}</Badge>
      </header>
      <div className={`geo-plate__body${wide ? " geo-plate__body--wide" : ""}`}>
        <div className="geo-plate__sheet" role="region" tabIndex={0} aria-label={`${title}: drawing`}>{drawing}</div>
        <div className="geo-plate__notes">{children}</div>
      </div>
      <footer className="geo-plate__block" aria-hidden="true">
        <span>ELEA</span><span>Geometry of Interfaces</span><span>{basis}</span>
      </footer>
    </section>
  );
}

function Drawing({ width, height, title, description, children }: Readonly<{
  width: number; height: number; title: string; description: string; children: ReactNode;
}>) {
  const id = useId();
  return (
    <svg className="gp" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}t ${id}d`}
      style={{ "--gp-min": `${width * 0.62}px` } as CSSProperties}>
      <title id={`${id}t`}>{title}</title>
      <desc id={`${id}d`}>{description}</desc>
      {children}
    </svg>
  );
}

const placed = (origin: Point, scale: number) => ([x, y]: Point): Point => [origin[0] + x * scale, origin[1] + y * scale];

// The four corners of the study, scaled to pass at the same distance from the vertex.
const CURVES = [
  { id: "circle", name: "Circular arc", joins: "step", points: superellipseCorner(1) },
  { id: "spiral", name: "Spiral, arc, spiral", joins: "continuous", points: matchCut(spiralCorner(0.5)) },
  { id: "squircle", name: "Superellipse, K = 2", joins: "continuous", points: matchCut(superellipseCorner(2)) },
  { id: "cubic", name: "Cubic, handles on the vertex", joins: "continuous", points: matchCut(vertexCubicCorner()) },
].map(curve => ({ ...curve, measures: measureCorner(curve.points) }));

const Swatch = ({ id }: { id: string }) => (
  <svg className="gp gp-swatch" viewBox="0 0 28 8" aria-hidden="true"><path className={`gp-curve gp-curve--${id}`} d="M1 4H27" /></svg>
);

export function CornerPlate() {
  const origin: Point = [70, 150];
  const scale = 285;
  const far = 2.55;
  const to = placed(origin, scale);
  const byExtent = [...CURVES].sort((a, b) => b.measures.extent - a.measures.extent);
  const [cx, cy] = to([1, 1]);
  const [kx, ky] = to([1 - Math.SQRT1_2, 1 - Math.SQRT1_2]);
  const [fx, fy] = to([far, far]);
  return (
    <Plate number={1} title="A corner is a transition" status="geometry" drawing={
      <Drawing width={880} height={890} title="Four corners with the same cut"
        description="A circular arc, a spiral blend, a superellipse and a cubic leave the edge at 1, 1.30, 1.84 and 2.34 radii from the vertex while passing through the same point on the diagonal.">
        <path className="gp-body" d={toPath([...CURVES[0]!.points, [0, far] as const, [far, far] as const, [far, 0] as const].map(to))} />
        <path className="gp-edge" d={`M${fx} ${origin[1]}H${origin[0]}V${fy}`} />
        <path className="gp-guide" d={`M${cx} ${origin[1]}V${cy}H${origin[0]}M${cx - 7} ${cy}h14M${cx} ${cy - 7}v14`} />
        <text className="gp-muted" x={cx + 10} y={cy + 4}>centre</text>
        <text className="gp-muted" x={cx + 8} y={(origin[1] + cy) / 2}>r</text>
        {CURVES.map(({ id, points }) => <path key={id} className={`gp-curve gp-curve--${id}`} d={toPath(points.map(to), false)} />)}
        <path className="gp-dim" d={`M${origin[0]} ${origin[1]}L${kx} ${ky}`} />
        <circle className="gp-mark" cx={kx} cy={ky} r="5" />
        <text transform={`translate(${(origin[0] + kx) / 2} ${(origin[1] + ky) / 2}) rotate(45)`} textAnchor="middle" y="-6">{fixed(diagonalCut(1))} r</text>
        <text className="gp-muted" x={kx + 12} y={ky + 22}>equal cut: the four curves pass here</text>
        {byExtent.map(({ id, name, measures }, index) => {
          const y = origin[1] - 26 * (byExtent.length - index);
          const x = to([measures.extent, 0])[0];
          return (
            <g key={id}>
              <path className="gp-dim" d={`M${origin[0]} ${origin[1] - 4}V${y - 5}M${x} ${origin[1] - 4}V${y - 5}M${origin[0]} ${y}H${x}M${origin[0] - 4} ${y + 4}l8 -8M${x - 4} ${y + 4}l8 -8`} />
              <text x={x - 9} y={y - 6} textAnchor="end">{name.toLowerCase()} · {fixed(measures.extent)} r</text>
            </g>
          );
        })}
      </Drawing>
    }>
      <p>One radius hides four decisions: how deep the corner is cut, how far along the edge the curve
        begins, how its curvature is spread, and how an inner contour follows it. Here the depth is held
        constant, and everything else moves.</p>
      <table className="geo-table">
        <caption>At equal cut, in units of the circular radius</caption>
        <thead><tr><th scope="col">Curve</th><th scope="col">Leaves edge at</th><th scope="col">Peak κ</th><th scope="col">Off the arc</th></tr></thead>
        <tbody>{CURVES.map(({ id, name, measures }) => (
          <tr key={id}>
            <th scope="row"><Swatch id={id} />{name}</th>
            <td>{fixed(measures.extent)}</td><td>{fixed(measures.peakCurvature)}</td><td>{fixed(measures.deviation, 4)}</td>
          </tr>
        ))}</tbody>
      </table>
      <p className="geo-note">A smoother join costs length: the superellipse needs {fixed(CURVES[2]!.measures.extent, 2)} times
        the edge of the arc it replaces and never strays more than {fixed(CURVES[2]!.measures.deviation, 2)} r from it.</p>
    </Plate>
  );
}

export function CurvaturePlate() {
  const chart = { left: 80, right: 1150, base: 650, unit: 150 };
  const labels: Record<string, [number, number, "start" | "middle" | "end"]> = {
    circle: [0.07, 1.05, "start"], spiral: [0.19, 0.8, "end"], squircle: [0.6, 1.27, "start"], cubic: [0.5, 1.68, "middle"],
  };
  const x = (position: number) => chart.left + position * (chart.right - chart.left);
  const y = (curvature: number) => chart.base - curvature * chart.unit;
  return (
    <Plate number={2} title="Curvature, drawn" status="geometry" wide drawing={
      <Drawing width={1200} height={710} title="Curvature combs and curvature along each corner"
        description="The circular arc jumps from zero to its full curvature at the joins. The three other curves rise from zero, and peak at 1.09, 1.37 and 1.61 times the curvature of the arc.">
        {CURVES.map(({ id, name, points, measures }, index) => {
          const origin: Point = [44 + index * 292, 56];
          const to = placed(origin, 95);
          const comb = curvatureComb(points, -0.24);
          const reach = to([measures.extent + 0.12, 0])[0];
          return (
            <g key={id}>
              <path className="gp-edge" d={`M${reach} ${origin[1]}H${origin[0]}V${origin[1] + reach - origin[0]}`} />
              <path className="gp-comb" d={comb.filter((_, tooth) => tooth % 2 === 0).map(([foot, tip]) => `M${to(foot).join(" ")}L${to(tip).join(" ")}`).join("")} />
              <path className="gp-comb" d={toPath(comb.map(([, tip]) => to(tip)), false)} />
              <path className={`gp-curve gp-curve--${id}`} d={toPath(points.map(to), false)} />
              <text x={origin[0] - 22} y={origin[1] + 252}>{name}</text>
              <text className="gp-muted" x={origin[0] - 22} y={origin[1] + 270}>peak {fixed(measures.peakCurvature)} / r · joins: {CURVES[index]!.joins}</text>
            </g>
          );
        })}
        {[0, 0.5, 1, 1.5].map(tick => (
          <g key={tick}>
            <path className={tick ? "gp-guide" : "gp-edge"} d={`M${chart.left} ${y(tick)}H${chart.right}`} />
            <text className="gp-muted" x={chart.left - 10} y={y(tick) + 4} textAnchor="end">{tick.toFixed(1)}</text>
          </g>
        ))}
        <text className="gp-muted" x={chart.left} y={y(1.8) - 6}>curvature × r</text>
        <text className="gp-muted" x={chart.left} y={chart.base + 24}>first join</text>
        <text className="gp-muted" x={chart.right} y={chart.base + 24} textAnchor="end">second join</text>
        {CURVES.map(({ id, name, points }) => {
          const lengths = arcLengths(points);
          const values = curvatures(points);
          const [at, level, anchor] = labels[id]!;
          return (
            <g key={id}>
              <path className={`gp-curve gp-curve--${id}`} d={toPath(values.map((value, index): Point => [x(lengths[index]! / lengths.at(-1)!), y(value)]), false)} />
              <text className="gp-halo" x={x(at)} y={y(level)} textAnchor={anchor}>{name.toLowerCase()}</text>
            </g>
          );
        })}
      </Drawing>
    }>
      <p>Each tooth of a comb is as long as the curvature where it stands. On the arc the comb starts at full height:
        that step is what a highlight breaks on. On the other three it grows from nothing.</p>
      <p className="geo-note">That a continuous curvature reads as calmer on a flat, unlit interface is an assumption borrowed
        from surface design. This plate measures the curves, not the eye.</p>
    </Plate>
  );
}

const FAMILY = [
  { curve: -Infinity, word: "notch" }, { curve: -2 }, { curve: -1, word: "scoop" }, { curve: 0, word: "bevel" }, { curve: 0.5 },
  { curve: 1, word: "round" }, { curve: 1.5 }, { curve: 2, word: "squircle" }, { curve: 3 }, { curve: 4 }, { curve: Infinity, word: "square" },
];
/** The value a curve takes when it is infinite: the first for the square, the second for the notch. */
const atInfinity = <T,>(curve: number, square: T, notch: T) => (curve > 0 ? square : notch);
const sign = (curve: number) => (Number.isFinite(curve) ? `${curve}` : atInfinity(curve, "∞", "−∞")).replace("-", "−");
const FAMILY_STROKE: Record<number, string> = { 1: "circle", 2: "squircle" };

export function FamilyPlate() {
  const origin: Point = [100, 100];
  const scale = 590;
  const to = placed(origin, scale);
  const edge = to([1.14, 1.14]);
  return (
    <Plate number={3} title="One family, one parameter" status="geometry" drawing={
      <Drawing width={880} height={820} title="The superellipse family, from notch to square"
        description="Eleven corners of the same radius, drawn for the parameter K from minus infinity to infinity. K equals 1 is the circular arc and K equals 2 the squircle.">
        <path className="gp-edge" d={`M${edge[0]} ${origin[1]}H${origin[0]}V${edge[1]}`} />
        <path className="gp-guide" d={`M${origin[0]} ${origin[1]}L${to([1, 1]).join(" ")}`} />
        {FAMILY.map(({ curve, word }) => {
          const reach = Number.isFinite(curve) ? diagonalCut(curve) * Math.SQRT1_2 : atInfinity(curve, 0, 1);
          const [lx, ly] = to([reach, reach]);
          return (
            <g key={curve}>
              <path className={`gp-curve gp-curve--${FAMILY_STROKE[curve] ?? "thin"}`}
                d={toPath(superellipseCorner(curve, 1, 1, 128).map(to), false)} />
              <text className="gp-halo" transform={`translate(${lx} ${ly}) rotate(-45)`} textAnchor="middle" y="-6">
                K = {sign(curve)}{word ? ` · ${word}` : ""}
              </text>
            </g>
          );
        })}
      </Drawing>
    }>
      <p>CSS names this family <code>superellipse(K)</code>: the curve |x|<sup>n</sup> + |y|<sup>n</sup> = 1 with n = 2<sup>K</sup>,
        mirrored across its chord when K is negative. One number travels from a notch to a square corner through
        the bevel, the arc and the squircle.</p>
      <table className="geo-table">
        <caption>Radius 1. The factor restores the cut of the circular arc.</caption>
        <thead><tr><th scope="col">K</th><th scope="col">n</th><th scope="col">Cut</th><th scope="col">Factor</th><th scope="col">Peak κ</th></tr></thead>
        <tbody>{[0.5, 1, 1.5, 2, 2.5, 3].map(curve => (
          <tr key={curve}>
            <th scope="row">{curve}</th><td>{fixed(exponentOf(curve), 2)}</td><td>{fixed(diagonalCut(curve))}</td>
            <td>{fixed(cutCompensation(curve))}</td>
            <td>{curve < 1 ? "at the joins" : fixed(diagonalCurvature(curve) / cutCompensation(curve))}</td>
          </tr>
        ))}</tbody>
      </table>
      <p className="geo-note">Raising K at a fixed radius also makes the corner shallower. Multiplying the radius by the factor
        keeps the depth and changes only the distribution of curvature.</p>
    </Plate>
  );
}

const NEST = { radius: 140, inset: 35, reach: 262 };
function nested(curve: number, rule: "same" | "concentric" | "offset") {
  const radius = NEST.radius * cutCompensation(curve);
  const corner = (size: number, shift: number) =>
    scaleCorner(superellipseCorner(curve, 1, 1, 192), size).map(([x, y]): Point => [x + shift, y + shift]);
  const outer: Point[] = [[NEST.reach, 0], ...corner(radius, 0), [0, NEST.reach]];
  const inner: Point[] = rule === "offset" ? offsetContour(outer, NEST.inset, false)
    : [[NEST.reach, NEST.inset], ...corner(rule === "same" ? radius : radius - NEST.inset, NEST.inset), [NEST.inset, NEST.reach]];
  const { min, max } = gap(outer, inner.slice(1, -1));
  return { outer, inner, min: min / NEST.inset, max: max / NEST.inset };
}
const NESTS = [
  { title: "Same radius", detail: "arc inside arc, radius r", ...nested(1, "same") },
  { title: "Concentric", detail: "arc inside arc, radius r − d", ...nested(1, "concentric") },
  { title: "Squircle, reduced", detail: "K = 2 inside K = 2, radius r − d", ...nested(2, "concentric") },
  { title: "Squircle, parallel", detail: "the true offset of K = 2", ...nested(2, "offset") },
];

export function NestingPlate() {
  return (
    <Plate number={4} title="Contours inside contours" status="geometry" wide drawing={
      <Drawing width={1200} height={400} title="Four ways to nest a corner"
        description="The band between an outer and an inner corner. With the same radius the band widens to 1.41 times the inset; with a concentric arc it stays constant; a reduced squircle widens slightly; a true parallel curve stays constant.">
        {NESTS.map(({ title, detail, outer, inner, min, max }, index) => {
          const to = placed([34 + index * 292, 40], 1);
          return (
            <g key={title}>
              <path className="gp-band" d={toPath([...outer, ...[...inner].reverse()].map(to))} />
              <path className="gp-curve gp-curve--circle" d={toPath(outer.map(to), false)} />
              <path className="gp-curve" d={toPath(inner.map(to), false)} />
              <text x={to([NEST.inset + 22, 0])[0]} y="342">{title}</text>
              <text className="gp-muted" x={to([NEST.inset + 22, 0])[0]} y="360">{detail}</text>
              <text x={to([NEST.inset + 22, 0])[0]} y="378">gap {fixed(min, 2)} d to {fixed(max, 2)} d</text>
            </g>
          );
        })}
      </Drawing>
    }>
      <p>An inner corner that repeats the outer radius pinches the edges and opens at the diagonal, up to √2 times the inset.
        Subtracting the inset from the radius makes two arcs concentric, and the band constant.</p>
      <p className="geo-note">The third drawing subtracts the inset from the radius of a superellipse. In the fourth,
        the inner contour follows the inward normal of the outer curve at a fixed distance.</p>
    </Plate>
  );
}

export function OpticalPlate() {
  const side = 170;
  const equal = (side * 2) / Math.sqrt(Math.PI);
  const middle = 190;
  const play = (centre: number, shift: number) => `M${centre - 39 + shift} ${middle - 45}L${centre + 39 + shift} ${middle}L${centre - 39 + shift} ${middle + 45}Z`;
  return (
    <Plate number={5} title="Corrections for the eye" status="perception" wide basis="Computed, unit a" drawing={
      <Drawing width={1200} height={400} title="Equal height against equal area, box centre against centroid"
        description="A circle as tall as a square covers 78.5 percent of its area; a circle of equal area is 12.8 percent taller. A triangle centred on its bounding box sits one sixth of its width away from its centroid.">
        <path className="gp-guide" d={`M40 ${middle - side / 2}H700M40 ${middle + side / 2}H700`} />
        <rect className="gp-shape" x="60" y={middle - side / 2} width={side} height={side} />
        <circle className="gp-shape" cx="365" cy={middle} r={side / 2} />
        <circle className="gp-shape" cx="590" cy={middle} r={equal / 2} />
        <text x="60" y="336">square, side a</text>
        <text x="280" y="336">circle, diameter a</text>
        <text className="gp-muted" x="280" y="354">{fixed(Math.PI * 25, 1)} % of the area</text>
        <text x="494" y="336">circle, diameter {fixed(2 / Math.sqrt(Math.PI))} a</text>
        <text className="gp-muted" x="494" y="354">equal area, {fixed((2 / Math.sqrt(Math.PI) - 1) * 100, 1)} % taller</text>
        {[{ centre: 840, shift: 0, label: "centred on its box" }, { centre: 1070, shift: 13, label: "centred on its centroid" }].map(({ centre, shift, label }) => (
          <g key={label}>
            <circle className="gp-ring" cx={centre} cy={middle} r="85" />
            <path className="gp-shape" d={play(centre, shift)} />
            <path className="gp-guide" d={`M${centre - 100} ${middle}H${centre + 100}M${centre} ${middle - 100}V${middle + 100}`} />
            <text x={centre - 85} y="336">{label}</text>
            <text className="gp-muted" x={centre - 85} y="354">{shift ? "shifted by width / 6" : "as a layout engine places it"}</text>
          </g>
        ))}
      </Drawing>
    }>
      <p>The numbers are geometry: areas, and the centroid of a triangle. The claim that equal area reads as equal weight,
        or that a centroid reads as the centre, is perceptual. Designers apply both by habit; neither is measured here.</p>
      <p className="geo-note">Before either correction becomes a rule of a design system it needs a comparison task with observers, at
        several sizes, and a reported effect size.</p>
    </Plate>
  );
}

const ROLES = ["action", "control", "surface", "indicator"] as const;
const PROFILES = Object.values(colorThemes).flatMap(theme => "shapes" in theme ? [theme] : []);

export function SpecimenPlate() {
  return (
    <Plate number={6} title="Shape as character" status="artistic" wide basis="Theme values, drawn by the browser" drawing={
      <ul className="geo-specimens">
        {PROFILES.map(({ name, style, shapes }) => (
          <li key={name} style={{ "--elea-shape-action": shapes.action } as CSSProperties}>
            <h4>{name}</h4>
            <p>{style}</p>
            <dl>{ROLES.map(role => (
              <div key={role}>
                <dt><span className={`geo-specimen geo-specimen--${role}`} style={{ borderRadius: shapes[role] }} />{role}</dt>
                <dd><code>{shapes[role]}</code></dd>
              </div>
            ))}</dl>
          </li>
        ))}
      </ul>
    }>
      <p>Nine themes of this site as specimens. Each gives a shape of its own to four roles: actions, controls,
        surfaces and indicators. Geometry describes these contours and does not choose between them.</p>
      <p className="geo-note">All of them are circular or elliptical arcs: the radii change from corner to corner, the
        distribution of curvature does not. The laboratory below compares its constructions against the theme
        selected in the header.</p>
    </Plate>
  );
}
