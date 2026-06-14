# Feature Scan — Findings & Remediation

Aggregated from the per-feature documentation scan (`docs/features/**`, 69 docs).
Every item was surfaced by reading the actual source; each doc's `Conventions & gotchas`
section is the long-form source for its findings. This file is the **prioritized,
trackable punch-list** distilled from those sections.

> ⚠️ **Over-report caveat:** the scan was thorough but agent-generated. Verify each finding
> against current code before fixing (this repo is already polished — some "gaps" are
> intentional). Fixes follow CLAUDE.md conventions: one atomic commit each, i18n in
> 14-locale lockstep, semantic tokens, animation gating, React 19 rules.

## Status legend

🔴 open · 🟡 in progress · 🟢 fixed · ⚪ by-design / won't-fix · 🔵 needs decision

## Totals by theme

| Theme | Items | Headline severity |
|---|---:|---|
| A. Internationalization (hardcoded English + dormant switching) | 16 | High |
| B. Dead / dormant code | 18 | Low–Med |
| C. Reduced-motion gating gaps (lint blind spot) | 1 cluster | Med |
| D. Design tokens / theme | 5 | Med |
| E. Routing / metadata / SEO drift | 9 | Med |
| F. Data integrity / copy drift | 7 | Low–Med |
| G. Security / trust boundary | 4 | High |
| H. Reliability / state | 6 | Med |
| I. Accessibility | 8 | Med |
| J. Test coverage | 3 | Med |

## Scope gates (do NOT bulk-fix without explicit sign-off)

- **Theme A (i18n)** — CLAUDE.md forbids bulk translation migration; every new key must be
  hand-translated into all 14 locales (no English placeholders). Addressing A means a
  scoped, owner-approved campaign, not a sweep. Until then, A items are 🔵 needs decision.
- **Theme G (security)** — auth bypass + vote integrity changes alter the trust boundary and
  overlap the `docs/harness/bug-hunt-2026-05-10` criticals. Coordinate before touching.
- **Route paths under `src/app/`** — don't move/rename without confirmation.

---

## A. Internationalization

The largest theme. Runtime locale switching is dormant and a large share of UI bypasses the
i18n bundle entirely. **Gated — see scope note above.**

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| A-01 | High | `i18nStore.setLanguage` is a no-op; `language` hard-locked to `'en'`; no switcher; no `persist`. 13 non-en bundles never load at runtime. `src/stores/i18nStore.ts:15` | Decide product intent: ship a switcher + wire setLanguage, or document locale bundles as future-only. | 🔵 |
| A-02 | High | ~118 of ~582 `.tsx` use `useTranslation`; much UI copy is hardcoded English. | Inventory + scoped migration plan. | 🔵 |
| A-03 | High | Entire `/features` product-showcase tree hardcoded English (all 9 sections). | Per-section i18n migration (14-locale). | 🔵 |
| A-04 | High | Marketing hardcoded English: why-agents (`data.ts`+RoleSelector), features cluster, get-started+`TOUR_STEPS`, hero (`HeroClient.tsx:142,160`), `SocialProof.tsx`+`testimonials.ts`, pricing offer band. | Migrate per section. | 🔵 |
| A-05 | Med | Connectors catalog + Extend card + connector modal hardcoded English. | Migrate. | 🔵 |
| A-06 | Med | Legal hub (3 policies + tabs + `metadata`) hardcoded English. | Migrate. | 🔵 |
| A-07 | Med | `/security` page + `src/data/security.ts` hardcoded English. | Migrate. | 🔵 |
| A-08 | Med | Feature-voting section hardcoded English. | Migrate. | 🔵 |
| A-09 | Med | Waitlist + Download modals hardcoded English. | Migrate. | 🔵 |
| A-10 | Med | Guide nav: `TopicView`, `CategoryTopics`, `RelatedTopics`, `ModuleBadge`, `SearchResultsPopover`, both `not-found.tsx` hardcoded English. | Migrate. | 🔵 |
| A-11 | Low | Guide content-block labels ("Tip"/"Before/After"/"Recommended") + `CopyButton` hardcoded. | Migrate. | 🔵 |
| A-12 | Med | Dashboard `StatusBadge.tsx` hardcoded labels ("Queued"/"Running"/…). | Migrate (touches all locales). | 🔵 |
| A-13 | Low | Mobile shell raw strings; `t.messagesPage.unread.toLowerCase()` is locale-fragile. | Migrate + drop `.toLowerCase()`. | 🔵 |
| A-14 | Low | Dead/unused i18n keys: `footer.tagline`, `useCasesSection.{integrations,patterns,description,autoplayHint}`, `settingsPage.providers.allowed`, `messagesPage.{expand,collapse}`, knowledge `{tokens,retries,seeAll}`, old `pricing.*` tier copy, `featurePages["multi-provider"]`. | Prune from all 14 locales (lockstep). | 🔵 |
| A-15 | Med | `leaderboardPage.metrics` has stray bled-in keys (`tokens`/`retries`/`skipTo`/`chapterHome`) polluting the `Translations` shape. `src/i18n/en.ts` (~`:1670`). | Move keys to correct namespaces across 14 locales. | 🔵 |
| A-16 | Med | Localized guide prose stale: `installing-personas` body in de/ja still says Win/mac/Linux + no Claude Code step; English is now Windows-only + Claude Code precondition. | Re-translate affected topics. | 🔵 |

