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

3. **Animation gating**: gate all motion behind `useReducedMotion` — see
   `custom-animation/require-animation-gating` under **Custom lint rules**.

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
  `requestAnimationFrame` / `cancelAnimationFrame` must import and call
  `useReducedMotion` from framer-motion and short-circuit the animation when
  it returns `true`. Enforced by `eslint-rules/require-animation-gating.js`;
  do not work around it. The rule only sees raw animation-frame calls, so
  CSS- and framer-motion-driven motion must still be gated by hand.

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
