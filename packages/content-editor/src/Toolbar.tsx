"use client";

import { en } from "@alien6-studio/elea-content";
import { Select } from "@alien6-studio/elea-ui";
import { Fragment, type ReactElement, type ReactNode, type RefObject } from "react";
import { BoldIcon, EraserIcon, ItalicIcon, LinkIcon, ListIcon, OrderedListIcon, QuoteIcon, UnderlineIcon } from "./icons.js";
import type { ListCommand } from "./listCommands.js";
import { useContentServices } from "./provider.js";
import { useRestrictions, type EditorMark } from "./restrictions.js";
import type { ActiveFormats, RichTextFieldHandle } from "./RichTextField.js";

export interface ToolbarProps {
  editorRef: RefObject<RichTextFieldHandle | null>;
  activeFormats: ActiveFormats;
  /** Only the inline marks and the link: what a floating bar offers over a selection. */
  inline?: boolean | undefined;
  /** Groups the six heading levels into one control on a document toolbar. */
  compactHeadings?: boolean | undefined;
  onListCommand?: ((command: ListCommand) => void) | undefined;
}

const LIST_OPTIONS = [["disc", "●"], ["circle", "○"], ["square", "■"], ["decimal", "1."], ["lower-alpha", "a."], ["lower-roman", "i."]] as const;
const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/** The formatting bar of a paragraph block; mousedown is prevented so the editor keeps its selection. */
export function Toolbar({ editorRef, activeFormats, inline = false, compactHeadings = false, onListCommand }: Readonly<ToolbarProps>) {
  const { messages } = useContentServices();
  const list = messages.list ?? en.list;
  const restrictions = useRestrictions();
  const allowsBlock = (type: string) => restrictions?.allowsBlock(type) ?? true;
  const allowsMark = (mark: EditorMark) => restrictions?.allowsMark(mark) ?? true;
  const button = (label: string, onClick: () => void, children: ReactNode, active?: boolean) => (
    <button
      key={label}
      type="button"
      className={`elea-toolbar__button${active ? " elea-toolbar__button--active" : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => { event.preventDefault(); onClick(); }}
      onClick={(event) => { if (event.detail === 0) onClick(); }}
    >
      {children}
    </button>
  );
  const heading = HEADINGS.find(tag => activeFormats[tag]);
  const marks = [
    allowsMark("bold") && button(messages.toolbar.bold, () => editorRef.current?.applyInlineFormat("strong"), <BoldIcon />, activeFormats.bold),
    allowsMark("italic") && button(messages.toolbar.italic, () => editorRef.current?.applyInlineFormat("em"), <ItalicIcon />, activeFormats.italic),
    allowsMark("underline") && button(messages.toolbar.underline, () => editorRef.current?.applyInlineFormat("u"), <UnderlineIcon />, activeFormats.underline),
  ].filter(Boolean);
  const link = allowsMark("link") && button(messages.toolbar.link, () => editorRef.current?.openLinkInput(), <LinkIcon />, activeFormats.link);
  const clear = button(messages.toolbar.removeFormat, () => editorRef.current?.clearFormat(), <EraserIcon />);
  /** Groups the host allows, a separator between them and none dangling. */
  const groups = (...content: ReactNode[][]) => content.map(group => group.filter(Boolean)).filter(group => group.length)
    .map((group, index) => <Fragment key={(group[0] as ReactElement).key}>{index > 0 && <span className="elea-toolbar__separator" />}{group}</Fragment>);
  if (inline) {
    return (
      <div className="elea-toolbar elea-toolbar--inline" role="toolbar" aria-label={messages.toolbar.bold}>
        {groups(
          marks,
          [link, clear],
          onListCommand ? LIST_OPTIONS.map(([marker, glyph]) => button(list[marker], () => onListCommand(marker), <span className="elea-toolbar__text">{glyph}</span>)) : [],
          onListCommand ? [
            button(list.outdent, () => onListCommand("outdent"), <span className="elea-toolbar__text">⇤</span>),
            button(list.indent, () => onListCommand("indent"), <span className="elea-toolbar__text">⇥</span>),
          ] : [],
        )}
      </div>
    );
  }
  const headings = allowsBlock("header");
  return (
    <div className="elea-toolbar" role="toolbar" aria-label={messages.toolbar.removeFormat}>
      {headings && compactHeadings && (
        <Select size="sm" className="elea-toolbar__headings" label={messages.blockTypes.header}
          value={heading ?? "paragraph"}
          options={[{ value: "paragraph", label: messages.blockTypes.paragraph }, ...HEADINGS.map(tag => ({ value: tag, label: messages.toolbar[tag] }))]}
          onChange={value => {
            const selected = HEADINGS.find(tag => tag === value);
            const command = selected ?? heading;
            // Select returns focus to its trigger after picking. Apply to the saved text selection afterwards.
            if (command && selected !== heading) queueMicrotask(() => editorRef.current?.applyBlockFormat(command, true));
          }}
        />
      )}
      {groups(
        [clear],
        marks,
        allowsBlock("list") ? [
          button(messages.toolbar.bulletList, () => editorRef.current?.applyListFormat("ul"), <ListIcon />, activeFormats.ul),
          button(messages.toolbar.orderedList, () => editorRef.current?.applyListFormat("ol"), <OrderedListIcon />, activeFormats.ol),
        ] : [],
        headings && !compactHeadings ? HEADINGS.map(tag =>
          button(messages.toolbar[tag], () => editorRef.current?.applyBlockFormat(tag), <span className="elea-toolbar__text">{tag.toUpperCase()}</span>, activeFormats[tag])) : [],
        [
          allowsBlock("quote") && button(messages.toolbar.blockquote, () => editorRef.current?.applyBlockFormat("blockquote"), <QuoteIcon />, activeFormats.blockquote),
          link,
        ],
      )}
    </div>
  );
}
