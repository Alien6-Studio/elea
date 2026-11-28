import { useState } from "react";
import { Field, Select } from "@alien6-studio/elea-ui";

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch", disabled: true },
  { value: "es", label: "Español" },
];

export function PublicationLanguage() {
  const [language, setLanguage] = useState<string | null>(null);

  return (
    <Field
      label="Publication language"
      required
      help="Used for publication labels."
      error={language === null ? "Choose a language." : undefined}
    >
      {({ id, required, ...accessibility }) => (
        <Select
          id={id}
          triggerProps={{ ...accessibility, "aria-required": required }}
          value={language}
          onChange={setLanguage}
          placeholder="Pick a language"
          options={languages}
        />
      )}
    </Field>
  );
}
