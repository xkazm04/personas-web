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
- **2026-04-11** — Desktop app module mapping lives in `src/data/guide/desktop-modules.ts`. Contains `DESKTOP_MODULES` (hierarchy) and `TOPIC_MODULE_MAP` (102 entries keyed by topic ID). The desktop app has 14 main sidebar modules with 60+ sub-views. Platform-agnostic link handling is in `src/lib/guide-link.ts`.
- **2026-04-12** — Guide markdown renderer at `src/components/guide/GuideMarkdown.tsx` now supports 10 custom block types: `:::tip`, `:::warning`, `:::info`, `:::success` (callouts), `:::steps` (wizard), `:::keys` (shortcut grid), `:::compare` (side-by-side cards), `:::diagram` (flow nodes), `:::feature` (highlight box), `:::checklist` (styled list), `:::code-compare` (before/after panels). All components in `GuideBlocks.tsx`.
- **2026-04-12** — Topic pages auto-generate HowTo JSON-LD when content contains `:::steps` blocks. The `extractSteps()` helper in `[topic]/page.tsx` parses steps and `buildHowToJsonLd()` creates the schema.org structured data.
- **2026-04-12** — Landing page Features.tsx cards now have `guideTopics` deep links (4 cards × 2 links = 8 guide links). VisionGrid had these already (6 capabilities × 2 links = 12 guide links). Total: 20 landing page → guide deep links.

