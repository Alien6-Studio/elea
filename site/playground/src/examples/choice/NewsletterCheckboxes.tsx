import { useState } from "react";
import { Checkbox } from "@alien6-studio/elea-ui";

export function NewsletterCheckboxes() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Checkbox
        label="Send me the newsletter"
        description="Once a month, no more"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Checkbox label="Partially selected" indeterminate readOnly />
      <Checkbox label="Disabled" disabled />
    </>
  );
}
