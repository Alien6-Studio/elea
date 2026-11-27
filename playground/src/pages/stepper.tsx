import { StepperSkeleton } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";
import { IssueWorkflow } from "../examples/stepper/IssueWorkflow.js";
import issueSource from "../examples/stepper/IssueWorkflow.tsx?raw";
import { ReviewSteps } from "../examples/stepper/ReviewSteps.js";
import reviewSource from "../examples/stepper/ReviewSteps.tsx?raw";
import loadingSource from "../examples/stepper/LoadingIssue.tsx?raw";

export function StepperPage() {
  return (
    <div className="stepper-guide">
      <h1>Stepper</h1>
      <p className="lead">Show where someone is in a sequence. Let them revisit a section or guide them through a task in order.</p>
      <Demo title="Free navigation" description="Open any section of the proof. Each badge counts its outstanding notes." code={reviewSource}>
        <ReviewSteps />
      </Demo>
      <Demo title="Linear workflow" description="Prepare an issue from details to proof. The final step replaces Next with the action that saves the draft." code={issueSource}>
        <IssueWorkflow />
      </Demo>
      <Demo title="Loading" description="Reserve space for the steps while the issue loads." code={loadingSource}>
        <div className="catalog-fill"><StepperSkeleton steps={3} /></div>
      </Demo>
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "Stepper", type: "label, steps, current, onSelect, orientation, linear", description: "Supply ordered steps with stable IDs. Store the selected step in the host and pass it back through current." },
        { name: "StepperStep", type: "id, label, description, badge, badgeLabel, disabled", description: "Describe each step and give a badge a spoken label when its value needs context." },
        { name: "StepperPanel", type: "steps, current, onSelect, previousLabel, nextLabel, finish", description: "Move to the previous or next enabled step. Supply the final action and manage its result in your application." },
        { name: "StepperSkeleton", type: "steps, orientation", description: "Match the step count and direction of the navigation being loaded." },
      ]} />
    </div>
  );
}
