import type { LocalObservation, ObserveCatalogV1, ObserveContextV1, ObserveEventKindV1, ObserveEventV1, ObserveTargetV1 } from "@alien6-studio/observe";

export const tools = [
  { key: "preview", label: "Preview", role: "button" },
  { key: "layout", label: "Change layout", role: "button" },
  { key: "save", label: "Save example", role: "button" },
  { key: "reset", label: "Reset", role: "button" },
] as const;

export type ToolKey = typeof tools[number]["key"];

export const signals = [
  { kind: "interaction.activated", label: "Activation" },
  { kind: "focus.changed", label: "Focus" },
  { kind: "exposure.qualified", label: "Exposure" },
  { kind: "state.transitioned", label: "State change" },
  { kind: "task.outcome", label: "Task result" },
] as const satisfies readonly { kind: ObserveEventKindV1; label: string }[];

export const exposureKey = "viewport-half-600ms";
export const exposureRule = { minimumIntersectionRatio: 0.5, minimumVisibleMs: 600 };

export function presentation(appearance: "light" | "dark"): ObserveContextV1 {
  return { theme: "workbench", appearance, density: "standard", experiment: null };
}

const target = (slot: string, role: ObserveTargetV1["role"], state: string | null = null): ObserveTargetV1 => ({
  surface: "workbench", component: role, slot, role, state, variant: role === "button" ? "outline" : null,
});

export const controls = Object.fromEntries(tools.map(tool => [tool.key, target(tool.key, tool.role)])) as
  Record<ToolKey, ObserveTargetV1>;
export const preview = target("preview-region", "region");
export const layout = (state: "single" | "split") => ({ ...target("workbench-layout", "region"), state });
export const saved = target("save-status", "status", "saved");

export const catalog: ObserveCatalogV1 = {
  revision: "workbench-1",
  exposureRules: { [exposureKey]: exposureRule },
  entries: (["light", "dark"] as const).flatMap(appearance => {
    const context = presentation(appearance);
    return [
      ...tools.map(tool => ({
        target: controls[tool.key], context, kinds: ["interaction.activated", "focus.changed"] as const,
      })),
      { target: preview, context, kinds: ["exposure.qualified"], exposureRules: [exposureKey] },
      { target: layout("single"), context, kinds: ["state.transitioned"], fromStates: ["split"] },
      { target: layout("split"), context, kinds: ["state.transitioned"], fromStates: ["single"] },
      { target: saved, context, kinds: ["task.outcome"], tasks: ["save-example"] },
    ];
  }),
};

const sampleContext = presentation("light");
const sampleEvents = [
  { schemaVersion: 1, kind: "focus.changed", target: controls.preview, context: sampleContext,
    detail: { source: "browser-focus", phase: "entered" } },
  { schemaVersion: 1, kind: "interaction.activated", target: controls.preview, context: sampleContext,
    detail: { source: "browser-click", modality: "pointer" } },
  { schemaVersion: 1, kind: "exposure.qualified", target: preview, context: sampleContext,
    detail: { source: "viewport-intersection", rule: exposureKey } },
  { schemaVersion: 1, kind: "interaction.activated", target: controls.save, context: sampleContext,
    detail: { source: "application-command", modality: "keyboard" } },
  { schemaVersion: 1, kind: "task.outcome", target: saved, context: sampleContext,
    detail: { source: "application-task", task: "save-example", outcome: "succeeded", duration: null } },
] as const satisfies readonly ObserveEventV1[];
const sampleTimes = [270, 720, 1430, 2260, 2260];

export const sample: readonly LocalObservation[] = sampleEvents.map((event, index) => ({
  index: index + 1, elapsedMs: sampleTimes[index]!, event,
}));
