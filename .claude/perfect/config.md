---
product: "personas-web"
stack: "Next.js 16 App Router + React 19 + TS + Tailwind 4 + Zustand 5; marketing site + demo dashboard on mocks; i18n = 14-locale local bundle"
vault: ["C:/Users/kazda/Documents/Obsidian/personas", "C:/Users/mkdol/Documents/Obsidian/personas"]
vault_subdir: PerfectWeb
base_branch: master
wave_size: 3
lot_caps: {}
pool_target: 10
round_shape: pool
cooldown_rounds: 2
commit_format: "perfect/<context-slug>: <title>"
context_map: context-map.json
active_runs_ledger: .claude/active-runs.md
locale_count: 14
---

# perfect overlay - personas-web

`vault_subdir` is **PerfectWeb** - `Perfect/` in the same vault belongs to the desktop repo's loop; never
write there. The active-runs ledger is optional here: if `.claude/active-runs.md` exists, surface
overlaps and append this session's entry; otherwise skip. Concurrent sessions share this working tree
(see memory) - never sweep.

Commit message format (repo convention), plus the `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` footer:
```
perfect/<context-slug>: <direction title>

Why: <the user value in one line>
Risk: <low|med|high + rationale>
Verified: <tsc|lint|test:unit|build|playwright>
```

## Gates
- always: `npm run typecheck`, `npm run lint`, `npm run test:unit`
- when any `src/i18n/*` file touched: `npm run check:i18n-encoding`
- before ending a build session: `npm run build`
- slow: none
- builder: `npm run typecheck`, `npm run lint`, `npm run test:unit` (all foreground), and drive the
  actual flow when a dev server is available; report what you COULD NOT verify honestly.

## Class B
- `src/i18n/index.ts` exports
- `src/i18n/<locale>.ts` locale bundles (every lot adds its own keys to en + 13 locales in the same
  commit; anchored insert on ASCII context - never rewrite a locale file whole)

## Class C
- the git index
- `context-map.json` (update it when a direction changes which files a context owns - CLAUDE.md
  demands it; Director applies)
- no codegen in this repo

## Repo law
Authority: `.claude/CLAUDE.md` is binding in full; read `.claude/design.md` before any UI work.
- Every user-facing string: add the key to `src/i18n/en.ts` first, then HAND-TRANSLATE into all 13
  other locales (ar, bn, cs, de, es, fr, hi, id, ja, ko, ru, vi, zh) in the same commit - English
  placeholders are forbidden. Never hardcode English in JSX, aria-label, alt, or page metadata. Anchor
  Edit old_string on ASCII context in locale files (they contain non-ASCII that consoles render as
  `�`). Run `npm run check:i18n-encoding` after touching any locale file.
- Semantic Tailwind tokens only (`text-foreground`, `bg-surface`, `border-glass`, `text-brand-cyan`,
  ...) - never `text-white`/`bg-black`/raw hex. Text opacity below /60 is a lint warning (WCAG AA).
- Any requestAnimationFrame / canvas / GPU-intensive motion MUST gate on `useReducedMotion` from
  framer-motion (custom lint rule enforces it).
- React 19 purity: no sync setState in useEffect bodies (use the prev-state pattern); no
  Math.random/Date.now/new Date() in render or useMemo - lazy `useState(() => ...)`.
- Sentry: new breadcrumb/extra data must pass the `src/lib/sentry-pii.ts` scrubber shapes.
- Supabase: anon key only; guard every call on URL+key presence, fall back to mocks/no-ops.
- Dashboard routes are demo-only: extend `src/lib/mockApi.ts` / `mock-dashboard-data.ts`, never call
  the orchestrator directly.
- Follow the established SVG-motion pattern (reduced-motion gating, transform-box/view-box, brand CSS
  vars, components < 200 LOC).
