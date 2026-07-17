# Fix Wave 11 — Dead / unwired surface (theme T8)

> 3 commits, 4 findings closed (4 High) + 1 deferred-with-cause (product decision).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Findings closed | File(s) |
|---|---|---|---|
| 1 | `eb63abc` | connector-detail-modal #1 | connector-modal (index + UseCaseList + SetupCTA) |
| 2 | `26acd14` | layout-navigation-shell #2 | Navbar.tsx (+ removed NavbarLogoWordmark.tsx) |
| 3 | `6d319ed` | feature-voting-comments #1 | CommentBubble.tsx, CommentThread.tsx, feature-comments/route.ts |

## What was fixed

1. **Connector modal missing its two key actions** — `SetupCTA` and `CopyButton` were fully built with zero importers, so the modal had no conversion CTA and no way to copy the `personas run "..."` commands. `SetupCTA` now renders after `TryItToggle`; each command in `UseCaseList` gets a `CopyButton`. Also fixed SetupCTA's dead `/#download` anchor → `/#download-section`.
2. **Navbar had no brand mark** — `NavbarLogoGlyph`/`NavbarLogoWordmark` were orphaned A/B variants; the mobile header was a bare hamburger with no home affordance. Wired the Glyph (collapses to a monogram when scrolled) into the header's left slot for both breakpoints; deleted the losing wordmark variant.
3. **Dead Reply on nested replies + swallowed deep replies** — every `CommentBubble` showed a Reply button but the input only opens for top-level comments, so replying to a reply silently no-op'd; the API accepted any UUID parent, so a reply-to-a-reply was stored but never rendered. The Reply button is now omitted for nested replies, and the API validates that `parentId` is an existing top-level comment on the same feature (400 otherwise).

## Deferred with cause (product decision — needs your call)

- **public-roadmap #1** — `/api/roadmap` (Supabase `roadmap_items`) has zero consumers; the page renders hand-authored static data. Resolving this means either wiring the DB roadmap into the UI or **deleting the route + types + `roadmap_items` table** — a destructive/product decision I won't make unsolicited. Recommend deciding: (a) wire `RoadmapAreas` to fetch `/api/roadmap`, or (b) delete the dead route+table and note the roadmap is intentionally build-time static.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 20–21)

20. **Built-but-unwired components are invisible dead code** — a component with zero importers ships nothing and drifts the context map. Grep new component folders for importers; wire them into the composition or delete them, recording which. Abandoned A/B variants must resolve to one + a deletion.
21. **Encode "one level deep" at both the UI and the API** — a Reply button rendered unconditionally with a handler that only opens for top-level items is a dead control; a UUID-shape-only parent check lets over-deep children be stored and vanish. Omit the affordance where it can't act, and validate parent existence + depth server-side.

## What remains

T9 i18n (hardcoded strings across hero/pricing/blog/StatusBadge + coverage gate), T14/T15, plus deferred sub-items (roadmap product decision, tour pause, terminal no-stop, knowledge type-bucket+legends, small T5 tail, theme rehydrate DOM-write, stats writable-FS). Per INDEX.md.
