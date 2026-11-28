// Audit of a page against the columns of its layout. The lines come from the
// system itself: a probe with the classes of the page frame is laid out in
// the page and its tracks are read, so the audit follows the ruling at any
// width and text size, and applies to any system that names its frame.

export interface MeasuredEdge {
  /** A name a person can find in the page, such as a selector. */
  label: string;
  left: number;
  right: number;
}

export interface MeasuredLayout {
  viewport: number;
  /** Width the page can scroll to. */
  extent: number;
  /** Left and right edge of each column of the ruling. */
  starts: number[];
  ends: number[];
  headings: MeasuredEdge[];
  blocks: MeasuredEdge[];
  /** Content box of each container that holds controls or blocks narrower than a column. */
  groups: MeasuredEdge[];
  /** Width of each element that declares a measure, and the measure it declares. */
  measures: { label: string; width: number; measure: number }[];
}

export type LayoutRuleId = "no-sideways-scroll" | "headings-on-lines" | "blocks-on-lines" | "groups-on-lines" | "measures-held";

export interface LayoutRuleResult {
  rule: LayoutRuleId;
  title: string;
  /** A rule holds when nothing breaks it, including when nothing falls under it. */
  passed: boolean;
  assessed: number;
  findings: { label: string; message: string }[];
}

const TOLERANCE = 1;

/** Signed distance in pixels from a position to the nearest line. */
function offset(position: number, lines: readonly number[]) {
  return lines.map(line => position - line).reduce((nearest, distance) => (Math.abs(distance) < Math.abs(nearest) ? distance : nearest), Infinity);
}

const describe = (distance: number) => `${Math.abs(distance).toFixed(1)} px ${distance > 0 ? "after" : "before"} the nearest line`;

/** The rules a page composed on shared columns follows. Each one holds or is broken. */
export function auditLayout({ viewport, extent, starts, ends, headings, blocks, groups, measures }: MeasuredLayout): LayoutRuleResult[] {
  const scroll = extent > viewport + TOLERANCE ? [{ label: "page", message: `scrolls ${(extent - viewport).toFixed(0)} px sideways` }] : [];
  const heads = headings.flatMap(({ label, left }) => {
    const distance = offset(left, starts);
    return Math.abs(distance) > TOLERANCE ? [{ label, message: `starts ${describe(distance)}` }] : [];
  });
  const edges = blocks.flatMap(({ label, left, right }) => {
    const start = offset(left, starts);
    const end = offset(right, ends);
    const broken = [Math.abs(start) > TOLERANCE ? `starts ${describe(start)}` : "", Math.abs(end) > TOLERANCE ? `ends ${describe(end)}` : ""].filter(Boolean);
    return broken.length > 0 ? [{ label, message: broken.join(", ") }] : [];
  });
  const anchors = groups.flatMap(({ label, left, right }) => {
    const start = offset(left, starts);
    const end = offset(right, ends);
    return Math.abs(start) > TOLERANCE && Math.abs(end) > TOLERANCE ? [{ label, message: `starts ${describe(start)}, ends ${describe(end)}` }] : [];
  });
  const narrow = measures.flatMap(({ label, width, measure }) => (
    width < measure - TOLERANCE ? [{ label, message: `is ${(measure - width).toFixed(1)} px narrower than its measure` }] : []
  ));
  return [
    { rule: "no-sideways-scroll", title: "A page does not scroll sideways", passed: scroll.length === 0, assessed: 1, findings: scroll },
    { rule: "headings-on-lines", title: "A heading starts on a column line", passed: heads.length === 0, assessed: headings.length, findings: heads },
    { rule: "blocks-on-lines", title: "A block at least a column wide, other than a control, starts and ends on a column line, or crosses the viewport", passed: edges.length === 0, assessed: blocks.length, findings: edges },
    { rule: "groups-on-lines", title: "A container of controls or of blocks narrower than a column starts or ends on a column line", passed: anchors.length === 0, assessed: groups.length, findings: anchors },
    { rule: "measures-held", title: "A block is at least as wide as the measure it declares", passed: narrow.length === 0, assessed: measures.length, findings: narrow },
  ];
}
