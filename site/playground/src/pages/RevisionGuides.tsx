import { Demo, PropsTable } from "../components/Demo.js";
import { DraftAgainstPublished } from "../examples/content-comparison/DraftAgainstPublished.js";
import { RevisedColophon } from "../examples/content-comparison/RevisedColophon.js";
import { DraftAutosave } from "../examples/save-status/DraftAutosave.js";
import { SaveStates } from "../examples/save-status/SaveStates.js";
import draftAgainstPublished from "../examples/content-comparison/DraftAgainstPublished.tsx?raw";
import revisedColophon from "../examples/content-comparison/RevisedColophon.tsx?raw";
import draftAutosave from "../examples/save-status/DraftAutosave.tsx?raw";
import saveStates from "../examples/save-status/SaveStates.tsx?raw";

export function SaveStatusPage() {
  return (
    <>
      <h1>Save status</h1>
      <p className="lead">Say where an automatic save stands beside an editor or a form: under way, done, or failed with a way to try again.</p>
      <Demo title="Autosave" description="Type in the field to save. Lose the connection, type again, then retry once it is back." code={draftAutosave}>
        <div className="catalog-stack catalog-fill"><DraftAutosave /></div>
      </Demo>
      <Demo title="States" description="The text is yours, so it carries the time, the language and the wording of your product." code={saveStates}>
        <div className="catalog-stack"><SaveStates /></div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "state", type: '"idle" | "saving" | "saved" | "error"', description: "Where the save stands. It sets the icon and the colour; idle shows the text alone." },
        { name: "children", type: "ReactNode", description: "What the state says, such as “Saved at 12:12”. Each change is announced politely." },
        { name: "onRetry, retryLabel", type: "() => void, string", description: "Given together, they add a retry button in the error state." },
      ]} />
    </>
  );
}

export function ContentComparisonPage() {
  return (
    <>
      <h1>Content comparison</h1>
      <p className="lead">Show two versions of a document as one. Words and blocks that came are underlined, those that went are struck through, and rich text keeps its formatting.</p>
      <Demo title="Draft against published" description="The comparison reads the same block documents as the viewer and the editor." code={draftAgainstPublished}>
        <div className="catalog-row"><DraftAgainstPublished /></div>
      </Demo>
      <Demo title="Changed, added and removed blocks" description="An edited paragraph is shown once with both versions. A block that has no earlier or later version is shown whole." code={revisedColophon}>
        <div className="catalog-fill"><RevisedColophon /></div>
      </Demo>
      <h2>Props</h2>
      <p><code>ContentComparison</code> is exported by <code>@alien6-studio/elea-content-viewer</code> and takes the options of <code>ContentView</code>, such as <code>messages</code>, <code>registry</code> and <code>siteHostnames</code>.</p>
      <PropsTable rows={[
        { name: "before, after", type: "unknown", description: "The earlier and the later version: a document object, its JSON string, plain text or HTML." },
        { name: "renderers", type: "BlockRendererMap", description: "Renderers by block type, merged over the built-in ones." },
        { name: "typography", type: '"elea" | "inherit"', defaultValue: '"elea"', description: "inherit takes the family, size, leading and colour of the host page." },
        { name: "emptyFallback", type: "ReactNode", description: "Shown when neither version has a block." },
      ]} />
      <h2>As data</h2>
      <p><code>compareBlocks(before, after)</code> and <code>compareHtml(before, after)</code> in <code>@alien6-studio/elea-content</code> return the same comparison without rendering it. Blocks are matched by content, not by id; a paragraph, heading, quote or list that kept half of its words counts as changed.</p>
    </>
  );
}
