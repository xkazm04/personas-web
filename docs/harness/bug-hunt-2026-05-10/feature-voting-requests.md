# Bug Hunter — Feature Voting & Requests

> Total: 8 findings (Critical: 1, High: 4, Medium: 2, Low: 1)
> Scope: 17 files
> Date: 2026-05-10

---

## 1. Vote-stuffing via attacker-controlled `voterId` and trivial X-Forwarded-For spoofing

- **Severity**: Critical
- **Category**: Security / Voting integrity
- **File**: `src/app/api/votes/route.ts:91-172`, `src/app/api/votes/rate-limit.ts`
- **Scenario**: The endpoint accepts ANY `voterId` from the request body (only check is `length >= 8`). An attacker writes a 5-line script that POSTs to `/api/votes` with `featureId="enterprise"` and a fresh random `voterId` per request. To bypass per-IP rate limiting they set `X-Forwarded-For: <random-IPv4>` on each request — `route.ts` reads only the first comma-separated entry of that header without validating against a trusted proxy chain (`x-forwarded-for?.split(",")[0]?.trim() ?? "unknown"`). Each request then gets its own rate-limit bucket. Result: a single attacker can inject thousands of votes per minute for any of the four allowed features. Supabase has no uniqueness constraint enforced at the API level beyond an existence check (which is per-voter, so distinct voter IDs are all "new").
- **Root cause**: (a) Identity is fully client-asserted — there's no signed cookie, no captcha, no proof-of-work, no Supabase auth. (b) Rate limiting trusts `X-Forwarded-For` blindly; in Vercel/Edge deployments it's safer to use the platform-provided `req.ip` or to take only the *last* hop from XFF (the trusted proxy hop), not the first (which is purely client-supplied). (c) `ALLOWED_FEATURES` is a set of 4 entries, so the search space for amplification is tiny.
- **Impact**: Marketing-dashboard signal is meaningless; competitors or trolls can flip "what we build next" to whatever they want. Direct business decision corruption. Also enables filling the `feature_votes` Supabase table with garbage rows (cost + cleanup).
- **Fix sketch**:
  - Bind `voterId` to a server-set HttpOnly signed cookie (HMAC of a random ID + issued-at), and reject body voterIds that don't match the cookie.
  - Use a stable IP source: prefer `req.ip` (Next.js Edge) or take the last entry of XFF when behind a known proxy count; better, use Vercel's geo headers or a token-bucket keyed by the signed cookie.
  - Add a low-friction captcha (Turnstile) for first vote per session, plus a much tighter global rate limit (e.g., 5 votes / IP / hour after the per-minute window).
  - Add a UNIQUE constraint on `(feature_id, voter_id)` in Supabase and rely on conflict instead of read-then-insert.

---

## 2. TOCTOU race in Supabase vote toggle (read-then-insert without uniqueness)

- **Severity**: High
- **Category**: Race condition / Data integrity
- **File**: `src/app/api/votes/route.ts:126-172`
- **Scenario**: Two concurrent POSTs from the same `voterId` for the same `featureId` (double-clicks, retries, or parallel tabs). Both execute `select().eq().eq().limit(1).maybeSingle()` simultaneously — both get `existing = null`. Both then `insert`. If there's no DB-level UNIQUE constraint on `(feature_id, voter_id)`, you end up with TWO rows for the same vote. Subsequent toggle attempts will see "existing" via `maybeSingle()` and may fail with `PGRST116` "more than one row" — toggling becomes permanently broken for that voter. GET counts are also inflated by 1 because they're computed by row counting (`counts[row.feature_id] = (counts[row.feature_id] || 0) + 1`).
- **Root cause**: The pattern `SELECT … MAYBE_SINGLE → INSERT` is an atomicity antipattern; the only safe equivalent is an INSERT with `ON CONFLICT` (Postgres `upsert`) plus a UNIQUE constraint, or a wrapping transaction. The filesystem path correctly uses `withWriteLock` to serialize, but the Supabase path has no such guard.
- **Impact**: Duplicate vote rows, broken toggle for affected voters, wrong counts. Future `delete().eq().eq()` will remove all duplicates at once, so a single un-vote can decrement count by 2.
- **Fix sketch**: Add `UNIQUE(feature_id, voter_id)` migration. Replace the read-then-insert with `sb.from("feature_votes").upsert({...}, { onConflict: "feature_id,voter_id", ignoreDuplicates: true })`. For un-vote (`delete`), accept the unique violation gracefully. Ideally use `maybeSingle()` only as a probe and never rely on it for atomicity.

