# Develop, release and verify

## Develop

```sh
npm ci
npm run check
```

Every package is ESM with typed exports. `elea-content-viewer`, `elea-content-editor` and
`elea-ui` are React entry points: bundle them with your application's
frontend. `elea-tokens` and `elea-content` run anywhere.

## Release

Releases use `vX.Y.Z` annotated tags matching the root `package.json` version, which every
workspace carries as well. A tag must be signed with an SSH key listed in
`.github/release/allowed_signers`; `scripts/verify-tag.sh` refuses unsigned tags and
signatures from any other key before anything is published. Every archive ships the
Apache-2.0 `LICENSE`. The release workflow publishes the tested npm archives
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

The qualification job runs `npm run check -- --pack-destination artifacts`. It packs each
publishable workspace once and installs the archives in clean projects with React 18 and React 19.
After the consumer checks pass, it copies those same archives to `artifacts/` for the release.
[Attestation workflow](https://github.com/Alien6-Studio/elea/actions/workflows/attest.yml)

A separate job recomputes the evidence against the reviewed commit, signs it with Continuum
Attest 0.2.0 and verifies the signature, hashes and successful execution. The release publishes
the archives recorded in that evidence. The repository pins the public signer in
[.github/attest/trust](../.github/attest/trust).

To check a downloaded proof, check out its source revision and extract the
release's `qualification-evidence.tar.gz` at the repository root (or restore the
`signed-attestation` workflow artifact), then run:

```sh
attest verify proof/receipt.yaml --recompute --require signature,recompute,success --trust-store .github/attest/trust --offline
```

The receipt establishes the recorded checks and package identity. It does not
claim a hermetic build or an independently trusted timestamp.
