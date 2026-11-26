import assert from "node:assert/strict";
import { test } from "node:test";
import { brandColorRoles, colorFamilies, colorSteps, colorThemes, surfaceFamilies, type ColorThemeId } from "./palette.js";
import { applyColorTheme, createThemeProfile, matchingColorTheme } from "./color-themes.js";
import { editions, makeBrandTheme } from "./brand.js";

const profiles = ["rasance", "reserve", "braise", "hors-champ", "hors-registre", "echappee", "grand-bain", "ponctuation", "lisiere"] as const;

function linearChannels(hex: string) {
  return [1, 3, 5].map(offset => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
}

function luminance(hex: string) {
  const [r, g, b] = linearChannels(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test("every family offers the same ordered, distinct, opaque sRGB tones", () => {
  for (const [name, swatches] of Object.entries(colorFamilies)) {
    assert.deepEqual(swatches.map(swatch => swatch.step), colorSteps, name);
    assert.equal(new Set(swatches.map(swatch => swatch.value)).size, colorSteps.length, name);
    let previousLuminance = 1;
    for (const { step, value } of swatches) {
      assert.match(value, /^#[a-f0-9]{6}$/);
      const currentLuminance = luminance(value);
      assert.ok(currentLuminance < previousLuminance, name + " " + step);
      if (step >= 600) assert.ok(contrast("#ffffff", value) >= 4.5, name + " " + step);
      previousLuminance = currentLuminance;
    }
  }
});

test("gamut mapping preserves a common perceptual lightness across all hues at each step", () => {
  for (const [index, step] of colorSteps.entries()) {
    const lightness = Object.values(colorFamilies).map(swatches => {
      const [r, g, b] = linearChannels(swatches[index]!.value);
      const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    });
    assert.ok(Math.max(...lightness) - Math.min(...lightness) < 0.005, "Tone " + step);
  }
});

test("each theme profile exports its colours, typography, spacing and geometry together", () => {
  for (const id of profiles) {
    const brand = createThemeProfile(id);
    const { profile } = colorThemes[id];
    assert.equal(brand.typeface, profile.typeface);
    assert.equal(brand.rhythm, profile.rhythm);
    assert.equal(brand.corner, profile.corner);
    assert.equal(brand.shape, id);
    assert.equal(brand.controls, profile.controls);
    assert.equal(brand.edition, undefined);
    assert.equal(matchingColorTheme(brand), id);
    const { css, roles } = makeBrandTheme(brand);
    assert.deepEqual(Object.keys(roles), [...brandColorRoles]);
    const tabStyle = { inset: "rail", flat: "underline", raised: "segmented" }[profile.controls];
    assert.ok(css.includes("--elea-_tabs-presentation: " + tabStyle));
    assert.ok(css.includes("--elea-font-family-content: var(--elea-font-family-" + profile.typeface.toLowerCase() + ")"));
  }
});

test("shape roles travel with a full profile and remain independent of its colours", () => {
  for (const id of profiles) {
    const profile = createThemeProfile(id);
    const recoloured = applyColorTheme(profile, id === "braise" ? "reserve" : "braise");
    assert.equal(recoloured.shape, id);
    const { css } = makeBrandTheme(recoloured);
    for (const [role, shape] of Object.entries(colorThemes[id].shapes)) {
      assert.ok(css.includes(`--elea-shape-${role}: ${shape};`), id + " " + role);
    }
  }
  const colourOnly = applyColorTheme(editions.Editorial, "reserve");
  assert.equal(colourOnly.shape, undefined);
  assert.ok(makeBrandTheme(colourOnly).css.includes("--elea-shape-action: initial;"));
});

test("a uniform brand or an explicit corner or radius resets all inherited shape roles", () => {
  const reserve = createThemeProfile("reserve");
  for (const brand of [
    editions.Precision, { ...reserve, shape: undefined }, { ...reserve, corner: "Round" as const },
    { ...reserve, radius: "10px" }, { ...reserve, radius: "0px" },
  ]) {
    const { css } = makeBrandTheme(brand);
    for (const role of ["action", "control", "surface", "indicator"]) {
      assert.ok(css.includes(`--elea-shape-${role}: initial;`), role);
    }
  }
  for (const shape of ["fjord", "__proto__", "constructor", "", null, 3]) {
    assert.throws(() => makeBrandTheme({ ...reserve, shape: shape as never }), /Unknown shape profile/);
  }
});

test("an explicit control treatment overrides only the edition's control styles", () => {
  const original = makeBrandTheme(editions.Precision);
  const override = makeBrandTheme({ ...editions.Precision, controls: "flat" });
  assert.deepEqual(override.roles, original.roles);
  assert.ok(original.css.includes("--elea-_tabs-presentation: segmented"));
  assert.ok(override.css.includes("--elea-_tabs-presentation: underline"));
  assert.throws(() => makeBrandTheme({ ...editions.Precision, controls: "unknown" as never }), /control treatment/);
});

test("colour themes apply seven independent key colours without replacing the edition", () => {
  const original = { ...editions.Editorial, radius: "12px", font: "Georgia" };
  for (const id of Object.keys(colorThemes) as ColorThemeId[]) {
    const theme = colorThemes[id];
    const brand = applyColorTheme(original, id);
    assert.equal(matchingColorTheme(brand), id);
    for (const key of ["edition", "rhythm", "typeface", "font", "radius", "corner"] as const) {
      assert.equal(brand[key], original[key]);
    }
    const { roles, roleScales } = makeBrandTheme(brand);
    for (const role of brandColorRoles) {
      const scale = roleScales[role]!;
      assert.deepEqual(scale.map(({ step }) => step), colorSteps);
      assert.equal(scale.find(swatch => swatch.step === 500)!.value, theme.colours[role]);
      for (const appearance of ["light", "dark"] as const) {
        const colours = roles[role]![appearance];
        const context = `${theme.name} ${role} ${appearance}`;
        assert.equal(colours.fill, theme.colours[role], context);
        for (const resolved of [colours.ink, colours.hover, colours.pressed, colours.container, colours.onContainer]) {
          assert.ok(scale.some(({ value }) => value === resolved), context);
        }
        for (const fill of [colours.fill, colours.hover, colours.pressed]) {
          assert.ok(contrast(colours.text, fill) >= 4.5, context);
        }
        assert.ok(contrast(colours.onContainer, colours.container) >= 4.5, context);
        const surface = surfaceFamilies[theme.neutral][appearance === "light" ? 0 : colorSteps.length - 1]!;
        assert.ok(contrast(colours.ink, surface.value) >= 4.5, context);
      }
    }
    assert.equal(matchingColorTheme({ ...brand, palette: { ...brand.palette, danger: { seed: "#aabbcc" } } }), undefined);
  }
});

test("role scales keep off-centre reference assignments and distinguish inherited colours", () => {
  const brand = { ...editions.Precision, palette: {
    secondary: { family: "Sky", step: 300 }, warning: { family: "Amber", step: 700 },
  } } as const;
  const { roles, roleScales, palettes } = makeBrandTheme(brand);
  assert.deepEqual(roleScales.secondary, colorFamilies.Sky);
  assert.deepEqual(roleScales.warning, colorFamilies.Amber);
  assert.equal(roles.secondary!.light.fill, colorFamilies.Sky.find(({ step }) => step === 300)!.value);
  assert.equal(roles.warning!.dark.fill, colorFamilies.Amber.find(({ step }) => step === 700)!.value);
  assert.equal(roleScales.secondary!.at(-1)!.step, 950);
  assert.equal(palettes.secondary.at(-1)!.step, 900);
  assert.deepEqual(roleScales.tertiary, colorFamilies.Violet);
  assert.ok(roles.success);
  assert.equal(roleScales.success, undefined);
  const custom = { seed: "#526571", corner: "Soft", typeface: "Sans", rhythm: "Balanced" } as const;
  assert.deepEqual(Object.keys(makeBrandTheme(custom).roleScales), ["primary"]);
});

test("the theme profiles export identical achromatic surfaces, text and borders in both appearances", () => {
  const ramp = surfaceFamilies.Gray;
  assert.deepEqual(ramp.map(({ step }) => step), colorSteps);
  for (const { value } of ramp) assert.match(value, /^#([\da-f]{2})\1\1$/);
  for (const id of profiles) {
    const profile = createThemeProfile(id);
    assert.equal(profile.palette?.neutral, "Gray");
    const { css } = makeBrandTheme(profile);
    for (const { step, value } of ramp) {
      assert.ok(css.includes(`--elea-color-neutral-${step}: var(--elea-palette-gray-${step}, ${value});`), id);
    }
    for (const [role, day, night] of [
      ["surface-default", 50, 950], ["surface-subtle", 100, 900], ["surface-muted", 200, 800],
      ["text-default", 950, 50], ["text-muted", 800, 100], ["border-default", 200, 800],
    ] as const) {
      for (const [mode, step] of [["light", day], ["dark", night]] as const) {
        const { value } = ramp[colorSteps.indexOf(step)]!;
        assert.ok(css.includes(`--elea-brand-${mode}-color-${role}: var(--elea-palette-gray-${step}, ${value});`), id + " " + role);
      }
    }
  }
});

test("explicit surface families retain their paper and ink in local and exported themes", () => {
  for (const [family, paper, ink] of [
    ["Gray", "#ffffff", "#151515"],
    ["Ivory", "#f2eee3", "#181817"], ["Porcelain", "#f5f2e9", "#17152b"],
    ["Madder", "#f7e8e1", "#321f2e"], ["Chalk", "#f1f0e7", "#344d54"],
  ] as const) {
    const ramp = surfaceFamilies[family];
    assert.deepEqual(ramp.map(swatch => swatch.step), colorSteps);
    assert.equal(ramp[0]!.value, paper);
    assert.equal(ramp.at(-1)!.value, ink);
    const { css } = makeBrandTheme({ ...editions.Precision, palette: { neutral: family } });
    for (const [appearance, base, text, muted, border] of [
      ["light", 50, 700, 200, 600], ["dark", 950, 200, 800, 400],
    ] as const) {
      const value = (step: number) => ramp.find(swatch => swatch.step === step)!.value;
      assert.ok(css.includes(`--elea-brand-${appearance}-color-surface-default: var(--elea-palette-${family.toLowerCase()}-${base}, ${value(base)});`));
      assert.ok(contrast(value(text), value(muted)) >= 4.5, family + " " + appearance + " text");
      assert.ok(contrast(value(border), value(muted)) >= 3, family + " " + appearance + " border");
    }
  }
});
