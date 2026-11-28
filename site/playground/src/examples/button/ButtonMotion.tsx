import { Button } from "@alien6-studio/elea-ui";

export function ButtonMotion() {
  return (
    <div data-elea-motion="on">
      <Button>Follows the page</Button>
      <Button motion={false}>Always still</Button>
    </div>
  );
}
