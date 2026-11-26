export type PopoverAnchor = HTMLElement | { getBoundingClientRect(): DOMRect };

export type Side = "bottom" | "top";
export type Align = "start" | "center" | "end";

// Pixels between the panel and its anchor, and between the panel and the viewport edges.
const GAP = 8;
const EDGE = 8;

export const asElement = (anchor: PopoverAnchor | null | undefined) => (anchor && "nodeType" in anchor ? anchor : null);

/** Puts the panel against its anchor, flipped and shifted to stay inside the viewport. */
export function placePanel(panel: HTMLElement, anchor: PopoverAnchor, side: Side, align: Align) {
  const view = panel.ownerDocument.defaultView!;
  // The top layer escapes every clipping ancestor; without it the fixed position escapes most.
  if ("showPopover" in panel && !panel.hasAttribute("popover")) {
    panel.setAttribute("popover", "manual");
    panel.showPopover();
  }
  const rect = anchor.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = panel;
  const above = rect.top - height - GAP;
  const below = rect.bottom + GAP;
  const roomAbove = above >= EDGE;
  const roomBelow = below + height <= view.innerHeight - EDGE;
  const top = side === "top" ? roomAbove || !roomBelow : roomAbove && !roomBelow;
  const fromLeft = (align === "start") === (view.getComputedStyle(panel).direction !== "rtl");
  let left = fromLeft ? rect.left : rect.right - width;
  if (align === "center") left = (rect.left + rect.right) / 2 - width / 2;
  panel.dataset.side = top ? "top" : "bottom";
  panel.style.top = `${Math.max(EDGE, Math.min(top ? above : below, view.innerHeight - height - EDGE))}px`;
  panel.style.left = `${Math.max(EDGE, Math.min(left, view.innerWidth - width - EDGE))}px`;
}

/** Whether the anchor left the page, the viewport, or the visible part of the container that just scrolled. */
export function isAnchorGone(anchor: PopoverAnchor, scroller: EventTarget | null) {
  const element = asElement(anchor);
  const view = element?.ownerDocument.defaultView ?? globalThis;
  if (element && !element.isConnected) return true;
  const rect = anchor.getBoundingClientRect();
  const container = element && scroller && "getBoundingClientRect" in scroller && (scroller as Element).contains(element) ? (scroller as Element) : null;
  const clip = container?.getBoundingClientRect() ?? { top: 0, left: 0, bottom: view.innerHeight, right: view.innerWidth };
  return rect.bottom < clip.top || rect.top > clip.bottom || rect.right < clip.left || rect.left > clip.right;
}
