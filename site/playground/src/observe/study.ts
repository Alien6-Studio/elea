import { exposureRule } from "./model.js";

export const exposureTrace = [
  { start: 0, end: 300, ratio: 0.75, visible: true },
  { start: 300, end: 450, ratio: 0.75, visible: false },
  { start: 450, end: 1100, ratio: 0.75, visible: true },
  { start: 1100, end: 1200, ratio: 0.25, visible: true },
] as const;

export type ExposureSlice = { start: number; end: number; ratio: number; visible: boolean };

export const eligible = ({ ratio, visible }: ExposureSlice) =>
  visible && ratio >= exposureRule.minimumIntersectionRatio;

export function firstQualification(trace: readonly ExposureSlice[]): number | null {
  let since: number | undefined;
  let previousEnd: number | undefined;
  for (const interval of trace) {
    if (eligible(interval)) {
      if (since === undefined || previousEnd !== interval.start) since = interval.start;
      const acceptedAt = since + exposureRule.minimumVisibleMs;
      if (acceptedAt < interval.end) return acceptedAt;
    } else {
      since = undefined;
    }
    previousEnd = interval.end;
  }
  return null;
}

export const outcomes = [
  { id: "A", label: "Leading", assigned: 100, activated: 120, confirmed: 56, other: 24 },
  { id: "B", label: "Trailing", assigned: 100, activated: 120, confirmed: 60, other: 35 },
] as const;

export function outcomeRates({ assigned, confirmed, other }: typeof outcomes[number]) {
  const missing = assigned - confirmed - other;
  return {
    missing,
    observed: 100 * confirmed / (confirmed + other),
    lower: 100 * confirmed / assigned,
    upper: 100 * (confirmed + missing) / assigned,
  };
}

export const uninterruptedTrace = [
  { start: 0, end: 950, ratio: 0.75, visible: true },
  { start: 950, end: 1200, ratio: 0.25, visible: true },
] as const;

export const eligibleDuration = (trace: readonly ExposureSlice[]) =>
  trace.reduce((total, slice) => total + (eligible(slice) ? slice.end - slice.start : 0), 0);

export function outcomeContrast() {
  const a = outcomeRates(outcomes[0]);
  const b = outcomeRates(outcomes[1]);
  return { lower: a.lower - b.upper, upper: a.upper - b.lower, observed: a.observed - b.observed };
}
