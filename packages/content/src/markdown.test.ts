import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultRegistry } from "./blocks/builtin.js";
import { createDocument } from "./document.js";
import { looksLikeMarkdown, markdownInlineToHtml, markdownToBlocks } from "./markdown.js";
import { blockToMarkdown, documentToMarkdown, inlineHtmlToMarkdown } from "./markdownExport.js";
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
      '![Alt](https://example.org/a.png "A \\"cap\\"")',
      "[Clip](https://youtu.be/dQw4w9WgXcQ)",
      "[Report](https://example.org/r.pdf)",
      "```\nconst a = 1;\n```",
      "| A | B\\|C |\n| --- | --- |\n| 1 | **2** |",
      "---",
      "",
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
  assert.deepEqual(blocks[5]?.data, { file: { url: "https://example.org/a.png", id: "" }, caption: 'A "cap"', alt: "Alt" });
  assert.deepEqual(blocks[9]?.data, { content: [["A", "B|C"], ["1", "<strong>2</strong>"]] });
  const more = markdownToBlocks("Intro line\nsecond line\n\n## Heading ##\n***\n* star\n+ plus\n  * nested\n    * deeper\n\n```\nunclosed fence");
  assert.deepEqual(more, [
    { type: "paragraph", data: { text: "Intro line<br>second line" } },
    { type: "header", data: { text: "Heading", level: 2 } },
    { type: "delimiter", data: {} },
    { type: "list", data: { style: "unordered", items: ["star", { content: "plus", childrenMarker: "disc", items: [{ content: "nested", items: ["deeper"] }] }] } },
    { type: "code", data: { code: "unclosed fence" } },
  ]);
  assert.deepEqual(markdownToBlocks("  - orphan nested first\n- top"), [{ type: "list", data: { style: "unordered", items: [{ content: "", childrenMarker: "disc", items: ["orphan nested first"] }, "top"] } }]);
  assert.deepEqual(markdownToBlocks(""), []);
  assert.deepEqual(markdownToBlocks("![x](javascript:alert(1))"), [{ type: "paragraph", data: { text: "x)" } }]);
  assert.deepEqual(markdownToBlocks("![x](javascript:alert)"), [{ type: "paragraph", data: { text: "x" } }]);
});

test("markdownInlineToHtml escapes HTML, keeps safe links and images, drops unsafe ones", () => {
  assert.equal(markdownInlineToHtml("<b>raw</b> **bold** __also__ *em* _em_ `code` [t](/local) [u](javascript:x) ![a](https://example.org/i.png) ![b](data:x)"), '&lt;b&gt;raw&lt;/b&gt; <strong>bold</strong> <strong>also</strong> <em>em</em> <em>em</em> <code>code</code> <a href="/local">t</a> u <img src="https://example.org/i.png" alt="a"> b');
  assert.equal(markdownInlineToHtml("**[link](https://example.org)**"), '<strong><a href="https://example.org">link</a></strong>');
  assert.equal(markdownInlineToHtml("line  \nbreak\\\nagain\nplain"), "line<br>break<br>again<br>plain");
  assert.equal(markdownInlineToHtml('Photo ![A "quote"](/pictures/photo.png) and [report](/files/"report".pdf)'), 'Photo <img src="/pictures/photo.png" alt="A &quot;quote&quot;"> and <a href="/files/&quot;report&quot;.pdf">report</a>');
});

test("standalone Markdown comments can resolve to blocks outside code fences", () => {
  const kept = block("kept", "attachment", { resourceId: "file", title: "Report" });
  const result = markdownToBlocks("Before\n<!-- saved -->\nAfter\n\n```\n<!-- saved -->\n```", { resolveComment: (comment) => comment === "saved" ? kept : undefined });
  assert.deepEqual(result, [
    { type: "paragraph", data: { text: "Before" } },
    kept,
    { type: "paragraph", data: { text: "After" } },
    { type: "code", data: { code: "<!-- saved -->" } },
  ]);
});

