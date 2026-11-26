# Changelog

## Unreleased

- Set `data-elea-density` on a region to coordinate controls, field spacing, menus and table rows. The optional `@alien6-studio/elea-tokens/typography.css` stylesheet adds seven interface type roles.
- Stepper, StepperPanel and StepperSkeleton forward native root attributes and refs. With motion on, Dialog and Sheet animate their exit. Focus and page scroll return immediately, and reopening interrupts the exit. Six motion intentions can be tuned independently.
- Popovers reposition when their content grows. This keeps the last week of an opened DateField in view on small screens. MultiSelect skips the popup scroll container during Tab navigation.
- The optional tokens `/qualification` entry reports resolved foreground/background contrast by role, state and appearance and compares two reports.
- The tokens package adds standalone light and dark DTCG 2025.10 documents under `dtcg/2025.10/`. The [Style Dictionary example](docs/examples/dtcg/qualify.test.mjs) builds CSS from both and checks alias resolution.
- The classic editor draws its focus ring around the complete frame. Set `--elea-color-focus` and `--elea-color-selection` to brand focus and text selection. Use `width="full"` and `--elea-editor-canvas-height` to fit a form field.
- `ContentEditor` accepts a plain-text `maxLength` and shows a character counter. Use `htmlToBlocks` when opening an HTML field and `blocksToHtml` when saving it.

## 0.1.2 - 2026-11-26

- The UI package adds `SirenInput`, `SiretInput`, `IbanInput` and `CardNumberInput` with individually editable blocks, whole-value paste and compact form values. IBAN block sizes follow the country prefix and the card number field recognizes Visa, Mastercard and American Express. The `/formats` entry also provides the four presets for single-field entry with `Input`.
- `@alien6-studio/elea-ui/phone` adds `PhoneInput` with country search, national formatting and E.164 form submission. Applications using this entry install the optional `libphonenumber-js` peer.
- The UI package adds `MultiSelect` for searchable tags, `DateField` for localized date entry and calendar selection, and `Breadcrumb` for collapsible trails with router links.
- `Input` and `Textarea` accept an optional soft character counter. `Input` also accepts a digit mask for fixed-format identifiers.
- The UI package adds `Stepper` for sectioned forms and wizards. It supports free or linear navigation, keyboard controls and labelled badges. `StepperSkeleton` covers loading and `StepperPanel` provides previous, next and final actions.

Upgrade the ELEA packages your application uses together. Existing forms can adopt the new controls individually. In React Server Components, pass serializable props to `Input` and `Textarea` and define custom formatters or callbacks in a Client Component.

## 0.1.1 - 2026-11-26

- The content editor’s image block now accepts `imageCrop.formats` for an on-demand format picker and movable crop area. Set `imageCrop.outputSize` for exact export dimensions. English and French labels are included.
- The media cropper accepts named ratio and pixel-size presets. Provide corner labels for four resize handles and a rule-of-thirds guide. Save the recipe returned by `onConfirm` and pass it as `initialCrop` to reopen the original image. The editor exposes this through `imageCrop.resolveOriginal` and the upload callback.
- Button and IconButton accept a `tone` for solid, outline and ghost treatments, including a neutral solid. Existing colour variants remain available as shorthands. Button links accept a `render` callback for client-side routing and use an inactive anchor when disabled or loading.
- The package guides include Jest setup for Next.js applications consuming ELEA’s ES modules. The UI guide shows how to retain asymmetric corners at different button sizes.

Upgrade the ELEA packages your application uses together. The new button and cropper options are opt-in and existing image blocks need no migration.

## 0.1.0 - 2026-11-26

Initial public release of the six ELEA packages under one version.

- `@alien6-studio/elea-tokens` provides the design tokens, runtime CSS custom properties, Tailwind v4 theme, colour palettes, theme profiles with component shapes, and the optional `makeBrandTheme()` generator. A generated brand keeps uniform corners unless you opt in with `shape`; set `buttonRadiusScale: "profile"` to scale explicit Button radii from the profile.
- `@alien6-studio/elea-ui` provides the React primitives and layouts, including form controls, Combobox, Calendar, Carousel, colour picker, overlays and pagination.
- `@alien6-studio/elea-content` provides the EditorJS-compatible block model, registry, sanitization and text extraction.
- `@alien6-studio/elea-content-viewer` renders block documents on the server or the client.
- `@alien6-studio/elea-content-editor` provides the block editor. The host supplies uploads and attachment picking.
- `@alien6-studio/elea-media` provides the file drop zone, image cropper and crop geometry, with the interactive mask and format picker loaded on demand.
- Install the packages you use at the same version. React components support React 18 from 18.3.1 and React 19.

For applications moving from a development build, recheck the silhouettes produced by `createThemeProfile()`, especially Réserve’s asymmetric buttons. Omit `shape` when generating a brand to retain the previous corner treatment. The Combobox now exposes its highlighted option to assistive technology while browsing. Enter or a click commits the choice. The cropper’s move and resize controls expose the current position and dimensions as accessible descriptions.
