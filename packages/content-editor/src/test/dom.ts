import { JSDOM } from "jsdom";

// A browser-like global scope for React DOM and Testing Library under the Node test runner.
// Imported first by every component test, before React evaluates `typeof window`.
const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", { url: "https://example.org/", pretendToBeVisual: true });
const { window } = dom;

const globals: Record<string, unknown> = {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  HTMLInputElement: window.HTMLInputElement,
  HTMLTextAreaElement: window.HTMLTextAreaElement,
  HTMLAnchorElement: window.HTMLAnchorElement,
  HTMLImageElement: window.HTMLImageElement,
  Element: window.Element,
  Node: window.Node,
  Text: window.Text,
  Range: window.Range,
  Selection: window.Selection,
  DocumentFragment: window.DocumentFragment,
  Event: window.Event,
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  FocusEvent: window.FocusEvent,
  InputEvent: window.InputEvent,
  CustomEvent: window.CustomEvent,
  DataTransfer: window.DataTransfer,
  DOMParser: window.DOMParser,
  NodeFilter: window.NodeFilter,
  File: window.File,
  FileList: window.FileList,
  CSS: window.CSS ?? { escape: (value: string) => value.replaceAll(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`) },
  getComputedStyle: window.getComputedStyle.bind(window),
  getSelection: () => window.getSelection(),
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0) as unknown as number,
  cancelAnimationFrame: (handle: number) => clearTimeout(handle),
  IS_REACT_ACT_ENVIRONMENT: true,
};
for (const [key, value] of Object.entries(globals)) {
  if (!(key in globalThis) || key === "IS_REACT_ACT_ENVIRONMENT") Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
}

// jsdom has no layout: the link popover positions itself from the selection rectangle
const EMPTY_RECT = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
if (!window.Range.prototype.getBoundingClientRect) window.Range.prototype.getBoundingClientRect = () => EMPTY_RECT;

/** A controllable IntersectionObserver: tests trigger entries by hand. */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();
  disconnected = false;
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(element: Element) { this.observed.add(element); }
  unobserve(element: Element) { this.observed.delete(element); }
  disconnect() { this.disconnected = true; this.observed.clear(); }
  takeRecords(): IntersectionObserverEntry[] { return []; }
  /** Marks elements as intersecting, as the browser would when they scroll into view. */
  enter(...elements: Element[]) {
    const entries = elements.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry);
    this.callback(entries, this as unknown as IntersectionObserver);
  }
  static reset() { FakeIntersectionObserver.instances = []; }
}
Object.defineProperty(globalThis, "IntersectionObserver", { value: FakeIntersectionObserver, configurable: true, writable: true });

/** Selects a character range of the first text node of an element. */
export function selectText(element: HTMLElement, start: number, end: number) {
  // Edits leave adjacent text nodes behind; merge them so offsets address the whole text
  element.normalize();
  const textNode = element.firstChild as Text;
  const range = window.document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Places a collapsed caret inside a text node. */
export function placeCaret(node: Node, offset: number) {
  const range = window.document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Drops any selection left by a previous test, as a browser would when the page changes. */
export function resetSelection() {
  window.getSelection()?.removeAllRanges();
}

export { window };

/** jsdom has no hit testing: tests say which element sits under the pointer. */
export function pointAt(element: Element | null) {
  Object.defineProperty(window.document, "elementFromPoint", { value: () => element, configurable: true, writable: true });
}