test("looksLikeMarkdown", () => {
  for (const text of ["# Title", "- item", "1. item", "> quote", "```", "---", "![a](https://x)", "| a | b |", "some **bold** words", "a [link](https://example.org)"]) assert.equal(looksLikeMarkdown(text), true, text);
  assert.equal(looksLikeMarkdown("See [note] and [report [revised](/reports)."), true);
  assert.equal(looksLikeMarkdown("See [the report](http://example.org)."), true);
  for (const text of ["plain text", "two\nlines", "", "a * b * c", "[not a link](x)", "[](/reports)", "See [note"]) assert.equal(looksLikeMarkdown(text), false, text);
});

test("wrapped and loose ordered items keep their numbering and their Markdown boundaries", () => {
  const source = [
    "1. A line that", "   wraps in the source.", "2. Another item", "with a lazy continuation.",
    "", "3. A **third** item  ", "   with a deliberate break.", "", "   Another paragraph.",
    "", "A separate paragraph.", "", "1) New list", "- Bullets", "## Next heading",
  ].join("\n");
  const blocks = markdownToBlocks(source);
  assert.deepEqual(blocks, [
    { type: "list", data: { style: "ordered", items: ["A line that wraps in the source.", "Another item with a lazy continuation.", "A <strong>third</strong> item<br>with a deliberate break.<br><br>Another paragraph."] } },
    { type: "paragraph", data: { text: "A separate paragraph." } },
    { type: "list", data: { style: "ordered", items: ["New list"] } },
    { type: "list", data: { style: "unordered", items: ["Bullets"] } },
    { type: "header", data: { text: "Next heading", level: 2 } },
  ]);
  const markdown = blockToMarkdown(blocks[0]!);
  assert.deepEqual(markdownToBlocks(markdown!), [blocks[0]]);
});

test("nested items keep their own continuations and the next fence stays outside the list", () => {
  const blocks = markdownToBlocks("1. Parent\n   1. Nested\n      on two lines\n   back on parent\n2. Next\n```js\nlet a;\n```");
  assert.deepEqual(blocks, [
    { type: "list", data: { style: "ordered", items: [{ content: "Parent back on parent", items: ["Nested on two lines"], childrenMarker: "decimal" }, "Next"] } },
    { type: "code", data: { code: "let a;", language: "js" } },
  ]);
});

test("styled nested lists retain their type in HTML and Markdown exports", () => {
  const document = { blocks: [block("l", "list", { style: "unordered", items: [{ content: "Alpha", items: ["Beta"], childrenMarker: "square" }] })] };
  assert.equal(documentToMarkdown(document), "- Alpha\n  - Beta");
  assert.match(documentToHtml(document), /<ul class="elea-list elea-list--unordered elea-list--level-1 elea-list-marker-square">/);
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
  assert.equal(edge, '<div class="elea-content"><div class="elea-block elea-block--attachment" data-elea-block-type="attachment"><div class="elea-attachment"><span class="elea-attachment__link elea-attachment__link--static"><span class="elea-attachment__title">T</span><span class="elea-attachment__description">D</span></span></div></div><div class="elea-block elea-block--raw" data-elea-block-type="raw"><div class="elea-raw">raw</div></div><div class="elea-block elea-block--widget" data-elea-block-type="widget"><div class="elea-unknown"><p>shown</p></div></div></div>');
  assert.equal(documentToHtml({ blocks: [] }), '<div class="elea-content"></div>');
});

test("a tag named like an object property is plain markup, not a mark", () => {
  assert.equal(inlineHtmlToMarkdown("a <constructor>b</constructor> <toString>c</toString> <strong>d</strong>"), "a b c **d**");
});

test("source and visual line breaks round trip through portable hard breaks", () => {
  for (const separator of ["\n", "  \n", "\\\n"]) {
    const blocks = markdownToBlocks(`First${separator}Second\n\nThird`);
    assert.deepEqual(blocks.map(block => block.data), [{ text: "First<br>Second" }, { text: "Third" }]);
    assert.equal(blockToMarkdown(blocks[0]!), "First  \nSecond");
  }
  assert.deepEqual(markdownToBlocks("First\n\n\nSecond").map(b => b.type), ["paragraph", "paragraph"]);
});

