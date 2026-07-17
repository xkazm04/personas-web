# Fix Wave 6 — Fabricated data with real-mode authority (theme T2)

> 5 commits, 5 findings closed (5 High; 1 partial + deferred sub-item).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Finding closed | File(s) |
|---|---|---|---|
| 1 | `2cd5921` | dashboard-shell-chrome #1 | DashboardNavigation.tsx |
| 2 | `d89365c` | observability-charts-sla #3 | PerformanceView.tsx |
| 3 | `ae706a9` | event-bus-monitoring #3 | EventBusStats.tsx, EventDetailDrawer.tsx |
| 4 | `90f353e` | knowledge-base #1 (partial) | mock-dashboard-data.ts, useKnowledgeData.ts, MemoryCard.tsx |

(Note: the mock compare/annotation leak — observability-charts-sla #1, the T2 flagship — was already closed in Wave 2 commit `c31814f`.)

## What was fixed

1. **Nav badges mixed mock + real** — Messages/Incidents/Health sidebar badges came from hardcoded `MOCK_UNREAD_MESSAGES`(7)/`MOCK_OPEN_INCIDENTS`/`MOCK_HEALTH_ALERTS` unconditionally, so real tenants saw phantom alert counts that never cleared. Gated those three to demo mode; reviews/executions (real store-backed) unchanged.
2. **Fake "Run analysis"** — the button showed a 3s spinner with no API call and no re-fetch (false reassurance on a health surface). Now calls SWR `mutate()` to genuinely revalidate; spinner derives from real `isValidating`.
3. **EventBus fake-live + frozen drawer** — `EventBusStats` hardcoded `connected = useState(true)`, contradicting the real header indicator; now reads `useEventStore.connectionStatus` and tags the illustrative counters "Demo". `EventDetailDrawer` initialised eventType/duration/timestamp in mount-scoped `useState(random)`, so every node showed the identical event; now derived deterministically per `node.id`.
4. **Knowledge invented "0 uses"** — synced memories hardcoded `usageCount: 0` + a `lastUsed`, rendered as measured fact. Fields are now optional, left undefined for synced data, and the card omits the segment.

## Deferred sub-item (tracked)

knowledge-base #1 also covers unknown synced `knowledge_type` / memory category being coerced to `tool_sequence`/`config` instead of an explicit "other" bucket. Deferred: it requires expanding the two display unions across ~4 icon/label config maps (`KNOWLEDGE_TYPE_CONFIG`, `KNOWLEDGE_CLUSTER_TYPE_CONFIG`, `typeConfig`, title pools). Foldable into a later knowledge-focused wave. Also open from the same context: knowledge-base #2 (cluster legends hardcoded to mock).

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 10–11)

10. **Mock fixture rendered unconditionally in a demo/real app** — any `MOCK_*` constant read without an `isDemo`/data-source gate shows fabricated data to real tenants. Gate at the read; badge illustrative-but-kept surfaces ("Demo"); never fabricate alert/health counts.
11. **Fabricated placeholder ≠ zero** — when a real projection doesn't track a field, make it optional and omit it in the UI; don't emit `0`/`active`/`false` that render as measured fact. And derive per-entity mock values from a stable id, not mount-scoped `useState(random)` (which freezes one value for all entities).

## What remains

T3 mode-switch cache contract, T7 error/loading states (dashboard-home #1/#2), T6 pause/interrupt, and the T8–T15 tail per INDEX.md. Small deferred sub-items: knowledge type-bucket + legends.
