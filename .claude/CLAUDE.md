# CLAUDE.md

Guidance for Claude Code when working in this repository. Keep this file
accurate — it is read at the start of every session and shapes every
subsequent decision.

## Project

**personas-web** — Next.js 16 (App Router) marketing site, demo dashboard,
and supporting API routes for Personas, a multi-agent AI orchestration
platform. Stack: React 19, TypeScript 6, Tailwind 4, Zustand 5, Supabase
(roadmap/voting only), framer-motion, Sentry. i18n via a local 14-locale
bundle. Playwright for e2e; vitest for unit tests (`npm run test:unit`).

The `/dashboard/*` routes are **demo-only** in this repo, running on mocks
in `src/lib/mockApi.ts` + `src/lib/mock-dashboard-data.ts`. Real live data
goes through an external orchestrator (`NEXT_PUBLIC_ORCHESTRATOR_URL`).

See `README.md` for product overview and `.env.example` for env vars.

## Commands

```bash
npm run dev         # Next dev server (Turbopack)
npm run build       # production build + Sentry source-map upload (if configured)
npm run lint        # eslint (see custom rules below)
npm run typecheck   # tsc --noEmit
npm run test:unit   # vitest (src/**/*.test.ts)
npm run analyze     # Turbopack bundle analyzer (UI on :4000)
npm run check:bundle  # per-route first-load JS vs bundle-budget.json (needs a build first)
npm run test:e2e    # Playwright (specs under e2e/)
```

## Conventions (non-negotiable)

1. **i18n**: every user-facing string lives in `src/i18n/en.ts`. Access via
   `useTranslation()` → `t.namespace.key`. Other locales mirror the `Translations`
   interface shape. Keep all 14 locales in lockstep — add, update, and remove
   keys together to prevent translation gaps. When changing keys:
   - Add to `en.ts` first (the source of truth).
   - Translate into all 13 non-en locales (`ar`, `bn`, `cs`, `de`, `es`, `fr`,
     `hi`, `id`, `ja`, `ko`, `ru`, `vi`, `zh`). Do **not** use English
     placeholders — every user-visible string ships translated. `tsc` enforces
     the shape, but translation completeness is a hard requirement here too.
   - On rename/update: update every locale in the same commit.
   - On deletion: remove the key from every locale in the same commit.
   - Never introduce hardcoded English in JSX, `aria-label`, `alt`, or
     page `metadata`.

2. **Semantic Tailwind tokens**: use `text-foreground`, `bg-background`,
   `bg-surface`, `text-muted-dark`, `border-glass`, `border-glass-hover`,
   `text-brand-cyan`, `rounded-*`, etc. Avoid `text-white`, `bg-black`, raw
   hex colors. Text-opacity floor: see `custom-a11y/no-low-text-opacity`
   under **Custom lint rules**.

3. **Animation gating**: gate all motion behind a reduced-motion signal — see
   `custom-animation/require-animation-gating` under **Custom lint rules**.
   - Prefer **`useStillMotion`** (`src/hooks/useStillMotion.ts`) over framer's
     `useReducedMotion`. framer's hook samples the media query once, on the
     *client*, and answers `null` on the server — so it is neither SSR-safe nor
     live. `useStillMotion` wraps it in `useSyncExternalStore` with a
     `getServerSnapshot`, which React also uses for the hydrating render.
   - **Never let a reduced-motion value decide markup** in a component that
     server-renders. `if (reduced) return null` / returning a different element
     makes the server and the client's first render disagree, and React
     discards and re-renders the whole subtree — the most work possible for the
     visitors who asked for less. Gate the `animate`/`variants`/`transition`
     props instead, so DOM shape stays constant. (Components rendered only
     behind `next/dynamic({ ssr: false })` or `<LazyMount>` never server-render
     and are exempt.)
   - Infinite loops reduce to **stillness**, not to a faster loop.
   - An **ambient** loop (one that runs for as long as it is mounted) must also
     stop when the tab is backgrounded: add `usePageVisibility()`
     (`src/hooks/usePageVisibility.ts`) to its guard, or `useIsVisible()` when
     it should also stop off-screen. A loop the user *starts* should instead
     refuse to start while `document.hidden` — see
     `use-playground-simulation.ts` and `use-pipeline-simulation.ts`.

