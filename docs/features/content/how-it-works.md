# How It Works & Changelog
> The `/how` explainer page that lazy-mounts four interactive demo sections, plus the release-notes changelog timeline · **Route:** `/how` · **Status:** Live

## What it does
`/how` is a scroll-through explainer that answers "how does Personas actually work?" by stacking four self-contained interactive demos behind a role selector. A viewer picks a persona (developer / product-manager / enterprise) and scrolls through: an agent-vs-workflow race, a live multi-agent chat, the platform layer stack, and the event-bus showcase. A left-rail scroll map (`AGENTS: TIMELINE`, `AGENTS: CHAT`, `PLATFORM: LAYERS`, `EVENTS`) jumps between them. The page is purely demonstrative — no forms, no live data.

The **changelog** is a separate concern that does *not* render on `/how`. The full release-notes timeline (`ChangelogTimeline`) lives on `/roadmap#changelog`. It is documented here because it is the release-notes half of this content unit (`src/data/changelog.ts`).

## How it works
`src/app/how/page.tsx` is a client component wrapping everything in `InfoPageLayout` (Navbar + `PageShell` + scroll map + Footer). It holds one piece of state — `role: ViewerRole` (default `"developer"`) — set by the opening **Start here** stage (`src/components/sections/how-role-path/`, id `for-you`): three role lenses (`aria-pressed` buttons) and a snake route through the four sections below, each with a role-specific line and a jump link. The role also tints the opener's glow and retints the final event-bus `StageSection` (`stageGlow`/`stageColors` in `page.tsx`). Scroll-map labels come from `howSections.scrollMap`.

Each demo is wrapped in a `<StageSection>` that supplies a radial glow and top/bottom gradient seams to blend sections. The demos themselves are code-split: `page.tsx` imports `LazyAgentsTimeline`, `LazyAgentsChat`, `LazyPlatformLayers`, `LazyEventBusShowcase` from `src/components/sections/how-lazy.tsx`. That registry calls `createLazySection(...)` (from `LazySection.tsx`) with `{ ssr: false }` for all four — they use browser-only behaviour (framer-motion loops behind `useLoopGate`, in-view story clocks) and sit below the fold. Since 2026-10-06 all four are desktop stages (`SectionWrapper fit="fill"`, one viewport each) with copy in the pending `howSections` namespace. A skeleton renders during load: the event-bus section has a bespoke terminal-shaped skeleton (`how-lazy.tsx:6-41`); the other three share the generic `SectionSkeleton`. The matching `#anchor` ids are rendered *inside* each demo component (e.g. `agents-race` renders `<SectionWrapper id="agents-timeline">`); `page.tsx` also puts the same ids on its always-present `StageSection` wrappers, so deep links resolve at first paint and after the chunk mounts.

The **changelog timeline** (`changelog-timeline/index.tsx`) maps over `RELEASES` in array order, rendering a vertical-rail timeline of release cards with per-change badges (`feature`/`improvement`/`fix`/`breaking` → New/Improved/Fixed/Breaking). It computes the "Latest" badge with `latestRelease(RELEASES)` from the release authority `src/lib/release.ts` — max `Date.parse(date)`, unparseable dates skipped, ties keep the first — *not* by array position, so an out-of-order hotfix won't mislabel the wrong row.

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
| `src/data/changelog.ts` | Canonical `RELEASES` data + `ChangeType`/`Release` types + `CHANGE_TYPE_META` |

## Data & state
- **Source:** `src/data/changelog.ts` → `RELEASES: Release[]` (hardcoded; 3 releases as of 2026-10-06 - only versions the desktop actually tagged: v0.4.0, v1.0.0, v1.1.0, dated by their tags. Untagged versions must not be added). **Stores:** none — `/how` uses local `useState` (role) only; changelog is pure render-from-constant. **API routes:** none. **Types:** `Release`, `ChangeItem`, `ChangeType` (`changelog.ts:3-15`); `ViewerRole` (`sections/how-role-path/roles.ts`); `StageColor` (`lib/colors`).

## Integration points
- **`/how` hosts exactly four demo sections**, each documented separately (see Related docs):
  - `LazyAgentsTimeline` → `agents-race` (anchor `#agents-timeline`)
  - `LazyAgentsChat` → `agents-chat-split` (anchor `#agents-chat`)
  - `LazyPlatformLayers` → `growth-dial` (anchor `#platform-layers`)
  - `LazyEventBusShowcase` → `event-hub` (anchor `#event-bus`)
- Also on `/how`: the **manifesto** stage (`src/components/sections/how-manifesto/`, id `manifesto`) before the event-bus stage - "Your agents. / Your rules. / Your infrastructure." typed in over the ambient gradient + particle canvas, each line with a proof panel. Both new stages are server-rendered (not lazy) and use `fit="fill"`; copy lives in `howSections.rolePath` / `howSections.manifesto` (pending-translation, English only).
- **Changelog data:** `RELEASES` is consumed by `ChangelogTimeline` (mounted in `src/app/roadmap/page.tsx:45`).
- `ChangelogTimeline` carries `data-tour-diagram="changelog"` (`index.tsx:55`) for the guided tour; `/roadmap` mounts it with `tourId="roadmap"`.

## Conventions & gotchas
- **"How It Works & Changelog" are two routes, not one.** The changelog never renders on `/how`. The timeline is at `/roadmap#changelog`; `/how` is demos-only. The doc title pairs them because they're a content unit, not because they co-render.
- **The compact `Changelog` card is gone.** It reached no public page (only the `/preview` harness) and was deleted on 2026-10-06 (`1601b63`) together with its dead `/changelog` link. `ChangelogTimeline` on `/roadmap#changelog` is the only reader of `RELEASES` now.
- **`RELEASES` has no sort invariant.** The full timeline renders in *array order* (`changelog-timeline/index.tsx:68`) — currently newest-first by convention only, not enforced. "Latest" is computed by `max(date)` so it's safe, but the *visual ordering* of the list will follow whatever order entries are added. Keep new releases at the top of the array.
- **Future dates are honored, not clamped.** The "Latest" pick uses the dataset's own max date, never `Date.now()`. A release dated in the future (the top entry `0.12.0` is `2026-02-28`, after today's `2026-06-14`… actually past — but the pattern allows future dates) becomes "Latest" immediately. There is no guard against post-dated entries.
- **All four `/how` demos are `ssr: false`** — they will not appear in server-rendered HTML or for crawlers; only the skeletons do at first paint. Intentional (browser-only APIs), per the SSR decision tree in `LazySection.tsx:25-39`.
- **Reduced motion** is handled inside each demo component, not at the `/how` page level. `StageSection`/`page.tsx` do no gating themselves.
- **Changelog dates:** the timeline formats with `formatDateLong` (`lib/format-date`).

## Related docs
- [Agent Execution Timeline Race](../demos/agents-timeline.md)
- [Multi-Agent Chat](../demos/agents-chat.md)
- [Event Bus Showcase](../demos/event-bus-showcase.md)
- [Platform Layers](../demos/platform-layers.md)
- [Feature index](../INDEX.md)
