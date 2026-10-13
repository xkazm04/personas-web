# 2026-10-13 PROPOSED: record which registry revision an agent ran with

Status: proposed. Needs the owner's call; nothing is wired yet.

## Context

`.ai/manifest.yaml` `skills:` lists the shared skills this repo uses (`conform`, `architect`, `native-copy` and the rest). Each one is a gitignored link from `.claude/skills/<name>` into `../ai-registry`, made by `ai-registry/scripts/link-registry.mjs`. The registry knowledge rules (`.claude/rules/ai-registry-*.md`) are linked the same way. The manifest records the registry's remote and local path, but not a revision.

So this repo cannot show which version of a skill produced a commit. Two agents on two machines, or one agent before and after a `git pull` in `../ai-registry`, can run different skill text against the same tree. A registry change can then change agent output here with no commit in this repo to point at. CLAUDE.md also invites editing a shared skill from this repo, which changes the registry file at once and leaves no trace in this repo's history.

Ascent worktrees and CI have no registry checkout at all (`docs/AI_HARNESS.md`, table under "What a fresh clone gets"), so today they run without the shared skills rather than with a different version.

## Options

1. **Git submodule at `../ai-registry` or `vendor/ai-registry`.** The pin is a gitlink every clone resolves. Costs: the registry is edited from many repos, and each edit would need a submodule bump in each consumer. That works against the "one file on this machine, live everywhere" design.
2. **A lock line in `.ai/manifest.yaml`** (`registry.rev: <sha>`), checked by `link-registry.mjs --check`. The check would fail when the local checkout's `HEAD` differs from the lock. Bumping the lock is a one-line, reviewable commit. A local skill edit still works, but `--check` reports it until the edit lands in the registry and the lock moves.
3. **A commit trailer** (`Registry-Rev: <sha>`) written by the lane runner and agents on every AI-authored commit. This records what ran without stopping anyone. It needs `scripts/check-ai-change.mjs` to require or advise on it. That file is gate surface, and `src/lib/aiChangeGateMutants.test.ts` pins its snippets.

## Recommendation

Options 2 and 3 together. The lock says which revision the repo expects, and the trailer says which revision actually ran. A mismatch is then visible in `git log` without blocking work. Option 1 gives up the live-link design for a pin that options 2 and 3 provide more cheaply.

## Follow-up (needs a person)

- Read the current registry `HEAD` (`git -C ../ai-registry rev-parse HEAD`) and add it to `.ai/manifest.yaml` as `registry.rev`. An unattended lane has no registry checkout and cannot read the SHA.
- Teach `ai-registry/scripts/link-registry.mjs --check` to compare `registry.rev` with the checkout. That lives in the registry repo.
- Decide whether `scripts/check-ai-change.mjs` should advise on, or require, a `Registry-Rev:` trailer when a commit carries `Ascent-Resolves:` or `Co-Authored-By: Claude`. This is a gate-script edit, so it needs a person.
