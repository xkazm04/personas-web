# Flaky e2e tests: where they are recorded

A Playwright test that fails, then passes on retry, is a flake. Rerunning the job until it goes green teaches everyone to ignore the gate, so each flake gets a written entry with an owner and a deadline instead.

## What already happens on a flake

`playwright.config.ts` sets `retries: 1` and, under CI, `failOnFlakyTests`. A flaky result therefore fails the run, and the trace from the first retry ships as the run's artifact. CI already tells you which test flaked and gives you the evidence. The register below is where that fact goes after the run.

## The register

`e2e/flaky-register.json` lists every known flaky test:

| Field | Meaning |
|---|---|
| `spec` | repo-relative path of the spec file, e.g. `e2e/smoke.spec.ts` |
| `test` | the test title as Playwright prints it |
| `owner` | the person or lane that will fix it, never empty |
| `addedOn` | date the entry was written (`YYYY-MM-DD`) |
| `expiresOn` | at most 14 days after `addedOn` |
| `seenIn` | link to the CI run whose artifact shows the flake |

`src/lib/flakyRegister.test.ts` runs in `test:unit`, which is CI's unit step. It fails when an entry has no owner, names a spec that does not exist, has a window longer than 14 days, or is past its `expiresOn`. An expired entry fails every branch, so a flake cannot sit in the register and be forgotten.

## Procedure

1. **Record.** When a run fails on a flake, open its trace artifact. Add an entry with the run link in `seenIn` and an owner who has agreed to take it, then re-run once.
2. **Fix or delete.** Before `expiresOn`, either fix the cause and remove the entry, or delete the test if it cannot be made deterministic. Renewing means writing a new `addedOn` and `expiresOn` with a reason in the commit message, and it is a smell. A second renewal is a decision for the owner of the spec.
3. **Never raise the window.** The 14-day limit is the `MAX_WINDOW_DAYS` constant in the spec. Do not lengthen it to make an entry pass.

## Not yet wired (needs a person)

- **Quarantine.** The register does not yet stop a listed test from running. Making Playwright skip listed tests (a `grepInvert` built from the register in `playwright.config.ts`) is a gate-config edit, which unattended lanes may not make. Until then the register records flakes and enforces deadlines, and CI keeps failing on them.
- **Flake rate.** How often the nightly suite fails only on its retry has not been measured. Read the last 30 nightly runs of the `e2e` job on the Actions page and count those that failed only on a flaky result, then record the count here.
