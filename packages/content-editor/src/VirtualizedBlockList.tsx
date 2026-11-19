"use client";

import type { BlockData, BlockLike, EleaBlock } from "@alien6-studio/elea-content";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { BlockEditor, type BlockEditorMap } from "./BlockEditor.js";
import type { EditorContextInfo } from "./provider.js";

export interface VirtualizedBlockListProps {
  blocks: EleaBlock[];
  focusedBlock: string | null;
  onBlockFocus: (id: string) => void;
  onBlockBlur: (event?: FocusEvent) => void;
  onBlockUpdate: (id: string, data: BlockData) => void;
  onBlockRemove: (id: string) => void;
  onAddBlockAfter: (id: string, type: string, initialText?: string) => void;
  onInsertBlocksAfter?: ((id: string, blocks: BlockLike[], after: string) => void) | undefined;
  context?: EditorContextInfo | undefined;
  editors?: BlockEditorMap | undefined;
  /** Blocks beyond this count are rendered as placeholders until they come near the viewport. */
  threshold?: number | undefined;
}

const ESTIMATED_HEIGHT: Record<string, number> = { image: 300, video: 400 };

/**
 * Renders every block for short documents; for long ones, only the blocks near the
 * viewport and the focused block, the rest as sized placeholders so scrolling stays
 * stable. A block stays rendered once seen.
 */
export function VirtualizedBlockList({ blocks, focusedBlock, onBlockFocus, onBlockBlur, onBlockUpdate, onBlockRemove, onAddBlockAfter, onInsertBlocksAfter, context, editors, threshold = 50 }: VirtualizedBlockListProps) {
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef(new Map<string, HTMLDivElement>());
  const virtualize = blocks.length > threshold;

  useEffect(() => {
    if (!virtualize || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target.getAttribute("data-elea-block-id")).filter((id): id is string => id !== null);
        if (seen.length > 0) setVisible((previous) => new Set([...previous, ...seen]));
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );
    observerRef.current = observer;
    for (const element of elementsRef.current.values()) observer.observe(element);
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [virtualize, blocks.length]);

  const register = (id: string) => (element: HTMLDivElement | null) => {
    if (element) {
      elementsRef.current.set(id, element);
      if (virtualize) observerRef.current?.observe(element);
      return;
    }
    const existing = elementsRef.current.get(id);
    if (existing) observerRef.current?.unobserve(existing);
    elementsRef.current.delete(id);
  };

  return (
    <>
      {blocks.map((block) => {
        const isFocused = focusedBlock === block.id;
        if (!virtualize || isFocused || visible.has(block.id)) {
          return (
            <div key={block.id} ref={register(block.id)} className="elea-block-slot" data-elea-block-slot={block.id}>
              <BlockEditor
                block={block}
                isFocused={isFocused}
                onFocus={() => onBlockFocus(block.id)}
                onBlur={onBlockBlur}
                onUpdate={(data) => onBlockUpdate(block.id, data)}
                onRemove={() => onBlockRemove(block.id)}
                onAddBlockAfter={(type, initialText) => onAddBlockAfter(block.id, type, initialText)}
                onInsertBlocksAfter={onInsertBlocksAfter ? (pasted, after) => onInsertBlocksAfter(block.id, pasted, after) : undefined}
                context={context}
                editors={editors}
              />
            </div>
          );
        }
        const height = ESTIMATED_HEIGHT[block.type] ?? 100;
        return (
          <div key={block.id} ref={register(block.id)} className="elea-block-slot elea-block-slot--placeholder" data-elea-block-id={block.id} data-elea-block-type={block.type} style={{ minHeight: height }}>
            <div className="elea-block-placeholder" style={{ height }} aria-hidden="true" />
          </div>
        );
      })}
    </>
  );
}
