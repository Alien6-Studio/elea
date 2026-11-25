"use client";

import { forwardRef, useId, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "size"> {
  value?: number | undefined;
  /** Starting value of an uncontrolled slider; `min` by default. */
  defaultValue?: number | undefined;
  onChange?: ((value: number) => void) | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  /** Visible label; without one, name the slider with `aria-label`. */
  label?: ReactNode;
  /** Shows the value beside the label. */
  showValue?: boolean | undefined;
  /** Words the value for the eye and for assistive technology, e.g. "40 %". */
  formatValue?: ((value: number) => string) | undefined;
  size?: "sm" | "md" | undefined;
  className?: string | undefined;
}

/** A native range input with a filled track: the keyboard, forms and touch work as the platform does. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider({ value, defaultValue, onChange, min = 0, max = 100, step = 1, label, showValue = false, formatValue, size = "md", className, id, ...rest }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? min);
  const current = Math.min(max, Math.max(min, value ?? uncontrolledValue));
  const worded = formatValue?.(current);
  const fill = max > min ? ((current - min) / (max - min)) * 100 : 0;
  return (
    <div className={cx("elea-slider", `elea-slider--${size}`, className)}>
      {(label || showValue) && (
        <div className="elea-slider__header">
          {label && <label htmlFor={inputId} className="elea-slider__label">{label}</label>}
          {/* The input already states its value, so the visible copy stays out of the accessibility tree */}
          {showValue && <span className="elea-slider__value" aria-hidden="true">{worded ?? current}</span>}
        </div>
      )}
      <input
        aria-valuetext={worded}
        {...rest}
        ref={ref}
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        className="elea-slider__input"
        style={{ "--elea-slider-fill": `${fill}%` } as CSSProperties}
        onChange={(event) => {
          const next = event.currentTarget.valueAsNumber;
          if (value === undefined) setUncontrolledValue(next);
          onChange?.(next);
        }}
      />
    </div>
  );
});
