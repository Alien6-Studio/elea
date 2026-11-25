import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { en } from "@alien6-studio/elea-content";
import { createDefaultSanitizer } from "@alien6-studio/elea-content-viewer";
import { placeCaret, resetSelection, selectText } from "./test/dom.js";
import { ContentProvider } from "./provider.js";
import { RichTextField, type RichTextFieldHandle } from "./RichTextField.js";

afterEach(() => {
  cleanup();
  resetSelection();
});

const SITE = ["members.example.org"];

function renderEditor(value: string, extra: Partial<Parameters<typeof RichTextField>[0]> = {}) {
  const ref = createRef<RichTextFieldHandle>();
  const changes: string[] = [];
  const { container } = render(
    <ContentProvider sanitizer={createDefaultSanitizer({ links: { siteHostnames: SITE } })} siteHostnames={SITE}>
      <RichTextField ref={ref} value={value} onChange={(next) => changes.push(next)} {...extra} />
    </ContentProvider>,
  );
  const editor = within(container).getByRole("textbox", { name: en.editor.startWriting });
  // Unlike browsers, jsdom collapses the selection when a contentEditable is focused
  editor.focus = () => {};
  return { ref, editor, changes, last: () => changes.at(-1) };
}

const submitLink = (url: string) => {
  const input = screen.getByRole("textbox", { name: en.editor.linkUrlPrompt });
  fireEvent.change(input, { target: { value: url } });
  fireEvent.keyDown(input, { key: "Enter" });
};

test("renders the sanitized value and applies the link policy to stored links", () => {
  const { editor } = renderEditor('<p>Text <a href="https://members.example.org/feed" target="_blank">inside</a> <script>x()</script></p>');
  const link = editor.querySelector("a") as HTMLAnchorElement;
  assert.equal(link.getAttribute("href"), "https://members.example.org/feed");
  assert.equal(link.hasAttribute("target"), false);
  assert.equal(editor.querySelector("script"), null);
  assert.equal(screen.queryByText(en.editor.startWriting), null);
});

test("shows the placeholder for an empty value", () => {
  renderEditor("");
  assert.ok(screen.getByText(en.editor.startWriting));
});

test("wraps and unwraps the selection through the handle", () => {
  const { ref, editor, last } = renderEditor("Hello world");
  selectText(editor, 0, 5);
  act(() => ref.current?.applyInlineFormat("strong"));
  assert.equal(editor.querySelector("strong")?.textContent, "Hello");
  assert.match(last() ?? "", /<strong>Hello<\/strong>/);
  act(() => ref.current?.applyInlineFormat("strong"));
  assert.equal(editor.querySelector("strong"), null);
  assert.equal(editor.textContent, "Hello world");
});

test("block formats wrap the selection, or the whole block when nothing is selected", () => {
  const { ref, editor } = renderEditor("Title here");
  selectText(editor, 0, 5);
  act(() => ref.current?.applyBlockFormat("h2"));
  assert.equal(editor.querySelector("h2")?.textContent, "Title");
  act(() => ref.current?.applyBlockFormat("h2"));
  assert.equal(editor.querySelector("h2"), null);
  placeCaret(editor.firstChild as Node, 0);
  act(() => ref.current?.applyBlockFormat("blockquote"));
  assert.equal(editor.innerHTML, "<blockquote>Title here</blockquote>");
  act(() => ref.current?.applyBlockFormat("blockquote"));
  assert.equal(editor.innerHTML, "Title here");
});

test("lists are built from the selected lines and toggled back to lines", () => {
  const { ref, editor } = renderEditor("one<br>two");
  const range = document.createRange();
  range.selectNodeContents(editor);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  act(() => ref.current?.applyListFormat("ul"));
  assert.equal(editor.innerHTML, "<ul><li>one</li><li>two</li></ul>");
  placeCaret(editor.querySelector("li")?.firstChild as Node, 1);
  act(() => ref.current?.applyListFormat("ul"));
  assert.equal(editor.innerHTML, "one<br>two");
  placeCaret(editor.firstChild as Node, 3);
  act(() => ref.current?.applyListFormat("ol"));
  assert.match(editor.innerHTML, /<ol><li><\/li><\/ol>/);
});

