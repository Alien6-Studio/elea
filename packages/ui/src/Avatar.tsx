"use client";

import { Children, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";
import { Skeleton } from "./Skeleton.js";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className"> {
  /** Who or what is pictured: the accessible name, and the initials shown without an image. Empty where the name is written beside it. */
  name: string;
  src?: string | undefined;
  size?: AvatarSize | undefined;
  shape?: "circle" | "square" | undefined;
  /** Colour behind the initials. */
  tone?: "neutral" | "primary" | "secondary" | undefined;
  /** Replaces the initials when there is no image, e.g. an icon. */
  children?: ReactNode;
  className?: string | undefined;
}

/** The first letter of the first and last words, e.g. "Ada Lovelace" gives "AL". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words.at(-1)] : words;
  return letters.map((word) => Array.from(word ?? "")[0] ?? "").join("").toLocaleUpperCase();
}

/** A person or an entity as a picture, falling back to initials when the image is missing or fails. */
export function Avatar({ name, src, size = "md", shape = "circle", tone = "neutral", className, children, ...rest }: Readonly<AvatarProps>) {
  const [failed, setFailed] = useState<string>();
  const pictured = src !== undefined && src !== failed;
  return (
    <span
      role={pictured || !name ? undefined : "img"}
      aria-label={pictured || !name ? undefined : name}
      aria-hidden={name ? undefined : true}
      {...rest}
      className={cx("elea-avatar", `elea-avatar--${size}`, `elea-avatar--${shape}`, `elea-avatar--${tone}`, className)}
    >
      {pictured ? <img src={src} alt={name} onError={() => setFailed(src)} /> : <span aria-hidden="true">{children ?? initials(name)}</span>}
    </span>
  );
}

export type AvatarSkeletonProps = Pick<AvatarProps, "size" | "shape" | "className">;

/** The placeholder of an `Avatar`: the avatar itself, empty, so it has its size and its shape. */
export function AvatarSkeleton(props: Readonly<AvatarSkeletonProps>) {
  return <Skeleton><Avatar {...props} name="" /></Skeleton>;
}

export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** Avatars shown before the rest is counted, e.g. "+3". */
  max?: number | undefined;
  /** Size of the count, to match the avatars. */
  size?: AvatarSize | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/** Overlapping avatars; name the group with `aria-label`. */
export function AvatarGroup({ max, size = "md", className, children, ...rest }: Readonly<AvatarGroupProps>) {
  const avatars = Children.toArray(children);
  const shown = max === undefined ? avatars : avatars.slice(0, max);
  const hidden = avatars.length - shown.length;
  return (
    <div role="group" {...rest} className={cx("elea-avatar-group", className)}>
      {shown}
      {hidden > 0 && <span className={cx("elea-avatar", `elea-avatar--${size}`)}>+{hidden}</span>}
    </div>
  );
}
