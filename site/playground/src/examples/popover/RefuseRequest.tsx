import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";

export function RefuseRequest() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [comment, setComment] = useState("nothing yet");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Refuse
      </Button>
      <ConfirmPopover
        anchor={anchor}
        open={anchor !== null}
        title="Refuse the request"
        confirmLabel="Refuse"
        cancelLabel="Cancel"
        field={{
          label: "Comment",
          required: true,
          multiline: true,
          maxLength: 280,
        }}
        onConfirm={(value) => {
          setComment(value ?? "");
          setAnchor(null);
        }}
        onCancel={() => setAnchor(null)}
      />
      <p>Received: {comment}</p>
    </>
  );
}
