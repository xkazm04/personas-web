# Verdict - 2026-10-15-demo-dashboard

Judge: claude-opus-5-5 (caller session), read `pool.md` blind. 26 proposals (18 round 1, 8
round-2 fusions) from 4 live seats; every anchor resolved at 23b2b075.

## Premises verified in code (23b2b075)

| claim | result | where |
|---|---|---|
| `useDashboardFilterStore` has no view consumer; scope bar is a claim | true | consumers: DashboardScopeBar, views.ts, clearUserCaches, storage-register only |
| Evidence chip drops the execution id | true | `KnowledgeEvidenceChip.tsx:16` `href="/dashboard/executions"` |
| Executions has no `?focus=`; row selection is local state | true | `views/executions/index.tsx:36` |
| `correlate()` has no production importer | true | grep: only `incidentCorrelate.test.ts` |
| Health fixes live in page-local `useState` | true | `views/health/index.tsx:33` |
| `MOCK_HEALTH_ALERTS` is an import-time constant | true | `mock-dashboard-data.ts:1747` |
| Fleet board imports no store / api / fixture | true | grep over `fleet-monitor/` empty |
| Board and Night shift each own a sim; tab switch resets | true | `board/index.tsx:67`, `night/useNightRuntime.ts:17`, `personas/index.tsx:136-137` |
| Magnitude break: board 1,634 runs today vs 47 runs / 14 d elsewhere | true | fleet.json sum; `mockData.ts:958` |
| Dashboard tour has no actions; ends with no bridge | true | `tour-script.ts:295-338`; `TourContext.tsx:108-116` |
| Spotlight overlay blocks clicks | true | `TourSpotlight.tsx:180` `fixed inset-0 z-[80]` |
| `review_decide` writes status + notes only | true | `mockCommandPlane.ts:88-100` |
| Desktop writes a learned memory on every verdict (decision 7 / constraint 8, "Human {verdict}: {title}") | true | `../personas/src-tauri/db/src/repos/communication/manual_reviews.rs:605-640` |
| Patterns cite another persona's run | partly | kp_1 Incident Responder -> e-0001-mock; ownership per seat, spot-checked one |
| Desktop also writes a Director verdict on review | false | flip_status writes none (P05's Director half dropped) |

## Triage

Score = value x confidence / effort weight (S 1, M 1.6, L 2.5). Peers = round-2 mean, own seat excluded.

| id | kind | premise | value | conf | effort | score | peers | disposition |
|---|---|---|---|---|---|---|---|---|
| P17 | deepen | true | 4 | 5 | S | 20 | 6.0 | kept -> D1 (lead) |
| P11 | deepen | true | 4 | 5 | S | 20 | 8.0 | kept -> D1 |
| P08 | deepen | true | 4 | 4 | S | 16 | 6.7 | kept -> D1 |
| P19 | connect | true | 4 | 4 | M | 10 | - | kept -> D1 + D4 |
| P22 | connect | true | 5 | 5 | M | 15.6 | - | kept -> D4 (lead) |
| P05 | connect | partly | 4 | 3 | M | 7.5 | 5.0 | kept -> D4 (Director half dropped: desktop writes none) |
| P25 | connect | true | 5 | 4 | M | 12.5 | - | kept -> D2 (lead) |
| P16 | connect | true | 4 | 4 | M | 10 | 4.0 | kept -> D2 |
| P02 | leap | true | 4 | 3 | M | 7.5 | 5.0 | kept -> D2 |
| P12 | connect | true | 5 | 3 | L | 6 | 6.7 | kept -> D2 / L3 |
| P06 | connect | true | 5 | 3 | L | 6 | 7.7 | kept -> D2 (step 1) + L3 (steps 2-3) |
| P21 | deepen | true | 5 | 5 | M | 15.6 | - | kept -> D3 (lead) |
| P03 | deepen | true | 4 | 4 | S | 16 | 6.3 | kept -> D3 ("existing Undo" is false; P21 builds it) |
| P24 | deepen | true | 4 | 3 | M | 7.5 | - | kept -> D3 (verification-run detail as option) |
| P01 | connect | true | 3 | 5 | S | 15 | 6.7 | kept -> S1 |
| P15 | connect | true | 3 | 5 | S | 15 | 5.3 | kept -> S1 (lead: explicit empty vs not-served) |
| P09 | deepen | true | 5 | 4 | M | 12.5 | 7.3 | kept -> S2 (lead) |
| P18 | extend | true | 3 | 4 | M | 7.5 | 3.3 | kept -> S2 (end-on-verdict step) |
| P04 | extend | true | 3 | 3 | M | 5.6 | 5.0 | kept -> S2 / L1 |
| P20 | leap | true | 4 | 3 | M | 7.5 | - | kept -> S2 + L1 |
| P26 | leap | true | 4 | 4 | M | 10 | - | kept -> L1 (lead) |
| P07 | leap | true | 5 | 3 | L | 6 | 6.3 | kept -> L1 |
| P10 | extend | true | 4 | 3 | M | 7.5 | 5.7 | kept -> L2 |
| P23 | connect | true | 4 | 3 | L | 4.8 | - | kept -> L3 |
| P14 | leap | true | 4 | 2 | L | 3.2 | 4.3 | kept -> L3 (scrubber deferred) |
| P13 | leap | true | 3 | 2 | L | 2.4 | 4.0 | dropped |

## Clusters (cross-seat agreement)

- **Exact-row links + honest provenance** - P08, P11, P17, P19 (+P05, P22 link halves): 4 seats.
- **One fleet / one crew** - P02, P06, P12, P16, P25 (+P14, P23): 4 seats. Strongest signal.
- **Fix the cause, every surface settles** - P03, P21, P24, P26 (+P20): 4 seats.
- **Action-driven tour** - P04, P09, P18 (+P20): 3 seats.
- **Scope bar actually filters** - P01, P15: 2 seats.
- **Verdict -> learned memory** - P05, P19, P22: 3 seats.

## Dropped

- P13 rewind/branch: L, peers 4.0, the snapshot-branch machinery claims more than the desktop does; the
  drills leap covers "rehearse a bad night" more cheaply.
- P05 Director-verdict write: false premise (desktop writes none).
- P14 as a standalone scrubber: folded into L3; the shareable-moment part is carried by L1's `t=`.
- P02's Athena-chat write-through: no anchor for it; out of the crew bridge.

## Overrides of peer scores

- P18 (peers 3.3) kept inside S2: its end-on-the-visitor's-verdict step is the cheapest honest tour
  ending under the owner's no-CTA rule.
- P16 (peers 4.0) kept inside D2: peers objected to whole-roster renaming; P25's fusion (crew of five
  fleet ids, totals untouched) answers that objection.
