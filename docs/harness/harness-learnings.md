# personas-web — harness learnings

## Structural facts
- **2026-04-10** — The project is a hybrid marketing + dashboard site. Landing page sections are lazy-loaded via `src/components/sections/lazy.tsx` using `createLazySection()` and `next/dynamic`. New sections must be added there, then wired into the `sections` array in `src/app/page.tsx`.
- **2026-04-10** — `Vision.tsx` is a thin re-export wrapper for `VisionGrid.tsx`. To change the Vision section, edit `VisionGrid.tsx`.
- **2026-04-10** — SEO keywords are in `src/app/layout.tsx` (metadata export), NOT in `page.tsx`. `SITE_DESCRIPTION` is in `src/lib/seo.ts`.
- **2026-04-10** — i18n has 14 language files in `src/i18n/`. Any new translation keys must be added to ALL of them plus the `Translations` interface in `en.ts`.
- **2026-04-10** — LANDING_SECTIONS registry in `src/lib/constants.ts` controls both navbar badges and scroll-map dots. New sections need entries here.
- **2026-04-10** — The `.next/dev/types/validator.ts` can accumulate stale route references. If `next build` fails on phantom module imports, delete `.next/` and rebuild.
- **2026-04-10** — The companion desktop app at `C:\Users\kazda\kiro\personas` has 18+ major features (multi-agent canvas, credential vault, genome evolution, self-healing, 40+ connectors, 6 trigger types, multi-provider AI, testing lab, etc.). Marketing content should align with these.

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
- No dedicated feature deep-dive pages exist yet (/features/orchestration, /features/security, etc.)
