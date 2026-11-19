# @alien6-studio/elea-ui

React primitives of the Elea design system, styled with Elea tokens only. Every label comes
through props, nothing is hard-coded, so any language and any product fits.

## Use

```tsx
import { Button, Field, Input, Dialog } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-ui/styles.css";
```

## Components

- `Button` (primary, secondary, outline, ghost, danger; sizes; icons; loading) and `IconButton`
  named by `label`; a `Button` with `href` renders a link.
- `Badge` with tones and solid, subtle or outline variants.
- `Field` wiring a label, help text and error to any control through ARIA, with `Input`,
  `Textarea` and `Label`.
- `Checkbox` (indeterminate supported) and `Toggle` (a native checkbox exposed as a switch).
- `Dialog` (focus trap, Escape, backdrop, focus return) and `ConfirmDialog`.
- `Menu` dropdown with keyboard navigation and outside-click dismissal.
- `Tooltip` on hover and focus, described through `aria-describedby`.
- `Pagination` with a sliding window, previous and next, optional summary.

`Dialog`, `Menu` and `Tooltip` hold state and carry `"use client"`; the others render anywhere.
