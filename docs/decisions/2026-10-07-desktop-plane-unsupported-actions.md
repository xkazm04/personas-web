# On the desktop data plane, pause, resume, chat send and review verdicts are explicitly unsupported and disabled before the click

## Context

This extends `2026-10-07-desktop-data-plane-client-backend.md`, which is not edited. That record ended with a known gap: the plane's gate reports `online` from the health probe alone, so the UI could offer pause, resume, chat send and review verdicts while they answered 501, and "closing that is not part of this decision".

`4faf868e` states the problem: on `NEXT_PUBLIC_DATA_SOURCE=desktop` the probe says online, but these four can only fail (501 or `not_on_desktop`), so their controls were enabled and failed on click. The reasons, per `desktopUnsupported.ts`: `desktopApi` does not override `pausePersona`, `resumePersona` or `sendChatMessage`, so `realApi` throws a 501; `decideReview` sends `PUT /api/events/:id`, a `not_on_desktop` shape in `desktopShapes`.

## Decision

One pure table, `DESKTOP_UNSUPPORTED_ACTIONS = ["pause", "resume", "chatSend", "reviewVerdict"]`, with `desktopUnsupported(action, tier, desktopPlane)` in `src/lib/sync/desktopUnsupported.ts` (`4faf868e`). It is true only on the desktop plane while the tier is `online`. The existing gates read it: the persona row, the chat composer and panel, `useReviewGate`, `verdictsEnabled` (a third argument, `desktopPlane`, default false) and `useSyncReachability`. The four controls are disabled before the click and no request is sent.

`0c3eab70` adds the reason: one owner-approved line, `mobileCopy.reach.desktopUnsupported` (English-only pending `mobile` namespace), shown on the persona row, as the chat composer hint, and as a note where the review notice sits. `docs/features/dashboard/personas.md` and `reviews.md` record the gate.

A test, `desktopUnsupported.test.ts`, pins the table to the code that makes each entry true. Pause, resume and chat send must reject with an `ApiError` 501 through `createDesktopApi` and never call the fetcher. The review verdict must resolve to a `not_on_desktop` shape through `matchDesktopShape`. Run and cancel must not be in the table, because the desktop serves them. The table cannot drift from `desktopApi` and `desktopShapes` without the test failing.

## Alternatives that lost

- **Leave the controls enabled and let the click fail with the 501.** The state before `4faf868e`. It lost because the failure was the only signal the user got.
- **Implement the four on the desktop plane.** Not recorded as weighed. The commits make them unsupported because the desktop's local API does not serve them, and do not discuss building them.
- **Show the controls enabled with a warning.** Not recorded.

## Open, not decided

- The list read `listEvents` still gets a 501 (`not_on_desktop`) on this plane. The table covers the four actions only, and no commit in this record gates or empties that read.
- On the offline tier review verdicts stay enabled as before: the test asserts `verdictsEnabled("offline", false, true)` is true, and `4faf868e` states offline "is already blocked by its own gate" for the other actions. Whether offline verdicts on the desktop plane should be disabled too is not decided here.
- Notes and the chat thread reads (`listNotes`, `listChatSessions`, `listChatMessages`) return empty arrays in `realApi` on this plane, as the earlier record states. They are not in the table.

## Consequences

- A new action the desktop does not serve needs a table entry and a pinning test case. A route the desktop later gains must be removed from the table in the same change, or the test fails.
- The gate is plane-wide and tier-specific: no other plane or tier changes (`4faf868e`, Risk line).
- The reason copy is English-only pending copy and needs translating when the `mobile` namespace moves into `en.ts` and the 13 locales.

## Evidence

personas-web: `4faf868e` (table, gates, test), `0c3eab70` (reason copy, docs). Files: `src/lib/sync/desktopUnsupported.ts`, `src/lib/sync/desktopUnsupported.test.ts`, `docs/features/dashboard/personas.md`, `docs/features/dashboard/reviews.md`. Extends `2026-10-07-desktop-data-plane-client-backend.md`.
personas: none.
