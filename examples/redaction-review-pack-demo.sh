#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-redaction-review-pack"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/review"

echo "== Import the sample Slack export with default redaction =="
node "$ROOT_DIR/dist/src/cli.js" import "$ROOT_DIR/fixtures/sample" --output "$OUT_DIR/cache" \
  | tee "$OUT_DIR/review/import-scope.txt"

echo
echo "== Search for deploy handoff context =="
node "$ROOT_DIR/dist/src/cli.js" search "deploy" --index "$OUT_DIR/cache" --channel general --limit 5 \
  | tee "$OUT_DIR/review/search-deploy.txt"

echo
echo "== Capture the matching thread for handoff review =="
node "$ROOT_DIR/dist/src/cli.js" thread 1777586400.000100 --index "$OUT_DIR/cache" --channel general \
  | tee "$OUT_DIR/review/thread-1777586400.txt"

echo
echo "Review pack written to $OUT_DIR/review"
