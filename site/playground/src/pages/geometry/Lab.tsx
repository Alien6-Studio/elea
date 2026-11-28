import { Alert, Badge, Button, Card, Input, Select, Slider, Toggle } from "@alien6-studio/elea-ui";
import { type CSSProperties, useMemo, useState } from "react";
import {
  concentricRadius, curvatureComb, curvatures, cutCompensation, diagonalCut, fitRadii, gap, rectangleContour,
  superellipseCorner, superellipseRemovedArea, toPath, type CornerSpec, type Point, type RectangleSpec,
} from "../../geometry/index.js";

const STAGE = { width: 280, height: 160, margin: 36 };
const SQUARE: CornerSpec = { radius: 0, curve: 1 };

// Which corners take the radius: top left, top right, bottom right, bottom left.
const MASKS = {
  all: { label: "All four", corners: [true, true, true, true] },
  top: { label: "Top pair", corners: [true, true, false, false] },
  diagonal: { label: "One diagonal", corners: [true, false, true, false] },
  leading: { label: "Leading side", corners: [true, false, false, true] },
} as const;
type Mask = keyof typeof MASKS;
const RULES = [{ value: "concentric", label: "Concentric: radius − inset" }, { value: "same", label: "Same radius" }];

const px = (value: number) => `${Math.round(value * 10) / 10} px`;
const supportsCornerShape = typeof CSS !== "undefined" && CSS.supports("corner-shape", "superellipse(2)");

function rectangle(width: number, height: number, radius: number, curve: number, mask: Mask): RectangleSpec {
  const [a, b, c, d] = MASKS[mask].corners.map((on): CornerSpec => on ? { radius, curve } : SQUARE);
  return { width, height, corners: [a!, b!, c!, d!] };
}
const radii = (radius: number, mask: Mask) => MASKS[mask].corners.map(on => on ? `${Math.round(radius * 100) / 100}px` : "0").join(" ");

function Specimen({ inset }: Readonly<{ inset: number }>) {
  return (
    <Card variant="outline" padding="none">
      <div className="geo-lab__nested" style={{ padding: inset }}>
        <div className="geo-lab__media"><Badge tone="primary" size="sm">Plate 3</Badge></div>
        <strong>One family, one parameter</strong>
        <p>From a notch to a square corner through the bevel, the arc and the squircle.</p>
        <Input aria-label="Email" type="email" placeholder="name@studio.com" />
        <div className="geo-lab__actions"><Button>Subscribe</Button><Button variant="outline">Later</Button></div>
      </div>
    </Card>
  );
}

