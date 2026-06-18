# Feature Voting & Comments — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

The two criticals flagged by the 2026-05-10 bug-hunter pass are confirmed FIXED in current code:
voterId is no longer attacker-trusted for integrity (a `UNIQUE(feature_id, voter_id)` constraint
caps each id to one vote/boost per feature, and `isValidVoterId` rejects garbage at the boundary),
and XFF spoofing is mitigated by `getClientIp` only trusting platform/`x-vercel-forwarded-for`/`x-real-ip`
(latter gated behind `TRUST_PROXY`) and falling back to a coarse fingerprint, never the raw leftmost
XFF hop. The residual integrity gap (mint-fresh-ids vote-stuffing) is *documented* in `validation.ts`
as intended-for-followup, so it is not re-reported as a bug. The highest-value findings below are
instead a boost-total optimistic-drift correctness bug, the project-wide absence of any unit harness
for the vote/boost trust-boundary validators, and a comment-thread reply-nesting edge case.

## 1. Boost total optimistically inflates on re-boost while server replaces (client/server divergence)
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: optimistic-update / state corruption
- **File**: src/components/sections/feature-voting/index.tsx:129-149 (with FeatureBoostButton.tsx:59-70, feature-boosts/route.ts:131-141)
- **Scenario**: A user clicks the $5 tier (optimistic total += 5), then clicks $25 on the same feature. The client does `boostTotals[feature] += 25`, displaying 30. The server upserts on `(feature_id, voter_id)` — it *replaces* the row, so the true total moves from 5 to 25, not 30. The Ko-fi `<a>` also has no in-flight guard, so any double-click on a single tier adds `weight` twice client-side while the server records one row. The inflated number persists until a full page reload re-fetches `fetchBoostTotals`.
- **Root cause**: The optimistic updater assumes boosts are additive/append-only, but the server contract is "one boost row per voter, re-boost replaces tier" (documented in the route header). Optimistic math and server semantics disagree, and nothing reconciles them on success.
- **Impact**: UX degradation + false social-proof — a sponsor sees a boost total that is silently wrong (too high), and repeated re-boosts compound the drift; undermines the credibility of the very signal the feature exists to show.
- **Fix sketch**: Track this voter's last boost weight per feature in a ref; on re-boost apply the *delta* (`new - prev`) optimistically, or simpler: refetch `fetchBoostTotals()` in `handleBoost`'s `.then()` to reconcile. Add an in-flight guard so a second click on the same tier is a no-op.

## 2. No unit harness for the vote/boost/comment trust-boundary validators
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / risk-weighted coverage gap
- **File**: src/lib/validation.ts:11-36, src/app/api/feature-boosts/route.ts:120-127, src/app/api/votes/route.ts:108-117
- **Scenario**: The only test runner is Playwright e2e (`/e2e/*.spec.ts`), and a grep shows ZERO specs touch votes/boosts/comments/requests (only `tour.spec.ts` mentions the word "vote" in passing). The pure functions guarding every write path — `isValidEmail`, `isValidVoterId` (the 16–64 `[A-Za-z0-9_-]` gate), the boost `ALLOWED_TIERS`/`weight===tierValue` pinning, comment `normalizeText`/`normalizeAuthor` length bounds, and `UUID_RE` for `parentId` — have no test of any kind. A regression that loosened, say, `weight !== tierValue` to `weight < tierValue`, or widened `VOTER_ID_RE`, would ship green.
- **Root cause**: A business-critical input-validation layer (the anti-abuse / anti-inflation pinning) was written but never gated; e2e can't economically cover the rejection branches (malformed voterId, oversized text, tier/weight mismatch, non-UUID parentId).
- **Impact**: False-confidence / unguarded security boundary — the exact pinning that prevents arbitrary boost-weight inflation and garbage votes can silently regress with no failing check.
- **Fix sketch**: Add a unit runner (vitest) and an LLM-generatable table-driven batch asserting true invariants: `isValidVoterId` accepts a 36-char UUID and rejects 15-char/65-char/`<script>`/non-string; boost route logic rejects `weight !== tierValue` and tiers outside `{5,15,25}`; `normalizeText` rejects empty/2001-char and trims; `UUID_RE` rejects a non-UUID parentId. Wire `npm test` into CI.

