import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { createDocument, en, fr, defaultRegistry } from "@alien6-studio/elea-content";
import { ContentView } from "./ContentView.js";
import { ContentExcerpt } from "./components/ContentExcerpt.js";
import { ContentSkeleton } from "./components/ContentSkeleton.js";
import { VideoEmbed } from "./components/VideoEmbed.js";
import { createContentViewContext, type BlockRendererProps } from "./context.js";
import { createDefaultSanitizer, htmlToPlainText } from "./sanitizer.js";
import { SanitizedHtml } from "./components/SanitizedHtml.js";
import { attachmentHref } from "./blocks/media.js";
import { safeImageSource, safeLocation } from "./safeUrl.js";

const render = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element);
const block = (id: string, type: string, data: Record<string, unknown>) => ({ id, type, data });

test("ContentView wraps each block with its id and type and renders text blocks", () => {
  const html = render(
    <ContentView
      data={createDocument([
        block("h", "header", { text: "Title <script>x</script>", level: 2 }),
        block("p", "paragraph", { text: "<p>Hello <strong>world</strong></p>" }),
        block("l", "list", { style: "ordered", items: ["one", { content: "two", items: ["deep"] }] }),
        block("q", "quote", { text: "Words", caption: "Author" }),
      ])}
      className="article"
    />,
  );
  assert.match(html, /^<div class="elea-content article">/);
  assert.match(html, /<div class="elea-block elea-block--header" data-elea-block-id="h" data-elea-block-type="header"><h2 class="elea-heading elea-heading--2">Title <\/h2>/);
  assert.match(html, /<div class="elea-paragraph"><p>Hello <strong>world<\/strong><\/p><\/div>/);
  assert.match(html, /<ol class="elea-list elea-list--ordered elea-list--level-0"><li class="elea-list__item">one<\/li><li class="elea-list__item"><span>two<\/span><ul class="elea-list elea-list--unordered elea-list--level-1" aria-label="Nested list level 1">/);
  assert.match(html, /<blockquote class="elea-quote"><div class="elea-quote__text">Words<\/div><cite class="elea-quote__caption">— Author<\/cite><\/blockquote>/);
});

test("ContentView reads JSON strings and plain text, and falls back when empty or loading", () => {
  assert.match(render(<ContentView data='{"blocks":[{"type":"paragraph","data":{"text":"From JSON"}}]}' />), /From JSON/);
  assert.match(render(<ContentView data={"Plain\n\nText"} />), /<div class="elea-paragraph">Plain<\/div>.*<div class="elea-paragraph">Text<\/div>/);
  assert.equal(render(<ContentView data={null} />), "");
  assert.match(render(<ContentView data="x" typography="inherit" className="host" />), /^<div class="elea-content elea-content--inherit host">/);
  assert.match(render(<ContentView data="x" typography="elea" />), /^<div class="elea-content">/);
  assert.equal(render(<ContentView data={null} emptyFallback={<p>Nothing</p>} />), "<p>Nothing</p>");
  assert.equal(render(<ContentView data="x" loading loadingFallback={<ContentSkeleton messages={en} />} />).startsWith('<div class="elea-content-skeleton" role="status"'), true);
  assert.equal(render(<ContentView data="x" loading />), "");
});

test("empty blocks render an empty wrapper, unknown types show their text only", () => {
  const html = render(<ContentView data={createDocument([block("e", "paragraph", { text: "" }), block("w", "widget", { text: "<b>W</b>" }), block("c", "custom", {})])} />);
  assert.match(html, /<div class="elea-block elea-block--paragraph" data-elea-block-id="e" data-elea-block-type="paragraph"><\/div>/);
  assert.match(html, /<div class="elea-unknown" data-elea-unknown-type="widget"><\/div>/);
  assert.match(html, /<div class="elea-unknown" data-elea-unknown-type="custom"><\/div>/);
});

