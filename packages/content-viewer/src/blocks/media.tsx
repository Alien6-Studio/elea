import { fileKind, isSafeUrl, isSiteRelativeUrl, isVideoUrl, type AttachmentData, type ImageData, type VideoData } from "@alien6-studio/elea-content";
import { safeImageSource, safeLocation } from "../safeUrl.js";
import { VideoEmbed } from "../components/VideoEmbed.js";
import type { BlockRendererProps } from "../context.js";

function Caption({ text }: { text: string }) {
  return text ? <figcaption className="elea-caption">{text}</figcaption> : null;
}

export function ImageBlock({ block, context }: BlockRendererProps) {
  const data = block.data as ImageData;
  // The resolver is host code; its result is checked like any stored URL
  const source = data.file?.url || data.file?.id ? safeImageSource(context.resolveAssetUrl(data.file)) : null;
  if (!source) return null;
  return (
    <figure className="elea-figure elea-figure--image">
      <img src={source} alt={data.alt ?? data.caption ?? context.messages.viewer.imageAlt} className="elea-image" loading="lazy" />
      <Caption text={data.caption} />
    </figure>
  );
}

export function VideoBlock({ block, context }: BlockRendererProps) {
  const data = block.data as VideoData;
  if (!data.url || !isVideoUrl(data.url) || !safeLocation(data.url)) return null;
  return (
    <figure className="elea-figure elea-figure--video">
      <VideoEmbed url={data.url} title={data.caption || undefined} messages={context.messages} />
      <Caption text={data.caption} />
    </figure>
  );
}

/** A linkable location for an attachment: its URL when safe, else the resolved file, else nothing. */
export function attachmentHref(data: AttachmentData, resolve: BlockRendererProps["context"]["resolveAssetUrl"]): string | null {
  if (data.url && (isSafeUrl(data.url) || isSiteRelativeUrl(data.url))) return data.url;
  if (data.file && (data.file.url || data.file.id)) return safeLocation(resolve(data.file));
  return null;
}

export function AttachmentBlock({ block, context }: BlockRendererProps) {
  const data = block.data as AttachmentData;
  if (!data.resourceId || !data.title) return null;
  const href = attachmentHref(data, context.resolveAssetUrl);
  const kind = fileKind(data.type);
  const body = (
    <>
      <span className={`elea-attachment__icon elea-attachment__icon--${kind}`} aria-hidden="true" data-kind={kind} />
      <span className="elea-attachment__body">
        <span className="elea-attachment__title">{data.title}</span>
        {data.description && <span className="elea-attachment__description">{data.description}</span>}
        {data.type && <span className="elea-attachment__type">{data.type}</span>}
      </span>
    </>
  );
  return (
    <div className="elea-attachment" data-elea-resource-id={data.resourceId}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="elea-attachment__link">
          {body}
        </a>
      ) : (
        <span className="elea-attachment__link elea-attachment__link--static">{body}</span>
      )}
    </div>
  );
}
