import type { CollectionGrantV1, ObserveCatalogV1, ObserveCollectorV1, ObserveControlV1, ObserveEventV1, ObserveFilterV1 } from "./contract.js";
import { createEventValidator, isEventKind } from "./validate.js";

export type * from "./contract.js";
export { createEventValidator } from "./validate.js";

export interface LocalObservation {
  readonly index: number;
  /** Demonstration-relative time rounded to 10 ms. Outside the wire event. */
  readonly elapsedMs: number;
  readonly event: ObserveEventV1;
}

export interface LocalObserveOptions {
  readonly catalog: ObserveCatalogV1;
  readonly purpose: string;
  readonly capacity?: number;
  readonly filters?: readonly ObserveFilterV1[];
  readonly collectors?: readonly ObserveCollectorV1[];
  readonly now?: () => number;
}

export interface LocalObserve extends ObserveControlV1 {
  readonly active: boolean;
  record(event: unknown): boolean;
  snapshot(): readonly LocalObservation[];
  subscribe(listener: () => void): () => void;
}

const empty: readonly LocalObservation[] = Object.freeze([]);

export function createLocalObserve(options: LocalObserveOptions): LocalObserve {
  const { purpose, capacity = 128, now = () => performance.now() } = options;
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1024) {
    throw new RangeError("Observe capacity must be between 1 and 1024");
  }
  const validate = createEventValidator(options.catalog);
  const collectors = [...(options.collectors ?? [])];
  const filters = [...(options.filters ?? [])];
  const listeners = new Set<() => void>();
  const detach: (() => void)[] = [];
  let grant: CollectionGrantV1 | null = null;
  let generation = 0;
  let disposed = false;
  let start = 0;
  let index = 0;
  let elapsedMs = 0;
  let records: readonly LocalObservation[] = empty;

  function notify() {
    for (const listener of listeners) {
      try { listener(); } catch { /* A view must not interrupt collection. */ }
    }
  }

  function reset() {
    grant = null;
    const current = ++generation;
    records = empty;
    index = 0;
    elapsedMs = 0;
    const cleanup = detach.splice(0);
    for (const stop of cleanup) {
      try { stop(); } catch { /* Continue detaching independent collectors. */ }
    }
    return current;
  }

  function record(value: unknown): boolean {
    if (!grant) return false;
    const current = generation;
    const event = validate(value);
    if (!event || !grant?.kinds.includes(event.kind)) return false;
    try {
      if (!filters.every(filter => filter(event))) return false;
    } catch {
      return false;
    }
    const elapsed = now() - start;
    if (current !== generation) return false;
    if (Number.isFinite(elapsed)) elapsedMs = Math.max(elapsedMs, Math.floor(elapsed / 10) * 10);
    records = Object.freeze([...records.slice(Math.max(0, records.length + 1 - capacity)), Object.freeze({
      index: ++index, elapsedMs, event,
    })]);
    notify();
    return true;
  }

  function setGrant(next: CollectionGrantV1 | null) {
    if (disposed) return;
    const current = reset();
    if (disposed || current !== generation) return;
    if (next?.destination === "memory" && next.purpose === purpose
      && next.kinds.length > 0 && next.kinds.every(isEventKind)) {
      grant = Object.freeze({ ...next, kinds: Object.freeze([...new Set(next.kinds)]) });
      start = now();
      try {
        for (const collector of collectors) {
          const stop = collector.attach(grant.kinds, event => {
            if (current === generation) record(event);
          });
          if (current !== generation) {
            stop();
            return;
          }
          detach.push(stop);
        }
      } catch {
        if (current === generation) reset();
      }
    }
    notify();
  }

  return {
    get active() { return grant !== null; },
    record,
    setGrant,
    dispose() {
      if (disposed) return;
      disposed = true;
      reset();
      notify();
      listeners.clear();
    },
    snapshot: () => records,
    subscribe(listener) {
      if (!disposed) listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