---

## 3. In-memory rate limiter is per-process — useless on serverless / multi-instance

- **Severity**: High
- **Category**: Security / Latent failure
- **File**: `src/lib/server/rate-limit.ts:8`
- **Scenario**: `const buckets = new Map<string, Bucket>()` lives in module scope of a single Node process. Vercel (the obvious deploy target for a Next.js 16 marketing site) routes requests across many lambdas/edge instances; each has its own empty `buckets` map. With `limit: 20` per IP and N instances, the *effective* limit is `20 * N`. Worse, a cold start clears the map, so a request flood that triggers cold starts gets nearly unlimited throughput on the new instances. The same applies to `feature-requests` (limit 10) — easily defeated by traffic spreading across instances.
- **Root cause**: In-memory counters are inherently process-local and the comment "resets on deploy" understates the problem (it actually resets per cold start and is duplicated per warm instance). No external store (Redis, Upstash, Vercel KV) is used.
- **Impact**: Combined with finding #1 (XFF spoofing), the rate limiter offers near-zero protection against motivated abuse. Spam to `feature_requests` table can balloon storage and Supabase row count quickly, and vote stuffing scales linearly with deployed instance count.
- **Fix sketch**: Switch to Upstash/Vercel KV-backed rate limiting (e.g., `@upstash/ratelimit`), keyed by the signed-cookie identity from finding #1 (or by IP as a fallback for unauthenticated voters). Keep the in-memory limiter only for local dev.

---

## 4. `withWriteLock` swallows all errors silently — failed writes look successful in the lock chain

