# Bug Hunter — Blog

> Total: 7 findings (Critical: 0, High: 2, Medium: 3, Low: 2)
> Scope: 4 in-scope files + 6 supporting (BlogArticle, BlogPostCard, FeaturedPost, opengraph-image, layout, sitemap, format-date)
> Date: 2026-05-10

---

## 1. Blog index renders posts in array order, not by publish date

- **Severity**: High
- **Category**: Silent failure / content ordering
- **File**: `src/app/blog/page.tsx:25-30`, `src/data/blog.ts:24-577`
- **Scenario**: A new post is added to the end of `BLOG_POSTS` with `date: "2026-05-09"`. On `/blog` the post appears at the bottom of the grid because `filtered` simply preserves the array's declared order. Visitors see `2026-03-15` as the first card and the freshest content buried below older posts. Four existing posts already share `date: "2026-04-11"`, so even within the current dataset their visible order is determined by file position, not chronology.
- **Root cause**: Neither the `useMemo` in `BlogPage` nor `BLOG_POSTS` itself sorts by `date`. `generateStaticParams`, the sitemap, and the index all consume the raw array. No comparator anywhere.
- **Impact**: Newest content is invisible until an editor manually re-orders the array. Featured-post selection (`.find(p => p.featured)`) accidentally hides the freshest article because the featured flag is on the oldest entry (`introducing-personas`, `2026-03-15`). SEO impact: Google ranks blog freshness signals partly by linkage from the index page; the newest post gets the weakest internal-link prominence.
- **Fix sketch**: Sort once at module scope: `export const BLOG_POSTS = [...rawPosts].sort((a, b) => b.date.localeCompare(a.date));` (string compare is safe because validation already enforces `YYYY-MM-DD`). Keep `featured` as a separate visual concept, but render the rest of the grid in date-descending order.

---

## 2. Future-dated posts publish immediately — no scheduled-publish gate

- **Severity**: High
- **Category**: Latent failure / content governance
- **File**: `src/data/blog.ts:587-627`, `src/app/blog/[slug]/page.tsx:11-13`, `src/app/blog/page.tsx:25`
- **Scenario**: An editor lands a PR on May 1 with a post dated `2026-06-01` (e.g. a coordinated launch announcement). The build-time validator only checks the date is a real calendar day; it never compares against "now." On the next deploy the post is publicly indexed, included in `generateStaticParams`, listed on `/blog`, and emitted in the sitemap — embargoed content goes live a month early.
- **Root cause**: `BLOG_POSTS` filtering nowhere applies `post.date <= today`. The build-time guard in `data/blog.ts` validates shape but not policy. There is also no `draft: true` flag.
- **Impact**: Pre-announced products, coordinated PR, and anything with an embargo can leak as soon as a PR merges. Once Google indexes the URL the leak is durable even if the file is reverted.
- **Fix sketch**: At module scope filter `BLOG_POSTS` derivative arrays: `const todayUTC = new Date().toISOString().slice(0,10); export const PUBLISHED_POSTS = BLOG_POSTS.filter(p => p.date <= todayUTC);` Use `PUBLISHED_POSTS` in `page.tsx`, `[slug]/page.tsx` (both `generateStaticParams` and the lookup), `opengraph-image.tsx`, and `sitemap.ts`. Note this requires `revalidate` on the index/slug routes so newly-eligible posts appear without a redeploy — or accept "publishes on next deploy after `date`."

---

## 3. Single-featured-post case renders an empty grid container

- **Severity**: Medium
- **Category**: Edge case / cosmetic silent failure
- **File**: `src/app/blog/page.tsx:103-127`
- **Scenario**: After an audit deletes all but the featured post (or in a fresh dataset with one featured post), `filtered.length === 1`. The ternary at line 103 takes the *else* branch (renders the grid), then `filtered.filter((p) => !showFeatured || p.slug !== featured.slug)` removes the only entry. Result: a `motion.div` with `grid` classes is mounted with zero children, plus the FeaturedPost above it. There is no "no other posts" affordance.
- **Root cause**: The empty-state check happens against `filtered.length` *before* the featured filter is applied, so it cannot distinguish "0 results" from "1 result, all eaten by featured."
- **Impact**: Users see only the featured card and an unexplained gap below it (margins/animations on the empty grid still apply via `staggerContainer`). On narrow viewports the gap is large enough to look like a layout bug. Also fires `whileInView` on an empty container.
- **Fix sketch**: Compute `gridPosts = filtered.filter((p) => !showFeatured || p.slug !== featured!.slug)` first, then branch: `if (gridPosts.length === 0 && !showFeatured) showEmptyState; else if (gridPosts.length > 0) showGrid; else null` — or simply hide the grid container when `gridPosts.length === 0`.

---

## 4. Multiple `featured: true` posts silently demote all but the first

