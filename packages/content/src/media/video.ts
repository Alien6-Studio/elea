/** Hosts of the supported providers, matched exactly against the parsed hostname. */
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const YOUTU_BE_HOSTS = new Set(["youtu.be"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const DAILYMOTION_HOSTS = new Set(["dailymotion.com", "www.dailymotion.com", "dai.ly"]);
const FILE_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov"]);
const PLAYABLE_EXTENSIONS = new Set(["mp4", "webm", "ogg"]);

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
  return parsed !== null && PLAYABLE_EXTENSIONS.has(extensionOf(parsed));
}

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

/** The embeddable player URL of a video page, or the file URL itself; null when unsupported. */
export function getVideoEmbedUrl(url: string): string | null {
  const parsed = parseHttpUrl(url);
  if (!parsed) return null;
  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (YOUTUBE_HOSTS.has(host)) {
    const id = segments[0] === "watch" ? parsed.searchParams.get("v") : segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live" ? segments[1] : null;
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (YOUTU_BE_HOSTS.has(host)) {
    const id = segments[0];
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (VIMEO_HOSTS.has(host)) {
    const id = segments.find((segment) => /^\d+$/.test(segment));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (DAILYMOTION_HOSTS.has(host)) {
    const index = segments.indexOf("video");
    const id = host === "dai.ly" ? segments[0] : index === -1 ? null : segments[index + 1];
    return id && /^[a-zA-Z0-9]+$/.test(id) ? `https://www.dailymotion.com/embed/video/${id}` : null;
  }
  const extension = extensionOf(parsed);
  if (extension === "mp4" || extension === "webm") return parsed.hostname === "relative.invalid" ? url.trim() : parsed.toString();
  return null;
}
