"use client";

import { forwardRef, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { NavigationList, type NavigationItem, type NavigationLinksProps } from "./NavigationList.js";
import { cx } from "./cx.js";

export type { NavigationItem } from "./NavigationList.js";

export interface NavbarProps extends NavigationLinksProps, Omit<ComponentPropsWithoutRef<"nav">, "children" | "dangerouslySetInnerHTML" | "role" | "aria-label"> {
  label: string;
  /** Visible, localized label of the disclosure in narrow containers. */
  menuLabel: string;
  items: readonly NavigationItem[];
  brand?: ReactNode;
  actions?: ReactNode;
  /** Utility controls beside the brand, including when the navigation is folded. */
  persistentActions?: ReactNode;
  /** Keep links visible and wrapping at every width, or fold them in narrow containers. */
  collapse?: "auto" | "never" | undefined;
  /** On wide bars, open a list below its group or a multi-column panel across the bar. */
  submenuLayout?: "list" | "columns" | undefined;
}

type Layout = "wide" | "collapsed" | "expanded";

/** A navigation landmark whose links and actions fold into an in-flow disclosure. */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar({ label, menuLabel, items, current, render, brand, actions, persistentActions, collapse = "auto", submenuLayout = "list", className, onKeyDown, ...props }, ref) {
  const panelId = useId();
  const bar = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const focusAfterExpansion = useRef(false);
  const [layout, setLayout] = useState<Layout>("wide");
  const hasBranches = items.some(item => item.children?.length);
  const floatingList = hasBranches && submenuLayout === "list";

  useEffect(() => {
    const row = bar.current;
    const view = row?.ownerDocument.defaultView;
    if (!row || !view) return;
    let compact: boolean | undefined;
    const alignLists = () => {
      if (!floatingList) return;
      const open = panel.current?.querySelectorAll<HTMLDetailsElement>(":scope > ul > li > details[open]");
      if (!open?.length) return;
      const barRect = row.getBoundingClientRect();
      const rtl = view.getComputedStyle(row).direction === "rtl";
      open.forEach(disclosure => {
        const rect = disclosure.parentElement!.getBoundingClientRect();
        disclosure.style.setProperty("--_elea-navbar-group-start", (rtl ? barRect.right - rect.right : rect.left - barRect.left) + "px");
        disclosure.style.setProperty("--_elea-navbar-group-bottom", (rect.bottom - barRect.top) + "px");
      });
    };
    const fit = () => {
      alignLists();
      const next = collapse === "auto" && view.getComputedStyle(row).getPropertyValue("--_elea-navbar-compact").trim() === "1";
      if (next === compact) return;
      compact = next;
      const active = row.ownerDocument.activeElement;
      focusAfterExpansion.current = !next && active === toggle.current;
      if (next) {
        setLayout(panel.current?.contains(active) ? "expanded" : "collapsed");
      } else {
        setLayout("wide");
      }
    };
    fit();
    const observer = view.ResizeObserver ? new view.ResizeObserver(fit) : null;
    observer?.observe(row);
    if (floatingList && panel.current) {
      observer?.observe(panel.current);
      const links = panel.current.querySelector("ul");
      if (links) observer?.observe(links);
      row.addEventListener("toggle", alignLists, true);
    }
    view.addEventListener("resize", fit);
    return () => {
      observer?.disconnect();
      row.removeEventListener("toggle", alignLists, true);
      view.removeEventListener("resize", fit);
    };
  }, [collapse, floatingList]);

  useEffect(() => {
    if (layout === "wide" && focusAfterExpansion.current) {
      focusAfterExpansion.current = false;
      panel.current?.querySelector<HTMLElement>("a[href], button:not(:disabled), summary, [tabindex='0']")?.focus();
    }
  }, [layout]);

  useEffect(() => {
    const root = panel.current;
    if (!hasBranches || !root) return;
    const doc = root.ownerDocument;
    const dismiss = (event: Event) => {
      const path = event.composedPath();
      root.querySelectorAll<HTMLDetailsElement>("details.elea-navigation-list__disclosure[open]").forEach(branch => {
        if (!path.includes(branch)) branch.open = false;
      });
    };
    doc.addEventListener("pointerdown", dismiss);
    doc.addEventListener("focusin", dismiss);
    return () => {
      doc.removeEventListener("pointerdown", dismiss);
      doc.removeEventListener("focusin", dismiss);
    };
  }, [hasBranches]);

  function closeBranches() {
    const root = panel.current;
    if (!root) return;
    const open = root.querySelectorAll<HTMLDetailsElement>("details.elea-navigation-list__disclosure[open]");
    const focusedBranch = Array.from(open).find(branch => branch.contains(root.ownerDocument.activeElement));
    open.forEach(branch => { branch.open = false; });
    focusedBranch?.querySelector("summary")?.focus();
  }
  const previousPage = useRef(current);
  useEffect(() => {
    if (current !== previousPage.current) closeBranches();
    previousPage.current = current;
  }, [current]);

  function close() {
    setLayout("collapsed");
    toggle.current?.focus();
  }

  return (
    <nav {...props} ref={ref} aria-label={label} className={cx("elea-navbar", className)} data-collapse={collapse} data-submenu-layout={submenuLayout}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape" && layout === "expanded") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}>
      <div className="elea-navbar__bar" ref={bar}>
        {brand != null && <div className="elea-navbar__brand">{brand}</div>}
        {persistentActions != null && <div className="elea-navbar__persistent">{persistentActions}</div>}
        {(items.length > 0 || actions != null) && <>
          <button ref={toggle} type="button" className="elea-navbar__toggle" hidden={layout === "wide"}
            aria-controls={panelId} aria-expanded={layout === "expanded"}
            onClick={() => setLayout(layout === "expanded" ? "collapsed" : "expanded")}>
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d={layout === "expanded" ? "m6 6 12 12M6 18 18 6" : "M3 6h18M3 12h18M3 18h18"} />
            </svg>
            {menuLabel}
          </button>
          <div ref={panel} id={panelId} className="elea-navbar__panel" hidden={layout === "collapsed"}>
            {items.length > 0 && <NavigationList items={items} current={current} render={render} onActivate={event => {
              if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
              closeBranches();
              if (layout === "expanded") close();
            }} />}
            {actions != null && <div className="elea-navbar__actions">{actions}</div>}
          </div>
        </>}
      </div>
    </nav>
  );
});
