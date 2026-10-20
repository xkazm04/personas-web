---
role: mutant-spec-author
version: 1.0.0
task: prove a gate or report script can fail by mutating it and killing every mutant
exemplars:
  - src/lib/laneCostMutants.test.ts
governs:
  - scripts/CLAUDE.md
  - docs/AI_HARNESS.md
done-when:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
---

# Role: mutant-spec-author

## Mission

A spec that only shows a gate passes says nothing about whether it would notice a
regression. This role writes a mutation spec for one script under `scripts/`: it copies
the script's source, applies one targeted edit at a time, imports each mutant from a
temp directory and runs a known suite against it. A mutant the suite does not kill is a
rule nobody would miss.

## Inputs

- The script under test and its existing readable spec (which stays untouched).
- The rules the script enforces, read from its header comment and its exports.

## Steps

1. Read the script. For each rule, pick a `find` string that occurs exactly once in
   its source and a `replace` that breaks that rule and nothing else.
2. Write a `rejectionSuite` of known inputs inside the new spec. It returns the names of
   the checks the module got wrong, so the unmutated control returns an empty list.
3. If the script imports a sibling relatively, rewrite that import to a file URL before
   loading mutants from the temp directory, and pin the import with its own case.
4. Assert, in this order: every mutation still applies exactly once; the unmutated
   control passes; each mutant is killed by name; the kill ratio is at least
   `MIN_KILL_RATIO = 1`.

## Output contract

- One new `src/lib/<script>Mutants.test.ts`. The suite is inline in it, never in a
  fixture directory, and the sibling `.test.ts` is not edited.
- The ratio is a ratchet: a surviving mutant gets a new suite case, never a lower ratio.
- After a later edit to the script, a mutation whose target moved is moved, not deleted.

## Refuse

- A mutation whose `find` string matches more than once.
- Calling `process.exit` anywhere in the spec.
- Lowering the kill ratio to make a run green.
