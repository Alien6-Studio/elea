import { getVideoEmbedUrl, isDirectVideoFile, isSafeUrl, isSiteRelativeUrl, type EleaMessages } from "@alien6-studio/elea-content";

export interface VideoEmbedProps {
  url: string;
  title?: string | undefined;
  messages: EleaMessages;
  className?: string;
}

/** A player for YouTube, Vimeo, Dailymotion or a direct video file; a link when the URL is not supported. */
export function VideoEmbed({ url, title, messages, className }: Readonly<VideoEmbedProps>) {
  const navigable = isSafeUrl(url) || isSiteRelativeUrl(url);
  const embedUrl = navigable ? getVideoEmbedUrl(url) : null;
  const classes = ["elea-video", className].filter(Boolean).join(" ");
  if (!embedUrl) {
    if (!navigable) return <div className={`${classes} elea-video--unsupported`}><p>{messages.video.unsupportedFormat}</p></div>;
    return (
      <div className={`${classes} elea-video--unsupported`}>
        <p>{messages.video.unsupportedFormat}</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {messages.video.watchVideo}
        </a>
      </div>
    );
  }
  if (isDirectVideoFile(url)) {
    const extension = /\.(\w+)(?:[?#]|$)/.exec(url.trim())?.[1]?.toLowerCase() ?? "mp4";
    // A QuickTime file goes untyped: browsers that play it turn its declared type down.
    const type = extension === "mov" ? undefined : `video/${extension}`;
    return (
      <div className={classes}>
        <video controls className="elea-video__media" title={title}>
          <source src={embedUrl} type={type} />
          {messages.video.browserUnsupported}
        </video>
      </div>
    );
  }
  return (
    <div className={classes}>
      <iframe
        src={embedUrl}
        className="elea-video__media"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title ?? "Video"}
      />
    </div>
  );
}
