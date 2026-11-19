# @alien6-studio/elea-tokens

Design tokens of the Elea design system. The source is a [DTCG](https://tr.designtokens.org/format/)
JSON file; the package resolves its aliases and emits every form a project needs.

## What you get

- `tokens/elea.tokens.json` and `tokens/elea.dark.tokens.json`: the sources, usable by Style
  Dictionary, Figma plugins or any DTCG tool.
- `elea.css`: the runtime stylesheet. Every token is a custom property on `:root`
  (`--elea-color-text-default`, `--elea-space-4`, `--elea-radius-lg`...); the dark overrides apply
  under `prefers-color-scheme: dark` unless the page sets `data-theme="light"`, and always under
  `data-theme="dark"`.
- `theme.css`: a Tailwind v4 `@theme` block whose values point at the runtime variables, so
  `text-elea-text-muted`, `bg-elea-surface-subtle`, `rounded-elea-lg` or `p-elea-4` follow the
  active theme.
- TypeScript: `tokens`, `darkTokens`, `cssVar("color.text.default")` and the functions that
  produce the CSS (`toStylesheet`, `toTailwindTheme`) for custom themes.

## Use

```css
@import "@alien6-studio/elea-tokens/elea.css";
/* Tailwind v4 projects, after the tailwindcss import */
@import "@alien6-studio/elea-tokens/theme.css";
```

Override any token on your own `:root` after the import to theme a project.

## Groups

`color` (neutral, primary, secondary scales; success, warning, danger; semantic text, surface,
border, focus), `font` (family, size, weight, leading), `space`, `radius`, `shadow`, `size`.
