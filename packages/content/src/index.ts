export {
  ELEA_DOCUMENT_VERSION,
  createDocument,
  isDocument,
  isEmptyDocument,
  normalizeDocument,
  parseDocument,
  prepareEditorBlocks,
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
  asListMarker,
  asListStyle,
  builtinBlocks,
  defaultRegistry,
  headerBlock,
  imageBlock,
  legacyBlocks,
  isListItemChecked,
  listBlock,
  listStyleForMarker,
  nestedListBlock,
  nestedListStyle,
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
  type ListMarker,
  type ListStyle,
  type ParagraphData,
  type QuoteData,
  type VideoData,
} from "./blocks/builtin.js";
export { annotateHierarchy, type AnnotatedBlock, type HierarchyMeta } from "./hierarchy.js";
export { compareBlocks, compareHtml, type BlockChange, type BlockChangeKind, type CompareBlocksOptions } from "./compare.js";
export { documentExcerpt, documentToText, type DocumentTextOptions } from "./text.js";
export { decodeHtmlEntities, excerpt, htmlToText, stripHtmlTags, type HtmlToTextOptions } from "./html/text.js";
export {
  RICH_HTML_POLICY,
  isInlineImageUrl,
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
export { looksLikeMarkdown, markdownInlineToHtml, markdownToBlocks, type MarkdownParseOptions } from "./markdown.js";
export { blockToMarkdown, documentToMarkdown, inlineHtmlToMarkdown, type MarkdownExportOptions } from "./markdownExport.js";
export { documentToHtml, type HtmlSerializerOptions } from "./serialize.js";
export { blocksToHtml, htmlToBlocks, type HtmlImportOptions, type HtmlExportOptions } from "./html/conversion.js";
