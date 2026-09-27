# Security Policy

## Scope

BAD DECISION is a client-side browser game. The current implementation stores gameplay progress locally in the browser and does not use a project-owned backend for its core game state.

Security concerns can still involve:

- Dependency vulnerabilities
- Client-side injection issues
- Unsafe handling of browser storage
- Accidental secret exposure
- Malicious modifications to the deployed application
- Supply-chain risks in dependencies

## Supported Versions

Security fixes are generally applied to the active development version.

| Version | Security Support |
|---|---|
| Current `main` | Supported |
| Older revisions | Not guaranteed |

## Reporting a Vulnerability

Please do not publish an unpatched vulnerability with reproduction details in a public issue.

Use the repository's available private security-reporting mechanism, such as GitHub Security Advisories, when enabled.

If private reporting is not enabled, open a general security contact request through the repository while avoiding sensitive exploit details. A private communication channel should be established before sharing proof-of-concept material.

A useful report should include:

- A short description
- Affected file or component
- Reproduction steps
- Expected behavior
- Actual behavior
- Impact assessment
- Relevant logs or screenshots
- A suggested mitigation, if known

## Secret Management

Never commit:

```text
.env
.env.local
.env.production
API keys
Access tokens
Private credentials
Private certificates
Service-account credentials
```

The repository's `.gitignore` excludes `.env*` files while allowing `.env.example`.

Use placeholder values in documentation and example configuration files.

## Dependency Security

Dependencies should be reviewed before upgrades.

Recommended checks:

```bash
npm audit
```

For Bun-based development, review dependency changes before committing the updated lockfile.

Do not blindly upgrade dependencies in production without checking:

- Breaking changes
- Build compatibility
- TypeScript compatibility
- Browser compatibility
- Known security advisories

## Client-Side Storage

Gameplay progress is stored in browser `localStorage`.

Do not store sensitive information in game progress or browser storage.

Browser storage should be treated as:

```text
Client-controlled
Non-secret
Modifiable
Potentially removable
```

The application should never rely on local progress data as proof of identity, authorization, payment, or access control.

## Third-Party Dependencies

The project uses third-party packages for UI, build tooling, animation, icons, and effects.

Dependency versions are defined in `package.json` and resolved through the package manager lockfile.

Changes to dependencies should be reviewed for:

- Maintainer trust
- Package provenance
- Known vulnerabilities
- License compatibility
- Unnecessary permissions or functionality

## Secure Development Checklist

Before release:

```text
[ ] No secrets committed
[ ] .env files excluded
[ ] Dependencies reviewed
[ ] npm audit reviewed where applicable
[ ] TypeScript check passes
[ ] Production build passes
[ ] User-controlled values are validated
[ ] localStorage data is treated as untrusted
[ ] Error messages do not expose secrets
[ ] Deployment configuration is reviewed
```

## Disclosure

Please allow reasonable time to investigate and address a reported issue before publicly disclosing technical exploit details.

Security reports should contain enough information to reproduce the issue without unnecessarily exposing credentials, personal data, or other sensitive information.
