# Slackcache Incident Clip Video Brief

## Promise

Show a privacy-first Slack handoff workflow from local fixtures: import, scope, narrow search, and exact thread view.

## Demo source

- Script: `examples/incident-clip-demo.sh`
- Fixture: `fixtures/api`
- Channel: `agent-handoff`
- Query: `auth panic`
- Thread timestamp: `1777672800.000100`

## Shot list

1. Run `bash examples/incident-clip-demo.sh`.
2. Open the import output and show the scope report before any search result.
3. Open the search clip for `auth panic` in `agent-handoff`.
4. Open the thread clip and show that handoff context can be reviewed without a network call.
5. Close on the privacy defaults: local files, explicit output directory, and redaction on by default.

## Guardrails

Do not imply Slack API access or live workspace sync. The current demo is fixture-backed and local-first.
