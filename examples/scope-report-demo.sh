#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_DIR="${TMPDIR:-/tmp}/slackcache-scope-report-cache"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-scope-report"

rm -rf "$CACHE_DIR" "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build
node dist/src/cli.js import fixtures/sample --output "$CACHE_DIR" >"$OUT_DIR/import.txt"
node dist/src/cli.js scope --index "$CACHE_DIR" >"$OUT_DIR/scope.txt"
node dist/src/cli.js search deploy --index "$CACHE_DIR" --channel general --limit 2 >"$OUT_DIR/search.txt"

test -s "$OUT_DIR/import.txt"
test -s "$OUT_DIR/scope.txt"
test -s "$OUT_DIR/search.txt"
grep -qi "channel" "$OUT_DIR/scope.txt"
grep -qi "deploy" "$OUT_DIR/search.txt"

echo "Import report: $OUT_DIR/import.txt"
echo "Scope report: $OUT_DIR/scope.txt"
echo "Search excerpt: $OUT_DIR/search.txt"
