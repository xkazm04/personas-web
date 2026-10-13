# 2026-10-13 PROPOSED: a lane commit's type names the change; the trailer names the lane

**Governs:** `scripts/check-ai-change.mjs`, `scripts/report-agent-rework.mjs`

Status: proposed. Needs the owner's call; the change lands in the lane runner, which lives outside this repo.

## Context

Ascent lane commits are typed `fix:` whatever they do: "fix: Added scripts/i18n/check.mjs entry point", "fix: Added blocking trust-boundary Semgrep workflow and spec". A workflow, a spec and a doc all arrive as repairs, so the conventional prefix tells a reader scanning `git log` nothing about what kind of change landed.

Two consumers were checked:

- `compile:changelog` (`scripts/compile-changelog.mjs`) does not read commit types at all. It reads the `### Added/Changed/Fixed/Removed` sections of `CHANGELOG.md`. So a wrong type does not corrupt the public changelog, and a right one would not feed it either.
- The rework meter (`scripts/report-agent-rework.mjs`) does read the type: a `fix:` is a candidate repair of an earlier commit. Because lane commits are all `fix:`, the meter has to undo the habit, and only counts a `fix:` that `commitTypeAdvice` in `scripts/check-ai-change.mjs` leaves alone (an additive "fix: Added ..." is not a repair). The habit is therefore load-bearing noise: every lane `fix:` is first treated as a repair, then excused.

The `fix:` prefix is not what identifies a lane commit. Provenance already lives in trailers: `Ascent-Resolves: <id>` for Ascent lanes and `Co-Authored-By: Claude` for agents, which both scripts parse (see "## Provenance" in `docs/AI_HARNESS.md`).

## Options

1. **Keep `fix:` for every lane commit.** Costs: the prefix carries no information, and the rework meter keeps its excuse branch forever.
2. **Let the lane runner choose the type from the change**, using the rules `commitTypeAdvice` already applies as advice: a subject opening with an additive verb ("Added", "Introduce", "New") is `feat:`; a commit touching only docs, tests or CI is `docs:`, `test:` or `ci:`; a repair stays `fix:`; a restructure with no behaviour change is `refactor:`. The rules are pinned by `src/lib/commitTypeAdvice.test.ts`, so the runner and the gate would agree by construction.
3. **Move the lane marker into the type** (`ascent:` or a scope like `fix(ascent):`). Costs: it repeats what `Ascent-Resolves:` already says, and it breaks conventional-commit tooling that expects a known type.

## Recommendation

Option 2. The type says what changed; the `Ascent-Resolves:` trailer says which lane and which item. Nothing in this repo has to change for it: the gate already advises on a misnamed type, and the rework meter already counts only a `fix:` the advice leaves alone, so a lane that types its commits correctly simply stops triggering both.

## Follow-up (needs a person)

- Change the lane runner's commit template to take the type from the change, applying the `commitTypeAdvice` rules. The runner is outside this repo.
- Once lane commits carry real types, decide whether the gate's type advice should fail rather than advise for commits that carry `Ascent-Resolves:`. That is a gate-script edit, and `src/lib/aiChangeGateMutants.test.ts` pins the script's snippets.
