# Redaction Receipt Social Hooks

Use these drafts with a clip of `bash examples/redaction-receipt-demo.sh` and
the public `fixtures/sample` data.

## Short Posts

1. A Slack archive search demo should start with the receipt: channels indexed,
   users counted, message range captured, and risky text redacted before any
   thread context gets copied into an agent prompt.

2. `slackcache` imports local Slack export JSON, prints a scope report, and
   redacts URL, email, Slack-token-shaped, and generic secret-looking text by
   default. No Slack API call is made in the V1 fixture flow.

3. Demo flow: run `bash examples/redaction-receipt-demo.sh`, open `import.txt`
   for the redaction count, then show the deploy search and exact thread with
   redacted values.

## Clip CTA

```sh
bash examples/redaction-receipt-demo.sh
```

Show `import.txt` first, then `search.txt`, then `thread.txt`.
