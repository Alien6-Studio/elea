import type { ObserveCatalogV1, ObserveContextV1, ObserveEventKindV1, ObserveEventV1, ObserveTargetV1 } from "./contract.js";

const detailKeys = {
  "interaction.activated": ["source", "modality"],
  "focus.changed": ["source", "phase"],
  "exposure.qualified": ["source", "rule"],
  "state.transitioned": ["source", "fromState"],
  "task.outcome": ["source", "task", "outcome", "duration"],
} as const satisfies Record<ObserveEventKindV1, readonly string[]>;
const roles = new Set([
  "button", "link", "checkbox", "switch", "radio", "tab", "combobox", "textbox",
  "option", "dialog", "region", "status",
]);
const durations = new Set(["under-1s", "1-to-under-5s", "5-to-under-30s", "30s-or-more"]);

export function isEventKind(value: unknown): value is ObserveEventKindV1 {
  return typeof value === "string" && Object.hasOwn(detailKeys, value);
}

function code(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]{0,63}$/.test(value);
}

function optionalCode(value: unknown): value is string | null {
  return value === null || code(value);
}

function fields(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  const prototype: unknown = Object.getPrototypeOf(value);
  if ((prototype !== null && prototype !== Object.prototype) || Reflect.ownKeys(value).length !== keys.length) return null;
  const snapshot: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) return null;
    snapshot[key] = descriptor.value;
  }
  return snapshot;
}

function parseTarget(value: unknown): ObserveTargetV1 | null {
  const target = fields(value, ["surface", "component", "slot", "role", "state", "variant"]);
  if (!target || !code(target.surface) || !code(target.component) || !code(target.slot)
    || typeof target.role !== "string" || !roles.has(target.role)
    || !optionalCode(target.state) || !optionalCode(target.variant)) return null;
  return target as unknown as ObserveTargetV1;
}

function parseContext(value: unknown): ObserveContextV1 | null {
  const context = fields(value, ["theme", "appearance", "density", "experiment"]);
  if (!context || !optionalCode(context.theme) || !optionalCode(context.density)) return null;
  if (context.appearance !== null && context.appearance !== "light" && context.appearance !== "dark") return null;
  if (context.experiment !== null) {
    const experiment = fields(context.experiment, ["key", "revision", "arm"]);
    if (!experiment || !code(experiment.key) || !code(experiment.revision) || !code(experiment.arm)) return null;
    context.experiment = Object.freeze(experiment);
  }
  return context as unknown as ObserveContextV1;
}

function registrationKey(target: ObserveTargetV1, context: ObserveContextV1) {
  const { surface, component, slot, role, state, variant } = target;
  const { theme, appearance, density, experiment } = context;
  return JSON.stringify([surface, component, slot, role, state, variant, theme, appearance, density,
    experiment && [experiment.key, experiment.revision, experiment.arm]]);
}

function allowsDetail(kind: ObserveEventKindV1, state: string | null, detail: Record<string, unknown>, entry: {
  exposureRules: ReadonlySet<string>; fromStates: ReadonlySet<string>; tasks: ReadonlySet<string>;
}): boolean {
  switch (kind) {
    case "interaction.activated":
      return (detail.source === "browser-click" && (detail.modality === "pointer" || detail.modality === "unknown"))
        || (detail.source === "application-command"
          && (detail.modality === "pointer" || detail.modality === "keyboard" || detail.modality === "unknown"));
    case "focus.changed":
      return detail.source === "browser-focus" && (detail.phase === "entered" || detail.phase === "left");
    case "exposure.qualified":
      return detail.source === "viewport-intersection" && code(detail.rule) && entry.exposureRules.has(detail.rule);
    case "state.transitioned":
      return detail.source === "application-state" && state !== null && code(detail.fromState)
        && state !== detail.fromState && entry.fromStates.has(detail.fromState);
    case "task.outcome":
      return detail.source === "application-task" && code(detail.task) && entry.tasks.has(detail.task)
        && (detail.outcome === "succeeded" || detail.outcome === "failed" || detail.outcome === "cancelled")
        && (detail.duration === null || (typeof detail.duration === "string" && durations.has(detail.duration)));
  }
}

export function createEventValidator(catalog: ObserveCatalogV1): (value: unknown) => ObserveEventV1 | null {
  if (!code(catalog.revision)) throw new TypeError("Invalid Observe catalog revision");
  const rules = new Set<string>();
  for (const [key, rule] of Object.entries(catalog.exposureRules ?? {})) {
    if (!code(key) || !(rule.minimumIntersectionRatio > 0 && rule.minimumIntersectionRatio <= 1)
      || !Number.isSafeInteger(rule.minimumVisibleMs) || rule.minimumVisibleMs <= 0 || rule.minimumVisibleMs > 60_000) {
      throw new TypeError("Invalid Observe exposure rule");
    }
    rules.add(key);
  }
  const index = new Map(catalog.entries.map(entry => {
    const target = parseTarget(entry.target);
    const context = parseContext(entry.context);
    if (!target || !context || !entry.kinds.every(isEventKind)
      || !(entry.exposureRules ?? []).every(rule => rules.has(rule))
      || !(entry.fromStates ?? []).every(code) || !(entry.tasks ?? []).every(code)) {
      throw new TypeError("Invalid Observe catalog entry");
    }
    return [registrationKey(target, context), {
      kinds: new Set(entry.kinds),
      exposureRules: new Set(entry.exposureRules),
      fromStates: new Set(entry.fromStates),
      tasks: new Set(entry.tasks),
    }] as const;
  }));
  if (index.size !== catalog.entries.length) throw new TypeError("Duplicate Observe catalog entry");

  return value => {
    try {
      const event = fields(value, ["schemaVersion", "kind", "target", "context", "detail"]);
      if (!event || event.schemaVersion !== 1 || !isEventKind(event.kind)) return null;
      const { kind } = event;
      const target = parseTarget(event.target);
      const context = parseContext(event.context);
      if (!target || !context) return null;
      const entry = index.get(registrationKey(target, context));
      if (!entry?.kinds.has(kind)) return null;
      const detail = fields(event.detail, detailKeys[kind]);
      if (!detail || !allowsDetail(kind, target.state, detail, entry)) return null;
      return Object.freeze({
        schemaVersion: 1, kind, target: Object.freeze(target), context: Object.freeze(context), detail: Object.freeze(detail),
      }) as unknown as ObserveEventV1;
    } catch {
      return null;
    }
  };
}
