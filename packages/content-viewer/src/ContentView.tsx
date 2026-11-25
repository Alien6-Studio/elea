import { createContentViewContext, type ContentViewOptions } from "./context.js";
import { renderContentView, type ContentViewBaseProps } from "./renderContentView.js";

export interface ContentViewProps extends ContentViewBaseProps, ContentViewOptions {}

/**
 * Renders a block document. No hook, no state: it works as a React server component
 * and during static rendering. Each block is wrapped in an element that carries its id
 * and type, a stable contract for styling, tests and extensions.
 */
export function ContentView(props: Readonly<ContentViewProps>) {
  return renderContentView(props, createContentViewContext(props));
}
