"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactElement, type ReactNode } from "react";
import type { ButtonLinkRenderProps } from "./Button.js";
import { cx } from "./cx.js";

/** Where focus lands when the menu opens. */
type Edge = "first" | "last";

interface MenuContextValue {
  id: string;
  open: boolean;
  edge: Edge;
  show: (edge: Edge) => void;
  /** Closes the menu; `refocus` hands focus back to the trigger. */
  close: (refocus?: boolean) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error("Menu parts must be rendered inside <MenuRoot>");
  return context;
}

export interface MenuRootProps {
  className?: string | undefined;
  children?: ReactNode;
}

/** Holds the open state for a `MenuTrigger` and its `MenuContent`; an outside click closes it. */
export function MenuRoot({ className, children }: Readonly<MenuRootProps>) {
  const [open, setOpen] = useState(false);
  const [edge, setEdge] = useState<Edge>("first");
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const context = useMemo(() => ({
    id,
    open,
    edge,
    show(at: Edge) {
      setEdge(at);
      setOpen(true);
    },
    close(refocus = false) {
      setOpen(false);
      if (refocus) rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
    },
  }), [id, open, edge]);

  return (
    <MenuContext.Provider value={context}>
      <div ref={rootRef} className={cx("elea-menu", className)}>{children}</div>
    </MenuContext.Provider>
  );
}

/** What the element that opens the menu must receive. */
export interface MenuTriggerProps {
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

/** Hands the props that open and name the menu to the trigger the host renders. */
export function MenuTrigger({ children }: Readonly<{ children: (props: MenuTriggerProps) => ReactNode }>) {
  const { id, open, show, close } = useMenu();
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      show("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      show("last");
    }
  };
  return <>{children({ "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": id, onClick: () => (open ? close() : show("first")), onKeyDown })}</>;
}

export interface MenuContentProps {
  /** Accessible name of the menu list. */
  label: string;
  align?: "start" | "end" | undefined;
  /** Shown above the items and read as the description of the menu, such as a name and a company. */
  header?: ReactNode;
  className?: string | undefined;
  children?: ReactNode;
}

/** The list, present while open: arrows, Home and End move, Escape and Tab close. */
export function MenuContent({ label, align = "start", header, className, children }: Readonly<MenuContentProps>) {
  const { id, open, edge, close } = useMenu();
  const listRef = useRef<HTMLDivElement>(null);
  const items = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled, [aria-disabled])') ?? []);

  useEffect(() => {
    if (open) items().at(edge === "first" ? 0 : -1)?.focus();
  }, [open, edge]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab") return close();
    const all = items();
    const current = all.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    if (event.key === "ArrowDown") next = all[(current + 1) % all.length];
    else if (event.key === "ArrowUp") next = all.at(current < 0 ? -1 : current - 1);
    else if (event.key === "Home") next = all[0];
    else if (event.key === "End") next = all.at(-1);
    else if (event.key !== "Escape") return;
    event.preventDefault();
    if (event.key === "Escape") close(true);
    else next?.focus();
  };

  if (!open) return null;
  const headerId = header == null ? undefined : `${id}-header`;
  return (
    <div ref={listRef} id={id} role="menu" aria-label={label} aria-describedby={headerId} className={cx("elea-menu__list", `elea-menu__list--${align}`, className)} onKeyDown={onKeyDown}>
      {headerId && <div id={headerId} className="elea-menu__header">{header}</div>}
      {children}
    </div>
  );
}

interface MenuItemBaseProps {
  icon?: ReactNode;
  disabled?: boolean | undefined;
  /** Destructive tone. */
  danger?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

export interface MenuActionItemProps extends MenuItemBaseProps {
  onSelect: () => void;
  href?: undefined;
}

export interface MenuLinkItemProps extends MenuItemBaseProps {
  /** The address the item leads to. */
  href: string;
  /** Renders an enabled router link, as `Button` does. A disabled item uses a native anchor without a destination. */
  render?: ((props: ButtonLinkRenderProps) => ReactElement) | undefined;
  onSelect?: (() => void) | undefined;
}

export type MenuItemProps = MenuActionItemProps | MenuLinkItemProps;

/** One action, or a link when `href` is given; choosing it closes the menu and returns focus to the trigger. */
export function MenuItem({ onSelect, icon, disabled, danger, className, children, ...rest }: Readonly<MenuItemProps>) {
  const { close } = useMenu();
  const content = (
    <>
      {icon && <span className="elea-menu__icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </>
  );
  const shared = {
    role: "menuitem",
    className: cx("elea-menu__item", danger && "elea-menu__item--danger", className),
    tabIndex: -1,
    onClick: () => {
      close(true);
      onSelect?.();
    },
  };
  if (rest.href !== undefined) {
    // An anchor without an address is no link: a disabled one is a plain item
    if (disabled) return <span role="menuitem" className={shared.className} aria-disabled="true">{content}</span>;
    const link = {
      ...shared,
      href: rest.href,
      onMouseEnter: (event: ReactMouseEvent<HTMLAnchorElement>) => event.currentTarget.focus(),
      // A link answers Enter; a menu item answers Space as well
      onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => {
        if (event.key !== " ") return;
        event.preventDefault();
        event.currentTarget.click();
      },
    };
    return rest.render ? rest.render({ ...link, children: content }) : <a {...link}>{content}</a>;
  }
  return <button {...shared} type="button" disabled={disabled} onMouseEnter={(event) => event.currentTarget.focus()}>{content}</button>;
}

/** A line between two sets of items. */
export function MenuSeparator() {
  return <hr className="elea-menu__separator" />;
}

/** Items that belong together, under a heading that names them. */
export function MenuGroup({ label, children }: Readonly<{ label: ReactNode; children?: ReactNode }>) {
  return (
    <fieldset className="elea-menu__group">
      <legend className="elea-menu__group-label">{label}</legend>
      {children}
    </fieldset>
  );
}

type MenuItemDataOf<Props> = Props extends unknown ? Omit<Props, "className" | "children"> & { id: string; label: ReactNode } : never;

/** An item of `Menu`: an action with `onSelect`, or a link with `href`. */
export type MenuItemData = MenuItemDataOf<MenuItemProps>;

export interface MenuProps {
  /** The trigger, given the props that open the menu and name it. */
  trigger: (props: MenuTriggerProps) => ReactNode;
  items: MenuItemData[];
  /** Accessible name of the menu list. */
  label: string;
  align?: "start" | "end" | undefined;
  /** Shown above the items and read as the description of the menu. */
  header?: ReactNode;
  className?: string | undefined;
}

/**
 * A dropdown menu from a list of items: the trigger opens it, arrows move, Enter or Space select,
 * Escape and an outside click close it. Compose `MenuRoot`, `MenuTrigger`, `MenuContent` and
 * `MenuItem` to add separators and groups.
 */
export function Menu({ trigger, items, label, align, header, className }: Readonly<MenuProps>) {
  return (
    <MenuRoot className={className}>
      <MenuTrigger>{trigger}</MenuTrigger>
      <MenuContent label={label} align={align} header={header}>
        {items.map(({ id, label: text, ...item }) => <MenuItem key={id} {...item}>{text}</MenuItem>)}
      </MenuContent>
    </MenuRoot>
  );
}