- Update the mapped `docs/features/*.md` in the same commit as the feature change.
- Review conventions (Director): semantic Tailwind tokens, `useReducedMotion` gating, React 19 purity
  rules, i18n completeness across all 14 locales, Sentry-PII scrubbing, Supabase guards. i18n review
  calibration: hand-translation into all 13 non-en locales is part of the acceptance bar (no English
  placeholders); anchor locale-file review on bytes, not console rendering - PowerShell renders
  non-ASCII as `�` without the file being corrupted; `npm run check:i18n-encoding` is the arbiter.
- Out-of-scope walls (CLAUDE.md): no route-path changes without confirmation, no Supabase schema/RLS
  changes, no new runners/bundlers, no `.env*` commits, no edits to `.claude/commands/goal-analysis-*.md`.

## Context sources
- `context-map.json` for the queue; coverage names per the Personas app (local DB `dev_contexts`, else
  `.personas/contexts.txt` when this machine's app dumped it).
- Each context maps to a `docs/features/*` doc: feed it to the scout - its "Conventions & gotchas"
  section is pre-scouted evidence the scout must verify still holds.

## Smoke
- Drive the actual flow when a dev server is available; no fixed port recorded - probe for the site's
  `<title>` marker.

## Opportunity arcs
- Web/desktop parity; the live-roadmap contract. Judged from context-map metadata, `docs/features/*`,
  and memory.
- Memory says this repo is **"already polished - verify before upgrading"**: it over-reports gaps at a
  distance; score headroom conservatively for showcase/motion contexts, and verify the actual component
  before claiming a gap.

## Vetoes
- Marketing-stream descopes; the Stream-1 i18n descope - "descoped, don't re-suggest".

## User taste
- For pure showcase contexts: **illustration-first "wow" design** - art as the whole component, the
  metric expressed through the medium - not plain bars and generic cards.
- The "engine" here is demo-data realism, the motion system, information architecture and page
  performance rather than backend algorithms; for contexts with real logic (voting API, orchestrator
  client, i18n plumbing, search index) most directions should be substance-level.
- i18n cost counts in sizing: a string-heavy feature is bigger than it looks (x14 locales).

## Skill improvement log
- (migrate the existing entries from `$VAULT/PerfectWeb/config.md` on the first 2.3 run, then append here)
- 2026-09-05 - **The `vault:` first candidate is a path from another machine** (`C:/Users/kazda/...`).
  SKILL.md's init rule says to CREATE the first named root when none exists; doing that here would have
  built a vault under a user that does not exist on this box. Resolved to the second candidate. Either
  drop the dead candidate or reorder it.
- 2026-09-05 - **`link-registry.mjs` does not scan `personas-web`.** `perfect` was declared in
  `.ai/manifest.yaml` but the junction had to be made by hand. Every future skill adoption here hits this.
- 2026-09-05 - **`src/i18n/*` as Class B is genuinely contended.** Three of four lots added keys in one
  wave and one lot's 14 locale edits were swept into another's commit by `git commit --only`. Nothing was
  lost and the ordering happened to be right (keys before consumers). Consider naming a locale owner per
  wave the way feature docs already get one.
- 2026-09-05 - **Lint has zero headroom**: `--max-warnings 24` with exactly 24 warnings present. Any
  direction that adds one warning fails the gate. Brief builders to check this before they start, not after.
- 2026-09-05 - **`MOCK_EVENTS` lives in `src/lib/mockData.ts`, not `mock-dashboard-data.ts`.** The overlay's
  repo-law line ("extend `mockApi.ts` / `mock-dashboard-data.ts`") sent a builder to the wrong file. Both
  exist; `mock-dashboard-data.ts` holds the swimlane/seeded-RNG fixtures, `mockData.ts` holds `MOCK_EVENTS`.
- 2026-09-05 - **`vitest.config.ts` is a v3-shaped config on vitest 4.** `coverage.all` already broke the
  typecheck tree-wide; the ESM-in-CJS config-loader warning is the next one due. Worth a direction.
- 2026-09-05 - **Playwright is unreachable from a build session** (no dev server, and builders are forbidden
  one). Any direction whose acceptance depends on a browser ships unverified and owes `/perfect smoke`.
  Say so in the direction note at proposal time, not at wrap.
