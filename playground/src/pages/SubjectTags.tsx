import { useState } from "react";
import { Field, MultiSelect } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-ui/bundle.css";

const subjects = [
  { value: "landscape", label: "Landscape" },
  { value: "architecture", label: "Architecture" },
  { value: "portraiture", label: "Portraiture" },
];

export function SubjectTags() {
  const [tags, setTags] = useState<string[]>([]);
  return <Field label="Subjects" help="Choose a subject or type a new one.">
    {control => <MultiSelect {...control} label="Subjects" name="subject"
      options={subjects} value={tags} onChange={setTags} creatable
      placeholder="Find or add a subject…"
      labels={{ empty: "No matching subjects", remove: label => `Remove ${label}`,
        create: text => `Add “${text}”` }} />}
  </Field>;
}
