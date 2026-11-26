# Changelog

## Unreleased

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
