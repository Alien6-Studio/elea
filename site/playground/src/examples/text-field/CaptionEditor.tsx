import { useState } from "react";
import { blocksToHtml, htmlToBlocks } from "@alien6-studio/elea-content";
import { ContentEditor } from "@alien6-studio/elea-content-editor";
import { Button } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-editor/styles.css";

const savedCaption = "<p>Evening light on the <em>glacier</em>.</p>";

export function CaptionEditor() {
  const [blocks, setBlocks] = useState(() => htmlToBlocks(savedCaption));
  const [submitted, setSubmitted] = useState<string>();
  return (
    <form
      aria-label="Exhibition caption"
      className="caption-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(blocksToHtml(blocks));
      }}
    >
      <ContentEditor
        mode="classic"
        width="full"
        blockTypes={["paragraph"]}
        blocks={blocks}
        onBlocksChange={setBlocks}
        maxLength={140}
      />
      <div>
        <Button type="submit" size="sm">
          Save caption
        </Button>
      </div>
      {submitted !== undefined && (
        <output aria-label="Saved HTML">
          <code>{submitted || "Empty caption"}</code>
        </output>
      )}
    </form>
  );
}
