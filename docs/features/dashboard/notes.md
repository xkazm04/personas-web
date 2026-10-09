# Notes (goals from the desktop Notepad)
> The goals from the desktop app's Notepad (its Quest Log), zoned by project, read-only. **Route:** `/dashboard/notes` · **Nav:** second rail section, "Notes"; third slot of the phone bottom bar (Personas · Reviews · Notes · Executions · More) · **Status:** Demo on mocks (`MOCK_NOTES`); live on the sync plane once the desktop's "Sync notes" opt-in is on

## What it does
The desktop Notepad keeps a short list of goals (at most 10 in a working slot) per project. This view shows them on the web and on a phone, so you can see where your goals stand from anywhere.

- **Zones by project**, alphabetical, with "No project" last. A project keeps its place however many goals or reviews it holds, so you learn where it lives (the same rule as the desktop Quest Log).
- **Cards** show the title, a **status rail glyph** (four segments: draft and three more steps on the note's rail, filled to where the note is, with the status named beside it), and what waits for you: **"N to review"** (pending Athena or agent reviews on the note's thread) and **"N unread"** comments.
- Above the zones, a summary of how many notes need review and how many comments are unread.
- **Tap a card** to open its note: a bottom sheet on a phone, a modal on a desktop. It shows the rail with every step named, where the note was handed (Fleet or Athena), when it last changed, the review counts with a pointer back to the desktop, the **run summary** for a run that finished, and the **body** rendered as markdown.
- **Read-only (v1).** Writing a note or answering a review stays on the desktop (PHASE2-SPEC open question Q2).
- **Nothing synced yet:** notes leave the computer only when you turn on **Sync notes** in the desktop app (Settings, then Cloud sync). It is off by default, also for users who already sync (PLAN M19). An empty list says exactly that.
- **Reachability:** the view reuses the phone tier banner (`ReachabilityNotice`). If the desktop has never synced, it shows the "Connect your computer" card with the download handoff and no list. If the desktop is offline, it shows the "isn't running" banner and keeps the list, marked as "as of the last sync". No pairing prompt here: reading needs no paired phone. The demo shows no download CTA (owner, 2026-10-06); `?desktop=never|offline` simulates the other tiers.

## How it works
**View** — `views/notes/index.tsx` (`NotesView`) loads through `useNotesStore.fetchNotes()` on mount and whenever demo or sign-in changes, builds zones with `buildNoteZones` and the header counts with `noteTotals` (both memoised), and picks the sheet by `useIsMobile()`. The view is a client-only chunk (`next/dynamic({ ssr:false })` in `spa/viewRegistry.tsx`), so a media-query choice cannot mismatch a server render. Layout is one composition at both widths: a single column of zones on a phone, `md:grid-cols-2 xl:grid-cols-3` from 768 px up. The view is padded (`fullBleed: false`) and not scoped (`scoped: false`: notes belong to desktop projects, not to the persona scope bar).

**Model** — `src/lib/notes/notesModel.ts` is pure and tested (`notesModel.test.ts`):
- `NOTE_STATUSES` (the seven synced statuses; `archived` is never synced), `BRAINSTORM_RAIL` (`draft → published → in_progress → completed`), `PLAN_RAIL` (`draft → scoped → cut → shipped`), `railOf`, `railPosition`.
- `compareInZone`: the plan rail first, then drafts, then brainstorm; ties by the pad's `orderIndex`, then title.
- `buildNoteZones`: groups by trimmed `projectName` (only the name is synced, never the local path; two projects with one name share a zone), alphabetical, case-insensitive, the `NO_PROJECT_KEY` bucket last, with per-zone review and unread sums.
- `mapNoteRow` + `SYNCED_NOTE_COLUMNS`: the `synced_notes` row mapper. A row with a status outside the CHECK is dropped, and an unknown `dispatch_target` becomes null.

**Data planes** — `ApiClient.listNotes()` in `src/lib/api.ts`:
- **demo:** `mockApi.listNotes` serves copies of `MOCK_NOTES` (`src/lib/mock-dashboard-data.ts`): 11 goals in "Personas desktop", "personas-web", "Research" and no project, every status on both rails, two notes with open reviews.
- **supabase:** `supabaseApi.listNotes` reads `synced_notes` (`scripts/setup-sync-db.sql`), newest change first, through RLS.
- **orchestrator:** `realApi.listNotes` returns `[]`. The orchestrator has no notes endpoint, and on that plane reachability reads "never synced", so the view shows the connect card and no list.

**Realtime** — `synced_notes` is in `WATCHED_TABLES` in `useSyncedRealtime.ts`; a change refetches `notesStore` after the shared 400 ms debounce, which folds the desktop's full-set replace (a burst of upserts) into one read. Deletes are not subscribed (Realtime does not apply RLS to DELETE, scan d4b90e7a F11), so a note removed alone shows at the next refetch, view mount or refresh.

