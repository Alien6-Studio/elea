#!/usr/bin/env bash
set -euo pipefail

if [[ $# != 1 ]]; then
  printf 'Usage: %s <Elea source checkout>\n' "$0" >&2
  exit 2
fi

site_root=$(cd "$(dirname "$0")/.." && pwd)
source_root=$(cd "$1" && pwd)
playground="$site_root/playground"
archive_dir=$(mktemp -d)
trap 'rm -rf -- "$archive_dir"' EXIT

npm --prefix "$source_root" run build:packages
npm --prefix "$source_root" pack --workspace=packages --ignore-scripts --silent --pack-destination "$archive_dir"

npm --prefix "$playground" ci --no-audit --no-fund
npm --prefix "$playground" install --no-save --ignore-scripts --no-audit --no-fund "$archive_dir"/*.tgz
npm --prefix "$playground" run lint
NEXT_TELEMETRY_DISABLED=1 npm --prefix "$playground" run test:next
mkdir -p "$playground/public"
cp "$site_root/docs/assets/elea-mark.svg" "$playground/public/favicon.svg"
(
  cd "$playground"
  node --import tsx scripts/render-site.tsx
  npm run build
)

site_dir="$site_root/.build/elea"
export ELEA_SOURCE_REVISION ELEA_DOCS_REVISION
ELEA_SOURCE_REVISION=$(git -C "$source_root" rev-parse --verify HEAD 2>/dev/null || true)
ELEA_DOCS_REVISION=$(git -C "$site_root" rev-parse --verify HEAD 2>/dev/null || true)
"${MKDOCS:-mkdocs}" build --strict --config-file "$site_root/mkdocs.yml" --site-dir "$site_dir"
mkdir -p "$site_dir/playground"
cp -R "$playground/dist/." "$site_dir/playground/"

node "$source_root/docs/examples/theme-shapes.mjs"
mkdir -p "$site_dir/examples/theme-shapes"
cp -R "$source_root/artifacts/examples/theme-shapes/." "$site_dir/examples/theme-shapes/"
