import { useState } from "react";
import { ContentComparison } from "@alien6-studio/elea-content-viewer";
import { Button, Dialog } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-viewer/styles.css";

const published = {
  blocks: [
    { type: "header", data: { text: "Three winters on the ice", level: 2 } },
    {
      type: "paragraph",
      data: {
        text: "The survey began in <strong>January</strong>, when the"
          + " glacier was still closed to visitors.",
      },
    },
    {
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Twelve stakes along the tongue",
          "One reading a week",
          "A camera at the foot of the icefall",
        ],
      },
    },
    {
      type: "paragraph",
      data: { text: "Results will follow in the autumn issue." },
    },
  ],
};

const draft = {
  blocks: [
    { type: "header", data: { text: "Three winters on the ice", level: 2 } },
    {
      type: "paragraph",
      data: {
        text: "The survey began in <strong>February</strong>, when the"
          + " glacier was still closed to <em>most</em> visitors.",
      },
    },
    {
      type: "list",
      data: {
        style: "unordered",
        items: [
          "Twelve stakes along the tongue",
          "Two readings a week",
          "A weather mast on the moraine",
        ],
      },
    },
    {
      type: "quote",
      data: {
        text: "The tongue lost four metres in a single summer.",
        caption: "Field notebook, August",
      },
    },
  ],
};

export function DraftAgainstPublished() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Compare with the published version
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="xl"
        scroll="body"
        title="Draft and published version"
        description="Underlined words are new; struck words are gone."
        closeLabel="Close"
        actions={<Button onClick={() => setOpen(false)}>Publish</Button>}
      >
        <ContentComparison before={published} after={draft} />
      </Dialog>
    </>
  );
}
