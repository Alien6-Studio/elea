import { RICH_HTML_POLICY, toDomPurifyConfig, type RichHtmlPolicy } from "@alien6-studio/elea-content";
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

/** Parse rich text into inert nodes before editing or serializing it. */
export function richHtmlTemplate(html: string, policy: RichHtmlPolicy = RICH_HTML_POLICY): HTMLTemplateElement {
  const template = document.createElement("template");
  template.content.append(DOMPurify.sanitize(html, { ...toDomPurifyConfig(policy), RETURN_DOM_FRAGMENT: true }));
  return template;
}
