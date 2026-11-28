# Versions and changes

The documentation site follows development. For a shipped package, open its
[GitHub release](https://github.com/Alien6-Studio/elea/releases) and select the
tag that matches the version in your lockfile. Each release links to the
documentation, examples and integration notes for that version.

Each changelog entry describes the effect on existing integrations, including
changes to defaults and any action needed when upgrading. The **Unreleased**
section covers work awaiting a package release.

## 0.1.4

This release corrects default rendering so that nested corners follow one
rule. Compare screens that use segmented tabs, cards, the classic editor or
`buttonRadiusScale: "profile"` before upgrading.

A segmented tab now shares the centres of its list's corners: its radius is
the list's radius minus the 0.25rem inset. A card pads its content clear of
its corners in themes whose surface corners are longer than the padding, such
as Ponctuation and Lisière. The document toolbar and the classic editor frame
limit their corners to the toolbar padding. With `buttonRadiusScale: "profile"`,
a silhouette finer than 0.25rem, such as Hors champ, keeps the uniform radii.
A host `--elea-control-radius` still applies to tabs and to the classic editor.

The rules come from [Geometry of Interfaces](research/geometry-of-interfaces.md),
a study with an [atlas](research/geometry-of-interfaces/atlas.md) of
constructions and a [laboratory](research/geometry-of-interfaces/laboratory.md)
to test them on components.

A form field can accept part of the editor. `blockTypes` now governs every
way content appears in a `ContentEditor`, and `marks` does the same for bold,
italic, underline and links. If you already pass `blockTypes`, check stored
documents: a block the field does not accept is shown as paragraphs when it
carries text, and is left out and passed to `onBlocksLeftOut` when it has
none. The link control opens the address of the link under the caret, to
change it, remove it or open it, and the fixed toolbar stays usable while no
field has focus. Try it in the [field guide](/playground/#/ui/field).

Four components take new options:

- A [Menu](/playground/#/ui/menu) item with `href` is a link, rendered by your
  router through `render` as with `Button`, and `header` shows a name or a
  company above the items. `MenuItemProps` and `MenuItemData` become unions
  of an action and a link.
- [Dialog](/playground/#/ui/dialog) adds the `xl` and `full` sizes, and
  `scroll="body"` keeps the header and the actions in place while the body
  scrolls.
- [Stepper](/playground/#/ui/stepper) adds `indicator="solid"` for filled
  markers, `connector="dotted"` for the line towards steps not yet completed,
  and `badgeTone` on a step.
- [Alert](/playground/#/ui/alert) reads `--elea-alert-<tone>-surface`,
  `--elea-alert-<tone>-border` and `--elea-alert-<tone>-text` for each tone.

Two components are new:

- [Content comparison](/playground/#/ui/content-comparison) shows two versions
  of a document as one, for a draft against what is published. Words and
  blocks that came are `<ins>`, those that went are `<del>`, and rich text
  keeps its formatting. `ContentComparison` is in the viewer; `compareBlocks`
  and `compareHtml` in the content package give the same result as data.
  `ins` joins the tags of `RICH_HTML_POLICY`.
- [Save status](/playground/#/ui/save-status) says where an automatic save
  stands, `saving`, `saved` or `error`, in a polite status region, with an
  optional retry button after a failure.

The [0.1.4 release](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.4) lists the six package guides and upgrade notes.

## 0.1.3

Use `Hero`, `Navbar` and `Sidebar` to open a page and move through an
application, with `SearchField` and `SearchAutocomplete` for filtering and
destination suggestions. See [page introductions and navigation](https://github.com/Alien6-Studio/elea/blob/v0.1.3/packages/ui/README.md#page-introductions-and-navigation)
and [search](https://github.com/Alien6-Studio/elea/blob/v0.1.3/packages/ui/README.md#search). `ResponsiveImage` serves responsive
sources and art direction, directly or through Hero and CardImage.

Set [regional density](https://github.com/Alien6-Studio/elea/blob/v0.1.3/packages/ui/README.md#regional-density) to coordinate
controls, menus and table rows, and add the optional
[interface type roles](https://github.com/Alien6-Studio/elea/blob/v0.1.3/packages/tokens/README.md#interface-typography).
For theme work, see [theme qualification](https://github.com/Alien6-Studio/elea/blob/v0.1.3/packages/tokens/README.md#qualify-a-theme)
and the [DTCG 2025.10 documents](https://github.com/Alien6-Studio/elea/blob/v0.1.3/packages/tokens/README.md#dtcg-202510-interchange).
The [0.1.3 release](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.3) lists the six package guides and upgrade notes.

## 0.1.2

Use `Stepper` to navigate a multi-step form and `Breadcrumb` to show its place
in your application. The [multi-step form](https://github.com/Alien6-Studio/elea/blob/v0.1.2/packages/ui/README.md#multi-step-forms)
and [breadcrumb examples](https://github.com/Alien6-Studio/elea/blob/v0.1.2/packages/ui/README.md#breadcrumbs) use the released APIs.

The [form guide](https://github.com/Alien6-Studio/elea/blob/v0.1.2/packages/ui/README.md#searchable-selections-and-dates)
covers searchable multiple selection and date entry. For payment and identity
forms, see [segmented identifiers](https://github.com/Alien6-Studio/elea/blob/v0.1.2/packages/ui/README.md#segmented-identifiers)
and [telephone numbers by country](https://github.com/Alien6-Studio/elea/blob/v0.1.2/packages/ui/README.md#telephone-numbers-by-country).
The [0.1.2 release](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.2) lists the six package guides and upgrade notes.

## 0.1.1

Buttons can use one colour role across solid, outline and ghost treatments,
or render a host router link. See the [Button examples for 0.1.1](https://github.com/Alien6-Studio/elea/blob/v0.1.1/packages/ui/README.md#buttons).

The cropper can restore a saved framing from its original image and export
named formats. See the [media examples](https://github.com/Alien6-Studio/elea/blob/v0.1.1/packages/media/README.md)
and [editor integration](https://github.com/Alien6-Studio/elea/blob/v0.1.1/packages/content-editor/README.md)
for this version. The [0.1.1 release](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.1)
lists all six package guides.

## 0.1.0

The [initial release](https://github.com/Alien6-Studio/elea/releases/tag/v0.1.0)
includes the original package guides and instructions for reproducing the theme shapes example.
