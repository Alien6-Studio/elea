"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type SyntheticEvent, type ReactNode } from "react";
import { Button } from "./Button.js";
import { useConfirmField, type ConfirmField } from "./ConfirmField.js";
import { cycleFocus, entryOf, type ConfirmTone } from "./Dialog.js";
import { asElement, isAnchorGone, placePanel, type PopoverAnchor, type Side, type Align } from "./panelPosition.js";
import { cx } from "./cx.js";

/** What a panel is placed against: an element, or the rectangle of one for hosts that only kept coordinates. */
export type { PopoverAnchor } from "./panelPosition.js";

interface PopoverPlacement {
  /** Preferred side: the panel moves to the other one when this one lacks room. */
  side?: Side | undefined;
  align?: Align | undefined;
  className?: string | undefined;
}

interface PopoverContent extends PopoverPlacement {
  /** The panel content, or a function given `close` to dismiss the popover from inside it. */
  children: ReactNode | ((api: { close: () => void }) => ReactNode);
  /** Accessible name of the panel. */
  label: string;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

export interface PopoverTriggerProps extends PopoverContent {
  /** The trigger, given the props that open the popover and tie it to its panel. */
  trigger: (props: { "aria-haspopup": "dialog"; "aria-expanded": boolean; "aria-controls": string; onClick: () => void }) => ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  anchor?: undefined;
}

export interface PopoverAnchorProps extends PopoverContent {
  /** What the panel is placed against, which the host renders anywhere; `null` while there is none. */
  anchor: PopoverAnchor | null;
  open: boolean;
  trigger?: undefined;
  defaultOpen?: undefined;
}

export type PopoverProps = PopoverTriggerProps | PopoverAnchorProps;

/** The anchor the host gave, or the trigger rendered next to the panel. */
function anchorOf(panel: HTMLElement, anchor: PopoverAnchor | null | undefined) {
  if (anchor !== undefined) return anchor;
  return panel.parentElement?.querySelector<HTMLElement>(`[aria-controls="${panel.id}"]`) ?? panel.parentElement;
}

interface Anchoring {
  open: boolean;
  /** `undefined` for the trigger rendered next to the panel. */
  anchor: PopoverAnchor | null | undefined;
  side: Side;
  align: Align;
  onDismiss: () => void;
  /** Tab stays inside the panel, and focus moving away does not dismiss it. */
  modal?: boolean;
}

/**
 * What every anchored panel shares: it sits in the top layer against its anchor and follows it, takes the focus when
 * it opens, keeps its clicks, asks to be dismissed on Escape, an outside press or an anchor out of sight, and returns
 * the focus it held.
 */
function useAnchoredPanel({ open, anchor, side, align, onDismiss, modal = false }: Anchoring) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const live = useRef({ anchor, side, align, onDismiss });
  const shown = open && anchor !== null;

  useEffect(() => { live.current = { anchor, side, align, onDismiss }; });

  useEffect(() => {
    const panel = panelRef.current;
    if (!shown || !panel) return;
    entryOf(panel).focus();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panel.contains(target) && !originRef.current?.contains(target)) live.current.onDismiss();
    };
    const follow = (event?: Event) => {
      const target = anchorOf(panel, live.current.anchor);
      if (!target || (event && isAnchorGone(target, event.target))) live.current.onDismiss();
      else placePanel(panel, target, live.current.side, live.current.align);
    };
    // Async content, such as the local month in a date field, can change which side fits.
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => follow());
    observer?.observe(panel);
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      observer?.disconnect();
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      // The focus the panel held went nowhere when it left: its anchor takes it back, when it is an element.
      const active = document.activeElement;
      if ((!active || active === document.body) && originRef.current?.isConnected) originRef.current.focus();
    };
  }, [shown]);

  const ref = (panel: HTMLDivElement | null) => {
    panelRef.current = panel;
    const target = panel && anchorOf(panel, anchor);
    if (!panel || !target) return;
    originRef.current = asElement(target);
    placePanel(panel, target, side, align);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!shown) return;
    if (event.key === "Tab" && modal && panelRef.current) cycleFocus(event, panelRef.current);
    if (event.key !== "Escape") return;
    // The panel takes the key, so a dialog around it stays open.
    event.preventDefault();
    event.stopPropagation();
    onDismiss();
  };

  const onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (shown && !modal && next && !event.currentTarget.contains(next) && !originRef.current?.contains(next)) onDismiss();
  };

  // A click in the panel stops there: the row or the card the popover is declared in must not take it.
  const onClick = (event: SyntheticEvent) => event.stopPropagation();

  return { shown, panel: { ref, onClick }, panelRef, handlers: { onKeyDown, onBlur } };
}

