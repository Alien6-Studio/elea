import assert from "node:assert/strict";
import { test } from "node:test";
import { createEventValidator, createLocalObserve, type CollectionGrantV1, type ObserveCatalogV1, type ObserveCollectorV1, type ObserveEventV1, type ObserveRecorderV1 } from "./index.js";

const context = {
  theme: "editorial", density: "standard", appearance: "light",
  experiment: { key: "save-placement", revision: "1", arm: "toolbar" },
} as const;
const target = { surface: "document", component: "button", slot: "save", role: "button", state: "ready", variant: null } as const;
const activated = {
  schemaVersion: 1, kind: "interaction.activated", target, context,
  detail: { source: "browser-click", modality: "pointer" },
} as const satisfies ObserveEventV1;

const catalog: ObserveCatalogV1 = {
  revision: "document-1",
  exposureRules: { "visible-half": { minimumIntersectionRatio: 0.5, minimumVisibleMs: 200 } },
  entries: [
    { target, context, kinds: ["interaction.activated", "focus.changed", "exposure.qualified"], exposureRules: ["visible-half"] },
    { target: { ...target, state: "saved" }, context, kinds: ["state.transitioned", "task.outcome"],
      tasks: ["save-document"], fromStates: ["ready"] },
  ],
};
const grant: CollectionGrantV1 = {
  destination: "memory", purpose: "demo",
  kinds: ["interaction.activated", "focus.changed", "exposure.qualified", "state.transitioned", "task.outcome"],
};

test("validates each event type and takes a deeply immutable snapshot of the approved wire fields", () => {
  const validate = createEventValidator(catalog);
  const destination = { ...target, state: "saved" };
  const events = [
    activated,
    { ...activated, kind: "focus.changed", detail: { source: "browser-focus", phase: "left" } },
    { ...activated, kind: "exposure.qualified", detail: { source: "viewport-intersection", rule: "visible-half" } },
    { ...activated, kind: "state.transitioned", target: destination,
      detail: { source: "application-state", fromState: "ready" } },
    { ...activated, kind: "task.outcome", target: destination,
      detail: { source: "application-task", task: "save-document", outcome: "succeeded", duration: null } },
  ] satisfies ObserveEventV1[];
  for (const event of events) {
    const snapshot = validate(event)!;
    assert.deepEqual(snapshot, event);
    assert.notEqual(snapshot, event);
    for (const object of [snapshot, snapshot.target, snapshot.context, snapshot.context.experiment, snapshot.detail]) {
      assert.ok(Object.isFrozen(object));
    }
  }
});

test("rejects unexpected fields, unregistered tuples, invalid provenance and forged outcomes", () => {
  const validate = createEventValidator(catalog);
  let accessed = false;
  const privateGetter = Object.defineProperty({ ...activated }, "target", {
    enumerable: true, get: () => { accessed = true; return target; },
  });
  const destination = { ...target, state: "saved" };
  for (const input of [
    null, {}, privateGetter, Object.create(activated),
    { ...activated, schemaVersion: 2 },
    { ...activated, userId: "test@example.invalid" },
    { ...activated, target: { ...target, label: "Journal" } },
    { ...activated, target: { ...target, slot: "not-in-catalog" } },
    { ...activated, context: { ...context, experiment: { ...context.experiment, arm: "unregistered" } } },
    { ...activated, detail: { ...activated.detail, x: 100, y: 150 } },
    { ...activated, detail: { ...activated.detail, modality: "keyboard" } },
    { ...activated, kind: "focus.changed", detail: { source: "browser-focus", phase: "unknown" } },
    { ...activated, kind: "exposure.qualified", detail: { source: "viewport-intersection", rule: "unregistered" } },
    { ...activated, kind: "state.transitioned", target: destination,
      detail: { source: "application-state", fromState: "saved" } },
    { ...activated, kind: "task.outcome", target: destination,
      detail: { source: "browser-click", task: "save-document", outcome: "succeeded", duration: null } },
    { ...activated, kind: "task.outcome", target: destination,
      detail: { source: "application-task", task: "save-document", outcome: "unresolved", duration: null } },
  ]) {
    assert.equal(validate(input), null);
  }
  assert.equal(accessed, false);
});

