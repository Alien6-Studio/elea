# Elea

Elea is the design system of Alien6 Studio: design tokens, a headless core and
React components, starting with a block content viewer and editor extracted
from production applications. Tokens and logic are framework-free; React is
the first rendering layer, kept thin so that another framework can follow.

[![CI](https://github.com/Alien6-Studio/elea/actions/workflows/ci.yml/badge.svg)](https://github.com/Alien6-Studio/elea/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

## Packages

| Package | Role |
| --- | --- |
| [`@alien6-studio/elea-tokens`](packages/tokens) | Design tokens (DTCG source), CSS custom properties, Tailwind v4 theme, TypeScript constants |
| [`@alien6-studio/elea-core`](packages/core) | Block document model compatible with EditorJS output, schema, block registry, sanitization, text extraction. No React, no DOM |
| [`@alien6-studio/elea-viewer`](packages/viewer) | React rendering of block documents, usable in server components |
| [`@alien6-studio/elea-editor`](packages/editor) | React block editor with injectable upload, asset resolution, attachment picking, analytics and messages |
| [`@alien6-studio/elea-react`](packages/react) | React primitives built on Elea tokens |

The packages share one version and one `vX.Y.Z` tag.

## Layers

1. Tokens: framework-free, survive any framework change.
2. Core logic: TypeScript without a DOM, testable with the Node test runner.
3. Styles: CSS per component on `--elea-*` variables, prefixed `elea-` classes, no Tailwind required by consumers.
4. Rendering: React packages that only render and wire events.

## Develop

Node 22 or 24.

```sh
npm ci
npm run check
```

`check` runs type checking, tests with coverage thresholds, the build of every
package, a packaged consumer verification and a dry-run pack.

## Release and verification

See [docs/release.md](docs/release.md): signed `vX.Y.Z` tags, qualification
with Continuum Attest, npm trusted publishing with provenance, immutable
releases.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
and [SECURITY.md](SECURITY.md). Elea is provided under the
[Apache-2.0](LICENSE) license.
