import { useMemo, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx, nextId } from "./cx.js";

export interface FieldProps {
  label: ReactNode;
  /** Id of the control; generated when absent and passed to `children` through `render`. */
  id?: string | undefined;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean | undefined;
  /** Visible marker for required fields, e.g. "*"; the control carries `required` itself. */
  requiredMarker?: ReactNode;
  className?: string | undefined;
  /** The control, given its id and the ids of the help and error texts to reference. */
  children: (control: { id: string; "aria-describedby": string | undefined; "aria-invalid": true | undefined; required: boolean }) => ReactNode;
}

/** Pairs a control with its label, help text and error, wiring the ARIA attributes between them. */
export function Field({ label, id, help, error, required = false, requiredMarker, className, children }: FieldProps) {
  const controlId = useMemo(() => id ?? nextId("elea-field"), [id]);
  const helpId = help ? `${controlId}-help` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("elea-field", Boolean(error) && "elea-field--invalid", className)}>
      <label htmlFor={controlId} className="elea-field__label">
        {label}
        {required && requiredMarker && <span className="elea-field__required" aria-hidden="true">{requiredMarker}</span>}
      </label>
      {children({ id: controlId, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {help && <p id={helpId} className="elea-field__help">{help}</p>}
      {error && <p id={errorId} className="elea-field__error" role="alert">{error}</p>}
    </div>
  );
}

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "className"> {
  className?: string | undefined;
}

export function Label({ className, ...rest }: LabelProps) {
  return <label {...rest} className={cx("elea-field__label", className)} />;
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> {
  invalid?: boolean | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
}

/** A text input on the tokens; `invalid` paints the error state. */
export function Input({ invalid = false, size = "md", className, ...rest }: InputProps) {
  return <input {...rest} className={cx("elea-ui-input", `elea-ui-input--${size}`, invalid && "elea-ui-input--invalid", className)} aria-invalid={invalid || rest["aria-invalid"] || undefined} />;
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  invalid?: boolean | undefined;
  className?: string | undefined;
}

export function Textarea({ invalid = false, className, ...rest }: TextareaProps) {
  return <textarea {...rest} className={cx("elea-ui-input", "elea-ui-textarea", invalid && "elea-ui-input--invalid", className)} aria-invalid={invalid || rest["aria-invalid"] || undefined} />;
}
