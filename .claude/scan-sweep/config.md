# scan-sweep overlay - personas-web

Project configuration for the registry's `/scan-sweep` skill (linked from
`.claude/skills/scan-sweep`, declared in `.ai/manifest.yaml`). Keys not set here run on the
skill's defaults.

| Key | Value |
| --- | --- |
| `contextMap` | `context-map.json` |
| `memoryOutbox` | `.personas/memory-outbox.jsonl` (no `.personas/` on this machine - the app does not ingest here; the open-backlog register is the durable record) |
| `backlogDigest` | `.personas/backlog-digest.json` (absent) |
| `openBacklogs` | `.claude/scan-history/open-backlogs.jsonl` |
| `neverSweep` | none |
| `challenge.cohort` | 6 |
| `challenge.waveSize` | 4 |
| `challenge.worktrees` | `false` - a worktree can run tsc/lint/vitest through a node_modules junction, but Turbopack rejects the junction, so `npm run build` only runs in the main checkout |
| `challenge.sharedSurfaces` | `src/i18n/*.ts` (all 14 locale bundles), `context-map.json`, `package.json` (`lint --max-warnings` ratchet), `bundle-budget.json`, `docs/features/INDEX.md` |
| `challenge.integrationGate` | `npm run typecheck && npm run lint && npm run test:unit && npm run check:i18n-coverage && npm run check:i18n-encoding && npm run build && npm run check:bundle` |

Never-re-propose sources beyond the skill's own: `ArchitectWeb/backlog.md` and
`PerfectWeb/directions/` in the Obsidian vault named by `.claude/perfect/config.md`,
`.claude/ship-loop/backlog.md`, `.claude/scan-baseline/baseline.json`, and `deviation` rows in
`.ai/registry-map.json`.

## Gates

Run each in its own invocation, asserted by exit code (`cmd > log 2>&1; rc=$?; tail log; test $rc = 0`).

- always: `npm run typecheck`, `npm run lint` (warning ceiling is the `--max-warnings` ratchet in
  `package.json` - lower it in the same commit when a fix removes a warning), `npm run test:unit`
- any `src/i18n/*` touched: `npm run check:i18n-coverage`, `npm run check:i18n-encoding`
- guide content touched: `npm run check:guide-content`, `npm run check:guide-coverage`,
  `npm run check:guide-translations`
- English copy touched: `npm run copy:check` (native-copy baseline ratchet)
- route weight may change: `npm run build` then `npm run check:bundle` (main checkout only)
- pre-push hook runs i18n coverage + encoding + guide content + copy check

## Challenge mode

Repo law a builder will trip - `.claude/CLAUDE.md` binds in full; read `.claude/design.md` before UI.

- i18n x14: every user-facing string in `src/i18n/en.ts` first, then HAND-translated into all 13
  other locales in the same commit (no English placeholders). Anchor Edits on ASCII context - the
  console renders non-ASCII as `?`/`�` without the file being corrupt; `check:i18n-encoding`
  is the arbiter. Locale files are a shared surface: take the lock, edit, commit alone, release.
- Semantic Tailwind tokens; text opacity floor /60 (lint rule).
- Motion: `useStillMotion` gate; reduced motion never decides markup in an SSR component; ambient
  loops stop on hidden tab (`usePageVisibility`).
- React 19 purity: no sync setState in effect bodies; no impure calls in render/useMemo.
- Dashboard is demo-only on mocks; never call the orchestrator.
- No route-path changes, no Supabase schema/RLS changes, no new runners/bundlers/linters.
- Unit tests are vitest, `environment: "node"`, `src/**/*.test.ts` only - acceptance cases are
  tests over pure TS logic modules.
- Update the context's `docs/features/*.md` in the same commit as the feature change; update
  `context-map.json` when a change moves which files a context owns.
- Commit format (CLAUDE.md §7): `<pass-id>/<area>: <what>` + `Why:` / `Risk:` / `Verified:` lines;
  challenge runs use pass-id `challenge`. Commit on the current branch with
  `git commit --only -- <paths>`; never push.
- Concurrent sessions share this working tree: never `git add -A`, never stash, never reset.

## Skill improvement log

- 2026-09-23 (3.5.1, first `--challenge`): run the gates BEFORE scouting. This checkout had an
  empty `node_modules` (needed `npm ci`, 4 min) and HEAD itself was red (`vitest.config.ts`
  `coverage.all`, removed in vitest 4) - both would have surfaced as builder failures.
- 2026-09-23: `git commit --only -- <file>` commits the WHOLE file, so it cannot keep a foreign
  session's uncommitted hunks out of a shared locale file - scouts and critic both recommended it
  as if it could. What worked: snapshot the foreign WIP into a branch through a temp index
  (`GIT_INDEX_FILE=... git add; write-tree; commit-tree`), verify byte-equal (hash-object for
  untracked files), then restore the paths to HEAD - with the operator's consent.
- 2026-09-23: a whole-locale sweep test (13 locales x 116 topics x 3) passes idle in <5s and timed
  out twice while four builders loaded the machine; give tree-wide sweep tests an explicit budget.
- 2026-09-23: the ~800-changed-line card ceiling was read inconsistently - 4 of 12 builders reported
  1160-1660 lines counting tests + 14 locale files. State whether tests and locale files count.
