import {
  defaultRegistry,
  en,
  type BlockRegistry,
  type EleaBlock,
  type EleaMessages,
  type FileRef,
  type HtmlSanitizer,
} from "@alien6-studio/elea-content";
import type { ComponentType } from "react";
import { defaultSanitizer } from "./sanitizer.js";

/** Turns a stored file reference into a URL the browser can load; defaults to the stored URL. */
export type AssetUrlResolver = (file: FileRef) => string;

export interface BlockRendererProps {
  block: EleaBlock;
  context: ContentViewContext;
  /** Presentation hints of legacy flat content; absent unless `legacyHierarchy` is on. */
  meta?: { indentLevel: number; isSubItem: boolean; isListIntroducer: boolean };
}

export type BlockRenderer = ComponentType<BlockRendererProps>;
export type BlockRendererMap = Readonly<Record<string, BlockRenderer>>;

/** Everything a block renderer may need, passed explicitly so the viewer stays hook-free. */
export interface ContentViewContext {
  registry: BlockRegistry;
  sanitizer: HtmlSanitizer;
  resolveAssetUrl: AssetUrlResolver;
  messages: EleaMessages;
}

export interface ContentViewOptions {
  registry?: BlockRegistry;
  sanitizer?: HtmlSanitizer;
  resolveAssetUrl?: AssetUrlResolver;
  messages?: EleaMessages;
}

export const defaultAssetUrlResolver: AssetUrlResolver = (file) => file.url || file.id;

export function createContentViewContext(options: ContentViewOptions = {}): ContentViewContext {
  return {
    registry: options.registry ?? defaultRegistry,
    sanitizer: options.sanitizer ?? defaultSanitizer,
    resolveAssetUrl: options.resolveAssetUrl ?? defaultAssetUrlResolver,
    messages: options.messages ?? en,
  };
}
