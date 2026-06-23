# Scope Report Demo

This recipe turns the public Slack export fixture into three files that are
useful for a short maintainer demo:

- `import.txt` captures the import report
- `scope.txt` captures the indexed workspace scope
- `search.txt` captures a narrow channel search

## Run the Demo

```sh
npm install
bash examples/scope-report-demo.sh
```

The script uses `fixtures/sample`, writes a temporary local cache, then checks
that the scope and search outputs are present.

## What to Show

Start with the scope report so viewers see channel, user, message, date-range,
and redaction accounting before any search result is shared. Then show the
`deploy` search excerpt from the `general` channel.

## Boundaries

This demo makes no Slack API calls and uses only checked-in fixture data. For a
real workspace export, review the scope report and any redaction counts before
copying thread context into another tool.
