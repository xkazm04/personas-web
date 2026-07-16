# Fix Wave 2 — Security (theme T1)

> 4 commits, 6 findings closed (3 Critical + 3 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.
> User pre-approved implementing the full security wave.

## Commits

| # | Commit | Findings closed | Severity |
|---|---|---|---|
| 1 | `cb9eba6` | manual-review-queue #1 | Critical |
| 2 | `c31814f` | observability-charts-sla #1 | Critical |
| 3 | `2cfaa88` | orchestrator-api-client #1, execution-history-streaming #2 | Critical + High |
| 4 | `aa184e3` | supabase-client #1, #2 | Critical + High |

## What was fixed

1. **Review keyboard chords** — both review keydown handlers branched on `e.key` alone, so Ctrl+R/Cmd+R was swallowed and routed into an irreversible **reject** of the selected pending review. Both now bail on ctrl/meta/alt and skip contentEditable.
2. **Mock data in real-mode charts** — compare "Previous" series + fake incident annotations (incl. a "Slack outage") were baked into the shared chart components below the demo/real gate. Lifted to props; `PerformanceView` passes them only when `isDemo` and hides the Compare toggle in real mode.
3. **Orchestrator key client-bundled** — `NEXT_PUBLIC_TEAM_API_KEY` was read in `api.ts` (imported by client components), inlining the destructive-write credential into the browser bundle. All calls now route through a same-origin catch-all proxy `/api/orchestrator/[...path]` that attaches the key server-side; browser carries only its own Supabase token. Key is now server-only `TEAM_API_KEY` (legacy name still read as fallback).
4. **Supabase anon-key PII exposure + waitlist data loss** — added a server-only service-role client (`supabase-admin.ts`); votes/comments/boosts/waitlist writes route through it. `scripts/harden-voting-rls.sql` drops anon read/mutate on `feature_votes` (exposes only a counts view) and creates `waitlist_entries`. Waitlist now persists to Supabase when configured instead of ephemeral `.data/waitlist.json`.

## ⚠️ Deploy steps required (flagged for the user)

These code changes are safe with current env (service-role client falls back to anon with a console warning; orchestrator proxy reads the legacy key name as fallback), but to fully close the security holes:

1. **Set `SUPABASE_SERVICE_ROLE_KEY`** (server-only) in the deployment env.
2. **Run `scripts/harden-voting-rls.sql`** in the Supabase SQL editor (drops anon PII access, creates `waitlist_entries`). Do this *after* step 1 or the votes API loses DB access.
3. **Rename `NEXT_PUBLIC_TEAM_API_KEY` → `TEAM_API_KEY`** (server-only) in the deployment env. The old name keeps working until you do, but stays in the client bundle until removed.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 3–5)

3. **Client-bundled secret via `NEXT_PUBLIC_`** — any `process.env.NEXT_PUBLIC_*` referenced from code reachable by a client component is inlined into the JS bundle. Secrets that authorize writes must be server-only and attached behind a route handler / same-origin proxy. Grep `NEXT_PUBLIC_.*KEY|SECRET|TOKEN` referenced outside `app/api`.
4. **Anon-role RLS can't enforce app-layer intent** — a route comment saying "we don't select email" is meaningless if the table is readable by the public anon key. PII/mutation tables need a service-role client + locked-down RLS, not politeness.
5. **Mock fixtures below the demo/real gate** — gating `isDemo` in a parent view is defeated when a shared child component imports the mock directly. Pass demo data as props from the gated parent; children never import mocks.

## What remains

Critical #5 (connector cards keyboard-unreachable) belongs to the a11y wave (T5). Themes T2–T3, T5–T15 open per INDEX.md.
