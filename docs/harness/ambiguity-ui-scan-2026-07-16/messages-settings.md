# Messages & Settings — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 3, Low: 1)

## 1. Message source never reacts to demo/real auth transitions
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: stale-state-on-auth-switch
- **File**: `src/app/dashboard/messages/useMessagesData.ts:27`
- **Scenario**: `useMock` is baked into the `useState` initializers at first mount (`useState(useMock ? MOCK_MESSAGE_THREADS : [])`). If the session transitions real→demo (sign out into demo mode) the effect early-returns on `if (useMock) return;`, so the mock threads are never set — the list keeps the previously fetched real threads (or stays empty with `loading` stuck at its stale value). Demo→real transitions work only by accident of the effect firing.
- **Root cause**: Undocumented assumption that `isDemo` is immutable for the component's lifetime; initializer-time capture of a reactive store value with no corresponding reset path in the effect.
- **Impact**: After an in-session auth-mode switch, the Messages page shows the wrong tenant's data (real threads while in demo, or an empty list in demo mode), with no error and no way to recover except a full remount/navigation.
- **Fix sketch**: In the effect, handle the mock branch explicitly: `if (useMock) { setThreads(MOCK_MESSAGE_THREADS); setLoading(false); setError(null); return; }` and initialize state to `[]`/`true` unconditionally. Alternatively document the "isDemo is fixed per session" contract at the hook and enforce it with a `key` remount upstream.

## 2. Staleness indicator reports mount time, not data freshness
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: misleading-freshness-timestamp
- **File**: `src/app/dashboard/messages/page.tsx:40`
- **Scenario**: `const [fetchedAt] = useState(() => Date.now())` is captured once at mount and fed to `StalenessIndicator`. In supabase mode the real fetch completes later, and `retry()` reloads data without ever updating `fetchedAt` — after a retry the indicator still shows the original mount time.
- **Root cause**: The page conflates "component mounted" with "data fetched"; the hook owns the fetch lifecycle but doesn't expose a fetched-at timestamp, and nobody recorded which semantic the indicator is supposed to have.
- **Impact**: The one UI element whose entire job is honesty about data age lies after any retry or slow load — users see "fresh" data that may be minutes older, or old timestamps on just-refetched data.
- **Fix sketch**: Return `fetchedAt` from `useMessagesData` (set it in the `finally`/success path of the fetch, and to `Date.now()` in the mock branch) and pass that through; delete the page-local `useState`.

## 3. Reply-count badges announce a bare number to screen readers
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-uninformative-label
- **File**: `src/app/dashboard/messages/messages-page/ThreadDetailModal.tsx:44`
- **Scenario**: The modal subtitle wraps the reply count in `aria-label={`${replyCount}`}` — a screen reader announces just "3" with no noun. `ThreadRow.tsx:46` has the same pattern worse: the pill is icon + raw number with no label at all, so "3" floats context-free between the subject and the unread badge.
- **Root cause**: The meaning ("replies") is carried solely by the `MessageCircle` icon, which is invisible to assistive tech; the aria-label was added but only duplicates the visible number instead of adding the missing context.
- **Impact**: Non-visual users can't tell what the number counts — reply count, unread count, and attachment count are indistinguishable, and the row already has a second bare-ish number (unread badge) right next to it.
- **Fix sketch**: Use an i18n string, e.g. `aria-label={t.messagesPage.repliesCount.replace("{n}", String(replyCount))}` ("3 replies") on both the modal subtitle span and the ThreadRow pill; keep the icon `aria-hidden`.

## 4. Pagination bar renders under loading, error, and empty states
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: state-aware-rendering
- **File**: `src/app/dashboard/messages/page.tsx:203`
- **Scenario**: `<MessagesPagination>` is rendered unconditionally. While skeletons are showing, when the fetch failed, or when the list is empty, users still see "Page 1 / 1" with two disabled Prev/Next buttons directly beneath the empty-state message or skeleton stack.
- **Root cause**: The pagination block sits outside the `loading ? … : isEmpty ? … : …` conditional; only the list body was made state-aware.
- **Impact**: Visual noise and a mild credibility hit for a polish-focused demo — controls that can never do anything are presented as part of an empty/errored view, and during loading the "1 / 1" total is simply wrong (data hasn't arrived).
- **Fix sketch**: Render the pagination only when `!loading && !isEmpty` (or when `totalPages > 1`), keeping layout stable with the existing `mt-4` spacing.

## 5. Voice preview fallback can synthesize an announcement from empty strings
- **Severity**: Low
- **Agent**: ambiguity_guardian
- **Category**: unhandled-degenerate-fallback
- **File**: `src/app/dashboard/settings/settings-sections/NotificationsCard.tsx:45`
- **Scenario**: `handlePreview` falls back through `review?.content?.split("\n")[0]?.trim() ?? ""` and `review?.personaId ?? firstPersona?.id ?? ""`. With no pending review and no personas loaded (real mode before stores hydrate, or an empty tenant), `emitNewReview` receives `title: ""` and `personaId: ""`.
- **Root cause**: The fallback chain's terminal case was left as empty strings with no recorded decision about what the spoken sentence should say when there is nothing to compose it from.
- **Impact**: The preview — the feature meant to demonstrate voice quality — can utter a degenerate sentence around empty tokens (or silently no-op, depending on `emitNewReview` internals), exactly for the users who most need to verify the feature works.
- **Fix sketch**: Define the degenerate case explicitly: fall back to a fixed sample payload (e.g. `title: n.voice.sampleTitle`, a stable sample persona name) instead of `""`, or disable the preview button until a persona exists and note why.
