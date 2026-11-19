# Develop, release and verify

## Develop

```sh
npm ci
npm run check
```

Every package is ESM with typed exports. `elea-viewer`, `elea-editor` and
`elea-react` are React entry points: bundle them with your application's
frontend. `elea-tokens` and `elea-core` run anywhere.

## Release

Releases use `vX.Y.Z` tags matching the root `package.json` version, which every
workspace carries as well. The release workflow publishes the tested npm archives
and the signed qualification evidence on GitHub and npm. Configure the npm trusted
publisher of each package for GitHub owner `Alien6-Studio`, repository `elea`,
workflow `release.yml`, environment `release`, with the `npm publish` action
allowed. Publication to npm is required; a missing publisher configuration fails
the delivery instead of silently skipping it.

To finish npm distribution of an existing GitHub release, dispatch `Release` from
`main` with its signed tag. Qualification runs against that tag. Before
publishing, the workflow compares each archive with the existing public asset and
refuses any difference. It verifies npm's package integrity and preserves the
original GitHub release and evidence. Repeated publication of identical npm
content is harmless; different content under an existing version is refused.
No npm token is stored in this repository. Released versions are immutable.

## Attestation

The [Attestation workflow](https://github.com/Alien6-Studio/elea/actions/workflows/attest.yml)
runs the checks and packs every workspace without signing credentials. A separate
job recomputes the evidence against the reviewed commit, signs it with Continuum
Attest 0.2.0 and verifies signature, hashes and successful execution. Releases
publish those exact archives. The public signer is pinned in
[.github/attest/trust](../.github/attest/trust).

To check a downloaded proof, check out its source revision and extract the
release's `qualification-evidence.tar.gz` at the repository root (or restore the
`signed-attestation` workflow artifact), then run:

```sh
attest verify proof/receipt.yaml --recompute --require signature,recompute,success --trust-store .github/attest/trust --offline
```

The receipt establishes the recorded checks and package identity. It does not
claim a hermetic build or an independently trusted timestamp.
