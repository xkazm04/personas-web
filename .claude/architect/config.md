---
product: "personas-web"
stack: "Next.js 16 App Router + React 19 + TS 6 + Tailwind 4 + Zustand 5 + framer-motion + Sentry + Supabase (roadmap/voting only); marketing site + demo dashboard on mocks; i18n = 14-locale local bundle"
vault: ["C:/Users/kazda/Documents/Obsidian/personas", "C:/Users/mkdol/Documents/Obsidian/personas"]
vault_subdir: ArchitectWeb
context_map: context-map.json
coverage_context_source: "context-map.json context names (no .personas/ dir on this machine -> coverage nodes are skipped, not mis-anchored)"
base_branch: master
worktree_root: .claude/worktrees
active_runs_ledger: ""
---

# architect overlay - personas-web

`vault_subdir` is **ArchitectWeb**. `Architect/` in the same vault belongs to the **desktop** repo
(`personas`: Rust/Tauri, ts-rs bindings, cargo, IPC) - never write there. Same split as
`Perfect/` (desktop) vs `PerfectWeb/` (this repo).

Concurrent Claude sessions share this working tree (see user memory). Never sweep: stage exact paths,
verify `git diff --cached --stat` before every commit, and prefer the Phase 7a worktree.

## Context sources
1. `context-map.json` (repo root) - 12 groups / 56 contexts; the authority for area scope and file
   lists. **Check `generatedAt` against `git log --oneline --since=<date> | wc -l`** - it drifts fast
   (was 301 commits stale on 2026-08-28) so treat its file lists as indicative and re-verify reach.
2. `.claude/CLAUDE.md` - binding project rules (i18n contract, tokens, React 19 purity, Sentry PII,
   Supabase guards, out-of-scope walls). `AGENTS.md` carries the Next-16-is-not-your-training-data
   warning: read `node_modules/next/dist/docs/` before writing Next-specific code.
3. `docs/features/INDEX.md` + `docs/features/<group>/*.md` - one doc per submodule, each with a
   `Conventions & gotchas` section recording real prior findings. Feed the relevant doc to every
   sub-agent; its gotchas are pre-scouted evidence to verify, not to re-discover.
4. `.claude/design.md` - read before any UI work.

## Area menu
Derived from `context-map.json` groups (12; the 8 with the most structural surface):
1. Platform Foundation: Shell, UI & Motion
2. Observability & Event Monitoring (dashboard, 8 contexts)
3. Interactive Demos & Playground (6 contexts)
4. Product Documentation (Guide) (4 contexts, 14 locales)
5. Marketing & Landing (6 contexts)
6. Infrastructure & Telemetry (6 contexts)
7. Product Feature Showcase (4 contexts)
8. Theming, i18n & Shared Utilities (3 contexts)

## Theme menu
Beyond the built-in nine, themes that fit this repo:
- `rendering-boundary` - RSC/client seam, static vs dynamic, metadata coverage, hydration
- `i18n-contract` - the 14-locale obligation as a structural system (key shape, encoding, coverage)
- `motion-system` - shared primitives vs copy-paste, reduced-motion coverage, mount cost
- `demo-data-realism` - mock layer shape and its seam with the real orchestrator client

## Gates
- baseline: `npm run typecheck`, `npm run lint`, `npm run test:unit`
- step: `npm run typecheck`, `npm run lint`
- final: `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`
- when any `src/i18n/*` touched: `npm run check:i18n-encoding` + `npm run check:i18n-coverage`
- when guide content touched: `npm run check:guide-content`, `check:guide-coverage`,
  `check:guide-translations`
- slow: `npm run build`, `npm run test:e2e` (background them)

**`npm run lint` is a ratchet**: `eslint --max-warnings 24`. The metric is delta on touched files;
when you fix a warning, lower the number in `package.json` in the same commit.

## Repo law
`.claude/CLAUDE.md` is binding in full. Load-bearing points for architect rollouts:
- **i18n**: every user-facing string goes to `src/i18n/en.ts` first, then HAND-TRANSLATED into all 13
  other locales (ar bn cs de es fr hi id ja ko ru vi zh) in the same commit. English placeholders are
  forbidden. No hardcoded English in JSX, `aria-label`, `alt`, or page `metadata`. Anchor Edit
  `old_string` on ASCII context in locale files - they hold non-ASCII the console renders as `?`;
  `npm run check:i18n-encoding` is the arbiter, not the terminal.
