import assert from "node:assert/strict";
import { test } from "node:test";
import { documentToHtml } from "./serialize.js";

const render = (type: string, data: Record<string, unknown>, sanitize?: (html: string) => string) =>
  documentToHtml({ blocks: [{ id: "b", type, data }] }, sanitize ? { sanitize } : {});
const wrapped = (type: string, inner: string) =>
  `<div class="elea-content"><div class="elea-block elea-block--${type}" data-elea-block-type="${type}">${inner}</div></div>`;
const keep = (html: string) => html;

const cases: [type: string, data: Record<string, unknown>, inner: string][] = [
  ["paragraph", { text: "<b>a</b> & b" }, '<div class="elea-paragraph"><b>a</b> & b</div>'],
  ["header", { text: "Title", level: 3 }, '<h3 class="elea-heading elea-heading--3">Title</h3>'],
  ["quote", { text: "q", caption: "c <" }, '<blockquote class="elea-quote"><p class="elea-quote__text">q</p><cite class="elea-quote__caption">— c &lt;</cite></blockquote>'],
  ["image", { file: { url: "/a.png", id: "i" }, alt: "alt", caption: "cap" }, '<figure class="elea-figure elea-figure--image"><img src="/a.png" alt="alt" class="elea-image" loading="lazy"><figcaption class="elea-caption">cap</figcaption></figure>'],
  ["video", { url: "https://youtu.be/dQw4w9WgXcQ", caption: "v" }, '<figure class="elea-figure elea-figure--video"><a href="https://youtu.be/dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">v</a><figcaption class="elea-caption">v</figcaption></figure>'],
  ["attachment", { resourceId: "r", title: "t", description: "d", url: "https://x.test/f.pdf" }, '<div class="elea-attachment"><a href="https://x.test/f.pdf" target="_blank" rel="noopener noreferrer" class="elea-attachment__link"><span class="elea-attachment__title">t</span><span class="elea-attachment__description">d</span></a></div>'],
  ["code", { code: "a<b" }, '<pre class="elea-code"><code>a&lt;b</code></pre>'],
  ["table", { content: [["h1", "h2"], ["a", "b"]] }, '<div class="elea-table-wrapper"><table class="elea-table"><tbody><tr><th>h1</th><th>h2</th></tr><tr><td>a</td><td>b</td></tr></tbody></table></div>'],
  ["list", { style: "ordered", items: ["a", { content: "b", items: ["c"] }] }, '<ol class="elea-list elea-list--ordered elea-list--level-0"><li class="elea-list__item">a</li><li class="elea-list__item"><span>b</span><ul class="elea-list elea-list--unordered elea-list--level-1"><li class="elea-list__item">c</li></ul></li></ol>'],
  ["delimiter", {}, '<hr class="elea-delimiter">'],
  ["raw", { html: "<i>r</i>" }, '<div class="elea-raw"><i>r</i></div>'],
];

test("each block type is written with the viewer classes", () => {
  for (const [type, data, inner] of cases) assert.equal(render(type, data, keep), wrapped(type, inner), type);
});

test("without a sanitizer rich text is plain escaped text", () => {
  assert.equal(render("paragraph", { text: "<b>a</b> & b" }), wrapped("paragraph", '<div class="elea-paragraph">a &amp; b</div>'));
});

test("blocks without content or with unsafe URLs are skipped", () => {
  assert.equal(render("image", { file: { url: "javascript:alert(1)", id: "" } }, keep), '<div class="elea-content"></div>');
  assert.equal(render("paragraph", { text: "" }, keep), '<div class="elea-content"></div>');
  assert.equal(render("video", { url: "https://example.com/page" }, keep), '<div class="elea-content"></div>');
});
