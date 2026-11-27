import { useState, type SubmitEvent } from "react";
import { Button, RadioGroup } from "@alien6-studio/elea-ui";

const options = [
  {
    value: "daily",
    label: "Daily digest",
    description: "Receive a summary each morning.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "Receive one summary on Monday.",
  },
  { value: "instant", label: "Every update", disabled: true },
];

export function EmailDelivery() {
  const [saved, setSaved] = useState<string>();

  function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const delivery = new FormData(event.currentTarget).get("delivery");
    if (typeof delivery === "string") setSaved(delivery);
  }

  return (
    <form onSubmit={save}>
      <RadioGroup
        label="Email delivery"
        name="delivery"
        defaultValue="weekly"
        options={options}
      />
      <Button type="submit">Save preferences</Button>
      <output aria-live="polite">{saved && `Saved delivery: ${saved}`}</output>
    </form>
  );
}
