# CLAUDE.md

Guidance for Claude Code when working in this repository. Keep this file
accurate — it is read at the start of every session and shapes every
subsequent decision.

## Project

**personas-web** — Next.js 16 (App Router) marketing site, demo dashboard,
and supporting API routes for Personas, a multi-agent AI orchestration
platform. Stack: React 19, TypeScript 6, Tailwind 4, Zustand 5, Supabase
(roadmap/voting only), framer-motion, Sentry. i18n via a local 14-locale
bundle. Playwright for e2e. No unit test runner yet.

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
npm run test:e2e    # Playwright (12 specs under e2e/)
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
   hex colors. Text opacities below `/60` are lint-warned (WCAG AA).

3. **Animation gating**: any component that calls `requestAnimationFrame`,
   `cancelAnimationFrame`, or runs canvas/GPU-intensive motion MUST import
   and call `useReducedMotion` from framer-motion, and short-circuit the
   animation when it returns `true`. Enforced by
   `custom-animation/require-animation-gating`.

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

6. **Supabase**: only the anon key is used client-side. `service_role` must
   never appear in `src/`. All Supabase access is optional — guard every
   call with a check that both URL and anon key are set; fall back to mocks
   or no-ops otherwise.

7. **Commits**: one atomic change per commit. Message format used by the
   OSS release passes:
   ```
   <pass-id>/<area>: <what changed>

   Why: <root-cause or value>
   Risk: <low|med|high + rationale>
   Verified: <tsc|lint|build|playwright>
   ```

## Out of scope

Unless the user explicitly asks:

- Do **not** edit `.claude/commands/goal-analysis-*.md` files (they are the
  user's in-progress deletions; committing that is their call).
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

Implemented under `eslint-rules/`:

- **`custom-a11y/no-low-text-opacity`** — warns when Tailwind text utilities
  use opacity modifiers below `/60` (contrast below WCAG AA).
- **`custom-animation/require-animation-gating`** — warns when a file uses
  `requestAnimationFrame` / `cancelAnimationFrame` without importing
  `useReducedMotion` from framer-motion.

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
