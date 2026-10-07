# Desktop remote-control landed by cherry-pick; chat-tombstones migration renumbered e60 to e62

## Context

The desktop half of paired-phone remote control lived on the personas branch `cloud/remote-control-v1`. By the time it was ready to land, personas master had moved on and already held migrations `e60_review_execution_optional` and `e61_council_run_mode`. The branch's new `chat_session_tombstones` table had been written as migration `e60`, so a plain merge would have produced two `e60` migrations. The operator had permitted landing the branch through the merge gate on 2026-10-07.

## Decision

Land the branch on personas master with `git cherry-pick -x` of its 8 commits (`f45017707a..767f114ee8`), plus one new commit, `dc6d12aceb`, which fixes a compile break: the branch's `chat_turn.rs` produces a `Continuation::SessionResume` that the serving-override census did not account for. The tombstones migration became `e62_chat_session_tombstones`, registered after `e61` in `incremental/mod.rs`.

The evidence shows the renumber was folded into the cherry-pick of the sync commit (`807f4d65f0`), not made as a separate commit. That commit's message still says "migration e60", while the file it adds on master is `e62_chat_session_tombstones.rs`. Read the message as describing the branch, and the tree as authoritative.

## Alternatives that lost

- **Merge the branch.** It would have brought in the branch's own history and the duplicate `e60`, and it would have needed a renumber commit on top anyway. Cherry-pick let each commit be re-checked on master's tree.
- **Keep `e60` and renumber the two master migrations.** Master's `e60` and `e61` may already have run on installed databases. Renumbering migrations that have shipped breaks them; renumbering the unshipped one is free.

## Consequences

- Each landed commit carries a `(cherry picked from commit ...)` trailer, so the branch SHAs below stay traceable; the master SHAs differ from them.
- `cloud/remote-control-v1` is still a live branch. Re-landing it, or picking later commits from it, must skip what is already on master and must not reintroduce `e60`.
- The e62 slot is taken. Any migration written against the branch's numbering needs the same check against master first.

## Evidence

personas, master SHAs: `f45017707a`, `8f0cc93414`, `15216063fe`, `7003a06bbf`, `06574c6d9a`, `29de53a2fe`, `807f4d65f0`, `767f114ee8`, fix `dc6d12aceb`.
personas, original branch SHAs (from the trailers): `e13d380437`, `c8d7ba2998`, `405c0e2720`, `e8ff8b41ff`, `43a0c909de`, `d1058ed3d1`, `d059085817`, `6fb1b77942`.
Master's `mod.rs` lists `e60_review_execution_optional`, `e61_council_run_mode`, `e62_chat_session_tombstones`. All SHAs resolve with `git cat-file -e`.
personas-web: none.
