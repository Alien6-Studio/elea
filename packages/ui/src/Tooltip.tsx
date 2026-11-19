"use client";

import { cloneElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface TooltipProps {
  content: ReactNode;
  /** A single element able to receive focus and hover; it gets `aria-describedby`. */
  children: ReactElement<Record<string, unknown>>;
  placement?: "top" | "bottom" | undefined;
  className?: string | undefined;
}

/** A short hint shown on hover and focus, described to assistive technology through `aria-describedby`. */
export function Tooltip({ content, children, placement = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const child = cloneElement(children, {
    "aria-describedby": id,
    onMouseEnter: (event: unknown) => { (children.props.onMouseEnter as ((event: unknown) => void) | undefined)?.(event); setVisible(true); },
    onMouseLeave: (event: unknown) => { (children.props.onMouseLeave as ((event: unknown) => void) | undefined)?.(event); setVisible(false); },
    onFocus: (event: unknown) => { (children.props.onFocus as ((event: unknown) => void) | undefined)?.(event); setVisible(true); },
    onBlur: (event: unknown) => { (children.props.onBlur as ((event: unknown) => void) | undefined)?.(event); setVisible(false); },
  });
  return (
    <span className={cx("elea-tooltip", className)}>
      {child}
      <span id={id} role="tooltip" className={cx("elea-tooltip__bubble", `elea-tooltip__bubble--${placement}`, visible && "elea-tooltip__bubble--visible")}>
        {content}
      </span>
    </span>
  );
}
