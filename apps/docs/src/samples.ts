import type { EleaBlock } from "@alien6-studio/elea-content";

const image = `${import.meta.env.BASE_URL}images/sample.svg`;

/** The document on the home page: short, and showing the editor's habits. */
export const heroBlocks: EleaBlock[] = [
  { id: "p1", type: "paragraph", data: { text: "<p>Elea gives a product a <strong>content model</strong>, a viewer that renders it anywhere, and an editor people already know how to use. Select a word to format it, press Enter for a new paragraph, type <code>/</code> on an empty line for the block menu.</p>" } },
  { id: "h1", type: "header", data: { text: "Blocks, not markup", level: 2 } },
  { id: "l1", type: "list", data: { style: "unordered", items: ["Paragraphs, headings, lists and quotes", { content: "Images, videos and attachments", items: ["uploaded through the host", "resolved to URLs by the host"] }, "Markdown and HTML as interchange formats"] } },
  { id: "q1", type: "quote", data: { text: "The document stays the model. Everything else is a projection of it.", caption: "Elea design note" } },
];

/** Every block the viewer renders, with the legacy EditorJS shapes. */
export const allBlocks: EleaBlock[] = [
  { id: "paragraph", type: "paragraph", data: { text: "<p>A paragraph holds <strong>rich text</strong>: emphasis, <u>underline</u>, <a href=\"https://example.org\">links</a> and inline <code>code</code>. Stored as sanitized HTML.</p>" } },
  { id: "header", type: "header", data: { text: "A heading, level 2", level: 2 } },
  { id: "list", type: "list", data: { style: "ordered", items: ["First step", { content: "Second step, with details", items: ["one detail", "another"] }, "Third step"] } },
  { id: "quote", type: "quote", data: { text: "Quotes carry a caption for their source.", caption: "Someone quoted" } },
  { id: "image", type: "image", data: { file: { url: image, id: "" }, caption: "An image with its caption", alt: "Abstract composition of overlapping shapes" } },
  { id: "video", type: "video", data: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "A video embed, from YouTube, Vimeo, Dailymotion or a direct file" } },
  { id: "attachment", type: "attachment", data: { resourceId: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" } },
  { id: "table", type: "table", data: { content: [["Package", "Runs on"], ["elea-content", "any JavaScript runtime"], ["elea-content-viewer", "server and browser"], ["elea-content-editor", "browser"]] } },
  { id: "code", type: "code", data: { code: "import { ContentView } from \"@alien6-studio/elea-content-viewer\";\n\nexport const Article = ({ content }) => <ContentView data={content} />;" } },
  { id: "delimiter", type: "delimiter", data: {} },
  { id: "last", type: "paragraph", data: { text: "<p>Unknown block types render as a quiet notice rather than breaking the page.</p>" } },
];

export const writingBlocks: EleaBlock[] = [
  { id: "w1", type: "paragraph", data: { text: "<p>Start here. Select this sentence to see the formatting bar. Put the caret at the end and press Enter.</p>" } },
  { id: "w2", type: "paragraph", data: { text: "" } },
];

/** The playground document: every block the editor creates, plus the legacy EditorJS types the viewer reads. */
export const playgroundBlocks: EleaBlock[] = [
  { id: "intro", type: "paragraph", data: { text: "<p>Elea renders <strong>block documents</strong> with a <em>viewer</em> and lets people edit them with an <u>editor</u>. Links to <a href=\"https://example.org/docs\">another site</a> open in a new tab; links to <a href=\"/about\">this site</a> stay here.</p>" } },
  { id: "how", type: "paragraph", data: { text: "<p>Write here as you would anywhere: Enter starts a paragraph, a selection brings the formatting bar, a slash in an empty paragraph opens the block menu, and pasting from Word or a web page keeps the structure.</p>" } },
  { id: "heading", type: "header", data: { text: "Every block type", level: 2 } },
  { id: "list", type: "list", data: { style: "unordered", items: ["Paragraphs with rich text", { content: "Nested lists", items: ["Second level", "Still synthetic"] }, "Quotes, images, videos, attachments"] } },
  { id: "quote", type: "quote", data: { text: "A design system is a product serving products.", caption: "Someone, somewhere" } },
  { id: "image", type: "image", data: { file: { url: image, id: "" }, caption: "Shapes drawn for the sample", alt: "Abstract composition of overlapping shapes" } },
  { id: "video", type: "video", data: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "A video embed" } },
  { id: "attachment", type: "attachment", data: { resourceId: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" } },
  { id: "legacy-heading", type: "header", data: { text: "Legacy EditorJS blocks", level: 3 } },
  { id: "table", type: "table", data: { content: [["Package", "Role"], ["elea-content", "ContentView model"], ["elea-content-viewer", "Rendering"], ["elea-content-editor", "Editing"]] } },
  { id: "code", type: "code", data: { code: "import { ContentView } from \"@alien6-studio/elea-content-viewer\";" } },
  { id: "delimiter", type: "delimiter", data: {} },
  { id: "outro", type: "paragraph", data: { text: "<p>Everything on the right is computed from the blocks on the left.</p>" } },
];
