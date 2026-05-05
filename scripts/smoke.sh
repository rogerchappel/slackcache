#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
node dist/cli.js import fixtures/sample --output "$tmp" > "$tmp/import.txt"
grep -q 'Messages: 4' "$tmp/import.txt"
node dist/cli.js search deploy --index "$tmp" --channel general --limit 2 > "$tmp/search.txt"
grep -q '#general' "$tmp/search.txt"
node dist/cli.js thread 1777586400.000100 --index "$tmp" --channel general > "$tmp/thread.txt"
grep -q 'local runbook' "$tmp/thread.txt"
node dist/cli.js scope --index "$tmp" > "$tmp/scope.txt"
grep -q 'No network calls were made' "$tmp/scope.txt"
echo 'slackcache smoke passed'
