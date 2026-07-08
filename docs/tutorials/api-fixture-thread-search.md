# API fixture thread search

This recipe uses the API-shaped local fixture to show a narrow handoff search
without needing a Slack token or export archive.

## Run

```bash
npm install
npm run build
bash examples/api-handoff-triage-demo.sh
```

The script imports `fixtures/api`, searches the `agent-handoff` channel for
auth panic context, and prints a matching thread from the temporary local cache.

## Manual commands

```bash
OUT_DIR="${TMPDIR:-/tmp}/slackcache-api-handoff-triage"
rm -rf "$OUT_DIR"

node dist/src/cli.js import fixtures/api --output "$OUT_DIR"
node dist/src/cli.js search "auth panic" --index "$OUT_DIR" --channel agent-handoff --limit 3
node dist/src/cli.js thread 1777672800.000100 --index "$OUT_DIR" --channel agent-handoff
```

## What to inspect

- The import scope report shows exactly what was indexed.
- The search narrows to a single channel before thread expansion.
- The thread output comes from local fixture JSON, not a Slack API call.

## Promotion angle

Use this demo when the audience understands API response shapes better than
Slack export directories. It shows the same local-first workflow with a smaller
fixture layout.
