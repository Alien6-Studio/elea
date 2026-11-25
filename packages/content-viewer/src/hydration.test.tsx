import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { renderToString } from "react-dom/server";
import { ContentView, type ContentViewProps } from "./ContentView.js";
import type { AttachmentClickInfo } from "./context.js";

/** Server markup hydrated on a client DOM; any mismatch surfaces as a console error. */
async function hydrate(data: unknown, options: Omit<ContentViewProps, "data"> = {}, interact?: (container: HTMLElement) => void): Promise<string[]> {
  const element = <ContentView data={data} {...options} />;
  const markup = renderToString(element);
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
      root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(`recoverable: ${String(error)}`) });
    });
    try {
      interact?.(container);
    } finally {
      await act(async () => root?.unmount());
    }
  } finally {
    console.error = originalError;
    for (const [key, value] of Object.entries(previous)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  return errors;
}

test("plain text and documents without ids hydrate without warnings", async () => {
  assert.deepEqual(await hydrate("First paragraph\n\nSecond paragraph"), []);
  assert.deepEqual(await hydrate({ blocks: [{ type: "header", data: { text: "T", level: 2 } }, { id: "elea-1", type: "paragraph", data: { text: "<p>x</p>" } }, { id: "dup", type: "paragraph", data: { text: "a" } }, { id: "dup", type: "quote", data: { text: "<p>q</p>", caption: "c" } }] }), []);
});

test("hydrated attachment links report their destination and identity on native activation", async () => {
  const data = { blocks: [
    { type: "attachment", data: { resourceId: "book", title: "Book", url: "/book" } },
    { type: "attachment", data: { resourceId: 42, title: "Notes", type: "pdf", file: { id: "notes" } } },
    { type: "attaches", data: { file: { fileId: "paper", name: "paper.pdf" } } },
    { type: "attaches", data: { title: "Untitled file", file: { url: "/file" } } },
    { type: "attachment", data: { resourceId: "draft", title: "Draft" } },
    { type: "paragraph", data: { text: '<a href="/about">About</a>' } },
  ] };
  const clicks: AttachmentClickInfo[] = [];
  const errors = await hydrate(data, {
    resolveAssetUrl: (file) => file.id ? `/assets/${file.id}` : file.url,
    onAttachmentClick: (info) => clicks.push(info),
  }, (container) => {
    assert.deepEqual(clicks, []);
    for (const title of container.querySelectorAll<HTMLElement>(".elea-attachment__title")) title.click();
    const ordinaryLink = container.querySelector<HTMLAnchorElement>('a[href="/about"]');
    assert.ok(ordinaryLink);
    ordinaryLink.addEventListener("click", (event) => event.preventDefault());
    ordinaryLink.click();
  });
  assert.deepEqual(errors, []);
  assert.deepEqual(clicks, [
    { blockType: "attachment", href: "/book", resourceId: "book" },
    { blockType: "attachment", href: "/assets/notes", resourceId: "42" },
    { blockType: "attaches", href: "/assets/paper", fileName: "paper.pdf" },
    { blockType: "attaches", href: "/file", fileName: undefined },
  ]);
});
