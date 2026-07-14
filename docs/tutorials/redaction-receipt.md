# Redaction Receipt Demo

This recipe shows the safety receipt that `slackcache` prints before a search
result is reused in an agent or maintainer handoff.

## Run it

```sh
npm install
bash examples/redaction-receipt-demo.sh
```

The script builds the CLI, imports `fixtures/sample`, searches the `general`
channel for `deploy`, and opens the matching thread. Output files are written
under `${TMPDIR:-/tmp}/slackcache-redaction-receipt`.

## What to inspect

- `import.txt` records the local fixture scope: two channels, two users, four
  messages, and the redaction count by category.
- `search.txt` shows the redacted deploy handoff search result.
- `thread.txt` shows the exact thread context with email and token-shaped text
  redacted.

The fixture intentionally contains a URL, an email address, and token-shaped
text. The demo verifies those values are replaced with redaction markers before
the handoff clip is shown.

## Promotion angle

Lead with the import receipt, not the search result. The useful product promise
is that a maintainer can see what was indexed and what was redacted before
copying thread context into a review, issue, or agent prompt.