## Key files
| File | Role |
| --- | --- |
| `src/components/dashboard/views/notes/index.tsx` | The view: header, tier banner, review totals, zones, empty/loading/error, sheet or modal |
| `src/components/dashboard/views/notes/NoteZoneCard.tsx` | One project zone: name (italic "No project"), goal count, its cards |
| `src/components/dashboard/views/notes/NoteCard.tsx` | One goal card (44 px target), plus the review/unread pill classes |
| `src/components/dashboard/views/notes/RailGlyph.tsx` | The four-segment rail glyph (decorative; the status label carries meaning) |
| `src/components/dashboard/views/notes/NoteDetail.tsx` | Sheet content: rail steps, dispatch, updated, reviews, run summary, markdown body |
| `src/lib/notes/notesModel.ts` | Types, rails, ordering, zones, totals, the `synced_notes` row mapper |
| `src/stores/notesStore.ts` | `fetchNotes` through the `api` proxy, latest-request-wins |
| `src/components/dashboard/navRegistry.ts` | The `notes` rail section; `PHONE_BAR_VIEWS`; `PendingNavLabelKey` |
| `src/components/dashboard/MobileBottomNav.tsx` | Draws the phone bar from `PHONE_BAR_VIEWS`, everything else under More |
| `e2e/mobile/dashboard-notes.spec.ts` / `e2e/dashboard-notes.spec.ts` | Phone and desktop-width demo specs |

## Data & state
- **Table:** `synced_notes` (id, device_id, project_name, title, body_md, status, order_index, dispatch_target, result_summary, open_reviews, unread_comments, published/started/completed/created/updated_at, synced_at). The desktop masks secret-looking tokens and caps the body at 16 KB before upload. Not synced: archived notes, thread bodies, `root_path`, session/dispatch ids, raw `result_json`.
- **Store:** `notesStore` (`notes`, `loading`, `loaded`, `error`, `fetchedAt`). The sheet's "Updated 3 hours ago" is judged against `fetchedAt` (React 19 purity: no clock read in render).
- **i18n:** the English-only pending `mobileCopy.notes` namespace (PLAN M4; `src/i18n/pending/mobile.ts`, off the shared bundle per M22), including the nav label (`navLabel` in `DashboardNavigation.tsx` resolves `PendingNavLabelKey` there). It is translated with the rest of `mobile` before launch (spec M10).

## Integration points
- **Nav:** rail section after Personas (desktop); bottom-bar slot 3 (phone). The bar is now a chosen set (`PHONE_BAR_VIEWS`), not "the first five menu entries"; Mission Control moved under More on phones.
- **Shared UI:** `ReachabilityNotice` (from the phone Personas view), `BottomSheet` (`components/primitives`), `Modal`, `EmptyState`, `MarkdownReport`, `formatDue` (`lib/review-sla`).
- **Reachability:** `useSyncReachability()`; the tiers come from `lib/sync/reachability.ts`.
- **Smoke:** `/dashboard/notes` is in `e2e/smoke-routes.ts`, so the desktop sidebar walk visits it.

### Loading tiers

Per [loading-orchestration](loading-orchestration.md). No T3 slot: the view has no chart or heavy body.

- **T0** — the header (icon, title, lede). **T1** — the reachability banner / offline note.
- **T2** — the review totals (`arriveAt(0)`, `views/notes/index.tsx:131`) and the zone cards, keyed by `zone.key`, cascading `arriveAt(i + 1)` (`index.tsx:107`; `NoteZoneCard` takes `className` / `style` for it).
- **First load** — three zone-shaped ghosts (header + two `NoteCard`-height blocks; 1 / 2 / 3 visible by breakpoint like the board) in `.dash-ghost` with an sr-only status (`index.tsx:80-100`), replacing the spinner.
- The note body (`NoteDetail` + `MarkdownReport`) is opened on demand in a sheet / modal, so it is not deferred.

## Conventions & gotchas
- **Read-only by contract.** Do not add write affordances without a command verb (`note_create`, `notepad_set_review_verdict`) on the desktop side first.
- **The `?desktop=` switch is read when a view mounts**, from the URL, and a nav link carries no query. The phone spec moves with `history.pushState` to keep it.
- **Markdown** goes through `MarkdownReport` (React elements only, no HTML injection). Its links are scheme-filtered (`markdown-report/safeHref.ts`: `http(s)`, `mailto`, same-site paths and fragments; anything else renders as plain text), since synced bodies can quote what a persona read through its connectors.
- **Motion:** the view adds none of its own; the sheet and modal primitives own theirs.
- **Bundle:** the view is its own lazy chunk; the dashboard's first load gains only the registry entries, the label resolver and `notesStore` (imported by `useSyncedRealtime`).

## Related docs
- [shell-chrome](shell-chrome.md) — the SPA shell, the two-level menu, realtime
- [personas](personas.md) — the phone Personas layout and the tier banner this view reuses
- `docs/concepts/mobile-revival/PHASE2-SPEC.md` §5.1, §6.2, §6.3
