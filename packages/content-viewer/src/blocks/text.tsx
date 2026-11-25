import { asListMarker, asListStyle, formatMessage, isListItemChecked, listStyleForMarker, nestedListStyle, type HeaderData, type ListItem, type ParagraphData, type QuoteData, type ListData, type ListMarker, type EleaMessages, type HtmlSanitizer } from "@alien6-studio/elea-content";
import { SanitizedHtml } from "../components/SanitizedHtml.js";
import type { BlockRendererProps } from "../context.js";

export function ParagraphBlock({ block, context, meta }: Readonly<BlockRendererProps>) {
  const data = block.data as ParagraphData;
  if (!data.text) return null;
  const classes = ["elea-paragraph", meta?.isListIntroducer ? "elea-paragraph--introducer" : "", meta?.isSubItem ? "elea-paragraph--sub-item" : ""]
    .filter(Boolean)
    .join(" ");
  return <SanitizedHtml as="div" html={data.text} sanitizer={context.sanitizer} className={classes} />;
}

export function HeaderBlock({ block, context }: Readonly<BlockRendererProps>) {
  const data = block.data as HeaderData;
  const level = Math.min(6, Math.max(1, data.level ?? 2));
  if (!data.text) return null;
  return <SanitizedHtml as={`h${level}` as "h2"} html={data.text} sanitizer={context.sanitizer} className={`elea-heading elea-heading--${level}`} />;
}

interface ListProps {
  items: readonly ListItem[];
  style: ListData["style"];
  marker?: ListMarker | undefined;
  level: number;
  sanitizer: HtmlSanitizer;
  messages: EleaMessages;
}

function List({ items, style, marker, level, sanitizer, messages }: Readonly<ListProps>) {
  if (items.length === 0) return null;
  const tasks = style === "checklist";
  const shape = tasks ? style : listStyleForMarker(marker, style);
  const Tag = shape === "ordered" ? "ol" : "ul";
  const markerClass = marker && !tasks ? ` elea-list-marker-${marker}` : "";
  // A task shows its state in a checkbox nobody can change here, which its text names
  const content = (item: ListItem) => {
    const html = typeof item === "string" ? item : item.content;
    if (!tasks) return <SanitizedHtml as="span" html={html} sanitizer={sanitizer} />;
    return (
      <label className="elea-list__task">
        <input type="checkbox" className="elea-list__check" checked={isListItemChecked(item)} disabled />
        <SanitizedHtml as="span" html={html} sanitizer={sanitizer} />
      </label>
    );
  };
  return (
    <Tag className={`elea-list elea-list--${shape} elea-list--level-${Math.min(level, 3)}${markerClass}`} aria-label={level > 0 ? formatMessage(messages.viewer.listLevel, { level }) : undefined}>
      {items.map((item, index) =>
        typeof item === "string" && !tasks ? (
          <SanitizedHtml key={index} as="li" html={item} sanitizer={sanitizer} className="elea-list__item" />
        ) : (
          <li key={index} className="elea-list__item">
            {content(item)}
            {typeof item !== "string" && item.items && item.items.length > 0 && (
              <List items={item.items} style={nestedListStyle(style)} marker={asListMarker(item.childrenMarker)} level={level + 1} sanitizer={sanitizer} messages={messages} />
            )}
          </li>
        ),
      )}
    </Tag>
  );
}

export function ListBlock({ block, context }: Readonly<BlockRendererProps>) {
  const data = block.data as ListData;
  return <List items={data.items ?? []} style={asListStyle(data.style)} marker={asListMarker(data.marker)} level={0} sanitizer={context.sanitizer} messages={context.messages} />;
}

export function QuoteBlock({ block, context }: Readonly<BlockRendererProps>) {
  const data = block.data as QuoteData;
  if (!data.text && !data.caption) return null;
  return (
    <blockquote className="elea-quote">
      <SanitizedHtml as="div" html={data.text} sanitizer={context.sanitizer} className="elea-quote__text" />
      {data.caption && <cite className="elea-quote__caption">— {data.caption}</cite>}
    </blockquote>
  );
}
