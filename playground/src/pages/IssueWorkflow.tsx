import { useState } from "react";
import { Button, Field, Input, Select, Stepper, StepperPanel, type StepperStep } from "@alien6-studio/elea-ui";

const steps = [
  { id: "details", label: "Details", description: "Name the issue" },
  { id: "audience", label: "Audience", description: "Choose its readers" },
  { id: "proof", label: "Proof", description: "Check the draft" },
];
const audiences = [
  { value: "members", label: "Members" },
  { value: "everyone", label: "Everyone" },
];

export function IssueWorkflow() {
  const [current, setCurrent] = useState("details");
  const [title, setTitle] = useState("The harbour issue");
  const [audience, setAudience] = useState("members");
  const [saved, setSaved] = useState(false);
  const issueTitle = title.trim() || "Untitled issue";
  const readers = audiences.find(option => option.value === audience)!.label;

  function select(step: StepperStep) {
    setCurrent(step.id);
    setSaved(false);
  }

  return (
    <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))", gap: "var(--elea-space-6)" }}>
      <Stepper label="Issue preparation" steps={steps} current={current} onSelect={select} orientation="vertical" linear />
      <div style={{ display: "grid", gap: "var(--elea-space-4)", alignContent: "start" }}>
        {current === "details" && <Field label="Issue title">
          {control => <Input {...control} value={title} onChange={event => setTitle(event.currentTarget.value)} />}
        </Field>}
        {current === "audience" && <Select label="Readers" value={audience} options={audiences} onChange={setAudience} />}
        {current === "proof" && <section aria-label="Issue proof">
          <h3>{issueTitle}</h3>
          <p>Audience · {readers}</p>
        </section>}
        <StepperPanel steps={steps} current={current} onSelect={select}
          previousLabel="Previous" nextLabel="Next"
          finish={<Button onClick={() => setSaved(true)}>Save draft</Button>} />
        <output>{saved && `Draft saved for ${readers.toLowerCase()}.`}</output>
      </div>
    </div>
  );
}
