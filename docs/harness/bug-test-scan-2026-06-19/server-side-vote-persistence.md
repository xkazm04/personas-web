# Server-Side Vote Persistence — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 1, High: 2, Medium: 1, Low: 1)

## 1. Corrupt-or-unreadable store silently wipes ALL prior data on next write
- **Severity**: Critical
- **Lens**: bug-hunter
- **Category**: silent failure → data loss
- **File**: src/lib/server/json-file-store.ts:13-20 (readJsonFile) → 32-43 (updateJsonFile); also src/app/api/votes/route.ts:180-205 (readVotes/writeVotes RMW)
- **Scenario**: `votes.json` becomes unreadable or unparseable — a half-written legacy file from a pre-atomic-write era, a truncated/corrupted file from a kernel crash during an old write, disk bit-rot, an out-of-disk read, a transient EACCES, or a manual edit. The very next vote (or boost/comment/request) POST runs the read-modify-write path.
- **Root cause**: `readJsonFile` wraps `readFile` + `JSON.parse` in a bare `catch {}` that returns the `{ entries: [] }` fallback for *every* failure, making genuine corruption indistinguishable from "file does not exist yet". The RMW callers (`updateJsonFile`, and the votes route's manual `readVotes`→push→`writeVotes`) then treat that empty fallback as the authoritative current state, mutate it, and `fs.rename` it over the real file. The atomic temp+rename protects only *future* writes; it does nothing about a read that quietly resolves to empty. One unreadable read converts into a permanent, total overwrite of the entire vote/boost/comment dataset.
- **Impact**: data loss — silent, irrecoverable destruction of all community votes/boosts/comments on the no-DB (preview/self-host/local) path. No log, no Sentry, no 500; the request returns `{ action: "added" }` as if healthy (success theater).
- **Fix sketch**: In `readJsonFile`, distinguish ENOENT (return fallback) from parse/IO errors (rethrow, or back up the bad file to `<name>.corrupt-<ts>` and surface a 500 to the caller). At minimum log the error to Sentry and refuse the RMW so a corrupt read can never be persisted over good data.

## 2. No unit harness for the lock / store / rate-limit invariants on the durability layer
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate on business-critical path
- **File**: src/lib/fileLock.ts:14-30, src/lib/server/json-file-store.ts:13-43, src/lib/server/rate-limit.ts:31-49
- **Scenario**: Any future edit to the serialization chain, the corruption-fallback semantics (finding #1), the atomic-rename sequence, or the fixed-window boundary ships with zero automated verification. The project has only Playwright e2e specs and no unit runner (vitest/jest), so these pure, deterministic, concurrency-critical modules have no fast test that asserts a true invariant.
- **Root cause**: The most failure-prone code in this context (cross-request serialization, idempotency, abuse throttling) is exercised only indirectly through full-stack e2e, which cannot reliably force the interleavings, the corrupt-read branch, or the window-rollover boundary.
- **Impact**: false confidence / regression risk — a one-line change to `prev.then(fn, fn)`, the `catch {}`, or `now > bucket.resetAt` can break serialization or throttling with no signal until production data corrupts.
- **Fix sketch**: Add a unit runner (vitest) and a batch asserting true invariants: `withWriteLock` runs same-key fns strictly sequentially and isolates keys; a thrown `fn` rejects the caller but the next same-key call still runs; `isRateLimited` returns false up to `limit`, true at `limit+1`, and resets after `windowMs`; `readJsonFile` returns fallback on ENOENT but NOT on malformed JSON (pairs with #1).

## 3. Orphaned `.tmp` files accumulate when rename fails or the process dies mid-write
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: resource leak / partial-write residue
- **File**: src/lib/server/json-file-store.ts:22-30 (writeJsonFile)
- **Scenario**: `fs.writeFile` to the random `.tmp` succeeds, then `fs.rename` throws (EXDEV across a mounted `.data`, EACCES, ENOSPC, EPERM on Windows when a reader holds the target open), or the process is killed/redeployed in the window between write and rename. The temp file is never cleaned up.
- **Root cause**: `writeJsonFile` has no `try/finally` to unlink the temp file on a failed or interrupted rename. Each failure leaves a `.${name}-${hex}.tmp` orphan; `randomBytes(6)` guarantees a new name every time, so they never get reused or overwritten.
- **Impact**: UX degradation / disk exhaustion over time — `.data/` slowly fills with dead temp files (worse on Windows where target-open renames are common), and a failed rename also bubbles up as an unexplained 500 to the voter. On crash-during-write the half-written `.tmp` is also a future corruption source for #1 if ever mistaken for the real file.
- **Fix sketch**: Wrap the write+rename in `try { … } catch (e) { await fs.rm(tmpFile, { force: true }); throw e; }` so a failed/aborted rename never leaves residue; optionally sweep stale `.*.tmp` in `.data/` on startup.

## 4. Fixed-window limiter allows a 2× burst across the window boundary
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: rate-limit accuracy / abuse path
- **File**: src/lib/server/rate-limit.ts:42-48
- **Scenario**: A client sends `limit` requests in the final moments of one window, then `limit` more in the first moments of the next. Because the window is fixed (not sliding) and resets wholesale at `resetAt`, up to `2 × limit` requests land in a span far shorter than `windowMs` (e.g. 40 vote POSTs in a couple of seconds against the documented 20/60s).
- **Root cause**: Fixed-window counter with a hard reset (`now > bucket.resetAt` → seed `count: 1`) and no carryover or sub-window weighting. The boundary uses strict `>`, so the request landing exactly at `resetAt` is still counted in the *old* window — a minor off-by-one on top of the burst gap.
- **Impact**: UX/abuse — the advertised throttle is effectively double at the seam, weakening the only abuse guard on the unauthenticated voting endpoints (already further multiplied per-instance in serverless, but that part is documented design).
- **Fix sketch**: Switch to a sliding-window or token-bucket counter, or track two adjacent fixed buckets and sum the weighted overlap; if keeping fixed-window, document the 2× burst as accepted.

## 5. A hung update callback wedges every queued writer on that key forever
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: liveness / head-of-line blocking
- **File**: src/lib/fileLock.ts:18-29
- **Scenario**: An `fn` passed to `withWriteLock` never settles (a disk operation that hangs, or a future caller passing an `update()` that awaits something stuck). Every subsequent request for the same key (`"votes"`, `"feature-boosts"`, etc.) chains off the unresolved promise and blocks indefinitely.
- **Root cause**: The promise-chain mutex has no timeout or abort. The chain advances only when the previous `fn` settles; there is no watchdog to break a wedged link, so one stuck operation stalls all serialized writers on that file with no recovery short of process restart.
- **Impact**: UX degradation — voting silently stops responding for one feature-area key while other keys keep working; hard to diagnose because nothing errors.
- **Fix sketch**: Race `fn()` against a timeout inside `withWriteLock` (e.g. `Promise.race([fn(), rejectAfter(ms)])`) so a wedged operation rejects the caller and frees the chain; the existing error-swallowing chain link already keeps later callers unblocked once it settles.
