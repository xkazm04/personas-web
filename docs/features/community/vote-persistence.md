# Server-Side Vote Persistence
> Server primitives backing the voting API: per-IP rate limiting, an atomic JSON file store, and an in-process write lock for read-modify-write idempotency · **Route:** n/a (server lib) · **Status:** Server primitives

## What it does
When the community votes on roadmap features (and boosts, comments, requests, waitlist signups), the request hits a Next.js API route running on the **Node server runtime**. These three server-only libraries do the unglamorous plumbing behind those routes: they throttle abusive clients, persist data to disk when Supabase isn't configured, and serialize concurrent writes so two simultaneous votes don't corrupt each other or double-count. None of this is user-visible — it's the durability and abuse-resistance layer under the voting endpoints. In production the routes prefer Supabase; the file store is the fallback that keeps local/preview deployments working without a database.

## How it works
Three independent primitives, composed by the API routes:

**In-process write lock** (`src/lib/fileLock.ts`). `withWriteLock(key, fn)` keeps a `Map<string, Promise<void>>` of per-key promise chains (`fileLock.ts:12`). Each call appends `fn` to the chain for `key` so mutating operations on the same file run strictly one-at-a-time, closing the TOCTOU window between read and write (`fileLock.ts:18-19`). The stored chain swallows errors via `.then(() => {}, () => {})` so one failed request can't break the chain for the next caller (`fileLock.ts:22-28`). The returned promise is the *un-swallowed* `next`, so the caller still sees rejections (`fileLock.ts:29`).

**Atomic JSON file store** (`src/lib/server/json-file-store.ts`). Data lives under `.data/` relative to `process.cwd()` (`json-file-store.ts:7`). `readJsonFile` reads + `JSON.parse`, returning a typed `fallback` on any error — missing file, bad JSON, permission (`json-file-store.ts:13-20`). `writeJsonFile` does an **atomic write**: `mkdir -p` the dir, write to a randomly-suffixed `.tmp` file, then `fs.rename` into place so readers never observe a half-written file (`json-file-store.ts:22-30`). `updateJsonFile(lockKey, fileName, fallback, update)` is the full read-modify-write: it wraps the read → `update()` → write in `withWriteLock` so the whole RMW is serialized (`json-file-store.ts:38-43`).

**Per-IP rate limit** (`src/lib/server/rate-limit.ts`). A fixed-window counter in a `Map<string, Bucket>` keyed by `${namespace}:${key}` (`rate-limit.ts:8,39`). On first hit (or after `resetAt` passes) it seeds `{ count: 1, resetAt: now + windowMs }` and returns `false`; otherwise it increments and returns `count > limit` (`rate-limit.ts:42-48`). A lazily-started `setInterval` sweeps expired buckets every 5 min and `unref()`s the timer so it never holds the process open (`rate-limit.ts:17-22`). The votes route uses it via a thin wrapper: namespace `"votes"`, key = client IP, **limit 20 / 60_000 ms** (`src/app/api/votes/rate-limit.ts:9-14`).

## Key files
| File | Role |
| --- | --- |
| `src/lib/fileLock.ts` | `withWriteLock` — per-key in-process promise-chain mutex serializing RMW operations |
| `src/lib/server/json-file-store.ts` | `readJsonFile` / `writeJsonFile` (atomic temp+rename) / `updateJsonFile` (locked RMW) over `.data/*.json` |
| `src/lib/server/rate-limit.ts` | `isRateLimited` — in-memory fixed-window per-`namespace:key` counter with self-cleaning buckets |
| `src/app/api/votes/rate-limit.ts` | Votes-specific wrapper: `namespace:"votes"`, 20 req / 60s per IP |
| `src/app/api/votes/storage.ts` | Vote/shipped storage abstraction; `readVotes`/`writeVotes` delegate to the JSON store |
| `src/app/api/votes/route.ts` | Consumer: GET counts, POST toggle; wraps FS branch in `withWriteLock("votes", …)` |
| `src/lib/server/request.ts` | `getClientIp` (trust-ordered IP resolution) feeding the rate-limit key |

