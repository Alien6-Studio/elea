"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Fits a textarea to its content; usable from event handlers too. */
export function resizeTextarea(element: HTMLTextAreaElement): void {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

/** A ref to put on a textarea that resizes whenever `value` changes, the fonts load or the window resizes. */
export function useTextareaResize<T extends HTMLTextAreaElement>(value: string): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) resizeTextarea(ref.current);
  }, [value]);
  useEffect(() => {
    const fit = () => { if (ref.current) resizeTextarea(ref.current); };
    // Web fonts change the metrics after the first measure, so the height follows their arrival
    let cancelled = false;
    void document.fonts?.ready.then(() => { if (!cancelled) fit(); });
    window.addEventListener("resize", fit);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", fit);
    };
  }, []);
  return ref;
}
