/** Tags, attributes and URI schemes rich text may contain, for both display and editing. */
export interface RichHtmlPolicy {
  readonly allowedTags: readonly string[];
  readonly allowedAttributes: readonly string[];
  /** Tested against every URI attribute (href, src); anything else is dropped. */
  readonly allowedUriPattern: RegExp;
}

export const RICH_HTML_POLICY: RichHtmlPolicy = {
  allowedTags: [
    "p", "span", "div", "br",
    "strong", "b", "em", "i", "u", "s", "strike", "del",
    "a",
    "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "cite",
    "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
    "img",
    "figure", "figcaption",
  ],
  allowedAttributes: ["href", "target", "rel", "class", "src", "alt", "title", "colspan", "rowspan"],
  // http(s) or a same-site relative path (`/path`, `#anchor`, `./`, `../`); blocks data:,
  // javascript:, vbscript: and protocol-relative `//host` in every attribute, img src included
  allowedUriPattern: /^(?:https?:|\/(?!\/)|#|\.\.?\/)/i,
};

const URI_ATTRIBUTES = ["href", "src"];

/**
 * DOMPurify configuration equivalent to a policy. `FORCE_BODY` prevents DOM clobbering via
 * fragment injection. DOMPurify tests every attribute value that is not declared URI-safe
 * against the URI pattern, so the non-URI attributes of the policy are declared as such;
 * otherwise `colspan="2"` would be dropped.
 */
export function toDomPurifyConfig(policy: RichHtmlPolicy = RICH_HTML_POLICY): Record<string, unknown> {
  return {
    ALLOWED_TAGS: [...policy.allowedTags],
    ALLOWED_ATTR: [...policy.allowedAttributes],
    ADD_ATTR: ["target"],
    ADD_URI_SAFE_ATTR: policy.allowedAttributes.filter((attribute) => !URI_ATTRIBUTES.includes(attribute)),
    FORCE_BODY: true,
    ALLOWED_URI_REGEXP: policy.allowedUriPattern,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };
}

/** Only http and https are safe link schemes; javascript:, data:, vbscript: and file: are refused. */
export function isSafeUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

/**
 * A path on the current site: root-relative, a fragment, `./` or `../`. The URL parser decides
 * what stays on the site, so `//host` and `/\\host`, which browsers read as another host, are not.
 */
export function isSiteRelativeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!(trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./") || trimmed.startsWith("../"))) return false;
  try {
    return new URL(trimmed, "https://relative.invalid/").hostname === "relative.invalid";
  } catch {
    return false;
  }
}

/**
 * Normalizes what a user typed in a link prompt: a site-relative path or fragment is kept,
 * anything else must be an http(s) URL, with the scheme added when missing. Any other explicit
 * scheme (javascript:, data:, mailto:) is refused instead of being hidden behind https://.
 * Returns null when the input is unsafe or empty.
 */
export function resolveLinkUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;
  if (isSiteRelativeUrl(trimmed)) return trimmed;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const url = hasScheme ? trimmed : `https://${trimmed}`;
  return isSafeUrl(url) ? url : null;
}
