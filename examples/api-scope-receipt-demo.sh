#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

CACHE_DIR="$TMP_DIR/cache"

node dist/src/cli.js import fixtures/api --output "$CACHE_DIR" >"$TMP_DIR/import.txt"
node dist/src/cli.js scope --index "$CACHE_DIR" >"$TMP_DIR/scope.txt"
node dist/src/cli.js search "auth panic" --index "$CACHE_DIR" --channel agent-handoff --limit 3 >"$TMP_DIR/search.txt"

grep -q "Channels: 1" "$TMP_DIR/scope.txt"
grep -q "Users: 1" "$TMP_DIR/scope.txt"
grep -q "Messages: 1" "$TMP_DIR/scope.txt"
grep -q "#agent-handoff" "$TMP_DIR/search.txt"
grep -q "auth logs" "$TMP_DIR/search.txt"

echo "API scope receipt demo passed"
echo "Scope:"
sed -n '1,8p' "$TMP_DIR/scope.txt"
echo
echo "Search:"
sed -n '1,8p' "$TMP_DIR/search.txt"