---

## B. Dead / dormant code

Safe, low-risk cleanups (remove or wire up). Good early wins.

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| B-01 | Low | `AgentDetailDrawer.tsx` fully built but imported nowhere (page expands `AgentDetail` inline). | **Deleted** (0 importers; 2 descriptive comments in `AgentMetrics`/`useDialogFocusTrap` left as-is). | 🟢 |
| B-02 | Low | `personaStore` optimistic update/rollback/commit infra has no caller in `src/`. | Wire into execute path or remove. | 🔴 |
| B-03 | Low | `HeroTransition.tsx` orphaned (real seam is `SectionDivider`); `t.heroTransition.*` dead. | **Component deleted.** `t.heroTransition.*` keys now orphaned across the interface + 14 locales → lockstep removal tracked under A-14. | 🟢 |
| B-04 | Low | `dashboard/knowledge/derived.ts` orphaned, docstring falsely claims it backs table/graph. | **Deleted** (0 importers). | 🟢 |
| B-05 | Low | `ObservabilityCharts.tsx` + `ChartAnnotation.tsx` zero importers; `ObservabilityCostChart`/`ExecChart` unused near-dupes of `*WithCompare`. | **Deleted all 4** (0 module importers; the `ChartAnnotation` *type* lives in `mock-dashboard-data` and is untouched). | 🟢 |
| B-06 | Low | `observability-deck/useActivityFeed.ts` + `ActivityFeed.tsx` never imported (live variant = `PulseGridDeck`). | **Deleted both.** | 🟢 |
| B-07 | Low | Connector modal `SetupCTA` + `CopyButton` unused (index imports only Header/UseCaseList/TryItToggle) → use-case commands have no copy affordance. | Wire up or delete. | 🔴 |
| B-08 | Low | `feature-voting/NotifyInput.tsx` + `VoteParticles.tsx` imported nowhere; `CustomRequest.tsx` superseded dup of `components/CustomFeatureRequest.tsx`. | **Deleted all 3.** | 🟢 |
| B-09 | Low | Ambient `AmbientOrbs`/`ParallaxAccents`/`TopoBackground` mounted nowhere. | Mount or mark drop-in only. | 🔴 |
| B-10 | Med | `/changelog` link in `Changelog.tsx:76` was dead (no `src/app/changelog`). *(The `Changelog` card itself is only mounted via the dev `/preview` harness — `LazyChangelog` is otherwise unmounted; cleanup tracked separately.)* | **Done** — link → `/roadmap#changelog` (a real anchor on `/roadmap`). | 🟢 |
| B-11 | Low | `tool-catalogue.ts` `CORE_TOOL_IDS`/`CORE_TOOLS` exported for FlowComposer but unused (it has its own `TOOL_CATALOGUE`); two 20-tool lists duplicated. | Dedup. | 🔴 |
| B-12 | Med | `src/proxy.ts` is complete middleware (matcher `/dashboard/:path*`, mobile-UA → `/m/overview`, `prefer-full` escape hatch) but named `proxy.ts`, so Next never loads it — the `/m` redirect **does not run** (`/m` is reachable only by direct URL). | **Decision: leave dormant (deferred-by-design).** Stays inert until `/m` is ship-ready — needs a "view full site" opt-out (the `prefer-full` cookie has no UI setter today) + mobile QA. To wire later: move `proxy.ts`→`src/middleware.ts` + rename `proxy`→`middleware` (config unchanged; no importers to update). | ⚪ |
| B-13 | Low | SSE proxies dormant in demo: `/api/executions/[id]/stream` has no consumer (detail viewer polls); `/api/events/stream` only runs non-demo. | Document / wire when live. | 🔴 |
| B-14 | Low | Agent-lab `EvolutionTab` "breed next gen" button has no `onClick`; chat input is a static div. | Wire or mark decorative. | 🔴 |
| B-15 | Low | `mockAuth.ts:22` `mockInitialize` unused by live flow. | **Removed** (0 callers; `mockSignIn`/`mockSignOut` retained). | 🟢 |
| B-16 | Low | `public/imgs/features/multi-provider.png` referenced nowhere. | **Deleted** (only `#multi-provider` anchors/i18n ns reference the slug, never the image). | 🟢 |
| B-17 | Low | `ConnectionPillar` `progress` prop dead-wired (`progress={1}`). | Remove prop. | 🔴 |
| B-18 | Low | `playground-timeline/StageCard` `index` prop unused. | Remove prop. | 🔴 |

