# Releases

ELEA publishes its six npm packages under one version. Each GitHub release links to the package guides, example source and changelog at its signed tag. For upgrade instructions, open the release matching the version in your lockfile. The public playground follows ongoing development.

## Reproduce a version

Clone the signed tag named in the release and use Node.js 22 or later. From the repository root run the example against that checkout’s packages.

```sh
npm ci
npm run build:packages
node docs/examples/theme-shapes.mjs
```

Open `artifacts/examples/theme-shapes/index.html` in a browser. The [theme shapes example](examples/theme-shapes.mjs) uses the public token and component APIs. The [changelog](../CHANGELOG.md) records visible changes, compatibility details and upgrade actions by version.

## Prepare a release

1. Set the root and all public workspace package versions to the same semantic version. Update the lockfile. Move the release’s changes from `## Unreleased` in the changelog to a heading such as `## 1.2.3`. Describe what changes for integrators and any action an upgrade requires.
2. Run `npm ci` and `npm run check`. Preview the release body with `node scripts/release-notes.mjs v1.2.3`, substituting the intended tag. The check resolves every package guide and the example against the checkout.
3. Create an annotated SSH-signed `vX.Y.Z` tag on the reviewed commit on `main`. Verify it with `scripts/verify-tag.sh vX.Y.Z` and push the tag to start the release workflow. The signing key must be listed in [the release signers](../.github/release/allowed_signers).

## Verify the published packages

CI tests the source and packed consumers. Continuum Attest qualifies the archives, and a protected environment signs the receipt. The publish job verifies the signed tag, source revision and qualified file checksums. It checks the version notes before publishing new releases via npm trusted publishing and verifies each archive’s SHA-512 integrity against the public registry.

The GitHub release includes package archives and a qualification bundle. Extract `qualification-evidence.tar.gz` and run `sha256sum --check proof/SHA256SUMS` from its extracted root. Compare `artifacts/source-revision.txt` with `git rev-parse HEAD` in the tagged checkout.

Retry a failed release with the same signed tag. The workflow compares existing npm archives by integrity. If a public GitHub release exists, it also checks its archived package bytes and preserves its release notes and assets.
