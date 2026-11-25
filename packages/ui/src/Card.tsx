import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";
import { Skeleton } from "./Skeleton.js";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  variant?: "outline" | "elevated" | "subtle" | undefined;
  padding?: "none" | "sm" | "md" | "lg" | undefined;
  /** The link inside `CardTitle` covers the whole card, which then answers hover and focus. */
  interactive?: boolean | undefined;
  className?: string | undefined;
}

/** A surface that groups related content; compose it with the `Card…` parts below. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ variant = "outline", padding = "md", interactive = false, className, ...rest }, ref) {
  return <div {...rest} ref={ref} className={cx("elea-card", `elea-card--${variant}`, `elea-card--pad-${padding}`, interactive && "elea-card--interactive", className)} />;
});

export interface CardPartProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
  className?: string | undefined;
}

export interface CardImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
}

export const CardImage = forwardRef<HTMLImageElement, CardImageProps>(function CardImage({ className, ...rest }, ref) {
  return <img {...rest} ref={ref} className={cx("elea-card__image", className)} />;
});

export interface CardTitleProps extends CardPartProps {
  /** Heading level that fits the page outline; `h3` by default. */
  as?: "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
}

export function CardHeader({ className, ...rest }: Readonly<CardPartProps>) {
  return <div {...rest} className={cx("elea-card__header", className)} />;
}

export function CardTitle({ as: Heading = "h3", className, ...rest }: Readonly<CardTitleProps>) {
  return <Heading {...rest} className={cx("elea-card__title", className)} />;
}

export function CardDescription({ className, ...rest }: Readonly<CardPartProps>) {
  return <p {...rest} className={cx("elea-card__description", className)} />;
}

export function CardContent({ className, ...rest }: Readonly<CardPartProps>) {
  return <div {...rest} className={cx("elea-card__content", className)} />;
}

export function CardFooter({ className, ...rest }: Readonly<CardPartProps>) {
  return <div {...rest} className={cx("elea-card__footer", className)} />;
}

export interface CardSkeletonProps extends Pick<CardProps, "variant" | "padding" | "className"> {
  /** A placeholder above the title, e.g. `<Skeleton variant="rect" height={160} />`. */
  media?: ReactNode;
  /** Holds a line for the title; on by default. */
  title?: boolean | undefined;
  /** Holds a line for the description under the title. */
  description?: boolean | undefined;
  /** Lines of content to hold; 3 by default, 0 for none. */
  lines?: number | undefined;
  /** Placeholders of the footer, e.g. `<ButtonSkeleton />`. */
  footer?: ReactNode;
}

/** The placeholder of a `Card`: the card and its parts, each holding the lines of the text to come. */
export function CardSkeleton({ media, title = true, description = false, lines = 3, footer, ...card }: Readonly<CardSkeletonProps>) {
  return (
    <Card {...card} aria-hidden="true">
      {media}
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle><Skeleton width="50%" /></CardTitle>}
          {description && <CardDescription><Skeleton width="70%" /></CardDescription>}
        </CardHeader>
      )}
      {lines > 0 && <CardContent><Skeleton lines={lines} /></CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
