# personas-web

Marketing site, dashboard, and supporting API routes for **Personas** — a
platform for building and orchestrating multi-agent AI pipelines.

Built with Next.js 16 (App Router) + React 19 + TypeScript 6 + Tailwind 4.

## What's in here

| Area | Routes | Purpose |
|---|---|---|
| Marketing | `/`, `/features`, `/use-cases`, `/templates`, `/compare`, `/download`, `/security` | Public landing surface |
| Content | `/blog`, `/changelog`, `/guide`, `/community`, `/how` | Long-form content + structured guides |
| Dashboard (demo) | `/dashboard/*` | Preview of the product UI — runs on mock data in this repo |
| API | `/api/feature-requests`, `/api/votes`, `/api/roadmap`, `/api/events/stream`, `/api/download` | Roadmap voting (Supabase-backed) + orchestrator SSE proxy |
| i18n | 14 locales | `en`, `de`, `es`, `fr`, `hi`, `id`, `ja`, `ko`, `ru`, `vi`, `zh`, `ar`, `bn`, `cs` |

The dashboard in this repository is a **demo-only** view backed by mocks in
`src/lib/mockApi.ts` and `src/lib/mock-dashboard-data.ts`. The real orchestrator
lives in a separate service; this repo proxies to it via `/api/events/stream`
and `NEXT_PUBLIC_ORCHESTRATOR_URL`.

## Quickstart

```bash
git clone <repo-url>
cd personas-web
npm install
cp .env.example .env.local      # fill in values — see Environment below
npm run dev                     # http://localhost:3000
```

Minimum env for a dev server that renders the marketing pages: **none** —
the app boots without any env vars, Supabase- and orchestrator-backed
features just degrade gracefully.

## Environment

Copy `.env.example` to `.env.local` and fill in what you need.

| Variable | Scope | Required for | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | roadmap voting, feature requests, auth | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | same | `eyJhbGc...` |
| `NEXT_PUBLIC_ORCHESTRATOR_URL` | public | `/dashboard`, event stream | `http://localhost:3001` |
| `NEXT_PUBLIC_TEAM_API_KEY` | public | orchestrator auth | — |
| `NEXT_PUBLIC_SITE_URL` | public | canonical URLs, OG tags | `http://localhost:3000` |
| `NEXT_PUBLIC_USE_MOCK_API` | public | force mock dashboard data | `true` |
| `NEXT_PUBLIC_SENTRY_DSN` | public | client error reporting | — |
| `NEXT_PUBLIC_DOWNLOAD_URL` | public | desktop app download CTA | — |
| `NEXT_PUBLIC_KOFI_USERNAME` | public | Ko-fi tip widget on feature voting | — |
| `SENTRY_ORG` | server | source-map upload (CI) | — |
| `SENTRY_PROJECT` | server | source-map upload (CI) | — |
| `RELEASE_TITLE` | server | desktop release label in footer | — |
| `RELEASE_DATE` | server | desktop release date | — |

`NEXT_PUBLIC_APP_VERSION` is injected from `package.json` by `next.config.ts`
— do not set it manually.

## Commands

```bash
npm run dev       # Next dev server with Turbopack
npm run build     # production build + Sentry source-map upload (if SENTRY_* set)
npm run start     # serve the production build
npm run lint      # eslint (next/core-web-vitals + next/typescript + 2 custom rules)
npx tsc --noEmit  # type-check without emitting
npx playwright test              # e2e suite (12 specs in e2e/)
npx playwright test --ui         # e2e with Playwright UI
```

## Conventions

- **i18n:** every user-facing string lives in `src/i18n/en.ts`. Access it via
  `useTranslation()` from `src/i18n/useTranslation.ts` — `t.namespace.key`.
  Other locales mirror the English shape via the `Translations` interface.
  Non-English locales may contain English placeholders for new keys until
  translated.
- **Semantic tokens:** use `text-foreground`, `bg-background`, `text-muted-dark`,
  `bg-surface`, `border-glass*`, etc. Avoid raw `text-white` / `bg-black`. The
  `custom-a11y/no-low-text-opacity` lint rule flags text opacities below `/60`.
- **Animation gating:** any component using `requestAnimationFrame` or
  heavy motion must import and call `useReducedMotion` from framer-motion.
  Enforced by `custom-animation/require-animation-gating`.
- **PII in Sentry:** error reporting strips UUIDs, quoted names, URL paths,
  and a curated list of sensitive breadcrumb fields. See `src/lib/sentry-pii.ts`
  before adding new breadcrumb data.
- **React 19 rules:** the repo is on React 19 — avoid synchronous `setState`
  inside `useEffect` bodies. For reset-on-prop-change, use the prev-state
  pattern (compare prev prop in state during render).

## Repo layout

```
src/
  app/            Next.js App Router routes (33 pages, 14 layouts)
  components/     React components (marketing sections, dashboard widgets, primitives)
  contexts/       React contexts (Quality, SectionObserver, …)
  data/           Static content (roadmap, templates, guide, connectors, …)
  hooks/          Shared custom hooks
  i18n/           14 locale files + useTranslation
  lib/            API clients, mocks, formatters, Sentry helpers
  stores/         Zustand stores (auth, theme, i18n, …)
  styles/         global.css + themes.css
e2e/              Playwright specs
eslint-rules/     Custom ESLint rules (no-low-text-opacity, require-animation-gating)
docs/             Internal notes, OSS release passes, harness learnings
audit-reports/    Phase audits from release passes
public/           Static assets
```

## License

MIT — see [LICENSE](LICENSE).
