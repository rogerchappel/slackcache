#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-api-handoff-triage"

rm -rf "$OUT_DIR"

echo "== Import the API-shaped local fixture =="
node "$ROOT_DIR/dist/src/cli.js" import "$ROOT_DIR/fixtures/api" --output "$OUT_DIR"

echo
echo "== Search the agent handoff channel for auth context =="
node "$ROOT_DIR/dist/src/cli.js" search "panic" --index "$OUT_DIR" --channel agent-handoff --limit 3

echo
echo "== Confirm the indexed scope before sharing context =="
node "$ROOT_DIR/dist/src/cli.js" scope --index "$OUT_DIR"
