import { useState } from "react";
import type { EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor } from "@alien6-studio/elea-content-editor";
import { Alert } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-editor/styles.css";

const savedNote: EleaBlock[] = [
  { id: "title", type: "header", data: { text: "Cover", level: 2 } },
  { id: "rule", type: "delimiter", data: {} },
  {
    id: "note",
    type: "paragraph",
    data: {
      text: 'Crop as in the <a href="https://example.org/brief">brief</a>.',
    },
  },
];

export function ReviewNote() {
  const [blocks, setBlocks] = useState(savedNote);
  const [leftOut, setLeftOut] = useState(0);

  return (
    <div className="review-note">
      <ContentEditor
        mode="classic"
        width="full"
        blockTypes={["paragraph", "list"]}
        marks={["bold", "italic", "link"]}
        blocks={blocks}
        onBlocksChange={setBlocks}
        onBlocksLeftOut={(left) => setLeftOut(left.length)}
      />
      {leftOut > 0 && (
        <Alert
          tone="warning"
          role="status"
          title="Part of the note is left out"
        >
          Blocks without text this field cannot store: {leftOut}.
        </Alert>
      )}
    </div>
  );
}
