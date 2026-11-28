# Versions and changes

The packages share one version; install the ones you use at the same
version. This site follows development on `main`. For a shipped version, open
its release: it links the package guides, the examples and the upgrade notes
at that tag.

| Version | What it adds | Check before upgrading |
| --- | --- | --- |
| [0.1.5](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.5) | [Observe](observe.md), a new package for registered interaction events kept in memory. A [page layout](https://github.com/Alien6-Studio/elea/tree/main/packages/ui#page-layout) grid and [measurement displays](https://github.com/Alien6-Studio/elea/tree/main/packages/ui#measurement-displays) in the UI package. | Nothing: the additions are opt-in. |
| [0.1.4](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.4) | One rule for nested corners, from [Geometry of Interfaces](research/geometry-of-interfaces.md). `blockTypes` and `marks` restrict the editor for a [form field](/playground/#/ui/field). [Content comparison](/playground/#/ui/content-comparison) and [Save status](/playground/#/ui/save-status). New options on [Menu](/playground/#/ui/menu), [Dialog](/playground/#/ui/dialog), [Stepper](/playground/#/ui/stepper) and [Alert](/playground/#/ui/alert). | Default rendering changes: compare screens with segmented tabs, cards, the classic editor or `buttonRadiusScale: "profile"`. If you pass `blockTypes`, check stored documents. |
| [0.1.3](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.3) | `Hero`, `Navbar`, `Sidebar`, `SearchField`, `SearchAutocomplete` and `ResponsiveImage`. Regional density, interface type roles, theme qualification and DTCG 2025.10 documents. | Nothing: the additions are opt-in. |
| [0.1.2](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.2) | `Stepper`, `Breadcrumb`, `MultiSelect`, `DateField`, `PhoneInput` and segmented identifiers for SIREN, SIRET, IBAN and card numbers. | In React Server Components, pass serializable props to `Input` and `Textarea`. |
| [0.1.1](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.1) | A `tone` and router links on buttons. Crop presets, a saved framing and named export formats in the cropper. | Nothing: the options are opt-in. |
| [0.1.0](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.0) | The initial release of the six packages. | |

The [changelog](https://github.com/Alien6-Studio/elea/blob/main/CHANGELOG.md)
gives the detail of each entry.
