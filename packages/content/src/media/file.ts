export type FileKind = "pdf" | "document" | "spreadsheet" | "presentation" | "archive" | "image" | "video" | "audio" | "file";

/** Broad kind of a file from its MIME type, extension or file name, for icons and filters. */
export function fileKind(typeOrName: string | null | undefined): FileKind {
  if (!typeOrName) return "file";
  const value = typeOrName.trim().toLowerCase();
  const extension = value.includes("/") ? "" : (value.split(".").pop() ?? value);
  const has = (...needles: string[]) => needles.some((needle) => value.includes(needle) || extension === needle);
  if (has("pdf")) return "pdf";
  if (has("spreadsheet", "excel", "xlsx", "xls", "csv", "ods")) return "spreadsheet";
  if (has("presentation", "powerpoint", "pptx", "ppt", "odp")) return "presentation";
  if (has("msword", "wordprocessing", "word", "docx", "doc", "odt", "rtf", "text/plain", "txt")) return "document";
  if (has("zip", "rar", "7z", "tar", "gzip", "gz", "archive")) return "archive";
  if (has("image", "jpg", "jpeg", "png", "gif", "svg", "webp")) return "image";
  if (has("video", "mp4", "webm", "avi", "mov", "mkv")) return "video";
  if (has("audio", "mp3", "wav", "ogg", "flac")) return "audio";
  return "file";
}
