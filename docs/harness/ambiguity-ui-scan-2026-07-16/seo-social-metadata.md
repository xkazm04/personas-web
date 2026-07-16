# SEO & Social Metadata — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Guide OG generators render polished cards for unknown slugs — the exact misleading-unfurl hole the blog OG explicitly closed
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: og-404-inconsistency
- **File**: `src/app/guide/[category]/[topic]/opengraph-image.tsx:14`
- **Scenario**: Anyone shares `personas.ai/guide/anything/whatever` (or an unpublished/hidden topic id) on Slack/Twitter/LinkedIn. The topic OG falls back to a branded "Guide" card (`topic?.title ?? "Guide"`); the category OG (`src/app/guide/[category]/opengraph-image.tsx:14`) even renders a confident "0 topics" badge for a nonexistent category.
- **Root cause**: The blog OG (`src/app/blog/[slug]/opengraph-image.tsx:13-17`) documents the decision in a comment — unknown slugs must 404 "instead of a polished fallback card" because a generic preview lets anyone craft misleading unfurls under the domain — but that recorded reasoning was never propagated to the two guide generators, which silently coalesce every missing lookup with `??`. The topic generator also ignores `isTopicVisible`, which `sitemap.ts:39` treats as the publication gate, so hidden topics still get branded previews.
- **Impact**: Arbitrary URLs under `/guide/**` unfurl as legitimate-looking Personas cards (including a nonsense "0 topics" badge), enabling misleading link previews the codebase already declared unacceptable; behavior also diverges from the page routes' `notFound()`.
- **Fix sketch**: Mirror the blog pattern in both guide OG files: when `category`/`topic` lookup fails (or `!isTopicVisible(topic)`), return the same minimal `ImageResponse` with `{ status: 404 }`. Extract that 404 card into `src/lib/og.tsx` so all three routes share one implementation and the comment lives in one place.

## 2. Sitemap stamps `lastModified: now` on every entry despite real per-post dates existing
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: sitemap-lastmodified-fabricated
- **File**: `src/app/sitemap.ts:13`
- **Scenario**: The sitemap is force-static with `revalidate = 86400`, so every regeneration re-stamps all ~100+ URLs (static pages, every guide topic, every template, every blog post) with the build moment as `lastModified` — the whole site appears to change every day.
- **Root cause**: `const now = new Date()` is applied uniformly (lines 17-59) as a happy-path shortcut, even though `BLOG_POSTS` carries an authored `date` field (`src/data/blog.ts:11`) that is simply never read here. No comment records whether "everything modified daily" was a deliberate freshness ploy or an unfinished TODO.
- **Impact**: Crawlers learn the `lastModified` signal is noise and discount it for the entire domain — Google explicitly ignores lastmod when it's demonstrably inaccurate — hurting recrawl prioritization for the pages that actually did change (new blog posts, roadmap updates). `changeFrequency: "monthly"` on the same rows contradicts a daily-shifting lastmod.
- **Fix sketch**: Use `p.date` for blog rows (`lastModified: new Date(p.date)`); for evergreen static/guide/template rows either omit `lastModified` or pin it to a content-derived constant (e.g. latest post date or a per-dataset `updatedAt`), keeping `now` only where content genuinely churns.

## 3. Two parallel OG design systems (ogCard vs OgFrame) with different layouts, caching, and duplicated constants
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: og-dual-frame-drift
- **File**: `src/lib/og.tsx:3`
- **Scenario**: Sharing the homepage/features/how/roadmap/connections yields a centered, logo-hero composition (`OgFrame`), while blog/guide/templates yield a left-aligned editorial card (`ogCard`) — two visibly different brand frames for one site, often side by side in the same Slack thread.
- **Root cause**: `src/lib/og.tsx` and `src/lib/og-frame.tsx` grew independently: each declares its own `OG_SIZE` (og.tsx:3, og-frame.tsx:3); og.tsx has no `OG_CONTENT_TYPE` so its three consumers hardcode `contentType = "image/png"`; og-frame.tsx converts alpha via `hexToRgba` while og.tsx string-appends hex alpha suffixes (`${accentColor}18`, line 45) — a convention that silently breaks if a caller ever passes a non-6-digit-hex color; footer brand text is "personas.ai" in both but assembled differently.
- **Impact**: Inconsistent social identity across routes, and every future OG tweak (logo, gradient, footer) must be made twice or the halves drift further. The `ogCard` routes also lack the `revalidate = 86400` the `OgFrame` routes all set, so caching behavior differs per aesthetic rather than per need.
- **Fix sketch**: Fold both into one module: shared `OG_SIZE`/`OG_CONTENT_TYPE`, shared background/footer/logo primitives, one alpha helper (`hexToRgba`), and two thin layout variants (hero vs. card) if both compositions are intentional. Add `revalidate` uniformly.

## 4. Maskable manifest icons reuse the `purpose: "any"` PNGs — logo will be cropped by the safe-zone mask
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: manifest-maskable-icons
- **File**: `src/app/manifest.ts:30`
- **Scenario**: A user installs the PWA on Android (or any launcher applying adaptive-icon masking). The launcher crops the icon to a circle/squircle keeping only the central ~80% safe zone.
- **Root cause**: Lines 30-41 declare `icon-192.png`/`icon-512.png` as `purpose: "maskable"` while the identical files serve `purpose: "any"`. A maskable icon needs the mark inset within the 40%-radius safe zone with a full-bleed background; an "any" icon typically uses the full canvas — one file cannot correctly be both, and there is no recorded decision that these PNGs were authored with safe-zone padding.
- **Impact**: Installed-app icon shows edge-clipped artwork (or, if the files actually are padded, the "any" usage renders an undersized mark in tabs/splash) — a visible brand defect on the highest-commitment surface a user reaches.
- **Fix sketch**: Author dedicated `icon-maskable-192/512.png` with the P mark inside the safe zone over the `BG_NEAR_BLACK`/accent background, reference those from the maskable entries, and verify with maskable.app. Keep full-bleed art for `any`.

## 5. Connections OG count formula and the hardcoded "40+ integrations" in SITE_DESCRIPTION can drift apart
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: integration-count-drift
- **File**: `src/app/connections/opengraph-image.tsx:12`
- **Scenario**: The connections OG computes its badge live — `Math.floor(connectors.length / 5) * 5` then renders `` `${count}+ integrations` `` — while `src/lib/seo.ts:9` bakes a literal "40+ integrations" into `SITE_DESCRIPTION`, which feeds site-wide meta descriptions and OG descriptions. Add or remove connectors and the two public claims disagree (e.g. image says "55+", description says "40+").
- **Root cause**: The round-down-to-5 marketing convention lives uncommented in one OG file, and the same fact is duplicated as a string constant elsewhere; neither references the other, and nothing records why 5 is the rounding step.
- **Impact**: Contradictory numbers in the same link unfurl (description text vs. preview image) reads as sloppy or dishonest, and the seo.ts figure silently goes stale as the catalog grows.
- **Fix sketch**: Export a single `integrationCountClaim()` helper (e.g. in `src/lib/seo.ts` or next to `connectors`) implementing the floor-to-5 rule with a one-line comment, and build both the OG tag and `SITE_DESCRIPTION` from it.
