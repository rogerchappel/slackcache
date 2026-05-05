# Security Policy

## Supported versions

slackcache is pre-1.0. Please use the latest release from `main` or npm once published.

## Reporting a vulnerability

Open a private GitHub security advisory or contact the maintainer directly. Please do not paste private Slack exports into public issues.

## Data handling promises

- V1 performs no network calls.
- V1 does not look for credentials outside the explicit input directory.
- V1 redacts common sensitive patterns by default.
- V1 test fixtures are synthetic.

If you find behavior that violates those promises, treat it as a security bug.
