# Public Roadmap
> The `/roadmap` page presents Personas' progress as per-area fulfillment cards plus an overall phase bar, with a standalone Supabase-backed `/api/roadmap` endpoint that guards on env and falls back cleanly · **Route:** `/roadmap` · **API:** `/api/roadmap` · **Status:** Live (Supabase + static fallback)

## What it does
`/roadmap` reframes a roadmap as *fulfillment, not chronology*: instead of a dated timeline, it shows where each logical area of the product stands today. The top of the page is an overall progress bar ("X of 15 phases complete"); below it sits a grid of area cards (Internationalization, Device Support, Collaboration, Core Platform, Template Gallery), each card filling its tiles left→right by how far that slice has come. The art in each tile *develops* — dim/grayscale art turns full-color, clipped to the completion width behind a glowing seam — so the picture literally resolves as work lands.

The page also hosts two sibling sections under the same shell: the **feature-voting** widget (`#vote`) and the **changelog timeline** (`#changelog`). The changelog is documented separately ([How It Works & Changelog](../content/how-it-works.md)) — this doc covers only the roadmap section and the `/api/roadmap` endpoint.

A separate `/api/roadmap` route reads live `roadmap_items` rows from Supabase when configured, and returns an empty, source-tagged payload otherwise. **Note:** as of writing the rendered roadmap UI does not consume this endpoint — it draws entirely from static data (see gotchas).

## How it works
`src/app/roadmap/page.tsx` is a static page (`force-static`, `revalidate=3600`) that composes three `StageSection`-wrapped sections inside `InfoPageLayout` (Navbar + scroll map + tour + Footer): `<Roadmap />` (`#roadmap`), `<FeatureVoting />` (`#vote`), `<ChangelogTimeline />` (`#changelog`). The scroll map (`page.tsx:27-31`) links those three anchors.

`<Roadmap />` (`sections/roadmap/index.tsx`) renders a `SectionIntro` + `<RoadmapProgress />` + `<RoadmapAreas />`:

- **`RoadmapProgress`** (`components/RoadmapProgress.tsx`) draws the headline bar. Every count and percentage is *derived* from `phaseCardData` in `data/roadmap-phases.ts` (`completedCount`, `totalPhases`, `progressPercent`, …) — that array is the single source of truth, so flipping a `completed: true` flag updates the public copy, the percentage, the animated bar width, and the "Phases 1-N done" label in lockstep (`RoadmapProgress.tsx:19-26`). The bar animates `width: 0 → progressWidth` and a position dot via `whileInView` (`once: true`).
- **`RoadmapAreas`** (`components/RoadmapAreas.tsx`) maps `AREAS` from `areas.ts` into `AreaCardShell`s. Each area's bars become `RevealTile`s. A tile layers three things: dim grayscale art (`opacity-25 grayscale`), a full-color copy clipped via `clipPath: inset(0 {100-pct}% 0 0)`, and a glowing vertical seam that animates from `left:0% → left:pct%`. Tile art (`TileArt`) switches on `motif.kind`: `flag` → inline `FlagArt` SVG, `image` → dark/light `next/image` pair, `icon`/none → a brand-tinted gradient with an optional Lucide icon. A bottom scrim owns the label/detail/percent typography so it never fights the art.
- **`AreaCardShell`** (`components/AreaCardShell.tsx`) is the shared chrome (icon chip, title, caption, header percent from `areaOverall(area)`). It is **self-driven** — `variants={fadeUp} initial="hidden" whileInView="visible"` rather than inheriting `SectionWrapper`'s variants (see gotchas).

