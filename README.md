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
| [`@alien6-studio/elea-tokens`](packages/tokens) | Design tokens (DTCG source), runtime CSS custom properties, Tailwind v4 `@theme`, TypeScript access |
| [`@alien6-studio/elea-content`](packages/content) | Block document model compatible with EditorJS output, schema, block registry, sanitization, text extraction. No React, no DOM |
| [`@alien6-studio/elea-content-viewer`](packages/content-viewer) | React rendering of block documents without hooks, usable in server components, with its stylesheet |
| [`@alien6-studio/elea-content-editor`](packages/content-editor) | React block editor: rich text engine, blocks, toolbar, virtualization, with upload and attachment picking injected by the host |
| [`@alien6-studio/elea-ui`](packages/ui) | Planned: React primitives built on Elea tokens. Private until its first components land |

The published packages share one version and one `vX.Y.Z` tag. The playground in
[`examples/vite`](examples/vite) shows the editor and the viewer side by side with fake host
services; `npm run dev -w examples/vite` starts it.

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

`check` guards the repository against real hosts and mailboxes, builds every package and the
playground, enforces the gzip size budget of each package, type-checks, runs the tests with
coverage thresholds, then qualifies the packed archives in a consumer outside the repository:
declared exports shipped, published types resolving, the viewer rendered on the server and the
editor in a DOM, with React 18 and React 19. `npm run test:e2e` drives the playground in
Chromium with Playwright; CI runs it on every push.

## Release and verification

See [docs/release.md](docs/release.md): signed `vX.Y.Z` tags, qualification
with Continuum Attest, npm trusted publishing with provenance, immutable
releases.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
and [SECURITY.md](SECURITY.md). Elea is provided under the
[Apache-2.0](LICENSE) license.
