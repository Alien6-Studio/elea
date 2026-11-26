import { useId, type LabelHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";
import { Skeleton } from "./Skeleton.js";
import { Input, type InputProps } from "./TextControls.js";

export { Input, Textarea, type CharacterCounter, type InputProps, type TextareaProps } from "./TextControls.js";

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
export function Field({ label, id, help, error, required = false, requiredMarker, className, children }: Readonly<FieldProps>) {
  const generatedId = useId();
  const controlId = id ?? `elea-field-${generatedId}`;
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

export function Label({ className, ...rest }: Readonly<LabelProps>) {
  return <label {...rest} className={cx("elea-field__label", className)} />;
}

export interface FieldSkeletonProps extends Pick<InputProps, "size"> {
  /** Holds a line for the help text. */
  help?: boolean | undefined;
  className?: string | undefined;
}

/** The placeholder of a `Field` around an `Input`: its label line, the input itself, its help line. */
export function FieldSkeleton({ size, help = false, className }: Readonly<FieldSkeletonProps>) {
  return (
    <div className={cx("elea-field", className)} aria-hidden="true">
      <span className="elea-field__label"><Skeleton width="30%" /></span>
      <Skeleton><Input size={size} disabled /></Skeleton>
      {help && <p className="elea-field__help"><Skeleton width="60%" /></p>}
    </div>
  );
}
