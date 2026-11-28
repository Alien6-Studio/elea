import { Button, useToast } from "@alien6-studio/elea-ui";

async function exportArticles() {
  await fetch("/api/articles/export", { method: "POST" });
}

export function ExportButton() {
  const { toast } = useToast();

  async function run() {
    toast({ id: "export", title: "Preparing the export", duration: Infinity });
    await exportArticles();
    toast({ id: "export", tone: "success", title: "Export ready" });
  }

  return (
    <Button variant="secondary" onClick={run}>
      Export the articles
    </Button>
  );
}
