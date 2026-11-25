import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
  /** Work done, between 0 and `max`; leave it out while the amount is unknown. */
  value?: number | undefined;
  max?: number | undefined;
  /** Visible label; without one, name the bar with `aria-label`. */
  label?: ReactNode;
  /** Shows the value beside the label, as a percentage unless `formatValue` words it. */
  showValue?: boolean | undefined;
  /** Words the value for the eye and for assistive technology, e.g. "3 of 8 files". */
  formatValue?: ((value: number, max: number) => string) | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  tone?: "primary" | "success" | "info" | "warning" | "danger" | undefined;
  className?: string | undefined;
}

/** How far a task has come; without a `value` the bar shows that work is under way. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress({ value, max = 100, label, showValue = false, formatValue, size = "md", tone = "primary", className, ...rest }, ref) {
  const labelId = useId();
  const done = value === undefined ? undefined : Math.min(max, Math.max(0, value));
  const percent = done === undefined ? undefined : (done / max) * 100;
  const worded = done === undefined ? undefined : formatValue?.(done, max);
  const shown = showValue && percent !== undefined ? worded ?? `${Math.round(percent)}%` : undefined;
  return (
    <div ref={ref} className={cx("elea-progress", `elea-progress--${size}`, `elea-progress--${tone}`, className)}>
      {(label || shown) && (
        <div className="elea-progress__header">
          {label && <span id={labelId} className="elea-progress__label">{label}</span>}
          {shown && <span className="elea-progress__value">{shown}</span>}
        </div>
      )}
      <div role="progressbar" aria-labelledby={label ? labelId : undefined} aria-valuemin={0} aria-valuemax={max} aria-valuenow={done} aria-valuetext={worded} {...rest} className="elea-progress__track">
        <div className={cx("elea-progress__bar", percent === undefined && "elea-progress__bar--indeterminate")} style={percent === undefined ? undefined : { inlineSize: `${percent}%` }} />
      </div>
    </div>
  );
});
