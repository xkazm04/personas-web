# Connectors Catalog
> Browse the 125 built-in integrations Personas agents can connect to, filtered by category and search · **Route:** `/connections` · **Status:** Live

## What it does
Public marketing/catalog page listing every integration ("connector") a Personas agent can use. It renders a card grid of 125 connectors grouped into 18 categories, with a fixed left category sidebar (desktop), a search box, and category filter pills (mobile). Each card shows the tool logo, label, category, one-line summary, and auth type; clicking a card opens the [Connector Detail Modal](detail-modal.md) with use cases and a try-it terminal. Two dashed "Extend your own" cards (MCP Servers, Custom APIs) appear when no filter is active, signalling the catalog is open-ended. Category, search, and the open connector are all reflected in the URL (`?category=`, `?q=`, `?connector=`) so views are shareable/bookmarkable.

## How it works
`src/app/connections/page.tsx` is a `"use client"` page wrapped in `<Suspense>` (required because it reads `useSearchParams`). It owns three pieces of state via `useSearchParamState`/`useParsedSearchParamState` — `activeCategory`, `search`, and `selectedConnector` — seeding each **once** from the URL on mount. A single `useEffect` (`page.tsx:31`) owns writeback: it rebuilds the query string from all three and calls `window.history.replaceState` (not `router.push`, so no navigation/scroll). `selectedConnector` is parsed from the `connector` param by matching `connectors.find((c) => c.name === param)`.

The page passes state + setters into `<ConnectionsCatalog>` (`src/components/sections/connections-catalog/index.tsx`). That component computes `categoryCount` (per-category tallies) and `filteredConnectors` in `useMemo`s — filtering by category and a lowercased substring match across `label`, `summary`, and `category` (`index.tsx:39`). It renders the sidebar, the hero/`SectionIntro` with live counts, the filter bar, and the card grid wrapped in `<AnimatePresence mode="popLayout">` for layout-animated add/remove. `onConnectorClick` bubbles back up to `page.tsx`, which sets `selectedConnector`; the modal (`<ConnectorModal>`) lives at page level, sibling to the catalog, and closes by clearing the param.

## Key files
| File | Role |
| --- | --- |
| `src/app/connections/page.tsx` | Route entry; URL-state ownership, modal wiring, Suspense boundary |
| `src/app/connections/layout.tsx` | Static metadata/OG/canonical; `force-static` + `revalidate = 3600` |
| `src/components/sections/connections-catalog/index.tsx` | Catalog composition: filtering, counts, hero, grid, extend cards, empty state |
| `src/components/sections/connections-catalog/data.ts` | `friendlyAuthType()` map + `accentBrandMap` (category accent → brand key) |
| `src/components/sections/connections-catalog/components/CategorySidebar.tsx` | Fixed left rail (desktop ≥lg); alpha-sorted categories with counts |
| `src/components/sections/connections-catalog/components/CatalogFilters.tsx` | Search input + mobile pill filters + "Showing N of M / Clear filters" |
| `src/components/sections/connections-catalog/components/ConnectorCard.tsx` | Single card; logo lockup, hover art, opens modal via `onClick` |
| `src/components/sections/connections-catalog/components/ExtendCard.tsx` | Dashed "extend your own" placeholder card |
| `src/data/connectors.ts` | **Source of truth** — `Connector[]` (125), `categories[]` (18), types |
| `src/lib/tool-catalogue.ts` | **Separate** registry for FlowComposer/EventBusShowcase swarm — NOT used here |

## Data & state
- **Source:** `src/data/connectors.ts` — `connectors: Connector[]` (125 entries) and `categories: ConnectorCategory[]` (18). Generated from `personas/scripts/connectors/builtin/*.json` on 2026-05-17 via `scripts/generate-connectors.mjs`; marquee connectors have hand-written `useCases`, the rest carry category-typed placeholders. **Stores:** none — no Zustand; all state is local `useState` seeded from URL params (`activeCategory`, `search`, `selectedConnector`), written back via `history.replaceState`. **API routes:** none — fully static data, no fetch. **Types:** `Connector`, `ConnectorUseCase`, `ConnectorCategory` (all in `connectors.ts:1-24`); category `accent` is a union of `"cyan" | "purple" | "emerald" | "amber"`.