test("custom renderers and registries extend the viewer", () => {
  const Widget = ({ block: current }: BlockRendererProps) => <p className="widget">{String(current.data.name)}</p>;
  const html = render(<ContentView data={createDocument([block("w", "widget", { name: "clock" })])} renderers={{ widget: Widget }} />);
  assert.match(html, /<p class="widget">clock<\/p>/);
});

test("media blocks resolve assets and refuse unsafe locations", () => {
  const resolve = (file: { url: string; id: string }) => `https://cdn.example/${file.id || file.url}`;
  const html = render(
    <ContentView
      data={createDocument([
        block("i", "image", { file: { url: "", id: "img-1" }, caption: "Cap", alt: "" }),
        block("i2", "image", { file: { url: "", id: "" }, caption: "" }),
        block("v", "video", { url: "https://youtu.be/dQw4w9WgXcQ", caption: "Clip" }),
        block("v2", "video", { url: "", caption: "" }),
        block("a", "attachment", { resourceId: "r1", title: "Report", type: "application/pdf", description: "Desc", url: "javascript:alert(1)", file: { url: "", id: "f1" } }),
        block("a2", "attachment", { resourceId: "r2", title: "Site", type: "", description: "", url: "https://example.org/doc" }),
        block("a3", "attachment", { resourceId: "r3", title: "Nowhere", type: "", description: "", url: "" }),
        block("a4", "attachment", { resourceId: "", title: "", type: "", description: "", url: "" }),
      ])}
      resolveAssetUrl={resolve}
      messages={fr}
    />,
  );
  assert.match(html, /<img src="https:\/\/cdn.example\/img-1" alt="Cap" class="elea-image" loading="lazy"\/><figcaption class="elea-caption">Cap<\/figcaption>/);
  assert.match(html, /data-elea-block-id="i2" data-elea-block-type="image"><\/div>/);
  assert.match(html, /<iframe src="https:\/\/www.youtube.com\/embed\/dQw4w9WgXcQ" class="elea-video__media" allow="[^"]+" allowFullScreen="" title="Clip"><\/iframe>/);
  assert.match(html, /data-elea-block-id="v2" data-elea-block-type="video"><\/div>/);
  assert.match(html, /<a href="https:\/\/cdn.example\/f1" target="_blank" rel="noopener noreferrer" class="elea-attachment__link"><span class="elea-attachment__icon elea-attachment__icon--pdf" aria-hidden="true" data-kind="pdf"><\/span>/);
  assert.match(html, /<a href="https:\/\/example.org\/doc"/);
  assert.match(html, /<span class="elea-attachment__link elea-attachment__link--static">.*Nowhere/);
  assert.match(html, /data-elea-block-id="a4" data-elea-block-type="attachment"><\/div>/);
  assert.match(html, /Desc<\/span><span class="elea-attachment__type">application\/pdf<\/span>/);
});

test("attachmentHref prefers a safe URL, then the file, then nothing", () => {
  const resolve = (file: { url: string; id: string }) => `/files/${file.id}`;
  const base = { resourceId: "r", title: "t", type: "", description: "" };
  assert.equal(attachmentHref({ ...base, url: "/docs/a.pdf" }, resolve), "/docs/a.pdf");
  assert.equal(attachmentHref({ ...base, url: "data:x", file: { url: "", id: "f" } }, resolve), "/files/f");
  assert.equal(attachmentHref({ ...base, url: "" }, resolve), null);
});

