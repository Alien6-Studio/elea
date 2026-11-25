# @alien6-studio/elea-content

Headless core of Elea: block document model compatible with EditorJS output, versioned schema, block registry, HTML sanitization, link policy and text extraction. No React, no DOM.

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
- `documentToText`, `documentExcerpt`, `htmlToText`, `annotateHierarchy`, `getVideoEmbedUrl`,
  `fileKind`, `resolveLinkUrl`.
- `en` and `fr` messages for the viewer and editor, `withDefaultMessages` to translate partially.
- `documentToMarkdown`, `markdownToBlocks`, `looksLikeMarkdown`: Markdown as an interchange format,
  for export and for pasted text; `documentToHtml`: static HTML with the viewer's classes, for
  e-mails, feeds and search indexes, every URL checked.

Normalization retains the first occurrence of each non-empty stored block id.
If an id is missing or repeated, a generated id is assigned without reusing
any stored id. Pass a registry to normalize data for rendering or editing.
When adopting Elea in a product with stored documents, compare the normalized
shape with the original before using it for writes. Registry normalization can
omit fields and `createDocument` assigns Elea's schema version.
