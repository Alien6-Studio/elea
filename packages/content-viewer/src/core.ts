// The viewer without a bundled sanitizer: importing this entry loads neither DOMPurify nor jsdom.
import { createCoreContext, type CoreContentViewOptions } from "./coreContext.js";
import { renderContentComparison, type ContentComparisonBaseProps } from "./renderContentComparison.js";
import { renderContentView, type ContentViewBaseProps } from "./renderContentView.js";

export type ContentViewOptions = CoreContentViewOptions;

export interface ContentViewProps extends ContentViewBaseProps, CoreContentViewOptions {}

/** `ContentView` with a required `sanitizer`: the host decides how stored HTML is made safe. */
export function ContentView(props: Readonly<ContentViewProps>) {
  return renderContentView(props, createCoreContext(props));
}

export interface ContentComparisonProps extends ContentComparisonBaseProps, CoreContentViewOptions {}

/** `ContentComparison` with a required `sanitizer`, which must let `ins` and `del` through. */
export function ContentComparison(props: Readonly<ContentComparisonProps>) {
  return renderContentComparison(props, createCoreContext(props));
}

export { createCoreContext as createContentViewContext } from "./coreContext.js";
export * from "./shared.js";
