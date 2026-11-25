import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultRegistry, type EleaBlock } from "@alien6-studio/elea-content";
import { createMarkdownSource, readMarkdownSource } from "./markdownSource.js";

const paragraph = (id: string, text: string): EleaBlock => ({ id, type: "paragraph", data: { text } });

test("two adjacent Markdown links stay separate when editing a media link", () => {
  const source = createMarkdownSource([{ id: "v", type: "video", data: { url: "/clip.mp4", caption: "Clip" } }]);
  const { blocks } = readMarkdownSource("[Clip](/clip.mp4) [Notes](/notes)", source, defaultRegistry);
  assert.deepEqual(blocks, [paragraph("v", '<a href="/clip.mp4">Clip</a> <a href="/notes">Notes</a>')]);
});

test("editing only the attribution preserves the original rich quote body", () => {
  const quote = { id: "q", type: "quote", data: { text: "<u>Words</u><br>continued", caption: "Author", alignment: "center" } };
  const source = createMarkdownSource([quote]);
  const { blocks } = readMarkdownSource(source.text.replace("— Author", "— Editor"), source, defaultRegistry);
  assert.deepEqual(blocks, [{ ...quote, data: { ...quote.data, caption: "Editor" } }]);
});

test("editing Markdown preserves block extensions and non-Markdown table settings", () => {
  const intro = { ...paragraph("intro", "Before"), tunes: { align: "right" } };
  const table = { id: "table", type: "table", data: { withHeadings: false, content: [["Plant"], ["Oak"]] }, tunes: { layout: "wide" } };
  const source = createMarkdownSource([intro, table]);
  const { blocks: changed } = readMarkdownSource(source.text.replace("Before", "After").replace("Oak", "Ash"), source, defaultRegistry);
  assert.deepEqual(changed, [
    { ...intro, data: { text: "After" } },
    { ...table, data: { withHeadings: false, content: [["Plant"], ["Ash"]] } },
  ]);
});

test("stored empty paragraphs and opaque lists and tables survive editing their neighbour", () => {
  const opaque = [
    paragraph("spacing", ""),
    { id: "check", type: "list", data: { style: "checklist", items: [{ content: "Task", checked: true }] } },
    { id: "mixed", type: "list", data: { items: [null, "Text"] } },
    { id: "legacy", type: "nestedlist", data: { items: [{ text: "Title" }] } },
    { id: "decorated", type: "list", data: { items: [{ content: "First", items: ["Second"], childrenMarker: "square" }] } },
    { id: "ragged", type: "table", data: { content: [["Title"], ["A", "B"]] } },
    { id: "decorated-cell", type: "table", data: { content: [[{ content: "Text", span: 2 }]] } },
    { id: "stored-image", type: "image", data: { file: { url: "/demo.png" }, caption: { text: "Demo" } } },
  ];
  const source = createMarkdownSource([paragraph("intro", "Before"), ...opaque]);
  assert.doesNotMatch(source.text, /elea:block|<!--/);
  const { blocks: changed } = readMarkdownSource(source.text.replace("Before", "After"), source, defaultRegistry);
  assert.equal(changed.length, opaque.length + 1);
  opaque.forEach((block, index) => assert.equal(changed[index + 1], block));

  const blank = createMarkdownSource([paragraph("draft", "")]);
  assert.equal(blank.text, "");
  assert.deepEqual(readMarkdownSource("Hello", blank, defaultRegistry).blocks, [paragraph("draft", "Hello")]);
});

test("duplicate opaque references keep independent plugin data and stable identities as typing continues", () => {
  const block = { id: "diagram", type: "diagram", data: { points: [1, 2] }, tunes: { size: "small" } };
  const source = createMarkdownSource([block]);
  const text = [source.text, source.text, "A"].join("\n\n");
  const draft = readMarkdownSource(text, source, defaultRegistry);
  assert.equal(draft.text, text);
  const [kept, copy] = draft.blocks;
  assert.equal(kept, block);
  assert.ok(copy && copy.id !== block.id);
  assert.deepEqual({ ...copy, id: block.id }, block);
  assert.notEqual(copy.data.points, block.data.points);
  assert.notEqual(Reflect.get(copy, "tunes"), block.tunes);
  const edited = readMarkdownSource(text + "B", createMarkdownSource(draft.blocks), defaultRegistry, draft.references);
  assert.equal(edited.blocks[1], copy);
  const next = readMarkdownSource(text + "BC", createMarkdownSource(edited.blocks), defaultRegistry, edited.references);
  assert.equal(next.text, text + "BC");
  assert.equal(next.blocks[1], copy);
});