export function Lab() {
  const [radius, setRadius] = useState(24);
  const [curve, setCurve] = useState(2);
  const [keepCut, setKeepCut] = useState(true);
  const [inset, setInset] = useState(12);
  const [rule, setRule] = useState("concentric");
  const [mask, setMask] = useState<Mask>("all");
  const [comb, setComb] = useState(true);

  const requested = radius * (keepCut ? cutCompensation(curve) : 1);
  const inner = rule === "same" ? requested : concentricRadius(requested, inset);
  const drawing = useMemo(() => {
    const spec = rectangle(STAGE.width, STAGE.height, requested, curve, mask);
    const used = Math.max(...fitRadii(spec));
    const outer = rectangleContour(spec);
    const shift = ([x, y]: Point): Point => [x + inset, y + inset];
    const within = rectangleContour(rectangle(STAGE.width - 2 * inset, STAGE.height - 2 * inset, inner, curve, mask), 24).map(shift);
    return {
      used, outer, within,
      reference: rectangleContour(rectangle(STAGE.width, STAGE.height, radius, 1, mask)),
      teeth: curvatureComb(outer, 12 * used, true),
      gap: inset ? gap(outer, within, true) : { min: 0, max: 0 },
      tightest: Math.abs(curve) >= 1 && used ? 1 / Math.max(...curvatures(superellipseCorner(Math.abs(curve), used))) : 0,
    };
  }, [requested, inner, radius, curve, inset, mask]);
  const { used } = drawing;
  const removed = superellipseRemovedArea(Math.abs(curve));
  const shaped = supportsCornerShape ? requested : radius;
  const shapedInner = rule === "same" ? shaped : concentricRadius(shaped, inset);
  const experiment = {
    "--geo-curve": curve,
    "--elea-shape-surface": radii(shaped, mask),
    "--geo-inner": radii(shapedInner, mask),
    "--geo-innermost": radii(rule === "same" ? shaped : concentricRadius(shapedInner, 8), mask),
  } as CSSProperties;

  return (
    <div className="geo-lab">
      <form className="geo-lab__controls" aria-label="Geometry parameters" onSubmit={event => event.preventDefault()}>
        <Slider label="Radius" min={0} max={64} step={1} value={radius} onChange={setRadius} showValue formatValue={value => `${value} px`} />
        <Slider label="Curve K" min={-2} max={4} step={0.25} value={curve} onChange={setCurve} showValue
          formatValue={value => `${value}`.replace("-", "−")} />
        <Toggle label="Keep the cut of the circular corner" checked={keepCut} onCheckedChange={setKeepCut} />
        <Slider label="Inset" min={0} max={32} step={1} value={inset} onChange={setInset} showValue formatValue={value => `${value} px`} />
        <Select label="Inner radius" options={RULES} value={rule} onChange={value => setRule(value ?? "concentric")} />
        <Select label="Corners" options={Object.entries(MASKS).map(([value, { label }]) => ({ value, label }))}
          value={mask} onChange={value => setMask((value ?? "all") as Mask)} />
        <Toggle label="Curvature comb" checked={comb} onCheckedChange={setComb} />
      </form>

      <div className="geo-lab__stage">
        <svg className="gp" role="img" aria-label="The contour drawn from the parameters, over the circular corner of the same radius"
          viewBox={`${-STAGE.margin} ${-STAGE.margin} ${STAGE.width + 2 * STAGE.margin} ${STAGE.height + 2 * STAGE.margin}`}>
          <path className="gp-body" d={toPath(drawing.outer)} />
          {comb && <path className="gp-comb" d={drawing.teeth.map(([[x, y], [tx, ty]]) => `M${x.toFixed(1)} ${y.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`).join("")} />}
          <path className="gp-guide" d={toPath(drawing.reference)} />
          {inset > 0 && <path className="gp-curve gp-curve--thin" d={toPath(drawing.within)} />}
          <path className="gp-curve gp-curve--squircle" d={toPath(drawing.outer)} />
        </svg>
        <dl className="geo-lab__readout" aria-live="polite">
          <div><dt>Radius drawn</dt><dd data-readout="radius">{px(used)}</dd></div>
          <div><dt>Cut on the diagonal</dt><dd data-readout="cut">{px(diagonalCut(curve) * used)}</dd></div>
          <div><dt>Tightest radius of curvature</dt><dd data-readout="tightest">{drawing.tightest ? px(drawing.tightest) : "0 px, at the joins"}</dd></div>
          <div><dt>Area removed per corner</dt><dd data-readout="area">{Math.round((curve < 0 ? 1 - removed : removed) * used * used)} px²</dd></div>
          <div><dt>Gap to the inner contour</dt><dd data-readout="gap">{inset ? `${px(drawing.gap.min)} to ${px(drawing.gap.max)}` : "no inset"}</dd></div>
        </dl>
        <p className="geo-note">Stage of {STAGE.width} × {STAGE.height} px. Dotted: the circular corner of the same radius.
          {used < requested - 0.01 && ` The radius of ${px(requested)} does not fit and is reduced, as CSS does.`}</p>
      </div>

      <div className="geo-lab__compare">
        <section aria-labelledby="geo-lab-current" data-geometry-specimen>
          <h4 id="geo-lab-current">As themed <Badge tone="neutral" variant="subtle" size="sm">Reference</Badge></h4>
          <Specimen inset={inset} />
          <p className="geo-note">The shapes of the selected theme, untouched.</p>
        </section>
        <section aria-labelledby="geo-lab-experiment" className="geo-lab__experiment" style={experiment} data-geometry-specimen>
          <h4 id="geo-lab-experiment">With the parameters <Badge tone="info" variant="subtle" size="sm">Constructed</Badge></h4>
          <Specimen inset={inset} />
          <p className="geo-note">The same components. Only the shape variables of this panel change;{" "}
            <code>corner-shape</code> carries the curve, so borders and focus rings follow it.</p>
        </section>
      </div>
      {!supportsCornerShape && (
        <Alert tone="info" title="This browser draws circular corners">
          <code>corner-shape</code> is not available here, so the components fall back to arcs of the radius you set.
          The contour above is computed and stays exact.
        </Alert>
      )}
    </div>
  );
}
