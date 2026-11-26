"use client";

import { Fragment, forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type ReactElement } from "react";
import type { ButtonLinkRenderProps } from "./Button.js";
import { ignoresKey } from "./Combobox.js";
import { SearchField, type SearchFieldProps } from "./SearchField.js";
import { reveal } from "./Select.js";
import { cx } from "./cx.js";
import { isAnchorGone, placePanel } from "./panelPosition.js";

/** Search destinations supplied and ranked by the host. IDs must be unique within the results. */
export interface SearchResult {
  id: string;
  label: string;
  href: string;
  description?: string | undefined;
}

export interface SearchAutocompleteProps extends Omit<SearchFieldProps, "defaultValue" | "role" | "value" | "onValueChange" | "results"> {
  value: string;
  onValueChange: (query: string) => void;
  results: readonly SearchResult[];
  /** Localized result count, loading, empty or error message. Announced while the list is open. */
  status: string;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Highlight the first match for a nonempty query so Enter can immediately open it. */
  autoSelectFirst?: boolean | undefined;
  /** Called after activating a destination in this tab. */
  onResultSelect?: ((result: SearchResult) => void) | undefined;
  /** Optional router adapter; forwards the same anchor props as Button. */
  render?: ((props: ButtonLinkRenderProps) => ReactElement) | undefined;
}

/** A local or remote destination search. The editable combobox owns focus while its suggestions are open. */
export const SearchAutocomplete = forwardRef<HTMLInputElement, SearchAutocompleteProps>(function SearchAutocomplete({
  id, value, onValueChange, results, status, onOpenChange, onResultSelect, autoSelectFirst = false, render, className, style,
  onKeyDown, onFocus, onClick, disabled, readOnly, ...fieldProps
}, ref) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listId = fieldId + "-results";
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const expanded = open && !disabled && !readOnly;
  const explicitIndex = results.findIndex(item => item.id === activeId);
  const activeIndex = explicitIndex < 0 && open && autoSelectFirst && value.trim() && results.length ? 0 : explicitIndex;
  const openChange = useRef(onOpenChange);
  useEffect(() => { openChange.current = onOpenChange; }, [onOpenChange]);
  useEffect(() => {
    if (!expanded) return;
    openChange.current?.(true);
    const anchor = input.current!;
    const popup = panel.current!;
    const doc = anchor.ownerDocument;
    const view = doc.defaultView!;
    const position = (event?: Event) => {
      if (event && isAnchorGone(anchor, event.target)) { setOpen(false); return; }
      popup.style.setProperty("--_elea-search-width", anchor.getBoundingClientRect().width + "px");
      placePanel(popup, anchor, "bottom", "start");
    };
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    position();
    const observer = view.ResizeObserver ? new view.ResizeObserver(() => position()) : undefined;
    observer?.observe(anchor);
    observer?.observe(popup);
    doc.addEventListener("pointerdown", outside);
    view.addEventListener("resize", position);
    view.addEventListener("scroll", position, true);
    return () => {
      observer?.disconnect();
      doc.removeEventListener("pointerdown", outside);
      view.removeEventListener("resize", position);
      view.removeEventListener("scroll", position, true);
      openChange.current?.(false);
    };
  }, [expanded]);
  useEffect(() => { if (expanded && activeIndex >= 0) reveal(panel.current, activeIndex, list.current); }, [expanded, activeIndex]);
  useEffect(() => { if (!expanded) setActiveId(null); }, [expanded]);
  useEffect(() => { if (disabled || readOnly) setOpen(false); }, [disabled, readOnly]);

  return <div className={cx("elea-search-autocomplete", className)} style={style} ref={root}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <SearchField {...fieldProps} ref={input} id={fieldId} value={value} disabled={disabled} readOnly={readOnly}
      role="combobox" aria-autocomplete="list" autoComplete={fieldProps.autoComplete ?? "off"}
      aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
      aria-activedescendant={expanded && activeIndex >= 0 ? listId + "-" + activeIndex : undefined}
      onFocus={event => { onFocus?.(event); if (!event.defaultPrevented && !readOnly && !disabled) setOpen(true); }}
      onClick={event => { onClick?.(event); if (!event.defaultPrevented && !readOnly && !disabled) setOpen(true); }}
      onValueChange={query => { setActiveId(null); setOpen(true); onValueChange(query); }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled || readOnly || ignoresKey(event)) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
          const last = results.length - 1;
          const previous = activeIndex < 0 ? last : Math.max(0, activeIndex - 1);
          const next = event.key === "ArrowDown" ? Math.min(activeIndex + 1, last) : previous;
          setActiveId(results[next]?.id ?? null);
        } else if (expanded && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        } else if (expanded && event.key === "Enter" && activeIndex >= 0) {
          event.preventDefault();
          const option = list.current?.children[activeIndex] as HTMLElement | undefined;
          option?.click();
        }
      }} />
    {expanded && <div ref={panel} className="elea-search-autocomplete__panel">
      <div className="elea-search-autocomplete__status" role="status">{status}</div>
      <div role="listbox" aria-label={fieldProps.label} id={listId} ref={list}>
        {results.map((item, index) => {
          const children = <><span>{item.label}</span>{item.description && <small>{item.description}</small>}</>;
          const props: ButtonLinkRenderProps = {
            id: listId + "-" + index, role: "option", tabIndex: -1, href: item.href,
            "aria-selected": index === activeIndex, className: "elea-search-autocomplete__result",
            onMouseDown: event => { if (event.button === 0) event.preventDefault(); },
            onClick: event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              setOpen(false);
              onResultSelect?.(item);
            },
            children,
          };
          return <Fragment key={item.id}>{render ? render(props) : <a {...props}>{children}</a>}</Fragment>;
        })}
      </div>
    </div>}
  </div>;
});
