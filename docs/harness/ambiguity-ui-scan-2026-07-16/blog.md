# Blog — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Staged (future-dated) post can cache a permanent 404 — article page has no revalidate
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: staged-post-404-caching
- **File**: `src/app/blog/[slug]/page.tsx:11`
- **Scenario**: An author merges a post with a future `date` (the documented staging workflow per `blog.ts:28-30`). Anyone hits `/blog/<staged-slug>` before the date — e.g. from a shared draft link or the RSS/social preview. `generateStaticParams` excluded the slug, so Next renders it on demand, `isPublished()` is false, and `notFound()` runs. That on-demand result is cached by the full route cache; the segment exports no `revalidate`, so the 404 persists even after the post's date passes.
- **Root cause**: The feed route deliberately sets `revalidate = 3600` with a comment saying it "mirrors the future-date filter on /blog", but the article route — the one place a staged post must flip from 404 to live — has no revalidation window. The comment in `generateStaticParams` ("render on demand and 404 until their date passes") records the intent but the caching behavior that defeats it was never covered.
- **Impact**: The published feed and index start linking to an article URL that keeps serving 404 until the next deploy. The staging feature silently breaks its own promise exactly when it's used.
- **Fix sketch**: Add `export const revalidate = 3600;` to `src/app/blog/[slug]/page.tsx` (matching the feed route), so a cached pre-date 404 expires within an hour of the publish date. Optionally note the pairing in the `isPublished` doc comment so the two revalidate values stay in sync.

## 2. Hardcoded English strings on otherwise fully translated pages
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: i18n-bypass-hardcoded-strings
- **File**: `src/app/blog/page.tsx:129`
- **Scenario**: A visitor using a non-English locale opens `/blog`. Headings, search placeholder, counts, filter chips, and empty state all render translated via `t.blogPage.*` — but the conversion band reads "Build agents locally, free forever. No signup, no credit card." / "RSS" / "Download free" in English. Same on the 404 page: "Popular posts" (`[slug]/not-found.tsx:58`) is hardcoded while every sibling string uses `t.blogPage.*`.
- **Root cause**: The conversion band and 404 suggestions were added after the i18n pass and their copy was inlined instead of added to the `blogPage` translation namespace that the same files already import and use everywhere else.
- **Impact**: Mixed-language UI on the two highest-intent surfaces of the blog (the download CTA and the recovery path), undermining the localization the rest of the page paid for. The conversion copy — the text most worth localizing — is the part that never localizes.
- **Fix sketch**: Add `blogPage.conversionPitch`, `blogPage.rss`, `blogPage.downloadFree`, and `blogPage.popularPosts` keys to the translation catalog and replace the literals in `page.tsx:129-140` and `not-found.tsx:58`.

