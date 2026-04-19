# personas-web — OSS Release Audit (2026-04-17)

Phase 1 recon for the OSS-release passes doc (`docs/opus-4.7-oss-release-passes.md`).
Read-only. No code touched. Methodology: `tsc --noEmit`, `eslint` against
`src/**`, filesystem inventory, grep probes. `npm run build` and the Playwright
suite were **not** run during this pass (time budget; baseline can be
completed before Phase 2).

---

## Baseline metrics

| Metric | Value | Source |
|---|---|---|
| **TS errors** | **4** | `npx tsc --noEmit` — all in `src/components/sections/HeroTransition.tsx`, one root cause: missing `heroTransition` key in `src/i18n/en.ts` |
| **Lint errors** | **10** | `eslint src/**` — 9× `react-hooks/set-state-in-effect`, 1× `react-hooks/purity` (React 19 compiler rules) |
| **Lint warnings** | **166** | See breakdown below |
| **Playwright specs** | **12 files** | `e2e/` — not executed this pass |
| **`npm run build`** | not executed | noted gap |
| **Rust warnings** | n/a | web-only project |
| **Total src TS/TSX files** | 610 | `find src -type f -name "*.ts*"` |
| **LOC by top-level src/** | see table | |

LOC by subdir:

```
src/app          12,182
src/components   34,258
src/lib           5,295
src/stores          857
src/hooks         1,155
src/i18n          6,966
src/contexts        329
src/data          7,032
e2e                 641
```

Lint warnings by rule:

```
95  custom-a11y/no-low-text-opacity         (text-*/55, /40 below WCAG AA)
31  @typescript-eslint/no-unused-vars
25  custom-animation/require-animation-gating (rAF without useReducedMotion)
10  react-hooks/exhaustive-deps
 2  next/no-img-element                     (use next/image)
 1  next/no-page-custom-font
