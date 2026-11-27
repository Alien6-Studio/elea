import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveStatusBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** Where the save stands; `idle` shows the text alone, or nothing. */
  state: SaveState;
  /** What the state says, e.g. "Saving", "Saved at 12:12", "Not saved". */
  children?: ReactNode;
  className?: string | undefined;
}

/** A status that can try again names its button, e.g. "Retry"; the button shows in the `error` state. */
export type SaveStatusProps = SaveStatusBaseProps & ({ onRetry: () => void; retryLabel: string } | { onRetry?: undefined; retryLabel?: undefined });

const ICONS: Partial<Record<SaveState, ReactNode>> = {
  saving: <span className="elea-save-status__spinner" />,
  saved: <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>,
  error: <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.75 20h18.5L12 4ZM12 10v4.5M12 17.5v.01" /></svg>,
};

/**
 * Where an automatic save stands, beside an editor or a form. The message sits in a status
 * region that stays mounted, so each change of text is announced politely; the retry button
 * is outside it.
 */
export const SaveStatus = forwardRef<HTMLDivElement, SaveStatusProps>(function SaveStatus({ state, onRetry, retryLabel, className, children, ...rest }, ref) {
  return (
    <div {...rest} ref={ref} className={cx("elea-save-status", `elea-save-status--${state}`, className)} data-state={state}>
      <output className="elea-save-status__message">
        {ICONS[state] && <span className="elea-save-status__icon" aria-hidden="true">{ICONS[state]}</span>}
        {children !== undefined && children !== null && <span className="elea-save-status__text">{children}</span>}
      </output>
      {state === "error" && onRetry && <button type="button" className="elea-save-status__retry" onClick={onRetry}>{retryLabel}</button>}
    </div>
  );
});
