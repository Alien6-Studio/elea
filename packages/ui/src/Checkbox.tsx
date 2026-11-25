import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "className"> {
  /** Visible label; without one, give `aria-label`. */
  label?: ReactNode;
  description?: ReactNode;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  indeterminate?: boolean | undefined;
  className?: string | undefined;
}

/** A checkbox with its label, native so forms and screen readers get it for free. The ref reaches the native input. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, onCheckedChange, indeterminate = false, className, disabled, ...rest }, ref) {
  return (
    <label className={cx("elea-checkbox", disabled && "elea-checkbox--disabled", className)}>
      <input
        {...rest}
        type="checkbox"
        className="elea-checkbox__input"
        disabled={disabled}
        ref={(element) => {
          if (element) element.indeterminate = indeterminate;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
      />
      <span className="elea-checkbox__box" aria-hidden="true" />
      {(label || description) && (
        <span className="elea-checkbox__text">
          {label && <span className="elea-checkbox__label">{label}</span>}
          {description && <span className="elea-checkbox__description">{description}</span>}
        </span>
      )}
    </label>
  );
});

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "className" | "checked"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string | undefined;
}

/** An on/off switch: a native checkbox with `role="switch"`, so it works everywhere a checkbox does. */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle({ checked, onCheckedChange, label, className, disabled, ...rest }, ref) {
  return (
    <label className={cx("elea-toggle", checked && "elea-toggle--on", disabled && "elea-toggle--disabled", className)}>
      <input ref={ref} {...rest} type="checkbox" role="switch" className="elea-toggle__input" checked={checked} disabled={disabled} aria-checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} />
      <span className="elea-toggle__track" aria-hidden="true">
        <span className="elea-toggle__thumb" />
      </span>
      {label && <span className="elea-toggle__label">{label}</span>}
    </label>
  );
});
