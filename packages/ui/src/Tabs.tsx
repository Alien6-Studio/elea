"use client";

import { createContext, useContext, useId, useMemo, useState, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";

interface TabsContextValue {
  id: string;
  active: string | undefined;
  select: (value: string) => void;
  keepMounted: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab parts must be rendered inside <TabsRoot>");
  return context;
}

// A value may hold spaces, which an ID reference cannot
const partId = (id: string, part: "tab" | "panel", value: string) => `${id}-${part}-${encodeURIComponent(value)}`;

export interface TabsRootProps<Value extends string = string> {
  /** The selected tab, when the host holds it. */
  value?: Value | undefined;
  /** The tab selected at first otherwise; give one of the two, or no tab starts selected. */
  defaultValue?: Value | undefined;
  onChange?: ((value: Value) => void) | undefined;
  /** Preserve component and form state inside inactive panels. */
  keepMounted?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

/** Holds the selection for a `TabList` and its `TabPanel`s, laid out as the host sees fit. */
export function TabsRoot<Value extends string>({ value, defaultValue, onChange, keepMounted = false, className, children }: Readonly<TabsRootProps<Value>>) {
  const id = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const active = value ?? uncontrolledValue;

  const context = useMemo(() => {
    function select(next: string) {
      if (next === active) return;
      if (value === undefined) setUncontrolledValue(next as Value);
      onChange?.(next as Value);
    }
    return { id, active, select, keepMounted };
  }, [id, active, keepMounted, value, onChange]);

  return (
    <TabsContext.Provider value={context}>
      <div className={cx("elea-tabs", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabPresentation = "underline" | "segmented" | "rail";

export interface TabListProps {
  /** Selection treatment. When omitted, the theme can choose a presentation. */
  presentation?: TabPresentation | undefined;
  /** Accessible name of the tab list. */
  label: string;
  className?: string | undefined;
  children?: ReactNode;
}

/** The row of tabs; arrow keys, Home and End move focus and selection together. */
export function TabList({ label, presentation, className, children }: Readonly<TabListProps>) {
  return <div role="tablist" aria-label={label} data-elea-tabs={presentation} className={cx("elea-tabs__list", className)}>{children}</div>;
}

// The enabled tabs of the list are read from the document, so they may sit at any depth
function navigate(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const tab = event.currentTarget;
  const tabs = Array.from(tab.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]:enabled') ?? []);
  const current = tabs.indexOf(tab);
  let position: number;
  switch (event.key) {
    case "Home": position = 0; break;
    case "End": position = tabs.length - 1; break;
    case "ArrowLeft":
    case "ArrowRight": {
      const rtl = getComputedStyle(tab).direction === "rtl";
      const forward = event.key === (rtl ? "ArrowLeft" : "ArrowRight");
      position = (current + (forward ? 1 : -1) + tabs.length) % tabs.length;
      break;
    }
    default: return;
  }
  event.preventDefault();
  tabs[position]?.focus();
  tabs[position]?.click();
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "type" | "role" | "id" | "onClick" | "onKeyDown"> {
  /** Unique within its `TabsRoot`; pairs the tab with the panel of the same value. */
  value: string;
}

/** One tab; its content is free, so a count or an icon can sit beside the label. */
export function Tab({ value, className, children, ...rest }: Readonly<TabProps>) {
  const { id, active, select } = useTabs();
  const selected = value === active;
  return (
    <button {...rest} type="button" role="tab" id={partId(id, "tab", value)} aria-controls={partId(id, "panel", value)} aria-selected={selected} tabIndex={selected ? 0 : -1} className={cx("elea-tabs__tab", className)} onClick={() => select(value)} onKeyDown={navigate}>
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  /** Overrides the root's `keepMounted` for this panel. */
  keepMounted?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

/** The content of the tab with the same value, hidden while another one is selected. */
export function TabPanel({ value, keepMounted, className, children }: Readonly<TabPanelProps>) {
  const context = useTabs();
  const selected = value === context.active;
  return (
    <div role="tabpanel" id={partId(context.id, "panel", value)} aria-labelledby={partId(context.id, "tab", value)} hidden={!selected} tabIndex={0} className={cx("elea-tabs__panel", className)}>
      {(selected || (keepMounted ?? context.keepMounted)) && children}
    </div>
  );
}

export interface TabItem<Value extends string = string> {
  /** Unique across the items in this group. */
  value: Value;
  label: ReactNode;
  panel: ReactNode;
  disabled?: boolean | undefined;
}

export interface TabsProps<Value extends string = string> extends Omit<TabsRootProps<Value>, "children"> {
  /** Accessible name of the tab list. */
  label: string;
  presentation?: TabPresentation | undefined;
  items: readonly TabItem<Value>[];
}

/**
 * Horizontal tabs with automatic activation on arrow-key navigation, from a list of items.
 * Compose `TabsRoot`, `TabList`, `Tab` and `TabPanel` when the list and the panels sit apart.
 */
export function Tabs<Value extends string>({ label, items, value, defaultValue, onChange, keepMounted, className, presentation }: Readonly<TabsProps<Value>>) {
  const enabled = items.filter((item) => !item.disabled);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? enabled[0]?.value);
  // A value that names no enabled item falls back to the first one
  const active = enabled.find((item) => item.value === (value ?? uncontrolledValue)) ?? enabled[0];

  function select(next: Value) {
    if (value === undefined) setUncontrolledValue(next);
    onChange?.(next);
  }

  if (!items.length) return null;
  return (
    // The empty value selects nothing when every item is disabled
    <TabsRoot value={active?.value ?? ("" as Value)} onChange={select} keepMounted={keepMounted} className={className}>
      <TabList label={label} presentation={presentation}>
        {items.map((item) => <Tab key={item.value} value={item.value} disabled={item.disabled}>{item.label}</Tab>)}
      </TabList>
      {items.map((item) => <TabPanel key={item.value} value={item.value}>{item.panel}</TabPanel>)}
    </TabsRoot>
  );
}
