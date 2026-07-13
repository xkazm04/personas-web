# Feature Voting & Comments
> Community "Vote for what's next" section — anonymous one-tap upvotes, Ko-fi-tier boosts, threaded comments, and free-text feature requests, all persisted through four API routes (Supabase in prod, JSON-file fallback in dev). · **API:** `/api/votes`, `/api/feature-requests`, `/api/feature-comments`, `/api/feature-boosts` · **Status:** Live

## What it does
A homepage section (`#vote`) where visitors shape the roadmap without signing in:

- **Vote / unvote** — one tap toggles an upvote on a roadmap feature (`macos`, `i18n`, `dashboard`, `enterprise`). The count updates optimistically and rolls back on API failure. Displayed count = a marketing **seed** (`feature.votes`) + the live API count.
- **Boost** — if a Ko-fi username is configured, each card shows a rocket button opening `$5 / $15 / $25` tiers. Clicking a tier optimistically adds the tier weight to the feature's boost total and opens the Ko-fi page in a new tab. Each voter contributes **one boost per feature** (re-boosting replaces the prior tier, not stacks).
- **Comment threads** — per-feature, collapsible discussion with one level of replies. Author is an auto-generated anonymous handle (e.g. `SwiftFox`). Comments post optimistically.
- **Custom requests** — a free-text box ("Something else in mind?") posts a suggestion (max 1000 chars) with inline success/error/rate-limit feedback.
- **Live summary** — a footer line tallying total votes · comments · boosts · "Live". The "Live" pill only appears once at least one initial fetch succeeds; during the first fetch the cards and summary show loading skeletons, and if the whole batch fails the summary drops "Live" and dims into a quiet degraded state instead of dressing seed-only data as live.

## How it works
`FeatureVoting` (`src/components/sections/feature-voting/index.tsx:28`) is the orchestrating Client Component. On mount, `useAbortableEffect` (`index.tsx:36`) mints/reads a localStorage `voterId` (`data.ts:79`) and fires `Promise.allSettled` over `fetchVotes`, `fetchComments`, `fetchBoostTotals`; each result is applied independently so one failure doesn't blank the others. A `loadState` (`local-types.ts` → `"loading" | "live" | "degraded"`) tracks the batch: `loading` renders `SkeletonCard` placeholders + a skeleton summary bar; the batch resolves to `live` when **any** source fulfils, else `degraded`. It owns all server state (`votedIds`, `voteCounts`, `comments`, `boostTotals`) and passes optimistic mutators down.

