#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-redaction-receipt"
IMPORT_LOG="$OUT_DIR/import.txt"
SEARCH_LOG="$OUT_DIR/search.txt"
THREAD_LOG="$OUT_DIR/thread.txt"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build >/dev/null

node dist/src/cli.js import fixtures/sample --output "$OUT_DIR/cache" >"$IMPORT_LOG"
node dist/src/cli.js search deploy --index "$OUT_DIR/cache" --channel general --limit 5 >"$SEARCH_LOG"
node dist/src/cli.js thread 1777586400.000100 --index "$OUT_DIR/cache" --channel general >"$THREAD_LOG"

grep -Fq "Messages: 4" "$IMPORT_LOG"
grep -Fq "Redactions: slack-token=1, generic-token=1, url=1, email=1" "$IMPORT_LOG"
grep -Fq "[redacted:url]" "$SEARCH_LOG"
grep -Fq "[redacted:secret]" "$SEARCH_LOG"
grep -Fq "[redacted:email]" "$THREAD_LOG"

echo "Import receipt: $IMPORT_LOG"
echo "Search receipt: $SEARCH_LOG"
echo "Thread receipt: $THREAD_LOG"
