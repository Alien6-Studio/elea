import { useState } from "react";
import {
  Button,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@alien6-studio/elea-ui";

export function MoreActions() {
  const [last, setLast] = useState("nothing yet");

  return (
    <>
      <MenuRoot>
        <MenuTrigger>
          {(props) => (
            <Button variant="outline" {...props}>
              More
            </Button>
          )}
        </MenuTrigger>
        <MenuContent label="More actions">
          <MenuItem onSelect={() => setLast("rename")}>Rename</MenuItem>
          <MenuItem onSelect={() => setLast("duplicate")}>Duplicate</MenuItem>
          <MenuSeparator />
          <MenuGroup label="Share">
            <MenuItem onSelect={() => setLast("copy link")}>Copy link</MenuItem>
            <MenuItem onSelect={() => setLast("send by mail")} disabled>
              Send by mail
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem onSelect={() => setLast("delete")} danger>
            Delete
          </MenuItem>
        </MenuContent>
      </MenuRoot>
      <p>Last action: {last}</p>
    </>
  );
}
