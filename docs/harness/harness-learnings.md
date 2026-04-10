# personas-web — harness learnings

## Structural facts
- **2026-04-10** — The project is a hybrid marketing + dashboard site. Landing page sections are lazy-loaded via `src/components/sections/lazy.tsx` using `createLazySection()` and `next/dynamic`. New sections must be added there, then wired into the `sections` array in `src/app/page.tsx`.
- **2026-04-10** — `Vision.tsx` is a thin re-export wrapper for `VisionGrid.tsx`. To change the Vision section, edit `VisionGrid.tsx`.
- **2026-04-10** — SEO keywords are in `src/app/layout.tsx` (metadata export), NOT in `page.tsx`. `SITE_DESCRIPTION` is in `src/lib/seo.ts`.
- **2026-04-10** — i18n has 14 language files in `src/i18n/`. Any new translation keys must be added to ALL of them plus the `Translations` interface in `en.ts`.
- **2026-04-10** — LANDING_SECTIONS registry in `src/lib/constants.ts` controls both navbar badges and scroll-map dots. New sections need entries here.
- **2026-04-10** — The `.next/dev/types/validator.ts` can accumulate stale route references. If `next build` fails on phantom module imports, delete `.next/` and rebuild.
- **2026-04-10** — The companion desktop app at `C:\Users\kazda\kiro\personas` has 18+ major features (multi-agent canvas, credential vault, genome evolution, self-healing, 40+ connectors, 6 trigger types, multi-provider AI, testing lab, etc.). Marketing content should align with these.

- **2026-04-10** — The sitemap has been upgraded to include dynamic routes (features/[slug], guide/[category], guide/[category]/[topic], templates/[id]). New static pages must be added to `staticPages` array in `src/app/sitemap.ts`.
- **2026-04-10** — Navbar routes are in `useRoutes()` inside `src/components/Navbar.tsx`. Adding a new nav item requires: (1) add to useRoutes array, (2) add i18n key to Translations interface + all 14 language files.
- **2026-04-10** — Internal links in `"use client"` pages MUST use `<Link>` from `next/link`, not `<a>`. ESLint enforces `@next/next/no-html-link-for-pages`.
- **2026-04-10** — `src/data/comparison.ts` has multi-competitor comparison data (Personas vs CrewAI, LangChain, n8n, AutoGen). `src/data/pricing.ts` still has the legacy Personas-vs-n8n-only `COMPARISON_DATA` used by the landing page Pricing section.

## Conventions enforced
- All section components use `SectionWrapper` with a unique `id` prop
- Glass-morphism card style: `rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm`
- Animation patterns: `staggerContainer`, `fadeUp`, `revealFromBelow` from `@/lib/animations`
- Color theme: cyan (#06b6d4), purple (#a855f7), emerald (#34d399), rose (#f43f5e), amber (#fbbf24)

## Anti-patterns to avoid
- Don't edit `Vision.tsx` directly — it just re-exports `VisionGrid.tsx`
- Don't add SEO keywords to `page.tsx` — they belong in `layout.tsx`
- Don't assume `.next` cache is clean — stale dev types can block builds

## Open follow-ups (from Run #1, 2026-04-10)
- The Pipeline Showcase section uses tab switching but has no mobile-optimized touch gestures (swipe)
- The Platform Capabilities cards have no "Learn more" links to dedicated feature pages (these pages don't exist yet)
- The Pricing comparison table content is still separate from the new Platform Capabilities section — consider consolidating messaging
- VisionHoneycomb.tsx exists but isn't used anywhere — could be repurposed for a dedicated orchestration page
- ~~No dedicated feature deep-dive pages exist yet (/features/orchestration, /features/security, etc.)~~ DONE (Run #10)
- The legacy `COMPARISON_DATA` in `pricing.ts` (Personas vs n8n only) is still used by the landing page Pricing section. Could be migrated to use `comparison.ts` multi-competitor data instead.

## Open follow-ups (from Run #12, 2026-04-10)
- /compare page has no structured data (JSON-LD ComparisonTable or similar schema)
- Competitor data in `comparison.ts` should be periodically verified against live competitor sites for accuracy
- The Pricing section's "See full comparison" link is an `<a>` tag, not `<Link>` — minor lint inconsistency since Pricing.tsx is a client section component
