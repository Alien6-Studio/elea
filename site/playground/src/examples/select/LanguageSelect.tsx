import { useState } from "react";
import { Select } from "@alien6-studio/elea-ui";

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch", disabled: true },
  { value: "es", label: "Español" },
];

export function LanguageSelect() {
  const [language, setLanguage] = useState<string | null>("fr");

  return (
    <>
      <Select
        label="Language"
        value={language}
        onChange={setLanguage}
        placeholder="Pick a language"
        options={languages}
      />
      <Select
        size="sm"
        label="Language, small"
        value={language}
        onChange={setLanguage}
        options={languages}
      />
      <Select
        label="Disabled"
        value="fr"
        onChange={() => {}}
        options={languages}
        disabled
      />
      <p>Selected: {language ?? "none"}</p>
    </>
  );
}
