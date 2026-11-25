import assert from "node:assert/strict";
import { test } from "node:test";
import { RICH_HTML_POLICY, isSafeUrl, isSiteRelativeUrl, resolveLinkUrl, toDomPurifyConfig } from "./policy.js";

test("isSafeUrl accepts http(s) only", () => {
  assert.equal(isSafeUrl("https://example.org"), true);
  assert.equal(isSafeUrl("  HTTP://example.org "), true);
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "vbscript:x", "file:///etc/passwd", "/relative", "", null, undefined, 3]) {
    assert.equal(isSafeUrl(bad), false, String(bad));
  }
});

test("isSiteRelativeUrl knows root paths, fragments and dot paths but not protocol-relative URLs", () => {
  for (const good of ["/member", "#top", "./page", "../page", " /x "]) assert.equal(isSiteRelativeUrl(good), true, good);
  for (const bad of ["//evil.example", "//relative.invalid", "/\\evil.example", "/\\/evil.example", "https://x", "page", ""]) assert.equal(isSiteRelativeUrl(bad), false, bad);
});

test("resolveLinkUrl keeps internal links, adds https to bare hosts and refuses other schemes", () => {
  assert.equal(resolveLinkUrl("/member/resources"), "/member/resources");
  assert.equal(resolveLinkUrl("#section"), "#section");
  assert.equal(resolveLinkUrl("example.org/page"), "https://example.org/page");
  assert.equal(resolveLinkUrl("http://example.org"), "http://example.org");
  assert.equal(resolveLinkUrl("HTTPS://example.org"), "HTTPS://example.org");
  assert.equal(resolveLinkUrl("javascript:alert(1)"), null);
  assert.equal(resolveLinkUrl("mailto:a@b.c"), null);
  assert.equal(resolveLinkUrl("//evil.example"), null);
  assert.equal(resolveLinkUrl("   "), null);
});

test("the DOMPurify configuration mirrors the policy", () => {
  const config = toDomPurifyConfig();
  assert.deepEqual(config.ALLOWED_TAGS, [...RICH_HTML_POLICY.allowedTags]);
  assert.deepEqual(config.ALLOWED_ATTR, [...RICH_HTML_POLICY.allowedAttributes]);
  assert.equal(config.FORCE_BODY, true);
  assert.deepEqual(config.ADD_URI_SAFE_ATTR, ["target", "rel", "class", "alt", "title", "colspan", "rowspan"]);
  assert.equal(config.ALLOWED_URI_REGEXP, RICH_HTML_POLICY.allowedUriPattern);
  const custom = toDomPurifyConfig({ allowedTags: ["p"], allowedAttributes: [], allowedUriPattern: /^https:/ });
  assert.deepEqual(custom.ALLOWED_TAGS, ["p"]);
});

test("the URI pattern allows http(s) and site-relative paths only", () => {
  const pattern = RICH_HTML_POLICY.allowedUriPattern;
  for (const good of ["https://x", "http://x", "/path", "#a", "./a", "../a"]) assert.ok(pattern.test(good), good);
  for (const bad of ["//evil", "javascript:alert(1)", "data:x", "vbscript:x", "mailto:x"]) assert.equal(pattern.test(bad), false, bad);
});
