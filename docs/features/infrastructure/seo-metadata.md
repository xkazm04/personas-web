# SEO & Social Metadata
> The SEO/social plumbing — shared metadata helpers, per-route OpenGraph image generators, sitemap, robots, and PWA manifest. · **Route:** n/a (metadata plumbing) · **Status:** Config

## What it does
Gives every page consistent search and social-unfurl signals: canonical title/description/keywords, OpenGraph + Twitter card tags, a 1200×630 preview image per major route, JSON-LD structured data (Organization, SoftwareApplication, FAQ, per-template SoftwareSourceCode), a crawl policy (`robots.txt`), a URL inventory (`sitemap.xml`), and a PWA install manifest. The goal is that a link to any indexable page unfurls with a branded card on Slack/X/LinkedIn and search engines get rich, non-drifting metadata.

## How it works
`src/lib/seo.ts` holds the canonical constants (`SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `TWITTER_HANDLE`, `SITE_LOCALE`) plus `safeJsonLd()`, which escapes `</script` and `<!--` so JSON-LD payloads can't break out of the script tag (stored-XSS guard for the moment template/blog data becomes editable). The root `src/app/layout.tsx` builds the default `Metadata` object from those constants — `metadataBase`, title template (`%s — Personas`), OG, Twitter `summary_large_image`, and canonical. Child routes export `generateMetadata`/`metadata` that override title/description/canonical and inherit the rest.

OG images are file-convention routes (`opengraph-image.tsx`) that Next renders to PNG via `next/og` `ImageResponse`. Two shared visual templates exist:
- `src/lib/og-frame.tsx` — `OgFrame`, a centered "hero" card (big P glyph, "Personas", subtitle, pill tags). Used by static section routes (home, features, how, roadmap, connections).
- `src/lib/og.tsx` — `ogCard`, a left-aligned card with badge + title + subtitle + footer, sized down for long titles. Used by data-driven routes (blog post, templates index, guide category/topic) where the title comes from content.

Both export `OG_SIZE = 1200×630`; `og-frame.tsx` also exports `OG_CONTENT_TYPE = "image/png"`. Dynamic routes `await params`, look the slug up in the data layer, and either render a card or (blog) return a 404 `ImageResponse` for unknown slugs so nobody can forge a misleading unfurl under the domain.

`sitemap.ts`, `robots.ts`, `manifest.ts` are `force-static` metadata routes. The sitemap composes static pages + guide categories + guide topics + template details + blog posts from the same data modules the pages use. `manifest.ts` pulls `BG_NEAR_BLACK` from `seo.ts` so the PWA splash matches the global error UI.

## Key files
| File | Role |
| --- | --- |
| `src/lib/seo.ts` | Shared SEO constants + `safeJsonLd()` script-escaper; canonical `SITE_URL`/`SITE_NAME`/`SITE_DESCRIPTION`/`TWITTER_HANDLE`/`BG_NEAR_BLACK` |
| `src/app/layout.tsx:24` | Root `metadata` object (title template, OG, Twitter, canonical, keywords) consumed by every route |
| `src/lib/og-frame.tsx` | `OgFrame` centered hero OG template; exports `OG_SIZE`, `OG_CONTENT_TYPE` |
| `src/lib/og.tsx` | `ogCard` badge/title/subtitle OG template for data-driven routes |
| `src/app/opengraph-image.tsx` | Root/home OG image (`OgFrame`, `revalidate=86400`) |
| `src/app/{features,how,roadmap,connections}/opengraph-image.tsx` | Section OG images via `OgFrame` (per-route accent + tags) |
| `src/app/templates/opengraph-image.tsx` | Templates **index** OG via `ogCard` (no image for `/templates/[id]`) |
| `src/app/blog/[slug]/opengraph-image.tsx` | Per-post OG via `ogCard`; 404 `ImageResponse` on unknown slug |
| `src/app/guide/[category]/opengraph-image.tsx` · `.../[topic]/opengraph-image.tsx` | Per-category/topic OG via `ogCard` |
| `src/app/sitemap.ts` | Static + guide + template + blog URL inventory (`force-static`, daily revalidate) |
| `src/app/robots.ts` | Crawl policy: allow `/`, disallow `/dashboard/` + `/api/`; points at `sitemap.xml` |
| `src/app/manifest.ts` | PWA manifest (name, icons 192/512, theme `#06b6d4`, `BG_NEAR_BLACK`) |
| `src/app/homeJsonLd.ts` | Organization + SoftwareApplication + FAQ JSON-LD for the homepage |
| `src/app/templates/[id]/template-detail/TemplateJsonLd.tsx` | Per-template `SoftwareSourceCode` JSON-LD via `safeJsonLd` |

## Data & state
- **Source:** static content modules — `@/data/blog`, `@/data/guide/{categories,topics}`, `@/data/connectors`, `@/lib/templates` (read at build time by sitemap + dynamic OG routes). **Stores:** none (all static/server). **API routes:** none here, but `robots.ts`/`sitemap.ts`/`manifest.ts` are themselves generated metadata routes (`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`). **Types:** `MetadataRoute.{Manifest,Robots,Sitemap}`, `Metadata`/`Viewport` (Next), `OgFrameProps`/`OgCardProps` (local).

## Integration points
- **`seo.ts` constants** flow into `layout.tsx` metadata, `sitemap.ts`, `robots.ts`, `manifest.ts`, `homeJsonLd` consumers, and `TemplateJsonLd` — change `SITE_URL` once and canonical/OG/sitemap/schema all agree.
- **`safeJsonLd()`** is the required wrapper for every `<script type="application/ld+json">` (homepage in `page.tsx`, `TemplateJsonLd`).
- **`OG_SIZE`/`OG_CONTENT_TYPE`** are re-exported through both `og.tsx` and `og-frame.tsx`; each `opengraph-image.tsx` re-exports `size`/`contentType`/`alt` so Next emits the right `<meta>` tags.
- **`BG_NEAR_BLACK`** shared between `manifest.ts` and `global-error.tsx` to prevent splash/error-screen drift.

## Conventions & gotchas
- **OG-image coverage is partial.** Routes WITH an image: home, `/features`, `/how`, `/roadmap`, `/connections`, `/templates` (index), `/blog/[slug]`, `/guide/[category]`, `/guide/[category]/[topic]`. Routes WITHOUT one fall back to the root `opengraph-image`: **`/templates/[id]`** (its `generateMetadata` at `src/app/templates/[id]/page.tsx:34` sets `openGraph`/`twitter` text but no image — every template detail unfurls with the generic site card), plus `/security`, `/legal`, `/playground`, `/blog` index, `/guide` index, `/connections` is covered but `/dashboard/*` and the marketing scratch routes are not.
- **No `twitter-image.tsx` anywhere.** Twitter cards reuse the OG image by inheritance; there's no Twitter-specific asset, so any route missing an OG image also has no Twitter image.
- **robots.txt gap.** `robots.ts` only disallows `/dashboard/` and `/api/`. Scratch/dev routes are left crawlable: **`/todo`** (a near-duplicate of `/features` — a `feature-sections` clone with no `metadata`, a thin-content/duplicate-content SEO liability), **`/demo`** (public demo redirect into the dashboard), and **`/preview/*`**, **`/m/*`** (mobile dashboard) — none carry a per-page `robots: { index: false }`, and none are in the sitemap, so they're indexable-but-orphaned. Consider disallowing `/todo`, `/demo`, `/preview/`, `/m/` (or adding per-page noindex).
- **JSON-LD drift (homepage).** `homeJsonLd.ts` `faqJsonLd` still advertises dead **"Starter, Pro, Team"** cloud tiers (`src/app/homeJsonLd.ts:62`, `:86`). The live pricing copy was changed to **"No tiers, no per-seat pricing"** with only Free/Cloud/Enterprise surfaced (`src/i18n/en.ts:1036`, `:1121`), and the in-app FAQ text was updated (`en.ts:1325`) — but the hardcoded JSON-LD English was NOT kept in sync. It's also duplicated copy that bypasses i18n entirely, so search engines see stale plan names.
- **`softwareJsonLd` provider drift.** `featureList` says "Multi-provider AI: Claude and Ollama" (`homeJsonLd.ts:26`) while the security/features copy lists "Claude, OpenAI, Gemini, or Ollama" (`en.ts:2061`) and `layout.tsx` keywords include "OpenAI agents" — the structured data undersells the provider list.
- **`SITE_URL` env split.** Defaults to `https://personas.ai` but JSON-LD in `homeJsonLd.ts` hardcodes `https://personas.ai` directly (org `url`/`logo`), so a non-prod `NEXT_PUBLIC_SITE_URL` makes canonical/sitemap diverge from the Organization schema. Route through `SITE_URL` if multi-env correctness matters.
- **OG long-text handling differs per template:** `ogCard` truncates subtitle at 120 chars and shrinks the title font above 40 chars (`og.tsx:88`,`:110`); `OgFrame` does neither — long subtitles can overflow the hero card.
- **`revalidate` is inconsistent.** `OgFrame` routes set `revalidate=86400`; the `ogCard` routes (blog/templates/guide) omit it, so they're static-at-build only and won't pick up content edits without a redeploy. Sitemap revalidates daily; manifest/robots are `revalidate=false`.
- Adding a new section route: copy an existing `opengraph-image.tsx`, add the URL to `sitemap.ts`, and confirm `robots.ts` doesn't need a new disallow.

## Related docs
- [Blog](../content/blog.md)
- [Templates Gallery & Detail](../connectors/templates-gallery.md)
- [Feature index](../INDEX.md)
