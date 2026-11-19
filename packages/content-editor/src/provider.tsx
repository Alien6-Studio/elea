"use client";

import type { BlockRegistry, EleaMessages, FileRef, HtmlSanitizer } from "@alien6-studio/elea-content";
import { createContentViewContext, type AssetUrlResolver, type ContentViewOptions } from "@alien6-studio/elea-content-viewer";
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

export interface ContentEditorServices {
  /** Framing before upload, on by default with a free ratio. */
  imageCrop?: ImageCropOptions | false;
  /** Stores an image and returns where it lives; absent means the image block cannot upload. */
  uploadImage?: (file: File, context: EditorContextInfo) => Promise<UploadedImage>;
  /** Renders the host's own picker inside the attachment block; absent means attachments cannot be chosen. */
  renderAttachmentPicker?: (props: AttachmentPickerProps) => ReactNode;
  /** Hosts of the site itself, so links to them open in the same tab. */
  siteHostnames?: readonly string[];
}

export interface ContentContextValue extends ContentEditorServices {
  registry: BlockRegistry;
  sanitizer: HtmlSanitizer;
  resolveAssetUrl: AssetUrlResolver;
  messages: EleaMessages;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export interface ContentProviderProps extends ContentViewOptions, ContentEditorServices {
  children: ReactNode;
}

/** Supplies the registry, sanitizer, asset resolution, messages and host services to every Elea component below. */
export function ContentProvider({ children, uploadImage, renderAttachmentPicker, siteHostnames, imageCrop, ...viewer }: ContentProviderProps) {
  const value = useMemo<ContentContextValue>(() => {
    const context: ContentContextValue = { ...createContentViewContext(viewer) };
    if (uploadImage) context.uploadImage = uploadImage;
    if (renderAttachmentPicker) context.renderAttachmentPicker = renderAttachmentPicker;
    if (siteHostnames) context.siteHostnames = siteHostnames;
    if (imageCrop !== undefined) context.imageCrop = imageCrop;
    return context;
    // Each option is a stable reference in practice; the host memoizes callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer.registry, viewer.sanitizer, viewer.resolveAssetUrl, viewer.messages, uploadImage, renderAttachmentPicker, siteHostnames, imageCrop]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

const fallback: ContentContextValue = createContentViewContext();

/** The nearest provider's value, or the defaults when there is none. */
export function useContentServices(): ContentContextValue {
  return useContext(ContentContext) ?? fallback;
}
