# Orchestration

slackcache is intentionally boring to orchestrate: local files go in, a local cache comes out, and no network calls happen unless a future command says so explicitly.

## Agent workflow

1. Receive or locate a Slack export/fixture directory.
2. Run `slackcache import <dir> --output ./.slackcache`.
3. Inspect the scope report before using the data.
4. Search narrow terms with optional `--channel` filters.
5. Open relevant threads with `slackcache thread <ts>`.
6. Hand off snippets only after reviewing redactions and user consent boundaries.

## Safety invariants

- V1 reads local JSON only.
- V1 writes one JSON index under the requested output directory.
- Redaction is enabled by default.
- The scope report is part of every import so agents know what they are touching.
- Fixtures are synthetic and safe for tests.

## Release gates

- `npm run check`
- `npm test`
- `npm run build`
- `npm run smoke`
- `bash scripts/validate.sh`
