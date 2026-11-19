import { createDocument, documentToHtml, documentToMarkdown, en, fr, markdownToBlocks, parseDocument, type EleaBlock, type EleaMessages } from "@alien6-studio/elea-content";
import { ContentEditor, ContentProvider, type PickedAttachment } from "@alien6-studio/elea-content-editor";
import { ContentView, createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { useMemo, useState } from "react";
import { sampleBlocks } from "./sample.js";

const SITE_HOSTS = ["localhost", "playground.example"];
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
          {item.title}
        </button>
      ))}
    </div>
  );
}

const MESSAGES: Record<string, EleaMessages> = { en, fr };

export function App() {
  const [blocks, setBlocks] = useState<EleaBlock[]>(sampleBlocks);
  const [title, setTitle] = useState("Elea playground");
  const [summary, setSummary] = useState("The editor on the left, the viewer on the right, both on the same tokens.");
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<"rendered" | "html" | "markdown" | "json">("rendered");
  const [markdownInput, setMarkdownInput] = useState("");
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

  const importMarkdown = () => {
    const parsed = parseDocument({ blocks: markdownToBlocks(markdownInput) });
    if (parsed.blocks.length > 0) setBlocks(parsed.blocks);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <ContentProvider messages={messages} sanitizer={sanitizer} siteHostnames={SITE_HOSTS} uploadImage={uploadImage} renderAttachmentPicker={({ onSelect }) => <Picker onSelect={onSelect} />}>
      <main className="playground">
        <div className="playground__bar">
          <h1>Elea playground</h1>
          <select aria-label="Language" value={locale} onChange={(event) => setLocale(event.target.value as "en" | "fr")}>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
          <button type="button" onClick={toggleTheme} data-testid="theme-toggle">
            {theme === "light" ? "Dark theme" : "Light theme"}
          </button>
          <button type="button" onClick={() => setPreview((value) => !value)} data-testid="preview-toggle" aria-pressed={preview}>
            {preview ? "Edit" : "Preview"}
          </button>
          <button type="button" onClick={() => setBlocks([{ id: "empty", type: "paragraph", data: { text: "" } }])} data-testid="reset">
            Empty document
          </button>
        </div>
        <section className="playground__pane playground__pane--editor" data-testid="editor-pane">
          <h2>Editor</h2>
          <ContentEditor blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} summary={summary} onSummaryChange={setSummary} showPreview={preview} context={{ kind: "playground" }} />
        </section>
        <section className="playground__pane" data-testid="viewer-pane">
          <h2>Viewer</h2>
          <div className="tabs" role="tablist" aria-label="Output">
            {(["rendered", "html", "markdown", "json"] as const).map((name) => (
              <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => setTab(name)} data-testid={`tab-${name}`}>
                {name === "rendered" ? "Rendered" : name.toUpperCase()}
              </button>
            ))}
          </div>
          {tab === "rendered" && <ContentView data={document_} sanitizer={sanitizer} messages={messages} />}
          {tab === "html" && <pre data-testid="document-html">{outputs.html}</pre>}
          {tab === "markdown" && <pre data-testid="document-markdown">{outputs.markdown}</pre>}
          {tab === "json" && <pre data-testid="document-json">{outputs.json}</pre>}
          <details>
            <summary>Import Markdown</summary>
            <textarea className="markdown-input" aria-label="Markdown to import" value={markdownInput} onChange={(event) => setMarkdownInput(event.target.value)} rows={8} placeholder="# A title&#10;&#10;Some **bold** text" />
            <button type="button" className="import-button" onClick={importMarkdown} data-testid="import-markdown">
              Replace the document
            </button>
          </details>
        </section>
      </main>
    </ContentProvider>
  );
}
