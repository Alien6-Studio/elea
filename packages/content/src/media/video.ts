/** Hosts of the supported providers, matched exactly against the parsed hostname. */
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const YOUTU_BE_HOSTS = new Set(["youtu.be"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const DAILYMOTION_HOSTS = new Set(["dailymotion.com", "www.dailymotion.com", "dai.ly"]);
const FILE_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov"]);

/** The parsed http(s) URL, or null for anything else; relative paths resolve against a neutral base. */
function parseHttpUrl(url: string): URL | null {
  try {
    const parsed = new URL(url.trim(), "https://relative.invalid/");
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}

function extensionOf(parsed: URL): string {
  const last = parsed.pathname.split("/").pop() ?? "";
  const dot = last.lastIndexOf(".");
  return dot === -1 ? "" : last.slice(dot + 1).toLowerCase();
}

/** True for a URL of a supported provider or a direct video file; the host decides, never the query. */
export function isVideoUrl(url: string): boolean {
  const parsed = parseHttpUrl(url);
  if (!parsed) return false;
  const host = parsed.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.has(host) || YOUTU_BE_HOSTS.has(host) || VIMEO_HOSTS.has(host) || DAILYMOTION_HOSTS.has(host)) return true;
  return FILE_EXTENSIONS.has(extensionOf(parsed));
}

/** True for a direct video file that a `<video>` element plays. */
export function isDirectVideoFile(url: string): boolean {
  const parsed = parseHttpUrl(url);
  return parsed !== null && FILE_EXTENSIONS.has(extensionOf(parsed));
}

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_PATHS = new Set(["shorts", "embed", "live"]);

function youtubeId(parsed: URL, host: string, segments: string[]): string | null | undefined {
  if (YOUTU_BE_HOSTS.has(host)) return segments[0];
  if (segments[0] === "watch") return parsed.searchParams.get("v");
  return YOUTUBE_PATHS.has(segments[0] ?? "") ? segments[1] : null;
}

function dailymotionId(host: string, segments: string[]): string | null | undefined {
  if (host === "dai.ly") return segments[0];
  const index = segments.indexOf("video");
  return index === -1 ? null : segments[index + 1];
}

const embed = (base: string, id: string | null | undefined, pattern: RegExp) => (id && pattern.test(id) ? base + id : null);

/** The embeddable player URL of a video page, or the file URL itself; null when unsupported. */
export function getVideoEmbedUrl(url: string): string | null {
  const parsed = parseHttpUrl(url);
  if (!parsed) return null;
  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (YOUTUBE_HOSTS.has(host) || YOUTU_BE_HOSTS.has(host)) return embed("https://www.youtube.com/embed/", youtubeId(parsed, host, segments), YOUTUBE_ID);
  if (VIMEO_HOSTS.has(host)) return embed("https://player.vimeo.com/video/", segments.find((segment) => /^\d+$/.test(segment)), /./);
  if (DAILYMOTION_HOSTS.has(host)) return embed("https://www.dailymotion.com/embed/video/", dailymotionId(host, segments), /^[a-zA-Z0-9]+$/);
  if (FILE_EXTENSIONS.has(extensionOf(parsed))) return parsed.hostname === "relative.invalid" ? url.trim() : parsed.toString();
  return null;
}
