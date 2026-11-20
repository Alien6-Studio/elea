import { useMemo, useState } from "react";
import { createDocument, documentToHtml, documentToMarkdown, en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor, ContentProvider, type EditorMode, type PickedAttachment } from "@alien6-studio/elea-content-editor";
import { ContentView, createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";

const sanitizer = createDefaultSanitizer({ links: { siteHostnames: ["alien6-studio.github.io"] } });

const uploadImage = (file: File) =>
  new Promise<{ url: string; id: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), id: "" });
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });

const LIBRARY: PickedAttachment[] = [
  { id: "doc-1", title: "Quarterly report", type: "application/pdf", description: "Twelve pages of synthetic numbers", url: "https://example.org/files/report.pdf" },
  { id: "doc-2", title: "Budget sheet", type: "application/vnd.ms-excel", url: "https://example.org/files/budget.xlsx" },
];

const OUTPUTS = ["rendered", "html", "markdown", "json"] as const;
type Output = (typeof OUTPUTS)[number];

export interface LiveEditorProps {
  initial: EleaBlock[];
  title?: string;
  summary?: string;
  /** Without the side panel, the editor takes the whole stage. */
  withOutput?: boolean;
  caption?: string;
  /** Lets people switch between the visual editors and Markdown. */
  modeSwitch?: boolean;
}

/** The editor with its outputs, as it runs in this page: images become data URLs, attachments come from a fixed list. */
export function LiveEditor({ initial, title: initialTitle, summary: initialSummary, withOutput = true, caption, modeSwitch = false }: LiveEditorProps) {
  const [blocks, setBlocks] = useState(initial);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [tab, setTab] = useState<Output>("rendered");
  const [mode, setMode] = useState<EditorMode>("default");
  const document_ = useMemo(() => createDocument(blocks), [blocks]);
  const outputs = useMemo(() => ({
    html: documentToHtml(document_, { sanitize: (html) => sanitizer.sanitize(html) }),
    markdown: documentToMarkdown(document_),
    json: JSON.stringify(document_, null, 2),
  }), [document_]);
  const hasTitle = initialTitle !== undefined;
  return (
    <div className={`stage${withOutput ? "" : " stage--single"}`}>
      <div className="stage__bar">
        <span>{caption ?? "Try it: this editor runs in the page."}</span>
        <span>{blocks.length} blocks</span>
      </div>
      <div className="stage__body">
        <div className="stage__editor">
          <ContentProvider messages={en} sanitizer={sanitizer} uploadImage={uploadImage} renderAttachmentPicker={({ onSelect }) => (
            <div className="elea-quick-add">
              {LIBRARY.map((item) => (
                <button key={item.id} type="button" className="elea-quick-add__item" onClick={() => onSelect(item)}>{item.title}</button>
              ))}
            </div>
          )}>
            <ContentEditor
              blocks={blocks}
              onBlocksChange={setBlocks}
              title={hasTitle ? title : undefined}
              onTitleChange={hasTitle ? setTitle : undefined}
              summary={hasTitle ? summary : undefined}
              onSummaryChange={hasTitle ? setSummary : undefined}
              summaryDisabled={initialSummary === undefined}
              enableVirtualization={false}
              mode={mode}
              onModeChange={modeSwitch ? setMode : undefined}
            />
          </ContentProvider>
        </div>
        {withOutput && (
          <div className="stage__side">
            <div className="stage__tabs" role="tablist" aria-label="Output">
              {OUTPUTS.map((name) => (
                <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>{({ rendered: "Rendered", html: "HTML", markdown: "Markdown", json: "JSON" })[name]}</button>
              ))}
            </div>
            <div className="stage__panel">
              {tab === "rendered" && <ContentView data={document_} sanitizer={sanitizer} />}
              {tab === "html" && <pre>{outputs.html}</pre>}
              {tab === "markdown" && <pre>{outputs.markdown}</pre>}
              {tab === "json" && <pre>{outputs.json}</pre>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
