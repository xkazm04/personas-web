# Desktop ↔ Web Parity Matrix

One row per major desktop capability, judged against what the marketing site
actually surfaces today (guide topics, feature sections, demo dashboard,
data files). Compiled during the Truth pass (T.1–T.5) against desktop
**v1.1.0** (2026-08-07).

**Refresh cadence:** re-derive this matrix whenever the desktop repo's
`.claude/guide-sync-marker.json` `lastSyncCommit` moves, or on any new
`## [Unreleased]` arc landing in the desktop `CHANGELOG.md` — whichever
comes first. `node scripts/check-guide-coverage.mjs --json` (drift section)
is the cheap first signal that a row here is out of date.

**Web quality tiers:** `flagship` (a designed, differentiated surface),
`solid` (accurate and complete but conventional), `thin` (mentioned or
partially covered, materially behind the desktop), `absent` (no web surface).

| Capability | Web surface(s) | Web quality tier | Desktop maturity | Verdict |
| --- | --- | --- | --- | --- |
| Athena (companion) | Guide category `companion` (8 topics), marketing feature sections | solid | Very high — conversational fleet dispatch, canvas steering, model routing, constitution v49, cross-device jobs | **upgrade** — guide is pre-fleet-dispatch (reviewed 2026-06-14); the "operates the app" story now undersells reality |
| Factory / Ship / passport | None (no guide category, no feature section) | absent | High — passports, populate lanes, Ship exit criteria + forecasts, `/ship-milestone` skill | **create** — the flagship dev-tools story has zero web presence |
| Mastermind canvas | None | absent | High — final Hex Mosaic, primary dev channel, Athena reads/steers it | **create** — visually strongest desktop surface; natural marketing hero |
| Fleet | `dev-tools-grid/athenaFleetData.ts` marketing card; `FleetOptimizationCard` in demo dashboard | thin | High — live-slot scheduler, headless sessions, parked-state classifier, completion reporting | **upgrade** — one card can't carry a whole execution product; guide has no Fleet topics |
| Personas core (agents, prompts, editor) | Guide `agents-prompts` (12 topics) + `testing` (12), agent feature sections, demo dashboard | flagship | Very high — Design hub, Foundry, matrix/lab, recipes | **upgrade (content)** — surfaces are strong but reference retired Prompt/Connectors/Health tabs; re-review against the Design-hub editor |
| Overview dashboard | Guide `monitoring` (15 topics), demo `/dashboard` on mocks | solid | High — Incidents, Patterns/Extracted/Graph, Reliability, Director, Leaderboard | **upgrade** — guide predates the Knowledge-tab dissolution; demo dashboard diverges from real IA |
| Vault / connectors | Guide `credentials` (7 topics), `/connections` route, `src/data/connectors.ts` catalog | flagship | High — broker, gcloud CLI capture, re-auth recovery, API-update feeds | **upgrade (content)** — add broker + CLI-auth + marketplace-events coverage; structure is fine |
| Teams / Studio | Guide `pipelines` (12 topics), `team-canvas` marketing section | solid | High — Projects section (Manage/Lifecycle/Factory/Competition/Mastermind), Slack bridge, goal views | **redesign** — web still tells a "pipeline canvas" story; desktop reorganized around Projects; Slack bridge unmentioned |
| Memory (agent + team) | Guide `memories` (10 topics), `MemoryLayers` feature sections | flagship | Very high — reflection, value-aware recall, decay, reflection→backlog bridge | **upgrade (content)** — add reflection/decay topics; the visual surfaces remain strong |
| Twin | None (plugin mentioned nowhere in guide) | absent | Medium-high — profiles, tone, training corpus, channels, portable export | **create (thin)** — one guide topic + plugins-page card is enough for now |
| Knowledge / RAG | Overview guide mentions only; no dedicated topics | thin | Medium-high — KB supersede-on-reingest, rebuild index, relevance floor, clipboard intelligence | **upgrade** — fold into `memories` category as 2–3 topics rather than a new category |
| Triggers | Guide `triggers` (10 topics), marketing sections | solid | Stable — per-agent settings, Chain Studio, marketplace events | **upgrade (content)** — remap done in T.3; content still describes a standalone "Builder" that doesn't exist |
| Health / SLA | Guide topics under `monitoring`/`troubleshooting`, `healing-circuit` section | solid | High — one health formula, honest composite, SLA breach events, measured cascade | **upgrade (content)** — breach events + honest-scoring story is marketable and undocumented |
| Portability (workspace export) | None | absent | High — 7 export scopes incl. encrypted Twin + Athena memory, conflict resolution | **create** — "your workspace travels with you" is a trust feature worth a topic + section |
| Devices / P2P | None | absent | New (v1.1.0) — pairing, cross-device Athena jobs, home device | **create (thin)** — one guide topic; too new for a marketing section |
| Platform tiers (Starter/Team/Builder) | Guide `interface-modes` topic, pricing page feature groups | solid | Stable — tier gates in nav registry | **skip** — aligned; revisit only if tier boundaries move |

## Notes

- "Desktop maturity" is judged from the desktop `CHANGELOG.md` Unreleased
  section and feature docs, not from code review of each subsystem.
- Verdicts marked *(content)* mean the web surface's structure/design is
  right and only the copy/topics need work; bare **upgrade** implies the
  surface itself is undersized for the capability.
- The demo dashboard (`/dashboard/*`) is mock-driven by design
  (`src/lib/mockApi.ts`); parity there means *shape* parity with the desktop
  IA, not live data.
