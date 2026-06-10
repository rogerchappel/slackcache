#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-local-handoff-demo"

rm -rf "$OUT_DIR"

echo "== Import fixture Slack export =="
node "$ROOT_DIR/dist/src/cli.js" import "$ROOT_DIR/fixtures/sample" --output "$OUT_DIR"

echo
echo "== Scope report =="
node "$ROOT_DIR/dist/src/cli.js" scope --index "$OUT_DIR"

echo
echo "== Search for deploy handoff =="
node "$ROOT_DIR/dist/src/cli.js" search "deploy" --index "$OUT_DIR" --channel general --limit 3

echo
echo "== Open the matching thread =="
node "$ROOT_DIR/dist/src/cli.js" thread 1777586400.000100 --index "$OUT_DIR" --channel general

