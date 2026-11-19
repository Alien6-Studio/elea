import type { ListData, ListItem } from "@alien6-studio/elea-content";

/**
 * A list block edited as one rich text field: the items become nested `<ul>`/`<ol>` markup
 * and come back as items. The tag flips at each level, as the viewer renders nested lists.
 */

const tagFor = (style: ListData["style"], level: number) => ((style === "ordered") === (level % 2 === 0) ? "ol" : "ul");

export const itemContent = (item: ListItem): string => (typeof item === "string" ? item : item.content);
export const itemChildren = (item: ListItem): ListItem[] => (typeof item === "string" ? [] : (item.items ?? []));

/** The markup of a list, for the field. */
export function itemsToHtml(items: readonly ListItem[], style: ListData["style"], level = 0): string {
  const tag = tagFor(style, level);
  const inner = items
    .map((item) => {
      const children = itemChildren(item);
      const nested = children.length > 0 ? itemsToHtml(children, style, level + 1) : "";
      return `<li>${itemContent(item) || "<br>"}${nested}</li>`;
    })
    .join("");
  return `<${tag}>${inner}</${tag}>`;
}

/** The markup parsed into nodes, with the document at hand. */
export function parseMarkup(html: string): ParentNode {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

/** Items from the field's markup: every list at the top level, in order; text outside lists is dropped. */
export function htmlToItems(html: string, parser: (markup: string) => ParentNode = parseMarkup): ListItem[] {
  const root = parser(html);
  const items: ListItem[] = [];
  for (const node of [...root.childNodes]) {
    if (isList(node)) items.push(...listItems(node));
  }
  return items;
}

const isList = (node: Node): node is HTMLElement => node.nodeType === 1 && ((node as Element).tagName === "UL" || (node as Element).tagName === "OL");

function listItems(list: HTMLElement): ListItem[] {
  const result: ListItem[] = [];
  for (const child of [...list.children]) {
    if (child.tagName !== "LI") continue;
    const nested: ListItem[] = [];
    const parts: string[] = [];
    for (const node of [...child.childNodes]) {
      if (isList(node)) nested.push(...listItems(node));
      else parts.push(node.nodeType === 1 ? (node as Element).outerHTML : (node.textContent ?? ""));
    }
    const content = cleanContent(parts.join(""));
    result.push(nested.length > 0 ? { content, items: nested } : content);
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
    if (itemContent(item) !== itemContent(other)) return false;
    return sameItems(itemChildren(item), itemChildren(other));
  });
}
