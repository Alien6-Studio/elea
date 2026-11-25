import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";
import { Skeleton } from "./Skeleton.js";

export type BadgeTone = "neutral" | "primary" | "secondary" | "success" | "info" | "warning" | "danger";
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
export function Badge({ tone = "neutral", variant = "subtle", size = "md", icon, className, children, ...rest }: Readonly<BadgeProps>) {
  return (
    <span {...rest} className={cx("elea-badge", `elea-badge--${tone}`, `elea-badge--${variant}`, `elea-badge--${size}`, className)}>
      {icon && <span className="elea-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

export interface BadgeSkeletonProps extends Pick<BadgeProps, "size" | "className"> {
  /** The label to come, when it is known: it gives the placeholder its exact width. */
  children?: ReactNode;
}

/** The placeholder of a `Badge`: the badge itself, its label out of sight. */
export function BadgeSkeleton({ children = "\u2003\u2003\u2003", ...badge }: Readonly<BadgeSkeletonProps>) {
  return <Skeleton><Badge {...badge}>{children}</Badge></Skeleton>;
}
