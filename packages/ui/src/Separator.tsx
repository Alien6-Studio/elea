import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  orientation?: "horizontal" | "vertical" | undefined;
  /** A decorative line is ignored by assistive technology; set it to false where the line separates content. */
  decorative?: boolean | undefined;
  /** A short label set in the middle of the line, such as "or". */
  children?: ReactNode;
  className?: string | undefined;
}

/** A line between two groups of content, optionally carrying a label. */
export function Separator({ orientation = "horizontal", decorative = true, className, children, ...rest }: Readonly<SeparatorProps>) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      {...rest}
      className={cx("elea-separator", `elea-separator--${orientation}`, className)}
    >
      {children}
    </div>
  );
}
