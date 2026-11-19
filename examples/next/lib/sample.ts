import type { EleaBlock } from "@alien6-studio/elea-content";

/** Synthetic article, as a content API would return it. */
export const sampleBlocks: EleaBlock[] = [
  { id: "intro", type: "paragraph", data: { text: "<p>This page is a <strong>React server component</strong>: the viewer renders the document on the server, no hook involved, and the HTML reaches the browser complete.</p>" } },
  { id: "h", type: "header", data: { text: "Why it matters", level: 2 } },
  { id: "l", type: "list", data: { style: "unordered", items: ["Public pages stay fast and indexable", "Sanitization happens before the first byte", "The editor lives behind the client boundary, on its own route"] } },
  { id: "q", type: "quote", data: { text: "Render on the server, edit on the client.", caption: "The split Elea is built for" } },
];
