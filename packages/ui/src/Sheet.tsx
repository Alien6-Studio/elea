"use client";

import { DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, ModalSurface, type DialogProps, type ModalRootProps } from "./Dialog.js";
import { cx } from "./cx.js";

export interface SheetRootProps extends ModalRootProps {
  /** The edge of the viewport the sheet slides from; `end` by default. */
  side?: "start" | "end" | "top" | "bottom" | undefined;
  /** Width of a side sheet, or height of a top or bottom one. */
  size?: "sm" | "md" | "lg" | undefined;
}

/** The docked surface alone; it takes the same parts as `DialogRoot`. */
export function SheetRoot({ side = "end", size = "md", className, ...surface }: Readonly<SheetRootProps>) {
  return <ModalSurface {...surface} prefix="elea-sheet" backdropClassName={`elea-sheet-backdrop--${side}`} className={cx(`elea-sheet--${side}`, `elea-sheet--${size}`, className)} />;
}

export interface SheetProps extends Omit<DialogProps, "size">, Pick<SheetRootProps, "side" | "size"> {}

/**
 * A modal panel docked to an edge of the viewport, for a form, filters or details that keep the
 * page in sight. It behaves as a `Dialog`: focus trap, Escape, backdrop, focus return. Its body
 * scrolls while its header and actions stay in place.
 */
export function Sheet({ title, description, children, actions, closeLabel, ...root }: Readonly<SheetProps>) {
  return (
    <SheetRoot {...root}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogClose label={closeLabel} />
      </DialogHeader>
      {description && <DialogDescription>{description}</DialogDescription>}
      <DialogBody>{children}</DialogBody>
      {actions && <DialogFooter>{actions}</DialogFooter>}
    </SheetRoot>
  );
}
