"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motionAttribute } from "./Button.js";
import { cx } from "./cx.js";
import { useSurfaceScope } from "./scope.js";

export type ToastTone = "neutral" | "primary" | "success" | "info" | "warning" | "danger";
export type ToastPosition = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone | undefined;
  icon?: ReactNode;
  /** A button or link beside the message, such as "Undo". */
  action?: ReactNode;
  /** Milliseconds before the toast leaves; `Infinity` keeps it until it is dismissed. */
  duration?: number | undefined;
  /** Showing a toast under the id of a visible one replaces it, e.g. "Saving…" then "Saved". */
  id?: string | undefined;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  /** Dismisses one toast, or all of them without an id. */
  dismiss: (id?: string) => void;
}

export interface ToastProviderProps {
  children?: ReactNode;
  /** Accessible name of the region that holds the toasts, e.g. "Notifications". */
  label: string;
  /** Accessible name of the close control of a toast, e.g. "Dismiss". */
  dismissLabel: string;
  position?: ToastPosition | undefined;
  /** Default lifetime of a toast in milliseconds. */
  duration?: number | undefined;
  /** Toasts shown at once; the oldest leave first. */
  max?: number | undefined;
  /** Expressive motion for the toasts; when omitted it follows the place the provider is rendered at. */
  motion?: boolean | undefined;
  /** The `data-elea-theme` the toasts take, for a provider that sits above the themed container; the provider's own place when omitted. */
  theme?: string | undefined;
  className?: string | undefined;
}

interface ToastEntry extends ToastOptions {
  id: string;
  leaving?: boolean;
}

/** How long a leaving toast stays mounted; matches the exit transition of toast.css. */
const EXIT_MS = 200;

const ToastContext = createContext<ToastApi | null>(null);

/** The `toast` and `dismiss` functions of the nearest `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast needs a ToastProvider above it.");
  return api;
}

function place(current: readonly ToastEntry[], entry: ToastEntry, max: number): ToastEntry[] {
  if (!current.some((other) => other.id === entry.id)) return [...current, entry].slice(-max);
  return current.map((other) => (other.id === entry.id ? entry : other));
}

/** Starts the exit of one toast, or of all of them without an id. */
function leave(current: readonly ToastEntry[], id: string | undefined): ToastEntry[] {
  return current.map((entry) => (id === undefined || entry.id === id ? { ...entry, leaving: true } : entry));
}

/** Removes what `leave` marked for this id; a toast leaving on its own account keeps its own delay. */
function drop(current: readonly ToastEntry[], id: string | undefined): ToastEntry[] {
  return current.filter((entry) => !entry.leaving || (id !== undefined && entry.id !== id));
}

/**
 * Holds brief messages above the page, in a portal at the end of the body. Toasts are announced
 * politely, errors at once; their timers wait while the pointer or the focus is on them.
 */
export function ToastProvider({ children, label, dismissLabel, position = "bottom-end", duration = 5000, max = 3, motion, theme, className }: Readonly<ToastProviderProps>) {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<readonly ToastEntry[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const [origin, scope] = useSurfaceScope();
  const counter = useRef(0);
  const paused = hovered || focused;

  useEffect(() => { setMounted(true); }, []);

  // A toast that leaves with the focus inside it never blurs, so the pause is released here
  useEffect(() => {
    if (focused && !region.current?.contains(document.activeElement)) setFocused(false);
  }, [focused, toasts]);

  const dismiss = useCallback((id?: string) => {
    setToasts((current) => leave(current, id));
    setTimeout(() => setToasts((current) => drop(current, id)), EXIT_MS);
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    let id = options.id;
    if (id === undefined) {
      counter.current += 1;
      id = `toast-${counter.current}`;
    }
    const entry = { ...options, id };
    setToasts((current) => place(current, entry, max));
    return id;
  }, [max]);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <template ref={origin} />
      {mounted && createPortal(
        <div
          ref={region}
          role="region"
          aria-label={label}
          aria-live="polite"
          {...scope}
          data-elea-theme={theme ?? scope["data-elea-theme"]}
          data-elea-motion={motionAttribute(motion) ?? scope["data-elea-motion"]}
          className={cx("elea-toasts", `elea-toasts--${position}`, className)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {toasts.map((entry) => (
            <Toast key={entry.id} entry={entry} lifetime={entry.duration ?? duration} paused={paused} dismissLabel={dismissLabel} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

function Toast({ entry, lifetime, paused, dismissLabel, onDismiss }: Readonly<{ entry: ToastEntry; lifetime: number; paused: boolean; dismissLabel: string; onDismiss: (id: string) => void }>) {
  const { id, title, description, tone = "neutral", icon, action, leaving } = entry;

  // The timer starts over when the toast is replaced or the pointer and the focus have left
  useEffect(() => {
    if (paused || leaving || !Number.isFinite(lifetime)) return;
    const timer = setTimeout(() => onDismiss(id), lifetime);
    return () => clearTimeout(timer);
  }, [entry, id, leaving, lifetime, onDismiss, paused]);

  return (
    <div role={tone === "danger" ? "alert" : undefined} aria-atomic="true" data-leaving={leaving || undefined} className={cx("elea-toast", `elea-toast--${tone}`)}>
      {icon && <span className="elea-toast__icon" aria-hidden="true">{icon}</span>}
      <div className="elea-toast__body">
        <p className="elea-toast__title">{title}</p>
        {description && <p className="elea-toast__description">{description}</p>}
      </div>
      {action && <div className="elea-toast__action">{action}</div>}
      <button type="button" className="elea-toast__dismiss" onClick={() => onDismiss(id)} aria-label={dismissLabel} title={dismissLabel}>
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
  );
}
