# Server-Side Vote Persistence — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 3, Low: 1)

## 1. "Cross-process file lock" is actually an in-process mutex — lost-vote window in any multi-process deployment
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: lock-scope-assumption-undocumented
- **File**: `src/lib/fileLock.ts:12`
- **Scenario**: The context map (and callers' comments, e.g. `src/app/api/votes/storage.ts:5` "guarded by withWriteLock ... to prevent TOCTOU races") describe cross-process vote idempotency, but `withWriteLock` serializes via a module-level `Map<string, Promise>` — it only protects requests inside ONE Node process. Run the FS fallback under Node cluster/PM2, two Vercel/lambda instances sharing a mounted volume, or a stray second `next start`, and two concurrent POSTs to `/api/votes` both read `votes.json`, both write, and the loser's vote (or un-vote) is silently clobbered by the winner's last-writer-wins rename.
- **Root cause**: The single-process deployment assumption is nowhere recorded; the module docstring says "In-process mutex" but nothing at the store/route layer states that the FS fallback is only safe single-process, and the surrounding docs/context call it a "cross-process file lock" (drift).
- **Impact**: Silent vote data loss under multi-process serving of the FS fallback; also a documentation/context-map drift that will mislead the next maintainer into trusting the lock across processes.
- **Fix sketch**: Either (a) document the constraint loudly ("FS fallback is single-process only; production MUST set Supabase env") in `fileLock.ts`, `json-file-store.ts`, and the context map, and optionally assert/log when `process.env.VERCEL` is set without Supabase; or (b) make it real with an advisory lock file (e.g. `proper-lockfile`-style `mkdir`/`wx` lock with stale timeout) around `updateJsonFile`.

## 2. Lock-key ↔ file-name coupling is by convention only, and the votes route hand-rolls what `updateJsonFile` already provides
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: implicit-lock-key-contract
- **File**: `src/lib/server/json-file-store.ts:58`
- **Scenario**: `updateJsonFile(lockKey, fileName, …)` takes the lock key and the file name as two independent strings; nothing enforces that a given file is always guarded by the same key. Today `"feature-boosts"→boosts.json`, `"feature-requests"→requests file`, and votes bypasses the helper entirely (`src/app/api/votes/route.ts:180` wraps `withWriteLock("votes")` around manual `readVotes`/`writeVotes`). A future caller touching `votes.json` under a different key (or via bare `writeJsonFile`) silently gets zero mutual exclusion.
- **Root cause**: The key/file invariant lives only in each call site's discipline; the API shape invites divergence, and the votes route predates (or ignores) the shared RMW helper so there are two patterns for the same operation.
- **Impact**: Latent TOCTOU reintroduction the moment a second writer to any store file picks a different lock key; extra cognitive load deciding which of the two RMW patterns to copy.
- **Fix sketch**: Derive the lock key inside `updateJsonFile` from `fileName` (drop the `lockKey` parameter), and migrate `votes/route.ts` POST to `updateJsonFile("votes.json", …)` returning the action from the updater. One pattern, invariant enforced by construction.

## 3. Vote toggle has undocumented three-way semantics — a client that sends email can never un-vote
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: happy-path-toggle-semantics
- **File**: `src/app/api/votes/route.ts:138`
- **Scenario**: POST is nominally a toggle, but when the voter already has a vote AND the body carries a valid email, both backends update the email and return `{ action: "email_saved" }` instead of removing the vote (Supabase path `route.ts:138-145`, FS path `route.ts:187-192`). A client that includes the stored email on every request (a natural implementation once the user has supplied it) hits `email_saved` forever and cannot remove its vote. Meanwhile GET never reveals whether an email is on file, so the client can't know it should omit it.
- **Root cause**: Three response actions (`added`/`removed`/`email_saved`) encode a mixed toggle+update contract that is not written down anywhere — no comment in the route, no API doc — and the correct client behavior (only send email once) is an unstated assumption.
- **Impact**: Real risk of a "can't un-vote" logic bug on any client rewrite, plus an untestable contract: whether FS and Supabase paths agree on this branch is only guaranteed by parallel-maintenance discipline.
- **Fix sketch**: Document the contract in the route header (states × inputs → action table) and make intent explicit in the API: e.g. accept `{ intent: "toggle" | "save_email" }` (defaulting to today's behavior for back-compat), or at minimum have GET return a `hasEmail` boolean per user vote so clients can implement the send-once rule.

## 4. Rate limiter: fixed window bursts 2× the limit, per-instance memory multiplies it, and 20/60s carries no recorded reasoning
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: rate-limit-magic-numbers
- **File**: `src/lib/server/rate-limit.ts:42`
- **Scenario**: The limiter is a fixed window: a client can spend 20 requests at second 59 and 20 more at second 61 — 40 in ~2s, double the intended ceiling. Separately, `buckets` is per-process memory, so with N serverless instances the effective limit is `limit × N`; the only caveat recorded anywhere is "Resets on deploy" (`src/app/api/votes/rate-limit.ts:2`), which understates both. And the chosen numbers — 20/min for votes, 5-minute cleanup cadence — have no rationale recorded (why 20? enough for a 4-feature toggle burst? arbitrary?).
- **Root cause**: Algorithm choice (fixed window vs sliding/token bucket) and the multi-instance weakening are undocumented assumptions; limits are magic numbers.
- **Impact**: Abuse ceiling is 2×–2N× what the code appears to promise; future tuning is guesswork because nobody recorded what 20/min was sized against.
- **Fix sketch**: One honest doc block on `isRateLimited` stating fixed-window burst behavior and per-instance scope ("real cross-instance limiting needs Redis/DB", matching the note already in `request.ts:61`), plus a one-line rationale next to `limit: 20, windowMs: 60_000` in `votes/rate-limit.ts`. Upgrade to a sliding window only if abuse is actually observed.

## 5. Bucket map grows unbounded between 5-minute sweeps when the key source is attacker-mintable
- **Severity**: Low
- **Agent**: ambiguity_guardian
- **Category**: unbounded-bucket-growth
- **File**: `src/lib/server/rate-limit.ts:8`
- **Scenario**: Off-platform without `TRUST_PROXY`, `getClientIp` falls back to a fingerprint hashed from client-controlled headers (`src/lib/server/request.ts:62-72`) — an attacker can mint a brand-new key (fresh UA/XFF per request) and thus a new `Bucket` on every single request. Expired buckets are only reclaimed by the 5-minute `setInterval` sweep, so between sweeps the Map grows one entry per request with no cap.
- **Root cause**: Cleanup is time-driven only; there is no size bound or opportunistic eviction on insert, and the interaction with the deliberately spoofable fingerprint fallback wasn't considered.
- **Impact**: Bounded-but-real memory growth under a header-rotation flood (hundreds of MB at sustained high RPS within a window); not user-facing today, hence Low.
- **Fix sketch**: Cheap guard in `isRateLimited`: when `buckets.size` exceeds a cap (e.g. 50_000), run `cleanupExpiredBuckets()` inline and, if still over cap, refuse new-bucket creation by treating the request as limited. Two lines of comment recording the cap's reasoning.