test("a cut reference can be pasted again later in the same draft", () => {
  const video = { id: "clip", type: "video", data: { url: "/demo.mp4", caption: "Demo" } };
  const source = createMarkdownSource([video, paragraph("intro", "Text")]);
  const cut = readMarkdownSource("Text", source, defaultRegistry);
  const pasted = readMarkdownSource(["Text", source.blocks[0]!.text].join("\n\n"), createMarkdownSource(cut.blocks), defaultRegistry, cut.references);
  assert.equal(pasted.blocks[1], video);
  assert.deepEqual(pasted.blocks.map(block => block.id), ["intro", "clip"]);
});

test("images and downloads resolve legacy file ids and keep the stored file when its label changes", () => {
  const image = { id: "photo", type: "image", data: { file: { fileId: "f1", width: 640 }, alt: "Oak", caption: "Garden" } };
  const download = { id: "file", type: "attaches", data: { file: { id: "d1", name: "Notes.pdf", size: 31 } } };
  const options = { resolveAssetUrl: (file: { id: string; url: string }) => file.id ? `/assets/${file.id}` : file.url };
  const projection = createMarkdownSource([image, download], options);
  assert.equal(projection.text, '![Oak](/assets/f1 "Garden")\n\n[Notes.pdf](/assets/d1)');
  const draft = readMarkdownSource("Introduction\n\n" + projection.text.replace("Garden", "Beds").replace("Notes.pdf", "Field notes"), projection, defaultRegistry);
  assert.deepEqual(draft.blocks.slice(1), [
    { ...image, data: { ...image.data, caption: "Beds" } },
    { ...download, data: { ...download.data, title: "Field notes" } },
  ]);
  const revised = readMarkdownSource(draft.text.replace("/assets/f1", "/new/photo.png"), createMarkdownSource(draft.blocks, options), defaultRegistry);
  assert.deepEqual(revised.blocks[1]?.data.file, { url: "/new/photo.png", id: "" });
});

test("empty media expose editable Markdown and acquired URLs survive intermediate keystrokes", () => {
  const video = { id: "clip", type: "video", data: { url: "", caption: "", poster: "/cover.png" } };
  const image = { id: "picture", type: "image", data: { file: { url: "", id: "" }, caption: "" } };
  const attachment = { id: "brochure", type: "attachment", data: { resourceId: "r1", title: "Brochure" } };
  const source = createMarkdownSource([paragraph("blank", ""), video, image, attachment], { labels: { video: "Vidéo" } });
  assert.equal(source.text, "\n\n[Vidéo]()\n\n![]()\n\nBrochure");
  const edited = readMarkdownSource(source.text.replace("[Vidéo]()", "[Film](/media/v.mp4)").replace("![]()", "![A](/img/a.png)"), source, defaultRegistry);
  assert.deepEqual(edited.blocks.map(b => b.type), ["paragraph", "video", "image", "attachment"]);
  assert.deepEqual(edited.blocks[1], { ...video, data: { ...video.data, url: "/media/v.mp4", caption: "Film" } });
  assert.equal(edited.blocks[2]?.id, image.id);
  const raw = edited.text.replace("[Film](/media/v.mp4)", "[Film](");
  const half = readMarkdownSource(raw, createMarkdownSource(edited.blocks), defaultRegistry, edited.references);
  const complete = readMarkdownSource(raw.replace("[Film](", "[New film](/v2.mp4)"), createMarkdownSource(half.blocks), defaultRegistry, half.references);
  assert.deepEqual(complete.blocks[1], { ...video, data: { ...video.data, url: "/v2.mp4", caption: "New film" } });
  assert.equal(complete.blocks[3], attachment);
});

