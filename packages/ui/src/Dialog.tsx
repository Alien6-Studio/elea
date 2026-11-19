"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "./Button.js";
import { cx } from "./cx.js";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions; defaults to nothing. */
  actions?: ReactNode;
  /** Accessible name of the close control, e.g. "Close". */
  closeLabel: string;
  size?: "sm" | "md" | "lg" | undefined;
  /** Clicking the backdrop closes the dialog; on by default. */
  dismissOnBackdrop?: boolean | undefined;
  className?: string | undefined;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A modal dialog: focus moves inside, Tab cycles within, Escape and the backdrop close it,
 * focus returns to the opener. Rendered in a portal at the end of the body.
 */
export function Dialog({ open, onClose, title, description, children, actions, closeLabel, size = "md", dismissOnBackdrop = true, className }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const firstElement = focusable[0] as HTMLElement;
      const lastElement = focusable.at(-1) as HTMLElement;
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="elea-dialog-backdrop" onMouseDown={(event) => { if (dismissOnBackdrop && event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className={cx("elea-dialog", `elea-dialog--${size}`, className)} tabIndex={-1}>
        <div className="elea-dialog__header">
          <h2 id={titleId} className="elea-dialog__title">{title}</h2>
          <button type="button" className="elea-dialog__close" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {description && <p id={descriptionId} className="elea-dialog__description">{description}</p>}
        {children && <div className="elea-dialog__body">{children}</div>}
        {actions && <div className="elea-dialog__actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}

export interface ConfirmDialogProps extends Omit<DialogProps, "actions" | "children" | "onClose"> {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
  /** Tone of the confirm button; `danger` for destructive actions. */
  tone?: Extract<ButtonVariant, "primary" | "danger"> | undefined;
  loading?: boolean | undefined;
}

/** A dialog asking for a yes or no, with the destructive tone when needed. */
export function ConfirmDialog({ onConfirm, onCancel, confirmLabel, cancelLabel, tone = "primary", loading = false, ...dialog }: ConfirmDialogProps) {
  return (
    <Dialog
      {...dialog}
      onClose={onCancel}
      actions={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    />
  );
}
