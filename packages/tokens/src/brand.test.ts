import assert from "node:assert/strict";
import { test } from "node:test";
import { brandColorRoles, brandPalettes, editions, makeBrandTheme, type BrandTheme } from "./brand.js";
import { colorFamilies, colorSteps, defaultColorStep, type ColorFamily } from "./palette.js";

test("editions style the viewer and controls through the same scoped Elea properties", () => {
  const { css, colours } = makeBrandTheme(editions.Editorial, "journal");
  assert.equal(colours.length, 11);
  assert.equal(colours[colorSteps.indexOf(defaultColorStep)], editions.Editorial.seed);
  assert.ok(css.startsWith('.journal, [data-elea-theme="journal"] {'));
  assert.ok(makeBrandTheme(editions.Editorial, "elea-editorial").css.startsWith('.elea-editorial, [data-elea-theme="editorial"] {'));
  for (const declaration of [
    "--elea-font-family-content: var(--elea-font-family-serif)",
    "--elea-font-leading-relaxed: 1.8", "--elea-size-measure: 72ch", "--elea-radius-md: 0",
    "--elea-color-surface-default: #fafafc;", "--elea-color-surface-default: #171923;",
    "--elea-_field-border-width: 1px 1px 2px;",
  ]) assert.ok(css.includes(declaration), declaration);
  assert.ok(css.includes(':root[data-theme="dark"].journal, :root[data-theme="dark"] .journal, :root[data-theme="dark"][data-elea-theme="journal"], :root[data-theme="dark"] [data-elea-theme="journal"] {'));
  assert.ok(css.includes(':root:not([data-theme="light"]) .journal'));
  for (const [mode, background] of [["light", "#e3e8f4"], ["dark", "#2b3450"]] as const) {
    const info = css.match(new RegExp(`--elea-brand-${mode}-color-info: var\\(--elea-color-primary-(\\d+)\\)`));
    const shade = colorSteps.findIndex(step => String(step) === info?.[1]);
    assert.ok(shade >= 0);
    assert.ok(contrast(colours[shade]!, background) >= 4.5);
  }
  assert.notEqual(makeBrandTheme(editions.Obsidian).css, makeBrandTheme(editions.Precision).css);
});

test("Precision links and Info retain their published colours when the seed is at 500", () => {
  const { css, roles, palettes } = makeBrandTheme(editions.Precision);
  assert.equal(roles.primary?.light.fill, "#08745e");
  assert.equal(roles.info?.light.fill, "#07604e");
  assert.equal(roles.info?.dark.fill, "#95c3ba");
  for (const [mode, link, hover] of [["light", "#07604e", "#054f40"], ["dark", "#95c3ba", "#b7d7d0"]] as const) {
    for (const [path, value] of [["text-link", link], ["text-link-hover", hover], ["info", link]]) {
      const step = palettes.primary.find(swatch => swatch.value === value)?.step;
      assert.ok(step);
      assert.ok(css.includes(`--elea-brand-${mode}-color-${path}: var(--elea-color-primary-${step});`));
    }
  }
});

test("custom seeds anchor at 500, including black, white and colours near either end", () => {
  for (const seed of ["#FFFFFF", "#fffefd", "#F2C94C", "#777777", "#000103", "#000000"]) {
    const { roles, css } = makeBrandTheme({ ...editions.Precision, seed, accent: seed, palette: { neutral: "Slate" } });
    for (const role of ["primary", "secondary"] as const) {
      assert.ok(css.includes(`--elea-color-action-${role}: var(--elea-color-${role}-500);`));
      const action = roles[role]!;
      for (const [mode, surface] of [[action.light, 200], [action.dark, 800]] as const) {
        assert.equal(mode.fill, seed.toLowerCase());
        assert.equal(new Set([mode.fill, mode.hover, mode.pressed]).size, 3);
        for (const fill of [mode.fill, mode.hover, mode.pressed]) assert.ok(contrast(mode.text, fill) >= 4.5);
        assert.ok(contrast(mode.onContainer, mode.container) >= 4.5);
        assert.ok(contrast(mode.ink, colorFamilies.Slate.find(swatch => swatch.step === surface)!.value) >= 4.5);
      }
    }
  }
});

