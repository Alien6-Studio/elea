import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";

export function RejectArticle() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [reason, setReason] = useState("nothing yet");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Reject
      </Button>
      <ConfirmPopover
        anchor={anchor}
        open={anchor !== null}
        tone="danger"
        title="Reject this article?"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        field={{ label: "Reason", placeholder: "Optional" }}
        onConfirm={(value) => {
          setReason(value || "no reason");
          setAnchor(null);
        }}
        onCancel={() => setAnchor(null)}
      />
      <p>Received: {reason}</p>
    </>
  );
}
