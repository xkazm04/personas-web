# Feature Voting & Comments — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Reply button on nested replies is a dead control, and second-level replies are invisible
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: dead-control-nested-replies
- **File**: `src/components/sections/feature-voting/components/CommentThread.tsx:53`
- **Scenario**: Every `CommentBubble` renders a Reply button, including depth-1 replies. Clicking Reply on a reply calls `handleReply(reply.id)`, but the reply input only renders when `replyingTo === comment.id` for a TOP-LEVEL comment (line 63). Nothing happens on screen — the button silently no-ops. Worse: the API (`feature-comments/route.ts:131`) accepts any well-formed UUID as `parentId` without checking it references an existing top-level comment, so if a client ever submits a reply-to-a-reply, `getReplies` (which only walks one level from top-level ids) will never render it — the comment is stored but permanently invisible.
- **Root cause**: The thread model is implicitly "one level deep", but neither the UI (Reply button rendered unconditionally in `CommentBubble.tsx:42`) nor the API (`UUID_RE` shape check only, no existence/depth check) encodes that constraint.
- **Impact**: Users click a visible, styled, cursor-pointer button and get zero response — a broken-feeling interaction; any deep reply that does get created is silently swallowed data.
- **Fix sketch**: Either (a) hide the Reply button when `depth > 0` (`onReply` optional, omit for replies), or (b) map a reply's Reply click to its top-level parent (`handleReply(comment.parentId ?? comment.id)`) so it opens the existing thread input. Server-side, validate that `parentId` references an existing comment with `parent_id IS NULL` (or reject with 400) so stored data can't exceed the renderable depth.

## 2. Failed comments and votes roll back silently — optimistic UI vanishes with no user feedback
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: silent-optimistic-rollback
- **File**: `src/components/sections/feature-voting/index.tsx:123`
- **Scenario**: `handleAddComment` inserts an optimistic comment, then on POST failure (429 rate-limit at 30/min/IP, 400 validation, network drop) it filters the comment back out with only a Sentry capture. The comment the user just watched appear simply disappears a moment later with no message. `handleToggleVote` (line 80) does the same: the count ticks up, then quietly ticks back down. Meanwhile the sibling `CustomFeatureRequest.tsx:49-58` handles the exact same failure modes with distinct localized error messages (`errorRateLimit`, `errorInvalid`, `errorNetwork`, `errorGeneric`) plus a `role="alert"`.
- **Root cause**: Error-state handling was built for the request form but never extended to the two other write paths in the same section; rollback was treated as sufficient recovery.
- **Impact**: On rate limit or flaky mobile networks, user content evaporates without explanation — users retype, get eaten again, and conclude the feature is broken. Inconsistent error UX within one section.
- **Fix sketch**: Reuse the existing i18n error strings: on rollback, set a per-feature (or section-level) transient error state rendered as a `role="alert"` line under the comment input / vote row (map 429 → `errorRateLimit`, else `errorGeneric`), auto-clearing on next input. Keep the rollback itself as-is.

## 3. Dead `email` / `email_saved` path in the votes API — no client ever sends an email
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: dead-api-surface-email
- **File**: `src/app/api/votes/route.ts:138`
- **Scenario**: POST `/api/votes` is overloaded: it toggles a vote, EXCEPT when the body carries a valid `email` and a vote exists — then it updates the email and returns `email_saved` instead of toggling. But the only caller, `postVoteToggle` (`data.ts:100-110`), sends `{ featureId, voterId }` only; the type in `data.ts` even declares `"email_saved"` as a possible action the UI never branches on. The listed `NotifyInput.tsx` (the presumable email-capture UI) no longer exists.
- **Root cause**: The notify-me email feature was removed (or never wired) on the client, but the server kept its write path, the PII policy header still documents email collection, and the toggle endpoint kept its dual semantics — with no comment recording whether email capture is planned or abandoned.
- **Impact**: Unreachable branch that complicates the endpoint's contract (a "toggle" that sometimes doesn't toggle), stores a PII column nothing populates or reads (`email` is deliberately never SELECTed), and misleads future maintainers auditing the PII policy.
- **Fix sketch**: Decide and record: if notify-me is abandoned, strip `email`/`email_saved` from route, `postVoteToggle` type, and PII header (and plan a column drop); if planned, add a one-line comment stating the client entry point is pending and track it — don't leave dual semantics undocumented.

## 4. Context map drift — 3 listed files don't exist, 1 real component is unmapped
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: context-map-drift
- **File**: `src/components/sections/feature-voting/components/FeatureVotingGrid.tsx:1`
- **Scenario**: The context's file list names `CustomRequest.tsx`, `NotifyInput.tsx`, and `VoteParticles.tsx` at the feature-voting root — none exist on disk (CustomRequest was superseded by `components/CustomFeatureRequest.tsx`; NotifyInput and VoteParticles were removed). Meanwhile `components/FeatureVotingGrid.tsx` — a real, load-bearing component (skeleton state + whileInView reveal + boost-UI gating) — is absent from the map.
- **Root cause**: The context map was not refreshed after the section's refactor into `components/` and the removal of the notify/particles features.
- **Impact**: Scans and agents working from the map audit phantom files and skip a real one; the NotifyInput ghost also obscures finding #3 (dead email path) by implying the email UI still exists.
- **Fix sketch**: Regenerate/edit the context entry: drop the 3 phantom paths, add `components/FeatureVotingGrid.tsx`.

## 5. All read endpoints return every row unbounded — growth assumption is undocumented
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unbounded-query-growth
- **File**: `src/app/api/feature-comments/route.ts:73`
- **Scenario**: GET `/api/feature-comments` selects ALL comments across all features with no limit and ships them on every page load (the client fetches on mount, `index.tsx:41`, and filters per-feature in React). GET `/api/votes` likewise fetches every vote row (`votes/route.ts:37`) to count in JS, and re-derives `userVotes` by scanning all rows. Nothing in code or comments states the expected scale or a cap.
- **Root cause**: Happy-path design for a small marketing site; the implicit assumption "these tables stay tiny" was never recorded, and the anonymous, rate-limited-only write path (30 comments/min/IP) means the tables can grow far faster than the design assumes.
- **Impact**: A single motivated visitor (or modest organic success) makes every page load pull an ever-growing payload; vote counting cost scales linearly with total votes ever cast. Degradation is silent and hits all visitors.
- **Fix sketch**: Cheapest honest fix: add `.limit(N)` (e.g. 200 newest comments per fetch, `order desc` + client re-sort) and use a Supabase `count`-aggregate query (or an RPC/group-by) for vote totals instead of row scans; record the chosen cap and rationale in the route header comment.