test("Enter splits list items and exits headings; a standalone rich field breaks the line", () => {
  const { editor, changes } = renderEditor("<ul><li>alpha</li></ul>");
  placeCaret(editor.querySelector("li")?.firstChild as Node, 2);
  fireEvent.keyDown(editor, { key: "Enter" });
  assert.equal(editor.innerHTML, "<ul><li>al</li><li>pha</li></ul>");
  placeCaret(editor.querySelectorAll("li")[1]?.firstChild as Node, 0);
  fireEvent.keyDown(editor, { key: "Backspace" });
  assert.equal(editor.innerHTML, "<ul><li>al</li></ul>pha<br>");
  assert.ok(changes.length >= 2);

  const heading = renderEditor("<h2>Head</h2>");
  placeCaret(heading.editor.querySelector("h2")?.firstChild as Node, 4);
  fireEvent.keyDown(heading.editor, { key: "Enter" });
  assert.equal(heading.editor.innerHTML, "<h2>Head</h2><br><br>");
  placeCaret(heading.editor.querySelector("h2")?.firstChild as Node, 2);
  fireEvent.keyDown(heading.editor, { key: "Enter" });
  assert.equal(heading.editor.innerHTML, "<h2>He</h2>ad<br><br><br>");

  // Without a block callback, Enter breaks the line
  const alone = renderEditor("Solo");
  placeCaret(alone.editor.firstChild as Node, 2);
  fireEvent.keyDown(alone.editor, { key: "Enter" });
  assert.equal(alone.editor.innerHTML, "So<br>lo");
});

test("one Enter stores a line break; Enter on the new line splits the paragraph, including at its edges", () => {
  for (const offset of [0, 2, 4]) {
    const splits: string[][] = [];
    const { editor, last } = renderEditor("Text", { onEnter: (left, right) => splits.push([left, right]) });
    placeCaret(editor.firstChild!, offset);
    fireEvent.keyDown(editor, { key: "Enter" });
    const left = "Text".slice(0, offset);
    const right = "Text".slice(offset);
    assert.equal(last(), left + "<br>" + right);
    assert.deepEqual(splits, []);
    fireEvent.keyDown(editor, { key: "Enter" });
    assert.deepEqual(splits, [[left, right]]);
  }
});

test("Shift+Enter always breaks the line and Enter splits existing formatted lines", () => {
  const splits: string[][] = [];
  const { editor, last } = renderEditor("<strong>A<br>B</strong>", { onEnter: (left, right) => splits.push([left, right]) });
  placeCaret(editor.querySelector("strong")!.lastChild!, 0);
  fireEvent.keyDown(editor, { key: "Enter", shiftKey: true });
  assert.equal(last(), "<strong>A<br><br>B</strong>");
  assert.deepEqual(splits, []);
  fireEvent.keyDown(editor, { key: "Enter" });
  assert.deepEqual(splits, [["<strong>A<br></strong>", "<strong>B</strong>"]]);
});

test("reopening a saved break keeps an editable final line and removes empty formatting when it splits", () => {
  const splits: string[][] = [];
  const { editor } = renderEditor("<strong>End<br></strong>", { onEnter: (left, right) => splits.push([left, right]) });
  const strong = editor.querySelector("strong")!;
  placeCaret(strong, 2);
  fireEvent.keyDown(editor, { key: "Enter" });
  assert.deepEqual(splits, [["<strong>End</strong>", ""]]);
});

test("mobile input events use the same return behavior and IME confirmation keeps its default action", () => {
  const splits: string[][] = [];
  const { editor, last } = renderEditor("ab", { onEnter: (left, right) => splits.push([left, right]) });
  placeCaret(editor.firstChild!, 1);
  const beforeInput = (type: string) => fireEvent(editor, new window.InputEvent("beforeinput", {
    bubbles: true, cancelable: true, inputType: type,
  }));
  fireEvent.compositionStart(editor);
  assert.equal(fireEvent.keyDown(editor, { key: "Enter" }), true);
  assert.equal(beforeInput("insertParagraph"), true);
  fireEvent.compositionEnd(editor, { data: "" });
  assert.equal(last(), undefined);
  assert.equal(beforeInput("insertLineBreak"), false);
  assert.equal(last(), "a<br>b");
  assert.equal(beforeInput("insertParagraph"), false);
  assert.deepEqual(splits, [["a", "b"]]);
});