test("host attachment icons retain link semantics and distinguish resource types from legacy extensions", () => {
  const data = createDocument([
    block("linked", "attachment", { resourceId: "r", title: "Reference", type: "application/pdf", url: "/reference.pdf" }),
    block("static", "attachment", { resourceId: "s", title: "Sheet", type: "xlsx" }),
    block("legacy", "attaches", { file: { name: "deck.pptx", extension: "PPTX", url: "/deck.pptx" } }),
    block("legacy-static", "attaches", { file: { name: "recording.mp3" } }),
    block("fallback", "attaches", { file: { extension: "zip" } }),
  ]);
  const html = render(
    <ContentView data={data} renderAttachmentIcon={({ type, kind, blockType }) => kind === "archive"
      ? null
      : <svg data-type={type} data-kind={kind} data-block={blockType} />} />,
  );
  const doc = JSDOM.fragment(html);
  const icons = [...doc.querySelectorAll(".elea-attachment__custom-icon[aria-hidden=true] > svg")];
  assert.deepEqual(icons.map((icon) => [icon.getAttribute("data-block"), icon.getAttribute("data-type"), icon.getAttribute("data-kind")]), [
    ["attachment", "application/pdf", "pdf"],
    ["attachment", "xlsx", "spreadsheet"],
    ["attaches", "PPTX", "presentation"],
    ["attaches", "", "audio"],
  ]);
  assert.equal(icons[0]?.closest("a")?.getAttribute("href"), "/reference.pdf");
  assert.equal(icons[1]?.closest("a"), null);
  assert.equal(icons[2]?.closest("a")?.getAttribute("download"), "deck.pptx");
  assert.equal(icons[3]?.closest("a"), null);
  assert.equal(doc.querySelectorAll(".elea-attachment__icon--archive[aria-hidden=true]").length, 1);
});

