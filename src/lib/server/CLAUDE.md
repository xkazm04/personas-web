# src/lib/server — server-only modules

These are pointers. The rules themselves live in the files named here, so this file cannot drift from them.

- A module that reads `SUPABASE_SERVICE_ROLE_KEY` or another server secret starts with `import "server-only"`, as `src/lib/server/env.ts` does. That line makes Next fail the build when a client component reaches the module. See "## The `service_role` boundary" in `docs/threat-model.md` and convention 6 in `.claude/CLAUDE.md`.
- Write routes take their IP rate limit from `src/lib/server/rate-limit.ts`. See step 5 of "## Checking a new route" in `docs/threat-model.md`.
