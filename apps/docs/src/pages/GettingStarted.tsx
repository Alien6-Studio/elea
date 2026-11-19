export function GettingStartedPage() {
  return (
    <>
      <h1>Getting started</h1>
      <p className="lead">Six packages share one version. Install what you use.</p>
      <h2>Install</h2>
      <pre><code>{`npm install @alien6-studio/elea-tokens @alien6-studio/elea-content \\
  @alien6-studio/elea-content-viewer @alien6-studio/elea-media @alien6-studio/elea-content-editor @alien6-studio/elea-ui`}</code></pre>
      <h2>Stylesheets</h2>
      <p>The tokens stylesheet defines every variable; each package ships the styles of its components.</p>
      <pre><code>{`import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-content-viewer/styles.css";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-content-editor/styles.css";
import "@alien6-studio/elea-ui/styles.css";`}</code></pre>
      <p>Tailwind v4 projects can also import <code>@alien6-studio/elea-tokens/theme.css</code> after Tailwind, so utilities such as <code>text-elea-text-muted</code> or <code>rounded-elea-lg</code> use the same values.</p>
      <h2>Render a document</h2>
      <pre><code>{`import { ContentView } from "@alien6-studio/elea-content-viewer";

// Works in React server components: no hook, no state
<ContentView data={article.content} />`}</code></pre>
      <h2>Edit a document</h2>
      <pre><code>{`"use client";
import { ContentEditor, ContentProvider } from "@alien6-studio/elea-content-editor";
import { fr } from "@alien6-studio/elea-content";

<ContentProvider messages={fr} uploadImage={async (file) => api.upload(file)} resolveAssetUrl={(file) => \`/assets/\${file.id}\`}>
  <ContentEditor blocks={blocks} onBlocksChange={setBlocks} title={title} onTitleChange={setTitle} />
</ContentProvider>`}</code></pre>
      <h2>Theme</h2>
      <p>Set <code>data-theme="dark"</code> on the root element to force the dark theme, or leave it to the system preference. Override any <code>--elea-*</code> variable after the tokens import to brand a product.</p>
    </>
  );
}
