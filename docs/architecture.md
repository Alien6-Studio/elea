# Elea architecture

Elea is a design system built to be a reference: highly configurable, easy to integrate, light
in the way shadcn/ui and Radix are light, and rich where products need richness, content first.
This document is the map: the layers, what each one promises, and the direction of travel.

## Positioning

| | Radix | shadcn/ui | Elea |
| --- | --- | --- | --- |
| Behaviour | headless primitives | Radix underneath | headless hooks, exported |
| Styling | none | Tailwind classes copied into the app | CSS on tokens, one stylesheet per package |
| Distribution | npm | copy into the codebase | npm, with the stylesheet as the only coupling |
| Theming | by the host | CSS variables, one theme at a time | token collections, generated, switchable at runtime |
| Content | none | none | document model, viewer, editor, media |

Elea ships components as packages because products upgrade more often than they fork. The
styles are plain CSS on `--elea-*` variables, so a product owns its look without owning the
code, and a host that wants the code can still copy a component: nothing is hidden in a
runtime.

## Layers

```
tokens        DTCG source → CSS variables, Tailwind theme, typed access      no runtime
themes        collections of role mappings, generated from a few seeds       no runtime
content       document model, sanitization, links, Markdown, HTML, messages  any runtime
headless      behaviour as hooks and keyboard contracts, no markup           React, no DOM styling
ui            thin React primitives on the headless layer and the tokens     React
media         drop zone, cropper, and the crop geometry                      React
content-viewer, content-editor  the content stack rendered                   React
```

Rules between layers:

- A layer never reads a hard-coded value: colors, sizes, radii, shadows and families are
  tokens. A product themes Elea by overriding variables, in any scope.
- Logic lives below React. Parsing, sanitizing, link rules, crop geometry, pagination ranges and
  token generation are plain functions, tested without a DOM, so another rendering layer can
  follow React.
- Labels come from the host. No package carries text of its own; messages ship as data.
- The server renders what can be rendered: the viewer, the primitives that have no state and
  the drop zone work in React server components. Client boundaries sit inside the packages.
- Each package has a size budget checked in CI, and an independent consumer project installs
  the packed archives on React 18 and 19 before anything ships.

## Themes as collections

A theme is a collection: a named mapping of every semantic role (`color.text.default`,
`color.surface.subtle`, `radius.md`, `font.family.content`, ...) to a value, in a light and a
dark variant. The shipped tokens are one collection. Products add theirs.

Collections come from a generator rather than from hand-picked hex values:

```ts
import { createTheme } from "@alien6-studio/elea-themes";

const ink = createTheme({
  name: "ink",
  primary: "#4f46e5",        // one hue; the scale and the roles follow
  neutral: "slate",          // a tint for the greys
  radius: "soft",            // none | sharp | soft | round
  fonts: { sans: "Instrument Sans Variable", content: "Source Serif 4 Variable" },
  contrast: "aa",            // every text role checked against its surface
});
```

The generator builds perceptual scales in OKLCH from the seed, derives the roles for both
variants, checks the contrast of every text role on every surface it is used on, and emits the
same artefacts as the base tokens: a DTCG file, a stylesheet scoped to `[data-theme="ink"]`, a
Tailwind theme. Switching is an attribute on any element, so a page can host two themes at
once and a product can let people pick theirs.

The documentation site will carry the generator as a page: pick the seeds, watch every
component follow, export the collection.

## Configurability without weight

- Tokens are the public API of the look. Component class names are stable and documented, so a
  host can restyle a component with a stylesheet of its own.
- Behaviour is reusable without the markup: `useDialog`, `useMenu`, `useTooltip`, `useCropper`
  expose the state machines the components are built on.
- Composition over configuration: a component takes a few props and children, not a hundred
  options. Variants are tokens and class names, not code paths.
- No runtime styling, no CSS-in-JS, no global side effect beyond one stylesheet import per
  package. DOMPurify is the only runtime dependency, for sanitization.

## Rich components

The content stack is the first rich family: a block document model that loads EditorJS
content, a viewer for server components, an editor with the habits of a modern writing tool,
media handling with framing before upload. The families that follow come from the same
discipline, extracted from real products: side panels, steppers, tag and date inputs,
checklists, command palettes, data tables with pagination and sorting.

## Roadmap

1. Themes: the `elea-themes` package with the generator, three shipped collections, the
   generator page on the site, runtime switching documented.
2. Headless layer: the hooks behind Dialog, Menu, Tooltip and the cropper exported from their
   packages, documented with keyboard contracts.
3. Per-component stylesheets next to the package stylesheet, for hosts that ship a subset.
4. Component families from products, one family per release, each with its stories, tests and
   page on the site.
