"use client";

import { useId, useState, type ReactElement, type ReactNode } from "react";
import type { ButtonLinkRenderProps } from "./Button.js";
import { cx } from "./cx.js";

export interface BreadcrumbItem {
  id: string;
  label: ReactNode;
  href?: string | undefined;
}

export interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
  label: string;
  /** Accessible name of the disclosure, for example "Earlier pages". */
  overflowLabel: string;
  /** Visible entries including the disclosure. Defaults to five, with a minimum of three. */
  maxItems?: number | undefined;
  separator?: ReactNode;
  render?: ((props: ButtonLinkRenderProps) => ReactElement) | undefined;
  className?: string | undefined;
}

function Trail({ items, overflowLabel, maxItems = 5, separator = "/", render }: Readonly<BreadcrumbProps>) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const limit = Math.max(3, Math.floor(maxItems));
  const hiddenCount = items.length > limit ? items.length - limit + 1 : 0;
  const divider = <span aria-hidden="true" className="elea-breadcrumb__separator">{separator}</span>;
  function itemContent(item: BreadcrumbItem, last: boolean) {
    if (last) return <span aria-current="page">{item.label}</span>;
    if (item.href === undefined) return item.label;
    const link = { href: item.href, className: "elea-breadcrumb__link" };
    return render ? render({ ...link, children: item.label }) : <a {...link}>{item.label}</a>;
  }
  return (
    <ol className="elea-breadcrumb__list" id={listId}>
      {items.map((item, index) => (
        <li key={item.id} hidden={!expanded && index > 0 && index <= hiddenCount}>
          {index > 0 && divider}
          {itemContent(item, index === items.length - 1)}
          {index === 0 && hiddenCount > 0 && <>
            {divider}
            <button type="button" className="elea-breadcrumb__overflow" aria-label={overflowLabel}
              aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(open => !open)}>…</button>
          </>}
        </li>
      ))}
    </ol>
  );
}

/** A hierarchical trail. The last entry names the current page. */
export function Breadcrumb(props: Readonly<BreadcrumbProps>) {
  if (props.items.length === 0) return null;
  return <nav aria-label={props.label} className={cx("elea-breadcrumb", props.className)}>
    <Trail key={props.items.at(-1)?.id} {...props} />
  </nav>;
}
