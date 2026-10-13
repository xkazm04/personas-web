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
the same set as the nightly job) on every PR to `master`, split with `--shard=N/4` across four
parallel jobs. The suite is slow because it runs serially in one job (`workers: 1`,
`fullyParallel: false`), not because any one spec is slow, so splitting the spec files is
what shortens the wait. Each shard still pays for install and build (about 3 minutes), then
runs about a quarter of the specs. A PR waits for the slowest shard: about 5 minutes
instead of 10.

- **Budget:** `timeout-minutes: 8` per shard, which leaves about 3 minutes of room for an
  uneven split. A shard that outgrows it fails. Then add a shard or speed the slow spec up.
  Do not raise the number.
- **Measurement:** every shard uploads its Playwright JSON report (`playwright-durations-N`,
  with per-test durations) even when it passes. Which specs make up the 10 minutes can then
  be read from a real run instead of guessed. Once a few runs have landed, rebalance or lower
  the budget from those numbers, and change `src/lib/e2eShardedTier.test.ts` in the same
  commit.
- **Not done here: a preview deploy.** Running against a preview URL would drop the
  per-shard build, but it needs deploy credentials and a hosting integration this
  repository does not have. Adding them is the owner's call.

`src/lib/e2eShardedTier.test.ts` (in `test:unit`) pins the PR trigger, the read-only token,
the shard count, the budget, the duration upload, and that the job runs the whole suite
(no spec list and no project filter). It also checks that every action is one another
workflow already pins to the same commit SHA.

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
