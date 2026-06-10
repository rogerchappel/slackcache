# Video Brief: Local Slack Handoff Search

## Hook

Show how `slackcache` turns a Slack export fixture into a local, redacted search index without network calls.

## Demo Beat Sheet

1. Build the CLI with `npm run build`.
2. Run `bash examples/local-handoff-demo.sh`.
3. Pause on the import scope report so viewers can see channel, user, message, date, and redaction counts.
4. Search for `deploy` in `general`.
5. Open thread `1777586400.000100` and point out that emails, URLs, and token-looking text are redacted by default.

## Claims to Keep Grounded

- The demo uses only files in `fixtures/sample`.
- V1 supports Slack export directories and API-style local fixtures.
- Default import redacts common risky text before writing the cache.
- The project does not make Slack API requests in V1.

## Avoid Saying

- Do not claim enterprise compliance, production readiness, or Slack API sync.
- Do not show private workspace exports in public footage.

## Verification to Mention

```sh
npm run build
bash examples/local-handoff-demo.sh
```