When the load resolves after the section has already scrolled into view, the card grid self-drives its own `whileInView` reveal (rather than inheriting SectionWrapper's one-shot reveal) so late-mounted cards animate in instead of staying stuck invisible.

The three mutations follow the same optimistic shape: update local state immediately, POST via the `data.ts` helper, and on rejection capture to Sentry + revert. Comments use a `pending-…` placeholder id that's swapped for the server row when the POST resolves. Boosts are the deliberate exception: the server upsert *replaces* a voter's tier rather than stacking, so after a successful POST the optimistic `+=` is reconciled from the authoritative totals — that refetch retries once and then gives up silently, and a reconcile failure never rolls the (already-succeeded) boost back.

Each feature renders a `FeatureVoteCard` (`components/FeatureVoteCard.tsx:14`). The card holds its own `voted` toggle and re-syncs it from the parent via the **prev-state reset pattern** (`FeatureVoteCard.tsx:43`, React-19-safe — no `setState` in effect). Cards sort by seed+live total, descending (`index.tsx:152`). Comments expand into a `CommentThread` (`components/CommentThread.tsx:10`) → `CommentBubble` + `CommentInput`; boost UI is `FeatureBoostButton` (`components/FeatureBoostButton.tsx:7`), gated on `showBoostUI={!!KOFI_USERNAME}` (`index.tsx:179`).

**API routes** all share one shape: per-IP in-memory rate limit (`getClientIp` → shared `isRateLimited`), `parseJsonBody` with a byte cap, strict input validation against an `ALLOWED_FEATURES` allowlist, then a Supabase write when `hasSupabaseEnv()` is true, else an atomic JSON-file write (`updateJsonFile` / `withWriteLock`). `/api/votes` POST is a **toggle** — first call inserts, second deletes; a body with `email` instead updates the row for ship notifications (`votes/route.ts:140`).

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/feature-voting/index.tsx` | Orchestrator: load-on-mount, optimistic vote/boost/comment handlers, Sentry rollback |
| `src/components/sections/feature-voting/data.ts` | Feature seed data, accent tokens, voterId/author minting, all `apiFetch` API helpers, `formatTimeAgo` |
| `src/components/sections/feature-voting/local-types.ts` | `Feature`, `Comment`, `AccentToken`, `LoadState` types |
| `src/components/sections/feature-voting/components/FeatureVotingGrid.tsx` | Renders the card grid, or `SkeletonCard` placeholders while `loadState === "loading"`; self-drives its `whileInView` reveal |
| `src/components/sections/feature-voting/components/FeatureVoteCard.tsx` | Per-feature card: vote button, comment toggle, prev-state voted re-sync |
| `src/components/sections/feature-voting/components/CommentThread.tsx` | Top-level + 1-deep replies, reply-target state |
| `src/components/sections/feature-voting/components/CommentBubble.tsx` | One comment (author, time-ago, reply button) |
| `src/components/sections/feature-voting/components/CommentInput.tsx` | Shared comment/reply input (280-char cap) |
| `src/components/sections/feature-voting/components/FeatureBoostButton.tsx` | Rocket button + Ko-fi tier popover |
| `src/components/sections/feature-voting/components/FeatureVoteIllustration.tsx` | Lazy per-feature image with fade-in + scrim overlays |
| `src/components/sections/feature-voting/components/CustomFeatureRequest.tsx` | Live feature-request box (full error handling + Ko-fi sponsor link) |
| `src/components/sections/feature-voting/components/FeatureVotingHeader.tsx` | Section heading |
| `src/components/sections/feature-voting/components/FeatureVotingSummary.tsx` | Totals footer line |
| `src/app/api/votes/route.ts` | GET counts/userVotes/shipped; POST toggle vote / save email |
| `src/app/api/votes/storage.ts` | Vote + shipped storage abstraction, `ALLOWED_FEATURES` |
| `src/app/api/votes/rate-limit.ts` | Votes rate-limit wrapper (20/min/IP) |
| `src/app/api/feature-requests/route.ts` | POST custom request (10/min/IP, ≤1000 chars) |
| `src/app/api/feature-comments/route.ts` | GET all comments; POST comment/reply (30/min/IP) |
| `src/app/api/feature-boosts/route.ts` | GET boost totals; POST upsert boost — one row per voter, tier-pinned (30/min/IP) |

## Data & state
- **Source:** seed `features[]` in `data.ts:13` (marketing display numbers, **not** stored server-side) merged with live counts from the API. **Stores:** no Zustand — all state is local `useState` in `FeatureVoting`; client identity persists in `localStorage` (`personas-voter-id`, `personas-comment-author`). **API routes:** `GET/POST /api/votes`, `POST /api/feature-requests`, `GET/POST /api/feature-comments`, `GET/POST /api/feature-boosts`. **Types:** `Feature`, `Comment`, `AccentToken` (`local-types.ts`); server `VoteEntry`/`ShippedEntry` (`votes/storage.ts:20`), `CommentRow` (`feature-comments/route.ts:20`), `BoostRow` (`feature-boosts/route.ts:19`).
- **Persistence backend:** Supabase tables `feature_votes`, `feature_comments`, `feature_boosts`, `feature_requests`, `shipped_features` when env is set; otherwise JSON files (`votes.json`, `comments.json`, `boosts.json`, `feature-requests.json`) via the server JSON-file store. The FS path serializes writes (`withWriteLock` / `updateJsonFile`) to avoid TOCTOU.

## Integration points
- **Anonymous identity:** `getOrCreateVoterId` (`data.ts:79`) and `getOrCreateAuthor` (`data.ts:98`) are the only identity source; the same `voterId` keys votes and boosts and must satisfy `isValidVoterId` (`src/lib/validation.ts:33`, `^[A-Za-z0-9_-]{16,64}$`).
- **Ko-fi:** `KOFI_USERNAME` (`data.ts:62`, `NEXT_PUBLIC_KOFI_USERNAME`) gates all boost UI and the "Sponsor this request" link; empty = boosts hidden entirely.
- **Analytics:** `trackFeatureVote`, `trackFeatureComment`, `trackFeatureRequest` from `@/lib/analytics` fire on each interaction.
- **Sentry:** every failed mutation is captured with `component`/`action` tags (`index.tsx:76,119,141`); PII scrubbing is handled centrally per CLAUDE.md.
- **Shipped features:** `GET /api/votes` also returns `shipped` (from `shipped_features`), but the section does not currently surface shipped state or collect ship-notification emails in the UI.
- **Shared infra:** `apiFetch` (throws on non-2xx), `parseJsonBody`, `getClientIp`, shared rate-limiter, `SectionWrapper` (`#vote` anchor) + `fadeUp`/`staggerContainer` variants.

## Conventions & gotchas
- **Vote integrity is intentionally weak — known limitation.** `voterId` is client-minted and `localStorage`-stored; the server cannot tell a real voter from a script generating fresh IDs. `isValidVoterId` only rejects malformed strings — it is **not** anti-fraud (see the candid comment at `src/lib/validation.ts`). There is no signed-cookie binding and no captcha, so minting fresh IDs still stuffs votes; the documented fix is to bind `voterId` to an HttpOnly HMAC cookie. A `UNIQUE(feature_id, voter_id)` constraint **does** exist (`scripts/setup-voting-db.sql`), and the Supabase insert is an idempotent `upsert … { ignoreDuplicates: true }`, so one voter_id counts at most once per feature and concurrent requests can't double-insert. **Boosts still have no payment verification** — clicking a tier records a boost whether or not the Ko-fi donation completes (real proof needs a signed webhook). Abuse is now *bounded*, not eliminated: `weight`/`tierValue` are pinned server-side to the real tier set `{5, 15, 25}` and boosts upsert one row per `(feature_id, voter_id)`, so a voter can't stack a feature's total — but fresh voterIds can still each add one tier.
- **Rate-limit / XFF spoofing.** Limits are **in-memory per process** (`src/lib/server/rate-limit.ts`) — they reset on deploy and don't share state across serverless instances, so effective limits are higher under scale-out. The IP key comes from `getClientIp` (`src/lib/server/request.ts:30`), which only trusts `req.ip` / `x-vercel-forwarded-for` by default; `x-forwarded-for`/`x-real-ip` are honored **only** when `TRUST_PROXY=true`. If deployed behind a proxy without that flag, requests with no trusted IP source fall back to a **coarse header fingerprint** (`fp:<hash>` of UA + accept headers) so distinct clients land in distinct buckets instead of all sharing one `"unknown"` bucket — best-effort, spoofable, not a trust signal; if `TRUST_PROXY=true` is set in front of an untrusted edge, the leftmost XFF is attacker-controlled and defeats per-IP limiting. IPs are used only transiently and never persisted (per each route's PII header).
- **Client-asserted everything.** `featureId` is allowlisted (`ALLOWED_FEATURES`), and boost `weight`/`tierValue` are now pinned to the allowed tier set, but `author`, comment `text`, and request `text` are still client-supplied and only length/format-validated server-side — no sanitization beyond trimming and a parent-id UUID check. Author handles are not unique or owned, so anyone can post under any handle. Comment/request text is rendered as plain text (React escapes it), but treat it as untrusted user content anywhere it's reused.
- **Optimistic UX can desync.** Counts/boosts/comments mutate before the server confirms and only revert on a thrown error; a silent partial success (e.g. duplicate insert) leaves the UI optimistic. The seed `feature.votes` is added on top of live counts purely for display — don't read the on-screen number as a real tally.
- **No dead files in this folder.** The superseded `CustomRequest.tsx` duplicate and the unwired `NotifyInput.tsx` (ship-notification email) / `VoteParticles.tsx` (vote burst animation) were **deleted from main** — `components/CustomFeatureRequest.tsx` is the single live request box (error handling + Ko-fi link), and every remaining component under `components/` is imported by the section.
- **i18n:** this section is currently hardcoded English (headers, buttons, placeholders, summary copy) and does **not** use `useTranslation()` — a known deviation from the repo's hard i18n rule, like the `/security` page. Treat as debt, not a pattern to copy.
- **React 19 safety:** `FeatureVoteCard` correctly uses the prev-state reset pattern (`:43`) instead of `setState`-in-effect; voterId is mutated through a `ref`, not state.

## Related docs
- [Public Roadmap](public-roadmap.md)
- [Server-Side Vote Persistence](vote-persistence.md)
- [Feature index](../INDEX.md)
