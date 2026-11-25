import { version, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className"> {
  /** `text` follows the surrounding type size, `rect` holds a block, `circle` an avatar. */
  variant?: "text" | "rect" | "circle" | undefined;
  /** A CSS length; numbers are pixels. */
  width?: string | number | undefined;
  height?: string | number | undefined;
  /** Lines of text to hold; the last one is shorter. */
  lines?: number | undefined;
  /** Placeholders to stack, e.g. the rows of a list. */
  count?: number | undefined;
  /** With children, whether they are still loading; on by default. */
  loading?: boolean | undefined;
  /** The real content: it keeps its place and its size while the placeholder covers it. */
  children?: ReactNode;
  className?: string | undefined;
  /** A class for every placeholder, where `className` names what holds them: each block of a `count`, each of the `lines`. */
  blockClassName?: string | undefined;
}

/** React 18 writes `inert` from a string only, React 19 from a boolean only. */
const INERT = { inert: version.startsWith("18.") ? "" : true } as { inert: boolean };

/**
 * A placeholder with the shape of content that is loading. It is hidden from assistive
 * technology: mark the region that loads with `SkeletonRegion`, or with `aria-busy`.
 *
 * Around children it takes no size of its own: each child stays in the layout, out of sight and out
 * of reach, and is painted as the placeholder, so the loading and the loaded states cannot differ in size.
 */
export function Skeleton({ variant = "text", width, height, lines = 1, count = 1, loading = true, className, blockClassName, style, children, ...rest }: Readonly<SkeletonProps>) {
  if (children !== undefined && children !== null) {
    return (
      <span {...rest} {...(loading ? { "aria-hidden": true, ...INERT } : {})} className={cx("elea-skeleton-wrap", loading && "elea-skeleton-wrap--loading", className)} style={style}>
        {typeof children === "string" || typeof children === "number" ? <span>{children}</span> : children}
      </span>
    );
  }
  if (count > 1) {
    return (
      <span {...rest} aria-hidden="true" className={cx("elea-skeleton-stack", className)} style={{ width, ...style }}>
        {Array.from({ length: count }, (_, block) => <Skeleton key={block} variant={variant} height={height} lines={lines} blockClassName={blockClassName} />)}
      </span>
    );
  }
  if (variant === "text" && lines > 1) {
    return (
      <span {...rest} aria-hidden="true" className={cx("elea-skeleton-lines", className)} style={{ width, ...style }}>
        {Array.from({ length: lines }, (_, line) => <span key={line} className={cx("elea-skeleton elea-skeleton--text", blockClassName)} style={{ height }} />)}
      </span>
    );
  }
  return <span {...rest} aria-hidden="true" className={cx("elea-skeleton", `elea-skeleton--${variant}`, blockClassName, className)} style={{ width, height, ...style }} />;
}
