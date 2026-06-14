# Footer & Primary CTA
> Global site footer (brand, social, link columns, copyright) plus the reusable gradient `PrimaryCTA` button shared across landing sections. · **Route:** global (site footer) · **Status:** Live

## What it does
The footer closes every marketing and content page: the Personas wordmark + logo, a one-line motto, three social links (GitHub, Twitter, Discord), two-to-three columns of navigation links, a theme switcher, and a copyright line with the current year. On mobile the link columns collapse into tappable accordions; on `md+` they expand statically into a grid.

`PrimaryCTA` is the site's headline call-to-action button — a pill with an animated gradient border, hover shimmer, and an icon. It renders as a link or a button and ships in two looks (`ghost`, `solid`). It is reused by the hero, pricing, download, blog, guide, and connections surfaces (it is **not** itself rendered inside the footer).

## How it works
`Footer.tsx` is a client component that pulls copy via `useTranslation()` and builds its columns from `getFooterColumns(t)`. The brand block spans two grid columns; the remaining columns render through `FooterLinkColumn`, and the grid switches between `md:grid-cols-3` and `md:grid-cols-2` based on `columns.length`.

`getFooterColumns` returns a Product column and a Legal column always, and **conditionally** inserts a Resources column only when `process.env.NODE_ENV === "development"` (`footerColumns.ts:4,13`). In production builds the footer therefore shows two columns; in `npm run dev` it shows three.

`FooterLinkColumn` is mobile-first: the title is a `<button>` toggling `open` state; on `md+` the button is `pointer-events-none` and a static link list shows, while the mobile path animates an `AnimatePresence`/`motion.ul` height+opacity accordion. `FooterLinkItem` chooses `next/link` for internal hrefs and a raw `<a target="_blank" rel="noopener noreferrer">` for external ones via `isExternal()`.

`FooterCopyright` renders `© <year> {copyright}`, the `ThemeSwitcher`, and the slogan. The year is computed once in a lazy `useState(() => new Date().getFullYear())` initializer and wrapped in `suppressHydrationWarning` — the React 19-safe way to read an impure value without calling it in render.