test("arrows at the edges and Backspace or Delete at the ends hand over to the neighbouring blocks", () => {
  const events: string[] = [];
  const { editor } = renderEditor("Hello", {
    onNavigate: (direction) => events.push(`nav:${direction}`),
    onMergeBackward: (html) => events.push(`back:${html}`),
    onMergeForward: () => events.push("forward"),
  });
  placeCaret(editor.firstChild as Node, 2);
  fireEvent.keyDown(editor, { key: "ArrowUp" });
  fireEvent.keyDown(editor, { key: "Backspace" });
  assert.deepEqual(events, []);
  placeCaret(editor.firstChild as Node, 0);
  fireEvent.keyDown(editor, { key: "ArrowUp" });
  fireEvent.keyDown(editor, { key: "Backspace" });
  placeCaret(editor.firstChild as Node, 5);
  fireEvent.keyDown(editor, { key: "ArrowDown" });
  fireEvent.keyDown(editor, { key: "Delete" });
  fireEvent.keyDown(editor, { key: "ArrowDown", shiftKey: true });
  assert.deepEqual(events, ["nav:up", "back:Hello", "nav:down", "forward"]);
});

test("keyboard shortcuts format the selection and paste inserts plain text", () => {
  const { editor, last } = renderEditor("Hello world");
  selectText(editor, 0, 5);
  fireEvent.keyDown(editor, { key: "b", ctrlKey: true });
  assert.equal(editor.querySelector("strong")?.textContent, "Hello");
  selectText(editor, 0, 0);
  fireEvent.keyDown(editor, { key: "x", ctrlKey: true });
  const text = editor.querySelector("strong")?.firstChild as Node;
  placeCaret(text, 5);
  fireEvent.paste(editor, { clipboardData: { getData: (type: string) => (type === "text/plain" ? " <b>pasted</b>" : "") } });
  assert.equal(editor.querySelector("b"), null);
  assert.match(last() ?? "", /Hello &lt;b&gt;pasted&lt;\/b&gt;/);
});

test("clearFormat strips formatting from the selection, from a list, or from the whole block", () => {
  const { ref, editor } = renderEditor("<strong>Bold</strong> text");
  selectText(editor.querySelector("strong") as HTMLElement, 0, 4);
  act(() => ref.current?.clearFormat());
  assert.equal(editor.innerHTML, "Bold text");

  const list = renderEditor("<ul><li>a</li><li>b</li></ul>");
  const range = document.createRange();
  range.selectNodeContents(list.editor.querySelector("ul") as Element);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  act(() => list.ref.current?.clearFormat());
  assert.equal(list.editor.innerHTML, "a<br>b");

  const whole = renderEditor("<h1>Big</h1>");
  placeCaret(whole.editor.querySelector("h1")?.firstChild as Node, 1);
  act(() => whole.ref.current?.clearFormat());
  assert.equal(whole.editor.innerHTML, "Big");
});

