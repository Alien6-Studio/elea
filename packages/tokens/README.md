# @alien6-studio/elea-tokens

Design tokens of the Elea design system. The source is a [DTCG](https://tr.designtokens.org/format/)
JSON file; the package resolves its aliases and emits every form a project needs.

## What you get

- `tokens/elea.tokens.json` and `tokens/elea.dark.tokens.json`: the light and dark source files
  for tooling that transforms Elea tokens.
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

## Use

```css
@import "@alien6-studio/elea-tokens/elea.css";
/* Tailwind v4 projects, after the tailwindcss import */
@import "@alien6-studio/elea-tokens/theme.css";
```

Override tokens on `:root` or within a container, anywhere in your own styles: a rule outside
any cascade layer wins over the `elea.tokens` layer whatever the import order. Use
`--elea-color-text-on-brand` for the foreground on filled primary and secondary
controls. Check its contrast when changing the fill colors.

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

A CommonJS config loads it with `require("@alien6-studio/elea-tokens/tailwind")`. Tailwind v3
utilities are in no cascade layer, so a utility on an Elea component wins wherever `elea.css` is
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
import { editions, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";

const { css } = makeBrandTheme({ ...editions.Editorial, seed: "#31584a" }, "journal");
// Write css to a stylesheet and set data-elea-theme="journal" on the publication.
```

The viewer reads the resulting font, line height and measure. Named editions
also supply light and dark surfaces, readable text and control treatments.
Spreading an edition keeps those choices while replacing its brand colour,
type or corners. Pass a brand configuration without an edition to use just
your own colour and type settings on the host’s surfaces. Each theme returns its eleven primary shades in `colours`, ordered
from 50 to 950.

Three optional fields open a theme to an existing identity: `font` takes the product's own
interface font as a CSS stack, `accent` a second six-digit colour that drives the secondary
ramp, and `radius` a free corner in `rem` or `px` that replaces the `corner` steps.

```ts
makeBrandTheme({ ...editions.Precision, seed: "#0f766e", accent: "#f2c94c", font: "var(--font-inter), system-ui", radius: "0.625rem" }, "product");
```

## Groups

`color` (neutral, primary, secondary scales; success, warning, danger, info; semantic text, surface,
border, focus), `font` (family, size, weight, leading), `space`, `radius`, `shadow`, `size`.
