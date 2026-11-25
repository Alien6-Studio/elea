"use client";

import { useEffect, useId, useRef, useState, type Key, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { IconButton } from "./Button.js";
import { cx } from "./cx.js";
import { paginationRange } from "./Pagination.js";

export type CarouselNavigation = "arrows" | "dots" | "both";
export type CarouselGap = "none" | "sm" | "md" | "lg";

export interface CarouselProps<Item> {
  items: readonly Item[];
  itemKey: (item: Item) => Key;
  renderItem: (item: Item) => ReactNode;
  label: string;
  /** Localized accessible role description, such as "carousel". */
  roleDescription?: string | undefined;
  previousLabel: string;
  nextLabel: string;
  controlsLabel?: string | undefined;
  /** Zero-based index of the first visible item. */
  index?: number | undefined;
  defaultIndex?: number | undefined;
  onIndexChange?: ((index: number) => void) | undefined;
  loop?: boolean | undefined;
  /** Show as many items of this minimum width (CSS pixels) as fit. Defaults to one visible item. */
  minItemWidth?: number | undefined;
  /** Fixed visible item count, or a maximum when combined with minItemWidth. */
  itemsPerView?: number | undefined;
  gap?: CarouselGap | undefined;
  navigation?: CarouselNavigation | undefined;
  /** The visible range is shown by default with arrows alone. It is always announced. */
  showCounter?: boolean | undefined;
  controlsPosition?: "top" | "bottom" | undefined;
  controlsAlign?: "start" | "center" | "end" | undefined;
  /** Accessible name for a dot. Receives the zero-based index of its first visible item. */
  getDotLabel?: ((index: number) => string) | undefined;
  heading?: ReactNode;
  /** Interactive content above the viewport. */
  toolbar?: ReactNode;
  className?: string | undefined;
}

const slideAction = ":scope > button:enabled, :scope > a[href]";

function bounded(index: number, last: number) {
  return Math.max(0, Math.min(Number.isFinite(index) ? Math.trunc(index) : 0, last));
}

/** A manually navigated collection. Only the visible items are mounted. */
export function Carousel<Item>({ items, itemKey, renderItem, label, roleDescription, previousLabel, nextLabel, controlsLabel,
  index, defaultIndex = 0, onIndexChange, loop = false, minItemWidth, itemsPerView, gap = "md", navigation = "arrows",
  showCounter = navigation === "arrows", controlsPosition = "top", controlsAlign = "end", getDotLabel,
  heading, toolbar, className }: Readonly<CarouselProps<Item>>) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const [interactive, setInteractive] = useState(false);
  const [capacity, setCapacity] = useState(1);
  const [position, setPosition] = useState(defaultIndex);
  const count = items.length;
  const hasItems = count > 0;
  const responsive = minItemWidth !== undefined && minItemWidth > 0;
  const maxVisible = itemsPerView !== undefined && Number.isFinite(itemsPerView)
    ? Math.max(1, Math.trunc(itemsPerView)) : responsive ? Infinity : 1;
  const visible = responsive ? Math.min(capacity, maxVisible) : maxVisible;
  const last = Math.max(0, count - visible);
  const first = bounded(index ?? position, last);
  const end = Math.min(count, first + visible);
  useEffect(() => { setInteractive(true); }, []);
  useEffect(() => {
    const node = viewport.current;
    if (!node || !minItemWidth || minItemWidth <= 0) return;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
      setCapacity(Math.max(1, Math.floor((node.clientWidth + gap) / (minItemWidth + gap))));
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [minItemWidth, hasItems, gap]);

  function change(next: number) {
    if (next === first) return;
    if (index === undefined) setPosition(next);
    onIndexChange?.(next);
  }

  function destination(next: number, limit: number) {
    if (!loop) return bounded(next, limit);
    return (next + limit + 1) % (limit + 1);
  }

  function navigate(event: KeyboardEvent<HTMLElement>, fromSlide = false) {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey || event.nativeEvent.isComposing) return;
    const target = event.target as HTMLElement;
    const slide = fromSlide ? target.closest<HTMLElement>(".elea-carousel__slide") : null;
    // A slide may hold a form or another composite widget with its own arrow-key interaction.
    if (fromSlide && (!slide || slide.querySelector(slideAction) !== target || slide.parentElement !== viewport.current)) return;
    const current = slide ? Number(slide.dataset.index) : first;
    const limit = slide ? count - 1 : last;
    let next: number;
    switch (event.key) {
      case "Home": next = 0; break;
      case "End": next = limit; break;
      case "ArrowLeft":
      case "ArrowRight": {
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        next = destination(current + (event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : -1), limit);
        break;
      }
      default: return;
    }
    event.preventDefault();
    if (!slide) {
      change(next);
      if (target.classList.contains("elea-carousel__dot")) {
        const group = event.currentTarget;
        requestAnimationFrame(() => {
          if (document.activeElement === target || document.activeElement === document.body) {
            group.querySelector<HTMLButtonElement>("[aria-current]")?.focus();
          }
        });
      }
      return;
    }
    const start = Math.min(next, Math.max(first, next - visible + 1));
    change(start);
    function focusSlide() {
      viewport.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.querySelector<HTMLElement>(slideAction)?.focus();
    }
    if (start === first) focusSlide();
    else requestAnimationFrame(() => {
      if (document.activeElement === target || document.activeElement === document.body) focusSlide();
    });
  }

  function startSwipe(event: PointerEvent) {
    suppressClick.current = false;
    swipe.current = event.pointerType === "touch" && event.isPrimary && !(event.target as Element).closest("input, textarea, select, [contenteditable=true], [role=slider]")
      ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
  }

  function endSwipe(event: PointerEvent) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < 45 || Math.abs(dx) <= 1.5 * Math.abs(event.clientY - start.y)) return;
    suppressClick.current = true;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    change(destination(first + ((dx < 0) !== rtl ? 1 : -1), last));
  }

  if (!hasItems) return null;
  function rangeLabel(start: number) {
    return (visible === 1 ? start + 1 : `${start + 1}–${Math.min(count, start + visible)}`) + " / " + count;
  }
  const arrows = navigation !== "dots";
  const controls = interactive && last > 0 && (
    <div className="elea-carousel__controls" role="group" aria-label={controlsLabel ?? label}
      data-align={controlsAlign} onKeyDown={event => navigate(event)}>
      {arrows && <IconButton label={previousLabel} aria-controls={id} aria-disabled={!loop && first === 0} onClick={() => change(destination(first - 1, last))}>
        <span className="elea-carousel__arrow">←</span>
      </IconButton>}
      {navigation !== "arrows" && <div className="elea-carousel__dots">
        {paginationRange(first + 1, last + 1, 3).map((page, offset) => page === null
          ? <span key={`gap-${offset}`} aria-hidden="true">…</span>
          : <button key={page} type="button" className="elea-carousel__dot"
              aria-label={getDotLabel?.(page - 1) ?? rangeLabel(page - 1)} aria-controls={id}
              aria-current={page === first + 1 || undefined} tabIndex={page === first + 1 ? 0 : -1}
              onClick={() => change(page - 1)} />)}
      </div>}
      <span className="elea-carousel__position" data-visible={showCounter} role="status">{rangeLabel(first)}</span>
      {arrows && <IconButton label={nextLabel} aria-controls={id} aria-disabled={!loop && first === last} onClick={() => change(destination(first + 1, last))}>
        <span className="elea-carousel__arrow">→</span>
      </IconButton>}
    </div>
  );
  return (
    <section aria-label={label} aria-roledescription={roleDescription} className={cx("elea-carousel", className)}>
      <div className="elea-carousel__header">
        {heading}
        {controlsPosition === "top" && controls}
      </div>
      {interactive && toolbar}
      <div ref={viewport} id={id} className="elea-carousel__viewport" data-gap={gap} onKeyDown={event => navigate(event, true)}
        onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={() => { swipe.current = null; }}
        onClickCapture={event => {
          if (suppressClick.current && event.detail > 0) { event.preventDefault(); event.stopPropagation(); }
          suppressClick.current = false;
        }}>
        {items.slice(first, end).map((item, offset) => (
          <div key={itemKey(item)} className="elea-carousel__slide" data-index={first + offset}>{renderItem(item)}</div>
        ))}
      </div>
      {controlsPosition === "bottom" && controls && <div className="elea-carousel__footer">{controls}</div>}
    </section>
  );
}