`PrimaryCTA` is a polymorphic wrapper: a gradient-border `<div>` containing either an `<a href>` or a `<button onClick>`. Variant styles (`ghost` = dark glass inner with border glow; `solid` = filled cyan) are looked up from a `variantStyles` record. The animated border (`animate-border-flow`) and the hover shimmer sweep are both expressed through Tailwind `motion-safe:` / `motion-reduce:` variants rather than JS.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/Footer.tsx` | Footer shell; grid layout, column-count switch, composes sub-parts |
| `src/components/sections/footer/footerColumns.ts` | `getFooterColumns(t)` — column/link config, dev-only Resources column |
| `src/components/sections/footer/FooterBrand.tsx` | Logo + wordmark, motto, GitHub/Twitter/Discord social links |
| `src/components/sections/footer/FooterLinkColumn.tsx` | One link column; mobile accordion (framer-motion) + `md+` static list |
| `src/components/sections/footer/FooterCopyright.tsx` | Copyright + lazy current-year + `ThemeSwitcher` + slogan |
| `src/components/PrimaryCTA.tsx` | Reusable gradient pill CTA (`ghost`/`solid`, link or button) |

## Data & state
- **Source:** static config (`getFooterColumns`) + i18n copy; no remote data. **Stores:** none global — only local `useState` (`open` per column in `FooterLinkColumn:13`, lazy `year` in `FooterCopyright:21`). **API routes:** none. **Types:** `Translations` from `@/i18n/en` (footer keys at `en.ts:34-44`); `PrimaryCTAProps` / `Variant` defined inline in `PrimaryCTA.tsx:3-13`; links typed as `{ label: string; href: string }[]`.
- **i18n keys consumed:** `t.footer.{motto, product, resources, legal, privacy, terms, copyright, slogan}`, plus link labels reused from `t.sections.features`, `t.nav.{templates, guide, how, connections, roadmap, security}`.
- **Constants:** `DISCORD_INVITE_URL` (`src/lib/constants.ts:36`, env-overridable via `NEXT_PUBLIC_DISCORD_INVITE_URL`).

## Integration points
- `Footer` is imported and rendered by many page shells: `app/error.tsx`, `app/not-found.tsx`, `app/connections/page.tsx`, `app/legal/page.tsx`, `app/blog/page.tsx` + `app/blog/[slug]/*`, `app/templates/[id]/TemplateDetail.tsx`, and others. Adding it to a new page is a manual `<Footer />` placement (it is not in the root layout).
- `FooterCopyright` depends on `@/components/ThemeSwitcher`; `FooterBrand` depends on `@/components/icons/brand-icons` and `next/image` (logo at `/imgs/logo.png`).
- `PrimaryCTA` consumers: `sections/HeroClient.tsx`, `sections/DownloadCTA.tsx`, `sections/pricing/index.tsx`, `sections/connections-catalog/index.tsx`, `app/guide/[category]/[topic]/TopicView.tsx`, `app/blog/page.tsx`. Icons are passed as `lucide-react` `LucideIcon`s; labels must come from `useTranslation()` at the call site.

## Conventions & gotchas
- **Copyright year is read impurely but correctly:** `new Date().getFullYear()` is wrapped in a lazy `useState(() => …)` initializer (`FooterCopyright:21`), satisfying the React 19 "no impure calls in render/`useMemo`" rule, with `suppressHydrationWarning` to absorb any server/client mismatch. Do not move this call into render or a `useMemo` factory.
- **Animation-gating gap:** `FooterLinkColumn` animates with framer-motion (`AnimatePresence` + `motion.ul` height/opacity, `FooterLinkColumn.tsx:24-30`) but does **not** import `useReducedMotion`. The custom `require-animation-gating` lint rule only fires on `requestAnimationFrame`/`cancelAnimationFrame`, so this passes lint, yet the mobile accordion still animates for users who prefer reduced motion — a real (un-flagged) accessibility gap worth gating if touched.
- **Dead/unused i18n key:** `footer.tagline` exists in the `Translations` interface (`en.ts:35`) and in the data (`en.ts:1109`) but no component reads it — only `motto` is rendered. It must still be kept in lockstep across all 14 locales while present; consider removing it from every locale together if cleaning up.
- **Dev-only column:** the Resources column appears solely in `NODE_ENV === "development"`. Production parity testing of the footer must account for the 2-vs-3-column difference (and the `md:grid-cols-3`/`md:grid-cols-2` switch keyed off `columns.length`).
- **`PrimaryCTA` motion is CSS-gated, not hook-gated:** the border-flow and shimmer use Tailwind `motion-safe:` / `motion-reduce:` variants (`PrimaryCTA.tsx:21,29,51-53`), which respect `prefers-reduced-motion` without `useReducedMotion`. This is intentional and correct — don't "fix" it by adding the hook.
- **`PrimaryCTA` color tokens:** the inner uses raw `text-white`/`bg-black/80` and `shadow-[0_0_30px_rgba(...)]` rather than semantic tokens. This is an established exception for the brand CTA's neon look; match the existing pattern rather than introducing new hex.
- **Brand image sizing:** the logo `width={42} height={24}` mirrors the source's 1.75:1 aspect ratio so `h-6 w-auto` avoids a dev-mode `next/image` aspect warning (`FooterBrand.tsx:9-11`).
- **i18n / tokens / a11y:** all visible footer strings come from `t.footer.*` / `t.nav.*`; social and toggle controls expose `aria-label` / accessible focus rings (`focus-visible:ring-brand-cyan/40`). Keep new strings out of JSX literals and in `en.ts` first, mirrored across all 14 locales.

## Related docs
- [Layout, navigation & page shell](../platform/layout-navigation.md)
- [Feature index](../INDEX.md)
