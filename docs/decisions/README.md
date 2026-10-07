# Decision records

A decision record captures one technical choice that has already settled: the constraint that forced it, what was chosen, which alternatives lost and why, and what the choice now ties or blocks. It exists so a later reader does not have to reconstruct the reasoning from commit messages. Records are not edited to match later code; a reversal gets a new record.

Newest first:

- [2026-10-07 ACCEPTED RISK: execution text is mirrored raw to `synced_executions`](2026-10-07-accepted-risk-execution-text-synced-raw.md) — no code change until cloud sync goes beyond a test project; the web Executions view keeps showing raw text.
- [2026-10-07 Typed 501 `not_on_desktop`, no path rewriting](2026-10-07-proxy-typed-501-not-on-desktop.md) — with `ORCHESTRATOR_TARGET=desktop`, call shapes the desktop does not serve get a typed 501, never a rewrite or a bare 404.
- [2026-10-07 Proxy key only for a verified Supabase session](2026-10-07-proxy-key-session-gated.md) — the team key is attached only after Supabase verifies the caller; upstream is pinned to the orchestrator origin and only JSON is relayed.
- [2026-10-07 Desktop remote-control landed by cherry-pick, migration renumbered e62](2026-10-07-desktop-remote-control-cherry-pick-e62.md) — `cloud/remote-control-v1` reached personas master by `cherry-pick -x`, not a merge.
