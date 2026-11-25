"use client";

import type { BlockData, BlockLike, EleaBlock } from "@alien6-studio/elea-content";
import { useMemo, type FocusEvent, type HTMLAttributes } from "react";
import { useBlockVisibility } from "./hooks/useBlockVisibility.js";
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

const VIEWPORT = { rootMargin: "400px 0px", threshold: 0 };
const ESTIMATED_HEIGHT: Record<string, number> = { image: 300, video: 400 };

type ListHandlers = Omit<VirtualizedBlockListProps, "blocks" | "focusedBlock" | "selectedIds" | "dragHandleProps" | "slotProps" | "dropTarget" | "draggingIds" | "threshold">;

function slotClass(id: string, dropTarget: DropTarget | null | undefined, draggingIds: readonly string[] | null | undefined) {
  return ["elea-block-slot", dropTarget?.id === id ? `elea-block-slot--drop-${dropTarget.position}` : "", draggingIds?.includes(id) ? "elea-block-slot--dragging" : ""].filter(Boolean).join(" ");
}

/** An optional list handler with its block id filled in. */
function bound<A extends unknown[]>(id: string, handler: ((id: string, ...args: A) => void) | undefined) {
  return handler && ((...args: A) => handler(id, ...args));
}

/** The editor's props for one block: the list's handlers bound to its id. */
function editorProps(id: string, { onBlockFocus, onBlockBlur, onBlockUpdate, onBlockRemove, onAddBlockAfter, onInsertBlocksAfter, onNavigate, onMergeBackward, onMergeForward, onConvert, onReplaceWith, ...shared }: ListHandlers) {
  return {
    ...shared,
    onFocus: () => onBlockFocus(id),
    onBlur: onBlockBlur,
    onUpdate: (data: BlockData) => onBlockUpdate(id, data),
    onRemove: () => onBlockRemove(id),
    onAddBlockAfter: (type: string, initialText?: string) => onAddBlockAfter(id, type, initialText),
    onInsertBlocksAfter: bound(id, onInsertBlocksAfter),
    onNavigate: bound(id, onNavigate),
    onMergeBackward: bound(id, onMergeBackward),
    onMergeForward: bound(id, onMergeForward),
    onConvert: bound(id, onConvert),
    onReplaceWith: bound(id, onReplaceWith),
  };
}

/**
 * Renders every block for short documents; for long ones, only the blocks near the
 * viewport and the focused block, the rest as sized placeholders so scrolling stays
 * stable. A block stays rendered once seen.
 */
export function VirtualizedBlockList({ blocks, focusedBlock, selectedIds, dragHandleProps, slotProps, dropTarget, draggingIds, threshold = 50, ...handlers }: Readonly<VirtualizedBlockListProps>) {
  const virtualize = blocks.length > threshold;
  const { visibleBlocks, registerBlock } = useBlockVisibility(virtualize ? VIEWPORT : null);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <>
      {blocks.map((block) => {
        const isFocused = focusedBlock === block.id;
        const isSelected = selected.has(block.id);
        if (!virtualize || isFocused || visibleBlocks.has(block.id)) {
          return (
            <div key={block.id} ref={virtualize ? element => registerBlock(block.id, element) : undefined} className={slotClass(block.id, dropTarget, draggingIds)} data-elea-block-slot={block.id} {...slotProps?.(block.id)}>
              <BlockEditor block={block} isFocused={isFocused} isSelected={isSelected} dragHandleProps={dragHandleProps?.(block.id)} {...editorProps(block.id, handlers)} />
            </div>
          );
        }
        const height = ESTIMATED_HEIGHT[block.type] ?? 100;
        return (
          <div key={block.id} ref={element => registerBlock(block.id, element)} className="elea-block-slot elea-block-slot--placeholder" data-elea-block-id={block.id} data-elea-block-type={block.type} aria-selected={isSelected || undefined} style={{ minHeight: height }}>
            <div className="elea-block-placeholder" style={{ height }} aria-hidden="true" />
          </div>
        );
      })}
    </>
  );
}
