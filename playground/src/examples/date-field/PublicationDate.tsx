import { useState } from "react";
import { DateField, Field } from "@alien6-studio/elea-ui";

const labels = {
  day: "Day",
  month: "Month",
  year: "Year",
  openCalendar: "Open calendar",
  previousMonth: "Previous month",
  nextMonth: "Next month",
};

export function PublicationDate() {
  const [date, setDate] = useState<string | null>("2028-02-28");

  return (
    <>
      <Field label="Publication date" help="20 February to 10 March 2028">
        {(control) => (
          <DateField
            {...control}
            name="publishedOn"
            label="Publication date"
            locale="en-GB"
            labels={labels}
            min="2028-02-20"
            max="2028-03-10"
            value={date}
            onChange={setDate}
          />
        )}
      </Field>
      <output aria-label="ISO date">{date ?? "No date selected"}</output>
    </>
  );
}
