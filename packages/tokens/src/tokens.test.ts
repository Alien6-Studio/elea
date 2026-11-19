import assert from "node:assert/strict";
import { test } from "node:test";
import { cssDeclarations, cssValue, cssVariableName, tailwindVariableName, toStylesheet, toTailwindTheme } from "./css.js";
import { flattenTokens, mergeTokens, resolveReference, type TokenGroup } from "./dtcg.js";
import { cssVar, darkTokens, lightTokens, tokens } from "./index.js";

const tree: TokenGroup = {
  $schema: "x",
  color: {
    base: { $type: "color", $value: "#111111" },
    alias: { $type: "color", $value: "{color.base}" },
    chain: { $value: "{color.alias}" },
    group: { $type: "color", inner: { $value: "#222222" } },
  },
  font: { family: { sans: { $type: "fontFamily", $value: ["Segoe UI", "Arial", "sans-serif"] } } },
};

test("flattenTokens lists leaves with resolved references and inherited types", () => {
  assert.deepEqual(flattenTokens(tree), [
    { path: "color.base", type: "color", value: "#111111" },
    { path: "color.alias", type: "color", value: "#111111" },
    { path: "color.chain", type: "unknown", value: "#111111" },
    { path: "color.group.inner", type: "color", value: "#222222" },
    { path: "font.family.sans", type: "fontFamily", value: ["Segoe UI", "Arial", "sans-serif"] },
  ]);
});

test("resolveReference refuses unknown and circular references", () => {
  assert.equal(resolveReference("plain", tree), "plain");
  assert.equal(resolveReference(12, tree), 12);
  assert.throws(() => resolveReference("{color.missing}", tree), /Unknown token reference/);
  const cyclic: TokenGroup = { a: { $value: "{b}" }, b: { $value: "{a}" } };
  assert.throws(() => flattenTokens(cyclic), /Circular token reference/);
});

test("mergeTokens overrides leaves and keeps the rest", () => {
  const merged = mergeTokens(tree, { color: { base: { $value: "#000000" }, extra: { $value: "#333333" } }, size: { x: { $value: "1px" } } });
  const flat = flattenTokens(merged);
  assert.equal(flat.find((token) => token.path === "color.base")?.value, "#000000");
  assert.equal(flat.find((token) => token.path === "color.alias")?.value, "#000000");
  assert.equal(flat.find((token) => token.path === "color.extra")?.value, "#333333");
  assert.equal(flat.find((token) => token.path === "size.x")?.value, "1px");
  assert.equal(flattenTokens(tree).find((token) => token.path === "color.base")?.value, "#111111");
});

test("css names and values", () => {
  assert.equal(cssVariableName("color.text.default"), "--elea-color-text-default");
  assert.equal(cssVariableName("space.4", "ds"), "--ds-space-4");
  assert.equal(cssValue({ path: "x", type: "fontFamily", value: ["Segoe UI", "Arial", "sans-serif"] }), '"Segoe UI", Arial, sans-serif');
  assert.equal(cssValue({ path: "x", type: "fontWeight", value: 700 }), "700");
  assert.equal(cssDeclarations([{ path: "a.b", type: "t", value: "1px" }]), "  --elea-a-b: 1px;");
});

test("toStylesheet emits :root and the dark overrides twice", () => {
  const css = toStylesheet([{ path: "a", type: "t", value: "1" }], { dark: [{ path: "a", type: "t", value: "2" }] });
  assert.match(css, /^:root \{\n  --elea-a: 1;\n\}/);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n  :root:not\(\[data-theme="light"\]\) \{\n    --elea-a: 2;/);
  assert.match(css, /:root\[data-theme="dark"\] \{\n  --elea-a: 2;\n\}\n$/);
  assert.equal(toStylesheet([{ path: "a", type: "t", value: "1" }]), ":root {\n  --elea-a: 1;\n}\n");
});

test("Tailwind theme names follow the v4 namespaces and point at runtime variables", () => {
  assert.equal(tailwindVariableName("color.text.default"), "--color-elea-text-default");
  assert.equal(tailwindVariableName("font.family.sans"), "--font-elea-sans");
  assert.equal(tailwindVariableName("font.size.lg"), "--text-elea-lg");
  assert.equal(tailwindVariableName("font.weight.bold"), "--font-weight-elea-bold");
  assert.equal(tailwindVariableName("font.leading.tight"), "--leading-elea-tight");
  assert.equal(tailwindVariableName("space.4"), "--spacing-elea-4");
  assert.equal(tailwindVariableName("radius.md"), "--radius-elea-md");
  assert.equal(tailwindVariableName("shadow.sm"), "--shadow-elea-sm");
  assert.equal(tailwindVariableName("size.measure"), null);
  assert.equal(tailwindVariableName("color"), "--color-elea");
  const theme = toTailwindTheme([{ path: "color.text.default", type: "color", value: "#000" }, { path: "size.measure", type: "dimension", value: "1rem" }]);
  assert.equal(theme, "@theme {\n  --color-elea-text-default: var(--elea-color-text-default);\n}\n");
});

test("the shipped token sets resolve and the dark theme only overrides existing tokens", () => {
  assert.ok(tokens.length > 80);
  const paths = new Set(tokens.map((token) => token.path));
  for (const token of darkTokens) assert.ok(paths.has(token.path), token.path);
  assert.equal(tokens.find((token) => token.path === "color.text.default")?.value, "#141a26");
  assert.equal(darkTokens.find((token) => token.path === "color.text.default")?.value, "#eef2f7");
  assert.equal(cssVar("color.text.default"), "var(--elea-color-text-default)");
  assert.ok("color" in lightTokens);
});
