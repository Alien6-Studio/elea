import { asRecord, asString, fileKind, isSafeUrl, isSiteRelativeUrl, isVideoUrl } from "@alien6-studio/elea-content";
import { SanitizedHtml } from "../components/SanitizedHtml.js";
import { VideoEmbed } from "../components/VideoEmbed.js";
import type { BlockRendererProps } from "../context.js";

/** EditorJS `delimiter`: a visual pause between sections. */
export function DelimiterBlock() {
  return <hr className="elea-delimiter" />;
}

/** EditorJS `code`: verbatim text, never interpreted. */
export function CodeBlock({ block }: BlockRendererProps) {
  const code = asString(block.data.code);
  if (!code) return null;
  return (
    <pre className="elea-code">
      <code>{code}</code>
    </pre>
  );
}

/** EditorJS `raw`: stored HTML, rendered through the sanitizer like any paragraph. */
export function RawBlock({ block, context }: BlockRendererProps) {
  const html = asString(block.data.html);
  if (!html) return null;
  return <SanitizedHtml html={html} sanitizer={context.sanitizer} className="elea-raw" />;
}

/** EditorJS `embed`: only the supported video providers are embedded, never a raw iframe. */
export function EmbedBlock({ block, context }: BlockRendererProps) {
  const url = asString(block.data.source) || asString(block.data.embed);
  if (!url || !isSafeUrl(url)) return null;
  const caption = asString(block.data.caption);
  return (
    <figure className="elea-figure elea-figure--embed">
      <VideoEmbed url={url} title={caption || undefined} messages={context.messages} />
      {caption && <figcaption className="elea-caption">{caption}</figcaption>}
    </figure>
  );
}

/** EditorJS `attaches` (file attachment tool): a download card. */
export function AttachesBlock({ block, context }: BlockRendererProps) {
  const file = asRecord(block.data.file);
  if (Object.keys(file).length === 0) return null;
  const title = asString(block.data.title) || asString(file.title) || asString(file.name);
  const id = asString(file.fileId) || asString(file.id);
  const url = asString(file.url);
  const href = id || url ? context.resolveAssetUrl({ url, id }) : "";
  const extension = asString(file.extension);
  const kind = fileKind(extension || asString(file.name));
  const safeHref = href && (isSafeUrl(href) || isSiteRelativeUrl(href)) ? href : null;
  return (
    <figure className="elea-attachment elea-attachment--legacy">
      {safeHref ? (
        <a href={safeHref} target="_blank" rel="noopener noreferrer" download={asString(file.name) || undefined} className="elea-attachment__link">
          <span className={`elea-attachment__icon elea-attachment__icon--${kind}`} aria-hidden="true" data-kind={kind} />
          <span className="elea-attachment__body">
            <span className="elea-attachment__title">{title}</span>
            {extension && <span className="elea-attachment__type">{extension.toUpperCase()}</span>}
          </span>
        </a>
      ) : (
        <span className="elea-attachment__link elea-attachment__link--static">
          <span className={`elea-attachment__icon elea-attachment__icon--${kind}`} aria-hidden="true" data-kind={kind} />
          <span className="elea-attachment__body">
            <span className="elea-attachment__title">{title}</span>
          </span>
        </span>
      )}
    </figure>
  );
}

/** EditorJS `table`: the first row is the header. */
export function TableBlock({ block, context }: BlockRendererProps) {
  const rows = Array.isArray(block.data.content) ? block.data.content.filter((row): row is unknown[] => Array.isArray(row)) : [];
  if (rows.length === 0) return null;
  const withHeadings = block.data.withHeadings !== false;
  return (
    <div className="elea-table-wrapper">
      <table className="elea-table">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <SanitizedHtml key={cellIndex} as={withHeadings && rowIndex === 0 ? "th" : "td"} html={asString(cell)} sanitizer={context.sanitizer} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A block the registry and the renderers do not know: its type is shown, its data is not. */
export function UnknownBlock({ block, context }: BlockRendererProps) {
  const text = context.registry.toText(block);
  return (
    <div className="elea-unknown" data-elea-unknown-type={block.type}>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
