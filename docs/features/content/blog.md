# Blog
> Public blog: index with a featured post + live category/search filter, slug-based article pages with byline and cross-links, and an RSS feed — all from a single static data file. · **Route:** `/blog`, `/blog/[slug]`, `/blog/feed.xml` · **Status:** Live (static data)

## What it does

A self-contained content surface backed entirely by an in-repo array (`BLOG_POSTS`). No CMS, no API, no database.

- **`/blog`** — index page. Renders the latest featured post in a large card, a client-side search box (title + description), a category filter (`Announcements / Tutorials / Use Cases / Engineering`) with live per-category counts, a "Showing N of M" live region, and a responsive card grid. An inline conversion band links to the RSS feed and the download CTA.
- **`/blog/[slug]`** — article page. Renders a back-link, category chip, date, reading time, title, description lede, the markdown-ish body, an author byline, and a cross-links block. Statically generated for every post slug; unknown slugs hit a custom 404 with recovery suggestions.
- **`/blog/feed.xml`** — RSS 2.0 feed, regenerated hourly, mirroring the index's visibility/ordering rules.

Both list and feed **hide future-dated posts** and **sort newest-first**, independent of array order in the source file. Every post slug also gets a per-article OpenGraph image at `/blog/[slug]/opengraph-image`.

## How it works

**Data + build-time validation.** All posts live in `BLOG_POSTS` (`src/data/blog.ts:28`). A bare block at module scope (`src/data/blog.ts:607`) runs at bundle time and `throw`s the build on an empty slug, a slug failing `^[a-z0-9]+(?:-[a-z0-9]+)*$`, a duplicate slug, or a date that isn't a real `YYYY-MM-DD` calendar day (regex + `Date` round-trip). This guarantees the routing/SEO invariants the rest of the feature relies on.

**Index filtering (client).** `BlogPage()` (`src/app/blog/page.tsx:19`) is a client component. `visiblePosts` (`page.tsx:31`) drops posts whose `date` is after UTC-midnight-today, then sorts by `date` desc. `filtered` (`page.tsx:46`) further narrows by `activeCategory` and a lowercased substring `search` over title+description. `countsByCategory` (`page.tsx:55`) is computed off `visiblePosts` (so counts always reflect the unfiltered, currently-visible set). The featured card shows only when `activeCategory === "all" && !search` (`page.tsx:66`); the grid then excludes the featured slug to avoid showing it twice (`page.tsx:167`).

**Article routing (server).** `src/app/blog/[slug]/page.tsx` is a server component. `generateStaticParams()` (`page.tsx:11`) emits one param per post → fully static pages. `generateMetadata()` (`page.tsx:15`) builds per-post title/description/canonical + `og:type=article` with `publishedTime`/`authors`. The page looks up the post; a miss calls `notFound()` (`page.tsx:37`), rendering `not-found.tsx`. It injects an `Article` JSON-LD blob via `safeJsonLd` and passes the resolved category label/color to the client `BlogArticle`.

**Article rendering.** `BlogArticle` (`[slug]/BlogArticle.tsx`) lays out the chrome and delegates the body to three pieces under `blog-article/`: `BlogArticleContent` (a tiny line-based markdown renderer), `BlogArticleByline` (author + published date), and `BlogArticleCrossLinks` (per-post `relatedLinks` or generic defaults).

**The "markdown" renderer is bespoke.** `BlogArticleContent` (`blog-article/BlogArticleContent.tsx:26`) splits `content` on `\n` and walks lines: `## `/`### ` → headings, `- ` → `<ul>`, `1. ` (then any `\d+. `) → `<ol>`, a whole line wrapped in single `*` → blockquote, else `<p>`. `renderInline` handles `**bold**` and `` `code` `` only. It is **not** a real markdown parser — see gotchas.

**RSS.** `feed.xml/route.ts` re-implements the same visibility/sort rule (`route.ts:19`), XML-escapes title/description/category (`escapeXml`, `route.ts:8`), and emits RSS 2.0 with `revalidate = 3600` + a matching `Cache-Control`. `pubDate` is `new Date(\`${date}T00:00:00Z\`).toUTCString()`.

## Key files

