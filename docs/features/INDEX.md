# Feature Documentation

This tree documents every feature and module in **personas-web**, one document per
logical submodule (following the app's own navigation and route structure — not the
coarser groupings in `context-map.json`). It serves two audiences at once:

- **Product / user overview** — the `What it does` section at the top of every doc is
  plain-language: what the feature is, what you can see and do, why it exists.
- **LLM-CLI development reference** — the remaining sections (`How it works`, `Key files`,
  `Data & state`, `Integration points`, `Conventions & gotchas`) give Claude Code (or any
  developer) the exact files, state, routes, and repo conventions needed to work in the area.

> **Scoping rule for development:** to change a feature, open its doc here, work within the
> files it lists, and obey the conventions it calls out. This complements `context-map.json`
> (which maps files → contexts) by adding the *what / how / why* per submodule.

## How docs are organized

Docs are grouped into folders that mirror the app. A context in `context-map.json` that
bundles multiple distinct surfaces (e.g. `Messages & Settings`, `Observability Charts & SLA`)
is **split** into one doc per surface, so each navigable submodule stands on its own.

## Doc template

Every feature doc follows this shape:

```
# <Feature Name>
> one-line summary · Route · Nav label · Status (Live | Demo-only mocks | Static)

## What it does          → user-facing overview
## How it works          → architecture & behavior for devs
## Key files             → table: file → role
## Data & state          → source (mock/live), stores, API routes, types
## Integration points    → what it depends on / what depends on it
## Conventions & gotchas → i18n, tokens, animation gating, React 19, demo caveats
## Related docs          → sibling links
```

## Index

Status legend: ✅ written · ⬜ planned

### dashboard/ — Agent Operations Dashboard (all routes are **demo-only**, backed by mocks)

| Doc | Route | Nav label |
| --- | --- | --- |
| ✅ [home-overview](dashboard/home-overview.md) | `/dashboard/home` | Overview |
| ✅ [agents](dashboard/agents.md) | `/dashboard/agents` | Agents |
| ✅ [executions](dashboard/executions.md) | `/dashboard/executions` | Executions |
| ✅ [events](dashboard/events.md) | `/dashboard/events` | Events |
| ✅ [reviews](dashboard/reviews.md) | `/dashboard/reviews` | Reviews (Human Review) |
| ✅ [messages](dashboard/messages.md) | `/dashboard/messages` | Messages |
| ✅ [observability](dashboard/observability.md) | `/dashboard/observability` | Observability |
| ✅ [leaderboard](dashboard/leaderboard.md) | `/dashboard/leaderboard` | Leaderboard |
| ✅ [sla](dashboard/sla.md) | `/dashboard/sla` | SLA (Incidents) |
| ✅ [incidents](dashboard/incidents.md) | `/dashboard/incidents` | Incidents |
| ✅ [knowledge](dashboard/knowledge.md) | `/dashboard/knowledge` | Knowledge |
| ✅ [settings](dashboard/settings.md) | `/dashboard/settings` | Settings |
| ✅ [shell-chrome](dashboard/shell-chrome.md) | `/dashboard/*` | (layout, sidebar, realtime) |

### marketing/ — Marketing & Landing

| Doc | Surface |
| --- | --- |
| ✅ [homepage-hero](marketing/homepage-hero.md) | Hero, command-center, stat row, social proof |
| ✅ [why-agents](marketing/why-agents.md) | Agent-vs-workflow scenario duels |
| ✅ [use-cases](marketing/use-cases.md) | Agent-army grid + tool selection |
| ✅ [features-overview](marketing/features-overview.md) | `/features` page + vision grid |
| ✅ [pricing](marketing/pricing.md) | Pricing tier cards |
| ✅ [get-started](marketing/get-started.md) | Get-started steps + download CTA |
| ✅ [faq](marketing/faq.md) | FAQ accordion |
| ✅ [footer](marketing/footer.md) | Footer + primary CTA |
| ✅ [guided-tour](marketing/guided-tour.md) | Athena guided product tour |

### product-showcase/ — Product Feature Showcase (homepage feature sections)

| Doc | Surface |
| --- | --- |
| ✅ [observability-deck](product-showcase/observability-deck.md) | Live pulse-grid deck |
| ✅ [security-vault](product-showcase/security-vault.md) | Security vault pillars |
| ✅ [agent-lab](product-showcase/agent-lab.md) | Arena / chat / eval / evolution tabs |
| ✅ [plugin-ecosystem](product-showcase/plugin-ecosystem.md) | Plugin grid + second brain |
| ✅ [memory-layers](product-showcase/memory-layers.md) | Geological memory stack |
| ✅ [multi-provider-ai](product-showcase/multi-provider-ai.md) | Multi-provider routing |
| ✅ [design-engine](product-showcase/design-engine.md) | Design-engine intent matrix |
| ✅ [healing-circuit](product-showcase/healing-circuit.md) | Self-healing circuit |
| ✅ [trigger-system](product-showcase/trigger-system.md) | Trigger automation wheel |

