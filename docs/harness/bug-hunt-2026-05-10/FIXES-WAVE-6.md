# Bug Hunter Fix Wave 6 — Data Integrity / SEO / Ordering

> 4 commits, 4 findings closed (4 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.

This wave bundled findings around **"data assumptions that fail at
edges — array order treated as a publish manifest, hardcoded copies
that drift, abort-flag gates that fire on the wrong path, missing
SEO metadata on per-id detail routes."** Each fix is small but the
cumulative effect on what users / search engines / authors see is
substantial.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `9383d5d` fix(blog): sort posts by date desc, hide future-dated entries | blog #1, #2 | H+H | `app/blog/page.tsx` |
| 2 | `bf1b135` fix(homepage): read homepage Changelog from data/changelog.ts | changelog #1 | H | `components/sections/Changelog.tsx` |
| 3 | `75026b8` fix(roadmap): release stuck loading spinner on fetch timeout | roadmap #1 | H | `components/sections/roadmap/index.tsx` |
| 4 | `9187fbc` fix(templates): add canonical + OG metadata to template detail pages | templates #1 | H | `app/templates/[id]/page.tsx` |

## What was fixed

### 1. Blog: post ordering + future-dated filter (commit 1)

Posts rendered in the order they appeared in `BLOG_POSTS`. Editorial
state in the source file isn't a publish manifest — moving a post in
the array reordered the public listing, and the freshest article got
buried below older entries when authors prepended new ones to the
bottom of the file. Future-dated posts published immediately because
the only filter was `activeCategory + search`; authors who staged a
post with `date: "2026-06-01"` had it go live the moment the merge
landed.

Build a `visiblePosts` array up front: filter to entries with
`date <= today (UTC midnight)`, then sort descending. The UTC cutoff
keeps "today's post" reliably visible regardless of the visitor's
timezone. The category counts and featured-post lookup now read from
`visiblePosts` so a future-dated featured post can't silently become
the hero.

### 2. Changelog drift (commit 2)

`components/sections/Changelog.tsx` (the homepage "Recent updates"
strip) shipped a hardcoded 3-release array that drifted from the
canonical `RELEASES` export in `data/changelog.ts`. Every release
that landed on `/changelog` had to be hand-mirrored into this
component or the marketing site would advertise a stale "latest
version" for weeks. The two sources had already diverged at the time
of the bug hunt.

Import `RELEASES`, sort by date desc, slice the first 3. The
homepage strip now follows the same source of truth as `/changelog`,
and new-release ergonomics shrink to "edit one file."

### 3. Roadmap stuck loader (commit 3)

The 8s fetch timeout calls `controller.abort()` to cancel the
in-flight Supabase request, but the `.finally setLoading(false)` was
gated behind `!controller.signal.aborted` — and a timed-out request
hits both conditions (the controller is aborted by the timeout, and
the component is still mounted), so `setLoading(false)` never ran.
Visible symptom: a spinner spinning indefinitely above the
`FALLBACK_ITEMS` content whenever Supabase took longer than 8s.

Track unmount with a separate `unmounted` flag and use that to
suppress `setState` on the genuine teardown path. The
`!controller.signal.aborted` check is replaced with `!unmounted` so
the timeout abort no longer suppresses the loader release.

### 4. Templates SEO (commit 4)

`generateMetadata` returned only title + description, so
per-template pages had no canonical URL, no OG image, no Twitter
card, no robots control on the not-found path. Social unfurls fell
through to the parent layout's defaults, search engines indexed
every template under the site's generic OG, and a missing template
silently returned the same metadata as a real one (with
`notFound()` short-circuiting the body but the metadata still
leaking "Template — Personas" titles for nonexistent IDs).

Add a `Metadata` return type, canonical URL via `SITE_URL`,
`openGraph` (article type, `siteName`, url, title, description), and
`twitter` (summary_large_image with title + description). The
not-found branch now sets `robots: noindex,nofollow` so the indexer
won't surface dead URLs. The canonical also matches the JSON-LD URL
hardcoded in `TemplateDetail.tsx`, so both signals agree.

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Wave-6 commits | 21 (cumulative from waves 1-5) | 25 |
| Critical findings closed (cumulative) | 9 / 9 | 9 / 9 |
| High findings closed (cumulative) | 17 / 75 | 21 / 75 |

## Cumulative status (after wave 6)

- 30 of 178 findings closed (16.9%).
- 9 of 9 criticals closed.
- 21 of 75 highs closed.

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | 7 |
| 3 | C. SSE + streaming reliability | 4 |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | 3 |
| 5 | E. SSR / hydration / theme + i18n flash | 4 |
| 6 | F. Data integrity / SEO / ordering | 4 |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | — |

## Patterns established (catalogue items 18–20)

18. **Editorial array order is not a publish manifest.** When a list
    of records (blog posts, releases, roadmap items) is read straight
    from a TS file's array order, every reorder, prepend, or staged
    insert silently changes what users see. Sort explicitly by the
    semantically-meaningful field (date, version, priority) at the
    consumer site, and filter out staged-future entries based on the
    visitor's clock. The source file becomes editorial scratch space;
    the UI is the authoritative ordering.
19. **Hardcoded copies of canonical data drift, always.** Any time
    you find a "Recent N" / "Top N" / "Featured" list near a page that
    presents the full source of the same data, check whether the two
    sources are wired or copied. Copies decay silently — the failure
    mode is "the marketing site advertises stale information," not a
    test failure. Wire the snippet to the canonical source and slice;
    new-release ergonomics improve and silent drift becomes
    impossible.
20. **`signal.aborted` is true on every abort path, not just unmount.**
    Code that uses `if (!controller.signal.aborted)` as a "still
    mounted" gate breaks the moment a timeout, race-cancellation, or
    deliberate user-driven abort fires `controller.abort()` for
    reasons unrelated to mount. Track unmount with a separate flag
    and reserve the AbortSignal for "should I do this work" decisions
    only.

## What remains

- **Theme G (A11y / focus / scroll-lock / modal lifecycle)** — focus
  yank on route navigation, scroll-lock leaks across HMR/concurrent
  overlays, error boundary retry-loop cap, skip-link missing on
  dashboard, mobile menu focus management. ~5-6 fixes; substantial
  accessibility wins.
- **Theme D follow-ups** — `use-pipeline-simulation`,
  `use-chat-sequence`, `useAutoCycle`-driven hooks; same shape as the
  visibility-pause fix in wave 4 but deferred for the
  `useVisibilityPause` shared primitive instead of one-by-one.
- The long tail of medium/low findings across all 25 contexts.

## Deliberately deferred (out of scope this wave)

- Pricing/comparison-table CSS bugs (pricing-feature-comparison
  findings #1, #6, #7). Visible UX issues but they cluster around CSS
  pseudo-element rendering rather than data integrity; better suited
  to a UI-polish session.
- User-guide nested fence / search staleness fixes
  (user-guide #1, #2). The fence parser bug is a content-format
  problem; the search staleness is a useEffect debounce cleanup.
  Both are real but didn't share the data-edges mental model.
- Build-time guards against multiple `featured: true` blog entries
  (blog #4). A small Zod-style validation hook in `data/blog.ts`
  could enforce; deferred to a CI/build-rule pass.

Recommended next wave: **Theme G (A11y / focus / scroll-lock / modal
lifecycle)** — the only remaining theme with structural impact, and
focus / scroll-lock fixes compound when applied as a set.