| File | Role |
| --- | --- |
| `src/data/blog.ts` | `BlogPost`/`BlogCategory` types, `BLOG_CATEGORIES`, `BLOG_POSTS` content array, and the build-time slug/date validator. |
| `src/app/blog/page.tsx` | Index page (client): future-date filter, sort, search, category filter, featured selection, grid. |
| `src/app/blog/layout.tsx` | Index `metadata` (title/OG/canonical) + `Blog` JSON-LD. |
| `src/app/blog/FeaturedPost.tsx` | Large hero card for the `featured` post (only on unfiltered index). |
| `src/app/blog/BlogPostCard.tsx` | Grid card: category chip, date, title, description, reading time. |
| `src/app/blog/CategoryFilter.tsx` | `ThemedChip` row with per-category count badges. |
| `src/app/blog/category-meta.ts` | `categoryOf(id)` → `{ label, brand }`, mapping hex color to a `BrandKey`. |
| `src/app/blog/feed.xml/route.ts` | RSS 2.0 GET handler; hourly revalidate; same filter/sort as index. |
| `src/app/blog/[slug]/page.tsx` | Article server route: `generateStaticParams`, `generateMetadata`, `Article` JSON-LD, `notFound()`. |
| `src/app/blog/[slug]/not-found.tsx` | Custom 404 with "Popular posts" recovery (featured + 2 newest). |
| `src/app/blog/[slug]/opengraph-image.tsx` | Per-post OG card; 404s (not a fallback card) on unknown slugs. |
| `src/app/blog/[slug]/BlogArticle.tsx` | Article layout shell; composes the three `blog-article/*` pieces. |
| `src/app/blog/[slug]/blog-article/BlogArticleContent.tsx` | Line-based mini-markdown renderer (headings, lists, blockquote, bold/code). |
| `src/app/blog/[slug]/blog-article/BlogArticleByline.tsx` | Author avatar + "Published {date}". |
| `src/app/blog/[slug]/blog-article/BlogArticleCrossLinks.tsx` | Per-post `relatedLinks` or generic `/#get-started` + `/templates` defaults. |

## Data & state
- **Source:** `src/data/blog.ts` — `BLOG_POSTS: BlogPost[]` (slug, title, description, category, author, date `YYYY-MM-DD`, readingTime, content, `featured?`, `relatedLinks?`) and `BLOG_CATEGORIES` (id, label, hex color). **Stores:** none (no Zustand) — index filter state is local `useState` in `page.tsx`. **API routes:** `/blog/feed.xml` (RSS GET handler, `revalidate = 3600`). **Types:** `BlogPost`, `BlogCategory` (`src/data/blog.ts:3`); `CategoryMeta` (`category-meta.ts:4`); `Translations.blogPage` (`src/i18n/en.ts:892`).
- **Date handling:** all display dates go through `formatDateShort` / `formatDateLong` (`src/lib/format-date.ts`), which parse `iso + "T00:00:00Z"` and format in `timeZone: "UTC"` to avoid SSR/client hydration drift.
- **JSON-LD / OG:** index `Blog` schema in `layout.tsx`; per-article `Article` schema in `[slug]/page.tsx`; both stringified through `safeJsonLd` (`src/lib/seo.ts:48`, escapes `</script>` and `<!--`). `SITE_URL`/`SITE_NAME` from `src/lib/seo.ts`.

## Integration points
- **i18n:** all index/article chrome copy is `t.blogPage.*` (`src/i18n/en.ts:892` interface, `:2070` en values), e.g. `eyebrow`, `searchPlaceholder`, `minRead`, `readArticle`, `continueExploring`, `postNotFound`. Must stay in lockstep across all 14 locales.
- **Brand theming:** `categoryOf` → `hexToBrand` → `BRAND_VAR`/`tint` (`src/lib/brand-theme.ts`) color the cards/chips; categories use raw hex in data, converted to brand keys for theme-adaptive rendering.
- **Shared chrome:** `Navbar`, `Footer`, `PageShell`, `SectionWrapper`, `SectionIntro`, `PrimaryCTA`, `ThemedChip`; animation primitives `fadeUp`/`staggerContainer` (`src/lib/animations.ts`).
- **OG:** `ogCard`/`OG_SIZE` from `src/lib/og.ts` build the per-post preview image.
- **Cross-links target other features:** `relatedLinks` and the generic defaults point at `/guide/*`, `/templates`, `/#download`, `/#get-started` — links are not validated, so a renamed route silently dead-ends.

