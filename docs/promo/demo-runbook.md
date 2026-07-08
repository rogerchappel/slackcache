# slackcache demo runbook

Use this runbook for public clips that must avoid private workspace history.
Every command uses synthetic fixture data.

## Local export-shaped handoff

```bash
npm install
npm run build
bash examples/local-handoff-demo.sh
```

Show:

- `fixtures/sample/channels.json`
- the import scope report
- a focused `deploy` search in `general`
- the thread output for `1777586400.000100`

## API-shaped incident handoff

```bash
bash examples/api-handoff-triage-demo.sh
```

Show:

- `fixtures/api/messages.json`
- the `agent-handoff` channel search
- the exact thread output from the local cache

## Scope-first report

```bash
bash examples/scope-report-demo.sh
```

Show the generated import, scope, and search text files when the clip needs to
lead with "what did we index?" before showing a message result.

## Claims to avoid

- Do not claim slackcache calls Slack APIs in V1.
- Do not claim enterprise compliance.
- Do not show private Slack exports.
- Do not say redaction catches every possible secret.