---

## C. Reduced-motion gating gaps

The custom lint rule only fires on `requestAnimationFrame`, so framer-motion / SMIL / CSS
infinite loops slip past `useReducedMotion`. Confirmed ungated motion:

`AgentLane` pulse (observability-deck) · `SecurityVault` `animate-ping` · `EvolutionTab`
pulse (agent-lab) · `ArtistGrid`/`ResearchLifecycle`/`ResearchSources`/`PluginCard`/`PluginTabs`
(plugins) · `FlowWires`+`FlowNodes` (flow-composer) · `ConnectionPillar` (platform-layers) ·
`FooterLinkColumn` accordion · `MobileTopicTOC`+`SearchResultsPopover` (guide) ·
`HealthyShieldIllustration` SMIL `animateMotion` (also not paused by the global
prefers-reduced-motion CSS) · `BlinkingCursor`/`TerminalLine` · vision-grid CSS transitions +
`FeatureBridge` bounce · get-started looping visuals · entire knowledge cluster graph ·
trigger-wheel entrance · `healing-circuit` freezes with no static fallback frame.

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| C-01 | Med | Framer-motion / SMIL / standard `animate-ping/pulse/spin` ignore `prefers-reduced-motion`. *(Scoping note: the global CSS reset in `globals.css` only neuters custom decorative classes — `animate-float`, `animate-spin-slow`, `animate-pulse-slow`, `topo-bg`, `shimmer` — so flags for those were over-reports. Only framer JS, SMIL, and standard `animate-*` need manual gating.)* | **Done — 14 gated** (verified, tsc + lint clean): `AgentLane`, `BlinkingCursor`, `ConnectionPillar`, `EvolutionTab`, `SecurityVaultPillars` (`motion-safe:`), `FlowWires`, `FlowNodes` (SMIL), `FooterLinkColumn`, `MobileTopicTOC`, `SearchResultsPopover`, `HealthyShieldIllustration` (3 SMIL loops), `CreateVisual`, `DownloadVisual`, `WorkVisual`. **Over-reports confirmed — no change** (one-shot/hover or already CSS-handled): all 5 plugins grids, `TriggerWheel`, knowledge cluster graph (3 files), vision-grid (3 files), `ConnectVisual`, `ImproveVisual`. **Deferred nuance:** `healing-circuit` is already gated but freezes all-healthy with no representative static frame (a UX refinement, not a missing gate). | 🟢 |
| C-02 | Low | Lint rule `require-animation-gating` can't catch framer/SMIL/CSS motion. | Consider extending the rule to flag `repeat: Infinity` / `<animate>` / standard `animate-*`. | 🔴 |

---

