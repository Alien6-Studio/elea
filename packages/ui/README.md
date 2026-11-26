# @alien6-studio/elea-ui

React primitives of the Elea design system, styled with Elea tokens only. Every label comes
through props, nothing is hard-coded, so any language and any product fits.

This package ships ES modules only. For Jest with `next/jest`, add `@alien6-studio/elea-ui` to `transpilePackages`.

## Use

```tsx
import { Button, Field, Input, Dialog } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-ui/bundle.css";
```

> **Required with Tailwind v4.** State the order of the layers once, before every import, Elea's
> included:
>
> ```css
> @layer theme, base, elea, components, utilities;
> ```
>
> Without this line, a host that imports an Elea sheet before Tailwind gets `elea` below Tailwind's
> `base`: Preflight then wins over every component, and buttons lose their background and their
> border. See [With Tailwind](#with-tailwind).

Stylesheets are never imported by a component: the host chooses one of two ways.

- The bundle, one import: `bundle.css` loads the tokens of `@alien6-studio/elea-tokens`, then
  `styles.css`, which holds every component.
- The tokens and the sheets a page uses:

```ts
import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-ui/css/button.css";
import "@alien6-studio/elea-ui/css/card.css";
// Optional: the expressive motion switch
import "@alien6-studio/elea-ui/css/motion.css";
// Optional: the gestures named by the `effect` prop of a button
import "@alien6-studio/elea-ui/css/button-effects.css";
```

A sheet is named after its component in kebab case (`radio-group.css`); `Toggle` lives in
`checkbox.css`, `Input`, `Textarea` and `Label` in `field.css`. Each sheet holds alone: it needs
the tokens and nothing else, in any order. Without `motion.css` a component stays still, which is
also what it does while motion is off.

`Input`, `Textarea`, `Checkbox`, `Toggle` and `IconButton` forward their `ref` to the native element.

### Overriding

Every Elea rule sits in a cascade layer: `elea.tokens`, `elea.base` or `elea.components`. A rule
of the host that is in no layer wins over them whatever its specificity and wherever it is
imported, so `.my-button { border-radius: 0 }` is enough: no `!important`, no doubled class.

The same holds for a reset. A host that sets `button { background: none }` or `a { color: … }`
outside any layer now overrides Elea's components too; keep such rules in a layer declared before
Elea's:

```css
@layer reset, elea;
@layer reset {
  button { background: none; }
}
```

### With Tailwind

Tailwind v4 keeps its own rules in layers. Declare the order once, before any import, with `elea`
between `base` and `components`; the imports can then come in any order.

```css
@layer theme, base, elea, components, utilities;
@import "tailwindcss";
@import "@alien6-studio/elea-ui/bundle.css";
```

Preflight then stays under Elea, and a utility in `className`, such as `rounded-none` or `w-full`,
wins over the component.

The line is not optional. Layers are ordered by their first mention: without it, an Elea sheet
imported before Tailwind puts `elea` under `base`, where Preflight resets every component, and one
imported after puts it above `utilities`, where no utility overrides a component any more.

Tailwind v3 writes its utilities outside any layer, so they already win. Its preflight does too:
put it in a layer declared before Elea's.

```css
@layer preflight, elea;
@layer preflight {
  @tailwind base;
}
@tailwind components;
@tailwind utilities;
```

### Themes and surfaces outside their container

A dialog, a sheet and the toasts are rendered at the end of the body, out of reach of the tokens a
container sets. Name the theme with `data-elea-theme` on the container: each of these surfaces
copies the value of the nearest one, with the nearest `data-elea-motion`, onto its own root.

```tsx
<section data-elea-theme="editorial">
  <Dialog open={open} onClose={close} title="Share" closeLabel="Close" />
</section>
```

```css
[data-elea-theme="editorial"] {
  --elea-color-action-primary: #1637a1;
  --elea-color-action-primary-text: #ffffff;
}
```

The editions and the brand themes of `@alien6-studio/elea-tokens` answer to this attribute. A
dialog or a sheet reads the place it is rendered at, marked by an empty `<template>`; the toasts
read the place of their `ToastProvider`, which also takes a `theme` when it sits above the themed
container. Tooltips, popovers and menus stay inside their container and inherit from it.
`scopeOf(element)` and `useSurfaceScope()` give the same to a surface of your own.

## Buttons

Use `variant` for emphasis and `tone` for the colour role. A solid surface fills with
the theme colour. Outline and ghost use the tone for text and interaction states.
A plain `Button` is solid primary. Existing colour variants are solid shorthands, so
`variant="danger"` and `variant="solid" tone="danger"` give the same result.

```tsx
import { Button } from "@alien6-studio/elea-ui";

const tones = ["primary", "secondary", "tertiary", "neutral", "danger", "warning", "success", "info"] as const;
const variants = ["solid", "outline", "ghost"] as const;

export function ActionPalette() {
  return variants.map(variant => (
    <fieldset key={variant}>
      <legend>{variant}</legend>
      {tones.map(tone => <Button key={tone} variant={variant} tone={tone}>{tone}</Button>)}
    </fieldset>
  ));
}
```

### Router links

Pass an `href` and a `render` callback to use the host router. Forward the button's
props, including its children and event handlers, and map `href` to the router's
destination. When disabled or loading, ELEA supplies an unfocusable anchor with
`aria-disabled="true"` and no destination. It skips the callback for that state.

```tsx
import { Button, type ButtonLinkRenderProps } from "@alien6-studio/elea-ui";
import { Link } from "react-router";

const routeLink = ({ href, ...props }: ButtonLinkRenderProps) => <Link {...props} to={href} />;

export function ArticleLinks() {
  return <>
    <Button href="/articles" render={routeLink}>Browse articles</Button>
    <Button href="/drafts" render={routeLink} disabled>Drafts unavailable</Button>
  </>;
}
```

### Asymmetric corners

Set `--elea-shape-action` for the theme's action silhouette. On a closer container,
`--elea-control-radius` takes precedence for an inherited or medium button radius.
Supply four CSS lengths in clockwise order, starting at the top left. The
`--elea-button-radius-sm`, `-md` and `-lg` tokens apply when the matching
`radius` prop is explicit. The `size` prop controls the button's dimensions independently.

```css
.publication {
  --elea-shape-action: 1.5rem 0.25rem 1rem 0.5rem;
}
.publication .elea-button--sm {
  --elea-button-radius-sm: 0.75rem 0.125rem 0.5rem 0.25rem;
}
.publication .toolbar {
  --elea-control-radius: 0.25rem 1rem 0.5rem 0;
}
```

```tsx
<section className="publication">
  <Button>Publish</Button>
  <Button size="sm" radius="sm">Save draft</Button>
  <div className="toolbar"><Button>Filter</Button></div>
</section>
```

## Components

- `Button` supports links, loading states and leading or trailing icons, in five sizes from `xs` to `xl`,
  with a `radius` from square to pill and an optional resting `shadow`. `IconButton` takes an accessible
  `label` and offers a neutral circular `variant="disc"` for toolbar or overlay actions.
  Use `variant="tertiary"` for an action in the theme's third brand colour.
- Under expressive motion a button moves on a damped spring and plays the gesture named by `effect`:
  `lift` (default), `scale`, `push` and `shine`, plus four that follow the pointer: `ripple`,
  `spotlight`, `magnetic` and `tilt`. An effect does nothing while motion is off.
- Expressive motion is off by default: set `data-elea-motion="on"` on the page or any container,
  `"off"` to exclude a subtree. Each component then has its own gesture: buttons play their `effect`
  and spring back from a press, check marks and the current page pop, the toggle
  thumb stretches and overshoots, the selected tab draws its line, menus and listboxes grow from their
  trigger and cascade their items, tooltips and dialogs spring in, an invalid field shakes. `Button`, `IconButton`, `Dialog` and `Sheet` also take a `motion` prop; a dialog or a sheet
  is rendered in a portal and follows its own prop, or else the container it is rendered in. Nothing of it runs under `prefers-reduced-motion: reduce`.
- `Badge` with tones and solid, subtle or outline variants.
- `Carousel` shows one item at a time, or as many as fit when given a
  `minItemWidth` in CSS pixels. Give it `items`, a stable `itemKey`,
  `renderItem` and translated `label`, `previousLabel` and `nextLabel`.
  Start at `defaultIndex` or control the first visible item with `index`
  and `onIndexChange`. Arrow keys, Home, End and touch swipes navigate.
  Set `loop` to wrap at either end. In a collection of buttons or links,
  return each action directly from `renderItem` to support arrow-key focus.
  Only visible items are mounted. The server renders the initial specimen,
  and navigation appears after hydration.
  Set `itemsPerView` for a fixed count, or combine it with `minItemWidth`
  to cap a responsive row. Choose `gap` from `none`, `sm`, `md` (default)
  or `lg`. Navigation defaults to arrows with a counter at the top end.
  Set `navigation="dots"` or `"both"` for direct access to positions.
  `getDotLabel(index)` returns a localized label for each starting index.
  Long collections show a compact window of dots around the current position.
  `showCounter` controls the visible counter. Place controls below with
  `controlsPosition="bottom"` and align them with `controlsAlign="start"`,
  `"center"` or `"end"`.
- `Field` wiring a label, help text and error to any control through ARIA, with `Input`,
  `Textarea` and `Label`. `Input` and `Textarea` forward their `ref`, so `register` from a form
  library spreads onto them.
- `Checkbox` (indeterminate supported) and `Toggle` (a native checkbox exposed as a switch).
- `RadioGroup` for a single choice with a visible legend, optional descriptions and native form
  validation. Pass `name`, `label` and `options`. Use `defaultValue` for an uncontrolled form
  or `value` and `onChange` for a controlled selection.
- `Dialog` (focus trap, Escape, backdrop, focus return) and `ConfirmDialog`, which takes a `tone`
  (`danger`, `primary`, `success`, `info`) and an optional `icon`. For another header, body
  or footer, compose `DialogRoot` with `DialogHeader`, `DialogTitle`, `DialogClose`,
  `DialogDescription`, `DialogBody` and `DialogFooter`.
- `Sheet`, a dialog docked to an edge of the viewport (`side`, `size`) whose body scrolls between its
  header and its actions. `SheetRoot` takes the same parts as `DialogRoot`.
- `Popover`, a panel anchored to its trigger for a short form or details: not modal, closed by
  Escape, an outside click or focus moving away, controlled or not. The panel is rendered in the top
  layer, so a scrolling or clipping ancestor does not cut it; it flips and shifts to stay inside the
  viewport, follows its anchor on scroll and resize, and closes when the anchor leaves the view.
  Instead of `trigger`, pass `anchor` (an element, or any object with `getBoundingClientRect`) with a
  controlled `open`, so that one popover serves every row of a list. A click in the panel stops
  there: declared in a clickable row or card, the popover does not activate it.
- `ConfirmPopover`, a confirmation anchored the same way: an alert dialog with `title`,
  `description`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `loading`, and the `tone`
  and `icon` of `ConfirmDialog`. Focus opens on the cancel button, Escape and an outside click
  cancel, and focus returns to the anchor.
- Both confirmations take an optional `field` to collect a value with the answer: a reason, a
  comment, a name typed to confirm. `field={{ label: "Reason", placeholder: "Optional" }}` shows a
  labelled input between the description and the actions, and `onConfirm` receives its trimmed
  value; without `field`, `onConfirm` is called with no argument. `multiline` makes it a textarea,
  `maxLength` and `defaultValue` are passed on, `required` keeps the confirm button disabled while
  the field is empty and `expected` until the trimmed value is exactly that string. Focus starts in
  the field, Enter confirms from a single line and Ctrl+Enter or Cmd+Enter from a textarea,
  `loading` disables the field with the buttons, and the value starts over each time the
  confirmation opens. While the confirm button is disabled it is described by the label of the
  field, so write the label as what is asked ("Type the name of the project to delete it"). The
  field uses the styles of `Field`: with per-component sheets, load `css/field.css` too.
- `Menu` dropdown with keyboard navigation and outside-click dismissal, from a list of items. For
  separators and groups, compose `MenuRoot`, `MenuTrigger`, `MenuContent`, `MenuItem`,
  `MenuSeparator` and `MenuGroup`.
- `Tooltip` on hover and focus around any children, text included. The pointer can move onto the hint and Escape
  dismisses it. The hint exists only while shown, above clipping
  containers and inside the viewport, and its wrapper generates no box, so a truncated trigger stays truncated.
- `Pagination` with a sliding window, previous and next, optional summary. `showLabels` writes
  `labels.previous` and `labels.next` beside the arrows, which are mirrored in right-to-left; the
  navigation then measures its own width, and in a narrow one the text gives way to the arrows
  alone, the accessible names staying.
- `Select` for a single choice or a checklist.
- `ColorPicker` pairs a native colour swatch with a hex input. Supply `value`, `onChange`,
  `label`, `hexLabel` and `invalidMessage`. The swatch applies immediately. Enter or blur applies
  a six-digit hex value (with or without `#`), and Escape cancels an edit. Both inputs support `disabled`.
- `Combobox` filters labelled options as the user types. Pass `options`, the controlled `value`,
  `onChange`, `label` and `emptyMessage`. The search hint defaults to `label`.
  Pass a localized `placeholder` to customize it or `""` to omit it. Its optional `name` submits the selected value.
- `Calendar` selects one Gregorian day as a `YYYY-MM-DD` string. Supply `value`, `onChange`,
  `locale`, `label` and translated `labels.previousMonth` and `labels.nextMonth`.
  Use `min` and `max` for inclusive bounds. Pass a value or a `YYYY-MM` `defaultMonth` to
  render the grid on the server. With neither supplied it opens to the user's local month on mount.
- `Tabs` for keyboard-navigable panels. Supply labelled items and use `keepMounted` to retain
  form state when switching panels. When the list and the panels sit apart, or a tab holds more than
  a label, compose `TabsRoot`, `TabList`, `Tab` and `TabPanel`.
- `Card` in outline, elevated or subtle variants, with `CardImage`, `CardHeader`, `CardTitle`, `CardDescription`,
  `CardContent` and `CardFooter`. With `interactive`, the link in its title covers the whole card.
  `CardImage` accepts native image attributes, including `srcSet`, `sizes`, intrinsic dimensions and a required `alt`.
- `Separator`, horizontal or vertical, decorative by default, with an optional label as children.
- `Skeleton` placeholders (`text`, `rect`, `circle`, several `lines`, a `count` of stacked blocks),
  hidden from assistive technology. `className` names what holds the lines or the blocks, and
  `blockClassName` every placeholder, so that a class of the host theme reaches each of them. Around children, `<Skeleton loading={pending}>` keeps them in the
  layout, out of sight and out of reach, and paints them as the placeholder: the size comes from the
  real content, so nothing moves when it arrives.
- A companion skeleton next to each component with a stable shape, built from the component itself
  and so on the same size tokens: `CardSkeleton` (optional `media`, title, description, `lines`,
  `footer`), `AvatarSkeleton`, `ButtonSkeleton`, `BadgeSkeleton`, `FieldSkeleton` and `TableSkeleton`
  (`rows` × `columns`).
- `SkeletonRegion` around what loads: it sets `aria-busy`, announces one `label` for every placeholder
  inside, and takes a `delay` before they show, so a fast load never flashes them.
- `Avatar` showing a picture, or the initials of `name` when it is missing or fails to load, and
  `AvatarGroup` stacking them with a `+n` count past `max`.
- `Alert` in six tones, announced as an alert for `danger` and `warning` and as a status otherwise,
  with a title, an icon, actions and an optional dismiss button labelled by `dismissLabel`.
- `Progress` for a measured value or, without `value`, an indeterminate wait, with a visible label
  and value.
- `Table` composed from `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell`, which
  scrolls sideways inside its own region instead of widening the page: densities, striped and
  hoverable rows, a sticky header, selected rows and sortable headings that state `aria-sort`.
- `Accordion` for sections that fold under their heading, one at a time or `multiple`, with a
  heading level that fits the page outline.
- `Slider`, a native range input with a filled track, a visible label and a worded value.
- `ToastProvider` and `useToast` show brief messages with themed tones, an optional icon and an
  action. Toasts pause while hovered or focused and can be replaced under a shared `id`.
- `Footer` with a brand slot, labelled link groups and a row for a signature or legal links.

Components ship their skeleton and pages compose them: a component with a stable shape exports its
companion, built from its own markup so the two cannot drift apart, and a page lays those companions
out the way it lays out the loaded components. The library holds no page-level skeleton, since the
shape of a page belongs to the application.

`Accordion`, `Avatar`, `Calendar`, `Carousel`, `ColorPicker`, `Combobox`, `Dialog`, `Menu`, `Popover`, `Select`, `Sheet`, `SkeletonRegion`, `Slider`, `Tabs`, `ToastProvider` and `Tooltip` carry a `"use client"` boundary. With
React Server Components, keep components with interaction callbacks in a client
component. Display-only elements like `Badge` can render on the server.


## Portals and local appearance

Apply `data-elea-appearance` on a DOM or JSX container. Dialog, Sheet and
Toast carry the nearest valid appearance into their portal, along with the
independently resolved theme and motion attributes. Changes to those
attributes on the origin's ancestors update an open portal without reopening
it. The document remains the fallback when no local appearance is set.
Popover, Tooltip, Menu and Select remain in their DOM scope, including when
the browser places a surface in the top layer.

When portaling a custom surface, spread the second value from
`useSurfaceScope()` and attach the first value as a ref to a stable element
at the origin. `scopeOf(element)` reads a snapshot for rendering code that
already manages updates. A brand class alone can style the local tree. Use
the corresponding `data-elea-theme` attribute where a portal must retain
that brand.


## Scoped control styling

The released control styles accept optional CSS custom properties on the
control or a surrounding region. Apply a treatment without changing the
brand tokens that supply colors and type. Omitting the optional properties
keeps the built-in size and interaction styles. Keep the host's box-sizing
rules in force. Use border-box on controls to align their outer heights.

| Properties | Controls |
| --- | --- |
| `--elea-shape-action`, `--elea-shape-control`, `--elea-shape-surface`, `--elea-shape-indicator` | Optional theme profiles for buttons, fields, panels and compact selections. Accept CSS `border-radius` shorthands, including elliptical corners. |
| `--elea-control-height`, `--elea-control-padding-inline`, `--elea-control-font-size` | Button, IconButton, Input, Select trigger, and tab button. Textarea takes inline padding and font size, with `--elea-textarea-min-height` for its block size. |
| `--elea-control-radius`, `--elea-control-border` | Radius for actions, fields, the Select trigger and segmented tabs. Border color for outline actions, fields and the Select trigger. A host radius overrides the theme shape and the medium Button radius. |
| `--elea-button-radius-sm`, `--elea-button-radius-md`, `--elea-button-radius-lg` | Corners for explicit Button radii. By default, Square shape profiles use 0.25, 0.375 and 0.75 rem. Other themes use their scalar sm, md and xl radii. With `buttonRadiusScale: "profile"` in the brand, each step follows the active action shape. Omitting the Button's `radius` uses the full action shape. |
| `--elea-control-surface`, `--elea-control-outline-surface`, `--elea-control-hover-surface` | Field and alternate tab track fill, outline action fill, and hover color for enabled fields, outline actions and tabs. Filled action colors still follow their semantic variant. |
| `--elea-field-border-width` | Border width on Input, Textarea and the Select trigger. Accepts the CSS border-width shorthand. |
| `--elea-control-edge`, `--elea-control-press-shadow` | A resting box shadow on actions and fields and a selected segment. The press shadow applies to primary, secondary, tertiary and outline buttons. An explicit Button shadow takes precedence at rest. |
| `--elea-control-focus-outline`, `--elea-control-focus-shadow` | Full CSS outline shorthand for controls, navigation and interactive cards, and box-shadow for field focus. Retain a visible focus indicator. |
| `--elea-tabs-font-family`, `--elea-tabs-selected-surface`, `--elea-tabs-panel-padding` | Tabs font, selected surface and block-axis panel padding. |

Precision uses segmented tabs, Editorial uses an underline, and Obsidian uses a rail.
Set `presentation` on Tabs or TabList to choose a treatment explicitly. Standalone
Tabs and browsers without CSS style queries use an underline when the prop is omitted.
Each presentation uses the same selection, keyboard, disabled and ARIA behavior.

```css
.review-controls {
  --elea-control-height: 2.625rem;
  --elea-control-padding-inline: .875rem;
  --elea-control-radius: .5rem;
  --elea-control-surface: var(--elea-color-surface-subtle);
  --elea-control-focus-outline: 2px solid var(--elea-color-focus);
}
```

To change the height or font of a single size, scope the override to those controls.
The built-in editions retain each component’s size scale. The medium disc has a
44px target by default for touch controls.

For portal controls, declare those variables on the theme attribute that
the portal copies. A class or inline variable on a source ancestor only
affects that DOM subtree.
