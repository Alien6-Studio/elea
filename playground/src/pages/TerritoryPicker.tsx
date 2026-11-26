import { useState } from "react";
import { Field, MultiSelect } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-ui/bundle.css";

const territories = [
  { value: "dk", label: "Denmark", group: "Nordic" },
  { value: "is", label: "Iceland", group: "Nordic" },
  { value: "no", label: "Norway", group: "Nordic" },
  { value: "ee", label: "Estonia", group: "Baltic" },
  { value: "lv", label: "Latvia", group: "Baltic", disabled: true },
];

export function TerritoryPicker() {
  const [territory, setTerritory] = useState<string[]>(["is"]);
  return <Field label="Territories" help="Choose up to three territories.">
    {control => <MultiSelect {...control} label="Territories" name="territory"
      options={territories} value={territory} onChange={setTerritory} max={3}
      placeholder="Search territories…"
      labels={{ empty: "No matching territories", remove: label => `Remove ${label}`,
        selectGroup: group => `Select all ${group} territories` }}
      renderOption={option => <>{option.label} <small>({option.value.toUpperCase()})</small></>} />}
  </Field>;
}
