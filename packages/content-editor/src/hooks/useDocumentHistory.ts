"use client";

import type { EleaBlock } from "@alien6-studio/elea-content";
import { useCallback, useEffect, useRef, useState } from "react";

/** The editable state of a document, as the host holds it. */
export interface DocumentSnapshot {
  blocks: EleaBlock[];
  title: string;
  summary: string;
}

export interface DocumentHistoryOptions {
  onBlocksChange: (blocks: EleaBlock[]) => void;
  onTitleChange?: ((title: string) => void) | undefined;
  onSummaryChange?: ((summary: string) => void) | undefined;
  /** Changes closer than this, in milliseconds, join the previous entry: typing undoes by bursts. */
  groupWithinMs?: number | undefined;
  /** Oldest entries fall off beyond this count. */
  limit?: number | undefined;
}

export interface DocumentHistory {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Undo and redo over the controlled state of the editor. Every change the host applies is
 * recorded; undo hands the previous snapshot back to the host through the same callbacks,
 * so the host stays the single owner of the state.
 */
export function useDocumentHistory(current: DocumentSnapshot, options: DocumentHistoryOptions): DocumentHistory {
  const { onBlocksChange, onTitleChange, onSummaryChange, groupWithinMs = 500, limit = 100 } = options;
  const pastRef = useRef<DocumentSnapshot[]>([]);
  const futureRef = useRef<DocumentSnapshot[]>([]);
  const presentRef = useRef<DocumentSnapshot>(current);
  const lastChangeAtRef = useRef(0);
  const applyingRef = useRef(false);
  const [availability, setAvailability] = useState({ canUndo: false, canRedo: false });

  const refresh = () => {
    const next = { canUndo: pastRef.current.length > 0, canRedo: futureRef.current.length > 0 };
    setAvailability((previous) => (previous.canUndo === next.canUndo && previous.canRedo === next.canRedo ? previous : next));
  };

  useEffect(() => {
    const present = presentRef.current;
    if (current.blocks === present.blocks && current.title === present.title && current.summary === present.summary) return;
    if (applyingRef.current) {
      // The host just applied an undo or redo: that is the new present, not a new entry
      applyingRef.current = false;
      presentRef.current = current;
      refresh();
      return;
    }
    const now = Date.now();
    const grouped = pastRef.current.length > 0 && now - lastChangeAtRef.current < groupWithinMs;
    if (!grouped) {
      pastRef.current.push(present);
      if (pastRef.current.length > limit) pastRef.current.shift();
    }
    futureRef.current = [];
    presentRef.current = current;
    lastChangeAtRef.current = now;
    refresh();
  });

  const apply = useCallback(
    (snapshot: DocumentSnapshot) => {
      applyingRef.current = true;
      onBlocksChange(snapshot.blocks);
      if (onTitleChange && snapshot.title !== presentRef.current.title) onTitleChange(snapshot.title);
      if (onSummaryChange && snapshot.summary !== presentRef.current.summary) onSummaryChange(snapshot.summary);
      // When nothing the host controls changed, the effect never fires: settle here
      if (snapshot.blocks === presentRef.current.blocks && snapshot.title === presentRef.current.title && snapshot.summary === presentRef.current.summary) applyingRef.current = false;
      lastChangeAtRef.current = 0;
    },
    [onBlocksChange, onTitleChange, onSummaryChange],
  );

  const undo = useCallback(() => {
    const target = pastRef.current.pop();
    if (!target) return;
    futureRef.current.push(presentRef.current);
    apply(target);
    refresh();
  }, [apply]);

  const redo = useCallback(() => {
    const target = futureRef.current.pop();
    if (!target) return;
    pastRef.current.push(presentRef.current);
    apply(target);
    refresh();
  }, [apply]);

  return { undo, redo, canUndo: availability.canUndo, canRedo: availability.canRedo };
}
