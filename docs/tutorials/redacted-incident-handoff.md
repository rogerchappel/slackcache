# Redacted incident handoff demo

This walkthrough shows the smallest local-first flow for turning a Slack export
fixture into reviewable incident context without sending workspace history to a
remote service.

## What the demo proves

- `slackcache import` can index a Slack export-shaped directory.
- Default redaction masks emails, URLs, Slack-token-shaped strings, and generic
  `token=` or `secret=` values before the cache is searched.
- `slackcache search` narrows the result set before a human or agent opens a
  specific thread.
- `slackcache thread` prints the exact local thread context for handoff review.

## Run it from a checkout

```bash
npm install
npm run build
bash examples/redacted-incident-handoff-demo.sh
```

The script writes its temporary cache under `${TMPDIR:-/tmp}` and removes any
previous copy before each run.

## Manual commands

```bash
OUT_DIR="${TMPDIR:-/tmp}/slackcache-redacted-incident-handoff"
rm -rf "$OUT_DIR"

node dist/src/cli.js import fixtures/sample --output "$OUT_DIR"
node dist/src/cli.js search "deploy" --index "$OUT_DIR" --channel general --limit 2
node dist/src/cli.js thread 1777586400.000100 --index "$OUT_DIR" --channel general
```

## Promotion angle

Use this demo when showing agent handoff preparation: import first, review the
scope report, search narrowly, and only then pass the redacted thread excerpt to
an agent or reviewer.