test("palette swatches match the CSS generated for each seed pair", () => {
  const primarySteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const secondarySteps = primarySteps.slice(0, -1);
  for (const pair of [...Object.values(brandPalettes), { seed: "#FFFFFF", accent: "#F2C94C" }]) {
    const { css, colours, palettes } = makeBrandTheme({ ...editions.Editorial, ...pair });
    assert.deepEqual(palettes.primary.map(swatch => swatch.step), primarySteps);
    assert.deepEqual(palettes.secondary.map(swatch => swatch.step), secondarySteps);
    assert.deepEqual(palettes.primary.map(swatch => swatch.value), colours);
    for (const [role, swatches] of Object.entries(palettes)) {
      for (const { step, value } of swatches) {
        assert.match(value, /^#[a-f0-9]{6}$/);
        assert.ok(css.includes(`--elea-color-${role}-${step}: ${value};`));
      }
    }
  }
});

test("an omitted accent uses the edition palette or leaves the host's secondary scale in effect", () => {
  const { accent: _accent, ...precision } = editions.Precision;
  assert.deepEqual(makeBrandTheme(precision).palettes.secondary, makeBrandTheme(editions.Precision).palettes.secondary);
  const { edition: _edition, ...plain } = precision;
  const { css, palettes } = makeBrandTheme(plain);
  assert.deepEqual(palettes.secondary, []);
  assert.ok(!css.includes("--elea-color-secondary-"));
  assert.ok(!css.includes("color-action-secondary"));
});

test("the generator accepts only supported styles, a hex seed and a simple class name", () => {
  for (const input of [{ seed: "red" }, { edition: "constructor" }, { corner: "inherit" }, { typeface: "constructor" }, { rhythm: "unset" }]) {
    assert.throws(() => makeBrandTheme({ ...editions.Editorial, ...input } as BrandTheme), RangeError);
  }
  for (const className of ["article h1", "1st", ".brand", "a".repeat(65)]) {
    assert.throws(() => makeBrandTheme(editions.Editorial, className), RangeError);
  }
});

test("a product brings its own font, a second colour and a free radius", () => {
  const { css } = makeBrandTheme({ ...editions.Precision, font: "var(--font-inter), 'Segoe UI', system-ui", accent: "#F2C94C", radius: "10px" }, "product");
  for (const declaration of [
    "--elea-font-family-sans: var(--font-inter), 'Segoe UI', system-ui;", "--elea-font-family-content: var(--elea-font-family-sans);",
    "--elea-radius-sm: 5px;", "--elea-radius-md: 7.5px;", "--elea-radius-lg: 10px;", "--elea-radius-xl: 15px;",
  ]) assert.ok(css.includes(declaration), declaration);
  const ramp = [...css.matchAll(/--elea-color-secondary-(\d+): (#[a-f0-9]{6});/g)].map((match) => [match[1] ?? "", match[2] ?? ""] as const);
  assert.deepEqual(ramp.map(([shade]) => shade), ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);
  assert.equal(Object.fromEntries(ramp)[500], "#f2c94c");
  assert.ok(css.includes("--elea-color-action-secondary-text: #000000;"));
  assert.ok(makeBrandTheme({ ...editions.Precision, radius: "0.625rem" }).css.includes("--elea-radius-md: 0.4688rem;"));
  const plain = makeBrandTheme({ seed: "#0f766e", corner: "Soft", typeface: "Sans", rhythm: "Balanced" }).css;
  assert.ok(!plain.includes("--elea-color-secondary-") && !plain.includes("--elea-font-family-sans:"));
});

test("reference selections bind the exact swatch, independent roles and standalone CSS fallbacks", () => {
  const palette = { primary: { family: "Citron", step: 50 }, secondary: { family: "Ruby", step: 950 }, neutral: "Sand" } as const;
  const { css, palettes, roles, colours } = makeBrandTheme({ ...editions.Precision, palette }, "journal");
  assert.deepEqual(palettes.primary, colorFamilies.Citron);
  assert.deepEqual(colours, colorFamilies.Citron.map(swatch => swatch.value));
  assert.deepEqual(palettes.secondary, colorFamilies.Ruby.slice(0, -1));
  assert.equal(roles.primary?.light.fill, colorFamilies.Citron[0]!.value);
  assert.equal(roles.secondary?.dark.fill, colorFamilies.Ruby.at(-1)!.value);
  assert.equal(roles.primary.light.text, "#000000");
  assert.equal(roles.secondary.dark.text, "#ffffff");
  for (const declaration of [
    `--elea-color-primary-50: var(--elea-palette-citron-50, ${colorFamilies.Citron[0]!.value});`,
    "--elea-color-action-primary: var(--elea-color-primary-50);",
    `--elea-color-action-secondary: var(--elea-palette-ruby-950, ${colorFamilies.Ruby.at(-1)!.value});`,
    `--elea-color-surface-default: var(--elea-palette-sand-50, ${colorFamilies.Sand[0]!.value});`,
    `--elea-color-surface-default: var(--elea-palette-sand-950, ${colorFamilies.Sand.at(-1)!.value});`,
    "--elea-color-action-primary-container: light-dark(",
  ]) assert.ok(css.includes(declaration), declaration);

  const { css: editionCss, roles: editionRoles } = makeBrandTheme(editions.Editorial);
  assert.equal(editionRoles.primary?.light.fill, editions.Editorial.seed);
  assert.equal(editionRoles.secondary?.dark.fill, editions.Editorial.accent);
  assert.ok(editionCss.includes("--elea-color-action-primary: var(--elea-color-primary-500);"));
  assert.ok(editionCss.includes("--elea-brand-dark-color-action-primary-container: var(--elea-color-primary-800);"));
});

function contrast(a: string, b: string) {
  function luminance(hex: string) {
    const [r, g, b] = hex.slice(1).match(/../g)!.map(channel => Number.parseInt(channel, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! + 0.05;
  }
  return Math.max(luminance(a), luminance(b)) / Math.min(luminance(a), luminance(b));
}

test("every reference shade keeps readable text through hover, press and local appearance changes", () => {
  for (const family of Object.keys(colorFamilies) as ColorFamily[]) {
    for (const step of colorSteps) {
      const { roles } = makeBrandTheme({ ...editions.Obsidian, palette: { primary: { family, step }, neutral: family } });
      const action = roles.primary!;
      for (const [colors, background] of [[action.light, 200], [action.dark, 800]] as const) {
        assert.equal(new Set([colors.fill, colors.hover, colors.pressed]).size, 3);
        const surface = colorFamilies[family].find(swatch => swatch.step === background)!.value;
        for (const fill of [colors.fill, colors.hover, colors.pressed]) assert.ok(contrast(colors.text, fill) >= 4.5, family + " " + step);
        assert.ok(contrast(colors.onContainer, colors.container) >= 4.5);
        assert.ok(contrast(colors.ink, surface) >= 4.5);
      }
    }
  }
});

test("strong neutral borders distinguish controls on the muted surface in both appearances", () => {
  for (const family of Object.keys(colorFamilies) as ColorFamily[]) {
    const ramp = colorFamilies[family];
    const { css } = makeBrandTheme({ ...editions.Editorial, palette: { neutral: family } });
    for (const [mode, line, surface] of [["light", 600, 200], ["dark", 400, 800]] as const) {
      const border = ramp.find(swatch => swatch.step === line)!.value;
      const muted = ramp.find(swatch => swatch.step === surface)!.value;
      assert.ok(css.includes(`--elea-brand-${mode}-color-border-strong: var(--elea-palette-${family.toLowerCase()}-${line}, ${border});`));
      assert.ok(contrast(border, muted) >= 3);
    }
  }
});

test("tertiary and feedback can select independent reference shades or hex values", () => {
  const brand = { ...editions.Editorial, palette: {
    primary: { family: "Iris", step: 50 }, tertiary: { family: "Coral", step: 800 }, success: { seed: "#ffffff" },
    info: { family: "Fern", step: 50 }, warning: { family: "Copper", step: 950 }, danger: { seed: "#000000" }, neutral: "Slate",
  } } as const;
  const { css, roles } = makeBrandTheme(brand);
  assert.deepEqual(Object.keys(roles), brandColorRoles);
  assert.equal(roles.tertiary?.light.fill, colorFamilies.Coral.find(x => x.step === 800)!.value);
  assert.equal(roles.info?.dark.fill, colorFamilies.Fern[0]!.value);
  assert.equal(roles.warning?.light.fill, colorFamilies.Copper.at(-1)!.value);
  assert.equal(roles.success?.light.text, "#000000");
  assert.equal(roles.danger?.dark.text, "#ffffff");
  for (const role of ["success", "info", "warning", "danger"] as const) {
    const action = roles[role]!;
    for (const [mode, values, background] of [["light", action.light, 200], ["dark", action.dark, 800]] as const) {
      assert.ok(css.split("\n").some(line => line.includes(`--elea-brand-${mode}-color-${role}:`) && line.includes(values.ink)));
      const muted = colorFamilies.Slate.find(swatch => swatch.step === background)!.value;
      assert.ok(contrast(values.ink, muted) >= 4.5);
      for (const fill of [values.fill, values.hover, values.pressed]) assert.ok(contrast(values.text, fill) >= 4.5);
      assert.ok(contrast(values.onContainer, values.container) >= 4.5);
    }
  }
});

test("editions restore their feedback roles and plain brands inherit unassigned host roles", () => {
  const { css, roles } = makeBrandTheme(editions.Editorial);
  assert.equal(roles.tertiary?.dark.fill, colorFamilies.Violet.find(s => s.step === 500)!.value);
  assert.equal(roles.success?.light.fill, "#246e45");
  assert.equal(roles.success?.dark.fill, "#79d1a2");
  assert.equal(roles.warning?.light.fill, "#8a581a");
  for (const role of ["info", "warning", "danger", "success"]) {
    for (const suffix of ["", "-text", "-hover", "-pressed", "-container", "-ink", "-on-container"]) {
      const token = `color-action-${role}${suffix}`;
      assert.ok(css.includes(`--elea-${token}: initial;`));
      assert.ok(css.includes(`--elea-brand-light-${token}: initial;`));
      assert.ok(css.includes(`--elea-brand-dark-${token}: initial;`));
    }
  }
  const plain = makeBrandTheme({ seed: "#17216e", corner: "Soft", rhythm: "Balanced", typeface: "Sans",
    palette: { info: { seed: "#123456" } } });
  assert.deepEqual(Object.keys(plain.roles), ["primary", "info"]);
  for (const role of ["secondary", "success", "tertiary", "warning", "danger"]) assert.ok(!plain.css.includes(`color-action-${role}`));
});

test("a host rule loaded before an edition can replace its implicit feedback colours", () => {
  const { css } = makeBrandTheme({ ...editions.Precision, palette: { success: { seed: "#123456" } } }, "journal");
  // Inspect every rule (base, forced dark, system dark and local appearance).
  for (const [, selector = "", body = ""] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/--elea-color-(?:action-)?warning:/.test(body)) assert.ok(selector.trim().startsWith(":where("), selector);
    if (/--elea-color-(?:action-)?success:/.test(body)) assert.ok(!selector.trim().startsWith(":where("), selector);
  }
});

test("invalid reference assignments fail before a stylesheet is emitted", () => {
  for (const palette of [null, [], "Ruby", { neutral: "__proto__" }, { primary: null }, { success: null }, { warning: { seed: "red" } }, { info: { family: "Ruby" } },
    { primary: { family: "constructor", step: 500 } }, { secondary: { family: "Ruby", step: "500" } }]) {
    assert.throws(() => makeBrandTheme({ ...editions.Editorial, palette } as BrandTheme), RangeError);
  }
});

test("the open options refuse anything that could leave the declaration", () => {
  for (const input of [
    { font: "Inter; } body { display: none" }, { font: "url(https://example.org/x)" }, { font: "" }, { font: 4 },
    { accent: "gold" }, { accent: 4 }, { radius: "1em" }, { radius: "calc(1px)" }, { radius: "-2px" }, { radius: 4 },
  ]) assert.throws(() => makeBrandTheme({ ...editions.Editorial, ...input } as BrandTheme), RangeError, JSON.stringify(input));
});
