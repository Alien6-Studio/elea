import { useState } from "react";
import { Combobox, Field } from "@alien6-studio/elea-ui";

const collections = [
  { value: "field", label: "Field notes" },
  { value: "ice", label: "Glacier notebooks" },
  { value: "archive", label: "Glacier survey archive", disabled: true },
  { value: "marine", label: "Marine habitats" },
];

export function CollectionPicker() {
  const [collection, setCollection] = useState<string | null>(null);

  return (
    <Field label="Collection">
      {(control) => (
        <Combobox
          {...control}
          label="Collection"
          name="collection"
          options={collections}
          value={collection}
          onChange={setCollection}
          placeholder="Search collections…"
          emptyMessage="No matching collections"
        />
      )}
    </Field>
  );
}
