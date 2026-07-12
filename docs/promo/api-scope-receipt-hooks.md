# API Scope Receipt Hooks

Grounded in `fixtures/api`, `examples/api-scope-receipt-demo.sh`, and
`docs/tutorials/api-scope-receipt.md`.

## Short hooks

- Import first, scope second, search third. `slackcache` makes the indexed
  Slack fixture visible before the handoff result leaves your terminal.
- The API fixture demo searches `agent-handoff` for `auth panic` and shows the
  one-channel, one-user, one-message scope receipt.
- A useful handoff clip needs context and receipts: what was indexed, where the
  match came from, and which local fixture backed the result.

## Clip outline

1. Build the CLI.
2. Run `bash examples/api-scope-receipt-demo.sh`.
3. Show the scope report counts.
4. Show the search result in `#agent-handoff`.
5. Close on the local-first workflow: fixture in, local cache out, scoped
   terminal search.
