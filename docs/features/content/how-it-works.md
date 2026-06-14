# How It Works & Changelog
> The `/how` explainer page that lazy-mounts four interactive demo sections, plus the release-notes changelog timeline · **Route:** `/how` · **Status:** Live

## What it does
`/how` is a scroll-through explainer that answers "how does Personas actually work?" by stacking four self-contained interactive demos behind a role selector. A viewer picks a persona (developer / product-manager / enterprise) and scrolls through: an agent-vs-workflow race, a live multi-agent chat, the platform layer stack, and the event-bus showcase. A left-rail scroll map (`AGENTS: TIMELINE`, `AGENTS: CHAT`, `PLATFORM: LAYERS`, `EVENTS`) jumps between them. The page is purely demonstrative — no forms, no live data.

The **changelog** is a separate concern that does *not* render on `/how`. The full release-notes timeline (`ChangelogTimeline`) lives on `/roadmap#changelog`; a compact "Recent updates" card (`Changelog`) reads the same data source. Both are documented here because they share `src/data/changelog.ts`.

## How it works
`src/app/how/page.tsx` is a client component wrapping everything in `InfoPageLayout` (Navbar + `PageShell` + scroll map + Footer). It holds one piece of state — `role: ViewerRole` (default `"developer"`) — driven by `<RoleSelector>` (`page.tsx:47`). The role only retints the final event-bus `StageSection` (glow + from/to gradient colors via the `stageGlow`/`stageColors` maps at `page.tsx:26-36`); the first three stages use fixed colors.

Each demo is wrapped in a `<StageSection>` that supplies a radial glow and top/bottom gradient seams to blend sections. The demos themselves are code-split: `page.tsx` imports `LazyAgentsTimeline`, `LazyAgentsChat`, `LazyPlatformLayers`, `LazyEventBusShowcase` from `src/components/sections/how-lazy.tsx`. That registry calls `createLazySection(...)` (from `LazySection.tsx`) with `{ ssr: false }` for all four — they use browser-only APIs (canvas/SMIL, framer-motion in-view, `requestAnimationFrame`) and sit below the fold. A skeleton renders during load: the event-bus section has a bespoke terminal-shaped skeleton (`how-lazy.tsx:6-41`); the other three share the generic `SectionSkeleton`. The matching `#anchor` ids are rendered *inside* each demo component (e.g. `agents-timeline/index.tsx:65` emits `id="agents-timeline"`), so the scroll-map links resolve there, not in `page.tsx`.

The **changelog timeline** (`changelog-timeline/index.tsx`) maps over `RELEASES` in array order, rendering a vertical-rail timeline of release cards with per-change badges (`feature`/`improvement`/`fix`/`breaking` → New/Improved/Fixed/Breaking). It computes the "Latest" badge by `max(Date.parse(date))` (`index.tsx:30-41`), *not* by array position, so an out-of-order hotfix won't mislabel the wrong row. The **compact `Changelog`** card sorts `RELEASES` by date desc, slices the top 3 (`Changelog.tsx:16-20`), and shows a "{n} releases in 90 days" stat measured against the *newest release date* rather than `Date.now()` (`Changelog.tsx:24-28`) — keeping the stat stable even on a stale changelog.

## Key files
| File | Role |
| --- | --- |
| `src/app/how/page.tsx` | `/how` composition: role state, scroll map, 4 `StageSection`-wrapped lazy demos |
| `src/app/how/layout.tsx` | Static metadata (`force-static`, `revalidate=3600`) + OG/canonical for `/how` |
| `src/components/sections/how-lazy.tsx` | Lazy registry — the four `ssr:false` demo imports + event-bus skeleton |
| `src/components/sections/LazySection.tsx` | `createLazySection` factory + generic `SectionSkeleton`, pulse constants |
| `src/components/InfoPageLayout.tsx` | Shared info-page chrome (Navbar, PageShell, scroll map, optional tour, Footer) |
| `src/components/StageSection.tsx` | Per-section glow + gradient-seam wrapper; `data-animate-when-visible` |
| `src/components/sections/changelog-timeline/index.tsx` | Full release timeline (rendered on `/roadmap#changelog`) |
| `src/components/sections/Changelog.tsx` | Compact "Recent updates" 3-item card (lazy-exported, not currently mounted) |
| `src/data/changelog.ts` | Canonical `RELEASES` data + `ChangeType`/`Release` types + `CHANGE_TYPE_META` |

