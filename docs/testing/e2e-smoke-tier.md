# E2E smoke tier (PR feedback)

The full Playwright suite takes about 10 minutes: it rebuilds the app and runs every spec
serially, one worker. That is too slow to run on every PR, so it runs nightly (`ci.yml`, job
`e2e`). Without a PR tier, the first e2e signal on a change arrived after merge.

`.github/workflows/e2e-smoke.yml` runs a small, fixed set of specs on every PR to `master`.

## What the tier protects

| Spec | Surface | Why it is in the PR tier |
|---|---|---|
| `e2e/smoke.spec.ts` | every public route, plus a walk of the demo dashboard | a page that throws or 404s is the most visible break |
| `e2e/csp.spec.ts` | Content-Security-Policy on every route | a CSP violation blanks scripts in production only, and nothing else catches it |
| `e2e/cookie-consent.spec.ts` | consent banner and the preference it stores | legal exposure if consent stops being asked or stored |
| `e2e/legal.spec.ts` | privacy, terms and cookie policy pages | legal pages the consent banner links to |

Everything else (tour, playground, locale matrix, reduced motion, dashboard views) stays in
the nightly suite, and since the sharded job below, also runs on every PR.

## Full suite on PRs

`.github/workflows/e2e-full-sharded.yml` runs the whole suite (every project and every spec,
the same set as the nightly job) on every PR to `master`, split across five parallel jobs.
The suite is slow because it runs serially in one job (`workers: 1`, `fullyParallel: false`),
not because any one spec is slow, so splitting the spec files is what shortens the wait. Each
shard pays for install and build (about 2 minutes), then runs its own group of spec files. A
PR waits for the slowest shard, about 5 minutes instead of 10.

- **Groups are listed by hand, not cut with `--shard=N/M`.** Playwright cuts the ordered spec
  list by test count. `locale-matrix.spec.ts` alone is 156 fast tests, so with four shards
  one shard held 238 tests, one held none, and shard 4 (`tour` plus the phone specs, about
  6 of the 8 minutes) was cancelled at the budget on 4 of 6 attempts (2026-10-20). The
  groups in the workflow matrix are weighted by the per-spec durations of real runs, so the
  longest group is about 170 seconds of tests.
- **Budget:** `timeout-minutes: 8` per shard, which leaves roughly 3 minutes of room. A shard
  that outgrows it fails. Then move specs between groups or add a group, and read the
  durations first. Do not raise the number.
- **Adding a spec:** put the new file in the lightest group. `src/lib/e2eShardedTier.test.ts`
  fails when a spec under `e2e/` is in no group (it would never run on a PR) or in two.
- **Measurement:** every shard uploads its Playwright JSON report (`playwright-durations-N`,
  with per-test durations) even when it passes. Rebalance from those numbers, and change
  `src/lib/e2eShardedTier.test.ts` in the same commit.
- **Not done here: a preview deploy.** Running against a preview URL would drop the
  per-shard build, but it needs deploy credentials and a hosting integration this
  repository does not have. Adding them is the owner's call.

`src/lib/e2eShardedTier.test.ts` (in `test:unit`) pins the PR trigger, the read-only token,
the shard groups and their coverage of every spec file, the budget, the duration upload, and
that the job applies no project or grep filter. It also checks that every action is one
another workflow already pins to the same commit SHA.

## Budget

The job has `timeout-minutes: 10`. Install and build take about 3 minutes (the `checks`
job, which also builds, takes about 3), and that leaves the specs about half of the
full suite's time. If the tier exceeds the budget, the job fails. Then move a spec back
to nightly. Do not raise the number.

`src/lib/e2eSmokeTier.test.ts` (in `test:unit`) pins the spec list, the PR trigger and
the budget. It also keeps the tier under half of the e2e specs, so the tier cannot grow
one spec at a time or quietly run nothing after a rename.

## Still to measure

The budget was chosen from the full suite's duration and has not been measured in CI
yet. After the first few PR runs, read the job's duration on the Actions page. If it
stays well under the budget, lower `timeout-minutes` and the matching constant in
`src/lib/e2eSmokeTier.test.ts` in the same commit.