const panelClass = (side: Side, align: Align) => `elea-popover__panel elea-popover__panel--${side} elea-popover__panel--${align}`;

/**
 * A panel for content richer than a menu or a tooltip: a short form, filters, details. It opens from the `trigger`
 * it wraps, or against an `anchor` the host renders elsewhere, so one popover can serve every row of a list. It sits
 * above clipping containers, stays inside the viewport and follows its anchor. It is not modal: focus moves inside
 * when it opens, Escape, an outside press or focus moving away close it, and focus returns to an anchor element.
 */
export function Popover({ trigger, anchor, children, label, open, defaultOpen = false, onOpenChange, side = "bottom", align = "start", className }: Readonly<PopoverProps>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const id = useId();
  const expanded = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const close = () => setOpen(false);
  const { shown, panel: bind, handlers } = useAnchoredPanel({ open: expanded, anchor: trigger ? undefined : anchor ?? null, side, align, onDismiss: close });

  const panel = shown && (
    <div {...bind} id={id} role="dialog" aria-label={label} tabIndex={-1} className={cx(panelClass(side, align), !trigger && className)} {...(trigger ? {} : handlers)}>
      {typeof children === "function" ? children({ close }) : children}
    </div>
  );
  if (!trigger) return panel || null;
  return (
    <div className={cx("elea-popover", className)} {...handlers}>
      {trigger({ "aria-haspopup": "dialog", "aria-expanded": expanded, "aria-controls": id, onClick: () => setOpen(!expanded) })}
      {panel}
    </div>
  );
}

export interface ConfirmPopoverProps extends PopoverPlacement {
  /** The control that asked, e.g. the delete button of a row, or the rectangle it had; `null` while there is none. */
  anchor: PopoverAnchor | null;
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  /** Called with the trimmed value of the `field`, and with nothing when there is none. */
  onConfirm: (value?: string) => void;
  /** Called by the cancel button, Escape and an outside press. */
  onCancel: () => void;
  /** A value to collect with the answer; the focus starts in it. */
  field?: ConfirmField | undefined;
  /** Disables the field and both buttons, and shows progress on the confirm button. */
  loading?: boolean | undefined;
  /** Tone of the confirm button and of the icon; `danger` for destructive actions. */
  tone?: ConfirmTone | undefined;
  /** Shown before the title, in the colour of the tone. */
  icon?: ReactNode;
}

/**
 * A yes or no asked next to the control that needs it, with the contract of `ConfirmDialog`. One controlled instance
 * serves a whole list through `anchor`. Focus starts in the `field`, else on the cancel button, and stays inside, Escape and an outside
 * press cancel, and focus returns to an anchor element.
 */
export function ConfirmPopover({ anchor, open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel, field, loading = false, tone = "primary", icon, side = "bottom", align = "start", className }: Readonly<ConfirmPopoverProps>) {
  const id = useId();
  const { shown, panel, panelRef, handlers } = useAnchoredPanel({ open, anchor, side, align, onDismiss: onCancel, modal: true });

  const { control, button } = useConfirmField(field, shown, loading, onConfirm);

  // A disabled button drops the focus: the panel keeps it, so Escape still answers.
  useEffect(() => {
    if (shown && loading) panelRef.current?.focus();
  }, [shown, loading, panelRef]);

  if (!shown) return null;
  return (
    <div {...panel} id={id} role="alertdialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} tabIndex={-1} className={cx(panelClass(side, align), className)} {...handlers}>
      <p id={`${id}-title`} className="elea-popover__title">
        {icon && <span className={`elea-popover__icon elea-popover__icon--${tone}`} aria-hidden="true">{icon}</span>}
        {title}
      </p>
      {description && <p id={`${id}-description`} className="elea-popover__description">{description}</p>}
      {control}
      <div className="elea-popover__actions">
        <Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button size="sm" variant={tone} {...button} loading={loading}>{confirmLabel}</Button>
      </div>
    </div>
  );
}
