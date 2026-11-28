import { createDocument, defaultRegistry, documentToText, documentToHtml, documentToMarkdown, en, fr, markdownToBlocks, parseDocument, type EleaBlock, type EleaDocument, type EleaMessages } from "@alien6-studio/elea-content";
import { ContentEditor, ContentProvider, type ContentEditorServices, type ImageCropSource, type EditorMode, type PickedAttachment } from "@alien6-studio/elea-content-editor";
import { createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { Button, Select, Tabs } from "@alien6-studio/elea-ui";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { notebookBlocks, notebookSummary, notebookTitle, playgroundBlocks } from "../samples.js";
import { brandRoute, makeBrandTheme, type BrandTheme } from "./brandTheme.js";
import { siteHostnames } from "../links.js";
import { glacierImage } from "../notebook.js";
import { ReaderEdition } from "./ReaderEdition.js";

import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-media/crop-adjustments.css";
import "@alien6-studio/elea-content-editor/styles.css";
import "./editor.css";

const sanitizer = createDefaultSanitizer({ links: { siteHostnames } });

const crops = new Map<string, ImageCropSource>();
const demoCrop: ContentEditorServices["imageCrop"] = {
  formats: true,
  resolveOriginal: file => crops.get(file.id) ?? (file.url === glacierImage.data.file.url
    ? { source: file.url, name: "glacier.webp" } : undefined),
};

/** Fake host services: images become data URLs after a pretend check, attachments come from a fixed list. */
const uploadImage: NonNullable<ContentEditorServices["uploadImage"]> = (file, _context, { report, signal, crop }) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    report({ label: "Uploading", progress: 0 });
    reader.onprogress = (event) => { if (event.lengthComputable) report({ label: "Uploading", progress: event.loaded / event.total }); };
    reader.onload = () => {
      report({ label: "Checking the picture…" });
      const check = setTimeout(() => {
        if (signal.aborted) return;
        const id = crypto.randomUUID();
        if (crop) crops.set(id, crop);
        resolve({ url: reader.result as string, id });
      }, 600);
      signal.addEventListener("abort", () => clearTimeout(check));
    };
    reader.onerror = () => reject(new Error("The picture could not be read."));
    signal.addEventListener("abort", () => reader.abort());
    reader.readAsDataURL(file);
  });

