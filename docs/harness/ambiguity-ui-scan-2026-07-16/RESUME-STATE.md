# Scan resume state — ambiguity-guardian + ui-perfectionist, 2026-07-16

## UPDATE 2026-07-16 (later): SCAN COMPLETE — 53/53 contexts, 265 findings (6C/113H/133M/13L), counts verified two ways. INDEX.md built + committed (f78d3fd) on branch `vibeman/ambiguity-ui-scan-2026-07-16-fixes`. Now in FIX phase.
## FIX phase status (updated): Waves 1-4 COMPLETE. ALL 6 CRITICALS CLOSED. 14 findings fixed, tsc 0 · vitest 64/64 · 0 regressions throughout.
##   Wave 1 (T4 reduced-motion, 4) · Wave 2 (T1 security, 6 — user-approved; DEPLOY STEPS in FIXES-WAVE-2.md) · Wave 3 (T5 keyboard-cards, 2).
## User directive: "keep going through the safe waves." NEXT: finish T5 (flow/event-bus nodes, unnamed progressbar/icon buttons), then T2/T3/T6-T15 per INDEX wave plan.
## Baseline to hold every wave: tsc 0 · vitest 64/64. Branch: vibeman/ambiguity-ui-scan-2026-07-16-fixes (unmerged).
## ⚠️ Wave 2 deploy steps pending user action: set SUPABASE_SERVICE_ROLE_KEY + run scripts/harden-voting-rls.sql; rename NEXT_PUBLIC_TEAM_API_KEY→TEAM_API_KEY.

---
# (original scan-interruption state below, now superseded)


Pipeline B run on **personas-web** (project id `39de516e-059b-4b1a-86ad-f28e8abddaf7`).
One combined-lens subagent per context, exactly 5 findings each, report per context in this directory.
**Interrupted by Claude session usage limit (resets 3:20am Europe/Prague).**

## Baseline (captured before scan)
- tsc: 0 errors · vitest: 64/64 passing (11 files) · branch: master, clean tree
- node_modules was empty; restored via `npm ci`

## Progress: 31 / 53 contexts scanned (155 findings, all reports verified: 5 findings + Total header each)

## Remaining 22 contexts to scan (dispatch same prompt template as existing reports)
| Context | Group | Suggested slug |
|---|---|---|
| Manual Review Queue (FAILED mid-run, no report) | Agent Operations Dashboard | manual-review-queue |
| Agents (Personas) Management (FAILED, no report) | Agent Operations Dashboard | agents-management |
| Knowledge Base (FAILED, no report) | Agent Operations Dashboard | knowledge-base |
| Execution History & Streaming | Observability & Event Monitoring | execution-history-streaming |
| Leaderboard & Rankings | Observability & Event Monitoring | leaderboard-rankings |
| Observability Charts & SLA | Observability & Event Monitoring | observability-charts-sla |
| Event Bus & Stream Monitoring | Observability & Event Monitoring | event-bus-monitoring |
| Dashboard Home Overview | Observability & Event Monitoring | dashboard-home-overview |
| Mobile App Shell & Views | Platform Foundation | mobile-app-shell |
| Animation & Motion System | Platform Foundation | animation-motion-system |
| Shared UI Primitives & Illustrations | Platform Foundation | shared-ui-primitives |
| Dashboard Shell, Chrome & Realtime | Platform Foundation | dashboard-shell-chrome |
| Layout, Navigation & Page Shell | Platform Foundation | layout-navigation-shell |
| Build Config & E2E Tests | Infrastructure & Telemetry | build-config-e2e |
| Supabase Client | Infrastructure & Telemetry | supabase-client |
| SEO & Social Metadata | Infrastructure & Telemetry | seo-social-metadata |
| Error Monitoring & Analytics | Infrastructure & Telemetry | error-monitoring-analytics |
| Orchestrator API Client & Mock Data | Infrastructure & Telemetry | orchestrator-api-client |
| Authentication & User Session | Infrastructure & Telemetry | auth-user-session |
| Shared Types, Utilities & Hooks | Theming, i18n & Shared Utilities | shared-types-utils-hooks |
| Theme System | Theming, i18n & Shared Utilities | theme-system |
| Internationalization (14 locales) | Theming, i18n & Shared Utilities | internationalization |

Context file lists: `GET http://localhost:3000/api/contexts?projectId=39de516e-059b-4b1a-86ad-f28e8abddaf7` (contexts are ordered; remaining = the FAILED three at indices 32/33/31-order + everything from "Execution History" onward).

## After scan completes
1. Verify counts two ways (grep `^> Total:` sum vs `^- \*\*Severity\*\*:` count) → build INDEX.md (totals, per-context table, criticals list, themes, wave plan).
2. Then wave-based fixes (user pre-approved "scan+triage+fix"), branch `vibeman/ambiguity-ui-scan-2026-07-16-fixes` off master, atomic commit per finding, tsc+vitest gate per wave vs baseline (0 / 64-64).

## Themes emerging so far (for INDEX triage)
- Context-map drift: phantom files in Why Agents (12/22 retired), Homepage (3), Feature Voting (3), Public Roadmap (PhaseCard), Observability Deck (2), preview todo page; unmapped files exist too (FeatureVotingGrid, guide companion.ts)
- Reduced-motion users get permanently EMPTY animated sections (PulseGridDeck, Persona Matrix) instead of static content
- Pause/hover state conflation in auto-playing demos (tour pause desync, race mouse-leave cancels user pause, trigger wheel overrides selection)
- Unnamed interactive controls / WCAG 4.1.2 (progress-bar buttons, icon-only tabs, click-only motion.div cards)
- Conversion path defects: PrimaryCTA drops onClick when href set (untracked downloads), hero #download anchor missing with env unset, waitlist stuck on timeout, dead navbar DownloadModal options
- Dead/unwired surface: /api/roadmap zero consumers, SetupCTA/CopyButton never imported, dead Reply buttons
- Hydration/SSR: hash-read in useState initializer (EventBusShowcase), ssr:false anchors breaking deep links (/how), blog future-post 404 caching
