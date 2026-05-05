# slackcache tasks

## V1 implementation

- [x] Scaffold OSS CLI repository with StackForge.
- [x] Preserve the source PRD at `docs/PRD.md`.
- [x] Support Slack export directories with `users.json`, `channels.json`, and channel date JSON files.
- [x] Support API-style fixture directories with `messages.json`.
- [x] Build a deterministic local JSON cache index.
- [x] Redact emails, URLs, and token-shaped secrets by default.
- [x] Report cache scope: channels, users, messages, dates, and redaction counts.
- [x] Provide terminal search with channel and limit filters.
- [x] Provide terminal thread view from Slack timestamps.
- [x] Add fixture-backed unit tests and a real CLI smoke.
- [x] Document privacy boundaries and attribution to slacrawl.

## Follow-up backlog

- [ ] Add optional SQLite adapter behind a feature flag.
- [ ] Add richer Slack markup decoding.
- [ ] Add incremental import from previously cached exports.
- [ ] Add TUI mode for browsing channels and threads.
- [ ] Add explicit Slack Web API importer requiring user-supplied token and confirmation.
