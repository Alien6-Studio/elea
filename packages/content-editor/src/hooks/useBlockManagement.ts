"use client";

import { generateId, htmlToText, type BlockData, type BlockLike, type BlockRegistry, type EleaBlock } from "@alien6-studio/elea-content";
import { useCallback, useEffect, useRef } from "react";

export interface UseBlockManagementOptions {
  blocks: EleaBlock[];
  onBlocksChange: (blocks: EleaBlock[]) => void;
  registry: BlockRegistry;
}

export interface BlockManagement {
  /** Inserts a block of a type at the end, or after a block; returns its id. */
  addBlock: (type: string, afterId?: string, initialText?: string) => string;
  updateBlock: (id: string, data: BlockData) => void;
  /** Removes a block, except the last remaining one. */
  removeBlock: (id: string) => void;
  /** Changes the type of a block, carrying its text over when the new type holds text; `data` overrides the defaults. */
  convertBlock: (id: string, type: string, data?: Partial<BlockData>) => void;
  /** Inserts normalized copies of several blocks after a block (or at the end); returns their ids. */
  insertBlocks: (blocks: readonly BlockLike[], afterId?: string) => string[];
  /** Moves blocks, keeping their order, before or after a target block; returns false when nothing moves. */
  moveBlocks: (ids: readonly string[], targetId: string, position: "before" | "after") => boolean;
  /** Moves blocks one step up or down, keeping their order; returns false at the edge. */
  shiftBlocks: (ids: readonly string[], direction: -1 | 1) => boolean;
}

/** The text of a block as pieces: list items, or the paragraphs and lines of rich text. */
function textPieces(data: BlockData): string[] {
  if (Array.isArray(data.items)) {
    return data.items.map((item) => (typeof item === "string" ? item : typeof item === "object" && item !== null && "content" in item ? String((item as { content: unknown }).content ?? "") : "")).filter((item) => item.trim() !== "");
  }
  if (typeof data.text !== "string" || data.text.trim() === "") return [];
  return data.text
    .split(/<\/p>|<br\s*\/?>/i)
    .map((piece) => piece.replace(/^\s*<p[^>]*>/i, "").trim())
    .filter((piece) => htmlToText(piece).trim() !== "");
}

/**
 * Block operations over a controlled list. A ref tracks the latest blocks so that
 * successive operations in one tick compose instead of overwriting each other.
 */
export function useBlockManagement({ blocks, onBlocksChange, registry }: UseBlockManagementOptions): BlockManagement {
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const addBlock = useCallback(
    (type: string, afterId?: string, initialText?: string): string => {
      const data = registry.defaults(type);
      if (initialText !== undefined && "text" in data) data.text = initialText;
      const block: EleaBlock = { id: generateId(), type, data };
      const current = blocksRef.current;
      const index = afterId ? current.findIndex((candidate) => candidate.id === afterId) : -1;
      const next = index === -1 ? [...current, block] : [...current.slice(0, index + 1), block, ...current.slice(index + 1)];
      blocksRef.current = next;
      onBlocksChange(next);
      return block.id;
    },
    [onBlocksChange, registry],
  );

  const updateBlock = useCallback(
    (id: string, data: BlockData) => {
      const next = blocksRef.current.map((block) => (block.id === id ? { ...block, data } : block));
      blocksRef.current = next;
      onBlocksChange(next);
    },
    [onBlocksChange],
  );

  const removeBlock = useCallback(
    (id: string) => {
      const current = blocksRef.current;
      if (current.length <= 1) return;
      const next = current.filter((block) => block.id !== id);
      blocksRef.current = next;
      onBlocksChange(next);
    },
    [onBlocksChange],
  );

  const convertBlock = useCallback(
    (id: string, type: string, overrides?: Partial<BlockData>) => {
      const next = blocksRef.current.map((block) => {
        if (block.id !== id) return block;
        const data = registry.defaults(type);
        const pieces = textPieces(block.data);
        if (pieces.length > 0) {
          if (Array.isArray(data.items)) data.items = pieces.map((piece) => htmlToText(piece));
          else if (type === "paragraph") data.text = pieces.map((piece) => `<p>${piece}</p>`).join("");
          else if ("text" in data) data.text = htmlToText(pieces.join(" "));
        }
        return { ...block, type, data: registry.normalizeData(type, { ...data, ...overrides }) };
      });
      blocksRef.current = next;
      onBlocksChange(next);
    },
    [onBlocksChange, registry],
  );

  const insertBlocks = useCallback(
    (incoming: readonly BlockLike[], afterId?: string): string[] => {
      const created: EleaBlock[] = incoming.map((block) => ({
        id: generateId(),
        type: block.type,
        data: registry.normalizeData(block.type, typeof block.data === "object" && block.data !== null ? (block.data as BlockData) : {}),
      }));
      if (created.length === 0) return [];
      const current = blocksRef.current;
      const index = afterId ? current.findIndex((candidate) => candidate.id === afterId) : -1;
      const next = index === -1 ? [...current, ...created] : [...current.slice(0, index + 1), ...created, ...current.slice(index + 1)];
      blocksRef.current = next;
      onBlocksChange(next);
      return created.map((block) => block.id);
    },
    [onBlocksChange, registry],
  );

  const moveBlocks = useCallback(
    (ids: readonly string[], targetId: string, position: "before" | "after"): boolean => {
      const current = blocksRef.current;
      const moving = current.filter((block) => ids.includes(block.id));
      if (moving.length === 0 || ids.includes(targetId)) return false;
      const remaining = current.filter((block) => !ids.includes(block.id));
      const index = remaining.findIndex((block) => block.id === targetId);
      if (index === -1) return false;
      const at = position === "before" ? index : index + 1;
      const next = [...remaining.slice(0, at), ...moving, ...remaining.slice(at)];
      if (next.every((block, position) => block === current[position])) return false;
      blocksRef.current = next;
      onBlocksChange(next);
      return true;
    },
    [onBlocksChange],
  );

  const shiftBlocks = useCallback(
    (ids: readonly string[], direction: -1 | 1): boolean => {
      const current = blocksRef.current;
      const indexes = current.map((block, index) => (ids.includes(block.id) ? index : -1)).filter((index) => index !== -1);
      if (indexes.length === 0) return false;
      const edge = direction === -1 ? (indexes[0] as number) - 1 : (indexes.at(-1) as number) + 1;
      const target = current[edge];
      if (!target) return false;
      return moveBlocks(ids, target.id, direction === -1 ? "before" : "after");
    },
    [moveBlocks],
  );

  return { addBlock, updateBlock, removeBlock, convertBlock, insertBlocks, moveBlocks, shiftBlocks };
}