- **Severity**: High
- **Category**: Silent failure
- **File**: `src/lib/fileLock.ts:21-29`
- **Scenario**: The lock chain stores `next.then(() => {}, () => {})` so subsequent callers always proceed regardless of the previous outcome — that's correct for *the chain*. However, look at line 19: `const next = prev.then(fn, fn);`. The second argument to `.then` runs `fn` when `prev` rejected, meaning if the *previous* lock holder threw, the *current* caller's `fn` runs as the rejection handler. That's actually fine semantically (we want the next caller to run regardless of prior errors). The real bug is elsewhere: in `writeJsonFile` (`src/lib/server/json-file-store.ts:22-30`) the temp-file-then-rename pattern can leak temp files if `fs.rename` fails (e.g. cross-device on weird mounts, file in use on Windows where another process holds the target open). The error bubbles up to `withWriteLock`, but the votes/feature-requests handlers don't wrap the call in `try/catch`, so the request returns a 500 with no log, and the stale `.tmp` file remains in `.data/` forever, eventually filling disk.
- **Root cause**: (a) No cleanup of orphaned `.tmp` files on startup or on rename failure (`unlink` the temp file in a `finally` if the rename didn't happen). (b) No structured logging on Supabase or fs errors; lookup/insert errors return `"Failed to record vote"` without `console.error(error)`, so the team sees only the generic 500 with no hint of root cause.
- **Impact**: Disk slowly fills on dev/preview environments. Production debugging is harder than necessary because Supabase errors are stringified to a generic message and never logged. Silent corruption of vote state on Windows is a real risk because of file-locking semantics differing from POSIX.
- **Fix sketch**: In `writeJsonFile`, wrap rename in `try { … } catch { await fs.unlink(tmpFile).catch(() => {}); throw; }`. Add `console.error("[votes] supabase error", lookupError)` (and equivalent) before each generic 500 in `route.ts`. On boot, sweep `.data/.*-*.tmp` older than 1 minute.

---

## 5. Filesystem fallback is process-local — `withWriteLock` does NOT protect across instances

- **Severity**: High
- **Category**: Race condition / Data divergence
- **File**: `src/lib/fileLock.ts:12`, `src/lib/server/json-file-store.ts`, `src/app/api/votes/route.ts:176-203`
- **Scenario**: The lock map is in-process. If the FS fallback is ever used in any multi-process deployment (PM2 cluster mode, multiple Vercel lambdas warm at once, dev server with experimental `compress`/cluster, or simply two Node servers behind a load balancer), two processes can both read `votes.json`, both compute their mutated copy, and both run the temp-file-rename — the second rename wins and silently loses the first writer's mutation. Atomic rename does NOT make this safe; only a *file system advisory lock* (e.g. `proper-lockfile`) or a single-writer architecture would. The comment on the lock module ("In-process mutex") is honest, but the storage doc claims it prevents TOCTOU — that's only true within one process.
- **Root cause**: File-store fallback is described as "local dev only" in `feature-requests/route.ts` but `votes/route.ts` makes no such qualification, and there's no env-guard preventing the FS path from running in production if `hasSupabaseEnv()` returns false (e.g., a misconfigured deploy with missing Supabase env vars). On Vercel, two warm lambdas would each have their own `.data/votes.json` *in their own ephemeral filesystem* — votes literally vanish across requests because each lambda's filesystem is independent.
- **Impact**: Votes recorded on lambda A are invisible to lambda B; counts shown to users are non-deterministic. With `Promise.all` racing in GET, even two concurrent reads can return different totals. Worst case: production runs without Supabase env vars set and looks superficially functional but loses ~half of all votes.
- **Fix sketch**: Refuse to start (or return 503) when `hasSupabaseEnv()` is false and `process.env.NODE_ENV === "production"`. Log a loud warning at boot. If multi-process FS is ever a real requirement, use `proper-lockfile` for cross-process advisory locking on the file. Document that the FS path is *strictly* single-process dev only.

---

## 6. Stored XSS / spam vector: feature-request `text` is unsanitized and unbounded by length on legacy clients

- **Severity**: Medium
- **Category**: Security (stored content) / Abuse
- **File**: `src/app/api/feature-requests/route.ts:70-90`, `src/components/sections/feature-voting/components/CustomFeatureRequest.tsx`
- **Scenario**: `text` is trimmed and length-checked (`<= 1000`) on the server, then inserted verbatim into Supabase `feature_requests`. There is no normalization of control characters (NUL, BIDI override, zero-width chars), no HTML escaping, and no profanity / spam filtering. If/when this content is rendered in any admin UI or email digest without escaping, it's a stored-XSS vector. Even without rendering, the lack of normalization allows: BIDI-override attacks against admins reviewing the queue, zero-width unicode for cache-busting / dedupe bypass, and trivial spam (1000 chars × 10 req/min/instance × N instances per finding #3 = effectively unlimited noise). There's also no per-`voterId` request limiter for feature requests at all — only IP, so a single browser session can spam under the per-IP limit indefinitely, and across many IPs (proxy rotation) without bound.
- **Root cause**: No content sanitization, no spam heuristics (URL count, repeated chars, banned-word list), no per-session limiter, no captcha. Comments are stored only client-side (localStorage), so server-side moderation isn't even possible there — but `feature_requests` IS persisted server-side and reviewed by humans.
- **Impact**: Stored content in Supabase becomes a swamp of spam/nonsense within hours of public launch; admin reviewing the table risks BIDI-override surprises in their terminal. If the text is ever rendered into an HTML page (e.g. roadmap page, admin dashboard), and not properly escaped, this is XSS.
- **Fix sketch**: Strip control chars and normalize to NFC: `text.normalize("NFC").replace(/[\0-\x1F\x7F‪-‮⁦-⁩]/g, "")`. Cap to 500 chars (1000 is generous for a "feature request"). Add a Turnstile captcha. Add basic heuristics: reject if URL count > 1, reject if same `voterId`-like cookie has submitted in the last 5 minutes (regardless of IP). When rendering, always escape (use React text nodes, never `dangerouslySetInnerHTML`).

---

## 7. GET `/api/votes` returns a foreign user's email when collision occurs on `voter_id`

- **Severity**: Medium
- **Category**: Privacy / PII leak
- **File**: `src/app/api/votes/route.ts:54-60`, 73-79
- **Scenario**: `voterId` is a client-generated anonymous identifier (per the file header comment) — there is NO server-side guarantee of uniqueness, no entropy requirement beyond `length >= 8`. If two users (or one malicious user) supply the same `voterId`, GET returns *all* of that voterId's rows, and `userEmail` is set to whichever email row is iterated last. A user who never typed an email could see another user's email returned in the GET response (and pre-filled in the `NotifyInput` field via `existingEmail`). The condition is reproducible: an attacker who learns or guesses a target's voterId (e.g. by exfiltrating it from a localStorage XSS elsewhere on the site, or by enumerating short voterIds) can read that user's email by calling GET with `?voterId=<target>`.
- **Root cause**: Email is keyed off a self-asserted, low-entropy client identifier with no authentication. The GET endpoint has no rate limiting at all (only POST does), so enumeration is unrestricted.
- **Impact**: Email address disclosure (PII). The route's header comment claims "voter_id: not PII" — but pairing voter_id with email *makes* voter_id a key to PII, undermining the policy.
- **Fix sketch**: Require `voterId` to come from a server-issued signed cookie (see finding #1), so GET will only return emails for the cookie-bound identity. Add rate limiting to GET. Increase `voterId` minimum to 32 chars of base64 entropy. Consider not returning email at all in GET; instead set a separate cookie flag "user has email recorded for feature X".

---

## 8. Comment text is stored only in localStorage but the protocol invites users to think they're communicating

- **Severity**: Low
- **Category**: UX / silent failure (data loss expectation mismatch)
- **File**: `src/components/sections/feature-voting/index.tsx:47-66`, `src/components/sections/feature-voting/data.ts:122-140`
- **Scenario**: `handleAddComment` calls `writeComments(next)` which writes to `localStorage`, then renders the comment in the thread. The footer copy reads "Stored in your browser … votes and comments are saved locally and are not shared with other users", which is correct, but the UI presents a full conversation thread (CommentThread, replies, anonymous author names) that strongly implies social engagement. Users will type valuable feature feedback as a "comment" thinking they're talking to the team — and no API call is made; the data dies with `localStorage.clear()` or browser change. The disclaimer is in 12px gray text below the fold while the input prominently invites engagement. Worse, if `localStorage` is unavailable (Safari private mode quota, third-party-cookie blocks), `writeComments` silently swallows the error in `try/catch` and the comment also won't persist across reload.
- **Root cause**: Demo mode is more convincing than its disclaimer admits. Errors during `localStorage` writes are swallowed without user feedback.
- **Impact**: Loss of valuable user feedback that users believe was submitted. Trust erosion when users return and find their comment gone (or never see a reply).
- **Fix sketch**: Either (a) wire comments to a real backend endpoint with moderation (and remove the demo disclaimer), or (b) make the demo nature unmissable — label the section "Local-only demo" near the input, badge each comment with a "saved on this device" indicator, and surface localStorage write failures via a toast. Surface the existing "Demo" pill more prominently next to the comment input, not just at the section header.

---

### Notes on items intentionally not flagged

- The marketing-seed `votes` baked into `data.ts` is documented as an intentional display-only seed; not a bug.
- The `withWriteLock` chain's swallow-errors behavior is intentional for chain liveness; the silent-failure issue lives in the call sites and `writeJsonFile` cleanup (covered by #4).
- Email regex blocks the most dangerous chars and is bounded at 254 — adequate for this surface; not a finding.
- The DELETE endpoint is mentioned in the scope brief but is not implemented in the route file (only GET and POST exist). Either the scope brief is stale or DELETE is intentionally unsupported (toggle covers un-vote).
