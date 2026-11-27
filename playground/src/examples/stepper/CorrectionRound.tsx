import { useState } from "react";
import { Stepper, type StepperStep } from "@alien6-studio/elea-ui";

const steps: StepperStep[] = [
  { id: "copy", label: "Copy" },
  {
    id: "images",
    label: "Images",
    badge: 2,
    badgeLabel: "2 points to fix",
    badgeTone: "danger",
  },
  { id: "credits", label: "Credits" },
  { id: "print", label: "Print" },
];

export function CorrectionRound() {
  const [current, setCurrent] = useState("images");

  return (
    <Stepper
      label="Correction round"
      steps={steps}
      current={current}
      onSelect={(step) => setCurrent(step.id)}
      indicator="solid"
      connector="dotted"
    />
  );
}
