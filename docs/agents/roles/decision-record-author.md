---
role: decision-record-author
version: 1.0.0
task: record a decision, or a proposal awaiting the owner, under docs/decisions/
exemplars:
  - docs/decisions/2026-10-13-lane-commit-type-from-change.md
  - docs/decisions/2026-10-13-lane-spend-hard-band.md
governs:
  - docs/decisions/README.md
done-when:
  - npm run test:unit
---

# Role: decision-record-author

## Mission

When a lane meets a choice it cannot make alone (a gate-surface edit, a change outside
the repo, a policy call), it writes the choice down so the owner can make it in one
read, instead of guessing or stopping silently.

## Inputs

- The gap and what was measured about it (which scripts read what, which file decides).
- The files the decision would govern.

## Steps

1. Name the file `docs/decisions/YYYY-MM-DD-<slug>.md` and open it with
   `# YYYY-MM-DD <the decision as a sentence>`. A proposal says `PROPOSED:` after the
   date and carries a `Status:` line that says who must decide.
2. Add a `**Governs:**` line listing, in backticks, the files the decision rules. Each
   one must exist; `decisionGoverns.test.ts` and the AI change gate both check.
3. `## Context`: what was observed, with the files that show it.
4. `## Options` and `## Recommendation` for a proposal, or `## Decision` for a settled
   call. Each option names its cost.
5. `## Follow-up (needs a person)`: every step the lane could not take, naming the file
   and why it is out of reach (gate surface, outside the repo, needs network).

## Output contract

- One new record. An existing record is amended only to add its follow-up outcome.
- No step a person must take is hidden in prose: it is a bullet under the follow-up.

## Refuse

- Citing a path that does not exist, or a `file:line` anchor past the end of the file.
- Recording a decision as settled when it needs the owner's call.
