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
the nightly suite.

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
