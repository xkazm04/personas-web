# Messages
> The dashboard inbox where each persona's async run reports arrive as conversation threads you can scan, open, and mark read. **Route:** `/dashboard/messages` · **Nav label:** "Messages" · **Status:** Demo-only (mocks)

## What it does
Messages is an inbox-style surface listing **threads** — one per persona conversation. A thread is a parent message (a persona's run report, escalation, learned-pattern note, cost-spike alert, etc.) plus any chronological replies. The list shows each thread's persona, subject, reply count, last-activity time, and an unread badge.

- A count chip at the top (`{n} unread`) sums unread messages across all visible threads, with a **Mark all read** button beside it when anything is unread.
- Unread threads are visually highlighted (cyan-tinted row, bolder subject) and carry a `{n} Unread` pill.
- Clicking a row opens the **Thread detail modal**, rendering the parent message and every reply as individual markdown articles (the run report body), and marks the whole thread read.
- The list is paginated at 10 threads per page (the mock fixture has 14 threads / ~42 messages, so 2 pages).
- In the nav, the Messages item shows a badge of `MOCK_UNREAD_MESSAGES` (currently `7`) — a fixed demo constant, independent of the per-session read overrides on this page.

## How it works
**Data load** — `useMessagesData()` (`src/app/dashboard/messages/useMessagesData.ts`) returns `{ threads, loading, error }`. In demo mode (`useAuthStore.isDemo`) it returns `MOCK_MESSAGE_THREADS` synchronously with `loading: false`. In real/Supabase mode it calls `getSyncedMessageThreads()` from `src/lib/supabaseApi.ts` inside an effect, with a `cancelled` guard, Sentry capture on failure, and an error string fallback. Since `/dashboard/*` is demo-only here, the mock path is what runs.

**Read-state overrides** — the page (`page.tsx:30`) keeps a local `Map<messageId, MessageStatus>` of overrides layered over the immutable mock fixture. A `useMemo` (`page.tsx:38`) maps each base thread, applies overrides per message, recomputes `unreadCount`, and **re-sorts threads by `latestTimestamp` descending**. `markThreadRead`, `markAllRead`, and `openThread` all just add entries to this map — the fixture is never mutated.

**List render** — `pageItems` is a 10-item slice of the sorted threads for the clamped page (`page.tsx:61-66`). Each renders a `ThreadRow` (`messages-page/ThreadRow.tsx`): `PersonaAvatar` + subject + reply-count chip (only when `replies.length > 0`) + unread pill, with `relativeTime(latestTimestamp)`. The whole row is a `<button>` whose `onClick` calls `openThread`.

**Detail modal** — `ThreadDetailModal` (`messages-page/ThreadDetailModal.tsx`) wraps the shared `Modal`. It is open whenever `thread !== null` (driven by `openThreadId`). The header shows persona · relative time · reply count; the body maps `[parent, ...replies]` to `ConversationMessage` articles, each rendering `message.body` through `MarkdownReport`, with replies indented and an unread cyan dot when applicable.

**Pagination** — `MessagesPagination` (`messages-page/MessagesPagination.tsx`) is a presentational prev/next bar with a `Page {n} of {total}` label (built in `page.tsx:101` via string interpolation) and `isFirstPage`/`isLastPage` to disable buttons. The page clamps `page` against `totalPages` so deletions/filters can't strand you on an empty page.

**Header chrome** — `GradientText` title, subtitle, and a `StalenessIndicator` seeded from a lazily-initialized `fetchedAt = Date.now()` (React 19 purity rule — captured in `useState(() => …)`). Loading shows four `SkeletonCard`s; `error` shows a `DashboardErrorBanner`; empty page shows `t.messagesPage.empty`.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/messages/page.tsx` | Page entry — paginates, holds read-state overrides, sorts threads, wires header/list/modal |
| `src/app/dashboard/messages/useMessagesData.ts` | Data hook — mock threads in demo mode, `getSyncedMessageThreads()` otherwise |
| `src/app/dashboard/messages/messages-page/ThreadRow.tsx` | One thread row (persona, subject, reply chip, unread pill) — opens the modal |
| `src/app/dashboard/messages/messages-page/ThreadDetailModal.tsx` | Conversation modal — parent + replies as markdown articles |
| `src/app/dashboard/messages/messages-page/MessagesPagination.tsx` | Presentational prev/next pagination bar |
| `src/lib/mock-dashboard-data.ts` | `MessageThread`/`FeedbackMessage` types, `MOCK_MESSAGE_THREADS` fixture generator, `MOCK_UNREAD_MESSAGES` |
| `src/components/dashboard/Modal.tsx` | Shared modal primitive (backdrop, esc/click-out close, header/body/footer) |
| `src/components/dashboard/DashboardNavigation.tsx` | Nav badge — `getBadge` returns `MOCK_UNREAD_MESSAGES` for the Messages item |

## Data & state
- **Source:** `MOCK_MESSAGE_THREADS` in `src/lib/mock-dashboard-data.ts` — a seeded (`seededRandom(711)`) fixture of 14 threads (~42 messages) built from `THREAD_REPLY_COUNTS`. Parent unread for the first 3 threads; one extra unread reply on thread index 1. Bodies are interpolated markdown run reports (5 templates round-robined). `MOCK_UNREAD_MESSAGES = 7` is a separate fixed constant used only for the nav badge.
- **Stores:** `useAuthStore` (read-only `isDemo` flag, picks mock vs. synced source). No dedicated messages Zustand store — all read-state is **local component state** (`overrides` map, `page`, `openThreadId`, `fetchedAt`), so it resets on navigation/reload.
- **API routes:** None in this repo. Real mode would call `getSyncedMessageThreads()` (Supabase `synced_messages`), but that path is inactive in the demo dashboard.
- **Types:** `MessageThread` (`id`, `persona`, `personaColor`, `subject`, `parent`, `replies`, `latestTimestamp`, `unreadCount`), `FeedbackMessage` (`id`, `threadId`, `isThreadParent`, `persona`, `personaColor`, `timestamp`, `subject`, `status`, `payload`, `body`), `MessageStatus = "unread" | "read"`.

## Integration points
- **Dashboard shell:** rendered inside the `/dashboard` layout; nav entry registered in `DashboardNavigation.tsx` (`{ key: "messages", icon: Mail, href: "/dashboard/messages" }`).
- **Nav unread badge:** `useNavState().getBadge` in `DashboardNavigation.tsx` returns `MOCK_UNREAD_MESSAGES` (when `> 0`) for the messages item; consumed by `DesktopSidebar` and `MobileBottomNav`. Note this badge is the static constant `7`, not the live `unreadCount` derived on the page — marking messages read here does not change the nav badge.
- **Shared primitives:** `Modal` (`components/dashboard/Modal.tsx`), `MarkdownReport`, `PersonaAvatar`, `SkeletonCard`, `StalenessIndicator`, `DashboardErrorBanner`, `GradientText`; `relativeTime` from `src/lib/format.ts`; `fadeUp`/`staggerContainer` from `src/lib/animations.ts`.
- **i18n namespace:** `t.messagesPage` (title, subtitle, unread, read, empty, expand, collapse, markAllRead, pagination.{prev,next,page}); nav label is `t.dashboard.messages`.

## Conventions & gotchas
- **i18n (14-locale lockstep):** every string comes from `t.messagesPage.*` / `t.dashboard.messages`. Adding a key means adding it to `en.ts` first then hand-translating into all 13 other locales. `expand`/`collapse` exist in the `messagesPage` namespace but are not referenced by the current components (likely vestigial from an inline-expand variant) — keep them in lockstep or remove from all locales together.
- **Semantic Tailwind tokens:** uses `text-foreground`, `text-muted`, `text-muted-dark`, `border-glass`, `border-glass-hover`, `bg-surface`, `text-brand-cyan`. Cyan unread accents use `cyan-*` utilities directly (acceptable accent usage); avoid raw hex / `text-white`.
- **React 19 rules:** `fetchedAt` is captured via `useState(() => Date.now())` (no impure `Date.now()` in render). `useMessagesData`'s effect never calls synchronous `setState` in its body for the demo path (it early-returns). Keep these patterns if you extend the page.
- **Read-state is local + non-persistent:** the `overrides` map lives only in component state. There's no persistence and no sync to the nav badge constant — by design for the demo. The mock fixture is treated as immutable (overrides are layered, never mutated).
- **Demo-only caveat:** this surface runs entirely on mocks. The Supabase/`getSyncedMessageThreads` branch is wired but dormant in this repo; don't assume live data here.
- **Where to extend:** add per-message status filters or search in `page.tsx`'s `useMemo` before slicing; thread-level UI lives in `ThreadRow`; conversation rendering in `ThreadDetailModal`/`ConversationMessage`. `PAGE_SIZE` is a `page.tsx` const. To make the nav badge reflect live unread, replace the `MOCK_UNREAD_MESSAGES` reference in `getBadge` with shared state.

## Related docs
- [Settings](settings.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
