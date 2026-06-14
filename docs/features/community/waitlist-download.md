# Waitlist & App Download
> Email waitlist signup modal with animated success + the allowlisted desktop-app download redirect, and the navbar's placeholder download picker · **API:** `/api/waitlist`, `/api/download` · **Status:** Live

## What it does
Two related conversion surfaces for the not-yet-public desktop app:

- **Waitlist modal** (`WaitlistModal`) — opened from the Download CTA's unavailable platform pills (macOS/Linux, and Windows when no download URL is configured). Collects an email + platform, optional "early beta" opt-in, posts to `/api/waitlist`, then shows an animated checkmark success panel with a "people waiting" count and a share-link button. Duplicates are detected and shown a softer "already registered" panel.
- **Download endpoint** (`/api/download`) — the homepage "Download for Windows" button links here (not directly to the binary). It 302-redirects to the configured release artifact, but only if that URL passes an https + host-allowlist check; otherwise it falls back to `/#download` so the UI degrades to waitlist mode.
- **Navbar download modal** (`DownloadModal`) — a separate, *placeholder* "Choose your download" picker opened from the navbar's Download button. Its options are dummies that just close the modal; not yet wired to real installers.

## How it works
**Waitlist form → POST.** `WaitlistModal` (`src/components/WaitlistModal.tsx`) does a client-side `EMAIL_RE` check (`WaitlistModal.tsx:63`), then POSTs `{ email, platform: platformKey, earlyBeta }` to `/api/waitlist` with a 15s abort timeout (`FETCH_TIMEOUT_MS`, `waitlistUtils.ts:1`). On open it GETs `/api/waitlist` to seed the per-platform "people waiting" count (`WaitlistModal.tsx:35`). On success it optimistically increments the count; on `data.duplicate` it switches to the duplicate panel; errors go to Sentry tagged `component: WaitlistModal` (`WaitlistModal.tsx:91`).

**`/api/waitlist`** (`src/app/api/waitlist/route.ts`). `POST` re-validates server-side: email via shared `isValidEmail` (≤254 chars + `EMAIL_RE`, `src/lib/validation.ts`), platform against the `VALID_PLATFORMS` whitelist (`macos`/`windows`/`linux`, `route.ts:47`). Writes are serialized through `withWriteLock("waitlist", …)` to avoid TOCTOU races (`route.ts:142`), deduped by an in-memory `email:platform` Set, and appended to `.data/waitlist.json` via an atomic tmp-file rename (`src/lib/server/json-file-store.ts`). `GET` returns `{ counts: { macos, windows, linux } }` served from an in-memory count map. Per-IP sliding-window rate limits: 5 POST/min, 30 GET/min (`route.ts:51`).

**`/api/download`** (`src/app/api/download/route.ts`). At **module load** it validates `NEXT_PUBLIC_DOWNLOAD_URL` once: parseable URL, `https:` protocol, and hostname in `ALLOWED_DOWNLOAD_HOSTS` (github + `*.personas.app` CDNs, `route.ts:10`). Any failure → `DOWNLOAD_URL = null` + a one-time Sentry `captureMessage` warning. `GET` 302s to the validated URL, or `redirect("/#download")` when null.

**Success animation.** `AnimatedCheckmark` (`waitlist-modal/AnimatedCheckmark.tsx`) draws a circle + check via framer-motion `pathLength` variants. The duplicate path shows a static `Info` icon instead. Share copies `${origin}?ref=waitlist&platform=…` via `navigator.clipboard`, falling back to a hidden-textarea `execCommand("copy")` (`waitlistUtils.ts:8`), then to a manual "copy this link" input.

## Key files
| File | Role |
| --- | --- |
| `src/app/api/waitlist/route.ts` | GET counts / POST signup; validation, dedup, rate limit, file store |
| `src/app/api/download/route.ts` | Allowlisted https redirect to the release artifact, else `/#download` |
| `src/components/WaitlistModal.tsx` | Modal shell: state machine, fetch, focus trap, share, Sentry |
| `src/components/waitlist-modal/WaitlistForm.tsx` | Email input + early-beta checkbox + submit button |
| `src/components/waitlist-modal/WaitlistHeader.tsx` | Platform icon, title, "people waiting" count, close |
| `src/components/waitlist-modal/WaitlistSuccessPanel.tsx` | Success/duplicate panel, next-steps, share UI |
| `src/components/waitlist-modal/AnimatedCheckmark.tsx` | framer-motion `pathLength` success checkmark |
| `src/components/waitlist-modal/waitlistUtils.ts` | `EMAIL_RE`, timeout const, types, legacy clipboard copy |
| `src/components/navbar/DownloadModal.tsx` | Placeholder navbar "choose your download" picker (dummy options) |
| `src/lib/server/json-file-store.ts` | Atomic `.data/*.json` read/write |
| `src/lib/server/rate-limit.ts` | Shared in-memory per-IP sliding-window limiter |
| `src/lib/validation.ts` | Shared `isValidEmail` (server source of truth) |

