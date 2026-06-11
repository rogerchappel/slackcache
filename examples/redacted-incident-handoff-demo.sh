#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/slackcache-redacted-incident-handoff"

rm -rf "$OUT_DIR"

echo "== Build a redacted local cache from the bundled Slack export fixture =="
node "$ROOT_DIR/dist/src/cli.js" import "$ROOT_DIR/fixtures/sample" --output "$OUT_DIR"

echo
echo "== Confirm searchable incident/deploy context without exposing raw secrets =="
node "$ROOT_DIR/dist/src/cli.js" search "deploy" --index "$OUT_DIR" --channel general --limit 2

echo
echo "== Open the deploy thread for agent handoff review =="
node "$ROOT_DIR/dist/src/cli.js" thread 1777586400.000100 --index "$OUT_DIR" --channel general