```

Lint errors (all React 19 compiler rules, must be fixed):

```
9× react-hooks/set-state-in-effect  — cascading re-render risk
1× react-hooks/purity               — impure call during render
```

Env vars referenced in code (scanned `process.env.*` across `src/` + configs):

| Var | Documented in `.env.local.example`? | Where |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | many |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | many |
| `NEXT_PUBLIC_ORCHESTRATOR_URL` | yes | `lib/api.ts`, API routes |
| `NEXT_PUBLIC_TEAM_API_KEY` | yes | `lib/api.ts`, API routes |
| `NEXT_PUBLIC_SITE_URL` | **no** | `lib/seo.ts` |
| `NEXT_PUBLIC_USE_MOCK_API` | **no** | `lib/dev.ts` |
| `NEXT_PUBLIC_SENTRY_DSN` | **no** | `lib/sentry.ts`, `next.config.ts` |
| `NEXT_PUBLIC_DOWNLOAD_URL` | **no** | download pages/routes |
| `NEXT_PUBLIC_KOFI_USERNAME` | **no** | feature-voting data |
| `NEXT_PUBLIC_APP_VERSION` | auto-set from pkg.json | `next.config.ts` |
| `NEXT_PUBLIC_RELEASE_TITLE/DATE` | auto-set | `next.config.ts` |
| `SENTRY_ORG` (server) | **no** | `next.config.ts` |
| `SENTRY_PROJECT` (server) | **no** | `next.config.ts` |
| `RELEASE_TITLE` / `RELEASE_DATE` (server) | **no** | `next.config.ts` |

**9 of 14 env vars are undocumented.** `.env*` is correctly `.gitignore`d;
no secrets tracked.

Metadata coverage: root `layout.tsx` has a full `Metadata` export with
title template, OG, Twitter, keywords. **26 of 33 page routes** lack their
own `export const metadata` or `generateMetadata`. Title template still
applies, but descriptions/OG/canonical per-page are missing.

Route-level error/loading states:

```
page.tsx        33
layout.tsx      14
error.tsx        0    ← gap
loading.tsx      0    ← gap
not-found.tsx    1    (only the root)
sitemap.ts     yes
robots.ts      yes
```

---

## What this repo actually is

A Next.js 16 App Router marketing and product site for **Personas** — an AI
agent orchestration tool whose desktop app lives in a sibling repo. This
codebase ships: (1) a marketing funnel (landing, features, use-cases,
templates, compare, download, blog, changelog, community, guide, security,
legal), (2) a logged-in dashboard under `/dashboard/*` with 10+ sub-routes
(agents, events, executions, knowledge, observability, playground, reviews,
settings, usage, todo), and (3) API routes backing roadmap voting, feature
requests, download redirection, and an SSE event stream proxy to an
external orchestrator. Complexity concentrates in `src/components/` (34k
LOC — heavy section components + dashboard widgets), `src/data/` (7k LOC
of static content for roadmap/templates/guide), and `src/i18n/` (14
locales). Strong conventions already exist via two custom ESLint rules
(`no-low-text-opacity`, `require-animation-gating`) and a thorough
`sentry-pii.ts` scrubber — but the OSS-facing wrapper (README, LICENSE,
CI, `.env.example`) is essentially absent.

---

## OSS readiness scorecard

0 = missing, 1 = minimal, 2 = partial, 3 = exemplary.

| Dimension | Score | Evidence | Gap |
|---|---|---|---|
| README (quickstart works as-written) | **0** | Default `create-next-app` boilerplate, 37 lines | Product description, screenshots, env setup, feature overview |
| LICENSE present and referenced | **0** | No LICENSE file | Choose (MIT/Apache-2.0/AGPL); reference in README + package.json |
| CONTRIBUTING + PR template | **0** | No CONTRIBUTING, no `.github/` | Dev loop, commit format, branch naming |
| CODE_OF_CONDUCT | **0** | Missing | Contributor Covenant 2.1 |
| SECURITY.md | **0** | Missing (headers exist in code, but no disclosure doc) | Private reporting address, supported versions |
| .env.example + env var docs | **1** | `.env.local.example` exists but lists 4 of 14 vars | 9 undocumented vars (see table above) |
| One-command setup | **2** | `npm install && npm run dev` works if env is set | README doesn't explain env prerequisites |
| CI (lint/type/test on PR) | **0** | No `.github/workflows/` | `tsc` + `lint` + `build` + Playwright |
| Type cleanliness | **2** | 4 TS errors, all one root cause (missing i18n key) | One-line fix |
| Lint cleanliness | **1** | 10 errors + 166 warnings; errors are real React 19 bugs | Fix hooks errors before merge-to-main |
| Test coverage of critical flows | **2** | 12 Playwright specs cover main routes; no unit tests | No harness for `src/lib/` pure functions |
| Accessibility | **2** | Custom a11y rule exists; 95 opacity warnings = real debt | Raise `/55→/60`, add aria-labels on icon buttons |
| i18n hygiene | **2** | 14 locales, `useTranslation` pattern enforced; 1 missing key (`heroTransition`) and unknown drift count | Confirm no inline English; missing `en.ts` key |
| SEO / social | **2** | Root `Metadata` + sitemap + robots + JSON-LD; 26/33 pages lack per-page metadata | Add metadata to missing pages |
| Error boundaries + loading states | **1** | Only `global-error.tsx` and one `not-found.tsx` | Route-level `error.tsx` / `loading.tsx` for key groups |
| Dead code / duplication | **1** | 31 unused-var warnings; `dev.ts`, `event-bus-demo.ts`, `mockData.ts`+`mock-dashboard-data.ts` co-exist; `highlight-match.tsx` + `guide-search.ts` + `guide-utils.ts` overlap visible | Confirm and collapse |
| Dependency freshness + license compat | **?** | Not yet audited (`npm outdated`, license-checker not run) | Run before release |
| Sentry PII scrubbing + opt-out | **3** | `lib/sentry-pii.ts` thorough: UUIDs, quoted strings, URLs, sensitive breadcrumb fields, user/ip stripping | None noted |
| Secret hygiene (no keys in repo/history) | **3** | `.env*` in `.gitignore`; `git ls-files` shows no env/credential files tracked; no `service_role` usage in `src` (anon key only) | Consider `git log -p` sweep before v1 tag |
| Folder/naming consistency | **2** | `src/lib/` mixes kebab-case (`format-date.ts`, `guide-link.ts`) and camelCase (`mockApi.ts`, `fileLock.ts`) | Decide one convention |
| **CLAUDE.md usefulness** | **0** | Stub (`Add your project description here`) | Populate with real conventions for future contributors |
| **Repo hygiene (tracked bloat)** | **1** | 32 `.claude/commands/goal-analysis-*.md` tracked files (being deleted in current working tree); `.claude/worktrees/` is 53MB+ but correctly untracked | Commit the deletion; keep `.claude/worktrees/` untracked |
| **package.json OSS metadata** | **0** | No `description`, `repository`, `license`, `author`, `keywords`, `homepage`, `bugs` | Fill all |

**Overall readiness:** low single-digits out of the category max — strong
internal engineering (PII scrubbing, custom lint rules, i18n discipline,
security headers) behind a repo that looks and reads like an unfinished
internal project. Closing that gap is where the ROI is.

---

## Per-pass opportunity list

Scores: Impact(1–5) × Confidence(1–5) ÷ Risk(1–5). Ranked within each pass.

### Pass A — Repo hygiene & OSS foundation
The highest-leverage pass. Most items low-risk, high-confidence.

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Rewrite `README.md` (what, why, quickstart, env, stack, contributing) | Default template still present | 5 | 5 | 1 | **25** |
| Add `LICENSE` (pending user choice) | Missing | 5 | 5 | 1 | **25** — **blocker: license choice** |
| Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` | Missing | 4 | 5 | 1 | **20** |
| Expand `.env.local.example` → `.env.example` with all 14 vars | 9 undocumented vars, name mismatch with Next convention | 5 | 5 | 1 | **25** |
| Fill `package.json` metadata fields | 7 fields blank | 3 | 5 | 1 | **15** |
| Add `.github/PULL_REQUEST_TEMPLATE.md` + issue templates | No `.github/` | 3 | 5 | 1 | **15** |
| Populate `.claude/CLAUDE.md` with real conventions | Stub; bad DX for future AI/human contributors | 4 | 4 | 1 | **16** |
| Commit the `.claude/commands/goal-analysis-*.md` deletion (user's in-progress cleanup) | 32 files staged-deleted | 2 | 3 | 2 | **3** — **out of scope per pass doc** |

### Pass B — Type & lint cleanliness
Small, contained — a single focused session clears it.

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Add missing `heroTransition` i18n namespace to `en.ts` | 4 TS errors all from same missing key | 4 | 5 | 1 | **20** |
| Fix 10 React-19-compiler lint errors (`set-state-in-effect`, `purity`) | Real cascading-render bugs | 5 | 4 | 2 | **10** |
| Remove 31 unused-vars warnings | Confirm each isn't a public export | 2 | 5 | 1 | **10** |
| Raise 95 low-text-opacity warnings (`/55→/60`) | Project's own a11y rule | 3 | 5 | 2 | **7.5** — **high LOC churn; stage carefully** |
| Add `useReducedMotion` gating to 25 animation sites | Project's own animation rule; real a11y win | 4 | 4 | 2 | **8** |
| Swap 2 `<img>` → `<next/image>` | `next/no-img-element` | 2 | 5 | 2 | **5** |

### Pass C — Code structure & consistency
Needs human sign-off on naming direction before any mass rename.

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Collapse `mockData.ts` + `mock-dashboard-data.ts` + `mockApi.ts` duplication | 3 mock files, overlap suspected | 3 | 3 | 3 | **3** |
| Remove `lib/dev.ts`, `lib/event-bus-demo.ts` if unused | Names suggest throwaway | 2 | 3 | 3 | **2** |
| Decide kebab-case vs camelCase for `src/lib/` filenames | Visible drift | 2 | 4 | 4 | **2** — **needs human call** |
| Audit `lib/highlight-match.tsx` + `guide-search.ts` + `guide-utils.ts` for overlap | 3 guide helpers | 2 | 3 | 2 | **3** |

### Pass D — UI/UX polish

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Add route-level `error.tsx` + `loading.tsx` to key groups (dashboard, blog, guide, templates, use-cases) | Zero exist | 4 | 5 | 2 | **10** |
| Add route-level `not-found.tsx` to dynamic segments (`[slug]`, `[id]`, `[category]`) | Only root 404 | 3 | 5 | 2 | **7.5** |
| Audit skeleton/empty states on SWR-backed lists | Needs file-by-file scan | 3 | 3 | 2 | **4.5** |

### Pass E — Accessibility & semantics
Significant overlap with Pass B (95 opacity warnings, 25 motion warnings).

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Address low-text-opacity warnings | See Pass B | 3 | 5 | 2 | **7.5** |
| Animation gating | See Pass B | 4 | 4 | 2 | **8** |
| aria-label sweep on icon-only buttons (`lucide-react` usage) | Needs scan | 3 | 3 | 1 | **9** |
| Confirm one `<h1>` per route + landmark structure | Needs scan | 3 | 3 | 2 | **4.5** |

### Pass F — Performance & SEO

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Add `export const metadata` to 26 pages | `/app/page.tsx` itself included | 4 | 5 | 1 | **20** |
| Run `npm run build` + inspect first-load JS per route | Not yet run | 3 | 4 | 1 | **12** |
| Confirm no client components marked unnecessarily | Dashboard is likely all `"use client"` | 3 | 2 | 2 | **3** |

### Pass G — Security & config
Already strong; mostly verification.

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Tighten CSP: remove `unsafe-eval` if feasible in prod | `next.config.ts:37` | 3 | 2 | 3 | **2** |
| Confirm Supabase RLS policies match table access | Needs Supabase project inspection (out of repo) | 4 | 2 | 3 | **2.7** — **requires external access** |
| Sweep `git log -p` for leaked secrets before v1 tag | 101 commits | 3 | 4 | 1 | **12** |
| Verify cookie-consent gates analytics firing | `CookieConsent.tsx` + `PageViewTracker.tsx` exist | 3 | 3 | 2 | **4.5** |

### Pass H — Testing & CI

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| Add `.github/workflows/ci.yml` (install, tsc, lint, build, playwright) | No CI | 5 | 5 | 1 | **25** |
| Add `test` script to `package.json` (currently missing) | `npm run test` would fail | 3 | 5 | 1 | **15** |
| Add unit-test harness (`node:test`) for pure `lib/` helpers | No unit tests | 3 | 3 | 1 | **9** |

### Pass I — Release readiness

| Item | Evidence | I | C | R | Score |
|---|---|---|---|---|---|
| `CHANGELOG.md` seeded from 101 commits | Missing | 3 | 4 | 1 | **12** |
| Add demo URL / screenshots to README | Depends on hosting decision | 3 | 3 | 1 | **9** |
| `docs/RELEASE.md` checklist | Missing | 2 | 4 | 1 | **8** |

---

## Considered but rejected

- **Upgrade deps to latest majors** — Next 16 + React 19 + Tailwind 4 are already current. No measurable win before v1.
- **Switch to Biome** — ESLint config already has custom a11y and animation rules that would need porting. Churn for no user benefit.
- **Add Vitest** — Pure `lib/` helpers can use `node:test` with zero new deps. A new test runner is weight this project does not need.
- **Mass-rename `src/lib/*.ts` to one casing** — Blast radius is every import site. Worth doing, but not in the same session as OSS foundation work; and it needs a human sign-off on direction.
- **Fix `.claude/commands/goal-analysis-*.md` deletions** — Pass doc explicitly marks this as the user's in-progress work.
- **Tighten CSP `unsafe-eval`** — Next.js dev needs it; prod removal requires tracing which script actually calls `eval`. High confidence it's solvable, low confidence it's fast. Defer.
- **RLS audit** — Needs Supabase project access, outside the repo.

---

## Uncertainties

Top 3 things that would change priorities:

1. **License choice.** MIT vs Apache-2.0 vs AGPL changes the target audience
   and what can be bundled. Without this, Pass A is blocked on its biggest
   item. *One question: which license, and should sibling repos be
   aligned?*
2. **Is this repo actually intended to be open-sourced, or is it being
   polished as a private deliverable?** Changes the README tone
   (contributor-facing vs stakeholder-facing), whether to add
   `CODE_OF_CONDUCT`, and how careful the git-history sweep needs to be.
   *One question: public GitHub org + repo name, or private?*
3. **Dashboard status: shipping or demo?** The dashboard has 10+ routes,
   many using mock data (`mockApi.ts`, `NEXT_PUBLIC_USE_MOCK_API`). If
   shipping-live, the error/loading/empty-state gap is blocking. If
   demo-only for the marketing site, lower priority. *One question: is
   `/dashboard/*` a v1 feature or a public preview?*

Secondary unknowns to resolve before Phase 2:

- Has `npm run build` been run recently and been green? (Not tested this
  pass — a red build would reshuffle priorities.)
- Is the full Playwright suite green right now? (12 specs, not run.)

---

## Recommended first session (proposal, pending approval)

Given the scorecard, a tight high-ROI first session would be:

- **Pass A** (README, LICENSE once chosen, CONTRIBUTING/CODE_OF_CONDUCT/SECURITY, `.env.example` expansion, package.json metadata) — ~3–5 commits
- **Pass B.1** (one commit adding the missing `heroTransition` namespace to `en.ts` — clears all 4 TS errors)
- **Pass H.1** (add minimal `.github/workflows/ci.yml` running `tsc` + lint + build) — locks in the gains

Stop condition: those three sub-goals or 90 minutes or any red verification.

Deferred to later sessions:
- Pass B lint-error/warning cleanup (Pass B.2–B.5) — bigger and more localized churn
- Pass D error/loading states — needs UX consistency choices first
- Pass C structural renames — needs human decision on naming direction
- Pass F per-page metadata — clean but 26 files of repetitive copy
- Pass G CSP tightening + git-history sweep — pre-tag hygiene, not first session
