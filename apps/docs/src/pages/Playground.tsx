import { createDocument, documentToHtml, documentToMarkdown, en, fr, markdownToBlocks, parseDocument, type EleaBlock, type EleaMessages } from "@alien6-studio/elea-content";
import { ContentEditor, ContentProvider, type PickedAttachment } from "@alien6-studio/elea-content-editor";
import { ContentView, createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { Select } from "@alien6-studio/elea-ui";
import { useMemo, useState } from "react";
import { playgroundBlocks } from "../samples.js";

const SITE_HOSTS = ["localhost", "alien6-studio.github.io"];
const sanitizer = createDefaultSanitizer({ links: { siteHostnames: SITE_HOSTS } });

/** Fake host services: images become data URLs, attachments come from a fixed list. */
const uploadImage = (file: File) =>
  new Promise<{ url: string; id: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), id: "" });
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });

const LIBRARY: PickedAttachment[] = [
  { id: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" },
  { id: "doc-2", title: "Budget sheet", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", url: "https://example.org/files/budget.xlsx" },
  { id: "doc-3", title: "Launch deck", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", url: "https://example.org/files/deck.pptx" },
];

function Picker({ onSelect }: { onSelect: (attachment: PickedAttachment) => void }) {
  return (
    <div className="picker" data-testid="picker">
      {LIBRARY.map((item) => (
        <button key={item.id} type="button" onClick={() => onSelect(item)}>
          <span>{item.title}</span>
          {item.description && <small>{item.description}</small>}
        </button>
      ))}
    </div>
  );
}

const MESSAGES: Record<string, EleaMessages> = { en, fr };
const OUTPUTS = [
  { id: "rendered", label: "Rendered" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown" },
  { id: "json", label: "JSON" },
] as const;
type Output = (typeof OUTPUTS)[number]["id"];


export function PlaygroundPage() {
  const [blocks, setBlocks] = useState<EleaBlock[]>(playgroundBlocks);
  const [title, setTitle] = useState("Writing with Elea");
  const [summary, setSummary] = useState("A block document, edited on the left and rendered on the right from the same tokens.");
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<Output>("rendered");
  const [markdownInput, setMarkdownInput] = useState("");
  const [layout, setLayout] = useState<"write" | "split">("split");
  const [mode, setMode] = useState<"default" | "toolbar" | "classic">("default");
  const messages = MESSAGES[locale] ?? en;
  const document_ = useMemo(() => createDocument(blocks), [blocks]);
  const outputs = useMemo(
    () => ({
      html: documentToHtml(document_, { sanitize: (html) => sanitizer.sanitize(html) }),
      markdown: documentToMarkdown(document_),
      json: JSON.stringify(document_, null, 2),
    }),
    [document_],
  );
  const words = useMemo(() => outputs.markdown.split(/\s+/).filter(Boolean).length, [outputs.markdown]);

  const importMarkdown = () => {
    const parsed = parseDocument({ blocks: markdownToBlocks(markdownInput) });
    if (parsed.blocks.length > 0) setBlocks(parsed.blocks);
  };

  return (
    <ContentProvider messages={messages} sanitizer={sanitizer} siteHostnames={SITE_HOSTS} uploadImage={uploadImage} renderAttachmentPicker={({ onSelect }) => <Picker onSelect={onSelect} />}>
      <div className={`playground playground--${layout}`}>
        <header className="playground__bar">
          <h1 className="playground__brand">Elea playground</h1>
          <p className="playground__hint">{blocks.length} blocks, {words} words. Select text to format it, type / for the block menu, drag a block by its grip.</p>
          <div className="playground__controls">
            <Select size="sm" label="Editor mode" value={mode} onChange={(next) => setMode(next as "default" | "toolbar" | "classic")} options={[{ value: "default", label: "Default" }, { value: "toolbar", label: "Toolbar" }, { value: "classic", label: "Classic" }]} triggerProps={{ "data-testid": "mode-select" }} />
            <Select size="sm" label="Language" value={locale} onChange={(next) => setLocale(next as "en" | "fr")} options={[{ value: "en", label: "English" }, { value: "fr", label: "Français" }]} />
            <button type="button" onClick={() => setLayout(layout === "write" ? "split" : "write")} aria-pressed={layout === "write"} data-testid="layout-toggle">
              {layout === "write" ? "Show output" : "Write only"}
            </button>
            <button type="button" onClick={() => setPreview((value) => !value)} data-testid="preview-toggle" aria-pressed={preview}>
              {preview ? "Edit" : "Preview"}
            </button>
            <button type="button" onClick={() => setBlocks([{ id: "empty", type: "paragraph", data: { text: "" } }])} data-testid="reset">
              Empty document
            </button>
          </div>
        </header>
        <main className="playground__page" data-testid="editor-pane">
          <ContentEditor blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} summary={summary} onSummaryChange={setSummary} showPreview={preview} context={{ kind: "playground" }} mode={mode} />
        </main>
        <aside className="playground__output" data-testid="viewer-pane" aria-label="Output">
          <div className="playground__tabs" role="tablist" aria-label="Output">
            {OUTPUTS.map((output) => (
              <button key={output.id} type="button" role="tab" aria-selected={tab === output.id} onClick={() => setTab(output.id)} data-testid={`tab-${output.id}`}>
                {output.label}
              </button>
            ))}
          </div>
          <div className="playground__panel">
            {tab === "rendered" && <ContentView data={document_} sanitizer={sanitizer} messages={messages} />}
            {tab === "html" && <pre data-testid="document-html">{outputs.html}</pre>}
            {tab === "markdown" && <pre data-testid="document-markdown">{outputs.markdown}</pre>}
            {tab === "json" && <pre data-testid="document-json">{outputs.json}</pre>}
          </div>
          <details className="playground__import">
            <summary>Import Markdown</summary>
            <textarea className="markdown-input" aria-label="Markdown to import" value={markdownInput} onChange={(event) => setMarkdownInput(event.target.value)} rows={8} placeholder="# A title&#10;&#10;Some **bold** text" />
            <button type="button" className="import-button" onClick={importMarkdown} data-testid="import-markdown">
              Replace the document
            </button>
          </details>
        </aside>
      </div>
    </ContentProvider>
  );
}
