import type {
  ObserveBatchV1, ObserveContextV1, ObserveEventV1, ObserveTargetV1,
} from "../../../packages/observe/src/contract.js";

const context = {
  theme: "editorial",
  appearance: "light",
  density: "comfortable",
  experiment: { key: "save-placement", revision: "1", arm: "toolbar" },
} satisfies ObserveContextV1;

const saveControl = {
  surface: "document-editor",
  component: "button",
  slot: "document.save",
  role: "button",
  state: "ready",
  variant: "solid",
} satisfies ObserveTargetV1;

const saveStatus = {
  surface: "document-editor",
  component: "save-status",
  slot: "document.save-status",
  role: "status",
  state: "saving",
  variant: null,
} satisfies ObserveTargetV1;

const precedingEvents = [
  {
    schemaVersion: 1, kind: "exposure.qualified", target: saveControl, context,
    detail: { source: "viewport-intersection", rule: "viewport-half-1s" },
  },
  {
    schemaVersion: 1, kind: "focus.changed", target: saveControl, context,
    detail: { source: "browser-focus", phase: "entered" },
  },
  {
    schemaVersion: 1, kind: "interaction.activated", target: saveControl, context,
    detail: { source: "browser-click", modality: "unknown" },
  },
  {
    schemaVersion: 1, kind: "state.transitioned", target: saveStatus, context,
    detail: { source: "application-state", fromState: "ready" },
  },
] as const satisfies readonly ObserveEventV1[];

export const saveAttempts = {
  confirmed: {
    catalogRevision: "save-example-1",
    events: [
      ...precedingEvents,
      {
        schemaVersion: 1, kind: "task.outcome", target: { ...saveStatus, state: "saved" }, context,
        detail: { source: "application-task", task: "save-document", outcome: "succeeded", duration: "1-to-under-5s" },
      },
    ],
  },
  unresolved: { catalogRevision: "save-example-1", events: precedingEvents },
} as const satisfies Record<string, ObserveBatchV1>;
