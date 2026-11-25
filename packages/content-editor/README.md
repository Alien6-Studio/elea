# @alien6-studio/elea-content-editor

The React block editor of Elea: paragraphs with rich text, headings, lists, quotes, images,
videos and attachments, a preview through the viewer, and virtualization for long documents.
Every host-specific service is injected; the editor itself knows nothing about where images go
or where attachments come from.

## Use

```tsx
"use client";
import { ContentEditor, ContentProvider } from "@alien6-studio/elea-content-editor";
import { fr } from "@alien6-studio/elea-content";
import "@alien6-studio/elea-content-editor/bundle.css";

<ContentProvider
  messages={fr}
  siteHostnames={["members.example.org"]}
  resolveAssetUrl={(file) => `/assets/${file.id}`}
  uploadImage={async (file, context) => api.upload(file, context.kind)}
  renderAttachmentPicker={({ onSelect, context }) => <MyLibrary ownerId={context.ownerId} onPick={onSelect} />}
>
  <ContentEditor key={articleId} blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} context={{ kind: "article", ownerId }} />
</ContentProvider>;
```

Give the editor a `key` that names the document it edits. Its undo history belongs to one
document: without the key, an editor that stays mounted while the host moves to another article
would undo into what the previous one held.

`bundle.css` loads, in order, the tokens and the `styles.css` of the viewer, of the media
components, of the UI components and of the editor. To load them one by one, or the tokens from
elsewhere, import those five files instead. Every rule sits in a cascade layer: a rule of yours
outside any layer overrides it, and with Tailwind v4 the host declares
`@layer theme, base, elea, components, utilities;` before its imports.

The slash menu, the selection bubble and the link field are rendered at the end of the body. They
copy the `data-elea-theme` and the `data-elea-motion` of the container the editor is in, so a
theme set on that container reaches them.

`blocks` is the controlled block array. Use `createDocument(blocks)` to create a
document in Elea's schema, or use the host's save adapter for existing records.
`showPreview` renders the blocks with the viewer. Pass the same `siteHostnames`
to the provider and the viewer to keep the default link policy consistent, and the `renderers`
the published page gives to `ContentView`, so a block of your own previews as it will be read.

## Writing modes

Use `mode="default"` for writing with margin controls and a floating formatting bar,
`mode="toolbar"` to add a fixed toolbar, or `mode="classic"` for a continuous visual document
with its own scrollable canvas and a formatting toolbar across the top. `mode="markdown"` opens a source area with line numbers and updates the
same block document as you type. Pass `onModeChange` and the current `mode` to enable the pencil menu.
The pencil selects the writing mode. The adjacent buttons undo and redo edits. A host with its own
version history can place its actions here with `historyControls` and retain draft shortcuts with
`history="keyboard"`. In Toolbar mode, choose a block type directly from the **Insert** group.
It goes after the focused block, or at the end if no block has focus. Writing and Classic offer the + menu.
With mode switching enabled, adding a block from Markdown opens the visual editor for that block.

In paragraph text, Enter inserts a visible line break. A second Enter on the empty line
starts a new paragraph. In lists, Enter continues the list.

In the visual modes, Shift-click to select a range of blocks. Ctrl-click (Command-click on Mac)
adds or removes individual blocks. Copy and paste the selection in place to duplicate it, or
click a destination before pasting. Pasting on a picture inserts the copied blocks after it.

Markdown shows images with image syntax and uses ordinary links for videos and files with
URLs. The editor keeps the original block data alongside the source while editing. This
preserves media identifiers, list styles and extension data when you edit surrounding text.
Use a visual mode for settings that Markdown cannot express.

For images, insert an image block in a visual mode or open **Add an image** in Markdown.
Both paths accept a dropped file or a file from the picker and use the same cropper and host
upload service. Set `imageCrop` on the provider to customize the frame and export options.

An SVG file can carry scripts, which run when the file is opened as a page from the origin
that serves it. The editor therefore sends an SVG only as the raster picture the cropper
exports, and refuses one that would go up as picked. Set `allowSvgUpload` on the provider
when your upload service serves these files safely, from another origin or as downloads.

