import type { ActivationV1, ObserveEventV1, TaskOutcomeV1 } from "./contract.js";

type Expect<Value extends true> = Value;
type Rejects<Value, Target> = Value extends Target ? false : true;

export type ContractChecks = [
  Expect<Rejects<{ source: "browser-click"; modality: "keyboard" }, ActivationV1>>,
  Expect<Rejects<{ source: "browser-click"; task: "save"; outcome: "succeeded"; duration: null }, TaskOutcomeV1>>,
  Expect<Rejects<null, Extract<ObserveEventV1, { kind: "state.transitioned" }>["target"]["state"]>>,
  Expect<Rejects<"userId", keyof ObserveEventV1>>,
];
