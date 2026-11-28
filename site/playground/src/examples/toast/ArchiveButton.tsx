import { Button, useToast } from "@alien6-studio/elea-ui";
import { ArchiveIcon } from "../icons";

export function ArchiveButton() {
  const { toast, dismiss } = useToast();

  function archive() {
    const id = toast({
      title: "Article moved to the archive",
      icon: <ArchiveIcon />,
      duration: Infinity,
      action: (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            dismiss(id);
            toast({ tone: "success", title: "Article restored" });
          }}
        >
          Undo
        </Button>
      ),
    });
  }

  return (
    <>
      <Button variant="secondary" onClick={archive}>
        Archive the article
      </Button>
      <Button variant="ghost" onClick={() => dismiss()}>
        Dismiss all
      </Button>
    </>
  );
}
