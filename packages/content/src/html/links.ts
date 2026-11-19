/**
 * Internal vs external link policy. Internal links (relative paths, fragments, absolute
 * URLs on one of the site's own hosts) open in the same tab so the browser history keeps
 * working; external links open in a new tab with opener protection.
 */
export interface LinkPolicyOptions {
  /** Hostnames of the site itself; `localhost` and `127.0.0.1` are always included. */
  siteHostnames?: readonly string[];
}

const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

function isOwnHost(hostname: string, options: LinkPolicyOptions): boolean {
  return LOCAL_HOSTS.includes(hostname) || (options.siteHostnames ?? []).includes(hostname);
}

/** Relative path, fragment or same-host absolute URL. Protocol-relative URLs (`//host`) are external. */
const RELATIVE_BASE = "https://relative.invalid/";

/**
 * Relative path, fragment or same-host absolute URL. Everything is resolved with the URL
 * parser against a neutral base, so `//host`, `/\\host` and other spellings the browser would
 * read as another host are external.
 */
export function isInternalLink(href: string | null | undefined, options: LinkPolicyOptions = {}): boolean {
  if (!href) return false;
  const value = href.trim();
  if (value.startsWith("#")) return true;
  let parsed: URL;
  try {
    parsed = new URL(value, RELATIVE_BASE);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (parsed.hostname === "relative.invalid") return true;
  return isOwnHost(parsed.hostname, options);
}

export interface LinkTargetAttributes {
  target?: "_blank";
  rel?: "noopener noreferrer";
}

/** Attributes to put on an anchor for the given href: none when internal. */
export function linkTargetAttributes(href: string | null | undefined, options: LinkPolicyOptions = {}): LinkTargetAttributes {
  return isInternalLink(href, options) ? {} : { target: "_blank", rel: "noopener noreferrer" };
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