## D. Design tokens / theme

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| D-01 | Med | `bg-surface/95` used in ~20 modal/toast/overlay components but `--color-surface` was registered nowhere → non-resolving utility, no fill. | **Done (web-only).** Added `--surface = color-mix(in srgb, var(--background), #ffffff 5%)` in `themes.css :root` (auto-adapts every dark variant via per-theme `--background`), `--surface: #ffffff` for `[data-theme^="light"]`, and the `--color-surface: var(--surface)` bridge in `globals.css @theme inline`. Opaque (works for plain `bg-surface` + `/95`/`/90`/`/70`). Shared `tokens.css` left untouched to avoid desktop drift. **Note:** the 5% elevation is taste — eyeball a modal in a couple themes; one-number tweak. | 🟢 |
| D-02 | Low | Per-theme brand overrides uneven (`dark-cyan`/`dark-bronze` don't redefine all 5 brand keys) → some `text-brand-*` fall back to midnight. | Fill brand keys per theme. | 🔴 |
| D-03 | Low | Light themes invert white-glass utilities only for enumerated opacity steps; others stay invisible. | Add missing overrides or a systemic rule. | 🔴 |
| D-04 | Low | Raw hex/rgba widespread in showcase + `GlowCard` (vs `BRAND_VAR`/`color-mix`). | Migrate to tokens incrementally. | 🔴 |
| D-05 | Low | `${color}cc` alpha suffix is a no-op (BRAND_VAR are CSS vars, not hex) in observability-deck. | Use `color-mix`. | 🔴 |

---

## E. Routing / metadata / SEO

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| E-01 | Med | `homeJsonLd.ts` FAQ advertises "Starter/Pro/Team" cloud tiers; `softwareJsonLd` lists only Claude+Ollama; org `url`/`logo` hardcoded `personas.ai`. | org `url`/`logo` → `SITE_URL` **done** (`c…`); pricing-tier + provider-list text left pending product ground-truth (the cloud tiers may be real roadmap plans). | 🟡 |
| E-02 | Med | `robots.ts` only blocked `/dashboard/` + `/api/`; `/todo`, `/demo`, `/preview/*`, `/m/*` were crawlable & absent from sitemap. | **Done** — now disallows `/m/`, `/preview`, `/demo`, `/todo` too (`robots.ts:13`). | 🟢 |
| E-03 | Low | `/templates/[id]` (+ `/security`, `/legal`, `/playground`, blog/guide index) ship no OG image; no `twitter-image` anywhere. | Add `opengraph-image.tsx` where it matters. | 🔴 |
| E-04 | Low | `TriggerSystem` mounts only on `/todo`, not `/features` — feature absent from live IA. | Decide: ship on `/features` or document as cut. | 🔴 |
| E-05 | Low | `PlatformCommand`/`AgentPlayground`/`PlaygroundTimeline` reachable only via dev `/preview` (404 in prod) — effectively unshipped. | Decide ship/cut. | 🔴 |
| E-06 | Low | `/roadmap` UI never calls `/api/roadmap`; renders static `areas.ts`+`roadmap-phases.ts`; route only queries `roadmap_items` (`shipped_features` unread). | Wire the page to the API or remove the endpoint. | 🔴 |
| E-07 | Low | Connectors `layout.tsx` metadata said "50+ integrations" vs 125 actual. | **"50+" fixed** — `layout.tsx` now derives `${count}+` from `connectors.length` (matching the OG image, which already did). The `connectors.ts` ↔ `tool-catalogue.ts` id/color drift remains (separate reconcile). | 🟡 |
| E-08 | Low | Dashboard home: 2 Quick Links both → `/dashboard/observability` (`DashboardQuickLinks.tsx:51-52`). *(Heatmap "7 days" was over-reported — the grid uses `HEATMAP_DAYS` correctly; only the i18n subtitle string says "7 days".)* | Pick a distinct target for the "Usage Analytics" tile (ambiguous — needs decision). | 🔵 |
| E-09 | Low | `DashboardIntelligencePanels` not `isDemo`-guarded at call site (`home/page.tsx:147`) → empty grid flash in non-demo. | Guard like Fleet/Vault cards. | 🔴 |

---

## F. Data integrity / copy drift

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| F-01 | Med | Blog: `generateStaticParams` + 404 `SUGGESTED_POSTS` skipped the future-date filter (staged posts directly reachable). *(Index filter already existed; JS `Array.sort` is stable so tie-order is deterministic — those parts were over-reported.)* | **Done** — added `isPublished()` to `blog.ts`; applied to static params, the `[slug]` page + metadata (404 staged posts), and 404 suggestions. | 🟢 |
| F-02 | Low | FAQ illustrations map by array index; `warnOnFaqIllustrationDrift` only count-checks (non-prod) → reorder silently desyncs SVG↔copy. | Key illustrations by id. | 🔴 |
| F-03 | Low | Guide `topics.ts` stale section-count comments (say 10, are 8/7/11); testing-module id↔title divergence. | Refresh comments / ids. | 🔴 |
| F-04 | Low | Templates near-dup ids (`stripe-`/`finance-` invoice-reconciler, revenue-alert) pass the guard but dup search/JSON-LD; `triggerIcons` duplicated across 2 config files. | Dedup. | 🔴 |
| F-05 | Low | Legal "Last updated: April 2026" hardcoded separately from `POLICY_META` → can drift. | **Done** — all 3 policies now render `POLICY_META[id].formattedUpdate` (the previously-unused field). | 🟢 |
| F-06 | Low | Copy drift: agent-lab "Six ways" vs 4 tabs; plugins "Six purpose-built plugins" vs 4. *(design-engine "eight cells/8 dimensions" is consistently 8 — over-report, no change.)* | **Done** — both "Six" → "Four". | 🟢 |
| F-07 | Low | Security page FAQ JSON-LD in `layout.tsx` is a hand-duplicated copy of `SECURITY_FAQS`. | **Done** — `mainEntity` now derived from `SECURITY_FAQS.map(...)`; can no longer drift from the visible Q&A. | 🟢 |

---

## G. Security / trust boundary (coordinate before fixing)

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| G-01 | High→ | Demo signin/`enterDemo` reachable in prod; `AuthGuard` is client-only. | **By-design (⚪).** `/dashboard/*` is intentionally a demo on mocks (marketing try-it surface); the client `AuthGuard` is deliberately not an access boundary (see `infrastructure/authentication-session.md`). No real user data sits behind it. If live orchestrator data is ever wired in, add a server-side guard then — but walling the demo now defeats its purpose. Not a fix. | ⚪ |
| G-02 | High→ | Vote stuffing: client `voterId`, no DB `UNIQUE`, client `weight`/`tierValue`, spoofable IP. | **Mostly addressed already; residual out-of-scope (🔵).** Current code: `getClientIp` is trust-ordered (XFF only with `TRUST_PROXY`), boosts validate `weight`/`tierValue` (int, >0, ≤1000), votes have app-level dedup + `withWriteLock`. Remaining real gaps need out-of-repo work: DB `UNIQUE(feature_id,voter_id)` (CLAUDE.md: no Supabase/RLS changes), Ko-fi payment verification (external webhook), distributed rate-limit (KV/Redis infra), server-bound identity (no auth in anon voting). | 🔵 |
| G-03 | High | Sentry PII scrubber missed `contexts`/`extra`/`tags`/`user.id`. | **Done.** The big gap was **already fixed** (those sections + `user.id` are now scrubbed; `captureExceptionScrubbed` exists). Closed the **residual value-based leak**: added an email regex to `scrubPii` (`→ [redacted-email]`) + extended `SENSITIVE_FIELDS` with `email`/`user_email`/`workspace_id`/`workspace_name`/`full_name`. | 🟢 |
| G-04 | Low | `STATS_ADMIN_TOKEN` absent from `.env.example`; constant-time check length-leaks via early `length` return. | **Done.** `isAdminAuthorized` now compares SHA-256 digests (always 32 bytes) → no length leak; added a documented `STATS_ADMIN_TOKEN` entry to `.env.example` (endpoint already 503s when unset). | 🟢 |

---

## H. Reliability / state

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| H-01 | Med | "Cross-process" vote file lock is single-process `Map` (last-rename-wins multi-instance); `.data/` ephemeral on serverless; rate-limit per-instance ~N×. | Use a real store (KV/Redis) for multi-instance. | 🔴 |
| H-02 | Med | `relativeTime` (actually in `src/lib/format.ts`, not `format-date.ts`) reads `Date.now()` in render; module-level `skewBreadcrumbReported` "once per process". | **skewBreadcrumb fixed** — now browser-only (a server module flag was shared across *all* requests, so only the first user's skew ever reported). The `Date.now()`-in-render part is **by-design / not bulk-fixable**: ~28 call sites, mostly list/column renders where `useState` can't apply; the repo already caches the live-updating ones (`PerformanceHealthIssueRow` lazy-state, `RecentActivityCard` 30s tick). | 🟡 |
| H-03 | Med | `bodyScrollLock` leak risk — a missed `unlockBodyScroll()` freezes scroll until reload. | **Verified clean (over-report)** — the primitive is already a counted, HMR-safe lock with idempotent unlock; all 5 consumers (`useMobileMenu`, `DownloadModal`, `MobilePageTOC`, `MobileTopicTOC`, `connector-modal`) pair `lock`→`unlock` in effect cleanup. No leak. | ⚪ |
| H-04 | Low | SSE routes lack heartbeat; executions detail uses 1s polling not SSE. | Add heartbeat when streams go live. | 🔴 |
| H-05 | Low | Agent-playground late-timer-leak-past-Reset (no run-id fence) + `AnimatePresence key={i}` collision. | Run-id fence + stable keys. | 🔴 |
| H-06 | Low | Playground-split timeline is fully `setTimeout`-scheduled upfront → backgrounded tab aborts to idle (not pause). | Pause/resume on visibility. | 🔴 |

---

## I. Accessibility

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| I-01 | Low | Unused `NavbarMobileMenu.tsx` lacks focus trap/scroll lock (live `MobilePanel` is fine). | **Deleted** the unused variant (0 importers). | 🟢 |
| I-02 | Med | `MobileSheet` lacks `aria-labelledby`/focus-trap/focus-return despite `role="dialog"`. | **Done** — wired `useFocusTrap` (initial focus + Tab cycle + restore on close) + `aria-labelledby` on the sheet title. | 🟢 |
| I-03 | Med | Connector modal lacks focus trap / `role="dialog"` / focus restore. | **Done** — added `role="dialog"`/`aria-modal`/`aria-label` (connector name) + `useFocusTrap`. | 🟢 |
| I-04 | Low | FAQ decorative SVGs lack `aria-hidden` → raw `<text>` leaks into the answer region. | **Done** — `aria-hidden` on the FAQ illustration wrapper (`FAQ.tsx`), hiding the decorative `<text>` from the answer `role="region"`. | 🟢 |
| I-05 | Med | Orchestration-hub SVG is `aria-hidden` yet nodes are clickable `<g onClick>` with no role/tabindex/key handler (mouse-only). | **Done** — `HubNode` nodes now `role="button"`/`tabIndex`/`aria-label`/`aria-pressed` + Enter/Space handler + `SVGFocusRingRect` (matches the `FlowNodes` pattern); `HubRing` svg un-hidden (`role="group"`). | 🟢 |
| I-06 | Low | Knowledge cluster graph: heavy framer, no reduced-motion. *(Resolved as over-report during C-01 — all motion there is one-shot entrance/settle, nothing continuous to gate.)* | No change needed. | ⚪ |
| I-07 | Low | Guide blocks: no `aria-live` for heading-anchor / Checklist progress. | **Done** — Checklist progress is now `aria-live="polite"`; `CopyButton` gained an `sr-only role="status"` announcer. *(HeadingAnchor copy-link confirmation left — would need a live region per heading; minor.)* | 🟢 |
| I-08 | Low | Connectors search ignores `name`/`authType`; URL writeback replace-only (no back/forward restore). | **Search broadened** to also match `name` + `authType`. URL `replace` left intentionally (avoids a history entry per keystroke; filter state already restores from the URL on load). | 🟡 |

---

## J. Test coverage

| ID | Sev | Finding | Fix | Status |
|---|---|---|---|---|
| J-01 | Med | 4 e2e specs (`community`, `compare`, `download`, `use-cases`) target routes with no `page.tsx` → would 404. | Repoint or remove stale specs. | 🔴 |
| J-02 | Med | Zero e2e for `/dashboard/*` (14 pages), `/m/*`, and the Supabase voting flow. | Add smoke specs. | 🔴 |
| J-03 | Low | `trace: "on-first-retry"` with `retries: 0` → traces never produced; 2 skipped connections-modal tests; timing-based playground/tour waits are flaky. | Set retries or change trace mode; de-flake. | 🔴 |

---

## Recommended fix waves

Ordered by (low risk × high value) first; gated themes last.

1. **Wave 1 — SEO/metadata & dead links** (E-01, E-02, E-03, E-08, B-10): no behavior risk, clear wins.
2. **Wave 2 — Dead-code removal** (B-01,03,04,05,06,08,15,16,17,18; I-01): delete-only, `tsc` proves safety.
3. **Wave 3 — Copy drift & data integrity** (F-01..F-07, E-07): literal/text + sort fixes.
4. **Wave 4 — Reduced-motion gating** (C-01) + **tokens** (D-01): a11y + the missing `--surface`.
5. **Wave 5 — Accessibility dialogs** (I-02, I-03, I-05): focus traps + keyboard ops.
6. **Wave 6 — Reliability** (H-02, H-03, B-12): purity, scroll-lock, the dormant `/m` middleware.
7. **Gated — needs decision**: Theme A (i18n campaign), Theme G (security), E-04/E-05/E-06 (ship/cut calls).

Each fix = its own atomic commit referencing its ID (e.g. `Refs: docs/features/FINDINGS.md E-02`).
Flip status to 🟢 here as each lands.
