# Elea architecture

Elea serves content-rich applications. The document model loads supported
EditorJS blocks. The viewer and editor share that model, and media handling
uses services supplied by the application. Shared tokens and primitives let
the application theme both the editorial surface and the rest of its interface.

## Layers

| Package | Responsibility |
| --- | --- |
| `elea-tokens` | Token data, CSS custom properties, Tailwind v4 theme and typed generators |
| `elea-content` | Framework-free documents, block definitions, HTML policy, links, Markdown, text extraction and messages |
| `elea-ui` | React primitives styled with the tokens |
| `elea-media` | React file drop zone and cropper, with reusable crop geometry |
| `elea-content-viewer` | Server and browser rendering, block renderers, asset URL resolution and DOMPurify integration |
| `elea-content-editor` | Controlled React editor, preview, writing modes, selection, history and host media services |

The editor composes the viewer, media and UI packages. The viewer and editor
share the content package. Parsing, text extraction and crop geometry can run
independently of the components. Client boundaries live in interactive React
modules. The viewer works in React Server Components through the exported
`ContentView` entry point.

## Consumer contracts

- **Theme.** Import the token stylesheet and the CSS for the packages you use.
  Set `data-theme` on the document root for an explicit light or dark theme.
  Override `--elea-*` variables in an application container to brand a region.
  Tailwind utilities from `theme.css` resolve those variables on the element.
- **Content.** Render stored data with `ContentView`. Use a block registry and
  custom renderers to extend a supported format. Use `ContentProvider` to
  connect the editor to uploads, asset URLs, messages and the attachment picker.
- **Distribution.** The packages ship ESM, TypeScript declarations, CSS where
  applicable and their license. The release checks install the archives in
  React 18 and 19 consumers. The playground also builds a Next.js App Router
  fixture against those archives.
- **Compatibility.** Prefer documented props, token names and block data
  attributes for integration. The product owns what it persists, the asset
  authorization policy and its application-specific styling.

## Roadmap

1. Qualify the first installable release and compare the viewer with the current
   rendering on a read-only route in an existing application.
2. Exercise the same packages in a second application with a different theme.
   Use both integrations to identify the styling and extension points that
   should become stable APIs.
3. Develop theme collections, headless hooks or per-component stylesheets where
   an integration shows a concrete need. Add new component families through
   working consumer examples and contract tests.