4. **React 19 rules**: the repo runs React 19's hooks/purity compiler rules.
   - **Never** call synchronous `setState` inside a `useEffect` body. For
     reset-on-prop-change, use the prev-state pattern:
     ```tsx
     const [prev, setPrev] = useState(prop);
     if (prop !== prev) { setPrev(prop); setOther(initial); }
     ```
   - **Never** call impure functions (`Math.random`, `Date.now`, `new Date()`)
     in render or inside `useMemo` factories. Cache them in a lazy
     `useState(() => …)` initializer instead.

5. **Sentry PII**: all error events pass through `src/lib/sentry-pii.ts` which
   strips UUIDs, URLs-to-host-only, quoted names, and a curated list of
   sensitive breadcrumb fields. Before adding new breadcrumb data or
   `Sentry.captureException(err, { extra })`, check whether the shape
   contains any of the SENSITIVE_FIELDS or patterns that should scrub.

6. **Supabase**: only the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) may be
   read from client code. The `service_role` key
   (`SUPABASE_SERVICE_ROLE_KEY`) is **server-only**: it may appear in `src/`
   *only* inside a module whose first line is `import "server-only"` — today
   `src/lib/server/env.ts` and `src/lib/supabase-admin.ts` — and must never
   carry a `NEXT_PUBLIC_` prefix. Those two properties are what keep it out of
   the client bundle: an un-prefixed env var is never inlined into client JS,
   and Next fails the build if a `server-only` module is imported from a
   client component. Never read `SUPABASE_SERVICE_ROLE_KEY` outside a
   `server-only` module, and never send it to the browser. All Supabase access
   is optional — guard every call with a check that the required env is set;
   fall back to mocks or no-ops otherwise.

7. **Commits**: one atomic change per commit. Message format used by the
   OSS release passes:
   ```
   <pass-id>/<area>: <what changed>

   Why: <root-cause or value>
   Risk: <low|med|high + rationale>
   Verified: <tsc|lint|build|playwright>
   ```

8. **Client/server boundary**: a `"use client"` page cannot export `metadata`.
   Routes whose `page.tsx` is a client component therefore carry a sibling
   **server `layout.tsx` that exists to hold the metadata** (`blog`,
   `templates`, `guide`, `how`, `playground`, `athena`, `connections` all do
   this). If the page is a server component, put `metadata` directly on it.
   Any route added to `src/app/sitemap.ts` must have one or the other —
   `src/lib/sitemapRoutesHaveMetadata.test.ts` fails the build otherwise.
   Prefer pushing `"use client"` down to the interactive leaf rather than
   hoisting it to the page root for a single `useState`.

9. **Bundle budget**: `bundle-budget.json` holds a per-route ceiling for
   first-load JS, enforced by `npm run check:bundle` in CI (after `npm run
   build`, which writes the stats it reads). Next 16 no longer prints size
   columns, so this file is the only thing that can see bundle weight. When a
   route legitimately grows, re-baseline with `npm run check:bundle -- --update`
   and say why in the commit message — don't raise a single ceiling by hand.
   The usual cause of an unexpected jump is a heavy module imported statically
   into a route: defer it with `dynamic(() => import(...), { ssr: false })`,
   passing resolved values rather than importing back into the deferred module
   (an import from the caller pulls the dependency into the static graph and
   silently undoes the split). See the chart cards under
   `src/components/dashboard/` for the established shape.

## Out of scope

Unless the user explicitly asks:

- Do **not** bulk-migrate translations across all 14 locales beyond adding
  the minimum English placeholder needed to compile.
- Do **not** add a new test runner, bundler, or linter. The current stack
  (ESLint + tsc + Playwright) is the decided baseline.
- Do **not** change Supabase table names or RLS policies (they live
  outside this repo).
- Do **not** modify route paths under `src/app/` without confirmation —
  they are referenced by external links.
- Do **not** commit `.env*` files other than `.env.example`.

## Custom lint rules

Implemented under `eslint-rules/`, wired in `eslint.config.mjs` at `warn`
level under the `--max-warnings` ratchet in `package.json` (`npm run lint`
fails above the ceiling; when you fix a warning, lower the number in the
same commit):

- **`custom-a11y/no-low-text-opacity`** — Tailwind text utilities must not
  use opacity modifiers below `/60` (contrast below WCAG AA). Enforced by
  `eslint-rules/no-low-text-opacity.js`; do not work around it.
