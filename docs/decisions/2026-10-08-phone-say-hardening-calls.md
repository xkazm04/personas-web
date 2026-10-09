# Phone say hardening: four calls made while settling F1, F2, F4 and H2

## Context

The operator's 2026-10-08 answer "Harden, then prove" set the order: close the known limits of `channel_say` first, then exercise it. Runs `8183f591` (F1, F2, F4) and `eb59af72` (H2) did the hardening on personas master. Each made small calls that the commits do not explain. This record keeps them.

## Decision

Four calls.

1. **The controller id comes from the authority.** It reaches `channel_say::plan` through `Authority::Paired { controller_id }`, the verified envelope's controller. A desk-approved say (`Authority::OperatorApproved`) has no controller and is not capped.
2. **A tie accepts both.** On an exact `created_at` tie between two `App Master%` personas bound to one project, `is_loop_read_master` accepts both.
3. **The cap race stays open.** The cap counts, then inserts. Two says from one controller at the same instant could both pass at 9.
4. **H2 kept the binding shape.** `CloudPairingOrigin` is unchanged, and `custom: false` now means "not set, pairing is off".

## Alternatives that lost

- **A new `Effective.controller_id` field** (call 1). It would have broken the `Effective` struct literals in the tests of `cloud/athena_send.rs`, `cloud/persona_chat_send.rs` and `cloud/review_decide.rs`, which were outside the run's paths.
- **Refusing both personas on a tie** (call 2). `masterPersona` uses `ORDER BY created_at DESC LIMIT 1`, which is unspecified on a tie. Refusing both would refuse the one the loop actually reads.
- **A lock or a single-statement insert-if-under-cap** (call 3). Not done. The poll handles rows one at a time under leader election, so the race needs two concurrent paths.
- **A new field on `CloudPairingOrigin`** (call 4). It would have regenerated the bindings.

## Consequences

- Call 1 ties the cap to the verified envelope. A path that builds an `Authority::Paired` without a verified controller would break it.
- Call 2 ties the desktop test to what the loop reads. If `dbread.mjs` `masterPersona` changes its rule, `is_loop_read_master` must change with it.
- Call 3 stays open until a second concurrent path to `plan` exists. Then it needs a fix.
- Call 4 leaves two stale statements: the doc comment at `src-tauri/src/commands/infrastructure/cloud_sync.rs:104` and `src/lib/bindings/CloudPairingOrigin.ts` still say "false: the built-in default". Fixing them is a follow-up.

## Evidence

personas: `2c65f9f0ea` (F1), `693fc11e77` (F2), `78c5fcd8e6` (F4), `6edb84e889`, `11895b575e`, `8c7d3587f7` (H2). Sources: the `result.json` files of runs `8183f591` and `eb59af72`. Related: [the channel_say record](2026-10-08-weekend-directions-channel-say-verb.md) and [the phone-origin record](2026-10-08-weekend-phone-origin-tailscale-serve.md).

## Status, 2026-10-09

Call 4's two stale statements are fixed in personas `019f919c0e` and `1f61b4c237`. The first (`git show --stat`) changed 8 lines in two files: the `CloudPairingOrigin` field docs in `src-tauri/src/commands/infrastructure/cloud_sync.rs` and the matching generated doc comment in `src/lib/bindings/CloudPairingOrigin.ts`, to say pairing is off while the address is unset. The second changed one line in `src/features/settings/sub_account/components/CloudSyncCard.tsx`, a comment that now names the paired web app. The `cloud::` suite re-ran at personas master `39b6d996f3` with 217 passed and 0 failed (run `c176930d`). The record above is left as written.
