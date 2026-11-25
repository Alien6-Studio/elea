import { useState } from "react";
import { brandPalettes, type BrandTheme } from "@alien6-studio/elea-tokens/brand";
import { Button, Calendar, ColorPicker, Combobox, Field } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";

export const monthLabels = { previousMonth: "Previous month", nextMonth: "Next month" };
export const collections = [
  { value: "field", label: "Field notes" },
  { value: "flora", label: "Flora and fauna" },
  { value: "ice", label: "Glacier notebooks" },
  { value: "archive", label: "Glacier survey archive", disabled: true },
  { value: "marine", label: "Marine habitats" },
  { value: "polar", label: "Polar expeditions" },
];

export function CalendarPage() {
  const [date, setDate] = useState<string | null>(null);
  return (
    <>
      <h1>Calendar</h1>
      <p className="lead">Choose a day in a monthly grid. The application receives a calendar date that stays the same across time zones.</p>
      <Demo title="Schedule a publication" description="Choose a date between 20 February and 10 March 2028." code={`const [date, setDate] = useState<string | null>(null);

<Calendar
  label="Publication date"
  labels={{ previousMonth: "Previous month", nextMonth: "Next month" }}
  locale="en-GB" defaultMonth="2028-02"
  min="2028-02-20" max="2028-03-10"
  value={date} onChange={setDate}
/>`}>
        <div className="catalog-stack catalog-card-demo">
          <Calendar label="Publication date" labels={monthLabels} locale="en-GB" defaultMonth="2028-02"
            min="2028-02-20" max="2028-03-10" value={date} onChange={setDate} />
          <div className="catalog-row">
            <output>{date ?? "No date selected"}</output>
            <Button variant="ghost" size="sm" disabled={date === null} onClick={() => setDate(null)}>Clear date</Button>
          </div>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "value, onChange", type: "string | null, (date: string) => void", description: "Selected Gregorian date in YYYY-MM-DD format and its change handler." },
        { name: "label, labels", type: "string, { previousMonth, nextMonth }", description: "Accessible names for the calendar and both month controls." },
        { name: "locale", type: "string", description: "Language used to format month and weekday names." },
        { name: "defaultMonth", type: "string", description: "Initial YYYY-MM when there is no selection." },
        { name: "min, max", type: "string", description: "First and last selectable dates, inclusive." },
        { name: "weekStartsOn", type: "0 through 6", defaultValue: "1", description: "First weekday. Sunday is 0." },
      ]} />
    </>
  );
}

export function ComboboxPage() {
  const [collection, setCollection] = useState<string | null>(null);
  return (
    <>
      <h1>Combobox</h1>
      <p className="lead">Filter a list by typing, then choose a match. The form stores the selected option’s value.</p>
      <Demo title="Choose a collection" description="Try “glacier” to find the current and archived collections." code={`const [collection, setCollection] = useState<string | null>(null);
const options = [
  { value: "ice", label: "Glacier notebooks" },
  { value: "archive", label: "Glacier survey archive", disabled: true },
];

<Field label="Collection">
  {control => <Combobox {...control} label="Collection" name="collection"
    options={options} value={collection} onChange={setCollection}
    placeholder="Search collections…" emptyMessage="No matching collections" />}
</Field>`}>
        <div className="catalog-card-demo">
          <Field label="Collection">{control => <Combobox {...control} label="Collection" name="collection"
            options={collections} value={collection} onChange={setCollection}
            placeholder="Search collections…" emptyMessage="No matching collections" />}</Field>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "value, onChange", type: "string | null, (value: string) => void", description: "Controlled selection and the callback for a confirmed choice." },
        { name: "options", type: "readonly ComboboxOption[]", description: "Each option has a string value, a searchable label and optional disabled state." },
        { name: "label, emptyMessage", type: "string", description: "Accessible control name and the message shown when a search has no matches." },
        { name: "placeholder", type: "string", defaultValue: "label", description: "Hint shown while the field is empty. Pass a localized search prompt." },
        { name: "name", type: "string", description: "Form field name for the selected value." },
        { name: "disabled", type: "boolean", description: "Disable input and selection." },
      ]} />
    </>
  );
}

export function ColorPickerPage({ brand }: { brand?: BrandTheme }) {
  const [ink, setInk] = useState<string>(brand?.seed ?? brandPalettes.Emerald.seed);
  return (
    <>
      <h1>ColorPicker</h1>
      <p className="lead">Choose a colour from the system picker or enter an exact hex value.</p>
      <Demo title="Cover ink" code={`const [ink, setInk] = useState<string>(brandPalettes.Emerald.seed);

<ColorPicker label="Ink colour" hexLabel="Ink hex" value={ink} onChange={setInk}
  invalidMessage="Enter a six-digit hex colour." />`}>
        <div className="catalog-card-demo">
          <ColorPicker label="Ink colour" hexLabel="Ink hex" value={ink} onChange={setInk}
            invalidMessage="Enter a six-digit hex colour." />
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "value, onChange", type: "string, (hex: string) => void", description: "Controlled sRGB colour. A confirmed edit returns six lowercase hex digits prefixed with #." },
        { name: "label, hexLabel", type: "string", description: "Names for the colour swatch and its text input." },
        { name: "invalidMessage", type: "string", description: "Feedback for an incomplete or invalid hex value." },
        { name: "disabled", type: "boolean", description: "Disable both inputs." },
      ]} />
    </>
  );
}