const LIBRARY: PickedAttachment[] = [
  { id: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" },
  { id: "doc-2", title: "Budget sheet", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", url: "https://example.org/files/budget.xlsx" },
  { id: "doc-3", title: "Launch deck", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", url: "https://example.org/files/deck.pptx" },
];

function Picker({ onSelect }: Readonly<{ onSelect: (attachment: PickedAttachment) => void }>) {
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
  { id: "rendered", label: "Article" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown" },
  { id: "json", label: "JSON" },
] as const;
type Output = (typeof OUTPUTS)[number]["id"];

type Format = Exclude<Output, "rendered">;
const formats = {
  html: { extension: "html", mime: "text/html" },
  markdown: { extension: "md", mime: "text/markdown" },
  json: { extension: "json", mime: "application/json" },
} as const;

function DocumentExport({ document, format, title }: Readonly<{ document: EleaDocument; format: Format; title: string }>) {
  const source = useMemo(() => {
    if (format === "html") return documentToHtml(document, { sanitize: (html) => sanitizer.sanitize(html) });
    if (format === "markdown") return documentToMarkdown(document);
    return JSON.stringify(document, null, 2);
  }, [document, format]);
  const { extension, mime } = formats[format];
  function download() {
    const url = URL.createObjectURL(new Blob([source], { type: mime + ";charset=utf-8" }));
    const link = globalThis.document.createElement("a");
    link.href = url;
    const slug = title.toLowerCase().trim().replaceAll(/[^\p{L}\p{N}]+/gu, "-").replaceAll(/(?:^-)|(?:-$)/g, "");
    link.download = `${slug || "article"}.${extension}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return (
    <div className="workspace-source">
      <Button size="sm" variant="outline" onClick={download}>Download .{extension}</Button>
      <pre className="elea-code" tabIndex={0} data-testid={`document-${format}`}><code>{source}</code></pre>
    </div>
  );
}

interface Draft {
  title: string;
  summary: string;
  blocks: EleaBlock[];
}
const samples = {
  notebook: { title: notebookTitle, summary: notebookSummary, blocks: notebookBlocks },
  reference: { title: "Block reference", summary: "An editable reference for text, media and legacy EditorJS blocks.", blocks: playgroundBlocks },
} satisfies Record<string, Draft>;
type Sample = keyof typeof samples;
// Keep both drafts while the user explores other examples within this tab.
let session: { sample: Sample; drafts: Record<Sample, Draft> } = {
  sample: "notebook", drafts: samples,
};

const compact = "(max-width: 55rem)";
function subscribeLayout(update: () => void) {
  const query = globalThis.matchMedia(compact);
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}
const compactLayout = () => globalThis.matchMedia(compact).matches;

export function PlaygroundPage({ brand }: Readonly<{ brand?: BrandTheme }>) {
  const [sample, setSample] = useState<Sample>(() => session.sample);
  const [drafts, setDrafts] = useState(() => session.drafts);
  useEffect(() => { session = { sample, drafts }; }, [sample, drafts]);
  const { title, blocks, summary } = drafts[sample];
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<Output>("rendered");
  const [markdownInput, setMarkdownInput] = useState("");
  const [focus, setFocus] = useState(false);
  const [mobilePane, setMobilePane] = useState<"manuscript" | "output">("manuscript");
  const [mode, setMode] = useState<EditorMode>("default");
  const isCompact = useSyncExternalStore(subscribeLayout, compactLayout, () => false);
  const showOutput = isCompact ? mobilePane === "output" : !focus;
  const showEditor = !isCompact || mobilePane === "manuscript";
  const messages = MESSAGES[locale] ?? en;
  const document_ = useMemo(() => createDocument(blocks), [blocks]);
  const words = useMemo(() => documentToText(document_, defaultRegistry).match(/\S+/gu)?.length ?? 0, [document_]);
  const css = useMemo(() => brand && makeBrandTheme(brand).css, [brand]);

  function update(changes: Partial<Draft>) {
    setDrafts((current) => ({ ...current, [sample]: { ...current[sample], ...changes } }));
  }

  function startBlank() {
    update({ title: "", summary: "", blocks: [{ id: "empty", type: "paragraph", data: { text: "" } }] });
  }

  function importMarkdown() {
    const parsed = parseDocument({ blocks: markdownToBlocks(markdownInput) });
    if (parsed.blocks.length) update({ blocks: parsed.blocks });
  }

  const settings = (
    <div className="workspace-settings">
      <Select size="sm" label="Language" value={locale} onChange={(next) => setLocale(next as "en" | "fr")} options={[{ value: "en", label: "English" }, { value: "fr", label: "Français" }]} />
      {!isCompact && <Button size="sm" variant="outline" aria-pressed={focus} onClick={() => setFocus(!focus)} data-testid="layout-toggle">Focus mode</Button>}
    </div>
  );

  return (
    <ContentProvider messages={messages} imageCrop={demoCrop} siteHostnames={siteHostnames} uploadImage={uploadImage} renderAttachmentPicker={({ onSelect }) => <Picker onSelect={onSelect} />}>
      {css && <style>{css}</style>}
      <div className="workspace frame">
        <header className="workspace-intro">
          <div>
            <h1 className="site-page-title">Editorial workspace</h1>
            <p>Edit a manuscript, see the reader’s edition and export the blocks to your product.</p>
          </div>
          <a className="workspace-theme" href={brandRoute("theme", brand)}>Edit theme <span aria-hidden="true">↗</span></a>
        </header>
        <div className="workspace-desk" data-elea-theme={css ? "brand" : undefined}>
          <div className="workspace-tools">
            <div className="workspace-document">
              <span id="workspace-document-label">Document</span>
              <Select size="sm" labelledBy="workspace-document-label" value={sample} onChange={(next) => setSample(next as Sample)} options={[{ value: "notebook", label: drafts.notebook.title || "Untitled notebook" }, { value: "reference", label: drafts.reference.title || "Untitled reference" }]} />
            </div>
            {isCompact ? <details className="workspace-settings-menu"><summary>Writing tools</summary>{settings}</details> : settings}
          </div>
          {isCompact && <div className="workspace-switch" role="group" aria-label="Workspace view">
            <Button size="sm" variant={showEditor ? "primary" : "outline"} aria-pressed={showEditor} onClick={() => setMobilePane("manuscript")}>Manuscript</Button>
            <Button size="sm" variant={showOutput ? "primary" : "outline"} aria-pressed={showOutput} onClick={() => setMobilePane("output")}>Output</Button>
          </div>}
          <div className={showEditor && showOutput ? "workspace-panes workspace-panes--split" : "workspace-panes"}>
            <section hidden={!showEditor} className="workspace-draft" data-testid="editor-pane" aria-label="Manuscript">
              <header className="workspace-draft__bar">
                <div><h2>Manuscript</h2><span>{blocks.length} {blocks.length === 1 ? "block" : "blocks"} · {words} {words === 1 ? "word" : "words"}</span></div>
                <div className="workspace-draft__actions">
                  <Button size="sm" variant="ghost" onClick={startBlank} data-testid="reset">Start blank</Button>
                  <Button size="sm" variant="outline" onClick={() => setPreview(!preview)} data-testid="preview-toggle" aria-pressed={preview}>{preview ? "Edit draft" : "Preview draft"}</Button>
                </div>
              </header>
              <div className="workspace-paper">
                <ContentEditor key={sample} blocks={blocks} onBlocksChange={(blocks) => update({ blocks })} title={title} onTitleChange={(title) => update({ title })} summary={summary} onSummaryChange={(summary) => update({ summary })} showPreview={preview} context={{ kind: "playground" }} mode={mode} onModeChange={setMode} />
              </div>
            </section>
            {showOutput && <aside className="workspace-output" data-testid="viewer-pane" aria-label="Output">
              <div className="workspace-output__heading"><h2>Output</h2><details className="workspace-import">
                <summary>Import Markdown</summary>
                <div className="workspace-import__form">
                  <label htmlFor="workspace-markdown">Markdown to import</label>
                  <textarea id="workspace-markdown" value={markdownInput} onChange={(event) => setMarkdownInput(event.target.value)} rows={6} placeholder="# A title" />
                  <Button size="sm" variant="outline" onClick={importMarkdown} disabled={!markdownInput.trim()} data-testid="import-markdown">Replace the document</Button>
                </div>
              </details></div>
              <Tabs<Output> label="Output format" value={tab} onChange={setTab} items={OUTPUTS.map(({ id, label }) => ({
                value: id, label,
                panel: id === "rendered"
                  ? <ReaderEdition document={document_} title={title} summary={summary} audience={sample === "notebook" ? "Members" : undefined} messages={messages} />
                  : <DocumentExport document={document_} format={id} title={title} />,
              }))} />
            </aside>}
          </div>
        </div>
      </div>
    </ContentProvider>
  );
}
