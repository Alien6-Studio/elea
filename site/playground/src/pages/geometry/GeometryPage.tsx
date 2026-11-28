import { Badge, Button } from "@alien6-studio/elea-ui";
import { repositoryUrl, sitePath } from "../../links.js";
import { Lab } from "./Lab.js";
import { CornerPlate, CurvaturePlate, FamilyPlate, NestingPlate, OpticalPlate, SpecimenPlate, statuses } from "./plates.js";

const study = `${sitePath}research/geometry-of-interfaces/`;
const source = `${repositoryUrl}/tree/gh-pages/playground/src/geometry`;

export type GeometryView = "atlas" | "laboratory";

const views: Record<GeometryView, { eyebrow: string; title: string; lead: string; other: GeometryView; open: string }> = {
  atlas: {
    eyebrow: "Research · To read · six plates",
    title: "Atlas",
    lead: "Six plates on the corner: how deep it cuts, where it leaves the edge, how its curvature is spread and how "
      + "one contour sits inside another. Each plate isolates one property, draws it and gives the numbers behind "
      + "the drawing. Nothing here moves: the plates are the reference the laboratory is read against.",
    other: "laboratory",
    open: "Open the laboratory",
  },
  laboratory: {
    eyebrow: "Research · To operate · one instrument",
    title: "Laboratory",
    lead: "Move the parameters of plates 1, 3 and 4 of the atlas and read the contour they produce, then compare it "
      + "with plain themed shapes on real components. The inset is the padding of the card; the inner radius rule "
      + "drives everything nested in it.",
    other: "atlas",
    open: "Open the atlas",
  },
};

export function GeometryPage({ view }: Readonly<{ view: GeometryView }>) {
  const { eyebrow, title, lead, other, open } = views[view];
  return (
    <article className="geo-page">
      <header className="geo-intro">
        <p className="geo-eyebrow">{eyebrow}</p>
        <h1 className="site-page-title">{title}</h1>
        <p className="geo-lead">
          {lead}
          {view === "atlas" && <> The numbers come from a <a href={source}>module of plain arithmetic over points</a>.</>}
        </p>
        <div className="geo-intro__actions">
          <Button href={`${study}${other}/`}>{open}</Button>
          <Button href={study} variant="outline">Read the written study</Button>
        </div>
      </header>

      {view === "atlas" ? (
        <>
          <dl className="geo-legend" aria-label="How to read the plates">
            {Object.values(statuses).map(({ label, tone, note }) => (
              <div key={label}><dt><Badge tone={tone} variant="outline" size="sm">{label}</Badge></dt><dd>{note}</dd></div>
            ))}
          </dl>
          <div className="geo-atlas">
            <CornerPlate />
            <CurvaturePlate />
            <FamilyPlate />
            <NestingPlate />
            <OpticalPlate />
            <SpecimenPlate />
          </div>
        </>
      ) : <div className="geo-instrument"><Lab /></div>}
    </article>
  );
}
