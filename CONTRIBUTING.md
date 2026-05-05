# Contributing

Thanks for helping make Slack archive workflows safer and more useful.

## Local setup

```bash
npm install
npm run check
npm test
npm run smoke
```

## Principles

- Keep local-first behavior boring and obvious.
- Never add network access to an existing command silently.
- Prefer deterministic fixtures over live services in tests.
- Add scope reporting for any new importer capability.
- Treat Slack exports as sensitive personal/company data.

## Pull requests

Please include:

- What changed and why.
- Any privacy or security implications.
- Fixture-backed tests for parser/search changes.
- CLI smoke coverage for user-visible behavior when practical.
