# API Scope Receipt Demo

This walkthrough uses the API-shaped fixture under `fixtures/api` to show a
Slack handoff search with an explicit import scope receipt.

## Run it

```bash
npm run build
bash examples/api-scope-receipt-demo.sh
```

The script imports the fixture into a temporary cache, prints a scope report,
and searches the `agent-handoff` channel for `auth panic`.

## Why this is useful

For handoff workflows, the search result alone is not enough. The reviewer also
needs to know what local data was indexed before the search result is shared
with another maintainer or agent.

The demo verifies:

- the scope report includes one channel, one user, and one message
- the search output is limited to `#agent-handoff`
- the search output preserves the handoff phrase `auth logs`

## Manual commands

```bash
npm run build
tmp="$(mktemp -d)"
node dist/src/cli.js import fixtures/api --output "$tmp/cache"
node dist/src/cli.js scope --index "$tmp/cache"
node dist/src/cli.js search "auth panic" --index "$tmp/cache" --channel agent-handoff --limit 3
rm -rf "$tmp"
```
