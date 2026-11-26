# @alien6-studio/elea-tokens

Design tokens for ELEA, available as CSS, JavaScript and DTCG 2025.10 interchange files.

The JavaScript entry points are ES modules. For Jest with `next/jest`, add `@alien6-studio/elea-tokens` to `transpilePackages` when testing a JavaScript import such as `@alien6-studio/elea-tokens/brand`.

## What you get

- `dtcg/2025.10/elea.tokens.json` and `dtcg/2025.10/elea.dark.tokens.json` each contain a complete theme for external design-token tools.
- `tokens/elea.tokens.json` and `tokens/elea.dark.tokens.json` expose ELEA's original CSS-oriented JSON. The second file contains only overrides and refers back to the first. Existing integrations can keep using these paths.
- `elea.css`: the runtime stylesheet. Every token is a custom property on `:root`
  (`--elea-color-text-default`, `--elea-space-4`, `--elea-radius-lg`,
  `--elea-motion-duration-base`, `--elea-motion-easing-standard`...); the dark overrides apply
  under `prefers-color-scheme: dark` unless the page sets `data-theme="light"`, and always under
  `data-theme="dark"`.
  Its rules sit in the cascade layer `elea.tokens`, as do those of `editions.css`.
- `theme.css`: a Tailwind v4 `@theme inline` block whose utilities read the runtime variables, so
  `text-elea-text-muted`, `bg-elea-surface-subtle`, `rounded-elea-lg` or `p-elea-4` follow the
  active theme, including overrides on a parent element.
- `tailwind`: the same utilities as a Tailwind v3 preset (`eleaPreset`, the default export), and
  `shadcnPreset`, which points the shadcn/ui names (`bg-primary`, `text-muted-foreground`,
  `border-input`, `rounded-md`) at Elea tokens. Colours keep opacity modifiers such as `/50`.
- `shadcn.css`: the shadcn/ui variables (`--background`, `--primary`, `--border`, `--ring`,
  `--radius`...) as aliases of Elea tokens, for Tailwind v4 projects.
- TypeScript: `tokens`, `darkTokens`, `cssVar("color.text.default")` and the functions that
  produce all of the above (`toStylesheet`, `toTailwindTheme`, `toTailwindPreset`,
  `toShadcnAliases`, `toShadcnPreset`) for custom themes.

## DTCG 2025.10 interchange

