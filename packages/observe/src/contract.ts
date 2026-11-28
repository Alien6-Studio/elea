/**
 * Alien6 Observe v1 wire contract.
 * String codes must come from a reviewed deployment catalog and pass runtime
 * validation. The TypeScript declarations alone do not validate a payload.
 */

export type SemanticRoleV1 =
  | "button" | "link" | "checkbox" | "switch" | "radio" | "tab"
  | "combobox" | "textbox" | "option" | "dialog" | "region" | "status";

export interface ObserveTargetV1 {
  readonly surface: string;
  readonly component: string;
  readonly slot: string;
  readonly role: SemanticRoleV1;
  readonly state: string | null;
  readonly variant: string | null;
}

export interface ExperimentContextV1 {
  readonly key: string;
  readonly revision: string;
  readonly arm: string;
}

export interface ObserveContextV1 {
  readonly theme: string | null;
  readonly appearance: "light" | "dark" | null;
  readonly density: string | null;
  readonly experiment: ExperimentContextV1 | null;
}

export type ActivationV1 =
  | Readonly<{ source: "browser-click"; modality: "pointer" | "unknown" }>
  | Readonly<{ source: "application-command"; modality: "pointer" | "keyboard" | "unknown" }>;

export interface FocusChangeV1 {
  readonly source: "browser-focus";
  readonly phase: "entered" | "left";
}

export interface ExposureV1 {
  readonly source: "viewport-intersection";
  readonly rule: string;
}

/** A catalog entry for the implicit viewport root, using CSS geometry. */
export interface ExposureRuleV1 {
  readonly minimumIntersectionRatio: number;
  readonly minimumVisibleMs: number;
}

export interface StateTransitionV1 {
  readonly source: "application-state";
  readonly fromState: string;
  // The destination is the committed target.state.
}

export interface TaskOutcomeV1 {
  readonly source: "application-task";
  readonly task: string;
  readonly outcome: "succeeded" | "failed" | "cancelled";
  readonly duration: "under-1s" | "1-to-under-5s" | "5-to-under-30s" | "30s-or-more" | null;
}

interface EventDetailsV1 {
  readonly "interaction.activated": ActivationV1;
  readonly "focus.changed": FocusChangeV1;
  readonly "exposure.qualified": ExposureV1;
  readonly "state.transitioned": StateTransitionV1;
  readonly "task.outcome": TaskOutcomeV1;
}

export type ObserveEventKindV1 = keyof EventDetailsV1;

export type ObserveEventV1 = {
  [Kind in ObserveEventKindV1]: Readonly<{
    schemaVersion: 1;
    kind: Kind;
    target: ObserveTargetV1 &
      (Kind extends "state.transitioned" ? Readonly<{ state: string }> : unknown);
    context: ObserveContextV1;
    detail: EventDetailsV1[Kind];
  }>;
}[ObserveEventKindV1];

export interface ObserveBatchV1 {
  /** Revision of the agreed code catalog, including exposure rules. */
  readonly catalogRevision: string;
  readonly events: readonly ObserveEventV1[];
}

/** A host policy decision scoped to a configured purpose. Never serialized. */
export interface CollectionGrantV1 {
  readonly purpose: string;
  readonly destination: "memory" | "export";
  readonly kinds: readonly ObserveEventKindV1[];
}

export interface ObserveControlV1 {
  /** A replacement stops the current grant and discards its pending data. */
  setGrant(grant: CollectionGrantV1 | null): void;
  /** Terminal for this instance. */
  dispose(): void;
}

export interface CatalogEntryV1 {
  readonly target: ObserveTargetV1;
  readonly context: ObserveContextV1;
  readonly kinds: readonly ObserveEventKindV1[];
  readonly exposureRules?: readonly string[];
  readonly fromStates?: readonly string[];
  readonly tasks?: readonly string[];
}

export interface ObserveCatalogV1 {
  readonly revision: string;
  readonly entries: readonly CatalogEntryV1[];
  readonly exposureRules?: Readonly<Record<string, ExposureRuleV1>>;
}

export type ObserveRecorderV1 = (event: ObserveEventV1) => void;

export interface ObserveCollectorV1 {
  /** The recorder is scoped to one active grant. The return value detaches collection. */
  attach(kinds: readonly ObserveEventKindV1[], record: ObserveRecorderV1): () => void;
}

/** Applied after validation. Filters can drop a record or pass it through unchanged. */
export type ObserveFilterV1 = (event: ObserveEventV1) => boolean;

export interface ObserveSinkV1<Cancellation> {
  /** Cancellation is supplied by the runtime, for example an AbortSignal in the browser. */
  write(batch: ObserveBatchV1, cancellation: Cancellation): Promise<void>;
}
