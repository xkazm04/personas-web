# scripts — read before changing a gate or check script

These are pointers. The rules themselves live in the files named here, so this file cannot drift from them.

- Every `check:*` script and where it runs (CI, pre-push, manual) is the table in "## Gates" of `docs/AI_HARNESS.md`. `src/lib/guidanceScripts.test.ts` fails when a script and that table disagree, and `scripts/install-git-hooks.mjs` is what the pre-push column describes.
- `scripts/check-ai-change.mjs` and `scripts/report-agent-rework.mjs` are mutation-tested by `src/lib/aiChangeGateMutants.test.ts` and `src/lib/agentReworkMutants.test.ts`, and `scripts/report-lane-cost.mjs` by `src/lib/laneCostMutants.test.ts`. Each mutation's find-string occurs once in its script, so after an edit re-run those specs and move a mutation rather than delete it. See "## Review gate for AI changes" and "## Provenance" in `docs/AI_HARNESS.md`.
- This directory, `package.json` and the lint and test configs are owner-reviewed in `.github/CODEOWNERS`; a new command ships as a `node scripts/<name>.mjs` entry and the npm alias is the owner's step. Commit format is the **Commits** convention in `.claude/CLAUDE.md`.
- Decisions that govern the gate scripts here: `docs/decisions/2026-10-13-lane-commit-type-from-change.md` (what a lane commit's type and trailers say), `docs/decisions/2026-10-13-lane-scope-narrowing.md` (what happens when the rework meter flags a lane) and `docs/decisions/2026-10-13-lane-spend-hard-band.md` (the cost hard band).
