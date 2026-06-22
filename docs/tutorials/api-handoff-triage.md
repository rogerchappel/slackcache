# API handoff triage demo

This recipe uses the API-style fixture in `fixtures/api` to show the smallest
agent handoff triage loop: import local JSON, search one channel, and review the
scope report before sharing any extracted context.

## What the demo proves

- `slackcache import` accepts a flat local fixture with `users.json`,
  `channels.json`, and `messages.json`.
- `slackcache search` can narrow a handoff question to a specific channel.
- `slackcache scope` shows the indexed channel, user, message, date, and
  redaction counts after import.
- The flow runs against checked-in public fixture data and makes no Slack API
  request.

## Run it from a checkout

```bash
npm install
npm run build
bash examples/api-handoff-triage-demo.sh
```

The script writes a temporary cache under
`${TMPDIR:-/tmp}/slackcache-api-handoff-triage` and removes any previous copy at
the start of each run.

## Manual commands

```bash
OUT_DIR="${TMPDIR:-/tmp}/slackcache-api-handoff-triage"
rm -rf "$OUT_DIR"

node dist/src/cli.js import fixtures/api --output "$OUT_DIR"
node dist/src/cli.js search "panic" --index "$OUT_DIR" --channel agent-handoff --limit 3
node dist/src/cli.js scope --index "$OUT_DIR"
```

## Promotion angle

Use this demo when the audience needs a compact terminal clip. The public
fixture has one `agent-handoff` message, so the clip can focus on the workflow
shape: import, search narrowly, then inspect the scope report before passing
context to an agent or reviewer.
