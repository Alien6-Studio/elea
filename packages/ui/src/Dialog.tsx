"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, motionAttribute } from "./Button.js";
import { useConfirmField, type ConfirmField } from "./ConfirmField.js";
import { cx } from "./cx.js";
import { useSurfaceScope } from "./scope.js";

export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Where the focus starts in `panel`: the control that asks for it, else the first one, else the panel. */
export function entryOf(panel: HTMLElement) {
  return panel.querySelector<HTMLElement>("[data-elea-focus]:not(:disabled)") ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
}

/** Keeps Tab inside `panel`: past its last control it returns to the first, and back. */
export function cycleFocus(event: Pick<KeyboardEvent, "shiftKey" | "preventDefault">, panel: HTMLElement) {
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  const edge = focusable.at(event.shiftKey ? 0 : -1);
  if (edge && document.activeElement !== edge && !(event.shiftKey && document.activeElement === panel)) return;
  event.preventDefault();
  focusable.at(event.shiftKey ? -1 : 0)?.focus();
}

// Only the top modal owns the keyboard and can restore focus.
interface ActiveModal {
  opener: HTMLElement | null;
}
const stack: ActiveModal[] = [];
let unlockedOverflow = "";

/**
 * What every modal surface shares: once mounted and open, focus moves inside the panel, Tab cycles
 * within it, Escape closes it, the page stops scrolling, and focus returns to the opener.
 */
export function useModal(open: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const visible = mounted && open;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    const panel = panelRef.current;
    const active: ActiveModal = { opener: document.activeElement as HTMLElement | null };
    if (panel) entryOf(panel).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (stack.at(-1) !== active || event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key === "Tab" && panel) cycleFocus(event, panel);
    };
    if (stack.length === 0) unlockedOverflow = document.body.style.overflow;
    stack.push(active);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      const index = stack.indexOf(active);
      const above = stack[index + 1];
      if (above && panel?.contains(above.opener)) above.opener = active.opener;
      stack.splice(index, 1);
      document.removeEventListener("keydown", onKeyDown);
      if (stack.length === 0) document.body.style.overflow = unlockedOverflow;
      if (!above) active.opener?.focus?.();
    };
  }, [visible]);

  return { visible, panelRef };
}

