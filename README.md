# slackcache

A small, local-first Slack archive CLI for people and agents who need fast context without quietly shipping workspace history anywhere.

`slackcache` imports Slack export/API fixture JSON, builds a deterministic local cache, redacts risky text by default, reports exactly what it indexed, then lets you search messages or open threads from the terminal.

## Why this exists

Slack history is often where decisions, incident context, and handoff notes live. The annoying part is that useful search workflows can become network-heavy, credential-hungry, or opaque. slackcache takes the opposite stance: fixture/export files in, local JSON index out, no hidden calls.

## Install

```bash
npm install -g slackcache
```

Or run from this repo:

```bash
npm install
npm run build
node dist/src/cli.js --help
```

## Quickstart

```bash
slackcache import ./fixtures/sample --output ./.slackcache
slackcache scope --index ./.slackcache
slackcache search "deploy" --index ./.slackcache --channel general --limit 5
slackcache thread 1777586400.000100 --index ./.slackcache --channel general
```

`inspect` is an alias for `import` for PRD compatibility:

```bash
slackcache inspect ./fixtures/sample --output ./out
```

## Supported input shapes

### Slack export directory

```text
export/
  users.json
  channels.json
  general/2026-05-01.json
  random/2026-05-01.json
```

### API-style local fixture

```text
fixture/
  users.json
  channels.json
  messages.json
```

No Slack API requests are made in V1.

## Privacy and safety

- Redaction is on by default for emails, URLs, Slack-token-shaped strings, and generic `token=...` / `secret=...` patterns.
- Import prints a scope report: channel count, user count, message count, date range, and redaction counts.
- The cache is written only to the output directory you choose.
- There is no telemetry, credential scraping, publishing, or hidden network access.
- Use `--redact false` only for trusted local workflows where raw text is acceptable.

## Agent handoff example

```bash
slackcache import ~/exports/acme-slack --output /tmp/acme-cache
slackcache search "auth panic" --index /tmp/acme-cache --channel incidents
slackcache thread 1777586400.000100 --index /tmp/acme-cache --channel incidents
```

The workflow is intentionally reviewable: import scope first, search narrow, inspect the exact thread, then decide what context is safe to pass along.

## Runnable demo

After building the local CLI, run the fixture-backed handoff demo:

```bash
npm run build
bash examples/local-handoff-demo.sh
```

The script imports `fixtures/sample`, prints the scope report, searches for a deploy handoff, and opens the matching thread from a temporary local cache.

## Source attribution

slackcache is a renamed, fresh implementation inspired by the local Slack archive/search direction of [`slacrawl`](https://github.com/vincentkoc/slacrawl) by Vincent Koc. This project does not copy slacrawl code or reuse its name; it preserves attribution while exploring a TypeScript, fixture-first, privacy-focused MVP.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## License

MIT