test("link popover: open, cancel, create external and internal links, refuse unsafe ones, unwrap", () => {
  const { ref, editor, changes, last } = renderEditor("Hello world");
  selectText(editor, 0, 5);
  act(() => ref.current?.openLinkInput());
  assert.ok(screen.getByRole("dialog", { name: en.editor.linkUrlPrompt }));
  fireEvent.keyDown(screen.getByRole("textbox", { name: en.editor.linkUrlPrompt }), { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(editor.querySelector("a"), null);
  assert.equal(changes.length, 0);

  selectText(editor, 6, 11);
  act(() => ref.current?.openLinkInput());
  submitLink("example.org");
  let link = editor.querySelector("a") as HTMLAnchorElement;
  assert.equal(link.textContent, "world");
  assert.equal(link.getAttribute("href"), "https://example.org");
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal(link.getAttribute("rel"), "noopener noreferrer");
  assert.match(last() ?? "", /href="https:\/\/example.org"/);
  assert.equal(screen.queryByRole("dialog"), null);

  placeCaret(link.firstChild as Node, 1);
  act(() => ref.current?.openLinkInput());
  assert.equal(editor.querySelector("a"), null);
  assert.equal(editor.textContent, "Hello world");

  selectText(editor, 0, 5);
  act(() => ref.current?.openLinkInput());
  submitLink('/member/%C3%A9t%C3%A9/"archive"?page=1&view=print');
  link = editor.querySelector("a") as HTMLAnchorElement;
  assert.equal(link.getAttribute("href"), "/member/%C3%A9t%C3%A9/%22archive%22?page=1&view=print");
  assert.equal(link.hasAttribute("target"), false);
  placeCaret(link.firstChild as Node, 1);
  act(() => ref.current?.openLinkInput());

  selectText(editor, 0, 5);
  act(() => ref.current?.openLinkInput());
  submitLink("https://members.example.org/resources");
  assert.equal(editor.querySelector("a")?.hasAttribute("target"), false);
  placeCaret(editor.querySelector("a")?.firstChild as Node, 1);
  act(() => ref.current?.openLinkInput());

  selectText(editor, 0, 5);
  act(() => ref.current?.openLinkInput());
  submitLink("javascript:alert(1)");
  assert.equal(screen.getByRole("alert").textContent, en.editor.linkUrlInvalid);
  assert.ok(screen.getByRole("dialog"));
  assert.equal(editor.querySelector("a"), null);
  fireEvent.mouseDown(screen.getByRole("button", { name: en.editor.linkCancel }));
  assert.equal(screen.queryByRole("dialog"), null);

  selectText(editor, 5, 5);
  act(() => ref.current?.openLinkInput());
  fireEvent.change(screen.getByRole("textbox", { name: en.editor.linkUrlPrompt }), { target: { value: "https://example.org/page" } });
  fireEvent.mouseDown(screen.getByRole("button", { name: en.editor.linkConfirm }));
  assert.equal(editor.querySelector("a")?.textContent, "https://example.org/page");

  // The caret sits inside the new link: opening again removes it instead of nesting one
  act(() => ref.current?.openLinkInput());
  assert.equal(editor.querySelector("a"), null);
  assert.equal(screen.queryByRole("dialog"), null);

  selectText(editor, 0, 5);
  act(() => ref.current?.openLinkInput());
  fireEvent.keyDown(screen.getByRole("textbox", { name: en.editor.linkUrlPrompt }), { key: "Enter" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(editor.querySelector("a"), null);
});

test("the value prop replaces the content when the editor is not focused, and selection reports formats", () => {
  const formats: unknown[] = [];
  const { editor } = renderEditor("<strong>a</strong>", { onSelectionChange: (next) => formats.push(next) });
  selectText(editor.querySelector("strong") as HTMLElement, 0, 1);
  document.dispatchEvent(new window.Event("selectionchange"));
  assert.deepEqual(formats.at(-1), { bold: true, italic: false, underline: false, h1: false, h2: false, h3: false, h4: false, h5: false, h6: false, blockquote: false, ul: false, ol: false });
  fireEvent.compositionStart(editor);
  fireEvent.compositionEnd(editor, { data: "é" });
  fireEvent.compositionEnd(editor, { data: "" });
});

test("commands use the callbacks of the latest render, not those of the first one", () => {
  const first: string[] = [];
  const second: string[] = [];
  const ref = createRef<RichTextFieldHandle>();
  const { container, rerender } = render(
    <ContentProvider>
      <RichTextField ref={ref} value="Hello world" onChange={(next) => first.push(next)} />
    </ContentProvider>,
  );
  const editor = within(container).getByRole("textbox", { name: en.editor.startWriting });
  editor.focus = () => {};
  rerender(
    <ContentProvider>
      <RichTextField ref={ref} value="Hello world" onChange={(next) => second.push(next)} />
    </ContentProvider>,
  );
  selectText(editor, 0, 5);
  act(() => ref.current?.applyInlineFormat("strong"));
  assert.match(second.at(-1) ?? "", /<strong>Hello<\/strong>/);
  placeCaret(editor.querySelector("strong")?.firstChild as Node, 1);
  act(() => ref.current?.clearFormat());
  assert.equal(second.at(-1), "Hello world");
  selectText(editor, 0, 5);
  act(() => ref.current?.applyListFormat("ul"));
  assert.match(second.at(-1) ?? "", /<ul><li>Hello<\/li><\/ul>/);
  placeCaret(editor.querySelector("li")?.firstChild as Node, 1);
  act(() => ref.current?.clearFormat());
  assert.equal(second.at(-1), "Hello world");
  selectText(editor, 0, 5);
  act(() => ref.current?.openLinkInput());
  submitLink("https://example.org");
  assert.equal(first.length, 0);
  assert.ok(second.length >= 5);
  assert.match(second.at(-1) ?? "", /href="https:\/\/example.org"/);
});

test("a parent holding title and blocks in one state keeps a new title when bold is applied", () => {
  const states: { title: string; text: string }[] = [];
  function Parent() {
    const [state, setState] = useState({ title: "old", text: "Hello world" });
    const ref = createRef<RichTextFieldHandle>();
    states.push(state);
    return (
      <ContentProvider>
        <input aria-label="title" value={state.title} onChange={(event) => setState({ ...state, title: event.target.value })} />
        <button type="button" onClick={() => ref.current?.applyInlineFormat("strong")}>bold</button>
        <RichTextField ref={ref} value={state.text} onChange={(text) => setState({ ...state, text })} />
      </ContentProvider>
    );
  }
  render(<Parent />);
  const editor = screen.getByRole("textbox", { name: en.editor.startWriting });
  editor.focus = () => {};
  fireEvent.change(screen.getByRole("textbox", { name: "title" }), { target: { value: "new title" } });
  selectText(editor, 0, 5);
  fireEvent.click(screen.getByRole("button", { name: "bold" }));
  const last = states.at(-1);
  assert.equal(last?.title, "new title");
  assert.match(last?.text ?? "", /<strong>Hello<\/strong>/);
});

test("an external value replaces the content even while focused, and later input builds on it", () => {
  const changes: string[] = [];
  const Controlled = ({ value }: { value: string }) => (
    <ContentProvider>
      <RichTextField value={value} onChange={(next) => changes.push(next)} />
    </ContentProvider>
  );
  const { rerender } = render(<Controlled value="<p>one</p>" />);
  const editor = screen.getByRole("textbox", { name: en.editor.startWriting });
  editor.focus();
  assert.ok(document.activeElement === editor, "focus should be on the expected field");
  rerender(<Controlled value="<p>two</p>" />);
  assert.equal(editor.innerHTML, "<p>two</p>");
  const selection = window.getSelection() as Selection;
  assert.equal(selection.rangeCount, 1);
  assert.equal(selection.getRangeAt(0).collapsed, true);
  // The field's own echo does not reset the content, typing continues from the replacement
  (editor.firstChild as HTMLElement).insertAdjacentText("beforeend", "!");
  fireEvent.input(editor);
  assert.equal(changes.at(-1), "<p>two!</p>");
  rerender(<Controlled value="<p>two!</p>" />);
  assert.equal(editor.innerHTML, "<p>two!</p>");
  editor.blur();
  rerender(<Controlled value="<p>three</p>" />);
  assert.equal(editor.innerHTML, "<p>three</p>");
  // During a composition the replacement waits, then applies when the composition ends
  fireEvent.compositionStart(editor);
  rerender(<Controlled value="<p>four</p>" />);
  assert.equal(editor.innerHTML, "<p>three</p>");
  fireEvent.compositionEnd(editor, { data: "" });
  assert.equal(editor.innerHTML, "<p>four</p>");
});

test("an inline mark over a selection across list items wraps each item's text on its own", () => {
  const changes: string[] = [];
  const ref = createRef<RichTextFieldHandle>();
  render(
    <ContentProvider>
      <RichTextField ref={ref} value="<ul><li>one</li><li>two<ul><li>deep</li></ul></li></ul>" onChange={(html) => changes.push(html)} />
    </ContentProvider>,
  );
  const field = screen.getByRole("textbox") as HTMLElement;
  // jsdom collapses the selection when a contentEditable takes focus; browsers keep it
  field.focus = () => {};
  const items = [...field.querySelectorAll("li")];
  const range = document.createRange();
  range.setStart(items[0]?.firstChild as Node, 1);
  range.setEnd(items[2]?.firstChild as Node, 2);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  ref.current?.applyInlineFormat("strong");
  assert.equal(changes.at(-1), "<ul><li>o<strong>ne</strong></li><li><strong>two</strong><ul><li><strong>de</strong>ep</li></ul></li></ul>");
  // The wrappers hold the selection afterwards
  assert.equal(window.getSelection()?.toString(), "netwode");
});
