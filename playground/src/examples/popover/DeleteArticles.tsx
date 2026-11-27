import { useState } from "react";
import { Button, ConfirmPopover } from "@alien6-studio/elea-ui";
import { TrashIcon } from "../icons";

const drafts = ["Field notes", "Release plan", "Style guide"];

interface Row {
  name: string;
  anchor: HTMLElement;
}

export function DeleteArticles() {
  const [articles, setArticles] = useState(drafts);
  const [row, setRow] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    await new Promise((done) => setTimeout(done, 900));
    setArticles((all) => all.filter((name) => name !== row?.name));
    setDeleting(false);
    setRow(null);
  }

  return (
    <>
      <ul>
        {articles.map((name) => (
          <li key={name}>
            {name}
            <Button
              variant="ghost"
              size="sm"
              aria-haspopup="dialog"
              aria-label={`Delete ${name}`}
              onClick={(event) => setRow({ name, anchor: event.currentTarget })}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <ConfirmPopover
        anchor={row?.anchor ?? null}
        open={row !== null}
        tone="danger"
        icon={<TrashIcon />}
        loading={deleting}
        title={`Delete ${row?.name ?? "it"}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={remove}
        onCancel={() => setRow(null)}
      />
    </>
  );
}
