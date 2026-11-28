import { useState } from "react";
import { Button, Dialog } from "@alien6-studio/elea-ui";

const pages = Array.from({ length: 32 }, (_, index) => index + 1);

export function ProofReading() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<"xl" | "full">("xl");

  function read(next: "xl" | "full") {
    setSize(next);
    setOpen(true);
  }

  return (
    <>
      <Button variant="outline" onClick={() => read("xl")}>
        Read the proof
      </Button>
      <Button variant="outline" onClick={() => read("full")}>
        Read in the full window
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size={size}
        scroll="body"
        title="Proof of the harbour issue"
        description="The title and the actions stay while the pages scroll."
        closeLabel="Close"
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Ask for changes
            </Button>
            <Button onClick={() => setOpen(false)}>Approve</Button>
          </>
        }
      >
        <ol>
          {pages.map((page) => (
            <li key={page}>
              Page {page}, set in two columns with its captions and credits.
            </li>
          ))}
        </ol>
      </Dialog>
    </>
  );
}
