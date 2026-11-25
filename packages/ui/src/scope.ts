"use client";

import { useEffect, useReducer, useState } from "react";

export type Appearance = "light" | "dark" | "auto";

const appearanceSelector = '[data-elea-appearance="light"],[data-elea-appearance="dark"],[data-elea-appearance="auto"]';

/** What a surface rendered outside its container takes from it. */
export interface SurfaceScope {
  "data-elea-theme"?: string | undefined;
  "data-elea-appearance"?: Appearance | undefined;
  "data-elea-motion"?: string | undefined;
}

/**
 * Theme, appearance and motion resolve from their respective nearest ancestors. A surface in a portal carries them as its own attributes, so the
 * tokens a host sets under `[data-elea-theme="…"]` reach it without naming its classes.
 */
export function scopeOf(element: Element | null | undefined): SurfaceScope {
  return {
    "data-elea-theme": element?.closest<HTMLElement>("[data-elea-theme]")?.dataset["eleaTheme"],
    "data-elea-appearance": element?.closest<HTMLElement>(appearanceSelector)?.dataset["eleaAppearance"] as Appearance | undefined,
    "data-elea-motion": element?.closest<HTMLElement>("[data-elea-motion]")?.dataset["eleaMotion"],
  };
}

/**
 * The scope of the place a component is rendered at, for the surface it sends to a portal. Give the
 * first value as `ref` to an element that stays in place, a `<template>` for one that takes no room,
 * from before the surface shows: the second is then the scope at each render, known when it opens.
 */
export function useSurfaceScope(observe = true) {
  const [element, setElement] = useState<Element | null>(null);
  const [, refresh] = useReducer((revision: number) => revision + 1, 0);
  useEffect(() => {
    const Observer = element?.ownerDocument.defaultView?.MutationObserver;
    if (!observe || !Observer) return;
    const observer = new Observer(refresh);
    for (let node: Element | null = element; node; node = node.parentElement) {
      observer.observe(node, { attributeFilter: ["data-elea-theme", "data-elea-appearance", "data-elea-motion"] });
    }
    return () => observer.disconnect();
  }, [element, observe]);
  return [setElement, scopeOf(element)] as const;
}
