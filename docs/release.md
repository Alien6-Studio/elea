# Releases

The seven npm packages share one version and one signed `vX.Y.Z` tag. Each
[GitHub release](https://github.com/Alien6-Studio/elea/releases) links the
package guides, the examples and the [changelog](../CHANGELOG.md) at its tag.

## Reproduce a version

Check out the tag with Node.js 22 or later, then build the packages and run
the [theme shapes example](examples/theme-shapes.mjs).

```sh
npm ci
npm run build:packages
node docs/examples/theme-shapes.mjs
```

Open `artifacts/examples/theme-shapes/index.html` in a browser.

## Prepare a release

1. Set the same version on the root and on every public package, and update
   the lockfile.
2. In the changelog, move the entries under `## Unreleased` to a heading such
   as `## 1.2.3`. Say what changes for integrators and what an upgrade requires.
3. Run `npm ci` and `npm run check`, then preview the release body with
   `node scripts/release-notes.mjs v1.2.3`.
4. On the reviewed commit of `main`, create an annotated, SSH-signed tag with
   a key listed in [the release signers](../.github/release/allowed_signers).
   Verify it with `scripts/verify-tag.sh v1.2.3` and push it. The tag starts
   the release workflow.

A failed release is retried with the same tag. The workflow compares what is
already published by integrity and keeps existing release notes and assets.

## Verify a published release

The workflow tests the source and the packed archives, qualifies the archives
with Continuum Attest and signs the receipt in a protected environment. It
publishes through npm trusted publishing after verifying the tag, the source
revision and the checksums, then checks each archive’s SHA-512 integrity
against the registry.

To check a release yourself, download `qualification-evidence.tar.gz` from
it and extract it.

```sh
sha256sum --check proof/SHA256SUMS
```

`artifacts/source-revision.txt` must equal `git rev-parse HEAD` in the tagged
checkout.