## Data & state
- **Source:** Waitlist entries persisted to `.data/waitlist.json` on the local filesystem (dev-only — see gotchas). Counts/dedup held in module-scope in-memory `Map`/`Set`, rebuilt on first read. Download target comes from the `NEXT_PUBLIC_DOWNLOAD_URL` build-time env var.
- **Stores:** No Zustand. `WaitlistModal` uses local component state (`status`, `email`, `submittedEmail`, `earlyBeta`, `waitlistCount`, `shareState`, `errorMsg`). `DownloadModal` is stateless beyond its open/focus refs; both are gated by an `open` prop from their parent (Download CTA / Navbar).
- **API routes:** `GET /api/waitlist` → `{ counts }`; `POST /api/waitlist` → `{ message, count }` or `{ message, duplicate: true }`; `GET /api/download` → 302 redirect.
- **Types:** `PlatformKey` (`windows`/`macos`/`linux`), `WaitlistStatus`, `ShareState` (`waitlistUtils.ts`); `WaitlistEntry`/`WaitlistData` (route-local); `t.waitlist` shape (`src/i18n/en.ts:780`).

## Integration points
- **Download CTA:** `WaitlistModal` is mounted by `src/components/sections/DownloadCTA.tsx`; unavailable platform pills call `onWaitlist(platform)`. See [Get Started & Download CTA](../marketing/get-started.md).
- **Navbar:** `DownloadModal` is mounted in `src/components/Navbar.tsx:69`, toggled by `downloadOpen` from the desktop nav's Download button.
- **Server libs:** `getClientIp`/`parseJsonBody`/`jsonError` (`src/lib/server/request.ts`), `withWriteLock` (`src/lib/fileLock.ts`), shared rate limiter and JSON store.
- **Sentry:** waitlist POST failures (`WaitlistModal.tsx:91`); one-time download-env misconfig warning (`download/route.ts:19`).
- **i18n:** modal pulls `t.waitlist.*`, `t.common.{close,next,notifyMe}`, `t.pricing.comingSoon`.

## Conventions & gotchas
- **Hardcoded English (real i18n violation):** several user-visible strings bypass `useTranslation` and are not translated into the 13 non-en locales. In `WaitlistModal`: the client-side `"Please enter a valid email address"` and fallback error strings (`WaitlistModal.tsx:64,82,93`). In `WaitlistForm`: the early-beta sub-line `"Get access to unstable builds before the public release"` (`WaitlistForm.tsx:67`). In `WaitlistHeader`: `"Personas for {label}"` (`WaitlistHeader.tsx:31`). In `WaitlistSuccessPanel`: all next-steps sentences, `"Share with a friend"`, and the manual-copy alert (`WaitlistSuccessPanel.tsx:48,60-61,94`). The **entire** `DownloadModal` is hardcoded (`"Choose your download"`, option titles, `aria-label`). Note `t.waitlist` also defines unused keys (`title`, `subtitle`, `submit`, `successDesc`, `duplicateDesc`, `shareTitle`, `copyLink`, `errorGeneric`) — the modal uses its own copy instead.
- **Filesystem store is dev-only (real issue, documented in-file):** `.data/waitlist.json` is ephemeral on serverless (Vercel/Lambda) — data is lost on cold start/redeploy, and the in-memory dedup/count indices reset per warm instance. The route header calls out Supabase as the production path. Do not treat captured emails as durable here.
- **Rate limit is per-instance, not distributed (real issue):** the limiter is an in-memory `Map`; on serverless it gives no real protection against distributed spam. `getClientIp` also returns `"unknown"` without a trusted proxy (or with `TRUST_PROXY` off), bucketing all such callers together.
- **No payload-size guard on POST:** the waitlist POST calls `parseJsonBody` without `maxBytes`, so the 413 path is never exercised here. Email length is capped at 254 by `isValidEmail`, but the raw body is otherwise unbounded.
- **Validation drift risk:** the email regex is duplicated — `src/lib/validation.ts` (server) and `waitlistUtils.ts:2` (client) hold their own copies. The server adds a 254-char cap the client doesn't. Keep them in sync if you change either.
- **Error-shape coupling:** the modal reads `data.error` for messages, but the route returns errors under the `error` key via `jsonError` — matched. If you change the route's error key, update `WaitlistModal.tsx:82`.
- **DownloadModal options are fake:** every option button calls `onClose` (`DownloadModal.tsx:132`); they are placeholders ("AMD x64" is also a confusing label). Wire to real installers before relying on it.
- **Two independent download surfaces:** the CTA `/api/download` redirect and the navbar `DownloadModal` are unrelated; the modal does not touch `/api/download` or `NEXT_PUBLIC_DOWNLOAD_URL`.

## Related docs
- [Get Started & Download CTA](../marketing/get-started.md)
- [Feature index](../INDEX.md)
