"use client";

import type { BlockData, BlockLike, EleaBlock } from "@alien6-studio/elea-content";
import { useEffect, useRef, useState, type FocusEvent, type HTMLAttributes } from "react";
import type { DropTarget } from "./hooks/useBlockDrag.js";
import { BlockEditor, type BlockEditorMap, type BlockEditorProps } from "./BlockEditor.js";
import type { EditorContextInfo } from "./provider.js";

export interface VirtualizedBlockListProps {
  blocks: EleaBlock[];
  focusedBlock: string | null;
  selectedIds?: readonly string[] | undefined;
  onBlockFocus: (id: string) => void;
  onBlockBlur: (event?: FocusEvent) => void;
  onBlockUpdate: (id: string, data: BlockData) => void;
  onBlockRemove: (id: string) => void;
  onAddBlockAfter: (id: string, type: string, initialText?: string) => void;
  onInsertBlocksAfter?: ((id: string, blocks: BlockLike[], after: string) => void) | undefined;
  onNavigate?: ((id: string, direction: "up" | "down") => void) | undefined;
  onMergeBackward?: ((id: string, html: string) => void) | undefined;
  onMergeForward?: ((id: string) => void) | undefined;
  onConvert?: ((id: string, type: string, data?: Record<string, unknown>) => void) | undefined;
  onReplaceWith?: ((id: string, blocks: BlockLike[], focus: number, position?: "start" | "end") => void) | undefined;
  blockTypes?: readonly string[] | undefined;
  /** Drag and drop wiring: grip props per block and drop-zone props per slot. */
  dragHandleProps?: ((id: string) => HTMLAttributes<HTMLElement>) | undefined;
  slotProps?: ((id: string) => HTMLAttributes<HTMLElement>) | undefined;
  dropTarget?: DropTarget | null | undefined;
  draggingIds?: readonly string[] | null | undefined;
  context?: EditorContextInfo | undefined;
  editors?: BlockEditorMap | undefined;
  mode?: BlockEditorProps["mode"];
  onActiveField?: BlockEditorProps["onActiveField"];
  /** Blocks beyond this count are rendered as placeholders until they come near the viewport. */
  threshold?: number | undefined;
}

const ESTIMATED_HEIGHT: Record<string, number> = { image: 300, video: 400 };

/**
 * Renders every block for short documents; for long ones, only the blocks near the
 * viewport and the focused block, the rest as sized placeholders so scrolling stays
 * stable. A block stays rendered once seen.
 */
export function VirtualizedBlockList({ blocks, focusedBlock, selectedIds, onBlockFocus, onBlockBlur, onBlockUpdate, onBlockRemove, onAddBlockAfter, onInsertBlocksAfter, onNavigate, onMergeBackward, onMergeForward, onConvert, blockTypes, dragHandleProps, slotProps, dropTarget, draggingIds, context, editors, threshold = 50, mode, onActiveField, onReplaceWith }: VirtualizedBlockListProps) {
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
        const isSelected = selectedIds?.includes(block.id) ?? false;
        const slotClass = ["elea-block-slot", dropTarget?.id === block.id ? `elea-block-slot--drop-${dropTarget.position}` : "", draggingIds?.includes(block.id) ? "elea-block-slot--dragging" : ""].filter(Boolean).join(" ");
        if (!virtualize || isFocused || isSelected || visible.has(block.id)) {
          return (
            <div key={block.id} ref={register(block.id)} className={slotClass} data-elea-block-slot={block.id} {...slotProps?.(block.id)}>
              <BlockEditor
                block={block}
                isFocused={isFocused}
                isSelected={isSelected}
                onFocus={() => onBlockFocus(block.id)}
                onBlur={onBlockBlur}
                onUpdate={(data) => onBlockUpdate(block.id, data)}
                onRemove={() => onBlockRemove(block.id)}
                onAddBlockAfter={(type, initialText) => onAddBlockAfter(block.id, type, initialText)}
                onInsertBlocksAfter={onInsertBlocksAfter ? (pasted, after) => onInsertBlocksAfter(block.id, pasted, after) : undefined}
                onNavigate={onNavigate ? (direction) => onNavigate(block.id, direction) : undefined}
                onMergeBackward={onMergeBackward ? (html) => onMergeBackward(block.id, html) : undefined}
                onMergeForward={onMergeForward ? () => onMergeForward(block.id) : undefined}
                onConvert={onConvert ? (type, data) => onConvert(block.id, type, data) : undefined}
                onReplaceWith={onReplaceWith ? (incoming, focus, position) => onReplaceWith(block.id, incoming, focus, position) : undefined}
                blockTypes={blockTypes}
                dragHandleProps={dragHandleProps?.(block.id)}
                context={context}
                editors={editors}
                mode={mode}
                onActiveField={onActiveField}
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
