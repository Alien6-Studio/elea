import { useState } from "react";
import { DateField, Field } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";

const labels = {
  day: "Day", month: "Month", year: "Year", openCalendar: "Open calendar",
  previousMonth: "Previous month", nextMonth: "Next month",
};

const source = `import { useState } from "react";
import { DateField, Field } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-ui/bundle.css";

const labels = {
  day: "Day", month: "Month", year: "Year", openCalendar: "Open calendar",
  previousMonth: "Previous month", nextMonth: "Next month",
};

export function PublicationDate() {
  const [date, setDate] = useState<string | null>("2028-02-28");
  return (
    <Field label="Publication date" help="20 February to 10 March 2028">
      {control => (
        <DateField {...control} name="publishedOn" label="Publication date"
          locale="en-GB" labels={labels} min="2028-02-20" max="2028-03-10"
          value={date} onChange={setDate} />
      )}
    </Field>
  );
}`;

export function DateFieldPage() {
  const [date, setDate] = useState<string | null>("2028-02-28");
  return (
    <>
      <h1>DateField</h1>
      <p className="lead">Type a date in local order or choose a day from the calendar. Both methods produce the same ISO date.</p>
      <Demo title="Schedule a publication" code={source}>
        <div className="catalog-stack catalog-card-demo">
          <Field label="Publication date" help="20 February to 10 March 2028">
            {control => (
              <DateField {...control} name="publishedOn" label="Publication date"
                locale="en-GB" labels={labels} min="2028-02-20" max="2028-03-10"
                value={date} onChange={setDate} />
            )}
          </Field>
          <output aria-label="ISO date">{date ?? "No date selected"}</output>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "value, onChange", type: "string | null, (date: string | null) => void", description: "A Gregorian date in YYYY-MM-DD form. Clearing a segment, entering an impossible date or leaving the allowed range clears the selection." },
        { name: "locale, labels, label", type: "string, DateFieldLabels, string", description: "The locale sets segment order, separators, digits and calendar names. Supply translated segment and button labels, plus an accessible name for the field group." },
        { name: "min, max", type: "string", description: "Inclusive ISO date limits shared by typing and the calendar." },
        { name: "weekStartsOn", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", description: "Calendar’s first weekday, starting with Sunday at zero.", defaultValue: "1" },
        { name: "name, required, disabled", type: "string, boolean, boolean", description: "Supply a name to submit the ISO date. Required and disabled follow native form behaviour." },
      ]} />
    </>
  );
}
