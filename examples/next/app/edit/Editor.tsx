"use client";

import { useState } from "react";
import { createDocument, en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor, ContentProvider, type EditorMode } from "@alien6-studio/elea-content-editor";
import { Button } from "@alien6-studio/elea-ui";
import { sampleBlocks } from "../../lib/sample";

const uploadImage = (file: File) =>
  new Promise<{ url: string; id: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), id: "" });
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });

export function Editor() {
  const [blocks, setBlocks] = useState<EleaBlock[]>(sampleBlocks);
  const [mode, setMode] = useState<EditorMode>("default");
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <ContentProvider messages={en} uploadImage={uploadImage}>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} mode={mode} onModeChange={setMode} />
      <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Button onClick={() => setSaved(JSON.stringify(createDocument(blocks)))}>Save as JSON</Button>
        {saved && <span style={{ color: "var(--elea-color-text-muted)" }}>{saved.length} characters ready for your API</span>}
      </div>
    </ContentProvider>
  );
}
