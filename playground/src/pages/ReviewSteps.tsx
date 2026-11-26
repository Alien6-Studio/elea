import { useState } from "react";
import { Stepper } from "@alien6-studio/elea-ui";

const sections = [
  { id: "copy", label: "Copy", notes: ["Check the harbour name in the opening paragraph.", "Expand the initials in the byline."] },
  { id: "images", label: "Images", notes: ["Confirm the credit for the cover photograph."] },
  { id: "credits", label: "Credits", notes: [] },
];

export const reviewSteps = sections.map(section => ({
  id: section.id,
  label: section.label,
  badge: section.notes.length,
  badgeLabel: `${section.notes.length} open ${section.notes.length === 1 ? "note" : "notes"}`,
}));

export function ReviewSteps() {
  const [current, setCurrent] = useState("images");
  const section = sections.find(item => item.id === current)!;

  return (
    <div style={{ width: "100%" }}>
      <Stepper label="Proof sections" steps={reviewSteps} current={current} onSelect={step => setCurrent(step.id)} />
      <section aria-label="Proof notes">
        <h3>{section.label}</h3>
        {section.notes.length
          ? <ul>{section.notes.map(note => <li key={note}>{note}</li>)}</ul>
          : <p>All credits have been checked.</p>}
      </section>
    </div>
  );
}
