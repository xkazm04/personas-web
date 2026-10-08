# Weekend engine: the headless App Master stays the engine; the desktop app is the surface

## Context

The weekend goal (Friday evening to Sunday) is that the operator reviews council results and directs App Masters from a second device. The desktop app syncs its Reports and Approvals to Supabase, and the web app reads them there. The council work, however, is run by the headless App Master loop (a terminal session, the Director), which keeps its results in an outbox, so the app had no council Reports or Approvals to sync.

## Decision

Operator decision of 2026-10-08, about 11:40 local, relayed by the Director. The headless App Master loop stays the engine. The desktop app is the surface: the Director's outbox is replayed into the app through its own doors, so council Reports and their Approvals exist in the app and sync to Supabase. The in-app masters stay off.

## Alternatives that lost

Reconstructed from the constraints; the options the operator was offered are not recorded in this repo.

- **The in-app masters as the engine.** Would put a second master beside the headless one. The replay mode exists precisely so the app can be the surface "without a second master".
- **A phone view fed straight from the outbox, bypassing the app.** Would need a new write path to Supabase. The app already owns the Report and Approval sync, so replaying through it reuses the existing mirror.

## Consequences

- The Director replayed 21 council reports with their Approvals (318 outbox entries) into the app.
- An Approval decided on the phone is the council verdict (personas `236609fe8e`).
- Council Approvals have no execution, which the sync schema had to allow; see `2026-10-08-weekend-pvfw-schema-migration-approved.md`.
- The web side follows: `48806823` (a council Approval shows its synced report on the phone) and `f3e8e3d9` (Messages phone layout with an in-place report reader).
- The engine runs only while the Director's terminal session runs.

## Evidence

personas-web: commits `48806823` and `f3e8e3d9` (both in this branch's history). personas: `5a154763d7` (outbox replay `--kinds`) and `236609fe8e` (a council report's Approval decided on the phone is the council verdict), both on personas master. The count of 21 reports and 318 entries is the Director's report and was not re-verified here. Source: the operator's decision relayed by the Director.
