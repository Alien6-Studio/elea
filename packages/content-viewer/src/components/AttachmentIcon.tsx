import type { AttachmentIconProps, AttachmentIconRenderer } from "../context.js";

export function AttachmentIcon({ render, ...icon }: AttachmentIconProps & { render: AttachmentIconRenderer | undefined }) {
  const custom = render?.(icon);
  if (custom != null) {
    return <span className="elea-attachment__custom-icon" aria-hidden="true">{custom}</span>;
  }
  return <span className={`elea-attachment__icon elea-attachment__icon--${icon.kind}`} aria-hidden="true" data-kind={icon.kind} />;
}
