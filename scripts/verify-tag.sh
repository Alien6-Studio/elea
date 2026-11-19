#!/usr/bin/env bash
# Refuses a release tag unless it carries a valid SSH signature from a key listed in
# .github/release/allowed_signers. Usage: scripts/verify-tag.sh vX.Y.Z
set -euo pipefail
tag="${1:?tag name}"
signers="${ALLOWED_SIGNERS:-.github/release/allowed_signers}"
if [[ ! "$tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "refused: '$tag' is not a release tag" >&2
  exit 1
fi
if [[ "$(git cat-file -t "refs/tags/$tag" 2>/dev/null || true)" != "tag" ]]; then
  echo "refused: $tag is not an annotated tag" >&2
  exit 1
fi
if ! git -c gpg.format=ssh -c gpg.ssh.allowedSignersFile="$signers" verify-tag "$tag" >/dev/null 2>&1; then
  echo "refused: $tag is unsigned or signed by a key that is not an allowed release signer" >&2
  exit 1
fi
echo "verified: $tag is signed by an allowed release signer"
