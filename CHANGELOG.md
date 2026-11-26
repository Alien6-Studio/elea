# Changelog

## Unreleased

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
