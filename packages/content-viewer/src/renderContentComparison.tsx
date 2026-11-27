import { compareBlocks, parseDocument } from "@alien6-studio/elea-content";
import type { ReactNode } from "react";
import { builtinRenderers, UnknownBlock } from "./blocks/index.js";
import type { BlockRenderer, BlockRendererMap, ContentViewContext } from "./context.js";

/** What a comparison takes besides the options its context is built from. */
export interface ContentComparisonBaseProps {
  /** The earlier version: anything `parseDocument` reads. */
  before: unknown;
  /** The later version. */
  after: unknown;
  /** Renderers by block type, merged over the built-in ones. */
  renderers?: BlockRendererMap;
  className?: string;
  /** `inherit` takes the family, size, leading and colour of the host page instead of Elea's. */
  typography?: "elea" | "inherit";
  /** Shown when neither version has a block. */
  emptyFallback?: ReactNode;
}

const WRAPPERS = { same: "div", changed: "div", added: "ins", removed: "del" } as const;

/** The markup of two versions of a document in a given context, shared by both entry points. */
export function renderContentComparison({ before, after, renderers, className, typography, emptyFallback }: Readonly<ContentComparisonBaseProps>, context: ContentViewContext) {
  const read = (data: unknown, side: string) => {
    let counter = 0;
    return parseDocument(data, { registry: context.registry, generateId: () => {
      counter += 1;
      return `elea-${side}-${counter}`;
    } }).blocks;
  };
  const changes = compareBlocks(read(before, "before"), read(after, "after"), { registry: context.registry });
  if (changes.length === 0) return <>{emptyFallback ?? null}</>;
  const map = renderers ? { ...builtinRenderers, ...renderers } : builtinRenderers;
  return (
    <div className={["elea-content", "elea-comparison", typography === "inherit" && "elea-content--inherit", className].filter(Boolean).join(" ")}>
      {changes.map(({ change, block }) => {
        const Renderer = Object.hasOwn(map, block.type) ? (map[block.type] as BlockRenderer) : UnknownBlock;
        // A block that came or went is an insertion or a deletion as a whole
        const Wrapper = WRAPPERS[change];
        return (
          <Wrapper key={`${change === "removed" ? "before" : "after"}:${block.id}`} className={`elea-block elea-block--${block.type}`} data-elea-block-id={block.id} data-elea-block-type={block.type} data-elea-change={change}>
            <Renderer block={block} context={context} />
          </Wrapper>
        );
      })}
    </div>
  );
}
