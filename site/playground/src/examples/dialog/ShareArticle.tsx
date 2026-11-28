import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
} from "@alien6-studio/elea-ui";
import { TrashIcon } from "../icons";

export function ShareArticle() {
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <Button onClick={() => setSharing(true)}>Share article</Button>
      <Button variant="danger" onClick={() => setDeleting(true)}>
        Delete article
      </Button>
      <Dialog
        open={sharing}
        onClose={() => setSharing(false)}
        title="Share this article"
        description="Choose who can read it."
        closeLabel="Close"
        actions={
          <>
            <Button variant="outline" onClick={() => setSharing(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSharing(false)}>Share</Button>
          </>
        }
      >
        <Field label="Link">
          {(control) => (
            <Input {...control} readOnly value="https://example.org/a/1" />
          )}
        </Field>
      </Dialog>
      <ConfirmDialog
        open={deleting}
        onConfirm={() => setDeleting(false)}
        onCancel={() => setDeleting(false)}
        title="Delete this article?"
        description="This cannot be undone."
        tone="danger"
        icon={<TrashIcon />}
        confirmLabel="Delete"
        cancelLabel="Keep"
        closeLabel="Close"
      />
    </>
  );
}
