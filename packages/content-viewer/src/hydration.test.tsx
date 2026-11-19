import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { renderToString } from "react-dom/server";
import { ContentView } from "./ContentView.js";

/** Server markup hydrated on a client DOM; any mismatch surfaces as a console error. */
async function hydrate(data: unknown): Promise<string[]> {
  const markup = renderToString(<ContentView data={data} />);
  const dom = new JSDOM(`<!doctype html><html><body><div id="root">${markup}</div></body></html>`, { url: "https://example.org/" });
  const previous = { window: (globalThis as { window?: unknown }).window, document: (globalThis as { document?: unknown }).document, navigator: (globalThis as { navigator?: unknown }).navigator };
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => errors.push(args.map(String).join(" "));
  try {
    const { hydrateRoot } = await import("react-dom/client");
    const { act } = await import("react");
    const container = dom.window.document.getElementById("root") as HTMLElement;
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <ContentView data={data} />, { onRecoverableError: (error) => errors.push(`recoverable: ${String(error)}`) });
    });
    await act(async () => root?.unmount());
  } finally {
    console.error = originalError;
    for (const [key, value] of Object.entries(previous)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  return errors;
}

test("plain text and documents without ids hydrate without warnings", async () => {
  assert.deepEqual(await hydrate("First paragraph\n\nSecond paragraph"), []);
  assert.deepEqual(await hydrate({ blocks: [{ type: "header", data: { text: "T", level: 2 } }, { type: "paragraph", data: { text: "<p>x</p>" } }, { id: "dup", type: "paragraph", data: { text: "a" } }, { id: "dup", type: "quote", data: { text: "<p>q</p>", caption: "c" } }] }), []);
});
