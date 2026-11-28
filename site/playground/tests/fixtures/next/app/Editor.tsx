"use client";

import { useState } from "react";
import { en, type EleaBlock } from "@alien6-studio/elea-content";
import { ContentEditor, ContentProvider } from "@alien6-studio/elea-content-editor";

export function Editor({ initialBlocks }: { initialBlocks: EleaBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  return (
    <ContentProvider messages={en}>
      <ContentEditor blocks={blocks} onBlocksChange={setBlocks} />
    </ContentProvider>
  );
}
