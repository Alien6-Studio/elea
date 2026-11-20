import { asListMarker, listStyleForMarker, type ListData, type ListItem, type ListMarker } from "@alien6-studio/elea-content";

/**
 * A list block edited as one rich text field: the items become nested `<ul>`/`<ol>` markup
 * and come back as items. The tag flips at each level, as the viewer renders nested lists.
 */

const MARKER_CLASS = "elea-list-marker-";

export const markerClass = (marker: ListMarker): string => `${MARKER_CLASS}${marker}`;
export const isList = (node: Node): node is HTMLElement => node.nodeName === "UL" || node.nodeName === "OL";

export function readListMarker(list: Element): ListMarker | undefined {
  const marker = [...list.classList].find((name) => name.startsWith(MARKER_CLASS));
  return asListMarker(marker?.slice(MARKER_CLASS.length));
}

export const itemContent = (item: ListItem): string => (typeof item === "string" ? item : item.content);
export const itemChildren = (item: ListItem): ListItem[] => (typeof item === "string" ? [] : (item.items ?? []));

/** The markup of a list, for the field. */
export function itemsToHtml(items: readonly ListItem[], style: ListData["style"], marker?: ListMarker): string {
  const tag = listStyleForMarker(marker, style) === "ordered" ? "ol" : "ul";
  const inner = items
    .map((item) => {
      const children = itemChildren(item);
      const nested = typeof item !== "string" && children.length > 0
        ? itemsToHtml(children, style === "ordered" ? "unordered" : "ordered", asListMarker(item.childrenMarker))
        : "";
      return `<li>${itemContent(item) || "<br>"}${nested}</li>`;
    })
    .join("");
  return `<${tag}${marker ? ` class="${markerClass(marker)}"` : ""}>${inner}</${tag}>`;
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
  const marker = root && readListMarker(root);
  const style = root?.tagName === "OL" ? "ordered" : "unordered";
  return { style, items: lists.flatMap((list) => listItems(list, style, 0)), ...(marker && { marker }) };
}

function listItems(list: HTMLElement, style: ListData["style"], depth: number): ListItem[] {
  const result: ListItem[] = [];
  const childStyle = style === "ordered" ? "unordered" : "ordered";
  for (const child of [...list.children]) {
    if (child.tagName !== "LI") continue;
    const nested: ListItem[] = [];
    const parts: string[] = [];
    let childrenMarker: ListMarker | undefined;
    for (const node of [...child.childNodes]) {
      if (isList(node)) {
        childrenMarker ??= readListMarker(node);
        if (!childrenMarker && (node.tagName === "OL") !== (childStyle === "ordered")) {
          childrenMarker = node.tagName === "OL"
            ? depth === 0 ? "lower-alpha" : "lower-roman"
            : depth === 0 ? "circle" : "square";
        }
        nested.push(...listItems(node, childStyle, depth + 1));
      }
      else parts.push(node.nodeType === 1 ? (node as Element).outerHTML : (node.textContent ?? ""));
    }
    const content = cleanContent(parts.join(""));
    result.push(nested.length > 0 ? { content, items: nested, ...(childrenMarker && { childrenMarker }) } : content);
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
    if (itemContent(item) !== itemContent(other) || marker !== otherMarker) return false;
    return sameItems(itemChildren(item), itemChildren(other));
  });
}
