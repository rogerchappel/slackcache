#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_DIR="${TMPDIR:-/tmp}/slackcache-thread-clip-cache"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-thread-clip"

rm -rf "$CACHE_DIR" "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build >/dev/null
node dist/src/cli.js import fixtures/sample --output "$CACHE_DIR" >"$OUT_DIR/import.txt"
node dist/src/cli.js search deploy --index "$CACHE_DIR" --channel general --limit 1 >"$OUT_DIR/search.txt"
node dist/src/cli.js thread 1777586400.000100 --index "$CACHE_DIR" --channel general >"$OUT_DIR/thread.txt"

test -s "$OUT_DIR/import.txt"
test -s "$OUT_DIR/search.txt"
test -s "$OUT_DIR/thread.txt"
grep -Fq "[redacted:" "$OUT_DIR/thread.txt"
grep -Fq "local runbook" "$OUT_DIR/thread.txt"

echo "Import report: $OUT_DIR/import.txt"
echo "Search result: $OUT_DIR/search.txt"
echo "Thread clip: $OUT_DIR/thread.txt"
