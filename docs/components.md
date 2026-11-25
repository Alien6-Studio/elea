# <span id="components">UI integration</span>

Add ELEA's React components to your app. [Browse the component gallery](/elea/playground/#/ui).

## Add a button

```tsx
import { Button } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-ui/bundle.css";

export function DraftActions({ saveDraft }: { saveDraft: () => void }) {
  return <Button onClick={saveDraft}>Save draft</Button>;
}
```

[Try Button states](/elea/playground/#/ui/button)

Use the UI and tokens packages at the same version. The UI bundle loads both stylesheets.

For a checkout, [build the npm archives](https://github.com/Alien6-Studio/elea/blob/main/docs/release.md#attestation) with `npm run check -- --pack-destination artifacts`. Run `npm install` in your app with the paths to both the UI and tokens `.tgz` files.

## Theme

Explore Rasance, Réserve, Braise and Hors champ in the [colour atlas](/elea/colours/). Each theme sets the palette, typography, spacing and control shapes. All four use white and light grey for reading surfaces, with neutral greys in dark mode. Adjust the theme and download its CSS in [Theme Studio](/elea/playground/#/theme).

Load the downloaded stylesheet after the UI bundle, then set `data-elea-theme="brand"` on your app container. See [how themes reach dialogs, sheets and toasts](https://github.com/Alien6-Studio/elea/tree/main/packages/ui#themes-and-surfaces-outside-their-container).

## Tailwind and shadcn/ui

With Tailwind v4, import the bundle in your main stylesheet and declare the layer order. This keeps Preflight below the components and lets utilities override them.

```css
@layer theme, base, elea, components, utilities;
@import "tailwindcss";
@import "@alien6-studio/elea-ui/bundle.css";
```

Add `@alien6-studio/elea-tokens/theme.css` to use ELEA's tokens in Tailwind utilities. See the [Tailwind v3 setup](https://github.com/Alien6-Studio/elea/tree/main/packages/ui#with-tailwind) and [shadcn/ui integration](https://github.com/Alien6-Studio/elea/tree/main/packages/tokens#projects-built-on-shadcnui).

## One sheet per component

For smaller stylesheets, load the tokens once and import the styles for each component you use.

```css
@import "@alien6-studio/elea-tokens/elea.css";
@import "@alien6-studio/elea-ui/css/button.css";
```

See the [stylesheet reference](https://github.com/Alien6-Studio/elea/tree/main/packages/ui#use) for shared sheets and form control refs.

## Motion

Set `data-elea-motion="on"` on a container to enable expressive motion. It respects the visitor's reduced-motion setting. If you import individual sheets, add `@alien6-studio/elea-ui/css/motion.css`. Try the Expressive motion switch in the [gallery](/elea/playground/#/ui).

## Footer

The site uses ELEA's `Footer` component. See the [Footer example](/elea/playground/#/ui/footer) for passing your own brand, link groups and signature.
