# The hosted Supabase project `pvfw` is the test project, not production

## Context

The brief for the desktop-to-web work forbids touching production data. The loop had assumed the hosted Supabase project whose ref starts `pvfw` was production, because the roadmap voting in this repo uses it. That assumption left no hosted place to prove the desktop-to-web mirror or the web-to-desktop command plane.

## Decision

Operator decision of 2026-10-07 (ask `428d57fc`): the project whose ref starts `pvfw` is not production. It is the loop's test project for proving the desktop-to-web mirror and the web-to-desktop command plane.

`npm run db:migrate:sync` may add only the sync objects defined in `scripts/setup-sync-db.sql`, and touches no existing rows.

## Alternatives that lost

- **A local Supabase stack in Docker** (`npx supabase`). Not chosen; the operator named `pvfw` instead.
- **A new hosted test project the operator would create.** Not chosen for the same reason.

## Consequences

- `pvfw` now holds both the roadmap voting data and the sync tables.
- Any change to its existing tables or their RLS is out of scope for the loop.
- The accepted risk in `2026-10-07-accepted-risk-execution-text-synced-raw.md` holds only while sync targets `pvfw` or another test project.
- Nothing here says the sync schema has been applied; that is done by a separate run, and its outcome is not recorded in this file.
- The project is named only by its prefix. Its URL, keys and connection strings do not belong in the repo.

## Evidence

personas-web: `scripts/setup-sync-db.sql` and the `db:migrate:sync` script in `package.json` (both resolve in the tree). Source: the operator's ask `428d57fc`.
personas: none.
