// Measurement of a page for the layout audit. It runs in the page itself, so it is exercised by the
// audit in a browser and not by the unit tests.
import type { MeasuredEdge, MeasuredLayout } from "./audit.js";

/**
 * Measures the page it runs in. A block is an element with a contour of its own: a border, a
 * surface, a shadow, a picture, a control, a table, a figure or a region that scrolls or clips.
 * A block that crosses the whole viewport is a band and its content is measured; any other block
 * answers for its edges and composes its own interior. A control or a single line of text takes
 * the width of its label and a block can be narrower than a column: the container that lays them
 * out answers for them, the nearest one at least a column wide that is not itself a control.
 * A component of the system without a contour, named by the pattern of its class, is a control.
 * Elements out of the flow are not composed by the ruling. An element declares the measure its
 * content needs in the property named last, registered as a length that is not inherited.
 */
export function collectLayout([frame, component, declared]: readonly [string, string, string] = ["frame grid", "^elea-[a-z0-9-]+$", "--elea-layout-measure"]): MeasuredLayout {
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
    /** Neither a block nor a control: its content is measured. A control composes its own interior. */
    open(element: Element, contoured: boolean) {
      return !contoured && !control.test(element.tagName) && ![...element.classList].some(name => named.test(name));
    },
    measure(label: string, style: CSSStyleDeclaration, width: number) {
      const measure = Number.parseFloat(style.getPropertyValue(declared));
      return measure > 0 ? [{ label, width, measure }] : [];
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
  const measures: MeasuredLayout["measures"] = [];
  const runs = new Map<Element, MeasuredEdge>();
  const queue: Element[] = [...document.body.children];
  while (queue.length > 0) {
    const element = queue.shift()!;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    if (!read.flows(element, style, box)) continue;
    const { left, right } = box;
    const label = read.label(element);
    measures.push(...read.measure(label, style, box.width));
    if (/^H[1-6]$/.test(element.tagName)) {
      headings.push({ label: `${label} “${(element.textContent ?? "").trim().slice(0, 32)}”`, left, right });
      continue;
    }
    const contoured = read.contoured(element, style);
    const band = left <= 1 && right >= viewport - 1;
    if (band || read.open(element, contoured)) {
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
    measures,
  };
}