## Data & state
- **Source:** `src/data/changelog.ts` → `RELEASES: Release[]` (hardcoded, 10 releases as of writing). **Stores:** none — `/how` uses local `useState` (role) only; changelog is pure render-from-constant. **API routes:** none. **Types:** `Release`, `ChangeItem`, `ChangeType` (`changelog.ts:3-15`); `ViewerRole` (`RoleSelector`); `StageColor` (`lib/colors`).

## Integration points
- **`/how` hosts exactly four demo sections**, each documented separately (see Related docs):
  - `LazyAgentsTimeline` → `agents-timeline` (anchor `#agents-timeline`)
  - `LazyAgentsChat` → `agents-chat` (anchor `#agents-chat`)
  - `LazyPlatformLayers` → `platform-layers` (anchor `#platform-layers`)
  - `LazyEventBusShowcase` → `event-bus-showcase` (anchor `#event-bus`)
- Also on `/how`: `<RoleSelector>` and a `<CinematicBreather>` divider before the event-bus stage (`page.tsx:64`).
- **Changelog data fan-out:** `RELEASES` is consumed by `ChangelogTimeline` (mounted in `src/app/roadmap/page.tsx:45`) and by `Changelog`. The compact card's "Download free" CTA links to `/#download`; its "All updates" CTA links to `/changelog` (see gotchas).
- `ChangelogTimeline` carries `data-tour-diagram="changelog"` (`index.tsx:55`) for the guided tour; `/roadmap` mounts it with `tourId="roadmap"`.

## Conventions & gotchas
- **"How It Works & Changelog" are two routes, not one.** The changelog never renders on `/how`. The timeline is at `/roadmap#changelog`; `/how` is demos-only. The doc title pairs them because they're a content unit, not because they co-render.
- **Dead `/changelog` link.** `Changelog.tsx:76` links to `/changelog`, but there is no `src/app/changelog` route and no redirect in `next.config.ts`. The live changelog is `/roadmap#changelog`. Either add a redirect or fix the href.
- **`Changelog` (compact card) appears to be unmounted.** It's exported as `LazyChangelog` in `src/components/sections/lazy.tsx:167`, but `LazyChangelog` is not rendered by any component — it's dead/orphaned wiring. Confirm before relying on it surfacing anywhere.
- **`RELEASES` has no sort invariant.** The full timeline renders in *array order* (`changelog-timeline/index.tsx:68`) — currently newest-first by convention only, not enforced. "Latest" is computed by `max(date)` so it's safe, but the *visual ordering* of the list will follow whatever order entries are added. Keep new releases at the top of the array.
- **Future dates are honored, not clamped.** Both the "Latest" pick and the compact card's "90 days" window use the dataset's own max date, never `Date.now()`. A release dated in the future (the top entry `0.12.0` is `2026-02-28`, after today's `2026-06-14`… actually past — but the pattern allows future dates) becomes "Latest" immediately. There is no guard against post-dated entries.
- **All four `/how` demos are `ssr: false`** — they will not appear in server-rendered HTML or for crawlers; only the skeletons do at first paint. Intentional (browser-only APIs), per the SSR decision tree in `LazySection.tsx:25-39`.
- **Reduced motion** is handled inside each demo component, not at the `/how` page level. `StageSection`/`page.tsx` do no gating themselves.
- **Two changelog `formatDate` variants:** the timeline uses `formatDateLong`, the compact card `formatDateShort` (both from `lib/format-date`). Keep date formatting changes consistent across both.

## Related docs
- [Agent Execution Timeline Race](../demos/agents-timeline.md)
- [Multi-Agent Chat](../demos/agents-chat.md)
- [Event Bus Showcase](../demos/event-bus-showcase.md)
- [Platform Layers](../demos/platform-layers.md)
- [Feature index](../INDEX.md)
