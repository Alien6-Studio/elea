import assert from "node:assert/strict";
import { test } from "node:test";
import { RICH_HTML_POLICY, fr, type HtmlSanitizer } from "@alien6-studio/elea-content";
import { renderToString } from "react-dom/server";
import { ContentView, createContentViewContext } from "./core.js";

const sanitizer: HtmlSanitizer = { policy: RICH_HTML_POLICY, sanitize: (html) => html.replaceAll("<script>", "") };

test("the core entry renders through the sanitizer of the host", () => {
  const html = renderToString(<ContentView data={{ blocks: [{ type: "paragraph", data: { text: "<script>Hi <b>there</b>" } }] }} sanitizer={sanitizer} typography="inherit" />);
  assert.match(html, /<div class="elea-content elea-content--inherit">/);
  assert.match(html, /<div class="elea-paragraph">Hi <b>there<\/b><\/div>/);
});

test("the core context keeps the given sanitizer and the defaults around it", () => {
  const context = createContentViewContext({ sanitizer, messages: fr });
  assert.equal(context.sanitizer, sanitizer);
  assert.equal(context.messages, fr);
  assert.equal(context.resolveAssetUrl({ id: "a", url: "" }), "a");
});
