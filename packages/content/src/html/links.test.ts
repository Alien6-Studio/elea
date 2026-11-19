import assert from "node:assert/strict";
import { test } from "node:test";
import { applyLinkTarget, isInternalLink, linkTargetAttributes, type AttributeTarget } from "./links.js";

const SITE = { siteHostnames: ["members.example.org"] };

test("relative paths, fragments, local hosts and the site's own hosts are internal", () => {
  for (const href of [
    "/member/resources",
    "/member/resources?tab=docs#top",
    "#section",
    "./page",
    "../page",
    "page.html",
    "https://members.example.org/member/resources",
    "http://localhost:3000/member/feed",
    "http://127.0.0.1:3000/member/feed",
    "  /member/feed  ",
  ]) {
    assert.equal(isInternalLink(href, SITE), true, href);
  }
});

test("other hosts, protocol-relative URLs, non-http schemes and empty values are external", () => {
  for (const href of ["https://www.example.org/page", "https://example.org/", "//evil.example/path", "mailto:contact@example.org", "javascript:alert(1)", "", null, undefined]) {
    assert.equal(isInternalLink(href, SITE), false, String(href));
  }
  assert.equal(isInternalLink("https://members.example.org/x"), false);
});

test("linkTargetAttributes returns new-tab attributes for external links only", () => {
  assert.deepEqual(linkTargetAttributes("/member/feed"), {});
  assert.deepEqual(linkTargetAttributes("https://www.example.org"), { target: "_blank", rel: "noopener noreferrer" });
});

function anchor(attributes: Record<string, string>): AttributeTarget & { attributes: Record<string, string> } {
  return {
    attributes,
    getAttribute: (name) => attributes[name] ?? null,
    setAttribute: (name, value) => {
      attributes[name] = value;
    },
    removeAttribute: (name) => {
      delete attributes[name];
    },
  };
}

test("applyLinkTarget adds target and rel on an external anchor", () => {
  const element = anchor({ href: "https://www.example.org" });
  applyLinkTarget(element);
  assert.deepEqual(element.attributes, { href: "https://www.example.org", target: "_blank", rel: "noopener noreferrer" });
});

test("applyLinkTarget removes a stored target and rel from an internal anchor", () => {
  const element = anchor({ href: "/member/resources", target: "_blank", rel: "noopener noreferrer" });
  applyLinkTarget(element, SITE);
  assert.deepEqual(element.attributes, { href: "/member/resources" });
});

test("applyLinkTarget treats an anchor without href as external", () => {
  const element = anchor({});
  applyLinkTarget(element);
  assert.equal(element.attributes.target, "_blank");
});

test("paths the browser would read as another host are external", () => {
  for (const href of ["/\\evil.example/path", "\\\\evil.example", "/\\/evil.example", "https:/\\evil.example"]) {
    assert.equal(isInternalLink(href, SITE), false, href);
  }
  assert.equal(isInternalLink("/path/with%20space?q=1#f", SITE), true);
  assert.equal(isInternalLink("https://MEMBERS.example.org/x", SITE), true);
});
