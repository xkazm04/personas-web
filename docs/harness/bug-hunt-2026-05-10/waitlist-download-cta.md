# Bug Hunter — Waitlist & Download CTA

> Total: 7 findings (Critical: 0, High: 4, Medium: 2, Low: 1)
> Scope: 4 files (route handlers + 2 components) + 5 helpers consulted (validation, fileLock, json-file-store, rate-limit, request)
> Date: 2026-05-10

---

## 1. Optimistic "success" view shown BEFORE server confirms — false confirmation on validation/rate-limit/network failure

- **Severity**: High
- **Category**: Silent failure / UX integrity / data loss
- **File**: `src/components/WaitlistModal.tsx:196-217`
- **Scenario**:
  1. User clicks "Notify me" with an email the server will reject (e.g. server-side `isValidEmail` differs from client `EMAIL_RE`, address > 254 chars, platform mismatch, or 429 rate-limit hit).
  2. `handleSubmit` runs `setStatus("success")` and increments `waitlistCount` *before* awaiting `fetch`.
  3. The "You're on the list!" panel — including `AnimatedCheckmark`, the email echo, "What happens next" copy, and the **"Share with a friend"** button — renders for ~50–15000 ms.
  4. The user can click *Share* and copy the referral link (acting on the false belief they joined) before the response arrives. Even on rate-limit they're told they joined; they then never retry, and **no row is ever written**.
  5. On `!res.ok` the code sets `status="error"` and reverts count, but `submittedEmail` is left set, the success branch may have been screenshotted/shared, and analytics/external observers have already seen a "success" UI state.
- **Root cause**: Optimistic UI with no pessimistic gate for *known-failable* states. `setStatus("loading")` is never called anywhere in the file, so the spinner branch on line 506-510 and the `disabled={status === "loading"}` (line 503) are dead code.
- **Impact**: Confirmed-but-not-saved waitlist signups (silent data loss). Users share a link they shouldn't have. Inflated "join count" displayed to other clients via stale GET cache. Trust damage when promised email never arrives.
- **Fix sketch**:
  - Set `status="loading"` synchronously on submit; render the spinner/disabled button branch.
  - Only flip to `status="success"` (and increment count) **after** `res.ok && !data.duplicate`.
  - Drop the optimistic increment, or at minimum gate the success/share view behind a real `200`.
  - Rename `prevCount` rollback path; it's papering over a flaw rather than preventing it.

---

## 2. Rate limiter trivially bypassable via spoofed `X-Forwarded-For`

