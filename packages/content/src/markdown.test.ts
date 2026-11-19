import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultRegistry } from "./blocks/builtin.js";
import { createDocument } from "./document.js";
import { blockToMarkdown, documentToMarkdown, inlineHtmlToMarkdown, looksLikeMarkdown, markdownInlineToHtml, markdownToBlocks } from "./markdown.js";
import { documentToHtml } from "./serialize.js";

const block = (id: string, type: string, data: Record<string, unknown>) => ({ id, type, data });

const sample = createDocument([
  block("h", "header", { text: "Title <em>x</em>", level: 1 }),
  block("p", "paragraph", { text: '<p>Hello <strong>bold</strong>, <em>em</em>, <u>under</u>, <code>a&lt;b</code> and <a href="https://example.org">link</a>.<br>Next line</p>' }),
  block("l", "list", { style: "unordered", items: ["one", { content: "two", items: ["deep <strong>x</strong>"] }] }),
  block("o", "list", { style: "ordered", items: ["first", "second"] }),
  block("q", "quote", { text: "Wise<br>words", caption: "Someone" }),
  block("i", "image", { file: { url: "https://example.org/a.png", id: "" }, caption: 'A "cap"', alt: "Alt" }),
  block("v", "video", { url: "https://youtu.be/dQw4w9WgXcQ", caption: "Clip" }),
  block("a", "attachment", { resourceId: "r", title: "Report", type: "pdf", description: "", url: "https://example.org/r.pdf" }),
  block("c", "code", { code: "const a = 1;" }),
  block("t", "table", { content: [["A", "B|C"], ["1", "<b>2</b>"]] }),
  block("d", "delimiter", {}),
  block("e", "paragraph", { text: "" }),
  block("w", "widget", { text: "custom" }),
]);

test("documentToMarkdown writes every block type", () => {
  assert.equal(
    documentToMarkdown(sample),
    [
      "# Title *x*",
      "Hello **bold**, *em*, under, `a<b` and [link](https://example.org).  \nNext line",
      "- one\n- two\n  1. deep **x**",
      "1. first\n2. second",
      "> Wise  \n> words\n> — Someone",
      '![Alt](https://example.org/a.png "A \'cap\'")',
      "[Clip](https://youtu.be/dQw4w9WgXcQ)",
      "[Report](https://example.org/r.pdf)",
      "```\nconst a = 1;\n```",
      "| A | B\\|C |\n| --- | --- |\n| 1 | **2** |",
      "---",
      "custom",
    ].join("\n\n"),
  );
  assert.equal(blockToMarkdown({ type: "image", data: { file: { url: "", id: "" } } }), null);
  assert.equal(blockToMarkdown({ type: "attachment", data: { title: "Only title" } }), "Only title");
  assert.equal(blockToMarkdown({ type: "attachment", data: {} }), null);
  assert.equal(blockToMarkdown({ type: "video", data: { url: "https://example.org/v.mp4" } }), "[https://example.org/v.mp4](https://example.org/v.mp4)");
  assert.equal(blockToMarkdown({ type: "raw", data: { html: "<p>raw <b>x</b></p>" } }), "raw **x**");
  assert.equal(blockToMarkdown({ type: "table", data: { content: [] } }), null);
  assert.equal(blockToMarkdown({ type: "quote", data: { text: "", caption: "" } }), null);
  assert.equal(blockToMarkdown({ type: "header", data: { text: "", level: 9 } }), null);
  assert.equal(blockToMarkdown({ type: "header", data: { text: "Deep", level: 9 } }), "###### Deep");
  assert.equal(blockToMarkdown({ type: "code", data: {} }), null);
  assert.equal(blockToMarkdown({ type: "list", data: { items: [] } }), null);
  assert.equal(blockToMarkdown({ type: "widget", data: {} }), null);
  assert.equal(inlineHtmlToMarkdown("<div>a</div><div>b</div>"), "a\n\nb");
});

test("markdownToBlocks reads back what documentToMarkdown writes, and more", () => {
  const blocks = markdownToBlocks(documentToMarkdown(sample));
  assert.deepEqual(blocks.map((candidate) => candidate.type), ["header", "paragraph", "list", "list", "quote", "image", "paragraph", "paragraph", "code", "table", "delimiter", "paragraph"]);
  assert.deepEqual(blocks[0]?.data, { text: "Title <em>x</em>", level: 1 });
  assert.deepEqual(blocks[1]?.data, { text: 'Hello <strong>bold</strong>, <em>em</em>, under, <code>a&lt;b</code> and <a href="https://example.org">link</a>.<br>Next line' });
  assert.deepEqual(blocks[2]?.data, { style: "unordered", items: ["one", { content: "two", items: ["deep <strong>x</strong>"] }] });
  assert.deepEqual(blocks[4]?.data, { text: "Wise<br>words", caption: "Someone" });
  assert.deepEqual(blocks[5]?.data, { file: { url: "https://example.org/a.png", id: "" }, caption: "A 'cap'", alt: "Alt" });
  assert.deepEqual(blocks[9]?.data, { content: [["A", "B|C"], ["1", "<strong>2</strong>"]] });
  const more = markdownToBlocks("Intro line\nsecond line\n\n## Heading ##\n***\n* star\n+ plus\n  * nested\n    * deeper\n\n```\nunclosed fence");
  assert.deepEqual(more, [
    { type: "paragraph", data: { text: "Intro line<br>second line" } },
    { type: "header", data: { text: "Heading", level: 2 } },
    { type: "delimiter", data: {} },
    { type: "list", data: { style: "unordered", items: ["star", { content: "plus", items: [{ content: "nested", items: ["deeper"] }] }] } },
    { type: "code", data: { code: "unclosed fence" } },
  ]);
  assert.deepEqual(markdownToBlocks("  - orphan nested first\n- top"), [{ type: "list", data: { style: "unordered", items: [{ content: "", items: ["orphan nested first"] }, "top"] } }]);
  assert.deepEqual(markdownToBlocks(""), []);
  assert.deepEqual(markdownToBlocks("![x](javascript:alert(1))"), [{ type: "paragraph", data: { text: "x)" } }]);
  assert.deepEqual(markdownToBlocks("![x](javascript:alert)"), [{ type: "paragraph", data: { text: "x" } }]);
});

