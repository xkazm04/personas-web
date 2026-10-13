# 2026-10-13 A lane that spends past twice the cost review line blocks the PR that adds to it

**Governs:** `scripts/report-lane-cost.mjs`, `src/lib/laneCostMutants.test.ts`

Status: the hard band and `--block-in` are built and mutation-tested. Wiring them into CI is a step for a person, because a lane may not edit `.github/`. The YAML is below.

## Context

Lane commits can declare what they cost (`Ascent-Tokens:`, `Ascent-Wall-Clock:`), and `node scripts/report-lane-cost.mjs` turns that into tokens per surviving change. Over `COST_REVIEW` (2,000,000 tokens on 10 or more costed commits), a lane gets a `REVIEW` line and the exit code stays 0. The rework meter has both halves: an advisory FLAG band, plus a hard band that fails the PR (`HARD_REWORK_BUDGET`, `--block-in`, `.github/workflows/agent-rework-hard-band.yml`). Cost had only the advisory half. So a lane could spend without limit, and nothing would ever turn red.

## What a merged change may cost

- **Acceptable:** at or under 2,000,000 tokens per surviving change. A cycle that resolves a batch of items and keeps its commit is well inside that.
- **Review:** over 2,000,000 tokens on 10 or more costed commits, or a lane where nothing it paid for survived. This is the existing `COST_REVIEW` line, and it stays advisory.
- **Hard band:** over 4,000,000 tokens per surviving change on 20 or more costed commits, or 20 costed commits with no survivor (`HARD_COST_BUDGET`). That is twice the line on twice the evidence, the same ratio the rework hard band uses against its FLAG band.

A lane with no trailers never blocks. It is unmeasured, not over budget, and the report says `no cost data` for it. Seconds are reported but not judged: wall-clock depends on the machine and the queue more than on the lane.

## Decision

`hardCostBlocks(rows, rangeLanes)` returns the lanes over the hard band that also have a commit in the range under review. `node scripts/report-lane-cost.mjs --block-in <pr-range>` prints a `BLOCK` line for each one and exits 1. A PR that adds nothing to an over-spending lane is never stopped by that lane's record.

An over-budget lane is narrowed, not paused, in the order set by [the lane-scope record](2026-10-13-lane-scope-narrowing.md) ("When a lane degrades" in `docs/AI_HARNESS.md`). The folder whose items cost the most goes to a person first. If the next window is still over the band, the lane is restricted to docs and tests. Only after that is it paused.

`src/lib/laneCostMutants.test.ts` applies 17 targeted mutations to the report and its bands, and every one must fail its rejection suite. The kill ratio is a ratchet at 1.

## Follow-up (needs a person)

- Add a step to `.github/workflows/agent-rework-hard-band.yml` after the rework step:

  ```yaml
      - name: Block a lane far over the cost budget that this PR adds to
        shell: bash
        env:
          BASE_REF: ${{ github.base_ref }}
        run: |
          set +e
          node scripts/report-lane-cost.mjs --block-in "origin/${BASE_REF}..HEAD" > lane-cost-hard.txt
          status=$?
          set -e
          cat lane-cost-hard.txt
          grep '^  BLOCK ' lane-cost-hard.txt | sed 's/^  BLOCK /::error title=Cost hard band::/' || true
          exit "$status"
  ```

- Move both numbers the first time a lane writes real trailers, in the same commit that records the measured figure in "What a lane's work cost" in `docs/AI_HARNESS.md`. Until the lane runner writes `Ascent-Tokens:`, every lane reads `no cost data` and the band cannot fire.
