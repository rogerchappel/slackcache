# Launch Note Draft

`slackcache` is a local-first Slack archive CLI for turning approved export or fixture JSON into a deterministic local cache.

The current demo path imports `fixtures/sample`, reports exactly what was indexed, redacts emails, URLs, Slack-token-shaped text, and generic secret assignments by default, then searches and opens a thread from the local cache.

## What to Show

- `npm run build`
- `bash examples/local-handoff-demo.sh`
- The scope report and redaction counts.
- A narrow channel search followed by the exact thread view.

## Limits

- V1 reads local export/API-style fixture files only.
- It does not call Slack APIs.
- Public demos should use synthetic fixtures, not private workspace exports.

