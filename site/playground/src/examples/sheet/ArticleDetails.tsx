import { useState } from "react";
import { Button, Field, Input, Sheet, Textarea } from "@alien6-studio/elea-ui";

export function ArticleDetails() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit details</Button>
      <Sheet
        open={open}
        onClose={close}
        title="Article details"
        description="Shown on the article page and in search results."
        closeLabel="Close"
        actions={
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </>
        }
      >
        <Field label="Title">
          {(control) => (
            <Input {...control} defaultValue="Cranes over the valley" />
          )}
        </Field>
        <Field label="Summary">
          {(control) => <Textarea {...control} rows={4} />}
        </Field>
        <Field label="Author">
          {(control) => <Input {...control} defaultValue="Grace Hopper" />}
        </Field>
      </Sheet>
    </>
  );
}
