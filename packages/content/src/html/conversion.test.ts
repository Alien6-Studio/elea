import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { blocksToHtml, htmlToBlocks } from "./conversion.js";

const { document } = new JSDOM("").window;
const options = { document };
const values = (html: string) => htmlToBlocks(html, options).map(({ type, data }) => ({ type, data }));

test("form HTML imports directly into the editor and exports stable rich HTML", () => {
  const input = '<h2>News</h2><p>Some <b>bold &amp; <i>italics</i></b><br><a href="/about">About</a>.</p>';
  const blocks = htmlToBlocks(input, options);
  assert.equal(blocks.length, 2);
  assert.ok(blocks.every(({ id }) => typeof id === "string" && id.length > 0));
  assert.notEqual(blocks[0]!.id, blocks[1]!.id);
  assert.deepEqual(blocks[1]!.data, { text: 'Some <strong>bold &amp; <em>italics</em></strong><br><a href="/about">About</a>.' });
  const html = blocksToHtml(blocks, options);
  assert.match(html, /<p>Some <strong>bold/);
  assert.equal(blocksToHtml(htmlToBlocks(html, options), options), html);
  assert.deepEqual(htmlToBlocks(" "), []);
  assert.equal(blocksToHtml([], options), "");
});

test("code, quotations, checklists, tables and media retain their representable semantics", () => {
  const html = '<blockquote><p>A &amp; B</p><cite>Writer</cite></blockquote><ul><li><input type="checkbox" checked>Booked<ul><li><input type="checkbox">Next</li></ul></li></ul>'
    + '<table><tr><th><strong>Name</strong></th></tr><tr><td>Road</td></tr></table><pre>&lt;tag&gt;\n</pre><hr>'
    + '<figure><img src="/coast.png" alt="Coast"><figcaption>Shore</figcaption></figure>';
  const blocks = htmlToBlocks(html, options);
  const roundtrip = values(blocksToHtml(blocks, options));
  assert.deepEqual(roundtrip, blocks.map(({ type, data }) => ({ type, data })));
  assert.deepEqual(roundtrip[0]?.data, { text: "A &amp; B", caption: "Writer" });
  assert.deepEqual(roundtrip[1]?.data, { style: "checklist", items: [{ content: "Booked", meta: { checked: true }, items: [{ content: "Next", items: [], meta: { checked: false } }] }] });
  assert.equal(roundtrip[3]?.data.code, "<tag>\n");
});

test("HTML attributes and unsafe links cannot be smuggled through either direction", () => {
  const input = '<p onclick="unsafe()">One <a href="javascript:unsafe()">link</a> <a href="https://example.org/" target="name">two</a>'
    + '<script>removed()</script><svg><text>removed()</text></svg><img src="data:text/html,no"><b attr="bad">ok</b>&lt;img onerror&gt;</p>';
  const blocks = htmlToBlocks(input, options);
  const html = blocksToHtml([{ type: "paragraph", data: { text: input } }], options);
  assert.doesNotMatch(JSON.stringify(blocks) + html, /onclick|javascript:|removed\(\)|data:text|attr=|<svg/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /&lt;img onerror&gt;/);
  assert.equal(htmlToBlocks('<script>ignored()</script>', options).length, 0);
});

test("loose text and blocks keep their order and server parsing takes an explicit document", () => {
  assert.deepEqual(values('A <em>line</em><section><p>B</p>C</section>D'), [
    { type: "paragraph", data: { text: "A <em>line</em>" } }, { type: "paragraph", data: { text: "B" } },
    { type: "paragraph", data: { text: "C" } }, { type: "paragraph", data: { text: "D" } },
  ]);
  assert.throws(() => htmlToBlocks("<p>one</p>"), /document/);
});

test("form HTML preserves blank paragraphs between text and saves an empty draft as an empty string", () => {
  const source = "<p>First</p><p><br></p><p>Third</p>";
  assert.equal(blocksToHtml(htmlToBlocks(source, options), options), "<p>First</p><p></p><p>Third</p>");
  assert.equal(blocksToHtml([{ type: "paragraph", data: { text: "" } }], options), "");
});

test("plain imported nested lists keep their list kind; plugin IDs remain a document concern", () => {
  const html = "<ul><li>Parent<ul><li>Child</li></ul></li></ul>";
  const blocks = htmlToBlocks(html, options);
  assert.equal((blocks[0]!.data.items as { childrenMarker: string }[])[0]!.childrenMarker, "disc");
  assert.deepEqual(values(blocksToHtml(blocks, options)), values(html));
  const attachment = blocksToHtml([{ type: "attachment", data: { resourceId: "id", title: "Report", url: "/report" } }], options);
  assert.deepEqual(values(attachment), [{ type: "paragraph", data: { text: '<a href="/report">Report</a>' } }]);
});

test("resolved image sources and marked video figures import without HTML attributes or file IDs", () => {
  const image = { type: "image", data: { file: { id: "photo", url: "" }, alt: "Coast" } };
  const video = { type: "video", data: { url: "https://example.org/film.mp4", caption: "Film" } };
  const html = blocksToHtml([image, video], { ...options, resolveAssetUrl: file => "/assets/" + file.id });
  assert.deepEqual(values(html), [
    { type: "image", data: { file: { id: "", url: "/assets/photo" }, caption: "", alt: "Coast" } },
    video,
  ]);
  assert.deepEqual(values('<img src="javascript:invalid"><figure>nothing</figure>'), []);
});
