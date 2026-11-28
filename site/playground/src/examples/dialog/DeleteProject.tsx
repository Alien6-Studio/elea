import { useState } from "react";
import { Button, ConfirmDialog } from "@alien6-studio/elea-ui";
import { TrashIcon } from "../icons";

export function DeleteProject() {
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState("nothing yet");

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <p>Deleted: {removed}</p>
      <ConfirmDialog
        open={open}
        tone="danger"
        icon={<TrashIcon />}
        title="Delete this project?"
        description="Type the name of the project to delete it."
        field={{
          label: "Name of the project: field-notes",
          expected: "field-notes",
        }}
        confirmLabel="Delete"
        cancelLabel="Keep"
        closeLabel="Close"
        onConfirm={(value) => {
          setRemoved(value ?? "");
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
