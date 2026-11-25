import assert from "node:assert/strict";
import { test } from "node:test";
import { cssDeclarations, cssValue, cssVariableName, inLayer, tailwindVariableName, toShadcnAliases, toShadcnPreset, toStylesheet, toTailwindPreset, toTailwindTheme } from "./css.js";
import { flattenTokens, mergeTokens, resolveReference, type TokenGroup } from "./dtcg.js";
import { cssVar, darkTokens, lightTokens, tokens } from "./index.js";
import { colorFamilies, defaultColorStep, defaultTertiaryFamily } from "./palette.js";
import { statusColors, statusRoles } from "./status.js";

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

test("a layered stylesheet states the order of the Elea layers, then its rules inside one", () => {
  assert.equal(
    toStylesheet([{ path: "a", type: "t", value: "1" }], { layer: "elea.tokens" }),
    "@layer elea.tokens, elea.base, elea.components;\n@layer elea.tokens {\n:root {\n  --elea-a: 1;\n}\n}\n",
  );
  assert.equal(inLayer("elea.tokens", ".brand { --elea-a: 2; }\n"), "@layer elea.tokens, elea.base, elea.components;\n@layer elea.tokens {\n.brand { --elea-a: 2; }\n}\n");
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
  assert.equal(tailwindVariableName("motion.easing.standard"), "--ease-elea-standard");
  assert.equal(tailwindVariableName("motion.duration.base"), null);
  assert.equal(tailwindVariableName("color"), "--color-elea");
  const theme = toTailwindTheme([{ path: "color.text.default", type: "color", value: "#000" }, { path: "size.measure", type: "dimension", value: "1rem" }]);
  assert.equal(theme, "@theme inline {\n  --color-elea-text-default: var(--elea-color-text-default);\n}\n");
});

test("the shipped token sets resolve and the dark theme only overrides existing tokens", () => {
  assert.ok(tokens.length > 80);
  const paths = new Set(tokens.map((token) => token.path));
  for (const token of darkTokens) assert.ok(paths.has(token.path), token.path);
  assert.equal(tokens.find((token) => token.path === "color.text.default")?.value, "#141a26");
  assert.equal(darkTokens.find((token) => token.path === "color.text.default")?.value, "#eef2f7");
  assert.equal(cssVar("color.text.default"), "var(--elea-color-text-default)");
  assert.equal(cssVar("color.action.warning-ink"), "var(--elea-color-action-warning-ink, var(--elea-color-warning))");
  assert.equal(cssVar("color.action.warning-container"), "var(--elea-color-action-warning-container, color-mix(in srgb, var(--elea-color-warning) 10%, var(--elea-color-surface-default)))");
  assert.equal(tokens.find((token) => token.path === "motion.duration.base")?.value, "150ms");
  const easing = tokens.find((token) => token.path === "motion.easing.standard");
  assert.equal(easing && cssValue(easing), "cubic-bezier(0.2, 0, 0, 1)");
  assert.ok("color" in lightTokens);
});

test("the info colour starts as the link colour, in both schemes", () => {
  for (const set of [tokens, darkTokens]) {
    const info = set.find((token) => token.path === "color.info");
    assert.ok(info);
    assert.equal(info.value, set.find((token) => token.path === "color.text.link")?.value);
  }
});

test("the default reading and interface stacks start with ELEA Sans", () => {
  const sans = tokens.find((token) => token.path === "font.family.sans");
  assert.ok(sans);
  assert.match(cssValue(sans), /^"ELEA Sans", system-ui,/);
  assert.deepEqual(tokens.find((token) => token.path === "font.family.content")?.value, sans.value);
});

test("standalone actions use the default tone and keep readable interaction and surface pairs", () => {
  const luminance = (hex: string) => [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
    const channel = parseInt(hex.slice(1 + 2 * index, 3 + 2 * index), 16) / 255;
    return sum + weight * (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  }, 0);
  for (const dark of [false, true]) {
    const values = new Map((dark ? [...tokens, ...darkTokens] : tokens).map(token => [token.path, String(token.value)]));
    function readable(fill: string, ink: string) {
      const a = luminance(values.get(fill)!) + 0.05;
      const b = luminance(values.get(ink)!) + 0.05;
      assert.ok(Math.max(a / b, b / a) >= 4.5, fill + " and " + ink);
    }
    for (const role of ["primary", "secondary", "tertiary", ...statusRoles]) {
      const action = "color.action." + role;
      if (role === "primary" || role === "secondary") assert.equal(values.get(action), values.get(`color.${role}.${defaultColorStep}`));
      if (role === "tertiary") assert.equal(values.get(action), colorFamilies[defaultTertiaryFamily].find(({step}) => step === defaultColorStep)!.value);
      for (const suffix of ["", "-hover", "-pressed"]) readable(action + suffix, action + "-text");
      for (const surface of ["default", "muted"]) readable("color.surface." + surface, action + "-ink");
      readable(action + "-container", action + "-on-container");
    }
    for (const role of statusRoles) {
      const resolved = statusColors(values.get("color." + role)!, values.get("color.surface.default")!, values.get("color.text.inverse")!, dark);
      for (const key of ["hover", "pressed", "container"] as const) assert.equal(values.get(`color.action.${role}-${key}`), resolved[key]);
    }
  }
});

