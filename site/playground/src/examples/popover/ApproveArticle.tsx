import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";
import { CheckIcon } from "../icons";

export function ApproveArticle() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [answer, setAnswer] = useState("nothing yet");

  function answerWith(value: string) {
    setAnswer(value);
    setAnchor(null);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Approve
      </Button>
      <ConfirmPopover
        anchor={anchor}
        open={anchor !== null}
        tone="success"
        icon={<CheckIcon />}
        title="Approve this article?"
        confirmLabel="Approve"
        cancelLabel="Cancel"
        onConfirm={() => answerWith("approved")}
        onCancel={() => answerWith("cancelled")}
      />
      <p>Last answer: {answer}</p>
    </>
  );
}
