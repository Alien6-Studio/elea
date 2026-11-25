"use client";

import { cloneElement, Fragment, isValidElement, useEffect, useId, useState, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface TooltipProps {
  content: ReactNode;
  /** Text, an element or a component, whatever it forwards. A single element gets `aria-describedby` while the hint shows. */
  children: ReactNode;
  /** Preferred side: the hint moves to the other one when this one lacks room. */
  placement?: "top" | "bottom" | undefined;
  className?: string | undefined;
}

// Pixels between the hint and its trigger, and between the hint and the viewport edges.
const GAP = 4;
const EDGE = 8;

/** Puts the hint next to what its wrapper holds, flipped and shifted to stay inside the viewport. */
function place(bubble: HTMLElement, placement: "top" | "bottom") {
  const root = bubble.parentElement;
  if (!root) return;
  // The top layer escapes every clipping ancestor; without it the fixed position escapes most.
  if ("showPopover" in bubble && !bubble.hasAttribute("popover")) {
    bubble.setAttribute("popover", "manual");
    bubble.showPopover();
  }
  const anchor = measure(root, bubble);
  const { offsetWidth: width, offsetHeight: height } = bubble;
  const above = anchor.top - height - GAP;
  const below = anchor.bottom + GAP;
  const roomAbove = above >= EDGE;
  const roomBelow = below + height <= window.innerHeight - EDGE;
  const top = placement === "top" ? roomAbove || !roomBelow : roomAbove && !roomBelow;
  bubble.dataset.side = top ? "top" : "bottom";
  bubble.style.top = `${top ? above : below}px`;
  bubble.style.left = `${Math.max(EDGE, Math.min((anchor.left + anchor.right) / 2 - width / 2, window.innerWidth - width - EDGE))}px`;
}

// The wrapper has no box: its elements are measured by theirs, clipped text included.
function measure(root: HTMLElement, bubble: HTMLElement) {
  const range = document.createRange();
  const rects = [...root.childNodes].filter((node) => node !== bubble).map((node) => {
    if (node.nodeType === 1) return (node as Element).getBoundingClientRect();
    range.selectNodeContents(node);
    return "getBoundingClientRect" in range ? range.getBoundingClientRect() : undefined;
  }).filter((rect) => rect && (rect.width || rect.height)) as DOMRect[];
  if (!rects.length) return root.getBoundingClientRect();
  return {
    top: Math.min(...rects.map((rect) => rect.top)),
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
    left: Math.min(...rects.map((rect) => rect.left)),
    right: Math.max(...rects.map((rect) => rect.right)),
  };
}

/**
 * A short hint shown on hover and focus, which the pointer can enter and Escape dismisses. It exists only while
 * shown, above clipping containers and inside the viewport, and its wrapper leaves the layout of the trigger alone.
 */
export function Tooltip({ content, children, placement = "top", className }: Readonly<TooltipProps>) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!visible) return;
    // The hint is placed once: it leaves when its trigger moves.
    const hide = () => setVisible(false);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
    document.addEventListener("keydown", dismiss, true);
    return () => {
      document.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [visible]);

  let trigger = children;
  if (visible && isValidElement<Record<string, unknown>>(children) && children.type !== Fragment) {
    const description = children.props["aria-describedby"];
    trigger = cloneElement(children, { "aria-describedby": typeof description === "string" && description ? `${description} ${id}` : id });
  }
  return (
    <span className={cx("elea-tooltip", className)} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}>
      {trigger}
      {visible && (
        <span ref={(bubble) => { if (bubble) place(bubble, placement); }} id={id} role="tooltip" className="elea-tooltip__bubble">
          {content}
        </span>
      )}
    </span>
  );
}
