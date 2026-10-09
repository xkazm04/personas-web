# The pairing link and the team key: four calls from scan d4b90e7a (F8, F9, F7, F13)

## Context

Scan `d4b90e7a` found four holes around the `#pair=<id>.<secret>` link and the orchestrator team key. All four fixes merged on `revamp/stage-fit` without a record. This record keeps them. The origin holds a paired phone's non-extractable signing key, so a leaked pairing secret or a silently replaced pairing matters.

- F8: the `#pair=` scrub passed `window.history.state` to `history.replaceState`. That state carries `__NA`, so Next's `replaceState` patch skipped the router sync. The router URL kept `#pair=<id>.<secret>`.
- F9: `sentry-pii` did not scrub `pair=` values, did not cut `request.url` at the fragment, and scrubbed only part of the breadcrumb data.
- F7: a `#pair=` link replaced a working pairing with no question asked.
- F13: the proxy and both SSE routes fell back to `NEXT_PUBLIC_TEAM_API_KEY` when `TEAM_API_KEY` was unset.

## Decision

Four calls.

1. **The scrub is a pure `takePairFragment` in `src/lib/commands/pairing.ts`, and it calls `history.replaceState(null, '', pathname + search)`** (`553e4d45`, F8). A `null` state has no `__NA`, so Next's patch syncs the router and the fragment leaves the router URL too. 3 tests in `pairing.test.ts`.
2. **`sentry-pii` scrubs `pair=` values, cuts `request.url` at the first `#`, and scrubs breadcrumb data** (`6201dba0`, F9). The `pair=` pass is case-insensitive and runs before the UUID pass. `scrubBreadcrumb` now scrubs string and object data values, and `scrubEvent` hands its breadcrumb loop to it. The run chose the wider breadcrumb pass, and no existing test changed. 4 tests. Client Sentry is still not initialized, so this closed a latent leak, not a live one.
3. **A `#pair=` link asks before it replaces a working pairing** (`a937d114`, docs `2832b02c`, F7). A first pairing needs no click. `controllerStore` exports `replaceNeedsConfirm(phase)`, and `load()` shares one in-flight promise. That also fixed a race: `useSyncReachability` could start `load()` first, and the card then saw `loading`. Copy: "This phone is already paired. Pairing again ends the current pairing.", "Pair again", "Keep current pairing". 12 tests.
4. **The proxy, both SSE routes and `scripts/probe-paths.mjs` read only `TEAM_API_KEY`** (`79f7f09d`, docs `c70b4668`, F13). Each route file has one negative test: with only the old name set, no `Authorization` header goes upstream, so the route fails closed. A future deployment must set `TEAM_API_KEY`.

## Alternatives that lost

Where the source is a commit message or run result, it is named. Otherwise the alternative follows from a stated constraint.

- **The two-slot key store for call 3** (run result and commit message). The new key would sit pending and be promoted only when the desktop marks the new row active. It lost because it would change `controllerPlane.ts`, `signer.ts` and IndexedDB code that cannot be unit-tested without a new dependency.
- **Waiting for the deployment env rename for call 4** (the scan's advice, FIXES-WAVE-2; run result). It lost because nothing is deployed from this branch, and no env file on this machine set either name (checked by variable name only).
- **Keeping the old name as a fallback for call 4.** It follows from the constraint that the old name has a `NEXT_PUBLIC_` prefix. A prefixed value is inlined into client JS, so reading it as a server key is the hole.
- **A narrower breadcrumb pass for call 2.** The run result says the wider pass was chosen. The narrower shape is not described further, so nothing more is claimed about it.

## Consequences

- A pairing link that carries a secret no longer stays in the router URL, in the Sentry request URL or in breadcrumb data.
- A second `#pair=` link on a paired phone does nothing until the user answers. A phone that was paired by mistake takes one tap to confirm.
- A deployment that still sets only `NEXT_PUBLIC_TEAM_API_KEY` gets no upstream `Authorization` header, so its proxy and streams fail closed.
- Open: `npm run copy:check` could not run in the builder's worktree for call 3 and has not been run on the merged tree.
- Not live-verified. The proof is unit tests: 3, 4, 12, and one negative test per route file.
- Reopen trigger: client Sentry is initialized (re-check call 2 against real events), a deployment of personas-web is planned (set `TEAM_API_KEY`), or the two-slot key store becomes testable.

## Evidence

personas-web: `553e4d45` (F8), `6201dba0` (F9), `a937d114` and `2832b02c` (F7), `79f7f09d` and `c70b4668` (F13). Sources: scan `d4b90e7a` (F5, F7, F8, F9, F13) and the `result.json` files of runs `b0434d93` (F8, F9), `ba92a44b` (F7) and `b54a9ef9` (F13). Related: [the SSE gate record](2026-10-09-sse-session-gate-and-production-no-eval.md).
