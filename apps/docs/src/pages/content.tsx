import { createDocument, documentToHtml, documentToMarkdown, markdownToBlocks, parseDocument } from "@alien6-studio/elea-content";
import { ContentView, createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { LiveEditor } from "../components/LiveEditor.js";
import { allBlocks, writingBlocks } from "../samples.js";

const sanitizer = createDefaultSanitizer();

export function WritingPage() {
  return (
    <>
      <h1>Writing</h1>
      <p className="lead">The editor asks nothing of people that a modern writing tool does not. Paragraphs are the unit, formatting follows the selection, blocks come from a slash or a shortcut, and the host only provides what the editor cannot know: where images go, where attachments come from.</p>
      <LiveEditor initial={writingBlocks} withOutput={false} caption="A blank page: try the keys below." modeSwitch />
      <h2>Three modes</h2>
      <p><strong>Default</strong> is the Medium-like one: a bare writing surface, controls in the margin on hover, and one floating bar over the selection that carries every format, headings and lists included. <strong>Toolbar</strong> keeps that surface and fixes a bar above the document with formatting, insertion and history, for people who format with the caret rather than a selection. <strong>Classic</strong> is for teams used to conventional editors: a fixed bar above the document with formatting, insertion and history, and every block framed with its type, its move and delete controls always visible. Same document, same keys; switch with the <code>mode</code> prop.</p>
      <pre><code>{`<ContentEditor mode="classic" blocks={blocks} onBlocksChange={setBlocks} />`}</code></pre>
      <h2>Selection</h2>
      <p>Text and blocks never select together. Inside a block, the browser's text selection applies: drag, double and triple click, Shift+arrows, Ctrl+A for the block's text. Blocks take over when the gesture leaves the block: a drag across a boundary, Shift+arrow on the first or last line, Ctrl+A when the text is already selected, Shift+click on another block. With blocks selected, typing replaces them, a plain arrow releases them at the matching edge, Escape releases them in place.</p>
      <h2>Keys</h2>
      <table className="keys">
        <tbody>
          <tr><td><kbd>Enter</kbd></td><td>Starts a new paragraph; the text after the caret moves with it. In a list, a new item; on an empty last item, leaves the list.</td></tr>
          <tr><td><kbd>Shift</kbd> + <kbd>Enter</kbd></td><td>A line break inside the paragraph.</td></tr>
          <tr><td><kbd>Backspace</kbd> at the start</td><td>Joins the paragraph to the previous block; an empty block disappears.</td></tr>
          <tr><td><kbd>↑</kbd> <kbd>↓</kbd> on the first or last line</td><td>Move the caret to the neighbouring block.</td></tr>
          <tr><td><kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> in a list</td><td>Nest the item under the previous one, or bring it back up with the items that followed.</td></tr>
          <tr><td><kbd>/</kbd> on an empty paragraph</td><td>Opens the block menu; type to filter, Enter to pick. The plus in the margin opens the same menu.</td></tr>
          <tr><td>Block options, in the margin</td><td>Turns the block into a paragraph, a heading of any level, a bullet or numbered list or a quote, keeping its text; deletes it.</td></tr>
          <tr><td>The floating bar</td><td>Over a selection: marks, link, and in the default mode the headings, lists and quote as well. Toolbar and classic modes fix a bar above the document instead.</td></tr>
          <tr><td><kbd>#</kbd>, <kbd>##</kbd>, <kbd>-</kbd>, <kbd>1.</kbd>, <kbd>&gt;</kbd> then space</td><td>Turn the paragraph into a heading, a list or a quote.</td></tr>
          <tr><td><kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd> / <kbd>K</kbd></td><td>Bold, italic, underline, link on the selection; the floating bar offers the same.</td></tr>
          <tr><td><kbd>Ctrl</kbd> + <kbd>Z</kbd>, <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></td><td>Undo and redo over the whole document, bursts of typing grouped together.</td></tr>
          <tr><td><kbd>Shift</kbd> + <kbd>↑</kbd> <kbd>↓</kbd>, <kbd>Ctrl</kbd> + <kbd>A</kbd></td><td>Select whole blocks; drag with the mouse across blocks does the same.</td></tr>
          <tr><td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>↑</kbd> <kbd>↓</kbd></td><td>Move the selected blocks; the grip in the margin drags them.</td></tr>
          <tr><td><kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>X</kbd> / <kbd>V</kbd></td><td>Copy, cut and paste blocks between documents, or as HTML and text into other applications.</td></tr>
        </tbody>
      </table>
      <h2>Paste</h2>
      <p>Pasted HTML from Word, Google Docs or a web page is cleaned to the sanitization policy and split into blocks: headings, lists and quotes keep their shape. Text that looks like Markdown is parsed as Markdown. Blocks copied from another Elea editor arrive as blocks.</p>
      <h2>Host services</h2>
      <p>Everything the editor cannot know comes through the provider, once per page.</p>
      <pre><code>{`<ContentProvider
  messages={fr}
  siteHostnames={["members.example.org"]}
  resolveAssetUrl={(file) => \`/assets/\${file.id}\`}
  uploadImage={async (file, context) => api.upload(file, context.kind)}
  renderAttachmentPicker={({ onSelect, context }) => <Library owner={context.ownerId} onPick={onSelect} />}
>
  <ContentEditor blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} />
</ContentProvider>`}</code></pre>
      <h2>Controlled content</h2>
      <p>The editor owns no state: every change goes through <code>onBlocksChange</code>, with ids kept stable. Undo and redo are exposed through the ref for a toolbar of your own, and large documents virtualize their blocks after fifty of them.</p>
    </>
  );
}

export function BlocksPage() {
  const document_ = createDocument(allBlocks);
  return (
    <>
      <h1>Blocks</h1>
      <p className="lead">A document is a list of typed blocks, the shape EditorJS writes, so existing content loads as it is. Each type has a definition in the content package, a renderer in the viewer and, for the seven editable ones, an editor.</p>
      <h2>Rendered</h2>
      <p>Every block below is rendered by the viewer, from the document shown after it.</p>
      <div className="blocks-demo">
        <div className="demo__stage demo__stage--block" style={{ borderRadius: "var(--elea-radius-lg)" }}><ContentView data={document_} sanitizer={sanitizer} /></div>
        <pre><code>{JSON.stringify(document_, null, 2)}</code></pre>
      </div>
      <h2>Types</h2>
      <table className="keys">
        <tbody>
          <tr><td><code>paragraph</code></td><td>Sanitized rich text: emphasis, links, inline code, line breaks.</td></tr>
          <tr><td><code>header</code></td><td>Text and a level from 1 to 6; the editor offers 1 to 4.</td></tr>
          <tr><td><code>list</code></td><td>Ordered or unordered, items as text or as objects with nested items, eight levels deep at most.</td></tr>
          <tr><td><code>quote</code></td><td>Text and an optional caption.</td></tr>
          <tr><td><code>image</code></td><td>A file reference the host resolves to a URL, alt text and a caption.</td></tr>
          <tr><td><code>video</code></td><td>A YouTube, Vimeo, Dailymotion or direct file URL, rendered as an embed.</td></tr>
          <tr><td><code>attachment</code></td><td>A file with its type, shown as a downloadable card.</td></tr>
          <tr><td><code>table</code>, <code>code</code>, <code>delimiter</code>, <code>raw</code>, <code>embed</code>, <code>attaches</code></td><td>Legacy EditorJS types. Rendered by the viewer; the editor edits code and keeps the others as they are.</td></tr>
        </tbody>
      </table>
      <h2>Custom blocks</h2>
      <p>Register a definition, then a renderer and, if people edit it, an editor. The definition owns defaults, normalization of stored data and the text used for excerpts and search.</p>
      <pre><code>{`import { createRegistry, defaultRegistry, defineBlock } from "@alien6-studio/elea-content";

const callout = defineBlock<{ tone: string; text: string }>({
  type: "callout",
  defaults: () => ({ tone: "info", text: "" }),
  normalize: (data) => ({ tone: asString(data.tone, "info"), text: asString(data.text) }),
  toText: (data) => htmlToText(data.text),
});
const registry = createRegistry([...defaultRegistry.definitions, callout]);

<ContentView data={doc} registry={registry} renderers={{ callout: CalloutBlock }} />
<ContentEditor blocks={blocks} editors={{ callout: CalloutEditor }} blockTypes={[...BUILTIN_BLOCK_TYPES, "callout"]} />`}</code></pre>
    </>
  );
}

const MARKDOWN = `# A title

A paragraph with **bold**, *italic* and a [link](https://example.org).

- One item
  - nested under it
- Another item

> A quote`;

export function InterchangePage() {
  const document_ = parseDocument({ blocks: markdownToBlocks(MARKDOWN) });
  return (
    <>
      <h1>Markdown and HTML</h1>
      <p className="lead">The document is the model. Markdown and HTML are projections of it: Markdown for exchange with people and tools, HTML for display, mail and search indexes.</p>
      <h2>From Markdown</h2>
      <p><code>markdownToBlocks</code> parses headings, paragraphs, lists with nesting, quotes, code fences and images. Inline marks become sanitized HTML. The editor uses it when pasted text looks like Markdown.</p>
      <div className="blocks-demo">
        <pre><code>{MARKDOWN}</code></pre>
        <div className="demo__stage demo__stage--block" style={{ borderRadius: "var(--elea-radius-lg)" }}><ContentView data={document_} sanitizer={sanitizer} /></div>
      </div>
      <h2>To Markdown</h2>
      <pre><code>{documentToMarkdown(document_)}</code></pre>
      <h2>To HTML</h2>
      <p><code>documentToHtml</code> writes the same markup the viewer renders, with the viewer's class names, through the sanitizer you pass. It runs without a DOM, so a server can store or mail the HTML next to the document.</p>
      <pre><code>{documentToHtml(document_, { sanitize: (html) => sanitizer.sanitize(html) })}</code></pre>
      <h2>Text and excerpts</h2>
      <pre><code>{`import { documentToText, documentExcerpt, defaultRegistry } from "@alien6-studio/elea-content";

const plain = documentToText(document, defaultRegistry);
const teaser = documentExcerpt(document, defaultRegistry, 160);`}</code></pre>
    </>
  );
}