test("markdownInlineToHtml escapes HTML, keeps safe links and images, drops unsafe ones", () => {
  assert.equal(markdownInlineToHtml("<b>raw</b> **bold** __also__ *em* _em_ `code` [t](/local) [u](javascript:x) ![a](https://example.org/i.png) ![b](data:x)"), '&lt;b&gt;raw&lt;/b&gt; <strong>bold</strong> <strong>also</strong> <em>em</em> <em>em</em> <code>code</code> <a href="/local">t</a> u <img src="https://example.org/i.png" alt="a"> b');
  assert.equal(markdownInlineToHtml("**[link](https://example.org)**"), '<strong><a href="https://example.org">link</a></strong>');
  assert.equal(markdownInlineToHtml("line  \nbreak\\\nagain\nplain"), "line<br>break<br>again<br>plain");
});

test("looksLikeMarkdown", () => {
  for (const text of ["# Title", "- item", "1. item", "> quote", "```", "---", "![a](https://x)", "| a | b |", "some **bold** words", "a [link](https://example.org)"]) assert.equal(looksLikeMarkdown(text), true, text);
  for (const text of ["plain text", "two\nlines", "", "a * b * c", "[not a link](x)"]) assert.equal(looksLikeMarkdown(text), false, text);
});

test("documentToHtml writes the viewer markup with every URL checked", () => {
  const html = documentToHtml(sample, { sanitize: (input) => input.replaceAll("<u>", "").replaceAll("</u>", ""), resolveAssetUrl: (file) => file.url, registry: defaultRegistry });
  assert.ok(html.startsWith('<div class="elea-content"><div class="elea-block elea-block--header" data-elea-block-type="header"><h1 class="elea-heading elea-heading--1">Title <em>x</em></h1></div>'));
  assert.ok(html.includes('<div class="elea-paragraph"><p>Hello <strong>bold</strong>, <em>em</em>, under,'));
  assert.ok(html.includes('<ul class="elea-list elea-list--unordered elea-list--level-0"><li class="elea-list__item">one</li><li class="elea-list__item"><span>two</span><ol class="elea-list elea-list--ordered elea-list--level-1"><li class="elea-list__item">deep <strong>x</strong></li></ol></li></ul>'));
  assert.ok(html.includes('<blockquote class="elea-quote"><p class="elea-quote__text">Wise<br>words</p><cite class="elea-quote__caption">— Someone</cite></blockquote>'));
  assert.ok(html.includes('<img src="https://example.org/a.png" alt="Alt" class="elea-image" loading="lazy"><figcaption class="elea-caption">A &quot;cap&quot;</figcaption>'));
  assert.ok(html.includes('<a href="https://youtu.be/dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">Clip</a>'));
  assert.ok(html.includes('<a href="https://example.org/r.pdf" target="_blank" rel="noopener noreferrer" class="elea-attachment__link"><span class="elea-attachment__title">Report</span></a>'));
  assert.ok(html.includes('<pre class="elea-code"><code>const a = 1;</code></pre>'));
  assert.ok(html.includes("<tr><th>A</th><th>B|C</th></tr><tr><td>1</td><td><b>2</b></td></tr>"));
  assert.ok(html.includes('<hr class="elea-delimiter">'));
  assert.ok(!html.includes('data-elea-block-type="paragraph"></div>'));
  assert.ok(!html.includes("widget"), "unknown types without text are skipped");
  const edge = documentToHtml(createDocument([
    block("i", "image", { file: { url: "javascript:x", id: "" }, caption: "" }),
    block("v", "video", { url: "https://example.org/page", caption: "" }),
    block("a", "attachment", { resourceId: "r", title: "T", type: "", description: "D", url: "", file: { url: "", id: "f" } }),
    block("a2", "attachment", { resourceId: "", title: "", type: "", description: "", url: "" }),
    block("r", "raw", { html: "<p>raw</p>" }),
    block("w", "widget", { text: "shown" }),
    block("t", "table", { content: "bad" }),
    block("c", "code", { code: "" }),
  ]), { resolveAssetUrl: () => "javascript:x", registry: defaultRegistry.with({ type: "widget", defaults: () => ({}), normalize: (data) => data, toText: (data) => String(data.text ?? "") }) });
  assert.equal(edge, '<div class="elea-content"><div class="elea-block elea-block--attachment" data-elea-block-type="attachment"><div class="elea-attachment"><span class="elea-attachment__link elea-attachment__link--static"><span class="elea-attachment__title">T</span><span class="elea-attachment__description">D</span></span></div></div><div class="elea-block elea-block--raw" data-elea-block-type="raw"><div class="elea-raw"><p>raw</p></div></div><div class="elea-block elea-block--widget" data-elea-block-type="widget"><div class="elea-unknown"><p>shown</p></div></div></div>');
  assert.equal(documentToHtml({ blocks: [] }), '<div class="elea-content"></div>');
});
