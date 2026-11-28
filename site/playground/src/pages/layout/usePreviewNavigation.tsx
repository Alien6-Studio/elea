import { useState as usePreviewState } from "react";
import type { ButtonLinkRenderProps as PreviewLinkProps } from "@alien6-studio/elea-ui";

/** An in-memory link adapter for interactive examples. Each example owns its current destination. */
export function usePreviewNavigation(initialId: string, onSelect?: () => void) {
  const [current, setCurrent] = usePreviewState(initialId);
  function select(id: string) {
    setCurrent(id);
    onSelect?.();
  }
  function render({ href, onClick, ...props }: PreviewLinkProps) {
    return <a {...props} href={href} onClick={event => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      select(href.slice(1));
    }} />;
  }
  return { current, select, render };
}
