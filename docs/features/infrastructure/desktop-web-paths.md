# Desktop<->Web Path Probe
> One read-only command that reports every path between the desktop app and the web as working, broken, blocked or retired. · **Route:** n/a (script) · **Status:** Live

## What it does
The desktop and the web talk over several separate paths: the web calls the desktop's management API (directly or through the `/api/orchestrator` proxy), the desktop mirrors its state into Supabase for the web to read, the web sends commands that the desktop runs and answers, a phone pairs with the desktop, and the web hands `personas://` links to the desktop. Each can fail on its own. The probe looks at every one of them and prints one line per path, so "is the desktop<->web link working?" has a repeatable answer instead of a manual check.

It is the measure of plan milestone 5 goal 1, and the proof tool for milestone 2 goal 1 (proxy persona ids = desktop ids, row `desktop-api.proxy`) and milestone 3 goal 2 (mirror persona ids = desktop ids, row `mirror.personas`).

## How to run it
```bash
node --env-file=<path-to-.env> scripts/probe-paths.mjs          # aligned table + summary
node --env-file=<path-to-.env> scripts/probe-paths.mjs --json   # the verdict array
```
Env (all optional; see `.env.example`): `PROBE_DESKTOP_URL` (default `http://127.0.0.1:9420`, must be loopback), `PROBE_WEB_URL` (default `http://localhost:3000`), `TEAM_API_KEY` (or the deprecated `NEXT_PUBLIC_TEAM_API_KEY`), `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and a session from `PROBE_ACCESS_TOKEN` or from `PROBE_EMAIL` + `PROBE_PASSWORD` (a password sign-in with the anon key). The user must belong to the test project.

**Exit codes:** `0` every path working or retired · `1` any path broken · `3` none broken but any blocked · `2` config refusal (only the failed check is printed). A crash also exits `1` and prints the error's name only.

**Safety.** The probe sends GETs plus at most one password sign-in. It never reads `SUPABASE_SERVICE_ROLE_KEY`, never creates a user, never inserts, updates, deletes or signs anything, and never opens a `personas://` URL. Supabase is read with the anon key and the user's session, so RLS applies. It refuses (exit 2) unless the host of `NEXT_PUBLIC_SUPABASE_URL` starts with `pvfw` (the test project, decision `docs/decisions/2026-10-07-pvfw-is-the-test-supabase-project.md`) or is `localhost`/`127.0.0.1`; unset is not a refusal (every session path is then blocked). It also refuses a non-loopback `PROBE_DESKTOP_URL` and a URL carrying credentials. Output carries ids, counts, states, error tokens (the text before `:`) and ages only: never a key, token, URL, prompt, params, envelope or row content.

## States
- **working**: the path carried what it should.
- **broken**: the probe looked and the path failed (an error status, a mismatch, a stale stamp, a refusal from the far side).
- **blocked**: the probe could not look: the desktop is not listening (ECONNREFUSED), the web is not running, there is no session, the key or session was refused (401/403), or an env var is unset. A blocked path is never reported as working or broken.
- **retired**: only for a path a decision record retires. None does today.

