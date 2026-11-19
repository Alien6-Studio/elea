import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import axe from "axe-core";
import { createDocument, en } from "@alien6-studio/elea-content";
import { ContentView } from "./ContentView.js";
import { ContentSkeleton } from "./components/ContentSkeleton.js";

async function violations(html: string): Promise<string[]> {
  const dom = new JSDOM(`<!doctype html><html lang="en"><head><title>t</title></head><body><main>${html}</main></body></html>`);
  const { window } = dom;
  // axe needs the global window of the document it audits
  const previous = { window: globalThis.window, document: globalThis.document };
  Object.assign(globalThis, { window, document: window.document });
  try {
    const results = await axe.run(window.document.body, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      rules: { "color-contrast": { enabled: false } },
    });
    return results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`);
  } finally {
    Object.assign(globalThis, previous);
  }
}

test("a full document has no axe violation", async () => {
  const html = renderToStaticMarkup(
    <ContentView
      data={createDocument([
        { id: "h", type: "header", data: { text: "Title", level: 1 } },
        { id: "p", type: "paragraph", data: { text: '<p>Text with <a href="https://example.org">a link</a></p>' } },
        { id: "l", type: "list", data: { style: "unordered", items: ["one", { content: "two", items: ["three"] }] } },
        { id: "q", type: "quote", data: { text: "Quote", caption: "Someone" } },
        { id: "i", type: "image", data: { file: { url: "https://cdn.example/a.png", id: "" }, caption: "An image" } },
        { id: "v", type: "video", data: { url: "https://youtu.be/dQw4w9WgXcQ", caption: "A video" } },
        { id: "a", type: "attachment", data: { resourceId: "r", title: "Report", type: "pdf", description: "", url: "https://example.org/r.pdf" } },
        { id: "t", type: "table", data: { content: [["A", "B"], ["1", "2"]] } },
        { id: "c", type: "code", data: { code: "x" } },
        { id: "d", type: "delimiter", data: {} },
      ])}
    />,
  );
  assert.deepEqual(await violations(html), []);
});

test("the skeleton is announced as a loading status without violation", async () => {
  assert.deepEqual(await violations(renderToStaticMarkup(<ContentSkeleton messages={en} />)), []);
});
