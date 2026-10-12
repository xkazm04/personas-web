# scripts — read before changing a gate or check script

These are pointers. The rules themselves live in the files named here, so this file cannot drift from them.

- Every `check:*` script and where it runs (CI, pre-push, manual) is the table in "## Gates" of `docs/AI_HARNESS.md`. `src/lib/guidanceScripts.test.ts` fails when a script and that table disagree, and `scripts/install-git-hooks.mjs` is what the pre-push column describes.
- `scripts/check-ai-change.mjs` and `scripts/report-agent-rework.mjs` are mutation-tested by `src/lib/aiChangeGateMutants.test.ts` and `src/lib/agentReworkMutants.test.ts`. Each mutation's find-string occurs once in its script, so after an edit re-run those specs and move a mutation rather than delete it. See "## Review gate for AI changes" and "## Provenance" in `docs/AI_HARNESS.md`.
- This directory, `package.json` and the lint and test configs are owner-reviewed in `.github/CODEOWNERS`; a new command ships as a `node scripts/<name>.mjs` entry and the npm alias is the owner's step. Commit format is convention 7 in `.claude/CLAUDE.md`.