test("media destinations, quotes and brackets remain portable through export and import", () => {
  const caption = 'A "quoted" caption';
  const alt = "Leaf [detail]";
  const url = "/assets/leaf(v2).png";
  const block = { type: "image", data: { file: { fileId: "asset" }, caption, alt } };
  const markdown = blockToMarkdown(block, { resolveAssetUrl: file => file.id === "asset" ? url : "" });
  assert.equal(markdown, '![Leaf \\[detail\\]](/assets/leaf\\(v2\\).png "A \\"quoted\\" caption")');
  assert.deepEqual(markdownToBlocks(markdown!)[0]?.data, { file: { url, id: "" }, caption, alt });
  assert.equal(blockToMarkdown({ type: "image", data: { url: "/old.png" } }), "![](/old.png)");
  assert.equal(blockToMarkdown({ type: "embed", data: { source: "/sample.mp4", caption: "Tour" } }), "[Tour](/sample.mp4)");
  assert.equal(markdownInlineToHtml("[Tour](/v(a).mp4)"), '<a href="/v(a).mp4">Tour</a>');
});

test("document-relative media link directly to nearby files", () => {
  assert.deepEqual(markdownToBlocks("![Leaf](pictures/leaf.jpg)")[0]?.data, { file: { url: "./pictures/leaf.jpg", id: "" }, alt: "Leaf", caption: "" });
  assert.equal(markdownInlineToHtml("[Report](notes.pdf)"), '<a href="./notes.pdf">Report</a>');
  assert.equal(blockToMarkdown({ type: "image", data: { file: { url: "pictures/leaf.jpg" }, alt: "Leaf" } }), "![Leaf](pictures/leaf.jpg)");
});

test("only image blocks accept supported base64 image media", () => {
  const image = "data:image/png;base64,iVBORw0KGgo=";
  const markdown = `![Pixel](${image})`;
  assert.equal(blockToMarkdown({ type: "image", data: { file: { url: image }, alt: "Pixel" } }), markdown);
  assert.equal((markdownToBlocks(markdown)[0]?.data as {file: {url: string}}).file.url, image);
  assert.equal(markdownInlineToHtml(`[File](${image})`), "File");
  assert.notEqual(markdownToBlocks("![File](data:text/plain;base64,QQ==)", { preserveEmptyParagraphs: true })[0]?.type, "image");
});

test("documentToHtml reduces rich text to plain text when no sanitizer is given", () => {
  const html = documentToHtml(createDocument([
    block("p", "paragraph", { text: 'Hi <img src=x onerror="alert(1)"><strong>you</strong> &amp; me<br>next' }),
    block("r", "raw", { html: "<script>alert(1)</script>" }),
    block("l", "list", { style: "unordered", items: ['<a href="javascript:alert(1)">x</a>'] }),
  ]));
  assert.ok(html.includes('<div class="elea-paragraph">Hi you &amp; me<br>next</div>'));
  assert.ok(html.includes('<li class="elea-list__item">x</li>'));
  assert.ok(!/<img|<script|<a |onerror/.test(html));
});

test("text that reads as Markdown syntax survives the round trip", () => {
  const texts = ["1. not a list", "# not a heading", "- not an item", "&gt; not a quote", "---", "2 * 3 * 4", "snake_case_name and _edge_",
    "a [bracket](x) and `tick`", "back\\slash \\* star", "<strong>bold </strong>then <em>a * b</em>", '<a href="https://example.org/a_(b)">l*nk</a>'];
  for (const text of texts) {
    const markdown = documentToMarkdown({ blocks: [block("p", "paragraph", { text })] });
    assert.deepEqual(markdownToBlocks(markdown), [{ type: "paragraph", data: { text: text.replace("bold </strong>", "bold</strong> ") } }], markdown);
  }
  assert.equal(inlineHtmlToMarkdown("<a href='/single'>q</a> <b>open <i>nested</b> tail <code>a*b <b>c</b></code></i>"), "[q](/single) **open nested** tail `a*b c`");
  assert.equal(markdownInlineToHtml("snake_case_name __init__ a_b_ *_x_* \\*no\\*"), "snake_case_name <strong>init</strong> a_b_ <em><em>x</em></em> *no*");
});

