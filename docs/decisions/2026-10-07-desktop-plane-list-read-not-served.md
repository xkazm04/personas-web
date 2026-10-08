# On the desktop plane, a list read the desktop does not serve reads as "not served", never as empty

## Context

This answers the "Open, not decided" item of `2026-10-07-desktop-plane-unsupported-actions.md` (not edited): the list read `listEvents` still got a 501 on the desktop plane, and nothing gated or emptied it. Facts below are as of `255713c5`.

The desktop's management API serves no event list. `src/app/api/orchestrator/desktopShapes.ts:26` marks `GET /api/events` as `not_on_desktop`, and the proxy answers it with the typed 501 (see `2026-10-07-proxy-typed-501-not-on-desktop.md`). A desktop route cannot be proven end to end today: the live proofs are parked (`docs/features/infrastructure/desktop-web-paths.md:49`, "Live proofs parked").

Before `255713c5`, `reviewStore.fetchReviews` and `eventStore.fetchEvents` caught the 501 and left the old rows in place. The reviews and events pages therefore showed their ordinary empty state, which claimed there was nothing to review while the desktop may hold rows.

## Decision

On the desktop plane, a list read the desktop does not serve reads as "not served", never as empty or all-clear (`255713c5`).

- `desktopApi.listEvents` rejects locally with `ApiError(501, {error:"not_on_desktop", method:"GET", path:"/api/events"})` and sends no request (`src/lib/desktopApi.ts:123-126`).
- A test pins the override to the table: `src/lib/desktopApi.test.ts:67-69` expects `matchDesktopShape("GET", ["api","events"])` to be `not_on_desktop`.
- `reviewStore` and `eventStore` carry `listNotServed`. It is set on a 501 (`reviewStore.ts:469`, `eventStore.ts:151`), cleared by the next success (`reviewStore.ts:464`, `eventStore.ts:146`), left unchanged by any other error, and reset in `reset()` (`reviewStore.ts:529`, `eventStore.ts:387`).
- The reviews page (split pane and focus flow, `views/reviews/index.tsx:44,67,79-89`), `PhoneReviews` (`views/reviews/phone/PhoneReviews.tsx:44,96,99`) and `EventsListPanel` (`EventsListPanel.tsx:29,143`) show the existing `DesktopUnsupportedNote` once, in place of the empty state. They do so only while no rows are held, so rows already loaded from another source still show. On the reviews page the split pane and focus flow stay mounted but hidden (`hidden={unserved}`), because the split pane owns the poll.
- No copy key was added: the note is the existing one.

## Alternatives that lost

- **A desktop `management_api` route for events and manual reviews, in personas.** It would serve the real data. It lost for now because it needs a cross-repo shape mapping and cannot be proven live while live proofs are parked. It remains the way to make this path work later; when it lands, the `desktopShapes` entry, the `listEvents` override and its test change together.
- **Keep the silent empty state.** A false all-clear: it tells a reviewer there is nothing to review.
- **Hide the reviews and events pages on the desktop plane.** It removes the place where the reason is shown.
- **Keep sending `GET /api/events` through the proxy every poll and surface each 501.** A request every poll for an answer already known.

## What this ties and leaves open

Still reading the list as empty or zero on the desktop plane, as of `255713c5` (named by the builder of `255713c5`, then checked against the code):

- Home triage queue: `views/home/home-page/useTriageQueue.ts:81` reads `useReviewStore.reviews`.
- Mission queue reading: `views/home/mission/useMissionReadings.ts:98` reads `pendingReviewCount`.
- `views/events/index.tsx:49-52` passes `events.length` and `subscriptions.length` to the tab counts.
- `SubscriptionsPanel.tsx:22,35` derives its per-subscription event counts from `eventStore.events`.
- `DashboardNavigation.tsx:86` reads `pendingReviewCount` for the reviews badge. None of these reads `listNotServed`.
- `EventBusStats.tsx` was named, but it reads only `connectionStatus` from the store (line 72); its rates come from a local simulation (lines 13-28). It does not read the list, so it is likely not a case. Flagged, not settled.

The home triage and Mission queue are handled by a separate delivery dispatched on 2026-10-07, not merged when this record was written. This record does not measure that delivery's change.

## Context: RD-6

RD-6 is listed as open in `2026-10-07-phone-review-decide-desk-only-and-redacted-notes.md` and `2026-10-07-desktop-plane-review-verdicts-every-tier-and-pre-click-desk-only.md`. In the personas repo it is closed on `master` (read-only `git log`, `git show`, `git branch --contains`): `1b57ecb7e7` ("return the review from the decision write, not a second read") changes `record_review_decision`, and `685b8dd234` changes `dispatch_review_action` and `execute_resolve_human_review`. Neither was run here; the desktop is not up.

## Consequences

- A new unserved list read needs a table entry, a local rejection and a pinning test, like the four actions.
- A reader that wants the same honesty must read `listNotServed`; until then it shows zero.

## Evidence

personas-web: `255713c5`. personas: `1b57ecb7e7`, `685b8dd234`. Extends `2026-10-07-desktop-plane-unsupported-actions.md`.