## 3. Publish-cutoff rule implemented three times with two different semantics
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicated-publish-rule
- **File**: `src/data/blog.ts:31`
- **Scenario**: `isPublished()` (used by `[slug]/page.tsx` and `not-found.tsx`) compares against `Date.now()`, while `blog/page.tsx:31-38` and `feed.xml/route.ts:16-22` each re-implement the filter inline against a *UTC-midnight-of-today* cutoff. Today the three agree only by accident: date-only strings parse to UTC midnight, so `t <= Date.now()` and `t <= todayUtcMidnight` select the same set. The moment anyone adds a timestamp to `date` (e.g. `"2026-07-16T15:00"`, which the index's own comment about "freshness clock" invites), the index/feed hide a post that the direct URL serves — or vice versa.
- **Root cause**: `isPublished` was extracted as the canonical rule (its doc comment claims it governs "the index, static params, direct URLs, and 404 suggestions") but the index and feed never adopted it; each carries its own copy with a subtly different cutoff and a comment asserting they're "the same rule".
- **Impact**: Three copies of a policy that must match exactly, with documentation that already misstates reality. Any future tweak (timezone handling, embargo time support) has to be found and applied in three files or the surfaces silently disagree.
- **Fix sketch**: Make `blog/page.tsx` and `feed.xml/route.ts` call `isPublished` (or export a single `publishedPosts()` helper from `blog.ts` that filters + sorts date-desc, since both call sites also duplicate the sort), and decide/record once whether the cutoff is "now" or "UTC midnight today".

## 4. Two competing category-theming systems: brand tokens on the index, raw hex + magic alpha suffixes on the article
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: dual-theming-paths
- **File**: `src/app/blog/[slug]/BlogArticle.tsx:52`
- **Scenario**: The index (`BlogPostCard`, `FeaturedPost`, `CategoryFilter`) resolves category color through `categoryOf()` → `hexToBrand()` → `BRAND_VAR`/`tint()`, i.e. theme-adaptive CSS variables. The article page bypasses all of it: `page.tsx:61` passes the raw hex from `BLOG_CATEGORIES` (with a magic `"#06b6d4"` fallback) and `BlogArticle.tsx:52` / `BlogArticleByline.tsx:19` build backgrounds by string-concatenating alpha suffixes (`` `${categoryColor}15` ``, `` `${categoryColor}1f` ``).
- **Root cause**: The article components predate (or ignored) the `category-meta.ts` abstraction that was explicitly created "so card renderers don't have to walk the BLOG_CATEGORIES array". The hex-concat trick also silently assumes 6-digit hex — a named color or 8-digit hex in `BLOG_CATEGORIES` would produce an invalid CSS color with no warning.
- **Impact**: The same category renders in token-derived color on the index and raw hex on the article, so any brand-palette or theme change updates one surface and not the other; the `15`/`1f` alpha values are undocumented magic numbers duplicated across two files.
- **Fix sketch**: Have `[slug]/page.tsx` use `categoryOf(post.category)` and pass the `brand` key; render the article pill/byline with `BRAND_VAR`/`tint()` like the cards do, deleting the `categoryColor` prop and both hex-alpha concatenations.

## 5. Hand-rolled markdown renderer is happy-path only — unsupported syntax degrades silently
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: markdown-subset-unenforced
- **File**: `src/app/blog/[slug]/blog-article/BlogArticleContent.tsx:83`
- **Scenario**: The renderer supports exactly: `##`/`###`, `- ` lists, lists starting with `1. `, full-line `*italic*`, and inline `**bold**`/`` `code` ``. Everything else falls through as plain text. Concretely: the italic branch (line 83-88) renders `line.slice(1, -1)` *without* `renderInline`, so bold/code inside a quoted scenario line prints literal asterisks/backticks (e.g. `blog.ts:140` "*Monitor the #support channel…*" would show raw `**` if an author bolds a word inside it); a markdown link `[text](url)` renders as literal brackets; an ordered list whose first visible line starts at `2.` (or uses `1)` style) becomes plain paragraphs; a line that is bold-only (`**Trigger**: Webhook…` works, but `**Trigger:**` at line start is also matched by the italic check order only because of the `!line.startsWith("**")` guard — an easy regression point).
- **Root cause**: The supported markdown subset exists only implicitly in this parser's branches; nothing documents it for post authors (`blog.ts` posts are written free-hand) and nothing validates content against it, so authoring outside the subset ships silently-broken formatting.
- **Impact**: Content bugs surface only visually in production articles — no build error, no warning — and the current corpus already walks the edge (inline `**bold**` inside `- ` items works, inside `*…*` scenario lines it doesn't).
- **Fix sketch**: (a) run `renderInline` on the italic-paragraph branch; (b) extend the ordered-list trigger to `/^\d+\. /` for the first line; (c) add the supported-syntax contract to the `BlogPost.content` doc comment in `blog.ts`, and extend the existing build-time validation block there to flag unsupported constructs (e.g. `](` link syntax) so authors fail the build instead of shipping raw markdown.