## Conventions enforced
- All section components use `SectionWrapper` with a unique `id` prop
- Glass-morphism card style: `rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm`
- Animation patterns: `staggerContainer`, `fadeUp`, `revealFromBelow` from `@/lib/animations`
- Color theme: cyan (#06b6d4), purple (#a855f7), emerald (#34d399), rose (#f43f5e), amber (#fbbf24)
- Desktop app cross-references in guide use `ModuleBadge` (full) and `ModuleBadge compact` — never raw `<a href>` links for desktop app navigation
- Guide markdown custom blocks: `:::tip`, `:::warning`, `:::info`, `:::success` (callouts), `:::steps` (wizard), `:::keys` (shortcut grid), `:::compare` (side-by-side cards), `:::diagram` (flow nodes), `:::feature` (highlight box), `:::checklist` (styled list), `:::code-compare` (before/after panels), `| pipe | tables |`. All implemented in `GuideBlocks.tsx`, parsed in `GuideMarkdown.tsx`
- Landing page deep links to guide use `BookOpen` icon + `text-xs text-muted-dark hover:text-brand-cyan` style, matching VisionGrid pattern

## Anti-patterns to avoid
- Don't edit `Vision.tsx` directly — it just re-exports `VisionGrid.tsx`
- Don't add SEO keywords to `page.tsx` — they belong in `layout.tsx`
- Don't assume `.next` cache is clean — stale dev types can block builds

## Open follow-ups (from Run #1, 2026-04-10)
- The Pipeline Showcase section uses tab switching but has no mobile-optimized touch gestures (swipe)
- The Platform Capabilities cards have no "Learn more" links to dedicated feature pages (these pages don't exist yet)
- ~~The Pricing comparison table content is still separate from the new Platform Capabilities section~~ DONE (Run #32) — Pricing section now shows tier cards from PRICING_TIERS, links to /pricing
- VisionHoneycomb.tsx exists but isn't used anywhere — intentionally preserved as potential reuse for orchestration page
- ~~No dedicated feature deep-dive pages exist yet (/features/orchestration, /features/security, etc.)~~ DONE (Run #10)
- ~~The legacy `COMPARISON_DATA` in `pricing.ts` (Personas vs n8n only) is still used by the landing page Pricing section.~~ DONE (Run #32) — Removed. Landing page now uses PRICING_TIERS. /compare uses comparison.ts.

## Open follow-ups (from Run #30, 2026-04-11)
- The `TOPIC_MODULE_MAP` in `src/data/guide/desktop-modules.ts` maps all 102 guide topics to desktop app modules. When the desktop app adds new features or renames sidebar items, this file needs updating to stay in sync.
- The `openGuideLink()` utility in `src/lib/guide-link.ts` dispatches `personas:open-external` CustomEvent for desktop context. The desktop app's webview host needs to listen for this event to handle external link opening.
- ModuleBadge popover uses static text ("Open the Personas desktop app and navigate to..."). Future enhancement: detect if the guide is running inside the desktop app and change to a "Go to this section" action button.
- The compact ModuleBadge on category cards shows `moduleRef.label` truncated to 120px. If labels exceed this, consider adding full text on hover.
- Guide content markdown was written during Runs #3-4 (2026-04-10) and broadly matches the desktop app. No content was rewritten this run — the module badge system provides the cross-reference layer instead.

## Open follow-ups (from Run #31/32, 2026-04-12)
- Not all 102 topics use the new visual blocks yet. Priority enrichment targets: monitoring (anomaly-detection), troubleshooting (remaining topics), deployment (environment variables). Each would benefit from `:::checklist` or `:::diagram`.
- `:::compare` blocks with `[recommended]` tag should be reviewed for accuracy — some "recommended" labels were added based on general best practices, not user-specific preferences.
- The `:::diagram` block renders as a horizontal flow. For topics with branching flows (like conditional routing), a vertical or branching layout would be more appropriate. Consider a `:::tree` block type in the future.
- `extractSteps()` in topic page.tsx only parses the first `:::steps` block's structure. Topics with multiple `:::steps` blocks generate HowTo with steps from all blocks concatenated — verify this produces valid schema.org data.
- Category-level pages (`/guide/[category]`) don't have HowTo or enhanced meta yet — only individual topics do. Consider adding ItemList JSON-LD to category pages.

## Resolved phantoms (2026-05-02)
- `src/components/sections/MidPageCTA.tsx` was listed in the Conversion & Onboarding context's `filePaths` but never existed on disk. Removed from the Vibeman context (id `ctx_1776164915188_4gzhnzf`) so future scans don't re-flag. If a real mid-page CTA is wanted, the Wave 1 finding's recommendation was to factor `DownloadCTA.tsx` into a reusable `<DownloadCTA variant="full" | "compact">` rather than create a new component.

## Open follow-ups (from Run #12, 2026-04-10)
- ~~`/compare` page has no structured data~~ DONE (Run #32) — Enhanced JSON-LD with SoftwareApplication types + applicationCategory per competitor
- Competitor data in `comparison.ts` should be periodically verified against live competitor sites for accuracy
- ~~The Pricing section's "See full comparison" link is an `<a>` tag, not `<Link>`~~ DONE (Run #32) — Pricing.tsx rewritten with `<Link>` throughout

## Structural facts (scan-and-decide, 2026-06-07)
- **Custom eslint rules** live in `eslint-rules/` (`eslint.config.mjs`). Only `custom-quality/no-confusable-minus` is **error**-level — use ASCII `-`, never en/em-dash in JSX text. `custom-quality/max-tsx-lines` (max **200**), `custom-animation/require-animation-gating`, `custom-a11y/no-low-text-opacity`, `custom-zustand/no-multi-zustand-selector` are all **warn** (non-blocking).
- `SectionWrapper` is the framer-motion stagger root (`initial="hidden" whileInView="visible" variants={staggerContainer}`). Nested `motion.*` with `variants={fadeUp}` and no own initial/animate inherit and animate — no need to re-declare the orchestration on every grid (see FAQ, SocialProof).
- Reduced-motion idiom is `useReducedMotion()` from `framer-motion`. `FloatingParticles` and `useAutoCycle` self-gate; `useAutoCycle({respectReducedMotion})` **defaults true** — passing `false` is the bug to look for.
- The `WhyAgents` section + `roleCopy` (developer/product-manager/enterprise) in `src/components/sections/why-agents/` were built but **rendered nowhere** until this run. Wired into the homepage via a new `WhyAgentsSection` wrapper driven by `RoleSelector` (the ready-made "I am a ___" toggle, `src/components/RoleSelector.tsx`).
- When a section renders its own `SectionWrapper id="..."` (e.g. `why-agents`, `social-proof`), do **NOT** also set `wrapperId` in the page.tsx `sections` array — page.tsx wraps in `<div id={wrapperId}>`, producing a duplicate id.
- Canonical repo URL is `https://github.com/personas-ai` (`FooterBrand.tsx`); the Hero GitHub CTA now reads `NEXT_PUBLIC_GITHUB_URL` with that fallback.
- Tests = **Playwright e2e only** (`npm run test:e2e`); no unit runner, and e2e needs a running server.

## Anti-patterns to avoid (scan-and-decide, 2026-06-07)
- The Vibeman "Marketing Pages" context `file_paths` are **partially stale** — they list `comparison-table/`, `/compare`, `NavbarSignIn` which exist only under `.claude/worktrees/`, not the live `src` tree. Verify paths before planning.
- `.claude/worktrees/` holds many sibling worktrees each with their own `eslint.config.mjs` + `node_modules`. Scope all globs to top-level `src/`.

## Open follow-ups (from scan-and-decide run, 2026-06-07)
- `HeroClient.tsx` is now **206 lines** (>200 `max-tsx-lines` warn) after the GitHub-CTA + reduced-motion + trust-line edits. Extract the secondary-CTA / trust-line cluster into a subcomponent to clear it.
- New marketing copy added this run (Hero trust line, `#pricing` offer banner, SocialProof headings/subtitle) is **hardcoded English**, not i18n'd across the 14 locales. Add `t.*` keys if these must localize.
- `SocialProof` renders `USAGE_STATS` **statically**; the idea suggested animated counters (`useAnimatedNumber`/`useTweenedNumber`) — deferred (values like `"40+"`/`"0"` need parse logic + reduced-motion gating).
- Playwright e2e **not run** this session (needs a running server). Verify the two new homepage sections (WhyAgents + RoleSelector, SocialProof) render before release.

## Structural facts (scan-and-decide #2 — Documentation & Content, 2026-06-07)
- Guide markdown: `parseBlocks.tsx` turns in-content `#`..`####` into headings via `HeadingAnchor.tsx`. As of this run, content headings are shifted +1 (`#` -> h2) because the topic title is rendered as the page's single `<h1>` in `TopicView.tsx`. `extractHeadings.ts` parses the TOC independently and is unaffected by the render-depth shift.
- `BlogPost` (`src/data/blog.ts`) already has a `readingTime` field — blog cards AND the article page render reading time + date. Guide topics had neither; reading time is now derived from body word count in `TopicView`. Added an optional `relatedLinks` field for per-post cross-links.
- Blog search is **inline** in `blog/page.tsx` (its own `useState`); the guide's `SearchCombobox` (debounced 150ms) is a separate component for guide topics. They don't share code.
- 404s: `src/app/blog/[slug]/not-found.tsx` exists (client component); guide topics have **no** custom not-found and fall back to Next's default.
- RSS feed lives at `/blog/feed.xml` (`src/app/blog/feed.xml/route.ts`, `revalidate = 3600`). `SITE_URL` = `NEXT_PUBLIC_SITE_URL ?? https://personas.ai`, `SITE_NAME` = `Personas` (`src/lib/seo.ts`).
- Homepage `Changelog.tsx` ("Recent updates") reads `RELEASES` from `data/changelog.ts`; the full changelog page is `/changelog`.
- Tailwind `motion-reduce:` variant works for reduced-motion gating without a JS hook (used for the search spinner).

## Anti-patterns to avoid (scan-and-decide #2, 2026-06-07)
- **Glob brace patterns `{a,b}` don't match in this environment** — they silently return nothing. Use separate Glob calls or Grep instead.
- Two large TSX files crossed the 200-line `max-tsx-lines` warn this session after multiple ideas piled onto them: `HeroClient.tsx` (206) and `TopicView.tsx` (241). When several ideas target one file, budget an extraction.

## Open follow-ups (from scan-and-decide #2, 2026-06-07)
- `TopicView.tsx` is **241 lines** (>200 warn) after 5 ideas touched it. Extract the prev/next nav and the try-it CTA into subcomponents.
- Idea #5 (meta type scale) covered `CodeFence`, `CodeCompare`, `SearchResultsPopover`, and `TopicView`. The block eyebrows in `Callout` / `StepWizard` / `KeyboardGrid` still use `text-base` — finish the pass there.
- Guide topic 404 still uses Next's default; the #7 recovery suggestions were added to the blog 404 only. Add a guide `not-found.tsx` with suggested topics if wanted.
- Changelog per-entry deep-links to matching guide topics were deferred — `RELEASES` has no `guideHref`/topic mapping data.
- New docs/content copy (blog CTA band, guide try-it CTA, changelog CTA, 404 "Popular posts") is hardcoded English, not i18n'd across the 14 locales.
- RSS feed is linked from the blog index + changelog, but not yet advertised via a `<link rel="alternate" type="application/rss+xml">` in `<head>` or from article pages.

## Structural facts (blended bug+test scan, 2026-06-19)
- `src/lib/server/json-file-store.ts` `readJsonFile` now **fails loud** on non-ENOENT read errors and corrupt JSON (rethrows) — only a missing file uses the fallback. Do NOT re-add a blanket `catch{}` returning empty; it silently wipes the voting store on the next write.
- `supabaseApi.getObservabilityMetrics().successRate` is now a **percentage 0–100** (matches the mock + the `.toFixed(1)%` tile). Any new ApiClient impl must return successRate in 0–100. `successTrend`/`pctChange` are scale-invariant.
- Mock execution streaming is **stateless** now: `getMockExecutionDetail(id, offset)` honors the caller's offset; the old module-global `mockOutputOffset`/`resetMockOutputOffset` are gone — matches the real/supabase `getExecution(id, offset)` contract. The poller (`useExecutionPolling`) owns the cursor.
- The execution detail modal streams via **offset-polling** (`useExecutionPolling`, 1s), NOT EventSource — `src/app/api/executions/[id]/stream/route.ts` (SSE) is effectively **dead code**.

## Anti-patterns / context drift (2026-06-19)
- **Context `filePaths` are drifting** (rebuilds since 2026-05-10). Files listed in contexts but ABSENT on disk: `src/app/todo/page.tsx`, `src/components/NavbarMobileMenu.tsx`; `src/components/dashboard/AgentDetailDrawer.tsx` exists only under `.claude/worktrees/`. `dashboard/home` is now a mission-control layout; roadmap + agents pages were rebuilt (several 2026-05-10 findings are now stale). Verify paths before planning.
- **"Dead code" reviewed in Wave 6 (2026-06-19) — NOT junk, left in place.** On inspection these are built-but-unwired features / intentional infra, not prunable junk (deleting would destroy work / change interfaces). Decisions:
  - `connector-modal/components/{SetupCTA,CopyButton,TerminalSimulator}.tsx` — **built-but-unwired**: `index.tsx` wires only `ConnectorModalHeader`/`UseCaseList`/`TryItToggle`. Real fix = wire them into the modal (feature scope), or deliberately remove. Left in place.
  - `personaStore.ts` `optimisticUpdatePersona`/`commitOptimisticUpdate`/`patchStillApplied` — **zero external callers** (self-contained subsystem a prior scan added as a "fix"). Removing would change the store's public interface. Left in place; wire it to the real persona-mutation paths or remove as a deliberate decision.
  - `src/app/api/executions/[id]/stream/route.ts` — a **functional SSE endpoint with zero client callers** (the detail modal offset-polls via `useExecutionPolling`). Capability, not dead code. Left in place.
  - `NavbarLogoGlyph`/`NavbarLogoWordmark` — unreferenced, but cf. the `VisionHoneycomb` "intentionally preserved" precedent above. Left in place.

## Structural facts (test infra, 2026-06-19)
- **A unit runner now exists**: `vitest` 4 (+ `@vitest/coverage-v8`), scripts `test:unit` / `test:unit:watch` / `test:unit:cov`, config in `vitest.config.ts` (node env, `@`→`src` alias, `server-only`→`src/test/server-only-stub.ts`). Tests are `src/**/*.test.ts` and ARE typechecked by `npm run typecheck`. Supersedes the older "Playwright e2e only" note.
- Coverage gate is **per-area** (scoped `coverage.include`), not repo-wide — only comprehensively-covered pure modules count toward the threshold (80/72/72/80). Promote modules into `include` as their batches grow; don't set a repo-wide threshold (would fail on the large untested surface).
- `server-only` is not resolvable under vitest's node resolution — it's aliased to a no-op stub. `next/server` imports DO resolve in the node env (getClientIp is unit-tested).
- `encodeFlow` (`flow-composer/data.ts`) is browser-gated (`typeof window`), so it returns `""` under node/vitest — test `decodeFlow` by building the base64 hash directly (`btoa(encodeURIComponent(JSON))`).

## Open follow-ups (from blended bug+test scan, 2026-06-19)
- ~~**No unit runner exists**~~ DONE — vitest added + 36 tests seeded (validation, url, format-date, slaFormat, leaderboardSort, flow-composer decode, sentry-pii, getClientIp). Remaining batches to add: `guide-search`, `format.relativeTime`, vote/boost/comment route validators, `useReviewBulkActions` reducers, `event-bus-demo`.
- **connections.spec.ts** has two `test.skip` connector-modal tests (flakiness-deferred + the scan's note that `SetupCTA`/`CopyButton` are dead code). Need a stable-selector rewrite + a real `playwright test` run to un-skip.
- Wire `test:unit` into CI / the `scripts/install-git-hooks.mjs` pre-push hook (left as a non-goal — needs explicit sign-off for CI/hook changes).
- **Broken/stale e2e specs** (success-theater): `e2e/roadmap.spec.ts` asserts removed text ("In Progress"/"current focus"); `e2e/templates.spec.ts:52` asserts "Design Highlights" (page renders "Key Benefits"); `e2e/guide.spec.ts` navigates to removed topic `keyboard-shortcuts-and-tips`; connector-modal e2e tests are `test.skip`. `playwright.config.ts` has `reuseExistingServer: true` unconditionally (false-pass risk).
- **Deferred from Wave 1**: SLA breaches in `getSyncedSla` fabricate `startedAt = now` / `durationMinutes = 0` on every fetch (a long breach reads as brand-new each refresh). Needs a breach-history table or a UI "point-in-time" label.
- **Security to revisit**: `getClientIp` (`src/lib/server/request.ts`) trusts `x-vercel-forwarded-for` before the `TRUST_PROXY` gate (spoofable off-Vercel); `sentry-pii` `scrubData` passes nested values through past depth 6.