test("collects only under a memory grant, bounds the display and clears old generations", () => {
  let attaches = 0;
  let removals = 0;
  let now = 100;
  const recorders: ObserveRecorderV1[] = [];
  const collector: ObserveCollectorV1 = {
    attach(kinds, record) {
      assert.deepEqual(kinds, grant.kinds);
      attaches++;
      recorders.push(record);
      return () => { removals++; };
    },
  };
  const observe = createLocalObserve({ catalog, purpose: "demo", capacity: 2, now: () => now, collectors: [collector] });
  assert.equal(observe.active, false);
  assert.equal(observe.record(activated), false);
  assert.deepEqual(observe.snapshot(), []);
  observe.setGrant({ ...grant, destination: "export" });
  observe.setGrant({ ...grant, purpose: "other" });
  assert.equal(attaches, 0);
  observe.setGrant(grant);
  assert.equal(attaches, 1);
  assert.equal(observe.record(activated), true);
  now += 17;
  recorders[0]!(activated);
  now += 75;
  recorders[0]!(activated);
  assert.deepEqual(observe.snapshot().map(({ index, elapsedMs }) => [index, elapsedMs]), [[2, 10], [3, 90]]);
  const displayed = observe.snapshot();
  observe.setGrant(null);
  assert.equal(removals, 1);
  assert.deepEqual(observe.snapshot(), []);
  assert.equal(displayed.length, 2);
  observe.setGrant(grant);
  recorders[0]!(activated);
  assert.deepEqual(observe.snapshot(), []);
  recorders[1]!(activated);
  assert.equal(observe.snapshot()[0]?.index, 1);
  observe.dispose();
  observe.dispose();
  observe.setGrant(grant);
  assert.equal(attaches, 2);
  assert.equal(removals, 2);
  assert.equal(observe.active, false);
  assert.deepEqual(observe.snapshot(), []);
});

test("filters immutable records before subscribers and limits collection by event kind", () => {
  const filtered = createLocalObserve({
    catalog, purpose: "demo", capacity: 1,
    filters: [event => event.kind === "interaction.activated" && event.detail.modality === "pointer"],
  });
  filtered.setGrant({ ...grant, kinds: ["interaction.activated"] });
  let notifications = 0;
  const stop = filtered.subscribe(() => { notifications++; });
  assert.equal(filtered.record({ ...activated, kind: "focus.changed", detail: { source: "browser-focus", phase: "entered" } }), false);
  assert.equal(filtered.record({ ...activated, detail: { source: "browser-click", modality: "unknown" } }), false);
  assert.equal(filtered.record({ ...activated, token: "example" }), false);
  assert.equal(notifications, 0);
  assert.equal(filtered.record(activated), true);
  assert.equal(filtered.record(activated), true);
  assert.equal(filtered.snapshot().length, 1);
  assert.equal(notifications, 2);
  stop();
  filtered.record(activated);
  assert.equal(notifications, 2);
});

test("fails closed on filter errors and cleans up after a collector attachment error", () => {
  const reject = createLocalObserve({ catalog, purpose: "demo", filters: [() => { throw new Error("test filter"); }] });
  reject.setGrant(grant);
  assert.equal(reject.record(activated), false);
  let cleaned = false;
  const observe = createLocalObserve({
    catalog, purpose: "demo",
    collectors: [
      { attach: () => () => { cleaned = true; } },
      { attach: () => { throw new Error("test collector"); } },
    ],
  });
  observe.setGrant(grant);
  assert.equal(cleaned, true);
  assert.equal(observe.active, false);
  assert.deepEqual(observe.snapshot(), []);
});
