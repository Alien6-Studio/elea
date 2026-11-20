# @alien6-studio/elea-content-editor

The React block editor of Elea: paragraphs with rich text, headings, lists, quotes, images,
videos and attachments, a preview through the viewer, and virtualization for long documents.
Every host-specific service is injected; the editor itself knows nothing about where images go
or where attachments come from.

## Use

```tsx
"use client";
import { ContentEditor, ContentProvider } from "@alien6-studio/elea-content-editor";
import { createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { fr } from "@alien6-studio/elea-content";
import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-content-viewer/styles.css";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-content-editor/styles.css";

<ContentProvider
  messages={fr}
  sanitizer={createDefaultSanitizer({ links: { siteHostnames: ["members.example.org"] } })}
  siteHostnames={["members.example.org"]}
  resolveAssetUrl={(file) => `/assets/${file.id}`}
  uploadImage={async (file, context) => api.upload(file, context.kind)}
  renderAttachmentPicker={({ onSelect, context }) => <MyLibrary ownerId={context.ownerId} onPick={onSelect} />}
>
  <ContentEditor blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} context={{ kind: "article", ownerId }} />
</ContentProvider>;
```

`blocks` is the `blocks` array of a document; `createDocument(blocks)` from `elea-content` turns it
back into a stored document. `showPreview` renders the current content read-only.

## Writing modes

Use `mode="default"` for writing with margin controls and a floating formatting bar,
`mode="toolbar"` to add a fixed toolbar, or `mode="classic"` for a continuous visual document
with the fixed toolbar. `mode="markdown"` opens a source area with line numbers and updates the
same block document as you type. Pass `onModeChange` and the current `mode` for a built-in picker.

Markdown keeps unchanged blocks as they are. Blocks without a Markdown equivalent appear as
comments that reference their stored data. Keep these comments in the source and use a visual mode
to edit their blocks. Text edited in Markdown uses the formatting expressed by its source.

For images, insert an image block in a visual mode or open **Add an image** in Markdown.
Both paths accept a dropped file or a file from the picker and use the same cropper and host
upload service. Set `imageCrop` on the provider to customize the frame and export options.

Select text in a list to choose the marker for its list level and move the selected items
together with the indent and outdent buttons. Tab and Shift+Tab offer the same movement.
Outdenting first-level items turns them into paragraphs.
Lists with custom markers retain their formatting through a block reference in the Markdown editor.

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

Stored HTML enters the fields through the sanitizer of the provider; pasted content is inserted
as plain text; link URLs are validated (`http(s)` or site-relative only) and external links get
`rel="noopener noreferrer"`.