test("the Tailwind v3 preset names utilities like the v4 theme and keeps opacity modifiers", () => {
  const { extend } = toTailwindPreset([
    { path: "color.text.default", type: "color", value: "#000" }, { path: "font.family.sans", type: "fontFamily", value: ["Arial"] },
    { path: "font.size.lg", type: "dimension", value: "1rem" }, { path: "font.weight.bold", type: "fontWeight", value: 700 },
    { path: "font.leading.tight", type: "number", value: 1.2 }, { path: "space.4", type: "dimension", value: "1rem" },
    { path: "radius.md", type: "dimension", value: "1rem" }, { path: "shadow.sm", type: "shadow", value: "none" },
    { path: "motion.easing.standard", type: "cubicBezier", value: [0, 0, 1, 1] }, { path: "size.measure", type: "dimension", value: "1rem" },
  ]).theme;
  assert.deepEqual(extend, {
    colors: { "elea-text-default": "color-mix(in srgb, var(--elea-color-text-default) calc(<alpha-value> * 100%), transparent)" },
    fontFamily: { "elea-sans": "var(--elea-font-family-sans)" },
    fontSize: { "elea-lg": "var(--elea-font-size-lg)" },
    fontWeight: { "elea-bold": "var(--elea-font-weight-bold)" },
    lineHeight: { "elea-tight": "var(--elea-font-leading-tight)" },
    spacing: { "elea-4": "var(--elea-space-4)" },
    borderRadius: { "elea-md": "var(--elea-radius-md)" },
    boxShadow: { "elea-sm": "var(--elea-shadow-sm)" },
    transitionTimingFunction: { "elea-standard": "var(--elea-motion-easing-standard)" },
  });
  assert.equal(toTailwindPreset(tokens).theme.extend.colors?.["elea-primary-600"], "color-mix(in srgb, var(--elea-color-primary-600) calc(<alpha-value> * 100%), transparent)");
});

test("the shadcn bridge points every variable at a shipped token, as aliases and as a v3 preset", () => {
  const css = toShadcnAliases();
  assert.ok(css.startsWith(":root, [data-theme], [data-elea-theme], [data-elea-appearance] {\n  --background: var(--elea-color-surface-default);"));
  assert.ok(toShadcnAliases(".brand").startsWith(".brand {"));
  const targets = [...css.matchAll(/^  --([a-z-]+): var\((--elea-[a-z0-9-]+)(?:, var\(--elea-[a-z-]+\))?\);$/gm)];
  const shipped = new Set(tokens.map((token) => cssVariableName(token.path)));
  for (const [, , target = ""] of targets) assert.ok(shipped.has(target), target);
  assert.deepEqual(
    targets.map(([, name]) => name).sort(),
    ["accent", "accent-foreground", "background", "border", "card", "card-foreground", "destructive", "destructive-foreground", "foreground", "input", "muted", "muted-foreground", "popover", "popover-foreground", "primary", "primary-foreground", "radius", "ring", "secondary", "secondary-foreground"],
  );
  const { colors, borderRadius } = toShadcnPreset().theme.extend;
  assert.deepEqual(colors?.primary, {
    DEFAULT: "color-mix(in srgb, var(--elea-color-action-primary) calc(<alpha-value> * 100%), transparent)",
    foreground: "color-mix(in srgb, var(--elea-color-action-primary-text) calc(<alpha-value> * 100%), transparent)",
  });
  assert.deepEqual(colors?.secondary, {
    DEFAULT: "color-mix(in srgb, var(--elea-color-action-secondary) calc(<alpha-value> * 100%), transparent)",
    foreground: "color-mix(in srgb, var(--elea-color-action-secondary-text) calc(<alpha-value> * 100%), transparent)",
  });
  assert.deepEqual(colors?.border, { DEFAULT: "color-mix(in srgb, var(--elea-color-border-default) calc(<alpha-value> * 100%), transparent)" });
  assert.equal(Object.keys(colors ?? {}).length, 12);
  assert.deepEqual(borderRadius, { sm: "var(--elea-radius-sm)", md: "var(--elea-radius-md)", lg: "var(--elea-radius-lg)", xl: "var(--elea-radius-xl)" });
});

test("local appearance pairs the shipped semantic colors and rebinds the shadcn aliases", () => {
  const css = toStylesheet(tokens, { dark: darkTokens, localAppearance: true });
  assert.match(css, /\[data-elea-appearance="auto"\] \{ color-scheme: light dark; \}/);
  assert.match(css, /--elea-color-surface-default: light-dark\(var\(--elea-brand-light-color-surface-default, #ffffff\), var\(--elea-brand-dark-color-surface-default, #0a0e17\)\);/);
  assert.match(css, /--elea-color-text-link: light-dark\(var\(--elea-brand-light-color-text-link,/);
  assert.equal((css.match(/--elea-color-[^:]+: light-dark\(/g) ?? []).length, darkTokens.length);
  assert.match(toShadcnAliases(), /\[data-elea-appearance\]/);
});
