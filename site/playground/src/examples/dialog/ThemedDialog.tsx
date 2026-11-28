import { useState } from "react";
import { Button, Dialog } from "@alien6-studio/elea-ui";

export function ThemedDialog() {
  const [open, setOpen] = useState(false);

  return (
    <section data-elea-theme="editorial">
      <Button onClick={() => setOpen(true)}>Open in Editorial</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Editorial edition"
        description="The tokens of the container reach this dialog."
        closeLabel="Close"
        actions={<Button onClick={() => setOpen(false)}>Done</Button>}
      />
    </section>
  );
}