- **`custom-animation/require-animation-gating`** — any file that uses
  `requestAnimationFrame` / `cancelAnimationFrame` / `<canvas>` must import and
  call a reduced-motion gate and short-circuit the animation. Accepted gates are
  the named `ACCEPTED_GATES` set in `eslint-rules/require-animation-gating.js`:
  `useStillMotion` (preferred), `useIsVisible`, `usePageVisibility`,
  `useReducedMotion`, `useReducedMotionPreference`. Do not work around it. The rule only sees raw
  animation-frame and canvas usage, so CSS- and framer-motion-driven motion must
  still be gated by hand.

## OSS release passes

Specialized, themed release passes are documented in
`docs/opus-4.7-oss-release-passes.md`, with session audit reports under
`audit-reports/`. Completed passes so far (master branch):

- **B.1** — missing `heroTransition` i18n namespace (cleared 4 TS errors)
- **B.2** — React 19 compiler rule fixes (cleared 10 lint errors across 9 files)
- **A.1** — README rewrite
- **A.2** — MIT LICENSE
- **A.3** — full `.env.example`
- **A.4** — `package.json` metadata + helper scripts
- **A.5** — this file

<!-- vibeman:context-map:start -->
## Context Map

This project has a Vibeman-generated context map at `context-map.json` (repo root). It maps every file to a feature ("context"), grouped by business domain. **Before editing code, read `context-map.json` to find the relevant context and scope your changes to its `filePaths`.** The `index` field is a quick one-line-per-context overview. If you change which files a context owns, update `context-map.json` to match (or run Vibeman's refresh) so it stays accurate.
<!-- vibeman:context-map:end -->

## Feature docs

`docs/features/` holds one markdown doc per logical submodule (following the app's
navigation/route structure), grouped into folders that mirror the app: `dashboard/`,
`marketing/`, `product-showcase/`, `demos/`, `guide/`, `content/`, `community/`,
`connectors/`, `platform/`, `infrastructure/`. Start at `docs/features/INDEX.md` (the
master map). Each doc is dual-purpose: a plain-language **What it does** (user overview)
followed by **How it works / Key files / Data & state / Integration points / Conventions
& gotchas** (the dev/LLM reference, with `file:line` anchors).

- **Before working on a feature, read its doc** for the file map, state/data flow, and the
  repo conventions + known gotchas that apply there. This complements `context-map.json`
  (files → context) with the *what / how / why* per submodule.
- The `Conventions & gotchas` sections record real findings from the doc scan (dead code,
  dormant branches, hardcoded-English i18n gaps, ungated motion, route mismatches) — treat
  them as known issues, not invitations to fix unasked.
- **When a feature's files change, update its doc** in the same commit so it stays accurate.

## AI registry (knowledge + skills)

This repo is wired to the organization's AI registry - ONE local checkout, at the path in
`.ai/manifest.yaml` under `registry.local` (default `../ai-registry`).

- **The knowledge is already loaded.** `.claude/rules/ai-registry-*.md` are links to the
  registry's generated rules: the access contract, plus a subject map for every domain in
  `.ai/manifest.yaml` `knowledge.domains`. Rules load in every session, so the corpus is in
  front of you without invoking anything. Before a design, architecture or product decision
  in a covered domain, open the governing subject - resolve it through
  `knowledge/<domain>/index.json` (`subjects["<slug>"].file`), never by building a path from
  a slug. Where this repo falls short of the standard, that is a deviation to record, not a
  reason to lower the standard. `/consult <topic>` does the same read deliberately and logs
  it so the registry can see which knowledge is actually reached for.
- **Shared skills are links, not copies.** Every name in `.ai/manifest.yaml` `skills:` is
  linked from `.claude/skills/<name>` into the registry's lane, so there is exactly one file
  on this machine: editing a shared skill from this repo edits the registry's file, and the
  change is live in every project immediately. Never copy a registry skill in - a real
  directory under `.claude/skills/` is a project-owned skill and must carry its own name.
- **After changing the manifest**, re-link with `node <registry>/scripts/link-registry.mjs`
  (`--check` verifies without writing). Project-specific configuration for a shared skill
  lives in its committed overlay, e.g. `.claude/perfect/config.md`.
