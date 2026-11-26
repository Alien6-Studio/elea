import { isInternalLink } from "./html/links.js";
import { isInlineImageUrl, isSafeUrl, isSiteRelativeUrl } from "./html/policy.js";

export const alternation = (...parts: RegExp[]) => parts.map((part) => part.source).join("|");

// A bare destination is document-relative: prefixed for the URL policy
export function markdownHref(url: string, image = false): string {
  if (image && isInlineImageUrl(url)) return url;
  if (isSiteRelativeUrl(url) || isSafeUrl(url)) return url;
  return isInternalLink(url) ? `./${url}` : "";
}
