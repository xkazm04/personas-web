# On the desktop plane, every read the desktop does not serve reads as "not served" or "not measured", never as empty, zero, failed or all-clear

## Context

This extends `2026-10-07-desktop-plane-list-read-not-served.md` (not edited), which settled the rule for list reads (`1bafec99`). Four merges carried it to every other read the plane does not serve. Facts below are checked at `dcd48e54`.

The desktop serves no observability, usage or subscription read. `src/app/api/orchestrator/desktopShapes.ts:29` (`GET /api/personas/:id/subscriptions`), `:36` (`GET /api/observability`) and `:37` (`GET /api/usage`) are `not_on_desktop`, and the proxy answers them with the typed 501 (`2026-10-07-proxy-typed-501-not-on-desktop.md`). Live proofs stay parked, so none of this was run against a desktop; the claims rest on code and unit tests.

What each reader showed before its commit, taken from the commit messages and diffs:

- Mission queue: a ready `0`, a green all-clear. Triage: a check mark (`a32e78e8`).
- Mission outcomes, recovery and spend dims: failed, with raw API text. Ticker alerts item: a green "all clear" (`e5890dd0`).
- Subscriptions panel: "no subscriptions" plus a create button whose POST gets a 501. The base `listAllSubscriptions` also choked on the persona envelope (`489bc548`).
- Instruments: Failed, with a raw "API 501". Performance and Usage: a raw error banner over empty charts. The sparklines sent the 501 to Sentry (`dcd48e54`).

## Decision

A 501 `not_on_desktop` on any read reads as "not served" or "not measured". It is not shown as empty, zero, failed or all-clear, and it is not reported as an error. Per commit:

- **`a32e78e8`, review list.** `queueReading` returns `unmeasured` when `listNotServed` is set (`views/home/mission/readings.ts:151`; wired at `useMissionReadings.ts:154`, demo excluded). `triageEmptyKind` returns `"unserved"` for an empty queue on a non-served list (`home-page/useTriageQueue.ts:78-80,87`), and `TriagePane.tsx:105` shows the desktop note instead of the check mark.
- **`e5890dd0`, observability.** `fromSwr` maps a 501 to `unmeasured` and any other error to `failed` (`readings.ts:181`), so outcomes, recovery and spend read unmeasured (`useMissionReadings.ts:135,158,159`). `useOpenAlertCount` leaves its count `null` on a 501 and does not capture it (`home-page/useOpenAlertCount.ts:36`); the ticker drops the alerts item while the count is `null` (`home-page/useTickerItems.ts:87-88`), so it shows neither a count nor an all-clear.
- **`489bc548`, subscriptions.** `desktopApi.listAllSubscriptions` and `listSubscriptions` reject locally with a 501 and send no request (`src/lib/desktopApi.ts:131-145`). `eventStore.subscriptionsNotServed` is set on a 501 and cleared by the next success (`eventStore.ts:355,358`). `SubscriptionsPanel` returns the desktop note, and so no create button, while it is set and no subscriptions are held (`SubscriptionsPanel.tsx:90`).
- **`dcd48e54`, Instruments, Performance, Usage, sparklines.** The four choices below.

## The choices `dcd48e54` made

**(a) The Instruments denominator.** `sourceOf` gives a 501 the status `unserved` with no error text (`readings.ts:195-199`). `instrumentsReading` leaves unserved sources out of `ok` and `total`, and with none served it returns `unmeasured` (`readings.ts:206-211`). The reviews source is `unserved` when the review list is not served (`useMissionReadings.ts:176-181`); the list renders it with the "unmeasured" label and no error text (`detailParts.tsx:104-120`).
Lost:
- Count unserved as failed. That was the old behaviour: a false alarm for a read that is not broken.
- Count unserved as ok. A false all-clear for a source nobody measured.
- Keep it in `total` but not in `ok`. It reads as "3 of 4", a partial failure, which is the same false alarm in a milder form.

**(b) Performance and Usage replace the whole page with `DesktopUnsupportedNote`** on a 501 when no data is held (`views/observability/PerformanceView.tsx:90`, `UsageView.tsx:133`). A 501 while data is held, and every other error, keep the banner. Lost: the banner over empty charts, which says "error" and then draws a chart of nothing.

**(c) A 501 is not sent to Sentry** from `useSparklines` (`performance-view/useSparklines.ts:72`). The error state still sets (line 73), so the banner path is unchanged. It is a known answer, not an exception, and `useOpenAlertCount` (`:36`) follows the same rule.

**(d) `isNotServed` is the one predicate** (`readings.ts:171`: an `ApiError` with status 501). `PerformanceView`, `UsageView`, `useSparklines` and `useOpenAlertCount` import it instead of copying it. The two stores (`reviewStore.ts:469`, `eventStore.ts:153,358`) still test the status inline, as they did before; this record does not move them.

## Alternatives that lost

- **A desktop `management_api` route that serves observability and usage** (in personas). It would give the pages real data. It is cross-repo work and cannot be proven while the live proofs are parked. When it lands, the `desktopShapes` entries and the readers' 501 handling change together.
- Per-choice alternatives are listed above under (a) and (b).

## Still open

Re-derived from the code at `dcd48e54`, not copied from an earlier list.

1. **Events page tab counts.** `views/events/index.tsx:52-53` still passes `events.length` and `subscriptions.length`, so on the desktop plane the tabs read 0. A delivery for this was dispatched in parallel and had not merged when this record was written; this record does not describe its change.
2. **Reviews nav badge.** `DashboardNavigation.tsx:102` shows the badge only when `pendingReviewCount > 0`. A 501 sets only `listNotServed` (`reviewStore.ts:469`); the count stays at its initial `0` (`reviewStore.ts:437`). On the desktop plane the badge is therefore hidden, which reads like "nothing pending". It does not show a wrong number, but it does not say "not served" either.
3. **Sparkline banner edge.** `PerformanceMetricsGrid.tsx:27` shows `DashboardErrorBanner` with the sparkline error, and `useSparklines.ts:73` keeps the raw message, so a 501 would show "API 501" there. That only shows if `PerformanceView` held data: with none, the page is already the note (`PerformanceView.tsx:90`). On a plane where observability is not served it cannot hold data. Recorded as a known edge, not fixed.
4. **`useLatencyData`** reads `listExecutions` (`performance-view/useLatencyData.ts:84`), which the desktop serves (`desktopShapes.ts:22`). It is not a case of this rule.

## Consequences

- A new unserved read of any shape needs a table entry, a local rejection or 501 handling at its reader, and a unit test; use `isNotServed` rather than a new check.
- A reader that does not handle the 501 shows the old false states (failed, zero or all-clear).

## Evidence

personas-web: `a32e78e8`, `e5890dd0`, `489bc548`, `dcd48e54`. Extends `2026-10-07-desktop-plane-list-read-not-served.md` (`1bafec99`, `255713c5`) and `2026-10-07-proxy-typed-501-not-on-desktop.md`.
