# Ambiguity-Guardian + UI-Perfectionist Scan — personas-web, 2026-07-16

> Combined dual-lens audit (🌀 Ambiguity Guardian + 🎨 UI Perfectionist) of the personas-web marketing site.
> 53 parallel per-context subagent runs, batched in waves of 8, exactly 5 findings each.
> Baseline at scan time: tsc 0 errors · vitest 64/64 · branch master, clean tree.

---

## Totals

| | Critical | High | Medium | Low | **Total** |
|---|---:|---:|---:|---:|---:|
| Across 53 contexts | 6 | 113 | 133 | 13 | **265** |
| Share | 2.3% | 42.6% | 50.2% | 4.9% | 100% |

Counts verified two ways: `> Total:` header sum (265) == `**Severity**:` bullet count (265). ✔

---

## The 6 Criticals

1. **`NEXT_PUBLIC_TEAM_API_KEY` is client-bundled and authorizes destructive orchestrator writes** — `src/lib/api.ts:89`. The bearer key that lets the dashboard `deletePersona`/`executePersona` is inlined into the browser bundle; the "auth" is really just network exposure of the orchestrator. Server-proxy pattern already exists in the SSE routes as the fix template. *(orchestrator-api-client, echoed by execution-history-streaming #2)*
2. **Anon-key-only Supabase exposes voter emails & allows vote wipe** — `src/lib/supabase.ts:8`. No service-role client exists, so `feature_votes` runs `using(true)` RLS — any visitor can read every voter's email or bulk-delete votes directly via the public REST endpoint. *(supabase-client)*
3. **Mock "Previous" compare series + fake incident annotations leak into real-mode charts** — `src/components/dashboard/CostChartWithCompare.tsx:33`. Fabricated data ("Slack outage" annotations, date-aligned mock deltas) renders with real-data authority on the operator observability charts. *(observability-charts-sla)*
4. **Unmodified-key shortcuts hijack browser chords — Ctrl+R rejects a review** — `src/app/dashboard/reviews/reviews-split-pane/useReviewKeyboardShortcuts.ts:42`. Keyboard handler ignores modifiers, so Ctrl+R (reload) irreversibly rejects the selected pending review with no undo. *(manual-review-queue)*
5. **Connector cards are click-only divs — fully keyboard-inaccessible** — `src/components/sections/connections-catalog/components/ConnectorCard.tsx:22`. The catalog's core interaction (open a connector modal) is a bare `motion.div` with no role/tabIndex/keydown/name; unreachable by keyboard, invisible to AT (WCAG 2.1.1/4.1.2). *(connectors-catalog)*
6. **Reduced-motion users see a permanently invisible hero headline** — `src/components/CinematicBreather.tsx:32`. `tw-char-hidden` (opacity:0) is applied unconditionally under `prefers-reduced-motion`, so "Your agents. Your rules. Your infrastructure." never appears — rooted in an `animations.ts` contract whose only reduced-motion outcome is "return null". *(animation-motion-system)*

---

## Per-context breakdown (sorted by criticals desc, then total severity weight)

| Context | C | H | M | L | Report |
|---|---:|---:|---:|---:|---|
| Animation & Motion System | 1 | 3 | 1 | 0 | animation-motion-system.md |
| Observability Charts & SLA | 1 | 2 | 2 | 0 | observability-charts-sla.md |
| Manual Review Queue | 1 | 3 | 1 | 0 | manual-review-queue.md |
| Orchestrator API Client & Mock Data | 1 | 1 | 2 | 1 | orchestrator-api-client.md |
| Connectors Catalog | 1 | 1 | 3 | 0 | connectors-catalog.md |
| Supabase Client | 1 | 1 | 2 | 1 | supabase-client.md |
| Execution History & Streaming | 0 | 4 | 1 | 0 | execution-history-streaming.md |
| Agent Playground & Multi-Agent Chat | 0 | 3 | 2 | 0 | agent-playground-chat.md |
| Agent Execution Timeline Race | 0 | 3 | 2 | 0 | agents-timeline-race.md |
| Build Config & E2E Tests | 0 | 3 | 2 | 0 | build-config-e2e.md |
| Dashboard Shell, Chrome & Realtime | 0 | 3 | 2 | 0 | dashboard-shell-chrome.md |
| Event Bus & Stream Monitoring | 0 | 3 | 2 | 0 | event-bus-monitoring.md |
| Guide Content Blocks & Markdown | 0 | 3 | 2 | 0 | guide-blocks-markdown.md |
| Guided Product Tour | 0 | 3 | 2 | 0 | guided-product-tour.md |
| Knowledge Base | 0 | 3 | 1 | 1 | knowledge-base.md |
| Memory Layers & Multi-Provider AI | 0 | 3 | 2 | 0 | memory-layers-multi-provider.md |
| Observability Deck & Security Vault | 0 | 3 | 2 | 0 | observability-deck-security-vault.md |
| Orchestration & Platform Visualizers | 0 | 3 | 2 | 0 | orchestration-platform-visualizers.md |
| Self-Healing & Trigger Automation | 0 | 3 | 2 | 0 | self-healing-triggers.md |
| Split & Pipeline Playground | 0 | 3 | 2 | 0 | split-pipeline-playground.md |
| Agents (Personas) Management | 0 | 2 | 2 | 1 | agents-management.md |
| Agent Lab & Plugin Ecosystem | 0 | 2 | 3 | 0 | agent-lab-plugins.md |
| Blog | 0 | 2 | 3 | 0 | blog.md |
| Connector Detail Modal | 0 | 2 | 3 | 0 | connector-detail-modal.md |
| Conversion: Get Started, FAQ & Footer | 0 | 2 | 3 | 0 | conversion-getstarted-faq-footer.md |
| Dashboard Home Overview | 0 | 2 | 3 | 0 | dashboard-home-overview.md |
| Error Monitoring & Analytics | 0 | 2 | 3 | 0 | error-monitoring-analytics.md |
| Feature Voting & Comments | 0 | 2 | 3 | 0 | feature-voting-comments.md |
| Features Overview & Pricing | 0 | 2 | 3 | 0 | features-pricing.md |
| Flow Composer & Playground | 0 | 2 | 3 | 0 | flow-composer-playground.md |
| Guide Data, Content & Search | 0 | 2 | 3 | 0 | guide-data-search.md |
| Homepage & Hero | 0 | 2 | 3 | 0 | homepage-hero.md |
| How It Works & Changelog | 0 | 2 | 3 | 0 | how-it-works-changelog.md |
| Internationalization (14 locales) | 0 | 2 | 3 | 0 | internationalization.md |
| Layout, Navigation & Page Shell | 0 | 2 | 3 | 0 | layout-navigation-shell.md |
| Leaderboard & Rankings | 0 | 2 | 2 | 1 | leaderboard-rankings.md |
| Legal & Policy | 0 | 2 | 3 | 0 | legal-policy.md |
| Mobile App Shell & Views | 0 | 2 | 2 | 1 | mobile-app-shell.md |
| Public Roadmap | 0 | 2 | 3 | 0 | public-roadmap.md |
| Security & Compliance | 0 | 2 | 2 | 1 | security-compliance.md |
| SEO & Social Metadata | 0 | 2 | 3 | 0 | seo-social-metadata.md |
| Shared UI Primitives & Illustrations | 0 | 2 | 3 | 0 | shared-ui-primitives.md |
| Templates Gallery & Detail | 0 | 2 | 3 | 0 | templates-gallery-detail.md |
| Theme System | 0 | 2 | 3 | 0 | theme-system.md |
| Waitlist & App Download | 0 | 2 | 3 | 0 | waitlist-app-download.md |
| Why Agents & Use Cases | 0 | 2 | 3 | 0 | why-agents-use-cases.md |
| Auth & User Session | 0 | 1 | 3 | 1 | auth-user-session.md |
| Guide Pages & Navigation | 0 | 1 | 4 | 0 | guide-pages-navigation.md |
| Localized Guide Content (14 locales) | 0 | 1 | 3 | 1 | localized-guide-content.md |
| Messages & Settings | 0 | 1 | 3 | 1 | messages-settings.md |
| Section Preview & Demo Harness | 0 | 1 | 3 | 1 | section-preview-demo-harness.md |
| Shared Types, Utilities & Hooks | 0 | 1 | 3 | 1 | shared-types-utils-hooks.md |
| Vote Persistence | 0 | 1 | 3 | 1 | vote-persistence.md |

---

## Triage themes (the wave map)

These are the recurring shapes across the 265 findings. Each is a coherent fix-wave with one mental model.

| # | Theme | Approx count | Why it's a wave |
|---|---|---:|---|
| T1 | **Security / secret-exposure** | 4 | Client-bundled orchestrator key (×2 reports), anon-key RLS, in-process "cross-process" lock. Highest blast radius. |
| T2 | **Fabricated data with real-mode authority** | ~8 | Mock compare series/annotations, hardcoded nav badges, fake EventBus "Connected", knowledge mapper inventing usage stats, fake "Run analysis" spinner. Erodes trust in the demo dashboard. |
| T3 | **Demo/real mode-switch stale-data leak** | 4 | Root cause: `clearUserScopedCaches` runs only on `signOut` (auth-user-session #1). Symptoms in leaderboard, messages, and the general `isDemo`-in-useState-initializer pattern. Fix root + consumers. |
| T4 | **Reduced-motion = empty section** (a11y) | 4 | CinematicBreather headline, PulseGridDeck, Persona Matrix, EventBus swarm — motion gate has no "static end-state" affordance (`animations.ts`). Fix the contract, then the call sites. |
| T5 | **Unnamed / unreachable interactive controls** (WCAG 4.1.2 / 2.1.1) | ~18 | Click-only `motion.div` cards (connectors, flow nodes, event-bus nodes), icon-only tab/wheel/medal buttons, unnamed progressbars across every animated demo. The single largest theme. |
| T6 | **Pause / hover / interrupt conflation** | ~6 | Tour pause desyncs, race mouse-leave cancels user pause, "Pause" that doesn't pause the race, trigger wheel overriding manual selection, terminal with no stop. |
| T7 | **Happy-path mutations with no error/loading state** | ~8 | Subscription mutations, comment/vote rollback, event replay black hole, waitlist stuck-on-timeout, execution/home cards with no error state. |
| T8 | **Dead / unwired surface** | ~9 | `/api/roadmap` zero consumers, SSE execution proxy dead, SetupCTA/CopyButton never rendered, ShortcutsHud mounted nowhere, dead Reply buttons, navbar with no logo, dead DownloadModal options. |
| T9 | **i18n: hardcoded English + false coverage gate** | ~7 | Hero/pricing/blog/StatusBadge hardcoded strings; the "100% coverage" gate certifies 11–17% untranslated locales; ~16,300 baselined mojibake sequences. |
| T10 | **Broken conversion path** | ~4 | PrimaryCTA drops onClick (untracked downloads), hero `#download` anchor missing when lazy section unmounted, waitlist stuck, dead navbar download. Direct funnel impact. |
| T11 | **Hydration / SSR / caching correctness** | ~5 | Hash-read in useState initializer (EventBusShowcase), `ssr:false` anchors breaking /how deep links, blog future-post 404 caching, stats route assuming writable FS, theme rehydrate DOM-writes. |
| T12 | **Invalid runtime-built CSS / Tailwind** | ~3 | GlowCard hover glow (runtime template literal → never compiled), Lab TabSwitcher CSS-var+hex-alpha glow, hardcoded hex bypassing brand tokens. Signature visual effects silently dead. |
| T13 | **Context-map drift** | 6+ | Phantom files in Why Agents (12/22), Homepage, Feature Voting, Public Roadmap, Observability Deck, Dashboard Home, Mobile, Layout, Build/E2E; unmapped real files. Not code fixes — **refresh_context after fix waves.** |
| T14 | **Duplicated source-of-truth / magic mappings** | ~8 | TOC vs renderer slug pipelines, ArchitectureFlow LAYER_DETAILS keyed by display name, theme allowlist duplicated in inline script, guide translation drift ledger, keyword lists in 3 copies. |
| T15 | **Guide/markdown correctness** | ~4 | Divergent slug IDs, table cells skip parseInline, nested-list invalid HTML, fuzzy-match distance flooding search. |

---

## Suggested wave plan (fix order)

Waves are ordered by severity-and-safety. Each is ~5–7 findings, one mental model, atomic commit per finding, tsc+vitest gate vs baseline (0 / 64-64) after each wave. Fixes land on branch `vibeman/ambiguity-ui-scan-2026-07-16-fixes` off master.

- **Wave 1 — Security (T1).** The 4 security findings. ⚠️ Some are behavior/architecture changes (server-proxy for orchestrator key, Supabase service-role client, waitlist persistence) → **flag for user sign-off before implementing**; these touch auth/secret handling (Phase 5 non-goal without approval).
- **Wave 2 — Fabricated-data honesty (T2).** Strip mock data from real-mode surfaces; gate behind `isDemo`. Product-visible behavior change → summarize for user.
- **Wave 3 — Mode-switch cache contract (T3).** Fix `clearUserScopedCaches` to run on session-expiry + demo entry; add an `isDemo`-change contract; fix the useState-initializer consumers.
- **Wave 4 — Reduced-motion static end-state (T4).** Extend the motion-gate contract to allow a static end-state, then fix the 4 empty-section call sites.
- **Wave 5 — a11y unnamed/unreachable controls, part 1 (T5).** The 6 Critical/High keyboard-unreachable cards + top unnamed controls.
- **Wave 6 — a11y unnamed controls, part 2 (T5) + pause/interrupt (T6).**
- **Wave 7 — Happy-path error/loading states (T7).**
- **Wave 8 — Dead/unwired surface (T8).** Wire or remove — decide per item; some (roadmap API) are product decisions.
- **Wave 9 — Conversion path (T10) + hydration/SSR (T11).**
- **Wave 10 — i18n (T9).** Hardcoded strings + gate hardening. (Mojibake repair may be its own effort.)
- **Wave 11 — Invalid CSS (T12) + guide/markdown correctness (T15) + duplicated SoT (T14).**
- **Wave 12 — Medium/Low tail + context-map drift (T13).** Batch remaining Mediums by area; `refresh_context` for every context whose files changed.

Medium/Low and the product-decision items (roadmap API direction, Supabase architecture, i18n mojibake plan) can be paused between waves.

---

## How this scan was run

- **Scanners**: `ambiguity_guardian` (🌀) + `ui_perfectionist` (🎨) combined into one dual-lens prompt per context, sourced from Vibeman's `src/lib/prompts/registry/agents/`.
- **Date**: 2026-07-16. **Scope**: all 53 contexts (client-side; personas-web has no src-tauri).
- **Method**: one `general-purpose` subagent per context, ≤8 parallel, each read its context's files read-only and wrote exactly 5 findings. Orchestrator read only terse replies (not full reports) during scanning.
- **Interruption**: a Claude session usage limit paused the run at 31/53; resumed after reset via RESUME-STATE.md, no findings lost.
- **Verification**: `> Total:` header sum (265) == `**Severity**:` bullet count (265). Every report has exactly 5 findings.
- **Notable cross-cutting finding**: heavy **context-map drift** — ~10 contexts list files that were renamed/retired since 2026-06-13. The context map should be refreshed (`refresh_context`) after fixes.
