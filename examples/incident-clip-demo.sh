#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_DIR="${TMPDIR:-/tmp}/slackcache-incident-clip-cache"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-incident-clip"

rm -rf "$CACHE_DIR" "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build
node dist/src/cli.js import fixtures/api --output "$CACHE_DIR" > "$OUT_DIR/import.txt"
node dist/src/cli.js search "auth panic" --index "$CACHE_DIR" --channel agent-handoff --limit 3 > "$OUT_DIR/search.txt"
node dist/src/cli.js thread 1777672800.000100 --index "$CACHE_DIR" --channel agent-handoff > "$OUT_DIR/thread.txt"

test -s "$OUT_DIR/import.txt"
test -s "$OUT_DIR/search.txt"
test -s "$OUT_DIR/thread.txt"
grep -qi "agent-handoff" "$OUT_DIR/search.txt"
grep -qi "auth" "$OUT_DIR/thread.txt"
grep -qi "redaction" "$OUT_DIR/import.txt"

echo "Import scope: $OUT_DIR/import.txt"
echo "Search clip: $OUT_DIR/search.txt"
echo "Thread clip: $OUT_DIR/thread.txt"
