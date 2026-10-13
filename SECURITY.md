# Security policy: personas-web

The shift-left guardrail against the vulnerable or secret-leaking code AI can confidently produce.

## Reporting a vulnerability
**Draft: the private reporting channel and response time are pending an owner decision.**
Until one is published here, do not open a public issue for a suspected vulnerability.
Contact the repository owner privately through their GitHub profile instead.

## Automated guardrails we run
- [x] SAST on every push and PR to `master`: Semgrep (its default registry ruleset) in
  `.github/workflows/security-scan.yml`, job `sast`. Advisory for now: findings print in the
  job log without failing it until the first baseline is triaged; then delete its
  `continue-on-error` to make it blocking. CodeQL is not wired: it needs an action this repo
  does not pin yet, so adding it is an owner step.
- [x] Secret scanning on every push and PR to `master`: detect-secrets over the changed files,
  in `.github/workflows/security-scan.yml`, job `secrets`. Blocking: a new secret fails the job.
- [x] Dependency updates: `.github/dependabot.yml`, weekly PRs for npm and GitHub Actions.
- [ ] Container image scanning. Not applicable: no container images are shipped.
- [~] SBOM: a CycloneDX SBOM (`npm sbom`) is built on every push and PR in
  `.github/workflows/security-scan.yml`, job `sbom`, and kept as the `sbom-cyclonedx` artifact.
  Signed, attested build artifacts (cosign/SLSA) are not wired yet. The SBOM is the only
  released artifact; the steps that would attest it and make SAST blocking are in
  `docs/decisions/2026-10-13-release-provenance-and-sast-triage.md`.

The shape of `.github/workflows/security-scan.yml` and `.github/dependabot.yml` (triggers,
read-only token scope, time budgets, exact scanner versions, a blocking secret scan, and only
actions already pinned by SHA elsewhere) is held by `src/lib/securityWorkflow.test.ts`.

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