- **Severity**: Medium
- **Category**: Silent failure / data integrity
- **File**: `src/app/blog/page.tsx:42`, `src/data/blog.ts:5-15` (interface), build validator at `586-627`
- **Scenario**: An editor adds a new launch post with `featured: true`, intending to make it the new hero, but forgets to unset `featured` on the older post. `BLOG_POSTS.find((p) => p.featured)` returns the first match in array order — the *old* one. The new post collapses into a regular card in the grid with no visual distinction; the editor thinks the deploy is broken.
- **Root cause**: No invariant enforced at build time that "at most one post is featured." `BlogPost.featured?: boolean` permits any subset of the list to be flagged. The runtime selection is silently order-dependent.
- **Impact**: The wrong article occupies the highest-prominence slot on the marketing site. Combined with finding #1 (array order, not date), this is a recurring foot-gun whenever multiple PRs touch the data file.
- **Fix sketch**: Extend the build-time validator in `data/blog.ts`: `const featuredCount = BLOG_POSTS.filter(p => p.featured).length; if (featuredCount > 1) throw new Error("Only one post may be featured");` Optionally: derive `featured` automatically as the newest post (after sorting per finding #1) and remove the boolean from the interface entirely.

---

## 5. JSON-LD treats author and publisher as the same Organization

- **Severity**: Medium
- **Category**: SEO / structured data quality
- **File**: `src/app/blog/[slug]/page.tsx:41-51`
- **Scenario**: Google Rich Results Test on `/blog/<slug>` flags the Article as having identical `author` and `publisher` (both `{"@type": "Organization", "name": "Personas"|"Personas Team"}`). For news/article rich results Google's documentation recommends `author` be a `Person` (or distinguishable Organization) and `publisher` be the site organization. With both fields set to the same publisher entity Google may suppress the article-rich-result enhancement.
- **Root cause**: `post.author` is a free-form string ("Personas Team") used as `Organization.name`. There is also no `image` / `dateModified` on the JSON-LD payload, both of which Google treats as recommended. `mainEntityOfPage` is a string URL rather than the recommended object form.
- **Impact**: Reduced eligibility for article rich snippets, lost visibility in Discover/News surfaces, no "byline" enrichment. Silent — there is no runtime error, only a missed SEO opportunity.
- **Fix sketch**: Promote author to `{ "@type": "Person", "name": post.author }` (or `Organization` with a different `name`/`url` from publisher). Add `image: [\`${SITE_URL}/blog/${slug}/opengraph-image\`]`, `dateModified: post.dateModified ?? post.date`, and convert `mainEntityOfPage` to `{ "@type": "WebPage", "@id": \`${SITE_URL}/blog/${slug}\` }`.

---

## 6. Cross-link block on every article points to the same three static URLs

- **Severity**: Low
- **Category**: Silent failure / UX & internal-linking
- **File**: `src/app/blog/[slug]/BlogArticle.tsx:190-218`
- **Scenario**: Reader finishes the engineering deep-dive `self-healing-execution-engine`. The "Continue exploring" panel offers `/#get-started`, `/templates`, `/compare`. These are not related — they are the same three links every article gets. The natural next-step ("read the credential-vault-security or local-first-AI post") is missing.
- **Root cause**: Hardcoded links rather than computed related-posts (e.g. by shared category or author). No `relatedSlugs` field on `BlogPost`, no fallback to `BLOG_POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3)`.
- **Impact**: Reduced session depth, weaker internal-link graph for SEO, every article funnels visitors out of the blog into product pages instead of keeping engagement on content.
- **Fix sketch**: Replace the static block with related-posts derivation: `const related = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 3); if (related.length < 3) related.push(...other recent posts);` Render BlogPostCard-mini for each. Keep one product CTA below.

---

## 7. `generateMetadata` returns `{}` for unknown slugs — title falls back to layout default

- **Severity**: Low
- **Category**: Edge case / SEO
- **File**: `src/app/blog/[slug]/page.tsx:15-32`
- **Scenario**: A user (or a bot crawling a stale link) hits `/blog/<deleted-slug>`. `generateMetadata` returns `{}`; the page itself calls `notFound()` and renders `[slug]/not-found.tsx`. The browser tab and OG card, however, inherit the parent layout's title (`"Blog"`) and OG URL, so social unfurls of broken article links appear under the "Blog" identity rather than as 404. Combined with the (correct) 404 OG image, the tab title says "Blog" while the image says "Not found."
- **Root cause**: Empty metadata object means Next.js inherits whatever the parent layout/template defined — there is no explicit `title: "Not found"` or `robots: { index: false, follow: false }` for the missing-post case.
- **Impact**: Mild SEO leakage (Google may attempt to index the 404 path), inconsistent unfurl text vs image, no clear "not found" signal in the browser tab. Also mildly accessibility-relevant: screen-reader announcement of the page is the layout title, not the actual state.
- **Fix sketch**:
  ```ts
  if (!post) return {
    title: "Not found",
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/blog` },
  };
  ```
  Mirrors the OG image's 404 status and prevents indexing of arbitrary slugs.

---