- **Severity**: High
- **Category**: Security / abuse / mass signup
- **File**: `src/lib/server/request.ts:4-10` consumed by `src/app/api/waitlist/route.ts:113`
- **Scenario**: Attacker sends:
  ```
  POST /api/waitlist
  X-Forwarded-For: 1.2.3.<random>
  ```
  Each request presents a fresh IP, so the in-memory bucket key `waitlist:1.2.3.<random>` is unique → `RATE_LIMIT_POST=5` is never hit. Combined with the unique `email + platform` dedup key (finding #4), an attacker pumps tens of thousands of synthetic emails into `.data/waitlist.json`.
- **Root cause**: `getClientIp` blindly trusts `x-forwarded-for` without verifying that the immediate peer is a known proxy (Vercel/Cloudflare). Next.js / `NextRequest.ip` (when behind Vercel) is not consulted.
- **Impact**: Total bypass of POST/GET rate limits. Mass-signup abuse, file growth on disk (waitlist.json grows unbounded → eventually OOM on read), inflated counts shown publicly via GET, possible PII flood for the launch email blast.
- **Fix sketch**:
  - On Vercel: trust only `x-vercel-forwarded-for` (or `req.ip`) — document that any other deployment must set a `TRUSTED_PROXY_IPS` allowlist.
  - Add a secondary throttle keyed on `email` (e.g., 1 signup per email per hour) so even a perfectly spoofed IP can't multi-write the same address.
  - Consider hCaptcha/Turnstile in front of the POST.

---

## 3. `parseJsonBody` is called without `maxBytes` — unbounded body DoS

- **Severity**: High
- **Category**: DoS / resource exhaustion
- **File**: `src/app/api/waitlist/route.ts:118` ; helper at `src/lib/server/request.ts:12-40`
- **Scenario**: `parseJsonBody<T>(req)` is invoked with no options. Inside, `maxBytes` is `undefined`, so the `content-length` short-circuit is skipped and `await req.json()` will buffer the **entire** body before validation runs. A malicious client posts a 100 MB JSON object (or a deeply nested one) and the handler happily parses it before discovering `email` is invalid.
- **Root cause**: Caller forgot to pass a limit; the helper defaults to "no limit". Combined with #2, this is unauthenticated and unrate-limited per attacker.
- **Impact**: Memory pressure on serverless (Vercel function memory cap → 5xx for legit users), CPU burn on JSON.parse, potential billable invocation time inflation.
- **Fix sketch**: `parseJsonBody<...>(req, { maxBytes: 4096 })` — the legitimate body is `{email, platform, earlyBeta}`, well under 1 KB. Also reject requests without `Content-Type: application/json`.

---

## 4. Cross-instance dedup race on serverless — duplicate-email guard relies on in-process `Set`

- **Severity**: High
- **Category**: Race condition / data integrity
- **File**: `src/app/api/waitlist/route.ts:66-89, 142-166`
- **Scenario**:
  - Vercel spins up two warm Lambda instances A and B.
  - User double-clicks (or replays the request); A and B each receive one POST for `alice@example.com / windows`.
  - Each builds its `dedupIndex` from a stale `.data/waitlist.json` snapshot (the file is **ephemeral** anyway — see header comment, but even on a non-ephemeral mount the disk read is not under a cross-process lock).
  - Both pass the `dedupIndex.has(key)` check, both `push` and `writeJsonFile` (atomic rename — last writer wins), so the file ends up with EITHER one or two entries depending on timing — and the count returned to A and B is each `1`. The final state is unpredictable.
- **Root cause**: `withWriteLock` is a `Map<string, Promise>` *inside the JS module* — it serializes only within a single Node.js process. The README at the top of the route admits the storage is non-durable but the *application logic* still asserts dedup as a guarantee.
- **Impact**: Duplicate rows for the same email/platform; lost rows on cold start; counts diverge between concurrent instances.
- **Fix sketch**: Move to Supabase (already integrated per the file header) with a `UNIQUE(email, platform)` constraint and `INSERT ... ON CONFLICT DO NOTHING RETURNING count`. Treat the JSON-file path strictly as a dev seam.

---

## 5. `/api/download` redirect cached by browsers/CDNs — stale binary served after release rollback

- **Severity**: Medium
- **Category**: Caching / latent failure
- **File**: `src/app/api/download/route.ts:68-78`
- **Scenario**: `NextResponse.redirect()` defaults to status 307 with no `Cache-Control` header. Some CDNs (and Chromium's HTTP cache for 301/302/308 responses) will cache it; with 307 the risk is smaller but still real for intermediaries. After we yank a malicious or broken release and flip `NEXT_PUBLIC_DOWNLOAD_URL`, users with a cached redirect still hit the old artifact URL. There is also no `Cache-Control: no-store` on the fallback (`/#download`), so a deploy that *adds* a download URL still shows the waitlist modal to users with the cached fallback redirect.
- **Root cause**: Response headers not set; relying on framework defaults.
- **Impact**: Users download yanked/malicious binaries; security rotation has long tail.
- **Fix sketch**: Return `NextResponse.redirect(DOWNLOAD_URL, { status: 302, headers: { "Cache-Control": "no-store, must-revalidate" } })`; add the same headers on the fallback path.

---

## 6. Email regex accepts non-RFC strings; no Unicode normalization before dedup

- **Severity**: Medium
- **Category**: Input validation / dedup correctness
- **File**: `src/lib/validation.ts:8-13` and `src/app/api/waitlist/route.ts:127`
- **Scenario**:
  - The regex allows characters that aren't valid in a real address (e.g. multiple `@`-less segments are blocked, but consecutive dots `a..b@x.io`, addresses starting with `.`, or addresses with Unicode look-alikes like `аlice@example.com` (Cyrillic `а`) all pass).
  - Server normalizes via `email.trim().toLowerCase()` only — no Unicode NFC normalization, no IDN/punycode, no "+ tag" stripping. Therefore `Alice@Gmail.com`, `alice+1@gmail.com`, `alice@gmail.com`, and `alice@GMAIL.COM` are stored as up to 3 distinct rows ("alice@gmail.com" twice via `+`-tag split, plus the Cyrillic homoglyph). Real users get duplicate launch emails; spammers exploit `+` tags to flood.
  - `toLowerCase()` on Turkish locale flips `İ → i̇` (combining dot above) and changes byte length — `İ` and `i̇` will dedup differently across runtimes.
- **Root cause**: Validation regex is a denylist on special chars; normalization is `trim().toLowerCase()` only.
- **Impact**: Duplicate sends; homoglyph signups poisoning the list; locale-dependent dedup.
- **Fix sketch**: Use `email.normalize("NFKC").trim().toLocaleLowerCase("en-US")`. Optionally strip Gmail `+tag` segments before dedup. Reject ASCII-mismatched display forms or punycode-encode before storing. Keep the regex strict (anchored, single `@`, no `..`, no leading/trailing `.`).

---

## 7. Waitlist GET counts publicly exposed — info disclosure / scraping

- **Severity**: Low
- **Category**: Security / privacy
- **File**: `src/app/api/waitlist/route.ts:92-109`
- **Scenario**: `GET /api/waitlist` returns `{ counts: { macos, windows, linux } }` with only IP-based throttling (30/min, bypassable via finding #2). Competitors can poll once a minute to chart real-time signup velocity, time launch announcements against competitor traction, etc. More worryingly, an authenticated launch email may include a personal "you are #N on the list" — combined with public counts the attacker derives precise signup timestamps for any target.
- **Root cause**: No requirement to authenticate; counts are not aggregated/bucketed/jittered.
- **Impact**: Competitive intelligence leak; weak deanonymization signal.
- **Fix sketch**: Either (a) make counts a build-time/edge-cached number refreshed every 15 min and round to nearest 50, or (b) gate the endpoint behind the Origin check + `Sec-Fetch-Site: same-origin` to make casual scraping less convenient. Keep raw counts internal.
