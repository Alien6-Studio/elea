import { Button, useToast } from "@alien6-studio/elea-ui";
import { CheckIcon } from "../icons";

export function PublishButton() {
  const { toast } = useToast();

  return (
    <Button
      variant="success"
      icon={<CheckIcon />}
      onClick={() =>
        toast({
          tone: "success",
          title: "Article published",
          description: "It is now visible to everyone.",
          icon: <CheckIcon />,
        })
      }
    >
      Publish
    </Button>
  );
}
