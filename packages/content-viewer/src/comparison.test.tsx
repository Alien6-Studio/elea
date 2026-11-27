import assert from "node:assert/strict";
import { test } from "node:test";
import { RICH_HTML_POLICY, type HtmlSanitizer } from "@alien6-studio/elea-content";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentComparison } from "./ContentComparison.js";
import { ContentComparison as CoreContentComparison } from "./core.js";

const before = { blocks: [
  { type: "header", data: { text: "Colophon", level: 2 } },
  { type: "paragraph", data: { text: "Set in <strong>Garamond</strong> and printed on Monday." } },
  { type: "code", data: { code: "old" } },
] };
const after = { blocks: [
  { type: "header", data: { text: "Colophon", level: 2 } },
  { type: "paragraph", data: { text: "Set in <strong>Garamond</strong> and printed on <script>x</script>Tuesday." } },
  { type: "quote", data: { text: "New words", caption: "Author" } },
] };

test("ContentComparison renders both versions as one document", () => {
  const html = renderToStaticMarkup(<ContentComparison before={before} after={after} className="review" typography="inherit" />);
  assert.match(html, /^<div class="elea-content elea-comparison elea-content--inherit review">/);
  assert.match(html, /<div class="elea-block elea-block--header" data-elea-block-id="elea-after-1" data-elea-block-type="header" data-elea-change="same">/);
  assert.match(html, /data-elea-change="changed"><div class="elea-paragraph">Set in <strong>Garamond<\/strong> and printed on <del class="elea-change elea-change--removed">Monday<\/del><ins class="elea-change elea-change--added">Tuesday<\/ins>\.<\/div>/);
  assert.match(html, /<del class="elea-block elea-block--code" data-elea-block-id="elea-before-3" data-elea-block-type="code" data-elea-change="removed">/);
  assert.match(html, /<ins class="elea-block elea-block--quote" data-elea-block-id="elea-after-3" data-elea-block-type="quote" data-elea-change="added">/);
  assert.doesNotMatch(html, /<script/);
});

test("ContentComparison takes host renderers and falls back when both versions are empty", () => {
  const html = renderToStaticMarkup(<ContentComparison before={null} after={after} renderers={{ quote: ({ block }) => <q>{String(block.data.text)}</q> }} />);
  assert.match(html, /data-elea-change="added"><q>New words<\/q><\/ins>/);
  assert.equal(renderToStaticMarkup(<ContentComparison before={null} after={{ blocks: [] }} emptyFallback={<p>Nothing</p>} />), "<p>Nothing</p>");
  assert.equal(renderToStaticMarkup(<ContentComparison before={null} after={null} />), "");
});

test("the core entry compares through the sanitizer of the host", () => {
  const sanitizer: HtmlSanitizer = { policy: RICH_HTML_POLICY, sanitize: (html) => html.replaceAll(/<\/?script>/g, "") };
  const html = renderToStaticMarkup(<CoreContentComparison before={before} after={after} sanitizer={sanitizer} />);
  assert.match(html, /<ins class="elea-change elea-change--added">Tuesday<\/ins>/);
  assert.doesNotMatch(html, /<script/);
});
