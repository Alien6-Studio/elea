import { isSafeUrl, isSiteRelativeUrl } from "@alien6-studio/elea-content";

/** A URL safe to navigate to: http(s) or a site-relative path; anything else is dropped. */
export function safeLocation(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return isSafeUrl(trimmed) || isSiteRelativeUrl(trimmed) ? trimmed : null;
}

/** A URL safe as an image source: a navigable location, or an inline `data:image/` payload. */
export function safeImageSource(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^data:image\/(png|jpeg|gif|webp|avif|svg\+xml);base64,/i.test(trimmed)) return trimmed;
  return safeLocation(trimmed);
}