### Report what an upload is doing

`uploadImage` receives a third argument with `report` and `signal`. Each call to `report`
replaces the default "Uploading..." label, and a `progress` between 0 and 1 adds a bar. The
label is announced whenever it changes, so keep one label per phase and put the numbers in
`progress`. An `Error` you reject with shows its message beside the block; the generic
message stays the fallback for an empty one. `signal` aborts when the block is removed or its
picture changes before the upload settles.

```tsx
const uploadImage: ContentEditorServices["uploadImage"] = async (file, context, { report, signal }) => {
  report({ label: "Uploading", progress: 0 });
  const upload = await api.upload(file, { signal, onProgress: (done) => report({ label: "Uploading", progress: done }) });
  report({ label: "Scanning for viruses…" });
  const scan = await api.scan(upload.id, { signal });
  if (!scan.clean) throw new Error("This file did not pass the virus scan.");
  return { id: upload.id, url: "" };
};
```

Select text in a list to choose the marker for its list level and move the selected items
together with the indent and outdent buttons. Tab and Shift+Tab offer the same movement.
Outdenting first-level items turns them into paragraphs.

A checklist (`style: "checklist"`, as EditorJS writes it) opens with its boxes and keeps the
state of every task while its text is edited. Press a box, or Ctrl+Enter (Command+Enter on Mac)
in a task, to tick it; in Markdown a task is `- [x]` or `- [ ]`. Choosing a marker turns the
checklist into that list. The add menu does not offer a new checklist yet. Every task is saved
with its `items`, empty when it has no sub-task, as the EditorJS list tool reads them.

A heading is one line of rich text: its emphasis and links show as they read and are kept when
it is saved, and Enter starts a paragraph with what follows the caret. Its selector goes from H1
to H6 and shows the level the heading came with.

## What loads when

Three parts of the editor stay out of its first load and come the first time they are asked
for: the Markdown source area, the preview, and the cropper that frames a picked picture. A
bundler that splits on dynamic imports gives each one its own chunk; built with Vite, they weigh
about 2 KB gzip each, some 10% of the editor. Nothing changes in the host's code.

While a part is on its way the editor keeps what it shows and marks itself `aria-busy`: the
blocks stay until the source area or the preview is there, and the drop zone waits for the
cropper. A part that cannot load is reported through `reportError` and asked for again the next
time; a picture whose cropper cannot load goes up as picked.

A host that knows a part is about to be needed can ask for it ahead:

```tsx
import { loadEditorParts } from "@alien6-studio/elea-content-editor";

<button onPointerEnter={() => void loadEditorParts("preview")} onClick={() => setPreview(true)}>Preview</button>
```

`loadEditorParts()` without a name loads all three. A page rendered on the server with
`mode="markdown"` or `showPreview` must await it before rendering, on the server and again in the
browser before hydrating, so that both sides show the same view.

Sanitizing and pasting stay in the first load: every stored value is sanitized as it renders, and
a paste has to be answered within its own event. To keep the whole editor off a page until
someone writes, load it from the host:

```tsx
const ContentEditor = lazy(() => import("@alien6-studio/elea-content-editor").then((editor) => ({ default: editor.ContentEditor })));
```

## Pieces

- `ContentEditor`: title and summary fields, the block list, the add menu; `editors` and `blockTypes`
  extend it with custom blocks.
- `RichTextField`: the contentEditable engine with its imperative handle (inline, list and block
  formats, link prompt, clear), keyboard shortcuts, Enter and Backspace rules.
- `RichTextInput`: one field with bold, italic, underline and lists, with an optional length limit.
- `BlockEditor`, `Toolbar`, `AddBlockButton`, `QuickAddButtons`, `VirtualizedBlockList`, the
  media blocks and the hooks, for hosts that compose their own layout.

## DOM contract

Each block renders with `data-elea-block-id` and `data-elea-block-type`; rich text fields are
`[contenteditable="true"]` with `role="textbox"`. Extensions and end-to-end tests can rely on
these, not on class names.

## Security

Stored HTML and rich paste pass through the provider's sanitizer. The default
link policy validates URLs and adds opener protection to external links.