### demos/ — Interactive Demos & Playground

| Doc | Surface |
| --- | --- |
| ✅ [flow-composer](demos/flow-composer.md) | Visual flow composer + `/playground` |
| ✅ [orchestration-hub](demos/orchestration-hub.md) | Orchestration hub graph |
| ✅ [event-bus-showcase](demos/event-bus-showcase.md) | Animated event-bus showcase |
| ✅ [platform-layers](demos/platform-layers.md) | Platform layer stack |
| ✅ [platform-command](demos/platform-command.md) | Terminal/CLI command sequence |
| ✅ [agents-timeline](demos/agents-timeline.md) | Agent execution timeline race |
| ✅ [agent-playground](demos/agent-playground.md) | Playground terminal demo |
| ✅ [agents-chat](demos/agents-chat.md) | Multi-agent chat race |
| ✅ [playground-split](demos/playground-split.md) | Split-view playground |
| ✅ [playground-timeline](demos/playground-timeline.md) | Pipeline timeline sim |
| ✅ [preview-harness](demos/preview-harness.md) | Section preview/demo harness |

### guide/ — Product Documentation (Guide)

| Doc | Surface |
| --- | --- |
| ✅ [pages-navigation](guide/pages-navigation.md) | Guide hub, sidebar, search, TOC |
| ✅ [data-content](guide/data-content.md) | English source content + search index |
| ✅ [content-blocks](guide/content-blocks.md) | Markdown renderer + rich blocks |
| ✅ [localized-content](guide/localized-content.md) | 13-locale guide translations |

### content/ — Content & Informational Pages

| Doc | Surface |
| --- | --- |
| ✅ [blog](content/blog.md) | Blog index, articles, RSS |
| ✅ [how-it-works](content/how-it-works.md) | How-it-works + changelog |
| ✅ [legal](content/legal.md) | Privacy / terms / cookies |
| ✅ [security](content/security.md) | Security & compliance page |

### community/ — Roadmap, Voting & Waitlist

| Doc | Surface |
| --- | --- |
| ✅ [public-roadmap](community/public-roadmap.md) | Public roadmap (Supabase) |
| ✅ [feature-voting](community/feature-voting.md) | Voting, comments, requests |
| ✅ [waitlist-download](community/waitlist-download.md) | Waitlist + app download |
| ✅ [vote-persistence](community/vote-persistence.md) | Server-side vote store |

### connectors/ — Connectors & Templates

| Doc | Surface |
| --- | --- |
| ✅ [catalog](connectors/catalog.md) | Connectors catalog page |
| ✅ [detail-modal](connectors/detail-modal.md) | Per-connector detail modal |
| ✅ [templates-gallery](connectors/templates-gallery.md) | Template gallery + detail |

### platform/ — Platform Foundation, Theming & i18n

| Doc | Surface |
| --- | --- |
| ✅ [layout-navigation](platform/layout-navigation.md) | Root layout, navbar, page shell |
| ✅ [shared-ui-primitives](platform/shared-ui-primitives.md) | Brand cards, terminal, icons, illustrations |
| ✅ [animation-motion](platform/animation-motion.md) | Motion system + gating hooks |
| ✅ [mobile-app-shell](platform/mobile-app-shell.md) | `/m` mobile experience |
| ✅ [theme-system](platform/theme-system.md) | Multi-variant theme system |
| ✅ [internationalization](platform/internationalization.md) | 14-locale UI bundle |
| ✅ [shared-utilities](platform/shared-utilities.md) | Types, hooks, formatting, validation |

### infrastructure/ — Infrastructure & Telemetry

| Doc | Surface |
| --- | --- |
| ✅ [orchestrator-client-mocks](infrastructure/orchestrator-client-mocks.md) | API client + demo mocks |
| ✅ [authentication-session](infrastructure/authentication-session.md) | Demo auth + guards |
| ✅ [supabase-client](infrastructure/supabase-client.md) | Optional anon-key client |
| ✅ [error-monitoring-analytics](infrastructure/error-monitoring-analytics.md) | Sentry + analytics |
| ✅ [seo-metadata](infrastructure/seo-metadata.md) | OG images, sitemap, robots, manifest |
| ✅ [build-e2e-tests](infrastructure/build-e2e-tests.md) | Next/Playwright config + e2e specs |

---

*Generated to mirror `context-map.json` (53 contexts / 12 groups), split per submodule.
When a feature's files change, update its doc here alongside the code.*
