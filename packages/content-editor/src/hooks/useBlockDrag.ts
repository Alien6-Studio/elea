"use client";

import { useCallback, useState, type DragEvent, type HTMLAttributes } from "react";

export type DropPosition = "before" | "after";

export interface DropTarget {
  id: string;
  position: DropPosition;
}

export interface BlockDrag {
  /** Ids being dragged, or null. */
  dragging: readonly string[] | null;
  dropTarget: DropTarget | null;
  /** Props of the grip that starts a drag of the block, or of the whole selection it belongs to. */
  handleProps: (id: string) => HTMLAttributes<HTMLElement>;
  /** Props of the slot that wraps a block: it tracks the drop position and receives the drop. */
  slotProps: (id: string) => HTMLAttributes<HTMLElement>;
}

export interface UseBlockDragOptions {
  /** Moves the given blocks next to a target block. */
  onMove: (ids: readonly string[], target: DropTarget) => void;
  /** The current multi-block selection: dragging one of its blocks drags them all. */
  selectedIds?: readonly string[] | undefined;
}

const MIME = "application/x-elea-block-ids";

/** The target half of a slot the pointer is over: above its middle inserts before, below inserts after. */
export function dropPositionFor(clientY: number, rect: Pick<DOMRect, "top" | "height">): DropPosition {
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

/** HTML drag and drop of blocks, with a grip as the drag source and the block slots as drop zones. */
export function useBlockDrag({ onMove, selectedIds }: UseBlockDragOptions): BlockDrag {
  const [dragging, setDragging] = useState<readonly string[] | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const finish = useCallback(() => {
    setDragging(null);
    setDropTarget(null);
  }, []);

  const handleProps = useCallback(
    (id: string): HTMLAttributes<HTMLElement> => ({
      draggable: true,
      onDragStart: (event: DragEvent) => {
        const ids = selectedIds?.includes(id) ? selectedIds : [id];
        event.dataTransfer?.setData(MIME, ids.join(","));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        setDragging(ids);
      },
      onDragEnd: finish,
    }),
    [selectedIds, finish],
  );

  const slotProps = useCallback(
    (id: string): HTMLAttributes<HTMLElement> => ({
      onDragOver: (event: DragEvent) => {
        if (!dragging) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        if (dragging.includes(id)) {
          setDropTarget(null);
          return;
        }
        const position = dropPositionFor(event.clientY, event.currentTarget.getBoundingClientRect());
        setDropTarget((current) => (current?.id === id && current.position === position ? current : { id, position }));
      },
      onDragLeave: (event: DragEvent) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setDropTarget((current) => (current?.id === id ? null : current));
      },
      onDrop: (event: DragEvent) => {
        if (!dragging) return;
        event.preventDefault();
        if (!dragging.includes(id)) onMove(dragging, { id, position: dropPositionFor(event.clientY, event.currentTarget.getBoundingClientRect()) });
        finish();
      },
    }),
    [dragging, onMove, finish],
  );

  return { dragging, dropTarget, handleProps, slotProps };
}
