import { listStyleForMarker, MAX_LIST_DEPTH, nestedListStyle, type BlockLike, type ListItem, type ListMarker } from "@alien6-studio/elea-content";
import { CHECKED_CLASS, CHECKLIST_CLASS, htmlToList, isList, itemContent, markerClass, readListMarker } from "./listHtml.js";
import { editableHtml } from "./caret.js";

export type ListCommand = ListMarker | "indent" | "outdent";
export const topLevelListItems = (field: HTMLElement) => field.querySelectorAll<HTMLLIElement>(":scope > :is(ul, ol) > li");

const itemAt = (node: Node) => (node.nodeType === 1 ? node as Element : node.parentElement)?.closest("li");

function selectedItems(field: HTMLElement, range: Range): HTMLLIElement[] {
  const first = itemAt(range.startContainer);
  if (range.collapsed) {
    return first && field.contains(first) ? [first] : [];
  }
  const last = itemAt(range.endContainer);
  return [...field.querySelectorAll<HTMLLIElement>("li")].filter((item) => {
    const content = [...item.childNodes].filter((node) => !isList(node));
    const end = content.at(-1);
    if (!end || !content.some((node) => range.intersectsNode(node))) return false;
    const starts = item === first;
    const ends = item === last;
    if (starts === ends) return true;
    // The selection can touch the next item at offset zero with no text selected there.
    const portion = range.cloneRange();
    if (starts) portion.setEndAfter(end);
    else portion.setStart(item, 0);
    return Boolean(portion.toString()) || content.every((node) => !node.textContent);
  });
}

/** Change list markers or indentation. A root outdent returns the replacement blocks. */
export function applyListCommand(field: HTMLElement, command: ListCommand, blockType?: string): boolean | { blocks: BlockLike[]; focus: number } {
  const selection = field.ownerDocument.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!field.contains(range.commonAncestorContainer)) return false;
  const items = selectedItems(field, range);
  if (items.length === 0) return false;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  const shift = command === "indent" || command === "outdent";
  const groups = groupByList(items, shift);

  const roots = new Set<HTMLLIElement>();
  let changed = false;
  for (const [list, group] of groups) {
    if (blockType && command === "outdent" && list.parentElement === field) {
      for (const item of group) roots.add(item);
      continue;
    }
    changed = runCommand(list, group, command) || changed;
  }
  if (blockType && roots.size > 0) return unwrapRootItems(field, roots, blockType);
  if (changed) restoreSelection(field, selection, items, { anchorNode, anchorOffset, focusNode, focusOffset });
  return changed;
}

function restoreSelection(field: HTMLElement, selection: Selection, items: readonly HTMLLIElement[], { anchorNode, anchorOffset, focusNode, focusOffset }: Pick<Selection, "anchorNode" | "anchorOffset" | "focusNode" | "focusOffset">) {
  if (anchorNode && focusNode && field.contains(anchorNode) && field.contains(focusNode)) {
    selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
  } else {
    const first = items[0] as HTMLLIElement;
    const last = items.at(-1) as HTMLLIElement;
    selection.setBaseAndExtent(first, 0, last, last.childNodes.length);
  }
}

function groupByList(items: readonly HTMLLIElement[], shift: boolean) {
  const selected = new Set(items);
  const groups = new Map<HTMLElement, HTMLLIElement[]>();
  for (const item of items) {
    const list = item.parentElement;
    if (!list || !isList(list)) continue;
    if (shift && hasSelectedParent(item, selected)) continue;
    const group = groups.get(list) ?? [];
    group.push(item);
    groups.set(list, group);
  }
  return groups;
}

function runCommand(list: HTMLElement, group: readonly HTMLLIElement[], command: ListCommand): boolean {
  if (command === "indent") return indent(list, group);
  if (command === "outdent") return outdent(list, group);
  return setMarker(list, command);
}

function unwrapRootItems(field: HTMLElement, selected: ReadonlySet<HTMLLIElement>, type: string) {
  const { items, ...format } = htmlToList(editableHtml(field));
  const elements = topLevelListItems(field);
  const blocks: BlockLike[] = [];
  let focus: number | undefined;
  let run: ListItem[] = [];
  const flush = () => {
    if (run.length > 0) blocks.push({ type, data: { ...format, items: run } });
    run = [];
  };
  items.forEach((item, index) => {
    if (!selected.has(elements[index] as HTMLLIElement)) {
      run.push(item);
      return;
    }
    flush();
    focus ??= blocks.length;
    blocks.push({ type: "paragraph", data: { text: itemContent(item) } });
    if (typeof item !== "string" && item.items?.length) {
      const marker = item.childrenMarker;
      const style = listStyleForMarker(marker, nestedListStyle(format.style));
      blocks.push({ type, data: { style, items: item.items, ...(marker && { marker }) } });
    }
  });
  flush();
  return { blocks, focus: focus ?? 0 };
}

function hasSelectedParent(item: HTMLLIElement, selected: ReadonlySet<HTMLLIElement>): boolean {
  for (let parent = item.parentElement?.closest("li"); parent; parent = parent.parentElement?.closest("li")) {
    if (selected.has(parent)) return true;
  }
  return false;
}

/** Ticks or unticks the task the caret is in; false outside a checklist. */
export function toggleTask(field: HTMLElement, item: Element | null | undefined): boolean {
  if (!item || !field.querySelector(`:scope > .${CHECKLIST_CLASS}`)?.contains(item)) return false;
  item.classList.toggle(CHECKED_CLASS);
  return true;
}

function setMarker(list: HTMLElement, marker: ListMarker): boolean {
  const previous = readListMarker(list);
  // A marker is a choice of bullets or numbers: the checklist it is given to becomes that list
  const root = list.closest(`.${CHECKLIST_CLASS}`);
  if (root) {
    root.classList.remove(CHECKLIST_CLASS);
    for (const item of root.querySelectorAll(`.${CHECKED_CLASS}`)) item.removeAttribute("class");
  }
  if (marker === previous && !root) return false;
  const tag = listStyleForMarker(marker, "unordered") === "ordered" ? "ol" : "ul";
  let target = list;
  if (list.localName !== tag) {
    target = list.ownerDocument.createElement(tag);
    target.className = list.className;
    target.append(...list.childNodes);
    list.replaceWith(target);
  }
  if (previous) target.classList.remove(markerClass(previous));
  target.classList.add(markerClass(marker));
  return true;
}

function itemDepth(item: Element): number {
  const parent = item.parentElement?.parentElement;
  return parent?.tagName === "LI" ? 1 + itemDepth(parent) : 0;
}

function indent(list: HTMLElement, items: readonly HTMLLIElement[]): boolean {
  const previous = items[0]?.previousElementSibling;
  if (!previous || items.some((item) => [item, ...item.querySelectorAll("li")].some((child) => itemDepth(child) >= MAX_LIST_DEPTH))) return false;
  let sublist = [...previous.children].find(isList);
  if (!sublist) {
    sublist = list.ownerDocument.createElement(list.tagName === "OL" ? "ul" : "ol");
    previous.appendChild(sublist);
  }
  sublist.append(...items);
  return true;
}

function outdent(list: HTMLElement, items: readonly HTMLLIElement[]): boolean {
  const parent = list.parentElement;
  const last = items.at(-1);
  if (parent?.tagName !== "LI" || !last) return false;
  if (last.nextElementSibling) {
    const following = list.cloneNode(false) as HTMLElement;
    while (last.nextElementSibling) following.appendChild(last.nextElementSibling);
    last.appendChild(following);
  }
  parent.after(...items);
  if (list.children.length === 0) list.remove();
  return true;
}