## 3. Replies to replies are silently dropped from the rendered thread
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: edge case / silent data omission
- **File**: src/components/sections/feature-voting/components/CommentThread.tsx:22-57
- **Scenario**: The API accepts any valid-UUID `parentId` (feature-comments/route.ts:127-135 only checks the format, not that the parent is top-level), and `CommentBubble` renders a "Reply" button on *every* bubble including depth-1 replies. If a user replies to a reply, the server stores it with `parentId = <a reply's id>`. The thread renderer only walks two levels: `topLevel` (parentId === null) and `getReplies(comment.id)` for each top-level comment. A comment whose parent is itself a reply matches neither bucket, so it is persisted but never displayed.
- **Root cause**: The render assumes a strictly two-level tree, but neither the API nor the UI prevents creating a third level — the reply button is shown on replies, and the server does no parent-depth validation.
- **Impact**: Data loss (from the user's view) — their comment saves successfully (optimistic insert then server row) but vanishes on the next render/reload, with no error; confusing and erodes trust in the discussion feature.
- **Fix sketch**: Hide the Reply button when `depth > 0` (pass `depth` into `CommentBubble`'s reply affordance), and/or flatten in `getReplies` by resolving a reply's effective top-level ancestor; optionally reject a non-top-level `parentId` server-side.

## 4. Vote toggle has no in-flight guard — rapid clicks desync local "voted" state vs server
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: double-submission / race condition
- **File**: src/components/sections/feature-voting/components/FeatureVoteCard.tsx:58-64 (with index.tsx:61-93)
- **Scenario**: `handleVote` flips local `voted` and calls `onToggleVote` on every click with no debounce or pending guard. The server POST is a *toggle* (add if absent, remove if present). Two fast clicks fire two toggles: depending on server ordering and the idempotent `ignoreDuplicates` upsert, the net DB state can end up the opposite of what the button shows (button reads "voted", DB has no row, or vice-versa). The optimistic count also double-applies (±2) before any server response.
- **Root cause**: Optimistic toggle assumes one request resolves before the next click; there's no per-feature in-flight lock, and the server toggle isn't idempotent per intended end-state (it flips, it doesn't set).
- **Impact**: UX degradation + count drift — the upvote pill can show a state that disagrees with the persisted vote until reload; the displayed count can transiently over/under-count.
- **Fix sketch**: Track an in-flight Set of feature ids in `index.tsx`; ignore `handleToggleVote` while a feature's request is pending, or send an explicit desired-state (`voted: boolean`) and make the server set rather than toggle.

## 5. Boost POST swallows failure silently — optimistic count stays inflated and only Sentry knows
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: silent failure / success theater
- **File**: src/components/sections/feature-voting/index.tsx:135-148
- **Scenario**: Unlike `CustomFeatureRequest` (which surfaces a visible error on 429/400/500), `handleBoost` only logs to Sentry and rolls back the optimistic `+weight` on rejection. But the Ko-fi link has already opened in a new tab, so the user believes their boost "counted." On a 429 (rate-limited at 30/min) or a 400 (e.g. a future tier/weight drift), the number flickers back down with no message — the user has no idea the boost was rejected. There is also no success confirmation, so even on the happy path the only feedback is a number that may be wrong (see finding 1).
- **Root cause**: Boost UX treats the Ko-fi redirect as the success signal and the API write as fire-and-forget, conflating "I clicked the donate link" with "the server recorded a boost."
- **Impact**: Silent failure / success theater — rejected boosts produce no user-visible feedback; combined with finding 1, the boost total is an unreliable metric with no error path.
- **Fix sketch**: Mirror `CustomFeatureRequest`'s pattern — on `postBoost` rejection set a visible inline error (and distinguish 429), and on success optionally show a brief confirmation; reconcile the total from the server response rather than trusting the optimistic add.