Choose one document as the input to your tool. Dimensions carry a number and a unit, colors carry sRGB components and alpha, and each shadow layer has its own offsets, blur, spread and color. Aliases retain their named targets so editing a primitive updates the roles that reference it. Both exports target the [DTCG Format](https://www.designtokens.org/tr/2025.10/format/) and [Color](https://www.designtokens.org/tr/2025.10/color/) modules for October 2025.

These export paths were added after 0.1.2. To reproduce the check, use Node.js 22 or later at the root of a checkout that contains them.

```sh
npm ci
npm run export:dtcg -w packages/tokens
npm run test:dtcg
```

`export:dtcg` writes both JSON files to `packages/tokens/dist/dtcg/2025.10/`. The test installs Style Dictionary 5.8.0 from the example's lockfile, reads the package exports and writes `light.css` and `dark.css` under `artifacts/examples/dtcg/`. It compares every token path, type, computed CSS value and alias target with the source. For example, the `100ms` duration becomes the equivalent `0.1s`, and both layers of `shadow.md` retain their negative spreads.

In the generated light CSS, two declarations show how a primary swatch reaches a button. The example changes that swatch and verifies that both roles take its new color. [Runnable example](../../docs/examples/dtcg/qualify.test.mjs)

```css
--color-info: var(--color-primary-600);
--color-action-info: var(--color-info);
```

The following command uses `uvx` to validate both files against the pinned JSON Schema.

```sh
uvx --from check-jsonschema==0.39.0 check-jsonschema \
  --schemafile https://www.designtokens.org/schemas/2025.10/format.json \
  packages/tokens/dist/dtcg/2025.10/*.tokens.json
```

## Use

```css
@import "@alien6-studio/elea-tokens/elea.css";
/* Tailwind v4 projects, after the tailwindcss import */
@import "@alien6-studio/elea-tokens/theme.css";
```

`elea.css` loads ELEA Sans from the package. Its upright and italic faces support
weights 100–900. To use your own typeface, override `--elea-font-family-sans`
for controls and `--elea-font-family-content` for reading. To load the faces
independently, import `@alien6-studio/elea-tokens/fonts/elea-sans.css`.

Vite emits the WOFF2 assets when it builds the stylesheet. With the standalone
Tailwind CLI, copy the two `.woff2` files from
`node_modules/@alien6-studio/elea-tokens/dist/fonts/` beside your compiled CSS.

Override tokens on `:root` or within a container, anywhere in your own styles: a rule outside
any cascade layer wins over the `elea.tokens` layer whatever the import order. Use the paired
`--elea-color-action-primary-text` and `--elea-color-action-secondary-text`
properties for labels on filled actions. Check contrast when overriding a pair.

Override `--elea-color-success`, `--elea-color-info`, `--elea-color-warning`, or
`--elea-color-danger` on a theme to recolor the corresponding buttons, badges,
alerts and toasts. Set the override on the theme selector so portaled surfaces
receive it too.

A custom theme joins the same layer with `toStylesheet(tokens, { layer: "elea.tokens" })`, or
with `inLayer("elea.tokens", css)` for a stylesheet you already hold. With Tailwind v4, declare
`@layer theme, base, elea, components, utilities;` before the imports; see
[`@alien6-studio/elea-ui`](../ui#with-tailwind).

## Tailwind v3

```ts
// tailwind.config.ts
import elea from "@alien6-studio/elea-tokens/tailwind";

export default { content: ["./src/**/*.{ts,tsx}"], presets: [elea] };
```

On Node.js versions that support loading ES modules with `require()`, a CommonJS config can use
`const { eleaPreset } = require("@alien6-studio/elea-tokens/tailwind")` and `presets: [eleaPreset]`.
Tailwind v3 utilities are in no cascade layer, so a utility on an Elea component wins wherever `elea.css` is
imported.

## Projects built on shadcn/ui

Existing components keep their class names and take Elea's colours, dark mode and corners.

- Tailwind v4: import `@alien6-studio/elea-tokens/shadcn.css` after `elea.css` and delete the
  `:root` and `.dark` blocks that declared the palette. Your `@theme inline` block stays.
- Tailwind v3: add `shadcnPreset` to `presets` and delete the `hsl(var(--primary))` colours and
  the `borderRadius` entries from the config, along with the palette in your global stylesheet.

```ts
import elea, { shadcnPreset } from "@alien6-studio/elea-tokens/tailwind";

export default { content: ["./src/**/*.{ts,tsx}"], presets: [elea, shadcnPreset] };
```

`secondary`, `muted` and `accent` map to Elea's muted surface and `primary` to the brand fill.
The chart and sidebar variables have no Elea counterpart and stay yours. An alias resolves
where it is declared: `shadcn.css` covers the root, `data-theme` containers and the three
editions; for your own brand class, emit `toShadcnAliases(".journal")` next to its theme.

## Local appearance

Set `data-elea-appearance="light"`, `"dark"` or `"auto"` on an HTML container
or as a JSX attribute. `auto` uses the browser's preferred color scheme, even
when the host document forces the other mode. Omit the attribute to inherit
the nearest active local scope. An absent local scope follows the existing
document `data-theme` and system rules for Elea colors.

```tsx
<section data-elea-theme="journal">
  <aside data-elea-appearance="light"><Button>Light action</Button></aside>
  <aside data-elea-appearance="dark"><Button>Dark action</Button></aside>
</section>
```

Load `elea.css` and the stylesheet for the brand. Use one brand name for both
panels. Brand and appearance follow their respective nearest scopes. The
local appearance chooses the semantic color pairs and sets native
`color-scheme`. A generated brand adapts its link, focus and info hues using
its own palette. Brand typography, geometry and filled action palettes still
use the configured values. Host overrides on the local scope win outside
Elea's cascade layers. For custom color pairs, place your CSS under that scope,
including the attribute selector that a portaled surface will receive.

Local appearance uses CSS `light-dark()`. Browsers without support retain the
existing document appearance. Tailwind utilities resolve the active Elea
tokens, and the built-in shadcn bridge rebinds its aliases at each local scope.
When generating custom CSS with `toStylesheet`, enable `localAppearance` and
supply light and dark color tokens to emit the same mechanism.

## Publication themes

Import `@alien6-studio/elea-tokens/editions.css` after `elea.css` and set
`data-elea-theme="precision"`, `"editorial"` or `"obsidian"` on a section to use a preset. The classes
`elea-precision`, `elea-editorial` and `elea-obsidian` do the same; the attribute is also what a dialog or
a toast of `@alien6-studio/elea-ui` copies from its container when it is rendered outside it.

The theme studio uses the same generator available at `@alien6-studio/elea-tokens/brand`.
Start from Precision, Editorial or Obsidian and choose a six-digit brand colour, corner style,
reading typeface and density. Generate the CSS once at build time and load it with
Elea’s styles. The optional second argument names the theme: `"journal"` answers to
`data-elea-theme="journal"` and to `class="journal"`.

```ts
import { brandPalettes, editions, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";

const { css, palettes } = makeBrandTheme({ ...editions.Editorial, ...brandPalettes.Plum }, "journal");
// Write css to a stylesheet and set data-elea-theme="journal" on the publication.
// palettes.primary and palettes.secondary contain { step, value } swatches.
```

The viewer reads the resulting font, line height and measure. Named editions
also supply light and dark surfaces, readable text and control treatments.
Spreading an edition keeps those choices while replacing its brand colour,
type or corners. Pass a brand configuration without an edition to use just
your own colour and type settings on the host’s surfaces.

`brandPalettes` offers Emerald, Cobalt, Copper, Plum and Lagoon. Each pair sets
only `seed` and `accent`. The generated `palettes.primary` spans 50–950 and
`palettes.secondary` spans 50–900. The exact seed and accent occupy step 500
and supply the default action fills. If a custom stylesheet used primary 600 or
secondary 700 to reference the entered brand colour, use the 500 step or the
corresponding `--elea-color-action-*` property. The ordered primary hex values
are also available in `colours`. Without an edition or accent,
`palettes.secondary` is empty and the CSS inherits that scale from the host.

Three optional fields open a theme to an existing identity: `font` takes the product's own
interface font as a CSS stack, `accent` a second six-digit colour that drives the secondary
ramp, and `radius` a free corner in `rem` or `px` that replaces the `corner` steps.

```ts
makeBrandTheme({ ...editions.Precision, seed: "#0f766e", accent: "#f2c94c", font: "var(--font-inter), system-ui", radius: "0.625rem" }, "product");
```

## Reference colours and semantic roles

`makeBrandTheme(createThemeProfile("braise"))` from the brand entry point generates
scoped CSS for Braise. Each profile
combines a colour scheme with a reading typeface, density, corner shape and
control treatment. Inspect these choices on `colorThemes.braise.profile`.

Named profiles supply four CSS shapes for actions, fields, surfaces and selection
indicators. For example, Réserve pairs a curved ultramarine action with a quiet
rectangular field. Use `--elea-shape-action`, `--elea-shape-control`,
`--elea-shape-surface` and `--elea-shape-indicator` as complete CSS
`border-radius` values. For a custom surface, use
`border-radius: var(--elea-shape-surface, var(--elea-radius-xl))`.
The scalar radius tokens remain lengths for individual corners and calculations.
A custom `radius`, a different `corner` preset, or `shape: undefined` returns
the profile to its scalar radii. Changing only the colours preserves the shape.
See the [runnable nine-profile example](../../docs/examples/theme-shapes.mjs).

Button's explicit `sm`, `md` and `lg` radii are uniform by default. To preserve
the profile’s curves at each step, opt in when generating the theme:

```ts
makeBrandTheme({ ...createThemeProfile("reserve"), buttonRadiusScale: "profile" }, "product");
```

Small and medium scale each axis and cap to 50% and 75% of its original value.
Large uses the profile’s action shape. For a full capsule the smaller steps
scale from a maximum of 1.5em. To supply your own shapes, set
`--elea-button-radius-sm`, `--elea-button-radius-md` and `--elea-button-radius-lg`
as complete CSS corner values on your scope or Button.

Set `controls` to `"flat"`, `"raised"` or `"inset"` to change the treatment
of buttons, fields and tabs independently of the palette.

`applyColorTheme(editions.Editorial, "rasance")` from the brand entry point applies
a colour theme while keeping the edition’s typography, spacing and corners.
Import `colorThemes` from the palette entry point to inspect each theme’s seven
key colours and its surface family.

| Profile ID | Primary, secondary and tertiary at 500 |
| --- | --- |
| `rasance` | Carbon, ivory, graphite |
| `reserve` | Ultramarine, chalk blue, ink violet |
| `braise` | Apricot, madder, dusty rose |
| `hors-champ` | Petrol, sky, vermilion |
| `hors-registre` | Tangerine, hot pink, turquoise |
| `echappee` | Signal red, stencil black, stone |
| `grand-bain` | Pool blue, stucco pink, diving-board yellow |
| `ponctuation` | Pumpkin yellow, jet black, sea grey |
| `lisiere` | Bay green, fabric pink, foliage |

These profiles use `Gray` for backgrounds, fields, menus, body text and borders.
Default surfaces run from white in light mode to `#151515` in dark mode.
Fjord, Cyanotype, Signal and Vellum retain their original surface families.

Import `colorFamilies` and `colorSteps` from `@alien6-studio/elea-tokens/palette`
to browse ELEA’s sixteen hue families. Each family contains eleven sRGB swatches
from 50 (lightest) to 950 (darkest). For surfaces, `surfaceFamilies` also
includes Gray, Ivory, Porcelain, Madder and Chalk. CSS-only consumers can import
`@alien6-studio/elea-tokens/palette.css` and use properties such as
`--elea-palette-amber-200`.

```ts
import { editions, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";

const { css, roles } = makeBrandTheme({
  ...editions.Precision,
  palette: {
    primary: { family: "Amber", step: 200 },
    secondary: { family: "Cobalt", step: 700 },
    tertiary: { family: "Violet", step: 500 },
    success: { seed: "#176c50" },
    neutral: "Slate",
  },
}, "journal");
```

An explicit reference assignment replaces the step-500 fill with the exact
selected shade. `makeBrandTheme(brand).roleScales` exposes the full 50–950
scale of each seeded or reference role. An inherited role has no entry.
For both seeded and reference colours, the foreground maintains
4.5:1 contrast across the resting, hover and pressed fills. Each action also has
a tinted container, a foreground for that container, and a readable ink for use
on the theme’s surfaces. Inspect the resolved hex values in `roles.primary?.light`
and `roles.primary?.dark`. In CSS use `--elea-color-action-primary` and the
suffixes `-text`, `-hover`, `-pressed`, `-container`, `-on-container` and `-ink`.
The same properties exist for secondary, tertiary, success, info, warning and
danger. Iterate `brandColorRoles` from the brand entry point to inspect them.
Tertiary and feedback roles accept an independent `{ family, step }` or
`{ seed: "#rrggbb" }` assignment. Existing status properties such as
`--elea-color-warning` use the assigned role’s readable ink, so icons, badges,
alerts and toasts follow the same choice. A neutral assignment maps the selected
family to the surface, text and border properties in both appearances.

Each assignment is optional. Editions start with Violet 500 as tertiary. Their
default feedback follows the existing status colours, including the edition’s
primary-derived info tone. Status action properties are optional CSS overrides.
For example, `background: var(--elea-color-action-warning, var(--elea-color-warning))`
lets a nested host override its warning colour when the theme has no warning assignment. A brand with no edition inherits unassigned tertiary
and feedback roles from its host. It also inherits secondary if it has no accent. The generated CSS includes reference values for
standalone use. If you override reference swatches in CSS, check contrast for
the new values.

## Groups

`color` (neutral, primary, secondary scales; success, warning, danger, info; semantic text, surface,
border, focus), `font` (family, size, weight, leading), `space`, `radius`, `shadow`, `size`.
