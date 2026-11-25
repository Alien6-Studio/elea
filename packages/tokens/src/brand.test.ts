import assert from "node:assert/strict";
import { test } from "node:test";
import { editions, makeBrandTheme, type BrandTheme } from "./brand.js";

test("editions style the viewer and controls through the same scoped Elea properties", () => {
  const { css, colours } = makeBrandTheme(editions.Editorial, "journal");
  assert.equal(colours.length, 11);
  assert.equal(colours[6], editions.Editorial.seed);
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
  assert.ok(css.includes("  --elea-color-info: var(--elea-color-primary-700);") && css.includes("  --elea-color-info: var(--elea-color-primary-300);"));
  assert.notEqual(makeBrandTheme(editions.Obsidian).css, makeBrandTheme(editions.Precision).css);
});

test("light brand colours yield a readable primary fill for white labels", () => {
  const { colours } = makeBrandTheme({ ...editions.Precision, seed: "#FFFFFF" });
  const fill = colours[6]!;
  const channel = Number.parseInt(fill.slice(1, 3), 16) / 255;
  const luminance = ((channel + 0.055) / 1.055) ** 2.4;
  assert.ok(1.05 / (luminance + 0.05) >= 4.5, fill);
  assert.ok(colours.every((colour) => /^#[a-f0-9]{6}$/.test(colour)));
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
  // The secondary button fills with 700 under a white label.
  const fill = ramp[7]?.[1] ?? "";
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((index) => Number.parseInt(fill.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  assert.ok(1.05 / (r * 0.2126 + g * 0.7152 + b * 0.0722 + 0.05) >= 4.5, fill);
  assert.ok(makeBrandTheme({ ...editions.Precision, radius: "0.625rem" }).css.includes("--elea-radius-md: 0.4688rem;"));
  const plain = makeBrandTheme({ seed: "#0f766e", corner: "Soft", typeface: "Sans", rhythm: "Balanced" }).css;
  assert.ok(!plain.includes("secondary") && !plain.includes("--elea-font-family-sans:"));
});

test("the open options refuse anything that could leave the declaration", () => {
  for (const input of [
    { font: "Inter; } body { display: none" }, { font: "url(https://example.org/x)" }, { font: "" }, { font: 4 },
    { accent: "gold" }, { accent: 4 }, { radius: "1em" }, { radius: "calc(1px)" }, { radius: "-2px" }, { radius: 4 },
  ]) assert.throws(() => makeBrandTheme({ ...editions.Editorial, ...input } as BrandTheme), RangeError, JSON.stringify(input));
});
