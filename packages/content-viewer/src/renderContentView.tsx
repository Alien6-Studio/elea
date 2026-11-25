import { annotateHierarchy, parseDocument } from "@alien6-studio/elea-content";
import type { ReactNode } from "react";
import { builtinRenderers, UnknownBlock } from "./blocks/index.js";
import type { BlockRenderer, BlockRendererMap, ContentViewContext } from "./context.js";

/** What a content view takes besides the options its context is built from. */
export interface ContentViewBaseProps {
  /** A document, its JSON string, plain text or HTML; anything `parseDocument` reads. */
  data: unknown;
  /** Renderers by block type, merged over the built-in ones. */
  renderers?: BlockRendererMap;
  className?: string;
  /** `inherit` takes the family, size, leading and colour of the host page instead of Elea's. */
  typography?: "elea" | "inherit";
  /** Indent flat paragraphs that follow an introducer, for content written without lists. */
  legacyHierarchy?: boolean;
  /** Shown instead of the content while it loads. */
  loading?: boolean;
  loadingFallback?: ReactNode;
  /** Shown when the document has no block. */
  emptyFallback?: ReactNode;
}

/** The markup of a block document in a given context, shared by both entry points. */
export function renderContentView({ data, renderers, className, typography, legacyHierarchy = false, loading = false, loadingFallback, emptyFallback }: Readonly<ContentViewBaseProps>, context: ContentViewContext) {
  if (loading) return <>{loadingFallback ?? null}</>;
  // Missing ids are numbered in document order, so server and client render the same markup
  let counter = 0;
  const document = parseDocument(data, { registry: context.registry, generateId: () => {
    counter += 1;
    return `elea-${counter}`;
  } });
  if (document.blocks.length === 0) return <>{emptyFallback ?? null}</>;
  const map = renderers ? { ...builtinRenderers, ...renderers } : builtinRenderers;
  const blocks = legacyHierarchy ? annotateHierarchy(document.blocks) : document.blocks.map((block) => ({ ...block, meta: undefined }));
  return (
    <div className={["elea-content", typography === "inherit" && "elea-content--inherit", className].filter(Boolean).join(" ")}>
      {blocks.map((block) => {
        // Own properties only: "constructor" or "__proto__" as a type must not reach Object.prototype
        const Renderer = Object.hasOwn(map, block.type) ? (map[block.type] as BlockRenderer) : UnknownBlock;
        return (
          <div key={block.id} className={`elea-block elea-block--${block.type}`} data-elea-block-id={block.id} data-elea-block-type={block.type}>
            {block.meta ? <Renderer block={block} context={context} meta={block.meta} /> : <Renderer block={block} context={context} />}
          </div>
        );
      })}
    </div>
  );
}
