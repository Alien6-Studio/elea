import { Button, IconButton } from "@alien6-studio/elea-ui";
import { PlusIcon } from "../icons";

export function ButtonSizes() {
  return (
    <>
      <Button size="xs">Extra small</Button>
      <Button size="sm" icon={<PlusIcon />}>
        Small
      </Button>
      <Button icon={<PlusIcon />}>Medium</Button>
      <Button size="lg" trailingIcon={<PlusIcon />}>
        Large
      </Button>
      <Button size="xl">Extra large</Button>
      <IconButton variant="disc" label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton variant="outline" radius="full" label="Add item">
        <PlusIcon />
      </IconButton>
    </>
  );
}
