import { Demo, PropsTable } from "../components/Demo.js";
import { TerritoryPicker } from "../examples/multi-select/TerritoryPicker.js";
import territorySource from "../examples/multi-select/TerritoryPicker.tsx?raw";
import { SubjectTags } from "../examples/multi-select/SubjectTags.js";
import subjectSource from "../examples/multi-select/SubjectTags.tsx?raw";

export function MultiSelectPage() {
  return <>
    <h1>MultiSelect</h1>
    <p className="lead">Search a list and keep several choices as removable tags.</p>
    <Demo title="Distribution territories" description="Add territories individually or select a region in one action. Each selected territory contributes one value to the form." code={territorySource}>
      <div className="catalog-card-demo"><TerritoryPicker /></div>
    </Demo>
    <Demo title="Subject tags" description="Choose an existing subject or add your own with Enter. Press Backspace in the empty search field to remove the last editable tag." code={subjectSource}>
      <div className="catalog-card-demo"><SubjectTags /></div>
    </Demo>
    <h2>Props</h2>
    <PropsTable rows={[
      { name: "options, value, onChange", type: "MultiSelectOption[], string[], (value: string[]) => void", description: "Each option has a unique string value, a plain-text label and optional group and disabled fields. Pass the new array back to commit a change." },
      { name: "label, labels, placeholder", type: "string, MultiSelectLabels, string", description: "Supply the field name, empty-state message and remove action label. Add selectGroup to offer bulk selection in the unfiltered list." },
      { name: "creatable, max", type: "boolean, number", description: "Allow new values and optionally limit the selection count. Use labels.create for a localized creation action. A whole group must fit in the remaining space." },
      { name: "renderOption", type: "(option, { selected, disabled }) => ReactNode", description: "Customize a row’s visual content. The option label continues to name the row for assistive technology." },
      { name: "name, required, disabled", type: "string, boolean, boolean", description: "Submit each selected value under the same field name. A required field needs a committed value. Spread the Field control props to associate help and errors." },
    ]} />
  </>;
}
