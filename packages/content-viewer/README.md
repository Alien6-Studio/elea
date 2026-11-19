# @alien6-studio/elea-content-viewer

React rendering of Elea block documents. No hook and no state, so `<ContentView>` renders in
React server components, during static generation and in the browser alike. Styles come from
`styles.css`, built on the tokens of `@alien6-studio/elea-tokens`.

## Use

```tsx
import { ContentView } from "@alien6-studio/elea-content-viewer";
import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-content-viewer/styles.css";

<ContentView data={article.content} />;
```

`data` is whatever the store returns: a document object, its JSON string, plain text or HTML.

## Options

- `resolveAssetUrl={(file) => string}`: turns a stored file reference (`{ url, id }`) into a URL,
  for example an asset API keyed by id.
- `sanitizer`: a sanitizer from `createDefaultSanitizer({ links: { siteHostnames: [...] } })`, so
  links to your own site open in the same tab while external links open in a new one.
- `messages`: `fr` or `en` from `@alien6-studio/elea-content`, or your own translation.
- `renderers={{ widget: WidgetBlock }}`: components by block type, merged over the built-in ones;
  with a matching `registry` for defaults, normalization and text extraction.
- `legacyHierarchy`: indents flat paragraphs that follow an introducer, for content written
  without lists.
- `loading` with `loadingFallback={<ContentSkeleton messages={en} />}`, and `emptyFallback`.

## Blocks

Paragraph, header, list (nested), quote, image, video (YouTube, Vimeo, Dailymotion, direct
files), attachment; and the legacy EditorJS types delimiter, code, raw, embed, attaches, table.
Each block is wrapped in `<div class="elea-block elea-block--{type}" data-elea-block-id data-elea-block-type>`,
a stable contract for styling, tests and extensions.

Also exported: `ContentExcerpt` for one line of plain text, `SanitizedHtml`, `VideoEmbed`,
`ContentSkeleton`, and every built-in block renderer.

## Security

Stored HTML goes through DOMPurify with the Elea policy: allowed formatting tags only, `http(s)`
and site-relative URIs only (no `javascript:`, `data:` or protocol-relative URLs, images
included), external links with `rel="noopener noreferrer"`. Only the supported video providers
are embedded; a raw iframe is never emitted.
