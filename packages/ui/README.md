# @alien6-studio/elea-ui

Planned package: React primitives of the Elea design system (buttons, badges, checkboxes,
toggles, menus, tooltips, dialogs, side panels, pagination, steppers, inputs), styled with Elea
tokens only. Nothing is published yet and the package is marked private so that no release can
ship it by accident.

Acceptance before the first publication:

- every primitive has a story, a Testing Library test and an axe audit;
- labels come through props, never hard-coded;
- styles use `--elea-*` tokens only, light and dark;
- the packaged consumer check imports the entry point.
