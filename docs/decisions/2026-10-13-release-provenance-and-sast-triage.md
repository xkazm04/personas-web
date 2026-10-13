# 2026-10-13 Release provenance: what a consumer can verify today, and the two steps that close it

## Context

The supply-chain scan scores signed releases at zero, and the Semgrep job in `.github/workflows/security-scan.yml` is advisory (`continue-on-error: true`). This record states what the repository actually releases, what a consumer can check about it, and why an unattended lane cannot close either gap.

## What is released

- **No deploy bundle leaves CI as an artifact.** The site is built and served by its host. `ci.yml` builds only to check the bundle budget and uploads build stats, not something people consume.
- **The one consumable artifact is the CycloneDX SBOM.** `security-scan.yml` job `sbom` runs `npm sbom` on every push and PR and keeps it as `sbom-cyclonedx` for 30 days. It is unsigned. A consumer can see which workflow run produced it, and through that run which commit, but has no signature or attestation to verify against.

## Decision

Both gaps stay open, and both closing steps belong to a person:

1. **Provenance for the SBOM.** Resolve `actions/attest-build-provenance` to a commit SHA, pin it the way `ci.yml` pins its actions (SHA plus a trailing tag comment), and add a job that attests `sbom.cdx.json`. That job needs `id-token: write` and `attestations: write`. A lane has no network, so it cannot resolve the SHA, and a guessed SHA would break the workflow rather than pin it. Once this is done, `gh attestation verify sbom.cdx.json -R xkazm04/personas-web` ties the file to the commit and workflow that built it. Cosign keyless signing is the alternative, and it needs the same new pin.
   The job to add to `security-scan.yml`, once `<SHA>` and its tag are resolved (`gh api repos/actions/attest-build-provenance/commits/<tag> --jq .sha`, and the same for `actions/download-artifact`). The write scopes sit on this job only. The top-level `permissions: contents: read` stays as it is:

   ```yaml
     attest-sbom:
       name: attest sbom
       needs: sbom
       if: github.event_name == 'push'
       runs-on: ubuntu-latest
       timeout-minutes: 10
       permissions:
         contents: read
         id-token: write
         attestations: write
       steps:
         - uses: actions/download-artifact@<SHA> # v<tag>
           with:
             name: sbom-cyclonedx
         - uses: actions/attest-build-provenance@<SHA> # v<tag>
           with:
             subject-path: sbom.cdx.json
   ```

   It attests only on push to `master`, because a fork PR's token cannot get `id-token: write`. Extend `src/lib/securityWorkflow.test.ts` in the same commit so it pins the job's scopes and the new SHAs.
2. **Blocking SAST.** Run `pipx run --spec semgrep==1.90.0 semgrep scan --config p/default --metrics=off .` once on `master`. Fix each finding, or suppress it inline with `# nosemgrep: <rule-id>` and a one-line reason. Then delete `continue-on-error: true` from the `sast` job. That is an edit to an existing workflow, which unattended lanes may not make. After it, a new finding fails the job.

Meanwhile a narrower SAST job does block: `.github/workflows/sast-trust-boundary.yml` runs Semgrep with `--error` over `.github/semgrep-trust-boundary.yml`, rules that each name a failure this repo already has a written rule against (the `service_role` boundary, `eval`, `child_process` in an API route). They matched nothing when written, so they needed no triage. Step 2 still stands for the broad ruleset.

When either step lands, update the checklist in `SECURITY.md` and the shape pinned by `src/lib/securityWorkflow.test.ts` in the same commit.

## Alternatives rejected

- **A homemade checksum manifest uploaded next to the SBOM.** It would sit in the same artifact store, under the same token, as the file it claims to vouch for, so it proves nothing a consumer couldn't already see from the run. It would also read as "signed" in a checklist when it isn't.
