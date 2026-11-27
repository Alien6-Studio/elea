import { useState } from "react";
import { Accordion } from "@alien6-studio/elea-ui";

const sections = [
  {
    value: "members",
    label: "Members",
    panel: "Five people write for this publication.",
  },
  {
    value: "billing",
    label: "Billing",
    panel: "The plan renews on the first of each month.",
  },
  {
    value: "archive",
    label: "Archive",
    panel: "Nothing is archived.",
    disabled: true,
  },
];

export function PublicationSettings() {
  const [open, setOpen] = useState(["members"]);

  return (
    <>
      <Accordion
        variant="contained"
        multiple
        value={open}
        onChange={setOpen}
        items={sections}
      />
      <p role="status">
        {open.length ? `Open: ${open.join(", ")}` : "Everything is closed"}
      </p>
    </>
  );
}
