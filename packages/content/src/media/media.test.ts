import assert from "node:assert/strict";
import { test } from "node:test";
import { fileKind } from "./file.js";
import { getVideoEmbedUrl, isDirectVideoFile, isVideoUrl } from "./video.js";

test("isVideoUrl recognizes providers and direct files", () => {
  for (const url of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://vimeo.com/123", "https://www.dailymotion.com/video/x7abc", "https://cdn.example/clip.MP4", "https://cdn.example/clip.mov"]) {
    assert.equal(isVideoUrl(url), true, url);
  }
  assert.equal(isVideoUrl("https://example.org/page"), false);
  assert.equal(isDirectVideoFile("https://cdn.example/clip.webm"), true);
  assert.equal(isDirectVideoFile("https://cdn.example/clip.mov"), false);
});

test("getVideoEmbedUrl builds player URLs", () => {
  assert.equal(getVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getVideoEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getVideoEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getVideoEmbedUrl("https://www.youtube.com/channel/abc"), null);
  assert.equal(getVideoEmbedUrl("https://vimeo.com/123456"), "https://player.vimeo.com/video/123456");
  assert.equal(getVideoEmbedUrl("https://vimeo.com/video/123456"), "https://player.vimeo.com/video/123456");
  assert.equal(getVideoEmbedUrl("https://vimeo.com/about"), null);
  assert.equal(getVideoEmbedUrl("https://www.dailymotion.com/video/x7abc"), "https://www.dailymotion.com/embed/video/x7abc");
  assert.equal(getVideoEmbedUrl("https://www.dailymotion.com/fr"), null);
  assert.equal(getVideoEmbedUrl(" https://cdn.example/clip.mp4 "), "https://cdn.example/clip.mp4");
  assert.equal(getVideoEmbedUrl("https://cdn.example/clip.webm"), "https://cdn.example/clip.webm");
  assert.equal(getVideoEmbedUrl("https://example.org/page"), null);
});

test("fileKind classifies MIME types, extensions and file names", () => {
  assert.equal(fileKind("application/pdf"), "pdf");
  assert.equal(fileKind("report.PDF"), "pdf");
  assert.equal(fileKind("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), "spreadsheet");
  assert.equal(fileKind("xls"), "spreadsheet");
  assert.equal(fileKind("deck.pptx"), "presentation");
  assert.equal(fileKind("application/msword"), "document");
  assert.equal(fileKind("notes.docx"), "document");
  assert.equal(fileKind("text/plain"), "document");
  assert.equal(fileKind("archive.zip"), "archive");
  assert.equal(fileKind("application/gzip"), "archive");
  assert.equal(fileKind("image/jpeg"), "image");
  assert.equal(fileKind("photo.webp"), "image");
  assert.equal(fileKind("video/mp4"), "video");
  assert.equal(fileKind("clip.mkv"), "video");
  assert.equal(fileKind("audio/mpeg"), "audio");
  assert.equal(fileKind("song.flac"), "audio");
  assert.equal(fileKind("application/octet-stream"), "file");
  assert.equal(fileKind("mystery"), "file");
  assert.equal(fileKind(""), "file");
  assert.equal(fileKind(null), "file");
  assert.equal(fileKind(undefined), "file");
});

test("video URLs are judged by host and path, never by a host hidden in the query or the text", () => {
  assert.equal(isVideoUrl("https://example.org/page?next=https://youtube.com/watch?v=dQw4w9WgXcQ"), false);
  assert.equal(isVideoUrl("https://notyoutube.example/watch?v=dQw4w9WgXcQ"), false);
  assert.equal(isVideoUrl("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"), false);
  assert.equal(isVideoUrl("https://cdn.example/clip.mp4?token=abc"), true);
  assert.equal(isVideoUrl("https://cdn.example/clip.mp4.txt"), false);
  assert.equal(isVideoUrl("https://cdn.example/path.mp4/index.html"), false);
  assert.equal(isVideoUrl("javascript:alert('x.mp4')"), false);
  assert.equal(isVideoUrl("/videos/local.webm"), true);
  assert.equal(getVideoEmbedUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ&list=PL"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getVideoEmbedUrl("https://www.youtube.com/live/dQw4w9WgXcQ"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(getVideoEmbedUrl("https://www.youtube.com/watch?v=too-short"), null);
  assert.equal(getVideoEmbedUrl("https://example.org/?u=https://vimeo.com/123"), null);
  assert.equal(getVideoEmbedUrl("https://dai.ly/x7abc"), "https://www.dailymotion.com/embed/video/x7abc");
  assert.equal(getVideoEmbedUrl("https://cdn.example/clip.mp4?token=abc"), "https://cdn.example/clip.mp4?token=abc");
  assert.equal(getVideoEmbedUrl("/videos/local.webm"), "/videos/local.webm");
  assert.equal(getVideoEmbedUrl("https://cdn.example/clip.mov"), null);
  assert.equal(getVideoEmbedUrl("not a url"), null);
  assert.equal(isDirectVideoFile("/videos/local.ogg?x=1"), true);
});
