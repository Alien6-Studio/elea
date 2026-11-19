"use client";

import { generateId, type BlockData, type BlockLike, type BlockRegistry, type EleaBlock } from "@alien6-studio/elea-content";
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
  /** Changes the type of a block, carrying its text over when the new type holds text. */
  convertBlock: (id: string, type: string) => void;
  /** Inserts normalized copies of several blocks after a block (or at the end); returns their ids. */
  insertBlocks: (blocks: readonly BlockLike[], afterId?: string) => string[];
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
    (id: string, type: string) => {
      const next = blocksRef.current.map((block) => {
        if (block.id !== id) return block;
        const data = registry.defaults(type);
        const text = typeof block.data.text === "string" ? block.data.text : "";
        if (text && "text" in data) data.text = text;
        if (text && Array.isArray(data.items)) data.items = [text];
        return { ...block, type, data };
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

  return { addBlock, updateBlock, removeBlock, convertBlock, insertBlocks };
}
