import { forwardRef, version, type ComponentPropsWithoutRef, type Ref } from "react";
import { cx } from "./cx.js";

export interface ResponsiveImageSource extends Pick<ComponentPropsWithoutRef<"source">, "media" | "type" | "sizes" | "width" | "height"> {
  srcSet: string;
}

interface ImageOptions extends ComponentPropsWithoutRef<"img"> {
  alt: string;
  /** Sources are tried in order before the fallback image. */
  sources?: readonly ResponsiveImageSource[] | undefined;
}

export interface ResponsiveImageProps extends ImageOptions {
  src: string;
}

/** Shared native image rendering also preserves CardImage's existing optional src and class. */
export function renderImage({ sources, fetchPriority, alt, ...props }: Readonly<ImageOptions>, ref: Ref<HTMLImageElement>) {
  // React 18 forwards the lowercase HTML attribute. React 19 recognises the DOM property.
  const priority = version.startsWith("18.") ? { fetchpriority: fetchPriority } : { fetchPriority };
  const image = <img {...props} {...priority} alt={alt} ref={ref} />;
  if (!sources?.length) return image;
  return <picture className="elea-responsive-picture">
    {sources.map(source => <source key={`${source.media ?? ""}/${source.type ?? ""}/${source.srcSet}`} {...source} />)}
    {image}
  </picture>;
}

/** Renders an img or an art-directed picture, with the ref and native attributes on its img. */
export const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(function ResponsiveImage({ className, ...props }, ref) {
  return renderImage({ ...props, className: cx("elea-responsive-image", className) }, ref);
});
