import type { EleaBlock } from "@alien6-studio/elea-content";
import { repositoryUrl, sitePath } from "./links.js";

import { glacierImage, notebookOpening } from "./notebook.js";
export { glacierImage, notebookSummary, notebookTitle } from "./notebook.js";

export const notebookBlocks: EleaBlock[] = [
  glacierImage,
  { id: "observation", type: "paragraph", data: { text: notebookOpening } },
  { id: "patterns", type: "header", data: { text: "Reading the surface", level: 2 } },
  { id: "light", type: "paragraph", data: { text: "Follow a single ridge across the frame. Its bright edge fades into shadow, then reappears a little farther down the valley." } },
  { id: "caption-notes", type: "quote", data: { text: "Look for the bend in the line. That is where the landscape changes.", caption: "From the field notebook" } },
];

/** The playground document: every block the editor creates, plus the legacy EditorJS types the viewer reads. */
export const playgroundBlocks: EleaBlock[] = [
  { id: "intro", type: "paragraph", data: { text: `<p>Elea renders <strong>block documents</strong> with a <em>viewer</em> and lets people edit them with an <u>editor</u>. Links to <a href="${repositoryUrl}">another site</a> open in a new tab; links to <a href="${sitePath}content/">this site</a> stay here.</p>` } },
  { id: "how", type: "paragraph", data: { text: "<p>Press Enter for a line break and twice for a new paragraph. Select text to format it. Use the + to add a block and the pencil to switch writing modes.</p>" } },
  { id: "heading", type: "header", data: { text: "Every block type", level: 2 } },
  { id: "list", type: "list", data: { style: "unordered", items: ["Paragraphs with rich text", { content: "Nested lists", items: ["Second level", "Still synthetic"] }, "Quotes, images, videos, attachments"] } },
  { id: "quote", type: "quote", data: { text: "A design system is a product serving products.", caption: "Elea field notes" } },
  glacierImage,
  { id: "video", type: "video", data: { url: "https://www.youtube.com/watch?v=0ckOUBiuxVY", caption: "React Conf 2024, day one" } },
  { id: "attachment", type: "attachment", data: { resourceId: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" } },
  { id: "legacy-heading", type: "header", data: { text: "Legacy EditorJS blocks", level: 3 } },
  { id: "table", type: "table", data: { content: [["Package", "Role"], ["elea-content", "ContentView model"], ["elea-content-viewer", "Rendering"], ["elea-content-editor", "Editing"]] } },
  { id: "code", type: "code", data: { code: "import { ContentView } from \"@alien6-studio/elea-content-viewer\";" } },
  { id: "checklist", type: "list", data: { style: "checklist", items: [{ content: "Read the state of each task", meta: { checked: true }, items: [] }, { content: "Keep it while the labels are edited", meta: { checked: true }, items: [] }, { content: "Tick a box in the editor", meta: { checked: false }, items: [] }] } },
  { id: "delimiter", type: "delimiter", data: {} },
  { id: "outro", type: "paragraph", data: { text: "<p>Everything on the right is computed from the blocks on the left.</p>" } },
];
