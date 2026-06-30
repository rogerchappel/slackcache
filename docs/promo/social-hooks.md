# Social Hooks

Use these as draft starting points. Keep screenshots or clips tied to `fixtures/sample` or another approved public fixture.

## Short Posts

1. Slack export in, local searchable cache out. `slackcache` indexes fixture/export JSON, redacts risky text by default, and lets you inspect the exact thread before handing context to an agent.

2. Agent handoff pattern: import a Slack export, check the scope report, search one channel, open one thread, then decide what is safe to share. No hidden network calls in V1.

3. The useful part of a Slack archive demo is not a huge search box. It is the receipts: channels indexed, messages counted, redactions reported, and thread context shown locally.

4. Report-first demo flow: run `bash examples/scope-report-demo.sh`, open `scope.txt`, then show a narrow `deploy` search from the public fixture.

## Demo CTA

```sh
npm run build
bash examples/local-handoff-demo.sh
```

For a shorter clip using the API-shaped fixture:

```sh
npm run build
bash examples/api-handoff-triage-demo.sh
```

Report-first fixture clip:

```sh
bash examples/scope-report-demo.sh
```

Redaction receipt clip:

```sh
bash examples/redaction-receipt-demo.sh
```

See [redaction receipt social hooks](redaction-receipt-social-hooks.md) for
fixture-grounded copy that leads with the redaction counts.
