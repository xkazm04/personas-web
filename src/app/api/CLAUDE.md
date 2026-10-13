# src/app/api — read before adding or changing a route

These are pointers. The rules themselves live in the files named here, so this file cannot drift from them.

- Before adding a `route.ts`, work through "## Checking a new route" in `docs/threat-model.md`, and add the route's row to "## Routes" there. `src/lib/threatModelCoverage.test.ts` fails when a route has no row.
- `SUPABASE_SERVICE_ROLE_KEY` is reached only through `getSupabaseAdmin()` (`src/lib/supabase-admin.ts`), imported inside the handler. See "## The `service_role` boundary" in `docs/threat-model.md` and the **Supabase** convention in `.claude/CLAUDE.md`.
- A new route is backend surface. `scripts/check-ai-change.mjs` fails an agent commit that adds one unless the owner has decided it (`.ai/manifest.yaml` `scope.does_not`).
- Decisions that govern routes here, each naming its paths on a `**Governs:**` line: `docs/decisions/2026-10-07-proxy-key-session-gated.md`, `docs/decisions/2026-10-09-sse-session-gate-and-production-no-eval.md`, `docs/decisions/2026-10-07-proxy-typed-501-not-on-desktop.md`, `docs/decisions/2026-10-07-desktop-plane-unserved-reads-not-measured.md` and `docs/decisions/2026-10-09-pairing-link-and-team-key-hardening.md`.
