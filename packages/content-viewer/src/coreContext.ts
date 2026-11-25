import { defaultRegistry, en, type HtmlSanitizer, type LinkPolicyOptions } from "@alien6-studio/elea-content";
import type { AssetUrlResolver, ContentViewContext, ContentViewOptions } from "./context.js";

/** Options when the host supplies the sanitizer, which then carries the link policy as well. */
export type CoreContentViewOptions = Omit<ContentViewOptions, "sanitizer" | keyof LinkPolicyOptions> & { sanitizer: HtmlSanitizer };

export const defaultAssetUrlResolver: AssetUrlResolver = (file) => file.url || file.id;

/** The context around a given sanitizer; nothing here loads a DOM. */
export function createCoreContext(options: CoreContentViewOptions): ContentViewContext {
  return {
    registry: options.registry ?? defaultRegistry,
    sanitizer: options.sanitizer,
    resolveAssetUrl: options.resolveAssetUrl ?? defaultAssetUrlResolver,
    renderAttachmentIcon: options.renderAttachmentIcon,
    onAttachmentClick: options.onAttachmentClick,
    messages: options.messages ?? en,
  };
}
