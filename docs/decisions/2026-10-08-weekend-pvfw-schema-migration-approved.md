# Weekend: the schema-only migration of `pvfw` is approved; the Director runs it once

## Context

`pvfw` is the loop's test Supabase project (see `2026-10-07-pvfw-is-the-test-supabase-project.md`; not repeated here). `scripts/setup-sync-db.sql` declared `synced_manual_reviews.execution_id` NOT NULL, but a council Approval has no execution. One such row failed the whole review batch, and the desktop's reviews cursor stuck at 2026-10-05T12:50:52.

## Decision

Operator decision of 2026-10-08, about 11:40 local, relayed by the Director. The schema-only migration of `pvfw` is approved. Builders change the SQL and code through the gate. The Director runs `npm run db:migrate:sync` once after the run merges. Builders never run it.

## Alternatives that lost

Reconstructed from the constraints; the options the operator was offered are not recorded in this repo.

- **Leaving `pvfw` unmigrated.** Council Approvals would never sync and the phone could not show or decide them.
- **Builders running the migration themselves.** Puts a database write inside an unattended run; one run by the Director keeps it a single, reviewable step.

## Consequences

- The SQL fix is `7a06fbee`: `scripts/setup-sync-db.sql:155-156` runs an idempotent `alter column execution_id drop not null`, because the table was already deployed with NOT NULL. It also adds a check to `scripts/check-sync-schema.mjs` and tests in `src/lib/syncSchema.test.ts` and `src/lib/supabaseApi.test.ts`.
- The migration touches only the sync objects, as the 2026-10-07 record requires.
- The Director ran it once; `scripts/check-sync-schema.mjs` reported RESULT ok, and the reviews cursor then moved to 2026-10-08T10:12:57Z. That is the Director's report; nothing was run against a database for this record.

## Evidence

personas-web: `7a06fbee` (its message states the 23502 failure); `scripts/setup-sync-db.sql:155-156`; `package.json` script `db:migrate:sync`. Source: the operator's decision relayed by the Director.
