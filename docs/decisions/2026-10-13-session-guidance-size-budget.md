# 2026-10-13 `.claude/CLAUDE.md` has a line budget that only goes down

## Context

`.claude/CLAUDE.md` is loaded at the start of every session, in full, before any work. Each release pass and convention has added a section, and nothing has taken one out. A long file costs every session context, and rules near the end compete with everything above them. The Commands section is what a session needs first, and it should not drift down the file. Nobody had set a size limit, so each addition looked free.

## Decision

1. **A line budget.** `src/lib/guidanceBudget.test.ts` fails `test:unit` when `.claude/CLAUDE.md` is longer than its budget. The budget is 260 lines, the length measured on 2026-10-13. That spec is the only place the number lives.
2. **The budget only goes down.** When a section moves out, lower the number in the spec in the same commit. If a new rule has to live in the root file, take out or move an older one first. Raising the budget is an owner's call, and the commit message has to say why.
3. **Commands stay near the top.** The same spec requires the `## Commands` heading to appear within the first 40 lines.
4. **New detail goes into scoped files, not the root.** Subtree rules belong in a scoped `CLAUDE.md` (`src/app/api/`, `src/lib/server/`, `scripts/`). Background reading belongs in a doc that the root links to in one line.

## Candidates to move out (needs a person: lanes may not edit `.claude/CLAUDE.md`)

| Section (lines on 2026-10-13) | Could become |
|---|---|
| Custom lint rules (182-200) | a pointer to `docs/conventions-enforcement.md` |
| OSS release passes (201-215) | a pointer to `docs/opus-4.7-oss-release-passes.md`; the list of completed passes is history, not law |
| Context Map, Feature docs, AI registry (216-260) | a pointer to `docs/AI_HARNESS.md` |
| Convention 10, dashboard loading tiers | a pointer to `docs/features/dashboard/loading-orchestration.md` |

Moving all four would bring the file to roughly 170 lines. Lower the budget in the spec once that lands.

## Not measured

Nobody has measured how well agents follow this file at any length, so no length here is backed by compliance data. If someone runs that measurement, record it here as a new record together with the file's length at the time.
