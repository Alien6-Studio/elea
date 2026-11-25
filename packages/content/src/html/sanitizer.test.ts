import assert from "node:assert/strict";
import { test } from "node:test";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { createSanitizer, type HtmlPurifier } from "./sanitizer.js";

const purify = createDOMPurify(new JSDOM("").window) as unknown as HtmlPurifier;
const sanitizer = createSanitizer(purify, { links: { siteHostnames: ["members.example.org"] } });
const clean = (html: string) => sanitizer.sanitize(html);

test("legitimate formatting is preserved", () => {
  assert.equal(clean("<p>Bold <strong>text</strong> and <em>italic</em> and <u>under</u></p>"), "<p>Bold <strong>text</strong> and <em>italic</em> and <u>under</u></p>");
  assert.equal(clean("<ul><li>a</li><li>b</li></ul>"), "<ul><li>a</li><li>b</li></ul>");
  assert.equal(clean("<ol><li>1</li></ol>"), "<ol><li>1</li></ol>");
  assert.equal(clean("<h2>Title</h2><blockquote>Quote</blockquote>"), "<h2>Title</h2><blockquote>Quote</blockquote>");
  assert.equal(clean('<table><tbody><tr><td colspan="2">c</td></tr></tbody></table>'), '<table><tbody><tr><td colspan="2">c</td></tr></tbody></table>');
  assert.equal(clean(""), "");
});

test("external links open in a new tab with opener protection, internal links stay in the tab", () => {
  assert.equal(clean('<a href="https://www.example.org">x</a>'), '<a href="https://www.example.org" target="_blank" rel="noopener noreferrer">x</a>');
  assert.equal(clean('<a href="/member/resources" target="_blank" rel="noopener noreferrer">x</a>'), '<a href="/member/resources">x</a>');
  assert.equal(clean('<a href="https://members.example.org/feed" target="_blank">x</a>'), '<a href="https://members.example.org/feed">x</a>');
  assert.equal(clean('<a href="#top">x</a>'), '<a href="#top">x</a>');
  assert.equal(clean('<a href="//evil.example/path">x</a>'), "<a>x</a>");
});

test("XSS vectors are removed", () => {
  assert.equal(clean('<p>safe</p><script>alert("xss")</script>'), "<p>safe</p>");
  assert.equal(clean('<a href="javascript:alert(1)">x</a>'), "<a>x</a>");
  assert.equal(clean('<a href="data:text/html,<script>alert(1)</script>">x</a>'), "<a>x</a>");
  assert.equal(clean('<a href="vbscript:msgbox(1)">x</a>'), "<a>x</a>");
  assert.equal(clean('<p onclick="alert(1)">x</p>'), "<p>x</p>");
  assert.equal(clean('<img src="/x.png" onerror="alert(1)">'), '<img src="/x.png">');
  assert.equal(clean('<p>a <img src="x" onerror="alert(1)" alt="b"> c</p>'), "<p>a  c</p>");
  assert.equal(clean('<img src="data:image/png;base64,AAAA">'), "");
  assert.equal(clean('<img alt="no source"><p>x</p>'), "<p>x</p>");
  assert.equal(clean('<img src=" https://cdn.example/a.png " alt="a">'), '<img src="https://cdn.example/a.png" alt="a">');
  assert.equal(clean('<body onload="alert(1)"><p>x</p></body>'), "<p>x</p>");
  assert.equal(clean('<iframe src="https://evil.example"></iframe><p>x</p>'), "<p>x</p>");
  assert.equal(clean('<embed src="x.swf"><object data="x"></object><p>x</p>'), "<p>x</p>");
  assert.equal(clean('<form id="location"><input name="href"></form><p>x</p>'), "<p>x</p>");
});

test("two sanitizers on one purifier keep their own policies, even when interleaved", () => {
  const strict = createSanitizer(purify, { policy: { allowedTags: ["p", "a"], allowedAttributes: ["href"], allowedUriPattern: /^https:/ } });
  const html = '<p><a href="https://members.example.org/x">in</a> <a href="http://plain.example/y">http</a> <strong>b</strong></p>';
  // The strict policy drops the http: href; an anchor without href carries no target
  const stripped = '<p><a href="https://members.example.org/x" target="_blank" rel="noopener noreferrer">in</a> <a>http</a> b</p>';
  assert.equal(strict.sanitize(html), stripped);
  assert.equal(clean(html), '<p><a href="https://members.example.org/x">in</a> <a href="http://plain.example/y" target="_blank" rel="noopener noreferrer">http</a> <strong>b</strong></p>');
  assert.equal(strict.sanitize(html), stripped);
  assert.equal(strict.policy.allowedTags.length, 2);
});

test("hooks are registered once per purifier and a failing sanitize restores the previous policy", () => {
  const calls: string[] = [];
  const fake: HtmlPurifier = {
    sanitize: (dirty) => dirty,
    addHook: (entry) => {
      calls.push(entry);
    },
  };
  createSanitizer(fake);
  createSanitizer(fake, { policy: { allowedTags: ["p"], allowedAttributes: [], allowedUriPattern: /^https:/ } });
  assert.deepEqual(calls, ["afterSanitizeAttributes"]);
  assert.equal(createSanitizer(fake).sanitize(""), "");
  assert.deepEqual(createSanitizer(fake).policy.allowedTags.includes("img"), true);
  const failing: HtmlPurifier = {
    sanitize: () => {
      throw new Error("boom");
    },
    addHook: () => {},
  };
  const failingSanitizer = createSanitizer(failing);
  assert.throws(() => failingSanitizer.sanitize("<p>x</p>"), /boom/);
  assert.equal(failingSanitizer.sanitize(""), "");
});
