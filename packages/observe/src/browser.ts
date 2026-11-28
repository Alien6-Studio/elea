import type {
  ExposureRuleV1, ObserveCollectorV1, ObserveContextV1, ObserveEventV1, ObserveRecorderV1, ObserveTargetV1,
} from "./contract.js";

export interface BrowserBinding {
  readonly element: Element;
  readonly target: () => ObserveTargetV1;
  readonly activation?: boolean;
  readonly focus?: boolean;
  readonly exposure?: { readonly key: string; readonly rule: ExposureRuleV1 };
}

export function createBrowserCollector(
  bindings: readonly BrowserBinding[],
  context: () => ObserveContextV1,
): ObserveCollectorV1 {
  const registered = [...bindings];
  if (new Set(registered.map(binding => binding.element)).size !== registered.length) {
    throw new TypeError("Observe browser bindings require distinct elements");
  }
  return {
    attach(kinds, record) {
      const cleanup: (() => void)[] = [];
      const activations = new Set(registered.filter(binding => binding.activation).map(binding => binding.element));
      let attached = true;

      function stop() {
        attached = false;
        for (const dispose of cleanup.splice(0)) dispose();
      }

      function emit(binding: BrowserBinding, event: Pick<ObserveEventV1, "kind" | "detail">) {
        if (!attached || !binding.element.isConnected) return;
        try {
          record({
            ...event, schemaVersion: 1, target: binding.target(), context: context(),
          } as ObserveEventV1);
        } catch { /* A telemetry callback must leave native behavior alone. */ }
      }

      try {
        for (const binding of registered) {
          const { element } = binding;
          if (binding.activation && kinds.includes("interaction.activated")) {
            const click = (event: Event) => {
              if (!event.isTrusted || event.composedPath().find(node => activations.has(node as Element)) !== element
                || element.matches(":disabled") || element.closest("[inert], [aria-disabled='true']")) return;
              const pointerType = (event as PointerEvent).pointerType;
              emit(binding, {
                kind: "interaction.activated",
                detail: { source: "browser-click", modality: pointerType ? "pointer" : "unknown" },
              });
            };
            element.addEventListener("click", click);
            cleanup.push(() => element.removeEventListener("click", click));
          }
          if (binding.focus && kinds.includes("focus.changed")) {
            const focus = (event: Event) => {
              if (event.target !== element || !event.isTrusted) return;
              emit(binding, {
                kind: "focus.changed",
                detail: { source: "browser-focus", phase: event.type === "focus" ? "entered" : "left" },
              });
            };
            element.addEventListener("focus", focus);
            element.addEventListener("blur", focus);
            cleanup.push(() => {
              element.removeEventListener("focus", focus);
              element.removeEventListener("blur", focus);
            });
          }
          if (binding.exposure && kinds.includes("exposure.qualified")) {
            const { key, rule } = binding.exposure;
            const stopExposure = observeExposure(element, rule, () => {
              emit(binding, { kind: "exposure.qualified", detail: { source: "viewport-intersection", rule: key } });
            });
            if (stopExposure) cleanup.push(stopExposure);
          }
        }
      } catch (error) {
        stop();
        throw error;
      }
      return stop;
    },
  };
}

function observeExposure(element: Element, rule: ExposureRuleV1, emit: () => void): (() => void) | undefined {
  const doc = element.ownerDocument;
  const view = doc.defaultView;
  if (!view || typeof view.IntersectionObserver !== "function") return;
  const { minimumIntersectionRatio, minimumVisibleMs } = rule;
  if (!(minimumIntersectionRatio > 0 && minimumIntersectionRatio <= 1)
    || !Number.isSafeInteger(minimumVisibleMs) || minimumVisibleMs < 1 || minimumVisibleMs > 60_000) {
    throw new RangeError("Invalid Observe exposure rule");
  }

  let timer: number | undefined;
  let emitted = false;
  let observing = true;
  const visible = () => observing && element.isConnected && doc.visibilityState === "visible";
  const observer = new view.IntersectionObserver(update, { threshold: minimumIntersectionRatio });

  function reset() {
    if (timer !== undefined) view!.clearTimeout(timer);
    timer = undefined;
    emitted = false;
  }

  function update(entries: readonly IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (!visible() || !entry.isIntersecting || entry.intersectionRatio < minimumIntersectionRatio
        || entry.boundingClientRect.width <= 0 || entry.boundingClientRect.height <= 0) {
        reset();
      } else if (!emitted && timer === undefined) {
        timer = view!.setTimeout(qualify, minimumVisibleMs);
      }
    }
  }

  function qualify() {
    const pending = timer;
    update(observer.takeRecords());
    if (timer !== pending) return;
    timer = undefined;
    if (visible()) {
      emitted = true;
      emit();
    }
  }

  function visibilityChanged() {
    reset();
    observer.disconnect();
    if (visible()) observer.observe(element);
  }

  visibilityChanged();
  doc.addEventListener("visibilitychange", visibilityChanged);
  return () => {
    observing = false;
    doc.removeEventListener("visibilitychange", visibilityChanged);
    observer.disconnect();
    reset();
  };
}
