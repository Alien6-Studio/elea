# Getting started

The [editorial workspace](/elea/playground/#/playground) shows how Elea renders and edits the glacier notebook. To build a read-only view of your own document, start with the tokens and content viewer.

## Install the reader

Use a published release to install the reader.

```sh
npm install @alien6-studio/elea-tokens @alien6-studio/elea-content-viewer
```

## Render a document

```tsx
import { ContentView } from "@alien6-studio/elea-content-viewer";
import "@alien6-studio/elea-content-viewer/bundle.css";

<ContentView data={storedDocument} siteHostnames={["members.example.org"]} />;
```

## Fit the host page

By default the reader sets Elea's typography. Inside a page that already has its own, `typography="inherit"` takes that page's family, size, leading and colour, and sizes the headings in proportion to its text.

```tsx
<ContentView data={storedDocument} typography="inherit" />;
```

The heading scale is a set of custom properties, `--elea-content-heading-1` to `--elea-content-heading-6`, with `--elea-content-heading-family` for the family. Set them on a container to keep Elea's typography and change only the scale.

```css
.article {
  --elea-content-heading-1: 2.5rem;
  --elea-content-heading-2: 2rem;
}
```

## Render on a server without a DOM

The default entry sanitizes stored HTML with DOMPurify, which loads jsdom on a server. The `core` entry is the same reader without a sanitizer of its own: it loads neither, and `sanitizer` becomes required.

```tsx
import { createSanitizer } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer/core";

// `purifier` is a DOMPurify instance bound to the DOM your server already has
const sanitizer = createSanitizer(purifier, { links: { siteHostnames: ["members.example.org"] } });

<ContentView data={storedDocument} sanitizer={sanitizer} />;
```

What the sanitizer returns is written to the page as HTML: it is the only thing between stored content and your readers.

For an unpublished checkout, see the [repository instructions](https://github.com/Alien6-Studio/elea#develop) for building and qualifying the npm archives.
