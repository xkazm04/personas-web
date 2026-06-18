# Agents (Personas) Management — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 1, High: 2, Medium: 2, Low: 0)

Scope note: `AgentDetailDrawer.tsx` (listed in the brief) does **not** exist in the live tree — only in `.claude/worktrees/*`. The project has **no unit-test runner** (only `@playwright/test`); `npm` scripts expose `test:e2e` only. No `*.test.*`/`*.spec.*` files exist under `src/`.

Verification of the prior 2026-05-10 fix: the concurrent-optimistic-update remediation (per-id mutex `personaMutationInflight`, CAS rollback via `patchStillApplied`, refetch-aware `rollbackPersona`) is **present and structurally sound in `personaStore.ts`**. It cannot have *regressed* — but it also cannot have ever shipped working, because **nothing in `src/` calls `commitOptimisticUpdate` / `optimisticUpdatePersona` / `rollbackPersona`** (grep across `src/` finds only the definitions and internal references). The state-integrity path that was "fixed" is dead code with zero tests. This dominates the findings below.

## 1. Persona optimistic-update / rollback engine has zero callers and zero tests — the "fixed" state-integrity path is unverified dead code
- **Severity**: High
- **Lens**: test-mastery
- **Category**: dead-but-critical infra / coverage gap / false-confidence
- **File**: src/stores/personaStore.ts:155-225 (definitions); whole-`src` grep = no call sites
- **Scenario**: A reviewer (or the prior bug-hunt) treats `commitOptimisticUpdate` as a hardened, in-use state-integrity path. In reality no component calls it — toggles/executes go straight through `api.*` (e.g. `handleExecute` in `agents/page.tsx` calls `api.executePersona` with no store mutation; `eventStore` mutates subscriptions directly). The carefully-commented mutex/CAS/snapshot machinery never runs in production, and there is no harness to prove it behaves as the comments claim.
- **Root cause**: A critical concurrency primitive was built and "fixed" but never wired to a consumer, and with no unit runner there is no executable assertion of its invariants — so its correctness rests entirely on prose comments.
- **Impact**: false-confidence test posture (a critical-labeled fix that is unexercised); when a future feature finally calls it, latent bugs (see #2) ship unguarded. Maintenance hazard: dead code reads as load-bearing.
- **Fix sketch**: Either delete the unused engine or wire it to a real mutation (e.g. an enable/disable toggle). Regardless, stand up a minimal unit harness (Vitest) for `personaStore` and assert the invariants: snapshot capture, per-id serialization, refetch-aware rollback no-op, CAS skip-on-later-commit.

## 2. CAS rollback guard uses referential equality — object/array-valued patches and same-value refetches defeat it
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: state corruption / stale resurrection
- **File**: src/stores/personaStore.ts:73-81 (`patchStillApplied`), 197-213 (`commitOptimisticUpdate` catch)
- **Scenario**: (a) A patch carries a non-primitive value — e.g. `{ config: {...} }` or a tags array. `optimisticUpdatePersona` stores the new object; at rollback time `patchStillApplied` compares `current.config !== applied.config` by reference. Because the stored value *is* `applied.config` (same reference via spread), the check passes and rollback proceeds even when a later commit replaced it with an equal-by-value object — or, if a refetch produced a structurally-equal-but-new object, the `!==` is true so a *legitimate* rollback is silently skipped, leaving the failed optimistic value on screen (stale resurrection of the unconfirmed state). (b) Even for primitives: a `fetchPersonas()` refetch landing the *same* value the user optimistically wrote makes `patchStillApplied` true, so a subsequently-failing mutation rolls back to a now-stale pre-edit snapshot, clobbering the server-confirmed value.
- **Root cause**: The CAS assumes shallow primitive equality is sufficient to decide "is my optimistic write still the source of truth", and conflates "value still equals what I wrote" with "no other writer has taken ownership". A concurrent refetch is an unaccounted-for writer.
- **Impact**: data corruption / stale resurrection in exactly the multi-writer scenario the fix was meant to close — but only once a caller exists (see #1), so latent until then.
- **Fix sketch**: Track ownership explicitly (a per-id generation/sequence token captured at optimistic-update time; rollback only if the token is still current) rather than value comparison; for object patches, deep-compare or forbid non-primitive patch values.

## 3. Subscription create/delete/toggle have no optimistic guard or rollback — concurrent mutations cause lost updates and resurrected rows
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: create/delete race / lost update
- **File**: src/stores/eventStore.ts:248-268; consumed by SubscriptionCard.tsx:27-44, CreateSubscriptionForm.tsx:28-42
- **Scenario**: `updateSubscription` does `subscriptions.map(sub => sub.id === subId ? updated : sub)` after the await; `deleteSubscription` filters after the await. If a user toggles a subscription and deletes another (or the same) concurrently, or a `fetchSubscriptions()` refetch resolves between a mutation's request and its `set`, the last-resolving `set` reads a stale `s.subscriptions` snapshot and overwrites the other mutation's result — a deleted row can reappear, or a toggle is lost. There is no per-id serialization (unlike the persona store) and no rollback if the API rejects mid-flight after the UI already showed `toggling`/`deleting`.
- **Root cause**: Each mutation closes over the post-await store via `set((s) => ...)` but the array operations assume no interleaving writer; create/delete/toggle and refetch all mutate the same `subscriptions` array without a mutex or id-keyed reconciliation.
- **Impact**: UX degradation + state corruption (ghost subscriptions, lost enable/disable) under rapid interaction or concurrent refetch; silent — no error surfaces.
- **Fix sketch**: Key reconciliation by id with a known-rows guard (skip resurrecting an id a concurrent delete removed), and/or adopt the persona store's per-id inflight serialization for subscription mutations; surface API rejection to the card instead of swallowing.

## 4. SubscriptionsPanel fetch guard reads a stale `personas.length` snapshot
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: timing / redundant-or-missed fetch
- **File**: src/components/dashboard/SubscriptionsPanel.tsx:28-31
- **Scenario**: The effect runs `if (personas.length === 0) void fetchPersonas()` with `personas.length` in the dep array. While the first `fetchPersonas()` is in flight (`personas` still empty), any re-render that re-runs the effect (e.g. `fetchSubscriptions` identity change, or another store update) re-invokes `fetchPersonas()`. The store's `inflight` guard absorbs the duplicate, so this is benign today — but the guard is implicit; if the dedupe in `fetchPersonas` were ever weakened, this fires redundant network calls. Conversely the `personas.length === 0` condition means a panel that mounts after personas were `reset()` to empty but before a refetch could skip fetching if another consumer's stale data is present.
- **Root cause**: Gating a fetch on a derived store-length snapshot rather than the store's own freshness/inflight state duplicates the staleness logic that `fetchPersonas` already owns.
- **Impact**: minor UX/perf; relies on the store's internal dedupe to stay correct.
- **Fix sketch**: Always `void fetchPersonas()` and let the store's `isFresh`/`inflight` guards decide, dropping the `personas.length` condition and dep.

## 5. `accentFromColor` / persona-store reducers are pure, business-visible, and untestable — no LLM-generatable batch can run
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: pure-function coverage gap / missing quality gate
- **File**: src/app/dashboard/agents/agents-page/agentAccent.ts:1-11; src/stores/personaStore.ts:73-98 (`patchStillApplied`, `arraysEqual`, `buildById`, `buildIds`)
- **Scenario**: `accentFromColor` lowercases and maps a hex to one of four accents with a `cyan` fallback (drives card glow/theme). `arraysEqual`/`buildById`/`buildIds` underpin the referential-stability optimization that keeps lists from re-rendering. All are trivially testable pure functions guarding real invariants (fallback on unknown/null color, order-change detection, id-map construction) — but with no unit runner there is no batch that can assert them, so a regression (e.g. a casing change or an off-by-one in `arraysEqual`) ships silently and degrades render performance or theming with no signal.
- **Root cause**: No unit harness exists for the package despite a cluster of pure, invariant-bearing helpers — the fastest-to-close, highest-certainty coverage gap is structurally unreachable.
- **Impact**: coverage gap / false-confidence; silent regressions in theming and the render-perf optimization.
- **Fix sketch**: Add Vitest (or any unit runner) and a small batch: `accentFromColor` (each known hex, uppercase, null, unknown → cyan); `arraysEqual` (identity, length-diff, element-diff, equal); `buildById`/`buildIds` round-trip. Wire a `test:unit` script + CI gate alongside `test:e2e`.
