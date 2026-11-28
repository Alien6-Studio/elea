import { useState } from "react";
import { Alert, Button } from "@alien6-studio/elea-ui";
import { InfoIcon } from "../icons";

export function EditingNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      variant="outline"
      tone="primary"
      icon={<InfoIcon />}
      title="Two people are editing this article"
      actions={
        <Button size="sm" variant="outline">
          See who
        </Button>
      }
      onDismiss={() => setDismissed(true)}
      dismissLabel="Dismiss"
    >
      Your changes merge as you type.
    </Alert>
  );
}
