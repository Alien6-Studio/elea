#!/usr/bin/env bash
set -euo pipefail

# The same browser build, OS, architecture and fonts render the reviewed PNGs and the CI comparisons.
site_root=$(cd "$(dirname "$0")/.." && pwd)
image=mcr.microsoft.com/playwright:v1.65.1-noble@sha256:766137e2d9caad4744187e53cdc89320ba6f2eb57cff097374020944b44dd0a9
docker run --rm --init --platform linux/amd64 --shm-size=1g \
  --user "$(id -u):$(id -g)" --env HOME=/tmp --env CI=true \
  --env GITHUB_ACTIONS --env ELEA_PAGES_REVISION --env GITHUB_SHA --env ELEA_SOURCE_REVISION \
  --volume "$site_root:/work" --workdir /work/playground "$image" \
  node node_modules/@playwright/test/cli.js test "$@"
