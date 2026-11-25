"use client";

import { createDocument, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { useContentServices } from "./provider.js";

interface EditorPreviewProps {
  className: string;
  blocks: EleaBlock[];
  title: string;
  summary: string;
  titled: boolean;
  summaryDisabled: boolean;
}

export function EditorPreview({ className, blocks, title, summary, titled, summaryDisabled }: Readonly<EditorPreviewProps>) {
  const { registry, messages, sanitizer, resolveAssetUrl, renderAttachmentIcon, onAttachmentClick, renderers } = useContentServices();
  return (
    <div className={`${className} elea-content-editor--preview`}>
      <article className="elea-content-editor__preview">
        {(titled || title) && (
          <header className="elea-content-editor__preview-header">
            <h1 className="elea-content-editor__preview-title">{title}</h1>
            {!summaryDisabled && summary && <p className="elea-content-editor__preview-summary">{summary}</p>}
          </header>
        )}
        <ContentView data={createDocument(blocks)} {...(renderers && { renderers })} registry={registry} sanitizer={sanitizer} resolveAssetUrl={resolveAssetUrl} renderAttachmentIcon={renderAttachmentIcon} onAttachmentClick={onAttachmentClick} messages={messages} />
      </article>
    </div>
  );
}
