"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Fits a textarea to its content; usable from event handlers too. */
export function resizeTextarea(element: HTMLTextAreaElement): void {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

/** A ref to put on a textarea that resizes whenever `value` changes. */
export function useTextareaResize<T extends HTMLTextAreaElement>(value: string): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) resizeTextarea(ref.current);
  }, [value]);
  return ref;
}
