"use client";

import type { FileRef, LinkPolicyOptions } from "@alien6-studio/elea-content";
import { createContentViewContext, type BlockRendererMap, type ContentViewContext, type ContentViewOptions } from "@alien6-studio/elea-content-viewer";
import { createContext, useContext, useMemo, type ReactNode } from "react";

/** Free-form information the host passes along to its own services (an owner id, an upload kind...). */
export type EditorContextInfo = Readonly<Record<string, string | undefined>>;

export interface UploadedImage {
  url: string;
  id: string;
}

/** What an attachment picker hands back; the editor stores it as an attachment block. */
export interface PickedAttachment {
  id: string;
  title: string;
  type?: string;
  description?: string;
  url?: string;
  file?: FileRef;
}

export interface AttachmentPickerProps {
  onSelect: (attachment: PickedAttachment) => void;
  context: EditorContextInfo;
}

/** How pictures are framed before upload; `false` sends the file as picked. */
export interface ImageCropOptions {
  /** Width over height; the picture's own ratio when absent. */
  aspect?: number | undefined;
  shape?: "rect" | "round" | undefined;
  /** Output scaled down to this width when wider. */
  maxWidth?: number | undefined;
  type?: string | undefined;
  quality?: number | undefined;
}

/** What an upload is doing right now, in the host's words. */
export interface ImageUploadStatus {
  /** Shown in place of the default label and announced whenever it changes, so keep one per phase. */
  label: string;
  /** Share of the work done, between 0 and 1; shows a progress bar when given. */
  progress?: number | undefined;
}

export interface ImageUploadOptions {
  /** Tells the block what is happening; the last status stays until the upload settles. */
  report: (status: ImageUploadStatus) => void;
  /** Aborted when the block is removed or its picture replaced before the upload settles. */
  signal: AbortSignal;
}

export interface ContentEditorServices extends LinkPolicyOptions {
  /** Framing before upload, on by default with a free ratio. */
  imageCrop?: ImageCropOptions | false;
  /**
   * Stores an image and returns where it lives; absent means the image block cannot upload.
   * Rejecting with an `Error` shows its message beside the block.
   */
  uploadImage?: (file: File, context: EditorContextInfo, options: ImageUploadOptions) => Promise<UploadedImage>;
  /**
   * Lets an SVG file go up as picked. It can carry scripts that run where it is served as a page,
   * so it is refused unless the cropper turned it into a raster picture; set this when the upload service serves it safely.
   */
  allowSvgUpload?: boolean | undefined;
  /** The renderers given to `ContentView` where the content is published, so the preview shows the same blocks. */
  renderers?: BlockRendererMap | undefined;
  /** Renders the host's own picker inside the attachment block; absent means attachments cannot be chosen. */
  renderAttachmentPicker?: (props: AttachmentPickerProps) => ReactNode;
}

export interface ContentContextValue extends ContentEditorServices, ContentViewContext {}

const ContentContext = createContext<ContentContextValue | null>(null);

export interface ContentProviderProps extends ContentViewOptions, ContentEditorServices {
  children: ReactNode;
}

/** Supplies the registry, sanitizer, asset resolution, messages and host services to every Elea component below. */
export function ContentProvider({ children, ...options }: Readonly<ContentProviderProps>) {
  const value = useMemo<ContentContextValue>(
    () => ({ ...options, ...createContentViewContext(options) }),
    [options.registry, options.sanitizer, options.resolveAssetUrl, options.renderAttachmentIcon, options.onAttachmentClick, options.messages, options.siteHostnames, options.uploadImage, options.renderAttachmentPicker, options.imageCrop, options.allowSvgUpload, options.renderers],
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

const fallback: ContentContextValue = createContentViewContext();

/** The nearest provider's value, or the defaults when there is none. */
export function useContentServices(): ContentContextValue {
  return useContext(ContentContext) ?? fallback;
}
