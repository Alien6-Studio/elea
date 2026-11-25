import { RICH_HTML_POLICY } from "@alien6-studio/elea-content";
import DOMPurify from "isomorphic-dompurify";

export const BLOCKS_ATTRIBUTE = "data-elea-clipboard";

/** Read a detached, sanitized fragment. Office styles are used to recover text formatting. */
export function clipboardBody(html: string): HTMLElement {
  const fragment = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...RICH_HTML_POLICY.allowedTags, "section", "article", "header", "footer", "main", "aside", "nav", "font", "hr", "dl", "dt", "dd"],
    ALLOWED_ATTR: [...RICH_HTML_POLICY.allowedAttributes, "style", BLOCKS_ATTRIBUTE],
    ALLOW_DATA_ATTR: false,
    ADD_FORBID_CONTENTS: ["o:p"],
    FORCE_BODY: true,
    RETURN_DOM_FRAGMENT: true,
  });
  const container = fragment.ownerDocument.createElement("div");
  container.append(fragment);
  return container;
}
