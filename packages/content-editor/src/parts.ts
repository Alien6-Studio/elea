import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** A part of the editor kept out of its first load: it comes the first time it is asked for. */
export interface Part<T> {
  /** The part, once it has loaded. */
  read: () => T | undefined;
  /** Starts the load, or joins the one under way; a load that failed starts over. */
  load: () => Promise<T>;
  subscribe: (listener: () => void) => () => void;
}

export function part<T>(source: () => Promise<T>): Part<T> {
  let value: T | undefined;
  let pending: Promise<T> | undefined;
  const listeners = new Set<() => void>();
  const settle = (loaded: T) => {
    value = loaded;
    for (const listener of listeners) listener();
    return loaded;
  };
  const forget = (error_: unknown): never => {
    pending = undefined;
    throw error_;
  };
  return {
    read: () => value,
    load: () => (pending ??= source().then(settle, forget)),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** The Markdown source view. */
export const sourcePart = part(() => import("./MarkdownEditor.js"));
/** The read-only preview. */
export const previewPart = part(() => import("./EditorPreview.js"));
/** The framing of a picture before its upload. */
export const cropperPart = part(() => import("./blocks/cropper.js"));

const PARTS = { source: sourcePart, preview: previewPart, cropper: cropperPart };

export type EditorPart = keyof typeof PARTS;

/**
 * Loads parts of the editor ahead of their first use: every one when none is named. The editor
 * asks for each by itself; this is for a host that knows one is about to be needed, or that
 * renders it on the server and has to hold it on both sides before the first render.
 */
export async function loadEditorParts(...names: EditorPart[]): Promise<void> {
  const wanted = names.length ? names : (Object.keys(PARTS) as EditorPart[]);
  await Promise.all(wanted.map((name) => PARTS[name].load()));
}

/**
 * A part while it is `wanted`, and whether it is still on its way. A load that fails is reported
 * to the page and handed to `onFail`; the part is asked for again the next time it is wanted.
 */
export function usePart<T>(source: Part<T>, wanted: boolean, onFail?: () => void): [part: T | undefined, waiting: boolean] {
  const loaded = useSyncExternalStore(source.subscribe, source.read, source.read);
  const [failed, setFailed] = useState(false);
  const fail = useRef(onFail);
  useEffect(() => { fail.current = onFail; }, [onFail]);

  useEffect(() => {
    if (!wanted || source.read() !== undefined) return;
    let live = true;
    source.load().catch((error_: unknown) => {
      globalThis.reportError?.(error_);
      if (!live) return;
      setFailed(true);
      fail.current?.();
    });
    return () => {
      live = false;
      setFailed(false);
    };
  }, [source, wanted]);

  return [wanted ? loaded : undefined, wanted && loaded === undefined && !failed];
}
