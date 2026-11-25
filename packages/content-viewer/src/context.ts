import {
  type BlockRegistry,
  type EleaBlock,
  type EleaMessages,
  type FileKind,
  type FileRef,
  type HtmlSanitizer,
  type LinkPolicyOptions,
} from "@alien6-studio/elea-content";
import type { ComponentType, ReactNode } from "react";
import { createCoreContext } from "./coreContext.js";
import { createDefaultSanitizer, defaultSanitizer } from "./sanitizer.js";

/** Turns a stored file reference into a URL the browser can load; defaults to the stored URL. */
export type AssetUrlResolver = (file: FileRef) => string;

export interface AttachmentIconProps {
  /** The stored attachment type or EditorJS file extension. */
  type: string;
  kind: FileKind;
  blockType: "attachment" | "attaches";
}

export type AttachmentIconRenderer = (props: AttachmentIconProps) => ReactNode;

/** The destination activated by a reader and the identity stored with the attachment. */
export type AttachmentClickInfo =
  | { blockType: "attachment"; href: string; resourceId: string }
  | { blockType: "attaches"; href: string; fileName?: string | undefined };

type AttachmentClickHandler = (info: AttachmentClickInfo) => void;

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
  renderAttachmentIcon?: AttachmentIconRenderer | undefined;
  onAttachmentClick?: AttachmentClickHandler | undefined;
  messages: EleaMessages;
}

export interface ContentViewOptions extends LinkPolicyOptions {
  registry?: BlockRegistry;
  sanitizer?: HtmlSanitizer;
  resolveAssetUrl?: AssetUrlResolver;
  renderAttachmentIcon?: AttachmentIconRenderer | undefined;
  onAttachmentClick?: AttachmentClickHandler | undefined;
  messages?: EleaMessages;
}

export function createContentViewContext(options: ContentViewOptions = {}): ContentViewContext {
  const { siteHostnames, ...rest } = options;
  const sanitizer = options.sanitizer ?? (siteHostnames?.length
    ? createDefaultSanitizer({ links: { siteHostnames } })
    : defaultSanitizer);
  return createCoreContext({ ...rest, sanitizer });
}
