import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export type AlertTone = "neutral" | "primary" | "success" | "info" | "warning" | "danger";

interface AlertBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "title"> {
  tone?: AlertTone | undefined;
  variant?: "subtle" | "outline" | undefined;
  title?: ReactNode;
  icon?: ReactNode;
  /** Buttons or links under the message. */
  actions?: ReactNode;
  className?: string | undefined;
  children?: ReactNode;
}

/** A dismissible alert names its close control, e.g. "Dismiss". */
export type AlertProps = AlertBaseProps & ({ onDismiss: () => void; dismissLabel: string } | { onDismiss?: undefined; dismissLabel?: undefined });

/**
 * A message in the flow of the page. Warnings and errors are announced at once (`role="alert"`),
 * the other tones politely (`role="status"`); pass `role` to decide otherwise.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert({ tone = "neutral", variant = "subtle", title, icon, actions, onDismiss, dismissLabel, className, children, ...rest }, ref) {
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} {...rest} ref={ref} className={cx("elea-alert", `elea-alert--${tone}`, `elea-alert--${variant}`, className)}>
      {icon && <span className="elea-alert__icon" aria-hidden="true">{icon}</span>}
      <div className="elea-alert__body">
        {title && <p className="elea-alert__title">{title}</p>}
        {children && <div className="elea-alert__text">{children}</div>}
        {actions && <div className="elea-alert__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="elea-alert__dismiss" onClick={onDismiss} aria-label={dismissLabel} title={dismissLabel}>
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
});
