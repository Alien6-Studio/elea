"use client";

import { useEffect, useId, useRef, useState, type MouseEventHandler, type ReactElement, type ReactNode } from "react";
import type { ButtonLinkRenderProps } from "./Button.js";

interface NavigationLabel {
  /** Stable id, unique throughout this navigation. */
  id: string;
  label: ReactNode;
  /** Optional decorative icon. The label supplies the accessible name. */
  icon?: ReactNode;
  /** Localized name of the disclosure. Defaults to the parent's label. */
  disclosureLabel?: string | undefined;
}

interface NavigationDestination extends NavigationLabel {
  href: string;
  children?: readonly NavigationItem[] | undefined;
}

/** Omit href on a group to make its entire label the disclosure. Every destination has a link. */
export type NavigationItem = NavigationDestination | (NavigationLabel & {
  href?: undefined;
  children: readonly NavigationItem[];
});

export interface NavigationLinksProps {
  current?: string | undefined;
  /** Router adapter. Forward these anchor props, including href, children and aria-current. */
  render?: ((props: ButtonLinkRenderProps) => ReactElement) | undefined;
}

interface NavigationListProps extends NavigationLinksProps {
  items: readonly NavigationItem[];
  labelledBy?: string | undefined;
  onActivate?: MouseEventHandler<HTMLAnchorElement> | undefined;
  /** Sidebar branches reveal the selected page. Navbar branches are transient disclosures. */
  revealCurrent?: boolean | undefined;
}

export function containsCurrent(items: readonly NavigationItem[], current: string | undefined): boolean {
  return current !== undefined && items.some(item => item.id === current || (item.children && containsCurrent(item.children, current)));
}

function itemLabel(item: NavigationItem, labelId?: string) {
  return <>
    {item.icon != null && <span className="elea-navigation-list__icon" aria-hidden="true">{item.icon}</span>}
    <span id={labelId}>{item.label}</span>
  </>;
}

function destination(item: NavigationDestination, { current, render, onActivate }: NavigationListProps, labelId?: string) {
  const children = itemLabel(item, labelId);
  const link: ButtonLinkRenderProps = {
    href: item.href,
    className: "elea-navigation-list__link",
    "aria-current": item.id === current ? "page" : undefined,
    onClick: onActivate,
    children,
  };
  return render ? render(link) : <a {...link}>{children}</a>;
}

function Branch({ item, list }: Readonly<{ item: NavigationItem; list: NavigationListProps }>) {
  const labelId = useId();
  const details = useRef<HTMLDetailsElement>(null);
  const children = item.children!;
  const active = containsCurrent(children, list.current);
  const selected = list.revealCurrent && active ? list.current : undefined;
  const [initiallyOpen] = useState(selected !== undefined);
  useEffect(() => {
    if (selected !== undefined && details.current) details.current.open = true;
  }, [selected]);

  return <li className="elea-navigation-list__branch" data-current-branch={active || undefined}>
    {item.href !== undefined && destination(item, list, labelId)}
    <details ref={details} open={initiallyOpen} className="elea-navigation-list__disclosure"
      onKeyDown={event => {
        if (event.key === "Escape" && !event.defaultPrevented && event.currentTarget.open) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}>
      <summary className={item.href === undefined ? "elea-navigation-list__group" : undefined}
        aria-label={item.disclosureLabel} aria-labelledby={item.disclosureLabel ? undefined : labelId}>
        {item.href === undefined && itemLabel(item, labelId)}
        <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 6 5 5 5-5" /></svg>
      </summary>
      <NavigationList {...list} items={children} labelledBy={labelId} />
    </details>
  </li>;
}

export function NavigationList(props: Readonly<NavigationListProps>) {
  return (
    <ul className="elea-navigation-list" aria-labelledby={props.labelledBy}>
      {props.items.map(item => {
        if (item.children?.length) return <Branch key={item.id} item={item} list={props} />;
        return item.href === undefined ? null : <li key={item.id}>{destination(item, props)}</li>;
      })}
    </ul>
  );
}