## Data & state
- **Source:** filesystem JSON under `.data/` (`votes.json`, `shipped.json`, boosts/comments/requests/waitlist), used **only when Supabase env is absent** (`storage.ts:55-65`, `votes/route.ts:67-87`). **Stores:** module-level `Map`s — `locks` (per-key promise chains) and `buckets` (rate-limit windows); both are per-process, in-memory, non-durable. **API routes (consumers):** `src/app/api/votes`, `feature-boosts`, `feature-comments`, `feature-requests`, `waitlist` — all import the JSON store and/or shared rate-limit. **Types:** `RateLimitOptions`, `Bucket` (`rate-limit.ts:3-29`); `VoteEntry` / `VotesData` / `ShippedEntry` (`votes/storage.ts:20-40`).

## Integration points
- **`getClientIp`** (`src/lib/server/request.ts`) supplies the rate-limit `key`. It trusts `req.ip` → `x-vercel-forwarded-for` → (only if `TRUST_PROXY=true`) `x-real-ip`/`x-forwarded-for`, else a **coarse per-client header fingerprint** (`fp:<hash>` of UA + accept headers), falling back to `"unknown"` only when no headers are present. IPs/fingerprints feed rate limiting **only** and are never persisted (PII policy headers in `votes/route.ts:1-8`, `feature-boosts/route.ts`).
- **Supabase** is the production path; these primitives are the no-DB fallback. Routes branch on `hasSupabaseEnv()` (`storage.ts:44-46`) and only enter the locked FS path when it's false.
- **`server-only`** import in all three (and `request.ts`) hard-fails any client-bundle import.
- **`updateJsonFile`** is the preferred all-in-one RMW; the votes route instead composes `withWriteLock("votes", …)` + `readVotes`/`writeVotes` manually because it returns a `NextResponse` per branch rather than the new data (`votes/route.ts:175-202`).

## Conventions & gotchas
- **Serverless ephemerality — the big one.** `.data/` lives on the instance's local FS. On Vercel/Lambda-style deploys this is **ephemeral and per-instance**: writes vanish on redeploy/scale-down and are **not shared across concurrent instances**. The file store is a dev/preview/single-node convenience, not production durability — that's why Supabase is the real backend. The `unref`'d cleanup timer comment and route comments both note rate-limit state "resets on deploy" (`votes/rate-limit.ts:1`); the same caveat applies to the vote data itself.
- **The write lock is in-process only.** `withWriteLock` serializes within a single Node process. Across multiple serverless instances (or multiple Node processes on one box) there is **no cross-process lock** — `fs.rename` is atomic per-write, but two instances can still interleave read-modify-write and lose updates (last-rename-wins). The header docstrings frame this as "cross-process," but the implementation is a single-process `Map`; treat it as single-instance only. Concurrency safety holds **only** when one process owns `.data/`.
- **Lock contention / head-of-line blocking.** All mutations sharing a `key` are strictly serialized. A slow `update()` callback (or a slow disk) stalls every queued writer on that key. Errors are swallowed *in the chain* (so the chain survives) but surfaced to the *caller* — fine, but a hung `fn` would wedge the chain indefinitely (no timeout).
- **Rate-limit accuracy is approximate, not strict.** (1) It's a **fixed window**, not sliding — a client can burst `2 × limit` across a window boundary (last instant of one window + first of the next). (2) Buckets are **per-process and in-memory**, so N instances multiply the effective limit by ~N and a redeploy wipes counters. (3) Keying is only as good as `getClientIp`: when no trusted IP source exists it derives a coarse header fingerprint (`fp:<hash>` of UA + accept headers) so distinct clients get distinct buckets instead of all sharing one `"unknown"` bucket — spoofable entropy, not identity. Without `TRUST_PROXY`, spoofable `x-forwarded-for` is ignored for trust (good) but still folded into the fingerprint as entropy; the limiter only collapses to a single `"unknown"` bucket when a client sends no distinguishing headers at all.
- **No quota/size cap on `.data` files.** `writeJsonFile` serializes the whole array each time; vote/boost lists grow unbounded and are rewritten in full on every mutation — fine at community scale, O(n) per write at large n.
- **`server-only`** + Node runtime required: these use `fs`/`crypto` and must not run on the Edge runtime.

## Related docs
- [Feature Voting & Comments](feature-voting.md)
- [Feature index](../INDEX.md)