`FlagArt` (`components/FlagArt.tsx`) draws EU/JP/IN/AE flags as inline SVG geometry (emoji flags don't render on Windows and no flag assets ship); flag colors are intentionally literal hex and don't theme.

**`PhaseCard` / `phaseCardData`** (`PhaseCard.tsx`, `roadmap-phases.ts`) define a 15-phase card strip and the richer `phases` array (with per-phase task lists). These back the progress derivation and are available as a horizontally-scrollable `PhaseCardStrip`, though the live `/roadmap` page currently renders `RoadmapAreas` (the area-card treatment) rather than the phase strip.

### `/api/roadmap`
`GET /api/roadmap` (`api/roadmap/route.ts`):
1. If `hasSupabaseEnv()` is false → returns `{ items: [], source: "none" }` (200). No Supabase import is even attempted.
2. Else dynamically imports `getSupabase()`, selects `roadmap_items` ordered by `sort_order`.
3. On Supabase error → logs structured error and returns `{ items: [], source: "error" }` with **status 502**.
4. On success → `{ items: data ?? [], source: "supabase" }` (200).

`source` is the discriminator a consumer would use to tell live data from fallback.

## Key files
| File | Role |
| --- | --- |
| `src/app/roadmap/page.tsx` | Static page: composes Roadmap + FeatureVoting + ChangelogTimeline in `InfoPageLayout`; scroll-map anchors + metadata |
| `src/app/api/roadmap/route.ts` | `GET /api/roadmap` — env-guarded Supabase read of `roadmap_items`, source-tagged fallback |
| `src/app/api/roadmap/types.ts` | `RoadmapResponse` + `RoadmapResponseSource` (`"supabase" \| "none" \| "error"`) |
| `src/components/sections/roadmap/index.tsx` | `<Roadmap />` — SectionIntro + progress + area cards |
| `src/components/sections/roadmap/areas.ts` | `AREAS` data (areas/bars/motifs) + `areaOverall()`; `AreaDef`/`AreaBarDef`/`BarMotif` types |
| `src/components/sections/roadmap/types.ts` | `RoadmapItem` type (shape of a `roadmap_items` row) |
| `src/components/sections/roadmap/components/RoadmapProgress.tsx` | Overall phase bar; counts derived from `phaseCardData` |
| `src/components/sections/roadmap/components/RoadmapAreas.tsx` | Area-card grid + `RevealTile` (develop-the-art treatment) |
| `src/components/sections/roadmap/components/AreaCardShell.tsx` | Shared card chrome; self-driven `whileInView` reveal |
| `src/components/sections/roadmap/components/FlagArt.tsx` | Inline-SVG EU/JP/IN/AE flags (literal hex, no assets) |
| `src/components/PhaseCard.tsx` | `PhaseCard` + scrollable `PhaseCardStrip` (15-phase grid) |
| `src/data/roadmap-phases.ts` | `phases`, `phaseCardData`, derived `completedCount`/`progressPercent`/… (single source of truth) |
| `src/lib/server/env.ts` | `hasSupabaseEnv()` URL+anon-key guard |
| `src/lib/supabase.ts` | Memoized anon-key `getSupabase()` client |

## Data & state
- **Source:** Supabase `roadmap_items` (via `/api/roadmap`) **plus** static `src/data/roadmap-phases.ts` (`phaseCardData`/`phases`) and `src/components/sections/roadmap/areas.ts` (`AREAS`). `areas.ts` derives its *counts* at build time from the real catalog/registry modules — template counts from `@/lib/templates` (`templates`), the connector count from `@/data/connectors` (`connectors`), and locale counts from `@/stores/i18nStore` (`LANGUAGES`) — so the card numerators can't drift from the shipped product. Only the *targets* those counts fill toward (per-category gallery goals, coverage %) remain hand-authored, flagged inline as having no data source. The rendered page reads only the static data; the Supabase rows are exposed by the API but not yet wired into the UI. The context-map description also names `shipped_features`, but the route only queries `roadmap_items` — `shipped_features` is not read anywhere in `src/`. **Stores:** none — the roadmap section is pure render-from-constant; no Zustand store, no client fetch on `/roadmap`. **API routes:** `/api/roadmap` (`GET`). **Types:** `RoadmapItem` (`roadmap/types.ts`), `RoadmapResponse`/`RoadmapResponseSource` (`api/roadmap/types.ts`), `AreaDef`/`AreaBarDef`/`BarMotif` (`areas.ts`), `Phase`/`PhaseTask`/`PhaseCardData` (`roadmap-phases.ts`, `PhaseCard.tsx`).

## Integration points
- **Page shell:** `InfoPageLayout` with `tourId="roadmap"`; `RoadmapProgress` carries `data-tour-diagram="roadmap-progress"` for the guided tour, and `ChangelogTimeline` carries `data-tour-diagram="changelog"`.
- **Siblings on `/roadmap`:** `<FeatureVoting />` (`#vote`) and `<ChangelogTimeline />` (`#changelog`) — both share this route but are documented separately.
- **Supabase:** `/api/roadmap` is the only roadmap consumer of `getSupabase()`; gated by `hasSupabaseEnv()` (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Same anon-key-only pattern as the voting/feature-request routes.
- **Brand theming:** `RevealTile`/`AreaCardShell`/`RoadmapProgress` pull colors from `BRAND_VAR`/`tint` (`@/lib/brand-theme`) by `area.brand`; animations use `fadeUp` from `@/lib/animations`.
- **Assets:** device/template motifs reference `/imgs/get-started/platform/*` and `/imgs/templates/*` (dark/light pairs).

## Conventions & gotchas
- **The page does not call `/api/roadmap`.** `<Roadmap />` is a client component but performs no fetch — the entire section renders from static `areas.ts` + `roadmap-phases.ts`. The Supabase endpoint exists and is correct, but nothing consumes it today; "Supabase-backed" describes the API, not the rendered cards. Wiring the UI to the route is a deliberate future step, not an accident to "fix" silently.
- **`revalidate = 3600` on the page is a no-op for live data.** The page is `force-static` and the roadmap section reads constants — there is no `fetch`/`unstable_cache` participating in Next's data cache, so the hourly revalidate doesn't refresh anything Supabase-side. If/when the UI starts fetching `/api/roadmap` client-side on mount, the static shell + 1h ISR won't help freshness either.
- **Loader-stuck risk if you wire the API naively.** The error branch returns HTTP **502** with a `RoadmapResponse` body. A consumer that does `fetch().then(r => r.json())` without checking `r.ok` and without handling `source === "error"`/`"none"` can sit on a `loading` state forever. Any future client integration must branch on all three `source` values, not just `"supabase"`.
- **No runtime validation of Supabase rows.** The route `select`s columns and casts to `RoadmapItem[]`; TS types are erased at runtime. A column rename (e.g. `name`→`title`) silently flips the route into the 502 `error` branch; bad `status`/`priority` enum values would pass through unchecked.
- **Two sources of truth.** Progress derives from static `phaseCardData` (15 phases), while `roadmap_items` is a separate Supabase concept (`status: in_progress|next|planned|completed`, `priority: now|next|later`). They overlap conceptually but are not reconciled — keep counts authoritative in `phaseCardData` unless you intentionally migrate progress to the API.
- **`AreaCardShell` must stay self-driven.** It uses `initial="hidden" whileInView="visible"` instead of inheriting `SectionWrapper`'s one-shot reveal variants. Cards can mount after the wrapper's hidden→visible pass has already fired; inherited variants would leave a late-mounted card stuck at `hidden` (invisible). `whileInView` re-fires per mount — don't "simplify" this back to inherited variants.
- **Reduced motion:** `RevealTile` reads `useReducedMotion()` and, when true, sets the final `clipPath`/seam `left` statically (no animation). Preserve this branch when editing tiles. `RoadmapProgress` gates the same way — under reduced motion the fill bar renders at its final `width`, the shimmer sweep is omitted entirely, and the position dot drops its `animate-progress-dot-breathe` class and sits statically at `left: calc(var(--progress) * 100%)`. `PhaseCardStrip` also gates its scroll-RAF and mobile-peek effect behind `useReducedMotion` (required by `custom-animation/require-animation-gating`).
- **Flag colors are intentionally literal hex** in `FlagArt` and don't theme — by design (real flag colors). The scrim labels also use literal white-on-black for contrast over arbitrary art; that's the owned scrim zone, not a token violation to "correct."

## Related docs
- [Feature Voting & Comments](feature-voting.md)
- [How It Works & Changelog](../content/how-it-works.md)
- [Supabase Client](../infrastructure/supabase-client.md)
- [Feature index](../INDEX.md)
