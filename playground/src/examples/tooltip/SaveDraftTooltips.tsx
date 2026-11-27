import { Button, IconButton, Tooltip } from "@alien6-studio/elea-ui";

export function SaveDraftTooltips() {
  return (
    <>
      <Tooltip content="Saves a draft without publishing">
        <Button variant="outline">Save draft</Button>
      </Tooltip>
      <Tooltip content="Shown below" placement="bottom">
        <IconButton label="Help">?</IconButton>
      </Tooltip>
    </>
  );
}
