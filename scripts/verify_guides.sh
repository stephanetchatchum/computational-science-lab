#!/usr/bin/env bash
# Regenerates each project's pytest files from the guides, then runs them against the reference solution.
set -euo pipefail
cd "$(dirname "$0")/.."
ids=$(ls scripts/reference)
node scripts/dump_guide_tests.mjs $ids
for id in $ids; do
  echo "== $id"
  (cd "scripts/reference/$id" && python -m pytest -q -p no:cacheprovider)
done
echo "ALL GUIDE TESTS PASS AGAINST THE REFERENCE SOLUTIONS"
