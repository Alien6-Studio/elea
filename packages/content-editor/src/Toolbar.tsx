"use client";

import { en } from "@alien6-studio/elea-content";
import type { ReactNode, RefObject } from "react";
import { BoldIcon, EraserIcon, ItalicIcon, LinkIcon, QuoteIcon, UnderlineIcon } from "./icons.js";
import type { ListCommand } from "./listCommands.js";
import { useContentServices } from "./provider.js";
import type { ActiveFormats, RichTextFieldHandle } from "./RichTextField.js";

export interface ToolbarProps {
  editorRef: RefObject<RichTextFieldHandle | null>;
  activeFormats: ActiveFormats;
  /** Only the inline marks and the link: what a floating bar offers over a selection. */
  inline?: boolean | undefined;
  onListCommand?: ((command: ListCommand) => void) | undefined;
}

const LIST_OPTIONS = [["disc", "●"], ["circle", "○"], ["square", "■"], ["decimal", "1."], ["lower-alpha", "a."], ["lower-roman", "i."]] as const;

/** The formatting bar of a paragraph block; mousedown is prevented so the editor keeps its selection. */
export function Toolbar({ editorRef, activeFormats, inline = false, onListCommand }: ToolbarProps) {
  const { messages } = useContentServices();
  const list = messages.list ?? en.list;
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
  const headings = (["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((tag) =>
    button(messages.toolbar[tag], () => editorRef.current?.applyBlockFormat(tag), <span className="elea-toolbar__text">{tag.toUpperCase()}</span>, activeFormats[tag]),
  );
  if (inline) {
    return (
      <div className="elea-toolbar elea-toolbar--inline" role="toolbar" aria-label={messages.toolbar.bold}>
        {button(messages.toolbar.bold, () => editorRef.current?.applyInlineFormat("strong"), <BoldIcon />, activeFormats.bold)}
        {button(messages.toolbar.italic, () => editorRef.current?.applyInlineFormat("em"), <ItalicIcon />, activeFormats.italic)}
        {button(messages.toolbar.underline, () => editorRef.current?.applyInlineFormat("u"), <UnderlineIcon />, activeFormats.underline)}
        <span className="elea-toolbar__separator" />
        {button(messages.toolbar.link, () => editorRef.current?.openLinkInput(), <LinkIcon />)}
        {button(messages.toolbar.removeFormat, () => editorRef.current?.clearFormat(), <EraserIcon />)}
        {onListCommand && (
          <>
            <span className="elea-toolbar__separator" />
            {LIST_OPTIONS.map(([marker, glyph]) => button(list[marker], () => onListCommand(marker), <span className="elea-toolbar__text">{glyph}</span>))}
            <span className="elea-toolbar__separator" />
            {button(list.outdent, () => onListCommand("outdent"), <span className="elea-toolbar__text">⇤</span>)}
            {button(list.indent, () => onListCommand("indent"), <span className="elea-toolbar__text">⇥</span>)}
          </>
        )}
      </div>
    );
  }
  return (
    <div className="elea-toolbar" role="toolbar" aria-label={messages.toolbar.removeFormat}>
      {button(messages.toolbar.removeFormat, () => editorRef.current?.clearFormat(), <EraserIcon />)}
      <span className="elea-toolbar__separator" />
      {button(messages.toolbar.bold, () => editorRef.current?.applyInlineFormat("strong"), <BoldIcon />, activeFormats.bold)}
      {button(messages.toolbar.italic, () => editorRef.current?.applyInlineFormat("em"), <ItalicIcon />, activeFormats.italic)}
      {button(messages.toolbar.underline, () => editorRef.current?.applyInlineFormat("u"), <UnderlineIcon />, activeFormats.underline)}
      <span className="elea-toolbar__separator" />
      {button(messages.toolbar.bulletList, () => editorRef.current?.applyListFormat("ul"), <span className="elea-toolbar__text">●</span>, activeFormats.ul)}
      {button(messages.toolbar.orderedList, () => editorRef.current?.applyListFormat("ol"), <span className="elea-toolbar__text">1.</span>, activeFormats.ol)}
      <span className="elea-toolbar__separator" />
      {headings}
      <span className="elea-toolbar__separator" />
      {button(messages.toolbar.blockquote, () => editorRef.current?.applyBlockFormat("blockquote"), <QuoteIcon />, activeFormats.blockquote)}
      {button(messages.toolbar.link, () => editorRef.current?.openLinkInput(), <LinkIcon />)}
    </div>
  );
}
