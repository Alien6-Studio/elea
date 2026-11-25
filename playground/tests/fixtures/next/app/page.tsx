import { createDocument, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { Button, Input, Tabs } from "@alien6-studio/elea-ui";
import { Editor } from "./Editor";

const blocks: EleaBlock[] = [
  { id: "intro", type: "paragraph", data: { text: "Server-rendered content" } },
];

const consumerStyles = `
  .client-app {
    --elea-color-action-primary: #365235;
    --elea-color-action-primary-hover: #273c26;
    --elea-font-family-sans: Georgia, serif;
    color: #243520;
    font: 15px Georgia, serif;
    margin: 1rem;
  }
  .client-app * { box-sizing: border-box; }
  .client-regions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .client-regions > section { padding: 1rem; border: 1px solid #89977b; }
  .client-native {
    appearance: none;
    background: #efe6cb;
    color: #243520;
    font: inherit;
    border: 1px solid #36472a;
    border-radius: 2px;
    padding: 7px 13px;
  }
  .client-adoption {
    --elea-control-height: 46px;
    --elea-control-padding-inline: 19px;
    --elea-control-font-size: 15px;
    --elea-control-radius: 7px;
    --elea-control-focus-outline: 2px solid #365235;
  }
`;

const panels = [
  { value: "draft", label: "Draft", panel: "Draft is ready for review." },
  { value: "history", label: "History", panel: "No changes yet." },
];

export default function Page() {
  return (
    <main>
      <ContentView data={createDocument(blocks)} resolveAssetUrl={(file) => file.url} />
      <Editor initialBlocks={blocks} />
      <section className="client-app" aria-label="Consumer integration">
        <style>{consumerStyles}</style>
        <h2>Consumer integration</h2>
        <div className="client-regions">
          {["Standard controls", "Scoped controls"].map((name, index) => <section key={name}
            aria-label={name} className={index ? "client-adoption" : undefined}>
            <h3>{name}</h3>
            <Button>Continue</Button>{" "}<button type="button" className="client-native">Client action</button>
            <p><label>Document title <Input defaultValue="Review draft" /></label></p>
            <Tabs label="View" presentation={index ? "segmented" : undefined} items={panels} />
          </section>)}
        </div>
      </section>
    </main>
  );
}
