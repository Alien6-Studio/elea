import { useId, type FieldsetHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean | undefined;
}

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children" | "defaultValue" | "onChange"> {
  label: ReactNode;
  /** Form field name shared by the choices. Option values must be unique within this group. */
  name: string;
  options: readonly RadioOption[];
  /** Pass null for a controlled group with no selection. */
  value?: string | null | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean | undefined;
  requiredMarker?: ReactNode;
}

/** A labelled set of native radios with browser-managed keyboard navigation and form validation. */
export function RadioGroup({
  label, name, options, value, defaultValue, onChange, help, error, required, requiredMarker,
  className, id, form, "aria-describedby": describedBy, ...fieldsetProps
}: Readonly<RadioGroupProps>) {
  const generatedId = useId();
  const groupId = id ?? `elea-radio-${generatedId}`;
  const helpId = help ? `${groupId}-help` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  return (
    <fieldset
      {...fieldsetProps}
      id={groupId}
      form={form}
      className={cx("elea-radio-group", className)}
      aria-describedby={[describedBy, helpId, errorId].filter(Boolean).join(" ") || undefined}
      aria-invalid={error ? true : fieldsetProps["aria-invalid"]}
    >
      <legend className="elea-field__label">
        {label}
        {required && requiredMarker && <span className="elea-field__required" aria-hidden="true">{requiredMarker}</span>}
      </legend>
      {help && <p id={helpId} className="elea-field__help">{help}</p>}
      <div className="elea-radio-group__choices">
        {options.map((option, index) => {
          const labelId = `${groupId}-label-${index}`;
          const descriptionId = option.description ? `${groupId}-description-${index}` : undefined;
          return (
            <label key={option.value} className="elea-radio">
              <input
                type="radio"
                name={name}
                value={option.value}
                form={form}
                required={required}
                disabled={option.disabled}
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                checked={value === undefined ? undefined : option.value === value}
                defaultChecked={value === undefined ? option.value === defaultValue : undefined}
                onChange={onChange && (() => onChange(option.value))}
              />
              <span className="elea-radio__text">
                <span id={labelId}>{option.label}</span>
                {option.description && <span id={descriptionId} className="elea-radio__description">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={errorId} className="elea-field__error" role="alert">{error}</p>}
    </fieldset>
  );
}
