# Decision records

A decision record captures one technical choice that has already settled: the constraint that forced it, what was chosen, which alternatives lost and why, and what the choice now ties or blocks. It exists so a later reader does not have to reconstruct the reasoning from commit messages. Records are not edited to match later code; a reversal gets a new record.

Newest first:

- [2026-10-07 Desktop plane: a list read the desktop does not serve reads as "not served", never as empty](2026-10-07-desktop-plane-list-read-not-served.md) — answers the unsupported-actions open item; `listNotServed` in the review and event stores, home and nav counts still read zero; RD-6 closed on personas master.
- [2026-10-07 Desktop plane: review verdicts unsupported in every tier; desk-only blocked before the click; notes stop at 500](2026-10-07-desktop-plane-review-verdicts-every-tier-and-pre-click-desk-only.md) — extends the unsupported-actions record; `isDeskOnlyReview` mirrors personas `is_desk_only`; RD-6 still open, nothing live-verified.
- [2026-10-07 `review_decide` from a phone: desk-only for App Master packets and asks, notes redacted and capped](2026-10-07-phone-review-decide-desk-only-and-redacted-notes.md) — scan `3842c3af` RD-1 and RD-2 closed, RD-4 narrowed; RD-3 and RD-7 accepted, RD-6 open.
- [2026-10-07 Desktop data plane: pause, resume, chat send and review verdicts are unsupported](2026-10-07-desktop-plane-unsupported-actions.md) — one table pinned to `desktopApi` and `desktopShapes`; the controls are disabled before the click with a reason and send no request.
- [2026-10-07 M21 governs run and chat: a paired phone may run and chat with a paused persona](2026-10-07-paused-persona-phone-run-and-chat-m21.md) — scan finding 8 accepted; pause is no longer a brake against a paired phone.
- [2026-10-07 `pending_commands` update guard](2026-10-07-pending-commands-update-guard.md) — a BEFORE UPDATE trigger: a command never returns to pending and a finished one is final.
- [2026-10-07 Desktop data plane: a client backend that maps the desktop's rows](2026-10-07-desktop-data-plane-client-backend.md) — `NEXT_PUBLIC_DATA_SOURCE=desktop` selects `desktopApi`; the proxy stays a verbatim relay and the plane has its own health-probe online gate.
- [2026-10-07 `pvfw` is the test Supabase project, not production](2026-10-07-pvfw-is-the-test-supabase-project.md) — the loop's test project for the desktop-to-web mirror and command plane; `db:migrate:sync` adds only the sync objects.
- [2026-10-07 ACCEPTED RISK: execution text is mirrored raw to `synced_executions`](2026-10-07-accepted-risk-execution-text-synced-raw.md) — no code change until cloud sync goes beyond a test project; the web Executions view keeps showing raw text.
- [2026-10-07 Typed 501 `not_on_desktop`, no path rewriting](2026-10-07-proxy-typed-501-not-on-desktop.md) — with `ORCHESTRATOR_TARGET=desktop`, call shapes the desktop does not serve get a typed 501, never a rewrite or a bare 404.
- [2026-10-07 Proxy key only for a verified Supabase session](2026-10-07-proxy-key-session-gated.md) — the team key is attached only after Supabase verifies the caller; upstream is pinned to the orchestrator origin and only JSON is relayed.
- [2026-10-07 Desktop remote-control landed by cherry-pick, migration renumbered e62](2026-10-07-desktop-remote-control-cherry-pick-e62.md) — `cloud/remote-control-v1` reached personas master by `cherry-pick -x`, not a merge.
