# <span id="components">UI integration</span>

Elea provides React primitives and styles for buttons, fields, selection
controls, sliders, cards, tables, accordions, alerts, toasts, avatars, progress bars,
dialogs, sheets, popovers, menus, pagination and footers. [Try the component examples](/elea/playground/#/ui).

## Theme

Use **Open themed gallery** in [Theme Studio](/elea/playground/#/theme) to try all 24 component guides with your configuration. Use **Edit theme** in any guide to return to those settings. The downloaded CSS uses the same theme scope as the demos.

[Open the theme studio](/elea/playground/#/theme) to adjust colour, typography, corners and reading density. To use a preset directly, import `@alien6-studio/elea-tokens/editions.css` after `elea.css` and set `data-elea-theme="precision"`, `"editorial"` or `"obsidian"` on your publication’s container. A dialog, a sheet or a toast opened from that container is rendered at the end of the page and copies the attribute, so it keeps the theme.

Each package ships a `bundle.css` that loads the tokens and what it depends on, in order: one
import per package. Override the `--elea-*` variables on a container or on `:root`, anywhere in
your own styles. The optional `theme.css` makes the same variables available to Tailwind v4
utilities.

A product keeps its own identity: `makeBrandTheme` also takes a `font` (any CSS font stack),
an `accent` colour for secondary buttons and a free `radius` in `rem` or `px`. The studio
exposes all three under “Your product’s identity”.

## Tailwind and shadcn/ui

Elea fits into a product that already runs on Tailwind, with or without shadcn/ui components.

| Your project | What to add |
| --- | --- |
| Tailwind v4 | `@import "@alien6-studio/elea-tokens/theme.css";` for utilities such as `bg-elea-surface-subtle` or `rounded-elea-lg` |
| Tailwind v3 | `presets: [elea]` from `@alien6-studio/elea-tokens/tailwind`, the same utility names |
| shadcn/ui on v4 | `@import "@alien6-studio/elea-tokens/shadcn.css";` in place of your `:root` and `.dark` palette |
| shadcn/ui on v3 | `shadcnPreset` from the same module, in place of the `hsl(var(--primary))` colours |

With the shadcn bridge, existing components keep their classes (`bg-primary`,
`text-muted-foreground`, `border-input`, `rounded-md`) and follow Elea's colours, dark mode
and brand themes. Opacity modifiers such as `bg-primary/50` keep working.

```ts
// tailwind.config.ts (v3)
import elea, { shadcnPreset } from "@alien6-studio/elea-tokens/tailwind";

export default { content: ["./src/**/*.{ts,tsx}"], presets: [elea, shadcnPreset] };
```

Every Elea rule sits in a cascade layer (`elea.tokens`, `elea.base`, `elea.components`), so a
rule of yours outside any layer wins over a component without `!important` or a doubled class,
wherever it is imported. Tailwind v4 keeps its rules in layers of its own, so one line is required:
declare the order once, before every import, and a utility such as `rounded-none` or `w-full` in
`className` applies.

```css
@layer theme, base, elea, components, utilities;
@import "tailwindcss";
@import "@alien6-studio/elea-ui/bundle.css";
```

Without that line the layers take the order of the imports. An Elea sheet imported before Tailwind
puts `elea` under `base`, and Preflight resets every component: buttons lose their background and
their border. The package check compiles such a host with Tailwind to keep this statement true.

Tailwind v3 utilities are in no layer and win as they are. A reset written outside any layer,
Tailwind v3's preflight included, overrides the components too: keep it in a layer declared
before Elea's, as in `@layer preflight, elea; @layer preflight { @tailwind base; }`.

## One sheet per component

`bundle.css` loads the tokens and `styles.css`, which holds every component. Each one also ships
its own sheet, named after it in kebab case, so a page loads only what it uses, with the tokens.
A sheet holds alone, in any order. Each component answers for its own size budget.

```css
@import "@alien6-studio/elea-tokens/elea.css";
@import "@alien6-studio/elea-ui/css/button.css";
@import "@alien6-studio/elea-ui/css/card.css";
/* Optional: the expressive motion switch */
@import "@alien6-studio/elea-ui/css/motion.css";
/* Optional: the gestures named by the effect prop of a button */
@import "@alien6-studio/elea-ui/css/button-effects.css";
```

`Toggle` lives in `checkbox.css`; `Input`, `Textarea` and `Label` in `field.css`. Without
`motion.css` a component stays still.

`Input`, `Textarea`, `Checkbox`, `Toggle` and the buttons forward their `ref` to the native
element, so `register()` from a form library spreads onto them.

## Motion

Durations and easings are tokens: `--elea-motion-duration-fast`, `-base` and `-slow`,
`--elea-motion-easing-standard`, `-exit` and `-spring`. Colour transitions always run.
Expressive motion is off until the page or a container opts in. Each component then has
its own gesture:

| Component | Gesture |
| --- | --- |
| Button, IconButton | Plays its `effect` on a damped spring: `lift`, `scale`, `push`, `shine`, `ripple`, `spotlight`, `magnetic` or `tilt` |
| Checkbox, Radio, Pagination | The mark, the dot and the current page pop into place; a press compresses the control |
| Toggle | The thumb stretches under the pointer and overshoots as it lands |
| Tabs | The selected tab draws its line from the centre and its panel slides in |
| Menu, Select | The list grows from its trigger and its items cascade |
| Tooltip | Springs out of the element it describes |
| Dialog | The panel springs up, its content cascades, the close button turns on hover |
| Sheet | The panel slides in from its edge, its content cascades, the close button turns on hover |
| Popover | The panel grows from its trigger |
| Field, Input | The error message slides in and an invalid control shakes once |
| Alert | The message springs in and its icon pops |
| Progress | The bar springs to its new value |
| Avatar | An avatar in a group rises under the pointer |
| Card | An interactive card lifts under the pointer |
| Skeleton | A light sweeps across the placeholder instead of the resting pulse |
| Accordion | A section unfolds and its chevron swings round, instead of opening at once |
| Table | The sort arrow swings to the new direction |
| Slider | The thumb grows under the pointer and while it is dragged |
| Toast | A toast springs in from its edge, its icon pops, and it sinks back as it leaves |

The [component gallery](/elea/playground/#/ui) has an Expressive motion switch
that applies to every guide.

```html
<body data-elea-motion="on">
  <aside data-elea-motion="off">Buttons here stay still.</aside>
</body>
```

The nearest `data-elea-motion` wins, and the `motion` prop sets it for a single `Button`,
`IconButton`, `Dialog` or `Sheet`. A dialog or a sheet is rendered in a portal: it follows its
own prop, or else the container it is rendered in. Nothing moves when the visitor prefers reduced motion.

## Footer

The footer on this site is rendered by the `Footer` component. The application
supplies the brand, link groups and signature.

```tsx
import { Footer } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-ui/bundle.css";

<Footer
  brand={<a href="/">Product</a>}
  groups={[{ label: "Resources", links: [{ label: "Documentation", href: "/docs/" }] }]}
>
  <a href="/about/">About the team</a>
</Footer>;
```
