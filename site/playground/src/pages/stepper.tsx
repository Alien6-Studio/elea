import { StepperSkeleton } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";
import { IssueWorkflow } from "../examples/stepper/IssueWorkflow.js";
import issueSource from "../examples/stepper/IssueWorkflow.tsx?raw";
import { ReviewSteps } from "../examples/stepper/ReviewSteps.js";
import reviewSource from "../examples/stepper/ReviewSteps.tsx?raw";
import loadingSource from "../examples/stepper/LoadingIssue.tsx?raw";
import { CorrectionRound } from "../examples/stepper/CorrectionRound.js";
import correctionSource from "../examples/stepper/CorrectionRound.tsx?raw";

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
      <Demo title="Drawing options" description="Fill the markers and dot the line towards the steps still to come. A badge takes a tone: here the two points to fix on the images." code={correctionSource}>
        <div className="catalog-fill"><CorrectionRound /></div>
      </Demo>
      <Demo title="Loading" description="Reserve space for the steps while the issue loads." code={loadingSource}>
        <div className="catalog-fill"><StepperSkeleton steps={3} /></div>
      </Demo>
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "Stepper", type: "label, steps, current, onSelect, orientation, linear, indicator, connector", description: "Supply ordered steps with stable IDs. Store the selected step in the host and pass it back through current. indicator=\"solid\" fills the markers and connector=\"dotted\" dots the line towards steps not yet completed." },
        { name: "StepperStep", type: "id, label, description, badge, badgeLabel, badgeTone, disabled", description: "Describe each step and give a badge a spoken label when its value needs context. badgeTone colours the badge; the label still carries the meaning." },
        { name: "StepperPanel", type: "steps, current, onSelect, previousLabel, nextLabel, finish", description: "Move to the previous or next enabled step. Supply the final action and manage its result in your application." },
        { name: "StepperSkeleton", type: "steps, orientation", description: "Match the step count and direction of the navigation being loaded." },
      ]} />
    </div>
  );
}
