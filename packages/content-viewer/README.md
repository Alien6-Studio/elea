# @alien6-studio/elea-content-viewer

React rendering of Elea block documents. No hook and no state, so `<ContentView>` renders in
React server components, during static generation and in the browser alike. Styles come from
`styles.css`, built on the tokens of `@alien6-studio/elea-tokens`.

## Use

```tsx
import { ContentView } from "@alien6-studio/elea-content-viewer";
import "@alien6-studio/elea-content-viewer/bundle.css";

<ContentView data={article.content} />;
```

`bundle.css` loads the tokens, then the viewer's own `styles.css`; import those two yourself when
the tokens already come from elsewhere. Every rule sits in a cascade layer, so a rule of yours
outside any layer overrides it without raising its specificity.

`data` is whatever the store returns: a document object, its JSON string, plain text or HTML.

## Options

- `resolveAssetUrl={(file) => string}`: turns a stored file reference (`{ url, id }`) into a URL,
  for example an asset API keyed by id.
- `renderAttachmentIcon={({ type, kind, blockType }) => …}` supplies a decorative icon for
  attachment cards. `type` is the stored resource type or the legacy file extension,
  `kind` is the resolved file category, and `blockType` is `attachment` or `attaches`.
  Return `null` to use Elea’s icon for a particular file. The editor preview accepts the
  same option through `ContentProvider`.
- In a client component, `onAttachmentClick(info)` receives the link’s `href` and either the resource’s `resourceId` (`attachment`) or the optional `fileName` (`attaches`) when the reader follows it.
- `siteHostnames`: hostnames treated as internal by the default sanitizer. Links
  to these hosts open in the same tab.
- `sanitizer`: an explicit sanitizer that supplies its own link and HTML policy.
- `messages`: `fr` or `en` from `@alien6-studio/elea-content`, or your own translation.
- `renderers={{ widget: WidgetBlock }}`: components by block type, merged over the built-in ones;
  with a matching `registry` for defaults, normalization and text extraction.
- `legacyHierarchy`: indents flat paragraphs that follow an introducer, for content written
  without lists.
- `loading` with `loadingFallback={<ContentSkeleton messages={en} />}`, and `emptyFallback`.
- `typography="inherit"`: the content takes the font family, size, line height and colour of
  the page around it, and headings are sized in proportion to that text.

## Server rendering without a DOM

The default entry sanitizes with DOMPurify, which on a server needs jsdom: a heavy module to
load at start-up. The `core` entry is the same viewer without any sanitizer of its own, so it
loads neither; `sanitizer` becomes required and carries the link policy, and `siteHostnames`
is gone.

```tsx
import { createSanitizer } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer/core";

// `purifier` is a DOMPurify instance bound to the DOM your server already has
const sanitizer = createSanitizer(purifier, { links: { siteHostnames: ["members.example.org"] } });

<ContentView data={article.content} sanitizer={sanitizer} />;
```

Any object with a `policy` and a `sanitize(html)` method is a sanitizer. What it returns is
written to the page as HTML: it is the only thing between stored content and your readers.

## Heading scale

Heading sizes and their font family are custom properties, read with Elea's tokens as
fallback. Set them on any ancestor of the content to fit a host scale:

```css
.article {
  --elea-content-heading-family: Georgia, serif;
  --elea-content-heading-1: 2.5rem; /* down to --elea-content-heading-6 */
}
```

A heading inside rich text uses the size one step below the heading block of its level.
With `typography="inherit"` the scale is set on the content element itself: override it
there, through `className`.

## Blocks

Paragraph, header, list (nested, or an EditorJS checklist with the state of each task), quote, image, video (YouTube, Vimeo, Dailymotion, direct
files), attachment; and the legacy EditorJS types delimiter, code, raw, embed, attaches, table.
Each block is wrapped in `<div class="elea-block elea-block--{type}" data-elea-block-id data-elea-block-type>`,
a stable contract for styling, tests and extensions.

Also exported: `ContentExcerpt` for one line of plain text, `SanitizedHtml`, `VideoEmbed`,
`ContentSkeleton`, and every built-in block renderer.

## Security

Stored HTML goes through DOMPurify. The default policy allows formatting tags,
HTTP(S) and site-relative URLs, and applies `rel="noopener noreferrer"` to external
links. Image blocks also support inline Base64 image data through the image
source policy. Video blocks embed supported providers and play supported direct
files.
