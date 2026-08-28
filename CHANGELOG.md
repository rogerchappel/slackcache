# Changelog

## Unreleased

- Upgrade GitHub Actions dependencies (`actions/checkout` and `actions/setup-node`) to `v7` across CI, release, and release dry-run workflows.
- Upgrade dev dependencies `@types/node` to `^26.4.0` and `typescript` to `^6.0.3` with explicit `types` configuration in `tsconfig.json`.
- Omit user profile emails from caches under default redaction and include them in scope reporting as `profile-email` redactions.
- Keep thread results within the selected root channel and require `--channel` when a timestamp is ambiguous across channels.

## 0.1.0

- Initial local-first Slack archive cache MVP.
- Added export/API fixture import, redaction, scope reporting, search, thread view, tests, and smoke scripts.
