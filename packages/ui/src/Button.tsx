import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Icon after the label. */
  trailingIcon?: ReactNode;
  /** Shows a spinner and blocks interaction; the label stays, for layout stability. */
  loading?: boolean | undefined;
  /** Text read by assistive technology while loading, e.g. "Saving". */
  loadingLabel?: string | undefined;
  fullWidth?: boolean | undefined;
}

export type ButtonProps = ButtonBaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { className?: string | undefined; href?: undefined };
export type LinkButtonProps = ButtonBaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & { className?: string | undefined; href: string; disabled?: boolean | undefined };

function classes({ variant = "primary", size = "md", loading, fullWidth, className }: ButtonBaseProps & { className?: string | undefined }): string {
  return cx("elea-button", `elea-button--${variant}`, `elea-button--${size}`, loading && "elea-button--loading", fullWidth && "elea-button--full", className);
}

/** A button, or a link styled as one when `href` is given. Labels come from `children`. */
export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant, size, icon, trailingIcon, loading = false, loadingLabel, fullWidth, className, children, ...rest } = props;
  const content = (
    <>
      {loading && <span className="elea-button__spinner" aria-hidden="true" />}
      {icon && <span className="elea-button__icon" aria-hidden="true">{icon}</span>}
      <span className="elea-button__label">{children}</span>
      {trailingIcon && <span className="elea-button__icon" aria-hidden="true">{trailingIcon}</span>}
    </>
  );
  const shared = { className: classes({ variant, size, loading, fullWidth, className }), "aria-busy": loading || undefined, "aria-label": loading && loadingLabel ? loadingLabel : undefined };
  if ("href" in rest && rest.href !== undefined) {
    const { href, disabled, ...anchor } = rest as LinkButtonProps;
    return (
      <a {...anchor} {...shared} href={disabled || loading ? undefined : href} aria-disabled={disabled || loading || undefined} role={disabled || loading ? "link" : undefined}>
        {content}
      </a>
    );
  }
  const { disabled, type = "button", ...button } = rest as ButtonProps;
  return (
    <button {...button} {...shared} type={type} disabled={disabled || loading}>
      {content}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "aria-label"> {
  /** The accessible name; icon buttons have no visible text. */
  label: string;
  children: ReactNode;
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
}

/** A square button holding only an icon, named for assistive technology by `label`. */
export function IconButton({ label, children, variant = "ghost", size = "md", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button {...rest} type={type} className={cx("elea-button", "elea-button--icon", `elea-button--${variant}`, `elea-button--${size}`, className)} aria-label={label} title={label}>
      <span className="elea-button__icon" aria-hidden="true">{children}</span>
    </button>
  );
}
