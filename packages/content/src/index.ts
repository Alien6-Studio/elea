export {
  ELEA_DOCUMENT_VERSION,
  createDocument,
  isDocument,
  isEmptyDocument,
  normalizeDocument,
  parseDocument,
  type BlockData,
  type BlockLike,
  type CreateDocumentOptions,
  type EleaBlock,
  type EleaDocument,
  type NormalizeOptions,
} from "./document.js";
export { generateId } from "./id.js";
export { asRecord, asString, cloneData, defineBlock, type AnyBlockDefinition, type BlockDefinition } from "./blocks/definition.js";
export { asDefinition, createRegistry, type BlockRegistry } from "./blocks/registry.js";
export {
  BUILTIN_BLOCK_TYPES,
  LEGACY_BLOCK_TYPES,
  MAX_LIST_DEPTH,
  attachmentBlock,
  builtinBlocks,
  defaultRegistry,
  headerBlock,
  imageBlock,
  legacyBlocks,
  listBlock,
  nestedListBlock,
  paragraphBlock,
  quoteBlock,
  videoBlock,
  type AttachmentData,
  type BuiltinBlockType,
  type FileRef,
  type HeaderData,
  type HeaderLevel,
  type ImageData,
  type ListData,
  type ListItem,
  type ListStyle,
  type ParagraphData,
  type QuoteData,
  type VideoData,
} from "./blocks/builtin.js";
export { annotateHierarchy, type AnnotatedBlock, type HierarchyMeta } from "./hierarchy.js";
export { documentExcerpt, documentToText, type DocumentTextOptions } from "./text.js";
export { decodeHtmlEntities, excerpt, htmlToText, stripHtmlTags, type HtmlToTextOptions } from "./html/text.js";
export {
  RICH_HTML_POLICY,
  isSafeUrl,
  isSiteRelativeUrl,
  resolveLinkUrl,
  toDomPurifyConfig,
  type RichHtmlPolicy,
} from "./html/policy.js";
export {
  applyLinkTarget,
  isInternalLink,
  linkTargetAttributes,
  type AttributeTarget,
  type LinkPolicyOptions,
  type LinkTargetAttributes,
} from "./html/links.js";
export { createSanitizer, type HtmlPurifier, type HtmlSanitizer, type SanitizerOptions } from "./html/sanitizer.js";
export { getVideoEmbedUrl, isDirectVideoFile, isVideoUrl } from "./media/video.js";
export { fileKind, type FileKind } from "./media/file.js";
export { en, fr, formatMessage, withDefaultMessages, type DeepPartial, type EleaMessages } from "./messages/index.js";
export { blockToMarkdown, documentToMarkdown, inlineHtmlToMarkdown, looksLikeMarkdown, markdownInlineToHtml, markdownToBlocks } from "./markdown.js";
export { documentToHtml, type HtmlSerializerOptions } from "./serialize.js";
