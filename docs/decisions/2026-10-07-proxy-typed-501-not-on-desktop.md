# With ORCHESTRATOR_TARGET=desktop the proxy answers unserved shapes with a typed 501 and rewrites no paths

## Context

The dashboard's `api.ts` was written against the cloud orchestrator. Pointed at the desktop's management API (`:9420`), many of its call shapes have no matching route, and some have a near match under a different path or body: the dashboard sends `POST /api/execute` with the persona id in the body, while the desktop serves `POST /api/execute/{persona_id}`. A dashboard that got the desktop's bare 404 could not tell "route missing" from "persona missing".

## Decision

When the server-only env `ORCHESTRATOR_TARGET` is `desktop`, the proxy looks each call up in a table of shapes (`desktopShapes.ts`, `a48ff86`). The table has one entry per (method, path) pair `api.ts` sends, and a test pins it to `api.ts`. Any shape the desktop does not serve gets `501 {error: "not_on_desktop", method, path}` (`96091a5`). The check runs after the session and `bad_path` checks and before any upstream fetch. Unset, or any other value, leaves the proxy behaving as before.

The proxy does no path rewriting. A desktop route under a different path or body counts as not served, even when it does the same job. That includes `POST /api/execute` (the desktop route takes the id in the path) and `POST /api/executions/:id/cancel` (the desktop only cancels lab runs).

## Alternatives that lost

- **Rewrite paths in the proxy** (for example `/api/execute` with a body id to `/api/execute/{id}`). Every rewrite is a second, hidden contract that has to track the desktop's router and body shapes, and it sits on the route that carries the team key. A shape change on either side would fail silently.
- **Let the desktop's bare 404 through.** It is ambiguous and carries no hint that the cause is the target, not the data.

## Consequences

- A desktop route that fits a dashboard call under another path stays unused until `api.ts` or the desktop changes; the proxy will not paper over it.
- Adding a desktop route means editing `DESKTOP_SHAPES`. The table was read from the personas repo (`management_router` in `management_api.rs`, `/health` in `webhook.rs`) per its own header, so it can drift and needs re-reading when that router changes.
- The 501 sits behind the session gate, so a proof of it needs the Supabase session described in the session-gated key record.

## Evidence

personas-web: `a48ff86` (shape table and test), `96091a5` (501 in the route, `.env.example` entry, proxy tests). Both resolve with `git cat-file -e`.
personas: none cited; the table's source routes were not re-read for this record.
