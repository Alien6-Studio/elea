import { useState } from "react";
import { Button, Calendar } from "@alien6-studio/elea-ui";

const labels = { previousMonth: "Previous month", nextMonth: "Next month" };

export function PublicationCalendar() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <>
      <Calendar
        label="Publication date"
        labels={labels}
        locale="en-GB"
        defaultMonth="2028-02"
        min="2028-02-20"
        max="2028-03-10"
        value={date}
        onChange={setDate}
      />
      <output>{date ?? "No date selected"}</output>
      <Button
        variant="ghost"
        size="sm"
        disabled={date === null}
        onClick={() => setDate(null)}
      >
        Clear date
      </Button>
    </>
  );
}
