# Bug Hunter Fix Wave 1 — Security / Auth / Vote Integrity

> 6 commits, 8 findings closed (3 Critical + 5 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.

This wave bundled findings around a single mental model: **"client input
trusted by the server when it shouldn't be."** Auth identity, voter
identity, IP attribution, and PII payloads all fed into trust decisions
without sufficient validation, scrubbing, or platform-level grounding.
Closing them in one session kept the trust-boundary changes coherent —
the same XFF hardening, for example, paid off in three different routes.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `e367c71` fix(auth): default-deny demo signin in production builds | auth #1 | C | `dev.ts`, `SignInPrompt.tsx`, `authStore.ts` |
| 2 | `e52f2d1` fix(server): trust platform IP / x-vercel-forwarded-for, gate x-forwarded-for on TRUST_PROXY | server-infra #5, voting #1 (IP half), waitlist #2 | H+H+H | `lib/server/request.ts` |
| 3 | `57e6fc9` fix(votes): tighten voterId validation, use trusted-IP rate-limit key | voting #1 (identity half) | C | `lib/validation.ts`, `api/votes/route.ts` |
| 4 | `d31b88e` fix(sentry): scrub event.contexts, event.extra, event.tags, event.user.id, frame vars | server-infra #1 | C | `lib/sentry-pii.ts` |
| 5 | `e4f9b20` fix(auth): wipe full SWR cache + system + filter store on logout | auth #2, #3, #4 | H+H+M | `lib/clearUserCaches.ts`, `stores/systemStore.ts` |
| 6 | `592f873` fix(waitlist): only show success view after server confirms 200 | waitlist #1 | H | `components/WaitlistModal.tsx` |

(The `docs(harness): bug-hunt 2026-05-10 audit reports + INDEX` commit
landed first — it adds the 25 per-context reports and the INDEX so the
`Refs:` lines on each fix commit resolve.)

## What was fixed (grouped by sub-pattern)

### 1. Auth bypass via "Try Demo" button (commit 1)

The sign-in screen rendered a `Try Demo` button on every non-DEV build
and called `signInAsDemo`, which wrote `isAuthenticated: true` and a
fake `mock-token-dev` directly into the auth store. `AuthGuard` only
checks `isAuthenticated`, so the entire `/dashboard` shell would mount
on a fake session — and several views fall back to mock data, presenting
it as if real. The button is now gated behind an explicit
`NEXT_PUBLIC_DEMO_ENABLED=true` opt-in (always on in DEVELOPMENT mode);
the action also refuses to mint a session when the flag is off, so a
stale CDN HTML or page-script tampering can't bypass the render gate.

### 2. Spoofable IP attribution (commit 2)

`getClientIp` unconditionally read the leftmost `x-forwarded-for` hop
and returned it. That value is whatever the requester chose to put in
the header on any deploy where the request reaches the server without
a trusted proxy in front. The function was used by `feature-requests`
rate-limiting, votes rate-limiting, and waitlist rate-limiting, so the
practical effect was a trivial bypass of all three by varying the
header per request. The new trust order is: platform `req.ip` →
`x-vercel-forwarded-for` (set by Vercel's edge, not attacker-controlled)
→ (only when `TRUST_PROXY=true`) `x-real-ip` / `x-forwarded-for`
leftmost → `"unknown"`. This single change closed the IP half of three
separate findings.

### 3. Vote-stuffing via trivial `voterId` (commit 3)

`/api/votes` accepted any string with `length >= 8` as a voterId, and
read its rate-limit IP from inline XFF parsing rather than the helper.
After the IP was hardened in fix 2, the second half of the exploit was
the voterId itself — the route now requires the value to match a 16-64
character url-safe-base64 shape (covers UUID, nanoid, and similar
client-generated IDs) and routes through `getClientIp`. Real voting
integrity still requires a server-issued signed cookie + DB-level
`UNIQUE(feature_id, voter_id)` — the `isValidVoterId` helper documents
those follow-ups so the next wave can pick them up cleanly.

### 4. PII leak via Sentry contexts (commit 4)

`scrubEvent` scrubbed `event.message` and `event.exception.values[].value`
but didn't touch the structured payloads callers attach via the
`captureException` hint (`contexts`, `extra`, `tags`) or the
auto-collected stack-frame `vars`. Persona/execution UUIDs passed via
`Sentry.captureException(err, { contexts: { persona: { id } } })` (e.g.
`src/lib/api.ts:261`) and `Sentry.setContext("dashboardErrorBoundary",
…)` were leaking to Sentry un-redacted, defeating the entire `sentry-pii`
module the project ships for compliance. A new recursive `scrubData`
walker (depth-capped at 6 to keep `beforeSend` cheap on the request
path) now runs `scrubPii` on string leaves, drops `SENSITIVE_FIELDS`
keys outright, and walks objects + arrays. Wired into `contexts`,
`extra`, `tags`, breadcrumb nested objects, exception stack-frame vars,
and `event.user.id` (which was previously left intact while the
neighbouring `email` / `ip_address` / `username` were stripped).

### 5. PII bleed across user logout (commit 5)

`clearUserScopedCaches` mutated only SWR keys where `Array.isArray(key)
&& key[0] === "dashboard"`. The string-keyed caches behind
`useSWR("observability", …)` and `useSWR("usage", …)` — which hold
per-user tool-usage and performance metrics — survived logout, so the
next user briefly saw the previous user's data until the new fetch
resolved. `systemStore.health` was never reset (the store had no
`reset()` method); `dashboardFilterStore.personaId` persisted to
localStorage across user switches, silently filtering the new user's
dashboard by the previous user's persona. The SWR predicate is now
`() => true` (full wipe — there's no shared non-user-scoped data in the
dashboard SWR namespace that needs preserving), `systemStore` got a
`reset()` method, and the filter store is reset alongside the others.

### 6. Optimistic waitlist confirmation (commit 6)

`WaitlistModal.handleSubmit` set `status="success"` and incremented the
displayed count *before* awaiting `fetch`. On 4xx / 429 / network
failures the success panel — including the email echo and the
Share-with-a-friend referral button — rendered for 50 ms–15 s while the
request was in flight. The user could screenshot or share that view
even though no row was ever written; the eventual error revert kept
`submittedEmail` populated. The submit button's existing
`status === "loading"` spinner branch was unreachable dead code because
the loading state was never set. Now `setStatus("loading")` fires
synchronously on submit, the spinner branch lights up, and `success` /
`duplicate` only flip on `res.ok`. `submittedEmail` is also deferred
until the success path runs.

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Lint errors on changed files | (deferred per pipeline rules) | not measured |
| Wave-1 commits | 0 | 6 (+ 1 docs commit) |
| Critical findings closed | 0 / 9 | 3 / 9 |
| High findings closed | 0 / 75 | 5 / 75 |

## Cumulative status (after wave 1)

- 8 of 178 findings closed (4.5%).
- 3 of 9 criticals closed; 6 remain (4 in dashboard state stores, 2 in
  streams + observers).
- 5 of 75 highs closed (auth, votes, waitlist, server-infra, demo bypass).

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | — |
| 3 | C. SSE + streaming reliability | — |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | — |
| 5 | E. SSR / hydration / theme + i18n flash | — |
| 6 | F. Data integrity / SEO / ordering | — |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | — |

## Patterns established (catalogue items 1–4)

These are the durable patterns extracted from this wave. Future scans
can grep for these shapes proactively instead of re-discovering them.

1. **Default-deny on dual-mode flags** — when a single env var (e.g.
   `DEVELOPMENT`) gates *both* "use mock data" and "render unauthenticated
   demo UI," the negation reads (`!DEVELOPMENT`) become opaque and bugs
   in the negation surface in production. Split the flag: each surface
   that decides "should this be reachable in prod?" should have its own
   explicit `*_ENABLED` env var. When in doubt, default-deny.
2. **`X-Forwarded-For` is attacker input** — never read XFF unconditionally
   for any security-relevant decision. Trust order: platform `req.ip` →
   platform-set forwarding header (`x-vercel-forwarded-for`) → trusted
   reverse-proxy header (gated on explicit `TRUST_PROXY`) → opaque
   `"unknown"`. Never trust the leftmost XFF hop without a known proxy
   chain — it's the *original requester's* claim, not a proxy's.
3. **PII scrubbing must be recursive** — a scrubber that walks only top-level
   string fields (`event.message`, `exception.value`) misses every
   structured payload that Sentry, OpenTelemetry, or Winston-style
   loggers attach via `contexts` / `extra` / `tags` / `metadata`. Bake a
   depth-capped walker in from day one; treat any field marked as
   "structured payload" as a recursive scrub target unless it's
   explicitly known to be PII-free.
4. **Logout = wipe everything user-scoped** — explicit allowlists for
   "what to clear on logout" decay silently as new caches are added in
   different keying schemes. The safe default is to wipe the entire
   client-side cache (SWR `() => true`, every Zustand store with a
   `reset()`, every persisted store) and let the new session refetch.
   Preserved-across-logout state should be the rare exception, not the
   rule, and should be opt-in via an allowlist in the *opposite*
   direction.

## What remains (across the open themes)

- **Theme B (State corruption)** — 4 critical-level findings still open:
  reviews undo-on-unmount loses data, `pollPaused` dead code,
  personaStore concurrent optimistic updates, eventStore retry-on-success
  poison loop. These cluster around three Zustand stores; expect 6-7
  fixes spanning the personaStore / reviewStore / eventStore mental
  model.
- **Theme C (SSE + streaming)** — 1 critical (execution SSE crash storm)
  + reconnect-storm and no-heartbeat findings. Two SSE proxies share the
  same shape; fixing both at once is more efficient than one-at-a-time.
- **Theme D (Animation lifecycle)** — 1 critical (`useCanvasCompositor`
  IO leak) + ~15 visibility/cleanup findings. Many would be closed by a
  shared `useVisibilityPause` hook.
- **Themes E, F, G** — no criticals, but bigger surface area; can be
  picked up after the criticals are closed.

Recommended next wave: **Theme B (State corruption)** — it has 4
remaining criticals, all in dashboard surfaces a real operator interacts
with daily, and the fixes share a single mental model around concurrency
primitives in Zustand stores.