interface ModalContextValue {
  /** Class prefix of the surface the parts sit in, `elea-dialog` or `elea-sheet`. */
  prefix: string;
  titleId: string;
  descriptionId: string;
  onClose: () => void;
  describe: (present: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalParts() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("Dialog parts must be rendered inside <DialogRoot> or <SheetRoot>");
  return context;
}

export interface ModalRootProps {
  open: boolean;
  onClose: () => void;
  /** Clicking the backdrop closes the surface; on by default. */
  dismissOnBackdrop?: boolean | undefined;
  /** Expressive motion for this surface; when omitted it follows the place it is rendered at, like its theme. */
  motion?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

interface ModalSurfaceProps extends ModalRootProps {
  prefix: string;
  backdropClassName?: string | undefined;
}

/**
 * The backdrop and the panel of a modal, in a portal at the end of the body; its parts name and describe it.
 * The backdrop takes the theme, appearance and motion of the place the surface is rendered at,
 * which an empty `<template>` marks.
 */
export function ModalSurface({ open, onClose, prefix, backdropClassName, className, dismissOnBackdrop = true, motion, children }: Readonly<ModalSurfaceProps>) {
  const { visible, panelRef } = useModal(open, onClose);
  const titleId = useId();
  const descriptionId = useId();
  const [described, setDescribed] = useState(false);
  const context = useMemo(() => ({ prefix, titleId, descriptionId, onClose, describe: setDescribed }), [prefix, titleId, descriptionId, onClose]);
  const [retained, setRetained] = useState(false);
  const [origin, scope] = useSurfaceScope(visible || retained);
  const motionSetting = motionAttribute(motion) ?? scope["data-elea-motion"];
  const closing = !visible && retained && motionSetting === "on";
  const lastFrame = useRef<Pick<ModalSurfaceProps, "backdropClassName" | "className" | "children"> | null>(null);

  useEffect(() => {
    // A host can clear its selected record or sheet side in the same update that closes it.
    if (visible && motionSetting === "on") lastFrame.current = { backdropClassName, className, children };
    else if (!closing) lastFrame.current = null;
  }, [visible, closing, motionSetting, backdropClassName, className, children]);

  useEffect(() => {
    if (visible || !closing) {
      setRetained(visible && motionSetting === "on");
      return;
    }
    // Only the backdrop opacity controls presence. Descendants may animate indefinitely.
    const frame = panelRef.current?.parentElement;
    const fade = frame?.getAnimations?.().find(item => "transitionProperty" in item && item.transitionProperty === "opacity");
    if (!fade) {
      setRetained(false);
      return;
    }
    let current = true;
    const finish = () => { if (current) setRetained(false); };
    fade.finished.then(finish, finish);
    return () => { current = false; };
  }, [visible, closing, motionSetting, panelRef]);

  const marker = <template ref={origin} />;
  if (!visible && !closing) return marker;
  const frame = closing && lastFrame.current ? lastFrame.current : { backdropClassName, className, children };
  const surface = createPortal(
    <div className={cx(`${prefix}-backdrop`, frame.backdropClassName)} {...scope} data-elea-motion={motionSetting}
      data-state={closing ? "closing" : "open"} aria-hidden={closing || undefined}
      ref={node => { node?.toggleAttribute("inert", closing); }}
      onMouseDown={(event) => { if (visible && dismissOnBackdrop && event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={described ? descriptionId : undefined} className={cx(prefix, frame.className)} tabIndex={-1}>
        <ModalContext.Provider value={context}>{frame.children}</ModalContext.Provider>
      </div>
    </div>,
    document.body,
  );
  return <>{marker}{surface}</>;
}

export interface DialogRootProps extends ModalRootProps {
  size?: "sm" | "md" | "lg" | undefined;
}

/**
 * The modal surface alone: focus moves inside, Tab cycles within, Escape and the backdrop close it,
 * focus returns to the opener. Give it a `DialogTitle`, which names it.
 */
export function DialogRoot({ size = "md", className, ...surface }: Readonly<DialogRootProps>) {
  return <ModalSurface {...surface} prefix="elea-dialog" className={cx(`elea-dialog--${size}`, className)} />;
}

export interface DialogPartProps {
  className?: string | undefined;
  children?: ReactNode;
}

/** The row that holds the title and the close control. */
export function DialogHeader({ className, children }: Readonly<DialogPartProps>) {
  const { prefix } = useModalParts();
  return <div className={cx(`${prefix}__header`, className)}>{children}</div>;
}

/** The heading that names the surface. */
export function DialogTitle({ className, children }: Readonly<DialogPartProps>) {
  const { prefix, titleId } = useModalParts();
  return <h2 id={titleId} className={cx(`${prefix}__title`, className)}>{children}</h2>;
}

/** The close control; `label` is its accessible name, e.g. "Close". */
export function DialogClose({ label, className }: Readonly<{ label: string; className?: string | undefined }>) {
  const { prefix, onClose } = useModalParts();
  return (
    <button type="button" className={cx(`${prefix}__close`, className)} onClick={onClose} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </button>
  );
}

/** A sentence that describes the surface, read after its name. */
export function DialogDescription({ className, children }: Readonly<DialogPartProps>) {
  const { prefix, descriptionId, describe } = useModalParts();
  useEffect(() => {
    describe(true);
    return () => describe(false);
  }, [describe]);
  return <p id={descriptionId} className={cx(`${prefix}__description`, className)}>{children}</p>;
}

/** The content, which scrolls when it outgrows the surface. */
export function DialogBody({ className, children }: Readonly<DialogPartProps>) {
  const { prefix } = useModalParts();
  return <div className={cx(`${prefix}__body`, className)}>{children}</div>;
}

/** The row of actions at the bottom. */
export function DialogFooter({ className, children }: Readonly<DialogPartProps>) {
  const { prefix } = useModalParts();
  return <div className={cx(`${prefix}__actions`, className)}>{children}</div>;
}

export interface DialogProps extends Omit<DialogRootProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions; defaults to nothing. */
  actions?: ReactNode;
  /** Accessible name of the close control, e.g. "Close". */
  closeLabel: string;
}

/**
 * A modal dialog: focus moves inside, Tab cycles within, Escape and the backdrop close it,
 * focus returns to the opener. Rendered in a portal at the end of the body. Compose `DialogRoot`
 * and its parts when the header, the body or the footer need another shape.
 */
export function Dialog({ title, description, children, actions, closeLabel, ...root }: Readonly<DialogProps>) {
  return (
    <DialogRoot {...root}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogClose label={closeLabel} />
      </DialogHeader>
      {description && <DialogDescription>{description}</DialogDescription>}
      {children && <DialogBody>{children}</DialogBody>}
      {actions && <DialogFooter>{actions}</DialogFooter>}
    </DialogRoot>
  );
}

/** What a confirmation is about; it colours the confirm button and the icon. */
export type ConfirmTone = "danger" | "primary" | "success" | "info";

export interface ConfirmDialogProps extends Omit<DialogProps, "actions" | "children" | "onClose"> {
  /** Called with the trimmed value of the `field`, and with nothing when there is none. */
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
  /** A value to collect with the answer; the focus starts in it. */
  field?: ConfirmField | undefined;
  /** Tone of the confirm button and of the icon; `danger` for destructive actions. */
  tone?: ConfirmTone | undefined;
  /** Shown before the title, in the colour of the tone. */
  icon?: ReactNode;
  loading?: boolean | undefined;
}

/** A dialog asking for a yes or no, in the tone of what it confirms. `ConfirmPopover` asks the same next to a control. */
export function ConfirmDialog({ onConfirm, onCancel, confirmLabel, cancelLabel, field, tone = "primary", icon, loading = false, title, ...dialog }: Readonly<ConfirmDialogProps>) {
  const { control, button } = useConfirmField(field, dialog.open, loading, onConfirm);
  return (
    <Dialog
      {...dialog}
      title={icon ? <><span className={`elea-dialog__icon elea-dialog__icon--${tone}`} aria-hidden="true">{icon}</span>{title}</> : title}
      onClose={onCancel}
      actions={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone} {...button} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      {control}
    </Dialog>
  );
}
