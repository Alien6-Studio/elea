"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_OPTIONS: IntersectionObserverInit = { rootMargin: "200px", threshold: 0 };

/**
 * Tracks which registered blocks have entered the viewport. A block stays visible once
 * seen, so scrolling back never re-renders placeholders.
 */
export function useBlockVisibility(options: IntersectionObserverInit = DEFAULT_OPTIONS) {
  const [visibleBlocks, setVisibleBlocks] = useState<ReadonlySet<string>>(() => new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef(new Map<string, Element>());

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      setVisibleBlocks((previous) => {
        const next = new Set(previous);
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-elea-block-id");
          if (id && entry.isIntersecting) next.add(id);
        }
        return next.size === previous.size ? previous : next;
      });
    }, options);
    observerRef.current = observer;
    for (const element of elementsRef.current.values()) observer.observe(element);
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [options]);

  const registerBlock = (id: string, element: Element | null) => {
    if (element) {
      elementsRef.current.set(id, element);
      observerRef.current?.observe(element);
      return;
    }
    const existing = elementsRef.current.get(id);
    if (existing) {
      observerRef.current?.unobserve(existing);
      elementsRef.current.delete(id);
    }
  };

  return { visibleBlocks, registerBlock, isBlockVisible: (id: string) => visibleBlocks.has(id) };
}
