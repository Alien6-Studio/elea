import type { BlockRendererMap } from "../context.js";
import { AttachesBlock, CodeBlock, DelimiterBlock, EmbedBlock, RawBlock, TableBlock, UnknownBlock } from "./legacy.js";
import { AttachmentBlock, ImageBlock, VideoBlock } from "./media.js";
import { HeaderBlock, ListBlock, ParagraphBlock, QuoteBlock } from "./text.js";

export { AttachesBlock, CodeBlock, DelimiterBlock, EmbedBlock, RawBlock, TableBlock, UnknownBlock } from "./legacy.js";
export { AttachmentBlock, ImageBlock, VideoBlock, attachmentHref } from "./media.js";
export { HeaderBlock, ListBlock, ParagraphBlock, QuoteBlock } from "./text.js";

/** Renderers of the seven Elea blocks and of the legacy EditorJS types. */
export const builtinRenderers: BlockRendererMap = {
  paragraph: ParagraphBlock,
  header: HeaderBlock,
  list: ListBlock,
  nestedlist: ListBlock,
  quote: QuoteBlock,
  image: ImageBlock,
  video: VideoBlock,
  attachment: AttachmentBlock,
  delimiter: DelimiterBlock,
  code: CodeBlock,
  raw: RawBlock,
  embed: EmbedBlock,
  attaches: AttachesBlock,
  table: TableBlock,
};
