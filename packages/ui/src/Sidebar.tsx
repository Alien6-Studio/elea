"use client";

import { forwardRef, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { containsCurrent, NavigationList, type NavigationItem, type NavigationLinksProps } from "./NavigationList.js";
import { cx } from "./cx.js";

export type { NavigationItem } from "./NavigationList.js";

export interface SidebarGroup {
  id: string;
  label: string;
  items: readonly NavigationItem[];
  collapsible?: boolean | undefined;
  /** Collapsible groups start open by default. The current destination is always revealed on navigation. */
  defaultExpanded?: boolean | undefined;
}

export interface SidebarProps extends NavigationLinksProps, Omit<ComponentPropsWithoutRef<"nav">, "children" | "dangerouslySetInnerHTML" | "role" | "aria-label"> {
  label: string;
  groups: readonly SidebarGroup[];
  header?: ReactNode;
  footer?: ReactNode;
}

function Group({ group, current, render }: Readonly<{ group: SidebarGroup } & NavigationLinksProps>) {
  const id = useId();
  const details = useRef<HTMLDetailsElement>(null);
  const selectedId = containsCurrent(group.items, current) ? current : undefined;
  const [initiallyOpen] = useState(() => selectedId !== undefined || group.defaultExpanded !== false);
  useEffect(() => {
    if (selectedId !== undefined && details.current) details.current.open = true;
  }, [selectedId, group.collapsible]);

  const links = <NavigationList items={group.items} current={current} render={render} labelledBy={id} revealCurrent />;
  return group.collapsible ? (
    <details className="elea-sidebar__group" ref={details} open={initiallyOpen}>
      <summary className="elea-sidebar__label" id={id}>
        {group.label}
        <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 6 5 5 5-5" /></svg>
      </summary>
      {links}
    </details>
  ) : (
    <div className="elea-sidebar__group">
      <p id={id} className="elea-sidebar__label">{group.label}</p>
      {links}
    </div>
  );
}

/** Grouped navigation for a documentation section or workspace. Native disclosures also work before hydration. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({ label, groups, current, render, header, footer, className, ...props }, ref) {
  return (
    <nav {...props} ref={ref} aria-label={label} className={cx("elea-sidebar", className)}>
      {header != null && <div className="elea-sidebar__header">{header}</div>}
      {groups.map(group => <Group key={group.id} group={group} current={current} render={render} />)}
      {footer != null && <div className="elea-sidebar__footer">{footer}</div>}
    </nav>
  );
});
