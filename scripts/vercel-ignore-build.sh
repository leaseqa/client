#!/usr/bin/env bash
#
# Vercel "Ignored Build Step".
#
#   exit 0 -> skip the build
#   exit 1 -> run the build
#
# Documentation-only pushes should not rebuild and redeploy the client. The
# mirror of this on the server is `buildFilter.ignoredPaths` in render.yaml;
# Vercel has no declarative equivalent, so it runs a command instead.
#
# Vercel invokes this from the project's Root Directory (apps/web), so every
# pathspec below is anchored to the repository root with `:(top)`.
#
# `*.md` rather than `**/*.md`: without `:(glob)` magic a pathspec `*` also
# matches `/`, so `*.md` covers README.md at the root *and* docs/a/b.md.
# `**/*.md` requires a leading directory and silently misses root-level files —
# which is exactly the README edit that prompted this.
#
# Bias: when anything is uncertain — no previous SHA, a shallow clone, a first
# deploy — build. A needless build costs a minute; a skipped build that should
# have run ships nothing and looks like the deploy silently did not happen.

set -uo pipefail

BUILD=1
SKIP=0

log() { echo "[ignore-build] $*"; }

# Vercel sets both, but VERCEL_GIT_PREVIOUS_SHA is empty on a project's first
# deploy and after some settings changes.
prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
head="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

if [ -z "$prev" ]; then
  log "no previous SHA (first deploy or rebuild) — building"
  exit $BUILD
fi

if ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
  log "previous SHA $prev not in this clone (shallow) — building"
  exit $BUILD
fi

# Everything that is NOT documentation. If this is empty, the push touched
# nothing but docs.
changed=$(
  git diff --name-only "$prev" "$head" -- \
    ':(top,exclude)*.md' \
    ':(top,exclude)docs/**' \
    2>/dev/null
)

if [ -z "$changed" ]; then
  log "documentation-only change between $prev and $head — skipping build"
  exit $SKIP
fi

log "$(echo "$changed" | wc -l | tr -d ' ') non-documentation file(s) changed — building"
echo "$changed" | head -20 | sed 's/^/[ignore-build]   /'
exit $BUILD
