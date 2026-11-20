import { asRecord, blockToMarkdown, cloneData, generateId, markdownToBlocks, type BlockLike, type BlockRegistry, type EleaBlock, type ImageData, type ListData, type ListItem } from "@alien6-studio/elea-content";

function signature({ type, data }: BlockLike): string {
  return JSON.stringify([type, data]);
}

function hasStyledSublist(items: readonly ListItem[]): boolean {
  return items.some((item) => typeof item !== "string" && (item.childrenMarker || hasStyledSublist(item.items ?? [])));
}

/** Project a document into editable Markdown, with references for blocks that have no equivalent. */
export function createMarkdownSource(blocks: readonly EleaBlock[]) {
  const projected = blocks.map((block) => {
    const list = block.type === "list" ? block.data as ListData : undefined;
    const customMarkers = list && (list.marker || (Array.isArray(list.items) && hasStyledSublist(list.items)));
    const text = customMarkers ? null : blockToMarkdown(block);
    if (text) {
      const parsed = markdownToBlocks(text);
      const first = parsed[0];
      if (parsed.length === 1 && first?.type === block.type) return { block, text, key: signature(first) };
    } else if (block.type === "paragraph") {
      return { block, text: "" };
    }
    const reference = `elea:block ${JSON.stringify([block.type, block.id]).replaceAll(">", "\\u003e")}`;
    return { block, text: `<!-- ${reference} -->`, reference };
  });
  return {
    blocks: projected,
    text: projected.map(({ text }) => text).filter(Boolean).join("\n\n"),
    hasReferences: projected.some(({ reference }) => reference !== undefined),
  };
}

/** Reuse exact matches before applying edits so unchanged blocks keep their original ids and data. */
export function readMarkdownSource(text: string, source: ReturnType<typeof createMarkdownSource>, registry: BlockRegistry): EleaBlock[] {
  const originals = new Map<string, EleaBlock[]>();
  const references = new Map<string, EleaBlock>();
  for (const { block, key, reference } of [...source.blocks].reverse()) {
    if (reference) references.set(reference, block);
    if (key) {
      const matches = originals.get(key) ?? [];
      matches.push(block);
      originals.set(key, matches);
    }
  }

  const used = new Set<string>();
  const parsed = markdownToBlocks(text, { resolveComment: (reference) => references.get(reference) });
  const matches = parsed.map((part) => {
    const original = typeof part.id === "string" ? part as EleaBlock : originals.get(signature(part))?.pop();
    if (!original) return undefined;
    if (used.has(original.id)) return { ...original, id: generateId(), data: cloneData(original.data) };
    used.add(original.id);
    return original;
  });

  return parsed.map((part, index) => {
    const match = matches[index];
    if (match) return match;
    const candidate = source.blocks[index];
    const previous = candidate && !candidate.reference && candidate.block.type === part.type && !used.has(candidate.block.id) ? candidate.block : undefined;
    const data = registry.normalizeData(part.type, asRecord(part.data));
    if (part.type === "image" && previous) {
      const file = (previous.data as ImageData).file;
      if (file && file.url === (data as ImageData).file?.url) data.file = file;
    }
    return { id: previous?.id ?? generateId(), type: part.type, data: { ...previous?.data, ...data } };
  });
}
