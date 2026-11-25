import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { Skeleton } from "./Skeleton.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "info";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonRadius = "none" | "sm" | "md" | "lg" | "full";
export type ButtonShadow = "none" | "sm" | "md";
/**
 * The gesture a button plays under expressive motion. `lift` rises on hover, `scale` grows,
 * `push` sinks onto a solid edge, `shine` sweeps a highlight, `ripple` spreads a wave from
 * the press, `spotlight` lights the surface under the pointer, `magnetic` leans toward the
 * pointer and `tilt` turns to face it.
 */
export type ButtonEffect = "lift" | "scale" | "push" | "shine" | "ripple" | "spotlight" | "magnetic" | "tilt";

interface ButtonLookProps {
  size?: ButtonSize | undefined;
  /** Corner rounding, from square to pill. */
  radius?: ButtonRadius | undefined;
  /** A resting shadow that lifts the button off the surface. */
  shadow?: ButtonShadow | undefined;
  /** The gesture played under expressive motion; it does nothing while motion is off. */
  effect?: ButtonEffect | undefined;
}

interface ButtonBaseProps extends ButtonLookProps {
  variant?: ButtonVariant | undefined;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Icon after the label. */
  trailingIcon?: ReactNode;
  /** Shows a spinner and blocks interaction; the label stays, for layout stability. */
  loading?: boolean | undefined;
  /** Text read by assistive technology while loading, e.g. "Saving". */
  loadingLabel?: string | undefined;
  fullWidth?: boolean | undefined;
  /** Expressive motion (press, lift) for this button; by default it follows the nearest `data-elea-motion` ancestor. */
  motion?: boolean | undefined;
}

/** The `data-elea-motion` switch of a `motion` prop; nothing when the button follows its ancestors. */
export function motionAttribute(motion: boolean | undefined): "on" | "off" | undefined {
  if (motion === undefined) return undefined;
  return motion ? "on" : "off";
}

export type ButtonProps = ButtonBaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { className?: string | undefined; href?: undefined };
export type LinkButtonProps = ButtonBaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & { className?: string | undefined; href: string; disabled?: boolean | undefined };

function look({ size = "md", radius = "md", shadow = "none", effect = "lift" }: ButtonLookProps): string {
  return cx(`elea-button--${size}`, radius !== "md" && `elea-button--radius-${radius}`, shadow !== "none" && `elea-button--shadow-${shadow}`, effect !== "lift" && `elea-button--fx-${effect}`);
}

function classes({ variant = "primary", loading, fullWidth, className, ...rest }: ButtonBaseProps & { className?: string | undefined }): string {
  return cx("elea-button", `elea-button--${variant}`, look(rest), loading && "elea-button--loading", fullWidth && "elea-button--full", className);
}

type Pointer<T extends HTMLElement> = ((event: PointerEvent<T>) => void) | undefined;

/**
 * Publishes the pointer to the stylesheet for the effects that follow it: its position in the
 * button (--elea-x, --elea-y) and its offset from the centre, from -1 to 1 (--elea-px, --elea-py).
 */
function pointerProps<T extends HTMLElement>(effect: ButtonEffect | undefined, down: Pointer<T>, move: Pointer<T>, leave: Pointer<T>) {
  if (effect !== "ripple" && effect !== "spotlight" && effect !== "magnetic" && effect !== "tilt") return { onPointerDown: down, onPointerMove: move, onPointerLeave: leave };
  const track = (event: PointerEvent<T>) => {
    const { style, offsetWidth, offsetHeight } = event.currentTarget;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * offsetWidth;
    const y = ((event.clientY - box.top) / box.height) * offsetHeight;
    style.setProperty("--elea-x", `${x}px`);
    style.setProperty("--elea-y", `${y}px`);
    style.setProperty("--elea-px", String((x / offsetWidth) * 2 - 1));
    style.setProperty("--elea-py", String((y / offsetHeight) * 2 - 1));
  };
  return {
    onPointerDown: (event: PointerEvent<T>) => { down?.(event); track(event); },
    onPointerMove: (event: PointerEvent<T>) => { move?.(event); track(event); },
    onPointerLeave: (event: PointerEvent<T>) => {
      leave?.(event);
      event.currentTarget.style.removeProperty("--elea-px");
      event.currentTarget.style.removeProperty("--elea-py");
    },
  };
}

