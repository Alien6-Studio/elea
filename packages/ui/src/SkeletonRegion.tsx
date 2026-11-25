"use client";

import { useEffect, useState, type HTMLAttributes } from "react";
import { cx } from "./cx.js";

export interface SkeletonRegionProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  loading: boolean;
  /** Said once to assistive technology when the placeholders show, e.g. "Loading orders". */
  label: string;
  /** Milliseconds before the placeholders show, so that a fast load never flashes them. */
  delay?: number | undefined;
  className?: string | undefined;
}

/**
 * The part of a page that loads: it is busy while `loading`, announces one label for all the
 * placeholders inside, and can hold them back for a moment. Their space is kept from the start.
 */
export function SkeletonRegion({ loading, label, delay = 0, className, children, ...rest }: Readonly<SkeletonRegionProps>) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setElapsed(true), delay);
    return () => {
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [loading, delay]);

  return (
    <div {...rest} aria-busy={loading} className={cx("elea-skeleton-region", loading && delay > 0 && !elapsed && "elea-skeleton-region--waiting", className)}>
      <output className="elea-skeleton-region__label">{loading && elapsed ? label : null}</output>
      {children}
    </div>
  );
}
