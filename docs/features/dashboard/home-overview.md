# Mission Control (Dashboard Home)
> The Overview section's first view: an annunciator wall of eight fleet-health dimensions, in sync with the desktop app's Mission Control · **Route:** `/dashboard/home` (`?dim=<id>` opens a dimension) · **Nav:** Overview › Mission › Mission Control · **Status:** Demo-only (mocks); dimensions with a synced source also read in real mode

## What it does
One screen answers *is the fleet fine, and if not, where*. Eight cells in a 4×2 wall (2 per row below `xl`, 1 below `sm`), each a question with one verdict:

| # | Dimension | Question | Verdict rule | Figure · evidence |
| --- | --- | --- | --- | --- |
| 1 | Outcomes | Are runs succeeding? | ≥90% steady, ≥75% watch, else needs you | success % · runs / failed |
| 2 | Agents | Is any agent struggling? | any critical → needs you, any degraded → watch | mean score /100 · outage / degraded / operational |
| 3 | Waiting on you | What needs your hand? | anything waiting → waiting on you | total · alerts / reviews / memory / unread |
| 4 | Self-healing | Is the fleet fixing itself? | a paused agent → needs you, open issues → watch | open · open / paused / auto-fixed |
| 5 | Spend | Is spend behaving? | any cost spike → watch | $ total · spikes, or $ per day |
| 6 | Autonomy | What runs without you? | nothing scheduled → watch | scheduled · next run in |
| 7 | Vault | Are credentials sound? | an access anomaly → needs you, overdue rotation → watch | overdue + anomalies · overdue / anomalies / events |
| 8 | Instruments | Is this page up to date? | a source failed → watch | ok/total sources |

Verdicts are `pending` (measuring), `failed` (unavailable), `unmeasured`, `ok` (steady), `watch`, `yours` (waiting on you), `act` (needs you). Only watch / yours / act **light** a cell (a tint and ring in the verdict colour); a steady cell stays quiet. Only `act` pulses, and never under reduced motion.

Clicking a cell, or pressing **1–8**, opens layer 2: a rail of all eight on the left, the open dimension's evidence on the right (crumbs, lamp, figure, state, question). **↑/↓** walk the rail, **Esc** (or the crumb) returns to the wall and puts focus back on that cell. The open dimension is in the URL, so reload and the back button work.

Layer-2 evidence reuses the dashboard's cards: Outcomes → Traffic & Errors + execution heatmap; Agents → health digest + top performers; Waiting on you → triage pane + memory actions + approved work; Self-healing → fleet recommendation + healing issues; Spend → cost by day (spike days in warning colour); Autonomy → upcoming routines + fleet sessions; Vault → vault changes + rotation overview; Instruments → status ticker + per-source status.

On the desktop plane the review list is not served (`reviewStore.listNotServed`), so the Mission queue reads "not measured" (`queueReading` in `readings.ts`) and Triage shows the desktop note (`triageEmptyKind` in `useTriageQueue.ts`) instead of an all-clear. Demo sessions are unchanged.

## How it works
- **View** `src/components/dashboard/views/home/index.tsx`: header (title, greeting, the fixed 14-day window note, tour launcher), wall or detail by `useSearchParams().get("dim")`, `useWallKeys` (document keydown; ignored in inputs, dialogs and with modifiers) and `useWallFocus`. Opening from the wall is a `pushState`; moving along the rail is a `replaceState`, so Back closes the detail instead of replaying the rail.
- **Readings** `mission/readings.ts`: the pure model: `DIMENSION_IDS` (desktop order), `Reading<T>` (`pending | failed | unmeasured | ready`), per-dimension value shapes, `judge(id, reading)` with the desktop's verdict rules, `successPercent`, `gradeOf`. Unit-tested in `readings.test.ts`.
- **Hook** `mission/useMissionReadings.ts` fills the readings: `observability:daily` and `observability:health-issues` via SWR (shared keys with Observability), the review store (`pendingReviewCount`, fetched on mount), and `useUpcomingRoutines`. Agents, vault and the queue's alerts/memory/unread are demo fixtures and read **unmeasured / zero for a real tenant** rather than showing someone else's fleet. It also returns the per-source states that Instruments reports.
- **Presentation** `mission/dimensions.ts` (`describeDimension` → label, verdict, state word, figure, evidence, trace; `fill` for `{placeholder}` copy), `Lamp.tsx` (`VERDICT_TONE`: status tokens only), `WallCell.tsx` (+ the decorative `Trace` bars), `WallDetail.tsx`, `DimDetail.tsx`, `detailParts.tsx` (`HealingIssues`, `CostByDay`, `SourcesList`).

