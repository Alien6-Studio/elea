import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { createBrowserCollector } from "./browser.js";
import type { ObserveContextV1, ObserveEventV1, ObserveTargetV1 } from "./contract.js";

const context: ObserveContextV1 = { theme: null, appearance: null, density: null, experiment: null };
const target: ObserveTargetV1 = { surface: "demo", component: "button", slot: "save", state: null, variant: null, role: "button" };

test("browser bindings are inert until attached and ignore scripted clicks", () => {
  const { window } = new JSDOM("<button>Save</button><button>Cancel</button>");
  try {
    const [save, cancel] = Array.from(window.document.querySelectorAll("button"));
    const records: ObserveEventV1[] = [];
    const collector = createBrowserCollector([{
      element: save!, target: () => target, activation: true, focus: true,
      exposure: { key: "half", rule: { minimumIntersectionRatio: 0.5, minimumVisibleMs: 200 } },
    }], () => context);
    save!.focus();
    cancel!.focus();
    assert.equal(records.length, 0);

    const stop = collector.attach(["interaction.activated", "focus.changed", "exposure.qualified"], event => records.push(event));
    save!.focus();
    save!.click();
    cancel!.focus();
    assert.deepEqual(records.map(({ detail }) => detail), [
      { source: "browser-focus", phase: "entered" }, { source: "browser-focus", phase: "left" },
    ]);
    stop();
    stop();
    save!.focus();
    assert.equal(records.length, 2);
  } finally {
    window.close();
  }
});

test("duplicate DOM bindings are rejected before attachment", () => {
  const { window } = new JSDOM("<button>Save</button>");
  try {
    const binding = { element: window.document.querySelector("button")!, target: () => target, focus: true };
    assert.throws(() => createBrowserCollector([binding, binding], () => context), /distinct elements/);
  } finally {
    window.close();
  }
});

test("exposure resets on hidden documents and pending dwell is cancelled on detach", async () => {
  const { window } = new JSDOM("<div>Preview</div>", { pretendToBeVisual: true });
  try {
    const element = window.document.querySelector("div")!;
    let callback: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    class TestObserver {
      constructor(receive: typeof callback) { callback = receive; }
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    }
    Object.defineProperty(window, "IntersectionObserver", { value: TestObserver });
    const collector = createBrowserCollector([{
      element, target: () => ({ ...target, role: "region" }),
      exposure: { key: "half", rule: { minimumIntersectionRatio: 0.5, minimumVisibleMs: 5 } },
    }], () => context);
    assert.equal(callback, undefined);
    const records: ObserveEventV1[] = [];
    const stop = collector.attach(["exposure.qualified"], event => records.push(event));
    const entry = {
      isIntersecting: true, intersectionRatio: 0.75, boundingClientRect: { width: 80, height: 40 },
    } as IntersectionObserverEntry;
    const visibility = (state: DocumentVisibilityState) => {
      Object.defineProperty(window.document, "visibilityState", { configurable: true, value: state });
      window.document.dispatchEvent(new window.Event("visibilitychange"));
    };
    const dwell = () => new Promise(resolve => setTimeout(resolve, 15));

    callback!([entry]);
    visibility("hidden");
    await dwell();
    assert.equal(records.length, 0);

    visibility("visible");
    callback!([entry]);
    await dwell();
    callback!([entry]);
    await dwell();
    assert.deepEqual(records.map(event => event.detail), [{ source: "viewport-intersection", rule: "half" }]);

    callback!([{ ...entry, intersectionRatio: 0.2 }, entry]);
    stop();
    await dwell();
    assert.equal(records.length, 1);
  } finally {
    window.close();
  }
});
