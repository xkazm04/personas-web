# AI process & harness: personas-web

Turns ad-hoc prompting into a repeatable, trustworthy part of how the team ships.

## Components
- [ ] Evals / golden tests for AI-generated output. Not applicable as model evals:
      this site calls no model at runtime. AI-authored *changes* are instead held to
      the deterministic suite listed under "Where things live".
- [x] A versioned prompt & agent library the team reuses
- [x] Agent runbooks for recurring tasks
- [x] A review gate / Definition-of-Done for AI changes

## Where things live
- Tests and gates every change (human or agent) must pass:
  - unit: `vitest.config.ts`, `src/**/*.test.ts` (`npm run test:unit`)
  - end-to-end: `e2e/*.spec.ts` (`npm run test:e2e`; nightly in CI)
  - repo invariants: `scripts/check-*.mjs` and `scripts/i18n/` (i18n coverage, encoding,
    ledger, guide content, sync rows, bundle budget), each wired as an `npm run check:*`
    script
- Prompt & agent library:
  - `.claude/CLAUDE.md`: the binding repo law every agent session loads
  - `.ai/manifest.yaml` `skills:`: the shared registry skills this repo uses (linked
    from `../ai-registry`, not copied); project-owned skills are real directories under
    `.claude/skills/`
  - `.claude/rules/ai-registry-*.md`: the registry knowledge loaded into every session
    (machine-local links made by `ai-registry/scripts/link-registry.mjs`, not committed)
- Runbooks for recurring agent tasks:
  - per-skill project overlays: `.claude/<skill>/config.md` (e.g. `.claude/perfect/config.md`,
    `.claude/architect/config.md`, `.claude/scan-sweep/config.md`)
  - `docs/features/INDEX.md`: one doc per submodule, with key files and known gotchas
  - `docs/decisions/`: recorded decisions and accepted risks (see its `README.md`)

## Review gate for AI changes
An AI-generated change is mergeable when all of the following hold:
1. The `checks` job in `.github/workflows/ci.yml` is green on the PR. It runs typecheck,
   lint (under the `--max-warnings` ceiling in `package.json`), unit tests, the i18n and
   guide gates, `next build`, and the bundle budget.
2. The pre-push hook installed by `scripts/install-git-hooks.mjs` (i18n coverage and
   encoding, guide content, English copy gate) passed locally.
3. It follows the conventions in `.claude/CLAUDE.md`: every user-facing string is translated
   in all 14 locales, motion is gated, and the commit message uses the
   `<pass-id>/<area>: ...` format with `Why` / `Risk` / `Verified` lines.
4. The agent did not push. The owner reads the log and pushes (CLAUDE.md "Git policy").
