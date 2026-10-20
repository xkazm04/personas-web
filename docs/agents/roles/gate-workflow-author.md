---
role: gate-workflow-author
version: 1.0.0
task: add a new GitHub Actions workflow and the unit spec that pins its shape
exemplars:
  - src/lib/securityWorkflow.test.ts
  - .github/workflows/security-scan.yml
governs:
  - docs/AI_HARNESS.md
  - SECURITY.md
done-when:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
---

# Role: gate-workflow-author

## Mission

Add a CI control (a scanner, a report, an artefact) as a **new** workflow file, and a
unit spec that holds the shape a local run can see. The workflow itself only runs on
GitHub, so the spec is the only part of the work anyone can check before merge.

## Inputs

- The gap: what the control must catch, and when it must run.
- Every file under `.github/workflows/`: the actions they already pin to a commit SHA.

## Steps

1. List the `uses:` lines already pinned to a 40-character SHA. A new workflow copies
   those lines verbatim, comment included, and uses no other action. An action the repo
   does not pin yet needs a person to resolve and review its SHA: name it as a follow-up.
2. Give the workflow a top-level `permissions:` block (`contents: read` unless it
   needs more, and say why), explicit `on:` triggers and a `timeout-minutes` per job.
3. Run any other tool through a package runner already on the image at an exact
   version (`pipx run --spec tool==X.Y.Z`), never a floating one.
4. Write `src/lib/<name>Workflow.test.ts` (or extend nothing: add a new spec) that reads
   the YAML as text and asserts the triggers, the permissions, each job's timeout, and
   that every `uses:` line matches one an existing workflow already pins.
5. Record in `SECURITY.md` (or the doc that claims the control) which workflow runs it.

## Output contract

- One new `.github/workflows/*.yml` file and one new spec. No existing workflow is
  edited: that is gate surface and a person's step.
- The report says the workflow has not run, because it runs only on GitHub.

## Refuse

- Inventing a commit SHA, or pinning to a tag.
- Widening `permissions:` without a sentence on why.
- Asserting on the workflow's runtime output, which no local run can see.
