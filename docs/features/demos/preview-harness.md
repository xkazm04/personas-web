# Section Preview & Demo Harness
> Internal Storybook-lite that mounts any marketing section in isolation, plus the public demo entry and a section scratch page · **Route:** `/preview`, `/preview/[section]`, `/demo`, `/todo` · **Status:** Dev/internal

## What it does
A developer harness for reviewing marketing sections without scrolling the full page. `/preview` lists every section registered in a slug→component map; `/preview/[section]` mounts a single section in isolation under a sticky breadcrumb, with its real skeletons and animations running. Both `/preview` routes 404 in production (`NODE_ENV === "production"`), so the surface never ships.

`/demo` and `/todo` are not part of the harness's 404 gate and *do* ship to production:
- `/demo` is the public, always-on, un-gated demo entry — it activates in-memory demo mode and redirects into `/dashboard/home`.
- `/todo` is a section scratch page that renders the seven `feature-sections/*` components (Design, Memory, Healing, Triggers, Observe, Lab, Plugins) inside the standard `InfoPageLayout` shell — effectively a staging page for sections not yet wired into the public IA.

## How it works
- **Registry** (`registry.ts:15`): `PREVIEW_REGISTRY` maps 22 URL slugs to `next/dynamic` lazy imports of section components. `PREVIEW_SLUGS` (`registry.ts:44`) is the sorted key list used by both pages. Sections needing runtime props (e.g. `connections-catalog`) are deliberately omitted — the comment at `registry.ts:39` instructs registering a default-prop wrapper instead.
- **Index** (`preview/page.tsx:10`): server component, 404s in prod, then renders a `<Link>` per slug to `/preview/{slug}`.
- **Section route** (`preview/[section]/page.tsx:10`): async server component. Awaits `params`, looks up `PREVIEW_REGISTRY[section]`. Unknown slug → an inline "Unknown section" page listing all available slugs (`[section]/page.tsx:22`); never calls `notFound()` for a miss. Valid slug → sticky breadcrumb bar + `<Section />` (`[section]/page.tsx:43`).
- **Demo** (`demo/page.tsx:21`): client component. On mount calls `enterDemo()` (auth store), then `router.replace(\`/dashboard/home${search}\`)`, forwarding query (notably `?tour=1` from the `/features` bridge so `TourLauncher` autostarts). Shows a spinner during the redirect.
- **Todo** (`todo/page.tsx:23`): server component. Builds `breadcrumbItems`/`scrollMapItems` and stacks seven `<StageSection>`-wrapped `feature-sections/*` components with hand-tuned glow/from/to color transitions.

## Key files
| File | Role |
| --- | --- |
| `src/app/preview/registry.ts` | Slug→component map (`PREVIEW_REGISTRY`) + sorted slug list (`PREVIEW_SLUGS`); single source of truth for what's previewable |
| `src/app/preview/page.tsx` | Dev-only index; prod 404; links every slug |
| `src/app/preview/[section]/page.tsx` | Dev-only single-section mount; prod 404; sticky breadcrumb; inline fallback for unknown slug |
| `src/app/demo/page.tsx` | Public demo entry; `enterDemo()` + redirect to `/dashboard/home`, forwards `?tour=1` |
| `src/app/todo/page.tsx` | Section scratch page; renders 7 `feature-sections/*` in `InfoPageLayout` |
| `src/stores/authStore.ts` | `enterDemo()` (`authStore.ts:188`) — un-gated mock session, marks store initialized so dashboard `AuthProvider` won't clobber it |

## Data & state
- **Source:** static registry object; no fetch. `/todo` and `/preview` sections pull their own i18n via `useTranslation()`. **Stores:** `useAuthStore` — `/demo` calls `enterDemo()` only. **API routes:** none (preview/todo are pure render; demo redirects into the dashboard which has its own mocks). **Types:** `ComponentType` from React for registry values; `Promise<{ section: string }>` params (Next 16 async params).

## Integration points
- **Registered sections (22 slugs):** `hero`, `vision`, `why-agents`, `features`, `pricing`, `faq`, `download-cta`, `get-started`, `orchestration-hub`, `platform-command`, `platform-layers`, `event-bus`, `agent-playground`, `agents-chat`, `agents-timeline`, `playground-split`, `playground-timeline`, `use-cases`, `changelog`, `roadmap`, `feature-voting`, `footer`.
- **Preview-only components (valuable coverage note):** four registered sections have **no other consumer in the codebase** — their only import site is `registry.ts`:
  - `features` → `@/components/sections/features`
  - `platform-command` → `@/components/sections/platform-command`
  - `agent-playground` → `@/components/sections/agent-playground`
  - `playground-timeline` → `@/components/sections/playground-timeline`

  These are unreachable through the public IA and are visible **only** at `/preview/[section]` (which 404s in prod) — effectively dead in production. Additionally `changelog` is registered and has a `LazyChangelog` wrapper (`lazy.tsx:167`), but that wrapper is **never mounted** on any page, so `changelog` is also effectively preview-only.
- **Where the rest live in the public IA:** `hero`/`footer` direct on `/` (`page.tsx:6,7`); `vision`/`why-agents`/`playground-split`/`get-started`/`orchestration-hub`/`use-cases`/`pricing`/`faq`/`download-cta` via `lazy.tsx` on `/`; `agents-timeline`/`agents-chat`/`platform-layers`/`event-bus` via `how-lazy.tsx` on `/how`; `roadmap`/`feature-voting` on `/roadmap`.
- **`/demo` ↔ dashboard:** depends on `enterDemo` minting the mock session and marking the store initialized; the `/features` page links here with `?tour=1` to autostart the dashboard tour.
- **`/todo` ↔ feature-sections:** the seven `feature-sections/*` components also appear on their own product pages; `/todo` is a combined staging view, not their canonical home.

## Conventions & gotchas
- **Two different 404 stories.** `/preview*` self-gates with `process.env.NODE_ENV === "production"` → `notFound()`. `/demo` and `/todo` do **not** — they ship to production. `robots.ts` only disallows `/dashboard/` and `/api/`, so `/demo` and `/todo` are crawlable and have **no `noindex`/robots meta** anywhere. `/todo` in particular is a developer scratch page reachable and indexable in prod — likely unintended exposure.
- **Unknown-slug fallback returns 200, not 404.** `/preview/[section]` for a bad slug renders an "Unknown section" page (HTTP 200) rather than calling `notFound()` — inconsistent with the prod-gate which does 404. Minor, dev-only.
- **Registry/IA drift is silent.** Nothing asserts that registered sections still match their public mounts. The four preview-only sections above could be stale/abandoned and the harness wouldn't surface it; conversely, a new public section won't appear in `/preview` until manually added.
- **Props-required sections are excluded by hand.** Anything needing runtime props is omitted (see `registry.ts:39`); preview support for those needs a default-prop wrapper, or they silently can't be previewed.
- **`enterDemo` vs `signInAsDemo`.** `/demo` must use `enterDemo` (un-gated, marks store initialized), not `signInAsDemo` (gated, for the sign-in button) — using the wrong one lets the dashboard `AuthProvider` re-run real auth and clobber the demo session.
- **i18n still applies.** Preview/todo sections render real components, so all CLAUDE.md i18n rules apply when editing the sections themselves — the harness pages add only minimal hardcoded English chrome ("Section preview", "Unknown section", breadcrumb labels) which is acceptable here only because the routes never ship to users (true for `/preview`, but **not** for `/todo`, whose breadcrumb labels are hardcoded and do ship).

## Related docs
- [Feature index](../INDEX.md)
