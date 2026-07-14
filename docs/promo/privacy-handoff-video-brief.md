# Video Brief: Privacy-First Slack Handoff Search

## Positioning

Show `slackcache` as a local-first way to turn a Slack export fixture into a
reviewable handoff pack without making Slack API calls or exposing raw secrets in
the demo output.

## Grounded demo beats

1. Start with `fixtures/sample`, which includes a deploy checklist URL, a
   Slack-token-shaped string, and an email address in `general/2026-05-01.json`.
2. Run `npm run build` so the demo uses the compiled local CLI.
3. Run `bash examples/redaction-review-pack-demo.sh`.
4. Point out the import scope report: channel count, user count, message count,
   date range, and redaction counts.
5. Search for `deploy` in the `general` channel.
6. Open thread `1777586400.000100` from the local cache.
7. Show the generated review files under the temporary `review/` directory.

## Demo script

```sh
npm run build
bash examples/redaction-review-pack-demo.sh
```

## What to say plainly

- `slackcache` reads local Slack export or API-shaped fixture files.
- Redaction is on by default for emails, URLs, Slack-token-shaped strings, and
  generic `token=` or `secret=` patterns.
- The tool writes only to the selected local output directory.
- V1 does not make Slack API requests.

## Limits

This is a local archive/search helper, not an enterprise eDiscovery product or
a guarantee that every sensitive string shape will be detected.
