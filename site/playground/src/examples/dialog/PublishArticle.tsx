import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Field,
  Textarea,
} from "@alien6-studio/elea-ui";

export function PublishArticle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Publish article
      </Button>
      <DialogRoot open={open} onClose={() => setOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>
            Publish this article{" "}
            <Badge tone="primary" variant="subtle">
              Step 2 of 2
            </Badge>
          </DialogTitle>
          <DialogClose label="Close" />
        </DialogHeader>
        <DialogDescription>
          Readers see it as soon as you publish.
        </DialogDescription>
        <DialogBody>
          <Field label="Summary">
            {(control) => <Textarea {...control} rows={3} />}
          </Field>
        </DialogBody>
        <DialogFooter>
          <Checkbox label="Notify subscribers" />
          <Button onClick={() => setOpen(false)}>Publish</Button>
        </DialogFooter>
      </DialogRoot>
    </>
  );
}
