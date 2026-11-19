import { createDocument } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { sampleBlocks } from "../lib/sample";

// No "use client" here: this is a server component, the viewer has no hook to need one
export default function ReadPage() {
  return (
    <article>
      <h1 style={{ fontSize: "var(--elea-font-size-4xl)" }}>Elea on Next.js</h1>
      <ContentView data={createDocument(sampleBlocks)} resolveAssetUrl={(file) => `/assets/${file.id || file.url}`} />
    </article>
  );
}
