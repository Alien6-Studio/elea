import { useState } from "react";
import { Select } from "@alien6-studio/elea-ui";

const week = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
];

export function DaysSelect() {
  const [days, setDays] = useState<string[]>(["mon", "wed"]);

  return (
    <>
      <Select
        multiple
        label="Days"
        value={days}
        onChange={setDays}
        placeholder="Pick days"
        summary={(values) => `${values.length} day(s)`}
        options={week}
      />
      <Select
        multiple
        label="Days, labels joined"
        value={days}
        onChange={setDays}
        placeholder="Pick days"
        options={week}
      />
      <p>Selected: {days.join(", ") || "none"}</p>
    </>
  );
}