## The paths
| id | Direction | What proves it | Preconditions |
| --- | --- | --- | --- |
| `desktop-api.direct` | web->desktop | `GET {desktop}/health`, `/api/status`, `/api/personas` with `Bearer TEAM_API_KEY` all answer 2xx, the envelopes say `success:true`, and the persona list yields ids (collected for the rows below) | desktop running; `TEAM_API_KEY` set (`/health` is sent even without it, so "not listening" outranks "key unset") |
| `desktop-api.proxy` | web->desktop | `GET {web}/api/orchestrator/api/personas` with `x-user-token` answers 200 and its persona-id set equals the direct set (milestone 2 goal 1). Proxy 401 or `503 orchestrator_not_configured`/`auth_unavailable` is blocked; 500/502 is broken; differing ids are broken, naming both counts; with no direct ids it is blocked `cannot compare without the desktop` | web running with `NEXT_PUBLIC_ORCHESTRATOR_URL` (+ `ORCHESTRATOR_TARGET=desktop` for the desktop); a session |
| `mirror.devices` | desktop->web | the freshest `synced_devices.last_seen_at` of the user is within `DEVICE_FRESH_MS` (120 s, `src/lib/sync/reachability.ts`); older is broken `mirror stale`; no rows is blocked | session; desktop sync on |
| `mirror.personas` | desktop->web | the user's `synced_personas` ids include every direct id (milestone 3 goal 2); blocked `cannot compare without the desktop` when the direct read did not work | session; desktop running and syncing |
| `command-plane.<verb>` (`pause_persona`, `resume_persona`, `run_persona`, `cancel_execution`, `chat_send`, `review_decide`) | web->desktop->web | the newest `pending_commands` row of that verb in the last 7 days: `completed` working; `rejected`/`failed` broken with the error token; `expired` broken `desktop did not answer`; no row blocked `no command issued yet`; still `pending`/`approved`/`executing` blocked | session; a command issued from the web (the probe never issues one) |
| `pairing` | both | at least one `command_controllers` row is `active` and not revoked, and no signed command (`controller_id` set) newer than the newest activation was rejected `controller_not_paired`/`controller_revoked`. No controller is blocked; controllers but none active is broken | session; a phone paired |
| `deep-links.scheme` | web->desktop | `reg query HKCU\Software\Classes\personas` succeeds (Windows only; elsewhere blocked) | desktop installed on this machine |
| `deep-links.auth-callback`, `.share`, `.import`, `.ref`, `.pair` | web->desktop | static table of the routes personas `src-tauri/src/boot/deep_link.rs` handles (master 654263d997, 2026-10-07): `auth/callback`, `share`, `import/<slug>`, `ref/<code>`, `pair`. Working when the scheme is registered, blocked otherwise | as `deep-links.scheme` |
| `deep-links.persona`, `deep-links.execution` | web->desktop | no web link builder and no desktop handler today: broken `no handler` (milestone 4 goal 3 is open), not retired | none |

## Key files
- `src/lib/pathProbe/classify.ts`: every verdict, the exit-code rule, the config refusals and the report format. Pure, no imports (the runner loads it with Node's type stripping), so `DEVICE_FRESH_MS` is copied as `PROBE_DEVICE_FRESH_MS` and a test pins it to reachability's value.
- `src/lib/pathProbe/classify.test.ts`: one test per branch, including each mix of states for the exit code.
- `scripts/probe-paths.mjs`: the I/O: fetches with an 8 s timeout, the session, PostgREST reads, the registry query. It silences Node's `MODULE_TYPELESS_PACKAGE_JSON` warning for the `.ts` import (package.json has no `"type"`).

## Conventions & gotchas
- When the desktop gains a deep-link handler or a path is retired by a decision record, update `DESKTOP_DEEP_LINKS` / `UNHANDLED_DEEP_LINKS` (and cite the commit and date) and this doc in the same commit.
- Supabase reads also filter `user_id=eq.<the session's user>`; RLS is the real boundary.
- The `deep-links.*` route rows are a static claim checked against the desktop source, not exercised: the probe never opens a `personas://` URL.

## Last run
2026-10-07 09:46 UTC · personas-web `c6d52c30` (branch base; the probe itself was uncommitted on top) · personas master `654263d997` · env: the operator's `.env` (no `TEAM_API_KEY`, no probe session), desktop and web dev server not running. Exit 1.

| Path | State | Reason |
| --- | --- | --- |
| desktop-api.direct | blocked | /health: desktop not listening |
| desktop-api.proxy | blocked | no session |
| mirror.devices | blocked | no session |
| mirror.personas | blocked | no session |
| command-plane.pause_persona | blocked | no session |
| command-plane.resume_persona | blocked | no session |
| command-plane.run_persona | blocked | no session |
| command-plane.cancel_execution | blocked | no session |
| command-plane.chat_send | blocked | no session |
| command-plane.review_decide | blocked | no session |
| pairing | blocked | no session |
| deep-links.scheme | working | personas:// registered (HKCU) |
| deep-links.auth-callback | working | handled: auth/callback (deep_link.rs, 2026-10-07) |
| deep-links.share | working | handled: share (deep_link.rs, 2026-10-07) |
| deep-links.import | working | handled: import/&lt;slug&gt; (deep_link.rs, 2026-10-07) |
| deep-links.ref | working | handled: ref/&lt;code&gt; (deep_link.rs, 2026-10-07) |
| deep-links.pair | working | handled: pair (deep_link.rs, 2026-10-07) |
| deep-links.persona | broken | no handler |
| deep-links.execution | broken | no handler |

Summary: 19 paths: 6 working, 2 broken, 11 blocked, 0 retired (exit 1).
