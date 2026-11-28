import { Button } from "@alien6-studio/elea-ui";

const css = `
.publication-actions {
  --elea-shape-action: 1.5rem 0.25rem 1rem 0.5rem;
  --elea-button-radius-sm: 0.75rem 0.125rem 0.5rem 0.25rem;
}
.publication-toolbar {
  --elea-control-radius: 0.25rem 1rem 0.5rem 0;
}
`;

export function PublicationActions() {
  return (
    <section className="publication-actions">
      <style>{css}</style>
      <Button>Publish</Button>
      <Button size="sm" radius="sm">
        Save draft
      </Button>
      <div className="publication-toolbar">
        <Button>Filter</Button>
      </div>
    </section>
  );
}
