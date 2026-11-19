import "../test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { defaultRegistry, type EleaBlock } from "@alien6-studio/elea-content";
import { FakeIntersectionObserver } from "../test/dom.js";
import { useBlockFocus } from "./useBlockFocus.js";
import { useBlockManagement } from "./useBlockManagement.js";
import { useBlockVisibility } from "./useBlockVisibility.js";
import { useTextareaResize, resizeTextarea } from "./useTextareaResize.js";

afterEach(() => {
  cleanup();
  FakeIntersectionObserver.reset();
  document.body.innerHTML = "";
});

const paragraph = (id: string, text = ""): EleaBlock => ({ id, type: "paragraph", data: { text } });

function manage(initial: EleaBlock[]) {
  const changes: EleaBlock[][] = [];
  const hook = renderHook(() => useBlockManagement({ blocks: initial, onBlocksChange: (next) => changes.push(next), registry: defaultRegistry }));
  return { hook, changes, last: () => changes.at(-1) as EleaBlock[] };
}

test("addBlock appends, inserts after a block, carries initial text and returns the id", () => {
  const { hook, last } = manage([paragraph("a"), paragraph("b")]);
  let id = "";
  act(() => { id = hook.result.current.addBlock("header"); });
  assert.equal(last().length, 3);
  assert.deepEqual(last()[2], { id, type: "header", data: { text: "", level: 2 } });
  act(() => { id = hook.result.current.addBlock("paragraph", "a", "after a"); });
  assert.equal(last()[1]?.id, id);
  assert.equal(last()[1]?.data.text, "after a");
  assert.equal(last().length, 4);
  act(() => { hook.result.current.addBlock("image", "missing", "ignored"); });
  assert.equal(last().length, 5);
  assert.deepEqual(last()[4]?.data, { file: { url: "", id: "" }, caption: "" });
});

test("updateBlock changes one block, removeBlock keeps the last one", () => {
  const { hook, last } = manage([paragraph("a", "A"), paragraph("b", "B")]);
  act(() => hook.result.current.updateBlock("a", { text: "A2" }));
  assert.deepEqual(last().map((block) => block.data.text), ["A2", "B"]);
  act(() => hook.result.current.removeBlock("a"));
  assert.deepEqual(last().map((block) => block.id), ["b"]);
  act(() => hook.result.current.removeBlock("b"));
  assert.deepEqual(last().map((block) => block.id), ["b"]);
});

test("convertBlock carries text to text blocks and to a list", () => {
  const { hook, last } = manage([paragraph("a", "Words"), paragraph("b")]);
  act(() => hook.result.current.convertBlock("a", "quote"));
  assert.deepEqual(last()[0], { id: "a", type: "quote", data: { text: "Words", caption: "" } });
  act(() => hook.result.current.convertBlock("a", "list"));
  assert.deepEqual(last()[0]?.data, { style: "unordered", items: ["Words"] });
  act(() => hook.result.current.convertBlock("b", "image"));
  assert.equal(last()[1]?.type, "image");
});

test("useBlockFocus tracks state and focuses editable fields by block id", () => {
  document.body.innerHTML = `
    <div data-elea-block-id="rich"><div contenteditable="true">text</div></div>
    <div data-elea-block-id="field"><textarea></textarea></div>
    <div data-elea-block-id="empty"></div>`;
  const { result } = renderHook(() => useBlockFocus());
  assert.equal(result.current.focusedBlock, null);
  act(() => result.current.setFocusedBlock("rich"));
  assert.equal(result.current.focusedBlock, "rich");
  act(() => result.current.focusBlockElement("rich"));
  assert.ok(document.activeElement === document.querySelector("[contenteditable]"), "focus should be on the expected field");
  act(() => result.current.focusBlockElement("field"));
  assert.ok(document.activeElement === document.querySelector("textarea"), "focus should be on the expected field");
  act(() => result.current.focusBlockElement("empty"));
  act(() => result.current.focusBlockElement("nope"));
  assert.ok(document.activeElement === document.querySelector("textarea"), "focus should be on the expected field");
  const first = result.current.focusBlockElement;
  act(() => result.current.setFocusedBlock(null));
  assert.equal(result.current.focusBlockElement, first);
});

test("scheduleBlockFocus focuses after a frame", async () => {
  document.body.innerHTML = `<div data-elea-block-id="late"><input></div>`;
  const { result } = renderHook(() => useBlockFocus());
  act(() => result.current.scheduleBlockFocus("late"));
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.ok(document.activeElement === document.querySelector("input"), "focus should be on the expected field");
});

test("useBlockVisibility observes registered elements and remembers seen blocks", () => {
  const { result, unmount } = renderHook(() => useBlockVisibility());
  const observer = FakeIntersectionObserver.instances[0] as FakeIntersectionObserver;
  assert.deepEqual(observer.options, { rootMargin: "200px", threshold: 0 });
  const element = document.createElement("div");
  element.setAttribute("data-elea-block-id", "one");
  act(() => result.current.registerBlock("one", element));
  assert.ok(observer.observed.has(element));
  assert.equal(result.current.isBlockVisible("one"), false);
  act(() => observer.enter(element));
  assert.equal(result.current.isBlockVisible("one"), true);
  const anonymous = document.createElement("div");
  act(() => observer.enter(anonymous));
  assert.equal(result.current.visibleBlocks.size, 1);
  act(() => result.current.registerBlock("one", null));
  assert.equal(observer.observed.has(element), false);
  act(() => result.current.registerBlock("two", null));
  unmount();
  assert.equal(observer.disconnected, true);
});

test("useTextareaResize fits the height to the content", () => {
  const { result, rerender } = renderHook(({ value }) => useTextareaResize<HTMLTextAreaElement>(value), { initialProps: { value: "a" } });
  const textarea = document.createElement("textarea");
  Object.defineProperty(textarea, "scrollHeight", { value: 42, configurable: true });
  (result.current as { current: HTMLTextAreaElement | null }).current = textarea;
  rerender({ value: "ab" });
  assert.equal(textarea.style.height, "42px");
  Object.defineProperty(textarea, "scrollHeight", { value: 60, configurable: true });
  resizeTextarea(textarea);
  assert.equal(textarea.style.height, "60px");
});
