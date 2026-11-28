import type { EleaDocument, EleaMessages } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { Badge } from "@alien6-studio/elea-ui";
import { siteHostnames } from "../links.js";

import "@alien6-studio/elea-content-viewer/styles.css";
import "./reader-edition.css";

export function ReaderEdition({ document, title, summary, audience, messages }: Readonly<{
  document: EleaDocument;
  title: string;
  summary: string;
  audience?: string;
  messages: EleaMessages;
}>) {
  const cover = document.blocks[0]?.type === "image" ? document.blocks[0] : undefined;
  return (
    <article className="workspace-edition">
      {cover && <ContentView className="workspace-edition__cover" data={{ blocks: [cover] }} siteHostnames={siteHostnames} messages={messages} />}
      <header>
        <p className="workspace-edition__masthead">
          <span>Field notes</span>
          {audience && <Badge tone="primary">{audience}</Badge>}
        </p>
        <h3>{title || "Untitled article"}</h3>
        {summary && <div>{summary}</div>}
      </header>
      <ContentView data={cover ? { blocks: document.blocks.slice(1) } : document} siteHostnames={siteHostnames} messages={messages} />
    </article>
  );
}