## Conventions & gotchas
- **Array order is not publish order.** The source array is "informal editorial state"; both the index (`page.tsx:41`) and feed (`route.ts:22`) re-sort by `date` desc at runtime. Don't rely on position in `BLOG_POSTS` for ordering. Ties on identical dates fall back to `Array.sort` order, which is engine-dependent — six posts share `2026-04-11`, so their relative order is effectively arbitrary/unstable.
- **Future-dated posts are hidden, in two places.** Posts with `date` after UTC-midnight-today are filtered out of both the index and the RSS feed; they "publish" automatically once the date passes. The cutoff is **only** recomputed on a fresh render/request — the index `useMemo` has an empty dep array (`page.tsx:44`) so a long-lived tab won't reveal a post that crosses midnight until reload; the feed relies on `revalidate = 3600`. The 404 page's `SUGGESTED_POSTS` and `generateStaticParams` do **not** apply this filter, so a future-dated post still has a buildable, directly-reachable URL and can appear as a "Popular post" suggestion.
- **Slug uniqueness/shape is enforced at build, not edit.** Duplicate, empty, or malformed slugs `throw` during bundling (`src/data/blog.ts:607`), aligning the three slug consumers (`generateStaticParams`, page lookup, OG route). Good — but it's a hard build failure, so a bad paste breaks CI rather than warning.
- **Featured selection is "first featured wins."** `visiblePosts.find(p => p.featured)` returns the first by sort order (newest featured). Marking multiple posts `featured` silently shows only one; the rest just appear as normal cards.
- **The body renderer is a fragile mini-parser, not markdown.** `BlogArticleContent` only understands `##`/`###`, `- `, `1. `, line-level `*italic*`, `**bold**`, and `` `code` ``. No links, images, nested lists, tables, code fences, or blank-line-delimited paragraphs (a hard-wrapped paragraph renders as multiple `<p>`s). Ordered lists must literally start at `1. `. Anything unrecognized renders as a plain paragraph. There is no HTML sanitization because `content` is trusted in-repo data — do not wire this to user input.
- **Hardcoded English on the index.** The conversion band copy "Build agents locally, free forever. No signup, no credit card." and the "RSS" / "Download free" labels (`page.tsx:130`, `:138`, `:140`) are literal JSX strings, **not** `t.blogPage.*`. Same on the 404: "Popular posts" (`not-found.tsx:57`). The OG card footer "min read" and the feed's `<description>`/`<title>` suffix "Blog" are English-only by design (single-locale surfaces). Flag the index/404 strings if full i18n coverage is required.
- **SEO/JSON-LD drift risk.** Author renders as `Article.author` of `@type: Organization` (`[slug]/page.tsx:46`) even though `post.author` is a person-style string ("Personas Team") — fine here, but mismatched if real bylines are added. The index `Blog` JSON-LD and the article OG description duplicate strings that also live in `layout.tsx` metadata and `en.ts`; there's no shared constant, so they can drift. `datePublished`/`og:publishedTime` use the raw `YYYY-MM-DD` (no time/offset), which is valid but coarse, and there's no `dateModified`.
- **OG safety:** unknown slugs return a 404 image (`opengraph-image.tsx:17`) rather than a generic card, preventing crafted link-unfurls under the domain — keep this behavior aligned with the route's `notFound()`.
- **Semantic tokens + reduced motion:** cards/chips use `text-muted-dark`, `text-foreground`, `border-glass(-hover)`, `text-brand-*`; motion is framer-motion `variants` via `SectionWrapper`/`fadeUp` (no raw `requestAnimationFrame`), so the animation-gating lint rule doesn't apply here.

## Related docs
- [How It Works & Changelog](how-it-works.md)
- [SEO & Social Metadata](../infrastructure/seo-metadata.md)
- [Feature index](../INDEX.md)