## Key files
| File | Role |
| --- | --- |
| `src/components/dashboard/views/home/index.tsx` | View: header, wall/detail switch, keys, focus |
| `src/components/dashboard/views/home/mission/readings.ts` | Dimensions, reading shapes, verdict rules |
| `src/components/dashboard/views/home/mission/useMissionReadings.ts` | Sources → readings, per-source state |
| `src/components/dashboard/views/home/mission/dimensions.ts` | Reading → what a cell shows |
| `src/components/dashboard/views/home/mission/WallCell.tsx`, `WallDetail.tsx`, `Lamp.tsx` | Layer 1 cell, layer 2 frame, status light |
| `src/components/dashboard/views/home/mission/DimDetail.tsx`, `detailParts.tsx` | Layer 2 evidence per dimension |
| `src/components/dashboard/views/home/home-page/*` | Cards reused as evidence (heatmap, top performers, triage, routines, vault, ticker…) |
| `src/components/dashboard/views/home/home-page/useTickerItems.ts` | Builds the ticker's frames (shown in Mission Control's detail); owns the demo gate on providers + next routine; the provider count applies the Settings allow-list overrides (`countAllowedProviders`) |

## Data & state
- **Copy:** `t.dashboard.missionControl`, `t.dashboard.home.mission.*` (verdict words, dimension labels and questions, evidence templates, detail captions); translated in all 14 locales. Evidence templates use "Label {n} · label {n}" so no locale needs plural rules.
- **Window:** a fixed 14 days (the observability daily series). The view is **unscoped** in `spa/views.ts`, so the scope bar does not show; the header says which window the readings cover.
- **State:** the open dimension lives in the URL only. Everything else is derived per render from SWR / stores; `useLiveClock` supplies `now` (React 19 purity).

## Integration points
- Rendered by the dashboard SPA (`spa/viewRegistry.tsx`), kept alive across view switches.
- Guided tour: the wall carries `dashboard-vitals`; cells carry `dashboard-activity` (Outcomes), `dashboard-heatmap` (Agents), `dashboard-intelligence` (Waiting on you), `dashboard-fleet` (Self-healing), `dashboard-instruments` (Instruments) via `TOUR_ANCHORS`.
- Desktop reference: `personas/src/features/overview/sub_missionControl/variants/annunciator-wall/` and `variants/shared/readings.ts`.

## Conventions & gotchas
- **The tour's home narration (`public/tour/dashboardHome.mp3`) was recorded against the old cockpit** (vitals, fleet card, instruments bay). Its spotlights now land on the closest wall cells, but the words describe the previous layout until the clip is re-recorded.
- The desktop wall has its own 7/30/90-day switch and persona filter; the web wall does not yet (no view honours `dashboardFilterStore` for real).
- "Fixes held" (the desktop's healing hold rate) has no web source; Self-healing shows auto-fixed counts instead.
- Trace bars are decorative (`aria-hidden`); the figure and evidence line carry the reading.

## Related docs
- [Dashboard Shell, Chrome & Realtime](shell-chrome.md)
- [Personas](personas.md)
- [Feature index](../INDEX.md)