test("code keeps its language and any backticks it contains", () => {
  const code = block("c", "code", { code: "```js\nlet a;\n```\n````", language: "md" });
  const markdown = documentToMarkdown({ blocks: [code] });
  assert.equal(markdown, "`````md\n```js\nlet a;\n```\n````\n`````");
  assert.deepEqual(markdownToBlocks(markdown), [{ type: "code", data: code.data }]);
  assert.equal(blockToMarkdown(block("c", "code", { code: "x", language: "not a token" })), "```\nx\n```");
});

test("headings close on a spaced run of hashes only", () => {
  assert.deepEqual(markdownToBlocks("# C#\n\n## Title ##\n\n#hashtag\n\n####### seven"), [
    { type: "header", data: { text: "C#", level: 1 } },
    { type: "header", data: { text: "Title", level: 2 } },
    { type: "paragraph", data: { text: "#hashtag" } },
    { type: "paragraph", data: { text: "####### seven" } },
  ]);
});

test("hostile input is read in linear time", () => {
  const size = 200_000;
  const started = performance.now();
  markdownToBlocks(`# ${" ".repeat(size)}x`);
  for (const unit of ["[", "![", "**a", "_a ", "`", "[a](", "![a](b ", "[a](b"]) markdownInlineToHtml(unit.repeat(size / unit.length));
  for (const unit of ["<b>", "<a href=x>", "<code>", "<i>x</b>", "<", "<b"]) inlineHtmlToMarkdown(unit.repeat(size / unit.length));
  assert.ok(performance.now() - started < 3000, `took ${performance.now() - started} ms`);
});

test("a checklist keeps the state of its tasks through normalization, HTML and Markdown", () => {
  const data = { style: "checklist", meta: {}, items: [{ content: "Done", meta: { checked: true }, items: [] }, { content: "To do", meta: { checked: false }, items: [{ content: "Sub", meta: { checked: true }, items: [] }] }, "bare"] };
  const document = { blocks: [block("c", "list", data)] };
  const tasks = [{ content: "Done", meta: { checked: true }, items: [] }, { content: "To do", meta: { checked: false }, items: [{ content: "Sub", meta: { checked: true }, items: [] }] }];
  assert.deepEqual(defaultRegistry.get("list")?.normalize?.(data), { style: "checklist", items: [...tasks, "bare"] });

  const markdown = documentToMarkdown(document);
  assert.equal(markdown, "- [x] Done\n- [ ] To do\n  - [x] Sub\n- [ ] bare");
  assert.deepEqual(markdownToBlocks(markdown), [{ type: "list", data: { style: "checklist", items: [...tasks, { content: "bare", meta: { checked: false }, items: [] }] } }]);
  // One item that is not a task makes it a plain list
  assert.deepEqual(markdownToBlocks("- [x] a\n- plain")[0]?.data, { style: "unordered", items: ["[x] a", "plain"] });

  const html = documentToHtml(document);
  assert.match(html, /<ul class="elea-list elea-list--checklist elea-list--level-0"><li class="elea-list__item"><label class="elea-list__task"><input type="checkbox" class="elea-list__check" disabled checked><span>Done<\/span><\/label><\/li>/);
  assert.match(html, /<input type="checkbox" class="elea-list__check" disabled><span>To do<\/span><\/label><ul class="elea-list elea-list--checklist elea-list--level-1">/);
  // A marker has no say in a checklist
  assert.equal(documentToMarkdown({ blocks: [block("m", "list", { style: "checklist", marker: "decimal", items: ["a"] })] }), "- [ ] a");
});
