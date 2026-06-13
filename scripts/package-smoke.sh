#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"
npm run build >/dev/null
npm pack --dry-run >/dev/null
npm pack --pack-destination "$tmp" >/dev/null

package_tgz="$(find "$tmp" -maxdepth 1 -name 'slackcache-*.tgz' -print -quit)"
test -n "$package_tgz"

mkdir -p "$tmp/app"
cd "$tmp/app"
npm init -y >/dev/null
npm install "$package_tgz" >/dev/null

./node_modules/.bin/slackcache --help >/dev/null
./node_modules/.bin/slackcache import node_modules/slackcache/fixtures/sample --output "$tmp/cache" > "$tmp/import.txt"
grep -q 'Messages: 4' "$tmp/import.txt"
./node_modules/.bin/slackcache search deploy --index "$tmp/cache" --channel general --limit 1 > "$tmp/search.txt"
grep -q '#general' "$tmp/search.txt"

echo 'slackcache package smoke passed'
