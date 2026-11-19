import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeHtmlEntities, excerpt, htmlToText, stripHtmlTags } from "./text.js";

test("decodeHtmlEntities handles named, decimal and hex entities and leaves unknown ones", () => {
  assert.equal(decodeHtmlEntities("a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39; &eacute;t&eacute; &#x1F600; &nbsp;x"), 'a & b <c> "d" \'e\' été 😀  x');
  assert.equal(decodeHtmlEntities("&unknown; &#0; &#xZZ; &#99999999;"), "&unknown; &#0; &#xZZ; &#99999999;");
  assert.equal(decodeHtmlEntities("&RSQUO;s"), "’s");
});

test("stripHtmlTags removes tags linearly and keeps paragraph breaks", () => {
  assert.equal(stripHtmlTags("<p>One</p><p>Two<br/>Three</p>"), "One\nTwo\nThree\n");
  assert.equal(stripHtmlTags("<ul><li>a</li><li>b</li></ul>"), "a\nb\n");
  assert.equal(stripHtmlTags("<h2 class='x'>T</h2><div>d</div><blockquote>q</blockquote><tr>r</tr><pre>p</pre>"), "T\nd\nq\nr\np\n");
  assert.equal(stripHtmlTags("2 < 3 and <b>bold</b>"), "2 < 3 and bold");
  assert.equal(stripHtmlTags("broken <b"), "broken <b");
  assert.equal(stripHtmlTags(""), "");
});

test("htmlToText collapses whitespace unless asked otherwise", () => {
  assert.equal(htmlToText("<p>  Hello&nbsp;<strong>world</strong> </p>\n\n<p>again</p>"), "Hello world again");
  assert.equal(htmlToText("<p>a</p><p>b</p>", { collapseWhitespace: false }), "a\nb\n");
});

test("excerpt cuts on a word boundary and appends an ellipsis", () => {
  assert.equal(excerpt("short text", 20), "short text");
  assert.equal(excerpt("The quick brown fox jumps over the lazy dog", 20), "The quick brown fox…");
  assert.equal(excerpt("Supercalifragilisticexpialidocious words", 10), "Supercalif…");
  assert.equal(excerpt("  spaced   out   text  ", 100), "spaced out text");
  assert.equal(excerpt("abc def", 5, "..."), "abc..."); 
});