- **Tokens**: semantic Tailwind only (`text-foreground`, `bg-surface`, `border-glass`,
  `text-brand-cyan`); never `text-white`/`bg-black`/raw hex. Text opacity below `/60` is a lint warning.
- **Motion**: `requestAnimationFrame`/canvas motion must gate on `useReducedMotion` (the custom rule
  sees only raw rAF - CSS and framer motion must be gated by hand). Follow the established SVG-motion
  pattern; components under 200 LOC (`custom-quality/max-tsx-lines`).
- **React 19 purity**: no sync `setState` in a `useEffect` body (prev-state pattern); no
  `Math.random`/`Date.now`/`new Date()` in render or a `useMemo` factory (lazy `useState(() => ...)`).
- **Sentry**: new breadcrumb/`extra` data must pass `src/lib/sentry-pii.ts` shapes.
- **Supabase**: anon key only, guard every call on URL+key presence, fall back to mocks/no-ops.
- **Dashboard is demo-only**: extend `src/lib/mockApi.ts` / `src/lib/mock-dashboard-data.ts`; never
  call the orchestrator directly from `/dashboard/*`.
- **Docs**: update the mapped `docs/features/*.md` in the same commit as the feature change, and
  `context-map.json` when a change moves which files a context owns.
- **Out-of-scope walls**: no route-path changes under `src/app/` without confirmation; no Supabase
  schema/RLS changes; no new runner/bundler/linter; no `.env*` commits beyond `.env.example`; no bulk
  locale migrations beyond the keys the change needs.

## Docs vehicles
- `docs-rules` -> `.claude/CLAUDE.md`, under **Conventions (non-negotiable)** as a numbered
  subsection (loaded every session). Keep additions to 10-25 lines.
- `docs-arch` -> the mapped `docs/features/<group>/<submodule>.md`, in its
  `Conventions & gotchas` section. Repo-wide architecture facts go to `docs/features/INDEX.md`.

## Lint vehicle
`eslint-rules/<kebab-name>.js` (5 rules exist: `max-tsx-lines`, `no-confusable-minus`,
`no-low-text-opacity`, `no-multi-zustand-selector`, `require-animation-gating`). Register in
`eslint.config.mjs` under a `custom-<domain>` plugin namespace (`custom-a11y`, `custom-animation`,
`custom-zustand`, `custom-quality`). Default severity `warn`; `error` only for a mechanical
zero-tolerance shape (the `no-confusable-minus` precedent). A new `warn` rule must not push the
warning count past the `--max-warnings` ceiling - raise the ceiling in the same commit only with an
explicit note, otherwise fix to fit.

## Test guard vehicle
vitest (`npm run test:unit`, `src/**/*.test.ts`). Structural-guard precedent:
`src/lib/no-raw-sentry-capture.test.ts` - walks the source tree and asserts zero violations. Put a new
guard beside the code it guards, or in `src/lib/` when it is repo-wide. Playwright specs live in
`e2e/` (`e2e/smoke-routes.ts` is the shared route list).

## Smoke
`npm run dev` (Turbopack). **Port 3000 may be a stale production instance that 404s - the dev server
usually lands on 3001**; probe the port before trusting a 404. In a browser, verify by page `<title>`.
The preview window cannot be resized, so mobile breakpoints are not verifiable that way; a
backgrounded tab freezes framer-motion, so layout readings are trustworthy but animation state is not.
`npm run test:e2e` drives the real routes headlessly and is the honest fallback.

## Baseline exclusions
- The 14-locale bundle's non-ASCII content: a `?` in a console is a rendering artifact, not
  corruption. Verify bytes / run `check:i18n-encoding` before ever calling a locale file damaged.
- **Cache Components** (`cacheComponents` / `use cache`): evaluated and REVERTED 2026-08-09 - no
  navigation win (the site is already static), it costs SSG, `app/template.tsx` retained stale DOM
  after client nav, and the blocker is `usePathname()` in the root layout. Do not re-propose the
  migration as a finding; a finding that REMOVES the `usePathname()` blocker is still fair game.
- Marketing-stream i18n descope (Stream-1): descoped by decision, do not re-suggest.
