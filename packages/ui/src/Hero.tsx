import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "./cx.js";
import { ResponsiveImage, type ResponsiveImageProps } from "./ResponsiveImage.js";

export interface HeroProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  heading: ReactNode;
  /** Use the level that fits the document outline. Defaults to h1. */
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Structured responsive photography. Takes precedence over the custom media slot. */
  image?: ResponsiveImageProps | undefined;
  /** A figure, video or interactive preview. */
  media?: ReactNode;
  /** Cover places the copy over a structured image. Without an image it uses stacked layout. */
  layout?: "stacked" | "split" | "cover" | undefined;
  /** Logical side of the media in a wide split. Reading order is always text first. */
  mediaPosition?: "start" | "end" | undefined;
}

function hasContent(node: ReactNode) {
  return node != null && typeof node !== "boolean" && node !== "";
}

/** An introductory section labelled by its heading unless the host supplies a name. */
export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero({
  heading, headingLevel: Heading = "h1", eyebrow, description, actions, media, image,
  layout = "stacked", mediaPosition = "end", className, ...props
}, ref) {
  const headingId = useId();
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? undefined : headingId);
  const showMedia = !!image || hasContent(media);
  const split = layout === "split" && showMedia;
  return (
    <section {...props} ref={ref} aria-labelledby={labelledBy}
      className={cx("elea-hero", split && "elea-hero--split", split && mediaPosition === "start" && "elea-hero--media-start",
        layout === "cover" && !!image && "elea-hero--cover", className)}>
      <div className="elea-hero__inner">
        <div className="elea-hero__copy">
          {hasContent(eyebrow) && <div className="elea-hero__eyebrow">{eyebrow}</div>}
          <Heading className="elea-hero__heading" id={headingId}>{heading}</Heading>
          {hasContent(description) && <div className="elea-hero__description">{description}</div>}
          {hasContent(actions) && <div className="elea-hero__actions">{actions}</div>}
        </div>
        {showMedia && <div className="elea-hero__media">{image ? <ResponsiveImage {...image} /> : media}</div>}
      </div>
    </section>
  );
});