test("a custom extension and an identically written code span keep separate identities", () => {
  const plugin = { id: "plugin", type: "diagram", data: { points: [1] } };
  const literal = paragraph("example", "<code>diagram</code>");
  const projection = createMarkdownSource([plugin, literal]);
  const edited = readMarkdownSource(projection.text.replace(/`diagram`$/, "Edited"), projection, defaultRegistry);
  assert.equal(edited.blocks[0], plugin);
  assert.deepEqual(edited.blocks[1], paragraph(literal.id, "Edited"));
  const other = readMarkdownSource(projection.text.replace(/^`diagram`/, "Edited"), projection, defaultRegistry);
  assert.equal(other.blocks[1], literal);
  assert.deepEqual(other.blocks[0], paragraph(plugin.id, "Edited"));
});

test("stored empty paragraphs can be selected and removed as blank lines", () => {
  const source = createMarkdownSource([paragraph("before", "First"), paragraph("blank", ""), paragraph("last", "Last")]);
  assert.equal(source.text, "First\n\n\n\nLast");
  assert.deepEqual(readMarkdownSource("First\n\nLast", source, defaultRegistry).blocks.map(b => b.id), ["before", "last"]);
});

test("changing a fallback caption preserves alt inheritance, and explicitly clearing alt takes effect", () => {
  const block = { id: "photo", type: "image", data: { url: "/a.jpg", caption: "Before" } };
  const projection = createMarkdownSource([block]);
  assert.equal(projection.text, '![Before](/a.jpg "Before")');
  const edited = readMarkdownSource(projection.text.replace('"Before"', '"After"'), projection, defaultRegistry);
  assert.deepEqual(edited.blocks[0], { ...block, data: { url: "/a.jpg", caption: "After" } });

  const explicit = { ...block, data: { ...block.data, alt: "Old alt" } };
  const source = createMarkdownSource([explicit]);
  assert.deepEqual(readMarkdownSource(source.text.replace("[Old alt]", "[]"), source, defaultRegistry).blocks[0]?.data, { ...block.data, alt: "" });
});

test("older rich paragraphs with multiple HTML containers expose their content", () => {
  const body = paragraph("body", "<p>One</p><p>Two</p>");
  const source = createMarkdownSource([body, paragraph("after", "Next")]);
  assert.equal(source.text, "One  \nTwo\n\nNext");
  assert.equal(readMarkdownSource(source.text.replace("Next", "Last"), source, defaultRegistry).blocks[0], body);
});

test("the unfinished Markdown line remains visible on returning to a visual mode", () => {
  const original = paragraph("p", "First");
  const source = createMarkdownSource([original]);
  const lineBreak = paragraph("p", "First<br>");
  const draft = readMarkdownSource("First\n", source, defaultRegistry);
  assert.deepEqual(draft.blocks, [lineBreak]);
  const projected = createMarkdownSource([lineBreak, paragraph("next", "Next")]);
  assert.equal(projected.text, "First  \n\n\nNext");
  assert.deepEqual(readMarkdownSource(projected.text, projected, defaultRegistry).blocks[0], lineBreak);
  assert.deepEqual(readMarkdownSource("First\n\n", source, defaultRegistry).blocks.map(b => b.data), [{ text: "First" }, { text: "" }]);
});

test("pending legacy embeds and downloads have readable labels without URLs", () => {
  const projection = createMarkdownSource([{ id: "v", type: "embed", data: {} }, { id: "f", type: "attaches", data: {} }]);
  assert.equal(projection.text, "[Embed]()\n\n[File]()");
});

test("formatted pending lines remain visible when reopening paragraphs and quotes in Markdown", () => {
  const body = paragraph("body", "<strong>A<br></strong>");
  const quote = { id: "quote", type: "quote", data: { text: "<strong>B<br></strong>", caption: "Author" } };
  const source = createMarkdownSource([body, quote, paragraph("after", "Next")]);
  assert.equal(source.text, "**A**  \n\n\n> **B**\n>\n> — Author\n\nNext");
  const { blocks } = readMarkdownSource(source.text.replace("Next", "Last"), source, defaultRegistry);
  assert.equal(blocks[0], body);
  assert.equal(blocks[1], quote);
});
