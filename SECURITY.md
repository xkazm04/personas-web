# Security policy: personas-web

The shift-left guardrail against the vulnerable or secret-leaking code AI can confidently produce.

## Reporting a vulnerability
**Draft: the private reporting channel and response time are pending an owner decision.**
Until one is published here, do not open a public issue for a suspected vulnerability.
Contact the repository owner privately through their GitHub profile instead.

## Automated guardrails we run
- [ ] SAST (e.g. CodeQL/Semgrep) running on every PR. Not wired yet.
- [ ] Dependency + secret scanning wired into CI (Dependabot/Snyk, gitleaks). Not wired yet.
- [ ] Container image scanning. Not applicable: no container images are shipped.
- [ ] SBOM + signed, attested build artifacts (cosign/SLSA). Not wired yet.

## Notes
What does run today:
- `.github/workflows/ci.yml`: typecheck, lint, unit tests, i18n and guide gates, build and
  bundle budget on every push and PR to `master`. Every third-party action is pinned to a
  commit SHA, with its tag in a trailing comment.
- `scripts/install-git-hooks.mjs` (run by `npm install` via `prepare`): a pre-push hook for
  the i18n, guide and copy gates.
- `src/lib/sentry-pii.ts`: scrubs PII from every Sentry event.
- The `service_role` key boundary (`.claude/CLAUDE.md` §6): the key may only be read inside
  modules that begin with `import "server-only"`.
- `docs/threat-model.md`: one page joining the API routes, the `TEAM_API_KEY` and
  `service_role` boundaries, paired-device trust and the accepted risks, with a checklist for
  a new route. `src/lib/threatModelCoverage.test.ts` fails `test:unit` when a route under
  `src/app/api/` has no row there.
- `docs/decisions/`: accepted security risks, e.g.
  `2026-10-09-accepted-risk-unsafe-inline-script-src.md`.