test("legacy EditorJS blocks render: delimiter, code, raw, embed, attaches, table", () => {
  const html = render(
    <ContentView
      data={createDocument([
        block("d", "delimiter", {}),
        block("c", "code", { code: "const a = '<b>'" }),
        block("c2", "code", {}),
        block("r", "raw", { html: '<p onclick="x()">raw</p>' }),
        block("r2", "raw", {}),
        block("e", "embed", { source: "https://vimeo.com/123", caption: "Vid" }),
        block("e2", "embed", { embed: "https://example.org/x" }),
        block("e3", "embed", {}),
        block("f", "attaches", { file: { fileId: "f9", name: "report.pdf", extension: "pdf" }, title: "" }),
        block("f2", "attaches", { file: { url: "javascript:x", name: "evil" } }),
        block("f3", "attaches", {}),
        block("t", "table", { content: [["H1", "H2"], ["<i>a</i>", "b"], "bad"] }),
        block("t2", "table", { withHeadings: false, content: [["x"]] }),
        block("t3", "table", { content: [] }),
        block("n", "nestedlist", { style: "unordered", items: ["n"] }),
      ])}
      resolveAssetUrl={(file) => (file.id ? `/assets/${file.id}` : file.url)}
    />,
  );
  assert.match(html, /<hr class="elea-delimiter"\/>/);
  assert.match(html, /<pre class="elea-code"><code>const a = &#x27;&lt;b&gt;&#x27;<\/code><\/pre>/);
  assert.match(html, /data-elea-block-id="c2" data-elea-block-type="code"><\/div>/);
  assert.match(html, /<div class="elea-raw"><p>raw<\/p><\/div>/);
  assert.match(html, /<iframe src="https:\/\/player.vimeo.com\/video\/123"/);
  assert.match(html, /<figcaption class="elea-caption">Vid<\/figcaption>/);
  assert.match(html, /elea-video--unsupported"><p>Unsupported video format<\/p><a href="https:\/\/example.org\/x" target="_blank" rel="noopener noreferrer">Watch video<\/a>/);
  assert.match(html, /data-elea-block-id="e3" data-elea-block-type="embed"><\/div>/);
  assert.match(html, /<a href="\/assets\/f9" target="_blank" rel="noopener noreferrer" download="report.pdf" class="elea-attachment__link">.*report.pdf<\/span><span class="elea-attachment__type">PDF<\/span>/);
  assert.match(html, /elea-attachment__link--static">.*evil/);
  assert.match(html, /data-elea-block-id="f3" data-elea-block-type="attaches"><\/div>/);
  assert.match(html, /<table class="elea-table"><tbody><tr><th>H1<\/th><th>H2<\/th><\/tr><tr><td><i>a<\/i><\/td><td>b<\/td><\/tr><\/tbody><\/table>/);
  assert.match(html, /<tr><td>x<\/td><\/tr>/);
  assert.match(html, /data-elea-block-id="t3" data-elea-block-type="table"><\/div>/);
  assert.match(html, /<ul class="elea-list elea-list--unordered elea-list--level-0"><li class="elea-list__item">n<\/li><\/ul>/);
});

test("legacy hierarchy indents paragraphs after an introducer", () => {
  const html = render(<ContentView data={createDocument([block("a", "paragraph", { text: "Points:" }), block("b", "paragraph", { text: "detail" })])} legacyHierarchy />);
  assert.match(html, /<div class="elea-paragraph elea-paragraph--introducer">Points:<\/div>/);
  assert.match(html, /<div class="elea-paragraph elea-paragraph--sub-item">detail<\/div>/);
});

test("the sanitizer applies the link policy of the viewer context", () => {
  const sanitizer = createDefaultSanitizer({ links: { siteHostnames: ["members.example.org"] } });
  const html = render(
    <ContentView
      data={createDocument([block("p", "paragraph", { text: '<a href="https://members.example.org/x">in</a> <a href="https://other.example/y">out</a> <img src="data:image/png;base64,AA">' })])}
      sanitizer={sanitizer}
    />,
  );
  assert.match(html, /<a href="https:\/\/members.example.org\/x">in<\/a> <a href="https:\/\/other.example\/y" target="_blank" rel="noopener noreferrer">out<\/a> <\/div>/);
  assert.equal(createContentViewContext().registry, defaultRegistry);
  assert.equal(createContentViewContext({ messages: fr }).messages.toolbar.bold, "Gras (Ctrl+B)");
});

test("site hostnames configure the default sanitizer and a supplied sanitizer takes precedence", () => {
  const data = '<a href="https://members.example.org/one">Internal</a> <a href="https://other.example/two">External</a>';
  const siteHostnames = ["members.example.org"];
  const html = render(<ContentView data={data} siteHostnames={siteHostnames} />);
  assert.match(html, /<a href="https:\/\/members.example.org\/one">Internal<\/a>/);
  assert.match(html, /<a href="https:\/\/other.example\/two" target="_blank" rel="noopener noreferrer">External<\/a>/);

  const custom = createDefaultSanitizer({ links: { siteHostnames: ["other.example"] } });
  const customized = render(<ContentView data={data} siteHostnames={siteHostnames} sanitizer={custom} />);
  assert.match(customized, /<a href="https:\/\/members.example.org\/one" target="_blank" rel="noopener noreferrer">Internal<\/a>/);
  assert.match(customized, /<a href="https:\/\/other.example\/two">External<\/a>/);
});

test("VideoEmbed plays direct files with a video element", () => {
  const html = render(<VideoEmbed url="https://cdn.example/clip.webm" messages={en} className="extra" />);
  assert.match(html, /<div class="elea-video extra"><video controls="" class="elea-video__media"><source src="https:\/\/cdn.example\/clip.webm" type="video\/webm"\/>Your browser does not support video playback.<\/video><\/div>/);
  assert.match(render(<VideoEmbed url="https://cdn.example/film.ogg" messages={en} />), /<source src="https:\/\/cdn.example\/film.ogg" type="video\/ogg"\/>/);
  assert.match(render(<VideoEmbed url="https://cdn.example/clip.MP4?token=a.b#t=1" messages={en} />), /type="video\/mp4"\/>/);
  assert.match(render(<VideoEmbed url="/videos/clip.mov" messages={en} />), /<source src="\/videos\/clip.mov"\/>/);
  assert.match(render(<VideoEmbed url="https://youtu.be/dQw4w9WgXcQ" messages={en} />), /title="Video"/);
});

test("ContentExcerpt gives one line and nothing for empty content", () => {
  const mixed = [block("c", "code", { code: "internal snippet" }), block("h", "header", { text: "Short title" })];
  assert.equal(render(<ContentExcerpt data={mixed} blockTypes={["header", "paragraph"]} />), '<p class="elea-content-excerpt">Short title</p>');
  assert.equal(render(<ContentExcerpt data={createDocument([block("p", "paragraph", { text: "<p>Hello <b>there</b></p>" }), block("h", "header", { text: "T", level: 1 })])} />), '<p class="elea-content-excerpt">Hello there T</p>');
  assert.equal(render(<ContentExcerpt data="Some words here" maxLength={9} as="span" className="x" />), '<span class="elea-content-excerpt x">Some word…</span>');
  assert.equal(render(<ContentExcerpt data={null} />), "");
});

test("sanitized fragments preserve semantic formatting and use the host link policy in the first HTML", () => {
  const sanitizer = createDefaultSanitizer({ links: { siteHostnames: ["guide.example"] } });
  const html = '<em>Guide</em> <a href="https://guide.example/book">Book</a> <a href="https://outside.example/">Source</a>';
  const output = render(<SanitizedHtml as="aside" html={html} sanitizer={sanitizer} className="note" />);
  const fragment = JSDOM.fragment(output);
  assert.equal(fragment.querySelector("aside.note > em")?.textContent, "Guide");
  assert.equal(fragment.querySelector("a")?.getAttribute("target"), null);
  assert.equal(fragment.querySelectorAll("a")[1]?.getAttribute("rel"), "noopener noreferrer");
  assert.equal(htmlToPlainText("<span>Cr&egrave;me&nbsp;</span><b>&amp; miel</b><script>void 0</script>"), "Crème\u00a0& miel");
});

test("resolved asset URLs are checked before use: images, attachments, videos and embeds", () => {
  const evil = () => "javascript:alert(1)";
  const html = render(
    <ContentView
      data={createDocument([
        block("i", "image", { file: { url: "", id: "x" }, caption: "" }),
        block("i2", "image", { file: { url: "data:image/png;base64,AAAA", id: "" }, caption: "inline" }),
        block("a", "attachment", { resourceId: "r", title: "T", type: "", description: "", url: "", file: { url: "", id: "f" } }),
        block("v", "video", { url: "javascript:alert(1)", caption: "" }),
        block("v2", "video", { url: "https://example.org/page", caption: "" }),
        block("e", "embed", { source: "javascript:alert(1)" }),
      ])}
      resolveAssetUrl={(file) => (file.url ? file.url : evil())}
    />,
  );
  assert.match(html, /data-elea-block-id="i" data-elea-block-type="image"><\/div>/);
  assert.match(html, /<img src="data:image\/png;base64,AAAA" alt="inline"/);
  assert.match(html, /elea-attachment__link--static/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /data-elea-block-id="v" data-elea-block-type="video"><\/div>/);
  assert.match(html, /data-elea-block-id="v2" data-elea-block-type="video"><\/div>/);
  assert.match(html, /data-elea-block-id="e" data-elea-block-type="embed"><\/div>/);
  assert.match(render(<VideoEmbed url="vbscript:x" messages={en} />), /elea-video--unsupported"><p>Unsupported video format<\/p><\/div>/);
});

test("safeLocation and safeImageSource", () => {
  assert.equal(safeLocation(" https://example.org/a "), "https://example.org/a");
  assert.equal(safeLocation("/path"), "/path");
  assert.equal(safeLocation("javascript:x"), null);
  assert.equal(safeLocation(""), null);
  assert.equal(safeLocation(undefined), null);
  assert.equal(safeImageSource("data:image/svg+xml;base64,AAAA"), "data:image/svg+xml;base64,AAAA");
  assert.equal(safeImageSource("data:text/html;base64,AAAA"), null);
  assert.equal(safeImageSource("/img.png"), "/img.png");
  assert.equal(safeImageSource(null), null);
});

test("renderers are looked up as own properties: prototype names fall back unless registered", () => {
  const doc = createDocument([block("c", "constructor", { text: "c" }), block("p", "__proto__", {}), block("t", "toString", {}), block("h", "hasOwnProperty", {})]);
  const html = render(<ContentView data={doc} />);
  assert.equal((html.match(/class="elea-unknown"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /function|native code/);
  const Custom = ({ block: current }: BlockRendererProps) => <p className="custom">{current.type}</p>;
  const explicit = render(<ContentView data={doc} renderers={{ constructor: Custom, toString: Custom }} />);
  assert.equal((explicit.match(/class="custom"/g) ?? []).length, 2);
});

test("nestedlist renders like list, with invalid items dropped and depth bounded", () => {
  const html = render(<ContentView data={createDocument([block("n", "nestedlist", { style: "ordered", items: [null, "a", { content: "b", items: [{}, "c"] }] }), block("e", "nestedlist", { items: {} }), block("x", "list", { items: [null] })])} />);
  assert.match(html, /<ol class="elea-list elea-list--ordered elea-list--level-0"><li class="elea-list__item">a<\/li><li class="elea-list__item"><span>b<\/span><ul class="elea-list elea-list--unordered elea-list--level-1" aria-label="Nested list level 1"><li class="elea-list__item">c<\/li><\/ul><\/li><\/ol>/);
  assert.match(html, /data-elea-block-id="e" data-elea-block-type="nestedlist"><\/div>/);
  assert.match(html, /data-elea-block-id="x" data-elea-block-type="list"><\/div>/);
});

test("ids of blocks without one are stable across renders and valid ids are kept", () => {
  const first = render(<ContentView data={"Plain\n\nText"} />);
  const second = render(<ContentView data={"Plain\n\nText"} />);
  assert.equal(first, second);
  assert.match(first, /data-elea-block-id="elea-1".*data-elea-block-id="elea-2"/);
  const mixed = render(<ContentView data={{ blocks: [{ id: "keep", type: "paragraph", data: { text: "a" } }, { type: "paragraph", data: { text: "b" } }, { id: "keep", type: "paragraph", data: { text: "c" } }] }} />);
  assert.match(mixed, /data-elea-block-id="keep".*data-elea-block-id="elea-1".*data-elea-block-id="elea-2"/);
});

test("a quote whose text holds paragraphs renders valid HTML", () => {
  const html = render(<ContentView data={createDocument([block("q", "quote", { text: "<p>One</p><p>Two</p>", caption: "" })])} />);
  assert.match(html, /<blockquote class="elea-quote"><div class="elea-quote__text"><p>One<\/p><p>Two<\/p><\/div><\/blockquote>/);
});

test("a checklist shows which of its tasks are done, at every level", () => {
  const html = render(<ContentView data={createDocument([block("c", "list", { style: "checklist", meta: {}, items: [{ content: "Done", meta: { checked: true }, items: [] }, { content: "To do", meta: { checked: false }, items: [{ content: "Sub", meta: { checked: true }, items: [] }] }, "bare"] })])} />);
  const page = new JSDOM(html).window.document;
  const boxes = [...page.querySelectorAll<HTMLInputElement>(".elea-list--checklist input[type=checkbox]")];
  assert.deepEqual(boxes.map((box) => [box.closest("label")?.textContent, box.checked, box.disabled]), [["Done", true, true], ["To do", false, true], ["Sub", true, true], ["bare", false, true]]);
  assert.equal(page.querySelectorAll("ol").length, 0);
  assert.equal(page.querySelectorAll("ul.elea-list--checklist").length, 2);
});