/** A button, or a link styled as one when `href` is given. Labels come from `children`. */
export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant, size, radius, shadow, effect, icon, trailingIcon, loading = false, loadingLabel, fullWidth, motion, className, children, ...rest } = props;
  const content = (
    <>
      {loading && <span className="elea-button__spinner" aria-hidden="true" />}
      {icon && <span className="elea-button__icon" aria-hidden="true">{icon}</span>}
      <span className="elea-button__label">{children}</span>
      {trailingIcon && <span className="elea-button__icon" aria-hidden="true">{trailingIcon}</span>}
    </>
  );
  const shared = {
    className: classes({ variant, size, radius, shadow, effect, loading, fullWidth, className }),
    "data-elea-motion": motionAttribute(motion),
    "aria-busy": loading || rest["aria-busy"],
    "aria-label": loading && loadingLabel ? loadingLabel : rest["aria-label"],
  };
  if ("href" in rest && rest.href !== undefined) {
    const { href, disabled, ...anchor } = rest as LinkButtonProps;
    const inactive = disabled || loading;
    return (
      <a
        {...anchor}
        {...shared}
        href={inactive ? undefined : href}
        aria-disabled={inactive || anchor["aria-disabled"]}
        role={anchor.role ?? (inactive ? "link" : undefined)}
        tabIndex={inactive ? -1 : anchor.tabIndex}
        onClick={inactive ? undefined : anchor.onClick}
        onAuxClick={inactive ? undefined : anchor.onAuxClick}
        {...pointerProps(effect, anchor.onPointerDown, anchor.onPointerMove, anchor.onPointerLeave)}
      >
        {content}
      </a>
    );
  }
  const { disabled, type = "button", ...button } = rest as ButtonProps;
  return (
    <button {...button} {...shared} {...pointerProps(effect, button.onPointerDown, button.onPointerMove, button.onPointerLeave)} type={type} disabled={disabled || loading}>
      {content}
    </button>
  );
}

export interface IconButtonProps extends ButtonLookProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "aria-label"> {
  /** The accessible name; icon buttons have no visible text. */
  label: string;
  children: ReactNode;
  /** A disc is a neutral circular action, suitable for toolbars and media overlays. */
  variant?: ButtonVariant | "disc" | undefined;
  /** Expressive motion for this button; by default it follows the nearest `data-elea-motion` ancestor. */
  motion?: boolean | undefined;
  className?: string | undefined;
}

/** An icon-only button, named for assistive technology by `label`. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, children, variant = "ghost", size, radius, shadow, effect, motion, className, type = "button", title = label, ...rest }, ref) {
  return (
    <button ref={ref} {...rest} {...pointerProps(effect, rest.onPointerDown, rest.onPointerMove, rest.onPointerLeave)} type={type} data-elea-motion={motionAttribute(motion)} className={cx("elea-button", "elea-button--icon", `elea-button--${variant}`, look({ size, radius, shadow, effect }), className)} aria-label={label} title={title}>
      <span className="elea-button__icon" aria-hidden="true">{children}</span>
    </button>
  );
});

export interface ButtonSkeletonProps extends Pick<ButtonProps, "size" | "radius" | "fullWidth" | "className"> {
  /** The label to come, when it is known: it gives the placeholder its exact width. */
  children?: ReactNode;
}

/** The placeholder of a `Button`: the button itself, out of reach, its label out of sight. */
export function ButtonSkeleton({ children = "\u2003\u2003\u2003\u2003", ...button }: Readonly<ButtonSkeletonProps>) {
  return <Skeleton><Button {...button} tabIndex={-1}>{children}</Button></Skeleton>;
}
