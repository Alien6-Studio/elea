/**
 * Internal vs external link policy. Internal links (relative paths, fragments, absolute
 * URLs on one of the site's own hosts) open in the same tab so the browser history keeps
 * working; external links open in a new tab with opener protection.
 */
export interface LinkPolicyOptions {
  /** Hostnames whose absolute HTTP(S) URLs open in the same tab. */
  siteHostnames?: readonly string[];
}

/** Relative references and configured HTTP(S) hosts are internal. Network-path references are external. */
export function isInternalLink(href: string | null | undefined, options: LinkPolicyOptions = {}): boolean {
  // Browsers discard tabs and newlines throughout a URL and ignore leading ASCII controls.
  const value = href?.trim().replaceAll(/[\t\r\n]/g, "").replace(/^[\0- ]+/, "");
  if (!value || /^[\\/]{2}/.test(value)) return false;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return true;
  try {
    const { protocol, hostname } = new URL(value);
    return (protocol === "http:" || protocol === "https:") && options.siteHostnames?.includes(hostname) === true;
  } catch {
    return false;
  }
}

export interface LinkTargetAttributes {
  target?: "_blank";
  rel?: "noopener noreferrer";
}

/** Attributes to put on an anchor for the given href: none when internal or absent. */
export function linkTargetAttributes(href: string | null | undefined, options: LinkPolicyOptions = {}): LinkTargetAttributes {
  return href == null || isInternalLink(href, options) ? {} : { target: "_blank", rel: "noopener noreferrer" };
}

/** The subset of a DOM element the policy needs, so it runs on any DOM implementation. */
export interface AttributeTarget {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

/** Applies the policy in place on an anchor (sanitizer hook, editor). */
export function applyLinkTarget(anchor: AttributeTarget, options: LinkPolicyOptions = {}): void {
  const { target, rel } = linkTargetAttributes(anchor.getAttribute("href"), options);
  if (target && rel) {
    anchor.setAttribute("target", target);
    anchor.setAttribute("rel", rel);
  } else {
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  }
}
