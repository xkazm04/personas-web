# Agent roles

A role is a versioned spec for one kind of work that agent lanes do here again and
again. A skill is a tool an agent calls; a role says how to do a task well: its inputs,
its steps, the shape of a good result and what to refuse. Hand the role file to the
agent (or name it in a lane's prompt) when the task matches it.

They live here rather than under `.claude/` because unattended lanes may not write
there (`docs/AI_HARNESS.md`, "## Skills"), and a role should be improvable by the lanes
that use it.

| Role | Version | Task |
| --- | --- | --- |
| [gate-workflow-author](gate-workflow-author.md) | 1.0.0 | a new workflow plus the spec that pins its shape |
| [mutant-spec-author](mutant-spec-author.md) | 1.0.0 | a mutation spec that proves a gate script can fail |
| [decision-record-author](decision-record-author.md) | 1.0.0 | a decision or proposal for the owner under `docs/decisions/` |
| [locale-translator](locale-translator.md) | 1.0.0 | a string change carried through all 14 locales |

## How a role is held

`src/lib/agentRoleSpecs.test.ts` (part of `npm run test:unit`) fails when:

- a role file has no semver `version`, or this table quotes a different one
- a role cites an exemplar or governed file that does not exist, or a `done-when`
  command that `package.json` does not define
- a role loses one of its sections (Mission, Inputs, Steps, Output contract, Refuse)
- a role file has no golden rule in the spec, or the reverse

The golden rule is the eval: the spec checks each role's merged exemplars against the
structure the role demands (a workflow spec that asserts triggers, permissions, timeouts
and SHA pins; a mutation spec with a ratchet at 1; a decision record with Context, a
choice, a follow-up and a Governs line naming real files; 14 locale files). A role
whose rules its own exemplars break is wrong, or the exemplar is: either way the spec
names it.

## Changing a role

Bump `version` (minor for a new step or rule, major for a changed output contract) in
the role file and in the table above in the same commit, and update the role's golden
rule in the spec when the output contract changes. A new role needs a golden rule and a
row here; add one only for a task lanes have done at least twice.
