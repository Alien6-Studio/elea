# Changelog

## Unreleased

- The Combobox now exposes the highlighted option to assistive technology as you navigate. Enter or a click commits the choice. The cropper's move and resize controls expose the current position and dimensions as accessible descriptions.
- The nine complete theme profiles now supply shapes for actions, form controls, surfaces and selection indicators. Réserve uses an asymmetric imprint for actions and selections. Recheck screenshots when upgrading an application that uses `createThemeProfile()`.
- To retain the previous corner treatment, omit `shape` from the generated brand. An explicit `radius` takes precedence over the profile. Applying a colour palette alone keeps the product’s shapes.
- In a Square theme with a shape profile, explicit Button radii `sm`, `md` and `lg` now have distinct uniform corners. Omit the prop to use the profile's action shape.
- Set `buttonRadiusScale: "profile"` in `makeBrandTheme()` to use the profile’s curves at small, medium and large Button radii. Existing themes default to `"uniform"`.
