# @alien6-studio/elea-content

Headless core of Elea: block document model compatible with EditorJS output, versioned schema, block registry, HTML sanitization, link policy and text extraction. The model has no React or DOM dependency. HTML form conversion uses a browser or host-supplied document.

This package ships ES modules only. For Jest with `next/jest`, add `@alien6-studio/elea-content` to `transpilePackages`.

## What it gives you

- `parseDocument(value)`: reads a document object, its JSON string, plain text or HTML and
  returns a normalized `EleaDocument`; never throws.
- Open existing EditorJS content with `prepareEditorBlocks(value)`. This preserves plugin
  fields and gives each block a stable editing ID. Save with `createDocument(blocks, { version })`
  when the destination expects a specific schema version.
- `defaultRegistry`: the seven Elea blocks (paragraph, header, list, quote, image, video,
  attachment) and the legacy EditorJS types (embed, code, table, raw, attaches, delimiter),
  each with defaults, normalization and plain-text extraction. Extend it with `defineBlock`
  and `registry.with(...)`.
- `createSanitizer(purify)`: binds the rich HTML policy (allowed tags and attributes, http(s)
  and site-relative URIs only, external links in a new tab with opener protection) to a
  DOMPurify instance, browser or jsdom.
- `documentToText(doc, defaultRegistry)`, `documentExcerpt`, `htmlToText`, `annotateHierarchy`, `getVideoEmbedUrl`,
  `fileKind`, `resolveLinkUrl`.
- `en` and `fr` messages for the viewer and editor, `withDefaultMessages` to translate partially.
- `documentToMarkdown`, `markdownToBlocks`, `looksLikeMarkdown`: Markdown as an interchange format,
  for export and for pasted text; `documentToHtml`: static HTML with the viewer's classes, for
  e-mails, feeds and search indexes, every URL checked. To preserve inline formatting, pass
  `{ sanitize: html => sanitizer.sanitize(html) }` to `documentToHtml`. The default serializes rich text as plain text.

Normalization retains the first occurrence of each non-empty stored block id.
If an id is missing or repeated, a generated id is assigned without reusing
any stored id. Pass a registry to normalize data for rendering or editing.
When adopting Elea in a product with stored documents, compare the normalized
shape with the original before using it for writes. Registry normalization can
omit fields and `createDocument` assigns Elea's schema version.

## HTML form values

Use `htmlToBlocks` to load an HTML string into the editor. It creates fresh editing IDs. Initialize once for each stored value and pass the edited blocks to `blocksToHtml` when saving.

```js
import { blocksToHtml, htmlToBlocks, prepareEditorBlocks } from "@alien6-studio/elea-content";

const initialHtml = "<h2>Programme</h2><p>Opening <strong>night</strong>.</p>";
const initialBlocks = prepareEditorBlocks(htmlToBlocks(initialHtml));

function save(editedBlocks) {
  return { description: blocksToHtml(editedBlocks) };
}
```

Empty HTML yields an empty array. `prepareEditorBlocks` supplies the first editable paragraph for an empty draft. On a server, pass `{ document: window.document }` from your DOM implementation to either converter. Browser calls use the current document. The converters preserve supported inline formatting, safe links, headings, lists, quotes, figures, code, tables and dividers. HTML parsing uses an inert template. The default export escapes text and emits only supported formatting and URL attributes.

Keep the block document when you also need stable IDs, attachment identifiers, plugin data or exact source markup. A form HTML value carries the rendered content of those blocks. For custom blocks with a plain-text representation, pass `{ registry }` to `blocksToHtml`.
