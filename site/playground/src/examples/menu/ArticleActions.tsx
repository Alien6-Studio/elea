import { useState } from "react";
import { Button, Menu } from "@alien6-studio/elea-ui";

export function ArticleActions() {
  const [last, setLast] = useState("nothing yet");

  return (
    <>
      <Menu
        label="Article actions"
        items={[
          { id: "edit", label: "Edit", onSelect: () => setLast("edit") },
          { id: "share", label: "Share", onSelect: () => setLast("share") },
          {
            id: "archive",
            label: "Archive",
            disabled: true,
            onSelect: () => setLast("archive"),
          },
          {
            id: "delete",
            label: "Delete",
            danger: true,
            onSelect: () => setLast("delete"),
          },
        ]}
        trigger={(props) => (
          <Button variant="outline" {...props}>
            Actions
          </Button>
        )}
      />
      <p>Last action: {last}</p>
    </>
  );
}
