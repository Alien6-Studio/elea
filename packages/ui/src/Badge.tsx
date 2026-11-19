import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type BadgeTone = "neutral" | "primary" | "secondary" | "success" | "warning" | "danger";
export type BadgeVariant = "solid" | "subtle" | "outline";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className"> {
  tone?: BadgeTone | undefined;
  variant?: BadgeVariant | undefined;
  size?: "sm" | "md" | undefined;
  icon?: ReactNode;
  className?: string | undefined;
  children: ReactNode;
}

/** A small label for a status or a count. */
export function Badge({ tone = "neutral", variant = "subtle", size = "md", icon, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={cx("elea-badge", `elea-badge--${tone}`, `elea-badge--${variant}`, `elea-badge--${size}`, className)}>
      {icon && <span className="elea-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
