import { asListMarker, isListItemChecked, listStyleForMarker, nestedListStyle, type ListData, type ListItem, type ListMarker } from "@alien6-studio/elea-content";

/**
 * A list block edited as one rich text field: the items become nested `<ul>`/`<ol>` markup
 * and come back as items. The tag flips at each level, as the viewer renders nested lists.
 * A checklist is marked on its root list, and each task that is done on its item.
 */

const MARKER_CLASS = "elea-list-marker-";
export const CHECKLIST_CLASS = "elea-list-checklist";
export const CHECKED_CLASS = "elea-list-checked";

export const markerClass = (marker: ListMarker): string => `${MARKER_CLASS}${marker}`;
export const isList = (node: Node): node is HTMLElement => node.nodeName === "UL" || node.nodeName === "OL";

export function readListMarker(list: Element): ListMarker | undefined {
  const marker = [...list.classList].find((name) => name.startsWith(MARKER_CLASS));
  return asListMarker(marker?.slice(MARKER_CLASS.length));
}

export const itemContent = (item: ListItem): string => (typeof item === "string" ? item : item.content);
export const itemChildren = (item: ListItem): ListItem[] => (typeof item === "string" ? [] : (item.items ?? []));

/** The markup of a list, for the field. */
export function itemsToHtml(items: readonly ListItem[], style: ListData["style"], marker?: ListMarker, nested = false): string {
  const tasks = style === "checklist";
  const tag = !tasks && listStyleForMarker(marker, style) === "ordered" ? "ol" : "ul";
  const inner = items
    .map((item) => {
      const children = itemChildren(item);
      const sublist = typeof item !== "string" && children.length > 0
        ? itemsToHtml(children, nestedListStyle(style), asListMarker(item.childrenMarker), true)
        : "";
      const checked = tasks && isListItemChecked(item) ? ` class="${CHECKED_CLASS}"` : "";
      return `<li${checked}>${itemContent(item) || "<br>"}${sublist}</li>`;
    })
    .join("");
  const own = nested ? undefined : CHECKLIST_CLASS;
  const name = tasks ? own : marker && markerClass(marker);
  const attribute = name ? ` class="${name}"` : "";
  return `<${tag}${attribute}>${inner}</${tag}>`;
}

/** The markup parsed into nodes, with the document at hand. */
export function parseMarkup(html: string): ParentNode {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

/** Items from the field's markup: every list at the top level, in order; text outside lists is dropped. */
export function htmlToItems(html: string, parser: (markup: string) => ParentNode = parseMarkup): ListItem[] {
  return htmlToList(html, parser).items;
}

export function htmlToList(html: string, parser: (markup: string) => ParentNode = parseMarkup): ListData {
  const lists = [...parser(html).childNodes].filter(isList);
  const root = lists[0];
  if (root?.classList.contains(CHECKLIST_CLASS)) return { style: "checklist", items: lists.flatMap((list) => listItems(list, "checklist", 0)) };
  const marker = root && readListMarker(root);
  const style = root?.tagName === "OL" ? "ordered" : "unordered";
  return { style, items: lists.flatMap((list) => listItems(list, style, 0)), ...(marker && { marker }) };
}

function fallbackMarker(list: Element, depth: number): ListMarker {
  if (list.tagName === "OL") return depth === 0 ? "lower-alpha" : "lower-roman";
  return depth === 0 ? "circle" : "square";
}

function listItem(item: Element, childStyle: ListData["style"], depth: number): ListItem {
  const tasks = childStyle === "checklist";
  const nested: ListItem[] = [];
  const parts: string[] = [];
  let childrenMarker: ListMarker | undefined;
  for (const node of item.childNodes) {
    if (!isList(node)) {
      parts.push(node.nodeType === 1 ? (node as Element).outerHTML : (node.textContent ?? ""));
      continue;
    }
    if (!tasks) childrenMarker ??= readListMarker(node);
    if (!tasks && !childrenMarker && (node.tagName === "OL") !== (childStyle === "ordered")) childrenMarker = fallbackMarker(node, depth);
    nested.push(...listItems(node, childStyle, depth + 1));
  }
  const content = cleanContent(parts.join(""));
  if (tasks) return { content, meta: { checked: item.classList.contains(CHECKED_CLASS) }, items: nested };
  return nested.length > 0 ? { content, items: nested, ...(childrenMarker && { childrenMarker }) } : content;
}

function listItems(list: HTMLElement, style: ListData["style"], depth: number): ListItem[] {
  const childStyle = nestedListStyle(style);
  const result: ListItem[] = [];
  for (const child of list.children) {
    if (child.tagName === "LI") result.push(listItem(child, childStyle, depth));
  }
  return result;
}

/** Trailing line breaks are the browser's placeholder for an empty item, not content. */
export function cleanContent(html: string): string {
  return html.replace(/(<br\s*\/?>\s*)+$/i, "").trim();
}

/** The items compare as values, whatever the shape of the untouched ones. */
export function sameItems(a: readonly ListItem[], b: readonly ListItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index] as ListItem;
    const marker = typeof item === "string" ? undefined : item.childrenMarker;
    const otherMarker = typeof other === "string" ? undefined : other.childrenMarker;
    if (itemContent(item) !== itemContent(other) || marker !== otherMarker || isListItemChecked(item) !== isListItemChecked(other)) return false;
    return sameItems(itemChildren(item), itemChildren(other));
  });
}
