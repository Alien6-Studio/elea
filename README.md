# Elea

Documentation and live playground: https://elea.alien6.com/

Elea is Alien6 Studio's open-source design system for content-rich applications.
It combines design tokens and React components with an EditorJS-compatible
document model, a server-rendered viewer and a block editor. The host application
supplies its own storage, media services, translations and theme.

[![CI](https://github.com/Alien6-Studio/elea/actions/workflows/ci.yml/badge.svg)](https://github.com/Alien6-Studio/elea/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

## Packages

| Package | Role | npm |
| --- | --- | --- |
| [`@alien6-studio/elea-tokens`](packages/tokens) | [DTCG 2025.10 exports](packages/tokens#dtcg-202510-interchange), runtime CSS custom properties, Tailwind v4 `@theme`, TypeScript access | [![npm version of elea-tokens](https://img.shields.io/npm/v/@alien6-studio/elea-tokens)](https://www.npmjs.com/package/@alien6-studio/elea-tokens) |
| [`@alien6-studio/elea-content`](packages/content) | Block document model compatible with EditorJS output, schema, block registry, sanitization, text extraction. No React, no DOM | [![npm version of elea-content](https://img.shields.io/npm/v/@alien6-studio/elea-content)](https://www.npmjs.com/package/@alien6-studio/elea-content) |
| [`@alien6-studio/elea-content-viewer`](packages/content-viewer) | React rendering of block documents without hooks, usable in server components, with its stylesheet | [![npm version of elea-content-viewer](https://img.shields.io/npm/v/@alien6-studio/elea-content-viewer)](https://www.npmjs.com/package/@alien6-studio/elea-content-viewer) |
| [`@alien6-studio/elea-content-editor`](packages/content-editor) | React block editor: rich text engine, blocks, toolbar, virtualization, with upload and attachment picking injected by the host | [![npm version of elea-content-editor](https://img.shields.io/npm/v/@alien6-studio/elea-content-editor)](https://www.npmjs.com/package/@alien6-studio/elea-content-editor) |
| [`@alien6-studio/elea-media`](packages/media) | Media components on Elea tokens: file drop zone, image cropper with zoom and rotation, crop geometry | [![npm version of elea-media](https://img.shields.io/npm/v/@alien6-studio/elea-media)](https://www.npmjs.com/package/@alien6-studio/elea-media) |
| [`@alien6-studio/observe`](packages/observe) | Registered, semantic interaction events kept in memory under a host grant. No dependency, no ELEA or React required | [![npm version of observe](https://img.shields.io/npm/v/@alien6-studio/observe)](https://www.npmjs.com/package/@alien6-studio/observe) |
| [`@alien6-studio/elea-ui`](packages/ui) | React primitives and layouts on Elea tokens, including forms, overlays, pagination and a footer | [![npm version of elea-ui](https://img.shields.io/npm/v/@alien6-studio/elea-ui)](https://www.npmjs.com/package/@alien6-studio/elea-ui) |

The packages share one version and one `vX.Y.Z` release tag. Install the packages
you use at the same version.

ELEA packages ship as ES modules only. When running Jest through `next/jest`, list every ELEA package your tests import, including transitive dependencies, in your Next.js [`transpilePackages` configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages).

With Tailwind v4, one line is required before every import, or Preflight resets the components:

```css
@layer theme, base, elea, components, utilities;
```

See [Overriding and Tailwind](packages/ui#overriding).

The documentation and live playground are built from the [`site` folder](site). The `gh-pages` branch holds the generated site only.

## Layers

1. Tokens: framework-free, survive any framework change.
2. Core logic: TypeScript without a DOM, testable with the Node test runner.
3. Styles: CSS per component on `--elea-*` variables, prefixed `elea-` classes, in cascade layers a host rule always overrides; one `bundle.css` per package, no Tailwind required by consumers.
4. Rendering: React packages that only render and wire events.

## Develop

Node 22 or later.

```sh
npm ci
npm run check
```

`check` builds every package, enforces each gzip size budget, type-checks and runs the
tests with coverage thresholds. It then installs the packed archives in clean projects
outside the repository and exercises them with React 18 and React 19. CI also tests the
site in a browser against the packages built from the commit under review.

## Releases

Read the [changelog](CHANGELOG.md) for what each version changes and what an
upgrade requires. The [release guide](docs/release.md) covers reproducing a
version, preparing a release and verifying the published archives.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
and [SECURITY.md](SECURITY.md). Elea is provided under the
[Apache-2.0](LICENSE) license.
