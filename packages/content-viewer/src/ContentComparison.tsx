import { createContentViewContext, type ContentViewOptions } from "./context.js";
import { renderContentComparison, type ContentComparisonBaseProps } from "./renderContentComparison.js";

export interface ContentComparisonProps extends ContentComparisonBaseProps, ContentViewOptions {}

/**
 * Renders two versions of a block document as one: blocks and words only in `after` are
 * insertions, those only in `before` deletions, and rich text keeps its formatting. No hook,
 * no state, as `ContentView`.
 */
export function ContentComparison(props: Readonly<ContentComparisonProps>) {
  return renderContentComparison(props, createContentViewContext(props));
}
