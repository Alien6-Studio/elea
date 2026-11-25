# Content

The viewer accepts EditorJS documents, JSON strings, HTML and plain text. Pass
`siteHostnames` to keep links to your own site in the same tab. Provide
`resolveAssetUrl` if your application uses a media library or protected assets.

## Edit a document

The React editor is controlled by its host. Load the block array, pass it to the
editor and save the updated blocks through your application.

```tsx
"use client";

import { ContentEditor, ContentProvider } from "@alien6-studio/elea-content-editor";
import "@alien6-studio/elea-content-editor/bundle.css";

<ContentProvider
  messages={messages}
  uploadImage={uploadImage}
  resolveAssetUrl={resolveAssetUrl}
>
  <ContentEditor blocks={blocks} onBlocksChange={setBlocks} />
</ContentProvider>;
```

### Report what an upload is doing

`uploadImage` receives the file, the editor context and a third argument with `report`
and `signal`. Each `report` replaces the default uploading label; a `progress` between 0
and 1 adds a bar. The label is announced to assistive technology whenever it changes, so
keep one label per phase and put the numbers in `progress`.

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

When the promise rejects with an `Error`, its message shows beside the block; the generic
message stays the fallback for an empty one. `signal` aborts when the block is removed or
its picture changes before the upload settles, so the request can be cancelled.

## Choose a mode

`mode` sets how the editor presents its controls, and every mode edits the same block array.

| Mode | What the writer gets |
| --- | --- |
| `default` (Writing) | Controls in the margin, a floating bar on the selection and a **+** menu on an empty paragraph and at the end. |
| `toolbar` | A fixed bar with an **Insert** group: one press adds the block after the focused one, or at the end when none has the focus. |
| `classic` | A continuous document under a formatting bar that carries the **+** menu. |
| `markdown` | A source area with line numbers. |

Pass `mode` with `onModeChange` to let the writer switch from the pencil menu.

### What loads when

The Markdown source area, the preview and the picture cropper stay out of the editor's first
load and come the first time they are asked for, each in its own chunk with a bundler that splits
on dynamic imports. Until one is there the editor keeps what it shows and is `aria-busy`. Nothing
changes in your code; to have a part ready before it is needed, ask for it:

```tsx
import { loadEditorParts } from "@alien6-studio/elea-content-editor";

<button onPointerEnter={() => void loadEditorParts("preview")} onClick={() => setPreview(true)}>Preview</button>
```

A page rendered on the server with `mode="markdown"` or `showPreview` awaits `loadEditorParts()`
before rendering, and again in the browser before hydrating.

For a migration, compare the stored document before and after an edit. Keep
application metadata and custom fields in your save adapter.

Open the [editorial workspace](/elea/playground/#/playground) to edit the notebook, inspect its blocks and export the result.
