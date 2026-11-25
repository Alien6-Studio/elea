/** Semantic colour assignments available on a brand. */
export const brandColorRoles = ["primary", "secondary", "tertiary", "success", "info", "warning", "danger"] as const;
export type BrandColorRole = typeof brandColorRoles[number];

/** ELEA reference tones, from the lightest to the darkest. */
export const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ColorStep = typeof colorSteps[number];
/** Primary and secondary actions use this tone until another shade is assigned. */
export const defaultColorStep = 500 satisfies ColorStep;

// Families share a perceptual lightness axis. Chroma peaks around the middle of the scale.
const lightness = [0.975, 0.945, 0.89, 0.81, 0.72, 0.635, 0.535, 0.46, 0.385, 0.302, 0.218];
const saturation = [0.10, 0.23, 0.44, 0.68, 0.87, 1, 0.96, 0.84, 0.67, 0.49, 0.33];

// Inverse Oklab transform to linear sRGB (Björn Ottosson).
function linearRgb(light: number, a: number, b: number) {
  const l = (light + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (light - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (light - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function srgbByte(channel: number) {
  const encoded = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255).toString(16).padStart(2, "0");
}

function family(hue: number, peakChroma: number, chromaCurve = saturation): readonly { readonly step: ColorStep; readonly value: string }[] {
  const radians = hue * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return colorSteps.map((step, index) => {
    const light = lightness[index]!;
    let upper = peakChroma * chromaCurve[index]!;
    let rgb = linearRgb(light, upper * cosine, upper * sine);
    if (rgb.some(channel => channel < 0 || channel > 1)) {
      // Reduce only chroma until all three channels can be displayed in sRGB.
      let lower = 0;
      while (upper - lower > 0.00001) {
        const middle = (upper + lower) / 2;
        const candidate = linearRgb(light, middle * cosine, middle * sine);
        if (candidate.every(channel => channel >= 0 && channel <= 1)) lower = middle;
        else upper = middle;
      }
      rgb = linearRgb(light, lower * cosine, lower * sine);
    }
    return { step, value: "#" + rgb.map(srgbByte).join("") };
  });
}

/** Named hue families with appearance-independent sRGB swatches. */
export const colorFamilies = {
  Ruby: family(22, 0.205),
  Coral: family(37, 0.185),
  Copper: family(54, 0.155),
  Amber: family(80, 0.165),
  Citron: family(110, 0.16),
  Fern: family(142, 0.155),
  Emerald: family(165, 0.145),
  Lagoon: family(197, 0.13),
  Sky: family(232, 0.15),
  Cobalt: family(264, 0.20),
  Iris: family(285, 0.185),
  Violet: family(306, 0.175),
  Plum: family(328, 0.15),
  Rose: family(352, 0.18),
  Slate: family(253, 0.024),
  // Warm paper in the highlights, unbleached linen in the middle, carbon in the shadows.
  Sand: family(90, 0.052, [0.65, 0.84, 1, 0.9, 0.8, 0.7, 0.59, 0.49, 0.4, 0.27, 0.12]),
} as const;

export type ColorFamily = keyof typeof colorFamilies;

// Art-directed neutrals keep the paper and the ink of a scheme as their exact endpoints.
function surfaceRamp(paper: string, ink: string) {
  const amounts = [0, 0.045, 0.10, 0.21, 0.32, 0.50, 0.68, 0.85, 0.90, 0.95, 1];
  return colorSteps.map((step, index) => {
    const value = [1, 3, 5].map(offset => {
      const start = parseInt(paper.slice(offset, offset + 2), 16);
      const end = parseInt(ink.slice(offset, offset + 2), 16);
      return Math.round(start + (end - start) * amounts[index]!).toString(16).padStart(2, "0");
    }).join("");
    return { step, value: "#" + value };
  });
}

/** Families available for surfaces, text and borders, including the atlas families. */
export const surfaceFamilies = {
  ...colorFamilies,
  Gray: surfaceRamp("#ffffff", "#151515"),
  Ivory: surfaceRamp("#f2eee3", "#181817"),
  Porcelain: surfaceRamp("#f5f2e9", "#17152b"),
  Madder: surfaceRamp("#f7e8e1", "#321f2e"),
  Chalk: surfaceRamp("#f1f0e7", "#344d54"),
} as const;

export type SurfaceFamily = keyof typeof surfaceFamilies;

export const defaultTertiaryFamily = "Violet" satisfies ColorFamily;

/** Key colours for complete schemes. Each hex is tone 500 of its own role. */
export const colorThemes = {
  rasance: {
    name: "Rasance", style: "Carbon & ivory", neutral: "Gray",
    profile: { controls: "inset", typeface: "Sans", rhythm: "Balanced", corner: "Square" },
    colours: {
      primary: "#181817", secondary: "#d3cec1", tertiary: "#686963",
      success: "#546752", info: "#526571", warning: "#936735", danger: "#914444",
    },
  },
  reserve: {
    name: "Réserve", style: "Ultramarine & chalk", neutral: "Gray",
    profile: { controls: "flat", typeface: "Sans", rhythm: "Compact", corner: "Square" },
    colours: {
      primary: "#2926bf", secondary: "#a6afd9", tertiary: "#504878",
      success: "#447665", info: "#4765a4", warning: "#a07430", danger: "#a24e5a",
    },
  },
  braise: {
    name: "Braise", style: "Madder & apricot", neutral: "Gray",
    profile: { controls: "raised", typeface: "Serif", rhythm: "Airy", corner: "Soft" },
    colours: {
      primary: "#f0aa70", secondary: "#873f47", tertiary: "#d39a99",
      success: "#61795d", info: "#657a93", warning: "#aa7938", danger: "#a64051",
    },
  },
  "hors-champ": {
    name: "Hors champ", style: "Sky & petrol", neutral: "Gray",
    profile: { controls: "flat", typeface: "Sans", rhythm: "Airy", corner: "Soft" },
    colours: {
      primary: "#344d54", secondary: "#aec8d7", tertiary: "#ba482c",
      success: "#4e7567", info: "#547791", warning: "#a27944", danger: "#a64350",
    },
  },
  fjord: {
    name: "Fjord", style: "Nordic", neutral: "Slate",
    colours: {
      primary: "#285e70", secondary: "#617d71", tertiary: "#ceaa83",
      success: "#48745e", info: "#477994", warning: "#a46b30", danger: "#ab5256",
    },
  },
  cyanotype: {
    name: "Cyanotype", style: "Monochrome", neutral: "Slate",
    colours: {
      primary: "#244d71", secondary: "#537b9c", tertiary: "#a5c0d4",
      success: "#49766b", info: "#426f95", warning: "#a67d43", danger: "#9b565f",
    },
  },
  signal: {
    name: "Signal", style: "Modern", neutral: "Slate",
    colours: {
      primary: "#4c37ca", secondary: "#00897e", tertiary: "#d2e64b",
      success: "#158252", info: "#286bd8", warning: "#e69b18", danger: "#c63e52",
    },
  },
  vellum: {
    name: "Vellum", style: "Elegant", neutral: "Sand",
    colours: {
      primary: "#211f1c", secondary: "#e7dbc3", tertiary: "#877665",
      success: "#5c7058", info: "#596b76", warning: "#9b713a", danger: "#91464b",
    },
  },
} as const;

export type ColorThemeId = keyof typeof colorThemes;
export type ThemeProfileId = {
  [Id in ColorThemeId]: "profile" extends keyof (typeof colorThemes)[Id] ? Id : never;
}[ColorThemeId];
