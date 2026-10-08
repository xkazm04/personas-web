# With NEXT_PUBLIC_DATA_SOURCE=desktop the client picks a desktop backend that maps the desktop's rows into the web's types

## Context

`api.ts` was written against the cloud orchestrator. The desktop's management API (`:9420`) answers differently: every `/api/*` reply is an envelope `{ success, data?, error?, code? }`, and its rows are snake_case (`GET /health` is the one unwrapped answer). The dashboard could not read that. The proxy cannot close the gap, because the typed-501 record forbids path rewriting there, and the same reasoning rules out reshaping bodies in a relay that carries the team key.

On the proxy side the desktop had also grown routes. Before `5ba5be0e`, `desktopShapes.ts` still answered three shapes with a typed 501. Personas `f64d96ca43` (as `5ba5be0e` describes it; its content was not re-read) added `POST /api/execute` (persona id in the body), `POST /api/executions/{id}/cancel` and `GET /api/status` to the management API.

## Decision

With `NEXT_PUBLIC_DATA_SOURCE=desktop` the client selects a desktop backend, `createDesktopApi(orchestratorFetch, realApi)` (`de81e2a4`, `src/lib/desktopApi.ts`). It unwraps the envelope and maps the desktop's rows into the web's own types. `api.ts` dispatches demo first, then `USE_SUPABASE ? supabaseApi : USE_DESKTOP ? desktopApi : realApi`, so demo still wins and unset or `supabase` behave as before. The proxy stays a verbatim relay. `ApiError` moved to `api-error.ts` (re-exported from `api.ts`) so `desktopApi` does not import `api.ts` at runtime.

The row mappers are shared, not copied (`bc17aac5`): `desktopRows.ts` was lifted out of `supabaseApi.ts` because the desktop answers the `PersonaExecution` row shape the sync mirror already maps. The same commit changed one mapping: the legacy desktop status alias `pending` now maps to `queued` (it was an unknown status that fell back to `running`). A field the desktop does not send gets its type's empty value (`''`, `0`, `null`), never an invented one. The desktop has no offset on `GET /api/executions`, so the client asks for `limit+offset` rows and drops the first `offset`.

What `5ba5be0e` changed on the proxy side: three entries in the `DESKTOP_SHAPES` table in `desktopShapes.ts`, from `not_on_desktop` to `served: "desktop"`. They are `POST /api/executions/:id/cancel`, `POST /api/execute` and `GET /api/status`. It changed table values only plus a header comment; `route.ts` was not touched and still relays verbatim, and no path is rewritten. The two shapes the typed-501 record named as examples of "same job, different route" became served because the desktop gained those exact method-and-path routes, not because the proxy learned to translate.

The plane has its own online gate (`47c0980c`, `6a0c849f`). `useSyncReachability` calls `api.getHealth()` when the tab becomes visible and every `DESKTOP_PROBE_MS` (30 s) while it stays visible, never while hidden, and only when signed in and not demo. An answered probe stamps `desktopSeenAt`; a rejected one is swallowed and the old stamp ages out. `computeReachability` returns `online` while `now - desktopSeenAt <= DEVICE_FRESH_MS` (120 s) and `offline` otherwise. Before `47c0980c` every non-supabase plane read as `never-synced`, so a signed-in user on the desktop plane got the download CTA and blocked persona actions while the desktop answered. The plane has no pairing and no download CTA: the proxy attaches the team key server-side, so the browser signs nothing and never pairs, and the desktop is installed by definition. The tiers are only `online` and `offline`.

## Alternatives that lost

- **Rewrite paths and reshape bodies in the proxy.** Rejected by the typed-501 record (`2026-10-07-proxy-typed-501-not-on-desktop.md`): a hidden second contract on the route that carries the team key. `de81e2a4` states the same choice from the client side ("so the proxy stays a verbatim relay").
- **Reuse the supabase plane's `synced_devices` heartbeat as the gate.** The gate before `47c0980c` was exactly that plane's logic, and it failed for the desktop plane (never-synced, then a gate stuck closed with no heartbeat fed). The commits show this was fixed by a separate health probe; they do not record a weighed comparison beyond that.
- **Copy the supabase mappers into the desktop backend.** `bc17aac5` moved them to `desktopRows.ts` instead; no other reason is recorded.
- Anything else: not recorded.

## Consequences

- The phone actions that `desktopApi` leaves to `realApi` (via `...base`) do not work on this plane. Locations verified on this branch:
  - pause and resume: `src/components/dashboard/views/personas/phone/personaActions.ts:15`, which calls `api.pausePersona` / `api.resumePersona`; `realApi` throws `ApiError(501)` ("not available on the orchestrator plane").
  - reviews: `src/stores/reviewStore.ts:381` (`api.decideReview`) and `:448` (`api.listEvents`). The decision goes to `PUT /api/events/:id` and the list to `GET /api/events`, both `not_on_desktop` in the shape table, so the proxy answers the typed 501 (`realApi.decideReview` does not throw one itself).
  - notes: `src/stores/notesStore.ts:37` (`api.listNotes`).
  - chat: `src/stores/chatStore.ts:97` (`listChatSessions`), `:116` (`listChatMessages`) and `:155` (`sendChatMessage`).
  Precision: of these, `pausePersona`, `resumePersona` and `sendChatMessage` throw `ApiError(501)` in `realApi`; `decideReview` and `listEvents` get the proxy's typed 501; `listNotes`, `listChatSessions` and `listChatMessages` return empty arrays in `realApi` (no error). So the notes and chat reads show "nothing", not a 501.
- Because the gate reports `online` for the desktop plane (no pairing tier), the UI can offer these actions while they answer 501. Closing that is not part of this decision.
- Execute, cancel and status now work through the desktop backend, as a proxy relay of the desktop's own routes.
- The desktop shape table is read from the personas repo and can drift; a new desktop route still needs a `DESKTOP_SHAPES` edit.
- Bundle budget was not re-measured (`de81e2a4` says a build is needed).

Relation to the typed-501 record: this record sits beside it and does not amend it. That record's rule (no path rewriting, typed 501 for unserved shapes) is unchanged and is the reason the mapping lives in the client. Its two example shapes are served now only because the desktop added matching routes. That record is not edited, as the README requires.

## Evidence

personas-web: `5ba5be0e` (table entries), `bc17aac5` (shared mappers, `pending` to `queued`), `de81e2a4` (desktop backend, dispatch, `ApiError` move, tests, `.env.example`), `47c0980c` (`desktopPlane` branch in `computeReachability`, tests that fail without it), `6a0c849f` (health probe in `useSyncReachability`, docs paragraph). All resolve with `git cat-file -e`.
personas: `f64d96ca43` resolves (checked read-only with `git cat-file -e`); its content was not re-read, only the description in the message of `5ba5be0e`.
