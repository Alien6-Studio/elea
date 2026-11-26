# Changelog

## Unreleased

- The nine complete theme profiles now supply shapes for actions, form controls, surfaces and selection indicators. Réserve uses an asymmetric imprint for actions and selections. Recheck screenshots when upgrading an application that uses `createThemeProfile()`.
- To retain the previous corner treatment, omit `shape` from the generated brand. An explicit `radius` takes precedence over the profile. Applying a colour palette alone keeps the product’s shapes.
- In a Square theme with a shape profile, explicit Button radii `sm`, `md` and `lg` now have distinct uniform corners. Omit the prop to use the profile's action shape.
