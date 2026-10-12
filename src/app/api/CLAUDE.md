# src/app/api — read before adding or changing a route

These are pointers. The rules themselves live in the files named here, so this file cannot drift from them.

- Before adding a `route.ts`, work through "## Checking a new route" in `docs/threat-model.md`, and add the route's row to "## Routes" there. `src/lib/threatModelCoverage.test.ts` fails when a route has no row.
- `SUPABASE_SERVICE_ROLE_KEY` is reached only through `getSupabaseAdmin()` (`src/lib/supabase-admin.ts`), imported inside the handler. See "## The `service_role` boundary" in `docs/threat-model.md` and convention 6 in `.claude/CLAUDE.md`.
- A new route is backend surface. `scripts/check-ai-change.mjs` fails an agent commit that adds one unless the owner has decided it (`.ai/manifest.yaml` `scope.does_not`).
