import type { EleaBlock } from "@alien6-studio/elea-content";

/** Synthetic content covering every block the editor creates, plus legacy EditorJS types the viewer reads. */
export const sampleBlocks: EleaBlock[] = [
  { id: "intro", type: "paragraph", data: { text: "<p>Elea renders <strong>block documents</strong> with a <em>viewer</em> and lets people edit them with an <u>editor</u>. Links to <a href=\"https://example.org/docs\">another site</a> open in a new tab; links to <a href=\"/about\">this site</a> stay here.</p>" } },
  { id: "heading", type: "header", data: { text: "Every block type", level: 2 } },
  { id: "list", type: "list", data: { style: "unordered", items: ["Paragraphs with rich text", { content: "Nested lists", items: ["Second level", "Still synthetic"] }, "Quotes, images, videos, attachments"] } },
  { id: "quote", type: "quote", data: { text: "A design system is a product serving products.", caption: "Someone, somewhere" } },
  { id: "image", type: "image", data: { file: { url: "https://example.org/images/sample.png", id: "" }, caption: "A sample image (the URL is synthetic)", alt: "Placeholder" } },
  { id: "video", type: "video", data: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "A video embed" } },
  { id: "attachment", type: "attachment", data: { resourceId: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" } },
  { id: "legacy-heading", type: "header", data: { text: "Legacy EditorJS blocks", level: 3 } },
  { id: "table", type: "table", data: { content: [["Package", "Role"], ["elea-content", "ContentView model"], ["elea-content-viewer", "Rendering"], ["elea-content-editor", "Editing"]] } },
  { id: "code", type: "code", data: { code: "import { ContentView } from \"@alien6-studio/elea-content-viewer\";" } },
  { id: "delimiter", type: "delimiter", data: {} },
  { id: "outro", type: "paragraph", data: { text: "<p>Edit on the left, read on the right.</p>" } },
];
