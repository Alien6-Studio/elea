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
}

export type LayoutRuleId = "no-sideways-scroll" | "headings-on-lines" | "blocks-on-lines" | "groups-on-lines";

export interface LayoutRuleResult {
  rule: LayoutRuleId;
  title: string;
  /** A rule holds when nothing breaks it, including when nothing falls under it. */
  passed: boolean;
  assessed: number;
  findings: { label: string; message: string }[];
}

/**
 * Measures the page it runs in. A block is an element with a contour of its own: a border, a
 * surface, a shadow, a picture, a control, a table, a figure or a region that scrolls or clips.
 * A block that crosses the whole viewport is a band and its content is measured; any other block
 * answers for its edges and composes its own interior. A control or a single line of text takes
 * the width of its label and a block can be narrower than a column: the container that lays them
 * out answers for them, the nearest one at least a column wide that is not itself a control.
 * A component of the system without a contour, named by the pattern of its class, is a control.
 * Elements out of the flow are not composed by the ruling.
 */
export function collectLayout([frame, component]: readonly [string, string] = ["elea-frame elea-grid", "^elea-(?!(frame|grid)$)[a-z0-9-]+$"]): MeasuredLayout {
  const probe = document.createElement("div");
  probe.className = frame;
  probe.style.cssText = "visibility:hidden;block-size:0;row-gap:0;overflow:hidden";
  for (let column = 0; column < 24; column += 1) probe.appendChild(document.createElement("i")).style.cssText = "grid-column:auto;block-size:0";
  document.body.append(probe);
  const tracks = [...probe.children].map(child => child.getBoundingClientRect());
  const row = tracks.filter(track => track.top === tracks[0]!.top);
  probe.remove();

  const viewport = document.documentElement.clientWidth;
  const page = getComputedStyle(document.body).backgroundColor;
  const clear = /^(transparent|rgba\(.*, ?0\))$/;
  const column = row[0]!.width;
  const control = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL)$/;
  const named = new RegExp(component);
  // Methods rather than functions: the whole of this function is sent to the page, and methods travel as written
  const read = {
    label(element: Element) {
      const names = [...element.classList].slice(0, 2).map(name => `.${name}`).join("");
      return element.tagName.toLowerCase() + (element.id ? `#${element.id}` : names);
    },
    flows(element: Element, { position, display }: CSSStyleDeclaration, { width, height }: DOMRect) {
      const text = display.startsWith("inline") && !/^(IMG|SVG|VIDEO|CANVAS)$/i.test(element.tagName);
      return element.checkVisibility({ visibilityProperty: true }) && width > 0 && height > 0 && position !== "fixed" && position !== "absolute" && !text;
    },
    contoured(element: Element, style: CSSStyleDeclaration) {
      const painted = !clear.test(style.backgroundColor) && style.backgroundColor !== page;
      const bordered = ["top", "right", "bottom", "left"].some(side => Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0
        && style.getPropertyValue(`border-${side}-style`) !== "none" && !clear.test(style.getPropertyValue(`border-${side}-color`)));
      return /^(IMG|SVG|VIDEO|CANVAS|IFRAME|INPUT|SELECT|TEXTAREA|BUTTON|TABLE|PRE|FIGURE)$/i.test(element.tagName)
        || painted || style.backgroundImage !== "none" || style.boxShadow !== "none" || bordered || /auto|scroll|hidden|clip/.test(style.overflowX);
    },
    line(element: Element, style: CSSStyleDeclaration, height: number) {
      return height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom) < 2 * Number.parseFloat(style.fontSize)
        && (element.textContent ?? "").trim() !== "" && !/^(TABLE|PRE|FIGURE)$/.test(element.tagName);
    },
    holder(element: Element, contoured: boolean) {
      let holder = contoured ? element.parentElement! : element;
      while (holder.parentElement && (holder.getBoundingClientRect().width < column - 1 || control.test(holder.tagName))) holder = holder.parentElement;
      return holder;
    },
    content(holder: Element, label: string): MeasuredEdge {
      const box = holder.getBoundingClientRect();
      const inset = getComputedStyle(holder);
      return {
        label,
        left: box.left + Number.parseFloat(inset.borderLeftWidth) + Number.parseFloat(inset.paddingLeft),
        right: box.right - Number.parseFloat(inset.borderRightWidth) - Number.parseFloat(inset.paddingRight),
      };
    },
  };
  const headings: MeasuredEdge[] = [];
  const blocks: MeasuredEdge[] = [];
  const runs = new Map<Element, MeasuredEdge>();
  const queue: Element[] = [...document.body.children];
  while (queue.length > 0) {
    const element = queue.shift()!;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    if (!read.flows(element, style, box)) continue;
    const { left, right } = box;
    const label = read.label(element);
    if (/^H[1-6]$/.test(element.tagName)) {
      headings.push({ label: `${label} “${(element.textContent ?? "").trim().slice(0, 32)}”`, left, right });
      continue;
    }
    const contoured = read.contoured(element, style);
    const band = left <= 1 && right >= viewport - 1;
    if (band || !contoured && ![...element.classList].some(name => named.test(name))) {
      queue.unshift(...element.children);
      continue;
    }
    if (contoured && box.width >= column - 1 && !read.line(element, style, box.height) && !control.test(element.tagName)) {
      blocks.push({ label, left, right });
      continue;
    }
    const holder = read.holder(element, contoured);
    runs.set(holder, runs.get(holder) ?? read.content(holder, holder === element ? label : `${read.label(holder)} holding ${label}`));
  }
  return {
    viewport,
    extent: document.documentElement.scrollWidth,
    starts: row.map(track => track.left),
    ends: row.map(track => track.right),
    headings,
    blocks,
    groups: [...runs.values()],
  };
}

const TOLERANCE = 1;

/** Signed distance in pixels from a position to the nearest line. */
function offset(position: number, lines: readonly number[]) {
  return lines.map(line => position - line).reduce((nearest, distance) => (Math.abs(distance) < Math.abs(nearest) ? distance : nearest), Infinity);
}

const describe = (distance: number) => `${Math.abs(distance).toFixed(1)} px ${distance > 0 ? "after" : "before"} the nearest line`;

/** The rules a page composed on shared columns follows. Each one holds or is broken. */
export function auditLayout({ viewport, extent, starts, ends, headings, blocks, groups }: MeasuredLayout): LayoutRuleResult[] {
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
  return [
    { rule: "no-sideways-scroll", title: "A page does not scroll sideways", passed: scroll.length === 0, assessed: 1, findings: scroll },
    { rule: "headings-on-lines", title: "A heading starts on a column line", passed: heads.length === 0, assessed: headings.length, findings: heads },
    { rule: "blocks-on-lines", title: "A block at least a column wide, other than a control, starts and ends on a column line, or crosses the viewport", passed: edges.length === 0, assessed: blocks.length, findings: edges },
    { rule: "groups-on-lines", title: "A container of controls or of blocks narrower than a column starts or ends on a column line", passed: anchors.length === 0, assessed: groups.length, findings: anchors },
  ];
}
