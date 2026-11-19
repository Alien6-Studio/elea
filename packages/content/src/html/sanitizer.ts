import { applyLinkTarget, type AttributeTarget, type LinkPolicyOptions } from "./links.js";
import { RICH_HTML_POLICY, toDomPurifyConfig, type RichHtmlPolicy } from "./policy.js";

/** A DOMPurify-compatible instance: the browser build, or one created over jsdom on the server. */
export interface HtmlPurifier {
  sanitize(dirty: string, config?: Record<string, unknown>): string;
  addHook(entryPoint: "afterSanitizeAttributes", hook: (node: AttributeTarget & { tagName?: string }) => void): void;
}

export interface SanitizerOptions {
  policy?: RichHtmlPolicy;
  links?: LinkPolicyOptions;
}

export interface HtmlSanitizer {
  readonly policy: RichHtmlPolicy;
  /** Rich HTML safe for display or editing: allowed formatting kept, XSS vectors removed, link targets enforced. */
  sanitize(html: string): string;
}

const URI_ATTRIBUTES = ["href", "src"];

interface ActivePolicy {
  policy: RichHtmlPolicy;
  links: LinkPolicyOptions;
}

// DOMPurify hooks are global to an instance; the policy of the sanitizer currently
// running is published for the duration of its synchronous `sanitize` call, so several
// sanitizers with different policies can share one instance without leaking into each other
const activeByPurifier = new WeakMap<HtmlPurifier, ActivePolicy | null>();

/**
 * DOMPurify lets `data:` through on image sources whatever the URI pattern says, so the
 * policy is enforced again on every URI attribute, then link targets are applied.
 */
function enforcePolicy(node: AttributeTarget & { tagName?: string }, active: ActivePolicy): void {
  for (const attribute of URI_ATTRIBUTES) {
    const value = node.getAttribute(attribute);
    if (value !== null && !active.policy.allowedUriPattern.test(value.trim())) node.removeAttribute(attribute);
  }
  if (node.tagName === "A") applyLinkTarget(node, active.links);
}

/** Binds the Elea HTML policy to a DOMPurify instance. Sanitizers on one instance keep their own policy. */
export function createSanitizer(purify: HtmlPurifier, options: SanitizerOptions = {}): HtmlSanitizer {
  const policy = options.policy ?? RICH_HTML_POLICY;
  const config = toDomPurifyConfig(policy);
  const active: ActivePolicy = { policy, links: options.links ?? {} };
  if (!activeByPurifier.has(purify)) {
    activeByPurifier.set(purify, null);
    purify.addHook("afterSanitizeAttributes", (node) => {
      const current = activeByPurifier.get(purify);
      if (current) enforcePolicy(node, current);
    });
  }
  return {
    policy,
    sanitize: (html) => {
      if (!html) return "";
      const previous = activeByPurifier.get(purify) ?? null;
      activeByPurifier.set(purify, active);
      try {
        return purify.sanitize(html, config);
      } finally {
        activeByPurifier.set(purify, previous);
      }
    },
  };
}
