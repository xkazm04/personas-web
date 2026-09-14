# Pricing
> Feature-group "compare" showcase that replaced the old paid tiers with a "free forever" offer + six guide-linked capability cards · **Route:** `/` homepage section (`#pricing`, nav label "Compare") · **Status:** Live

## What it does
The section a reader reaches under the "Compare" / Pricing anchor on the homepage. Instead of price tiers it makes one offer — Personas is **free forever, self-hosted, no per-run markup, open source** — restated in a centered offer band with a "Get started free" download CTA. Below it, a responsive 1/2/3-column grid of six brand-colored capability cards (Agents & Prompts, Orchestration, Pipelines & Teams, Credentials & Security, Monitoring, Testing Lab). Each card shows a title, tagline, a checklist of concrete concepts, and a "Read the guide" link into the matching `/guide/*` page. The heading reads "Everything is **free**".

The old Local/Cloud/Enterprise tier cards are gone from this section (see gotchas — the `t.pricing.*` tier copy still exists but is no longer rendered as a pricing surface).

## How it works
`Pricing` (`index.tsx`) renders a `SectionWrapper id="pricing"` with a `SectionIntro` header, a static offer band, then maps `FEATURE_GROUPS` to a `FeatureGroupCard` each inside a `staggerContainer` motion grid (`whileInView`, `once: true`). It is loaded on the homepage as `LazyPricing` (`src/components/sections/lazy.tsx:127`) and placed by the `sections` array in `src/app/page.tsx:56` with `wrapperId: "pricing"` (purple stage). Not rendered on `/features`.

`FEATURE_GROUPS` (`data.ts`) holds only the **non-translatable structure** per group: stable `id`, a lucide `icon`, a `brand` color key, and a `guideHref`. `FeatureGroupCard` reads the translatable copy from `t.compareSection.groups[group.id]` (`{ title, tagline, concepts[] }`) — so the card body is fully i18n-driven, keyed by `id`. Brand color flows through `BRAND_VAR[brand]` / `tint` / `brandShadow` from `brand-theme.ts` into the icon chip, title glow, divider gradient, check marks, and guide link.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/pricing/index.tsx` | Section: SectionIntro, static "free forever" offer band + CTA, stagger grid of cards |
| `src/components/sections/pricing/data.ts` | `FeatureGroup` type, `FeatureGroupId` union, `FEATURE_GROUPS` (icon/brand/guideHref only) |
| `src/components/sections/pricing/FeatureGroupCard.tsx` | Single brand card: icon chip, title+tagline, concept checklist, guide link |
| `src/i18n/en.ts:1033` | `compareSection` source copy: heading, description, `readGuide`, per-group `{title, tagline, concepts[]}` |
| `src/components/sections/lazy.tsx:127` | `LazyPricing` code-split wrapper |
| `src/app/page.tsx:56` | Mounts `LazyPricing` in the homepage section list (`wrapperId: "pricing"`) |

## Data & state
- **Source:** fully static. **Stores:** none (no Zustand). **API routes:** none for content; CTA points at `/api/download` when `NEXT_PUBLIC_DOWNLOAD_URL` is set, else falls back to the `#download` anchor. **Types:** `FeatureGroup`, `FeatureGroupId` (`data.ts`); copy typed by the `compareSection` shape in the `Translations` interface (`en.ts`). No live/orchestrator data.

## Integration points
- **`SectionWrapper` / `SectionIntro`** (`@/components/primitives`) — section chrome + gradient heading. Wrapper drives the `whileInView` stagger reveal.
- **`BrandCard`** (`@/components/primitives`) — themed card surface; `brand-theme.ts` (`BRAND_VAR`, `tint`, `brandShadow`) supplies all per-brand color.
- **`PrimaryCTA`** + lucide `Download` — the offer CTA.
- **`/guide/<group>`** — each card deep-links into the product guide (`guideHref`). Card `id`s mirror guide categories.
- **`SCROLL_MAP_SECTIONS`** (`src/lib/constants.ts:19`) — `#pricing` anchor labeled "Compare" in the scroll map; nav and any existing `#pricing` hash links still resolve here.
- **Navbar / `t.nav.pricing`** ("Pricing") still labels the link to this anchor.

## Conventions & gotchas
- **Copy/structure split is the rule here:** add a group by extending `FeatureGroupId` + `FEATURE_GROUPS`, then add `t.compareSection.groups[id]` in `en.ts` **and all 13 other locales** (14-locale lockstep). `tsc` enforces the shape; translation completeness is still a hard manual requirement. Locale files are mojibake on disk — anchor edits on ASCII and write correct UTF-8.
- **Hardcoded English in `index.tsx` (real issue):** the offer band strings — "Free forever", "Self-hosted", "No per-run markup", "Open source", the paragraph, and the "Get started free" CTA `label` — are literals in JSX, not `t.*`. This violates the i18n convention (every user-facing string in `en.ts`) and ships untranslated in 13 locales. Only the `compareSection` header + cards are localized.
- **Tier copy removed (2026-09-14):** the old `pricing` namespace (`local`/`cloud`/`enterprise`, feature rows, prices) is gone from all 14 locales; only `t.pricing.comingSoon` remains, for `WaitlistModal.tsx`.
- **JSON-LD reconciled (2026-09-14):** `homeJsonLd.ts` builds the FAQ rich snippet from `en.faqSection`, which now says the app is free and open source with no plans, tiers or cloud execution.
- **Animation gating:** this section is exempt from `require-animation-gating` — it uses only framer-motion `variants` (`fadeUp`, `staggerContainer`) via `whileInView`, with no `requestAnimationFrame`/canvas. The shared `useAnimationPause` (in `SectionWrapper`) pauses motion globally; no `useReducedMotion` import is needed here.
- **Tokens:** mostly compliant (`text-foreground`, `text-muted-dark`, `border-glass`, `text-brand-cyan`, per-brand via `BRAND_VAR`/`tint`). Watch `text-foreground/80` (at the `/60` WCAG floor, allowed) and the `bg-white/[0.02]` raw wash in the offer band (mirrors `BrandCard`'s surface but bypasses the token).
- **Anchor is load-bearing:** keep `id="pricing"`. The file comment notes it stays `#pricing` so the scroll-map and external hash links keep working even though it's no longer a price grid; renaming requires updating `SCROLL_MAP_SECTIONS` and any inbound links.

## Related docs
- [Features Overview](features-overview.md)
- [Feature index](../INDEX.md)