## Integration points
- **Detail modal:** `<ConnectorModal>` (`src/components/sections/connector-modal/`) is rendered in `page.tsx`, driven by `selectedConnector`; see [Connector Detail Modal](detail-modal.md).
- **Brand theming:** `BRAND_VAR` + `tint()` from `src/lib/brand-theme.ts` color sidebar/pills/active states; `accentBrandMap` (`data.ts`) bridges a category's `accent` string to a `BrandKey`.
- **Logos:** cards load `/public/tools/{icon ?? name}.svg`. Per-card `onError` hides the `<img>` if the SVG is missing — no fallback monogram is rendered (the `monogram` field exists on `Connector` but the catalog card does not use it).
- **Shared shell:** `Navbar`, `Footer`, `PageShell` (`scrollMapItems`), `StageSection`, `SectionWrapper`, `SectionIntro`, `PrimaryCTA` (links to `/#download`).
- **SEO:** `opengraph-image.tsx` and `layout.tsx` import `connectors` / `SITE_URL` for the OG image and canonical URL.

## Conventions & gotchas
- **`connectors.ts` vs `tool-catalogue.ts` are two unrelated registries — easy to confuse.** This page is backed **only** by `connectors.ts` (125 rich `Connector` records). `src/lib/tool-catalogue.ts` (`TOOL_CATALOGUE`, ~37 lightweight `ToolEntry`s) feeds the FlowComposer sidebar and the EventBusShowcase swarm and is **not imported anywhere under `connections-catalog/`**. They have drifted: tool-catalogue lists items absent from the catalog (`stripe`, `salesforce`, `notion`, `trello`, `react`/`nextjs`/`nodejs`/`typescript`/`python` as "tools") and uses different ids/colors for shared ones (e.g. GitHub is `#8b5cf6` in tool-catalogue but `#1F2937` in connectors; Drive is `#34a853` vs `#1FA463`). Treat `connectors.ts` as canonical for the catalog; do not "reconcile" the two without confirming the consumers.
- **Counts are derived everywhere, including metadata.** The hero, pills, and ghost watermark use `connectors.length` (125) and `categories.length` (18) live; `layout.tsx` metadata/OG derive `INTEGRATION_COUNT` (rounded down to the nearest 5) from the same source. Keep any new marketing copy derived rather than hardcoding a count.
- **URL writeback is one-way and replace-only.** State seeds from the URL exactly once (`useSearchParamState` is read-once by design, see its JSDoc). The lone `useEffect` owns all three params together to avoid per-key write races; do not add a second writeback effect. Because it uses `replaceState`, back/forward will not restore prior filter/modal state within the page.
- **Search ignores `name` and `authType`.** `filteredConnectors` matches only `label`, `summary`, and `category`. Searching a connector's machine `name` (e.g. `twilio_sms`, `aws_s3`) or its auth type yields no hit.
- **Extend cards only show in the unfiltered view.** Both `<ExtendCard>`s render only when `activeCategory === "all" && search === ""`. Their accents are raw hex literals (`#06b6d4`, `#a855f7`) passed as props — not semantic tokens — so they bypass `BRAND_VAR`/Tailwind tokens. Card text ("MCP Servers", "Custom APIs", etc.) and the catalog's body copy are **hardcoded English**, not routed through `useTranslation()`/`en.ts` — a deviation from the repo i18n rule; do not copy this pattern, and flag if this page is meant to be localized.
- **No `useReducedMotion` gating here.** All motion uses framer-motion `variants`/`whileHover`/`AnimatePresence` (declarative, honors framer's reduced-motion at the provider level) and no `requestAnimationFrame`, so the `require-animation-gating` lint rule is not triggered — but the per-card `transition.delay = Math.min(index * 0.03, 0.6)` still animates a visible stagger regardless of OS reduced-motion preference.
- **`force-static` page reading client params.** The page is statically rendered (`dynamic = "force-static"` in `layout.tsx`); the client component reads params after hydration, which is why it must sit under `<Suspense>`. The initial static HTML shows the unfiltered "all" view.

## Related docs
- [Connector Detail Modal](detail-modal.md)
- [Templates Gallery](templates-gallery.md)
- [Feature index](../INDEX.md)
