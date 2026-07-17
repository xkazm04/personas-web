# Fix Wave 8 — Pause / interrupt conflation in auto-playing demos (theme T6)

> 3 commits, 3 findings closed (3 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Finding closed | File(s) |
|---|---|---|---|
| 1 | `e282e7a` | self-healing-triggers #1 | trigger-system/index.tsx |
| 2 | `131c1d3` | agents-timeline-race #1 | agents-timeline/index.tsx |
| 3 | `bd37623` | why-agents-use-cases #1 | use-cases (hook + 4 files) |

## What was fixed

1. **Trigger wheel auto-fire overrode manual selection** — clicking a trigger to read its detail was replaced within 3-5s by the background auto-fire, with no window where a manual choice was respected (and an untracked `setFiring(null)` timeout could clear a later firing early). `handleSelect` now cancels the pending auto-fire + firing-clear tick and resumes autoplay only after a 10s idle grace.
2. **Timeline mouse-leave cancelled explicit Pause** — one `paused` boolean conflated transient hover-pause with sticky user-pause, so moving the mouse out after clicking Pause resumed playback. Split into `hoverPaused` + `userPaused`; effective pause is their union and mouse-leave clears only the hover half.
3. **Use-case showcase had no pause + wrong semantics** — the tool selector autoplayed (>5s auto-update, WCAG 2.2.2) with only click/Escape to stop, marked up as a `role=toolbar` of `aria-pressed` toggles while driving a tab/panel relationship. Added a visible Pause/Play toggle, converted to `role=tablist`/`role=tab` + `aria-selected`/`aria-controls`, and made the detail card a `role=tabpanel` with a stable id + `aria-live` so the swap is announced.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 14–15)

14. **Autoplay must yield to interaction** — a background timer that calls the same setter as the user's click will fight the user. On interaction, cancel the pending tick and either stop autoplay or resume only after an idle grace period; track every timeout in a ref so a stale one can't clear fresh state.
15. **One boolean can't hold two pause intents** — conflating hover-pause and explicit-pause lets incidental mouse movement undo a deliberate Pause. Keep them separate and take the union. And any >5s auto-updating region needs a visible pause control (WCAG 2.2.2) plus real tab/tabpanel semantics with aria-live, not toolbar+aria-pressed.

## Deferred within T6 (tracked)

- guided-product-tour #3 (pause only pauses audio while spotlight/action timelines run on wall-clock) — larger TourContext/spotlight-sequence change, higher risk; deferred to a focused tour wave.
- orchestration-platform-visualizers #3 (terminal is an infinitely self-restarting aria-live region with no stop control) — foldable into a later demo wave.

## What remains

T8 dead/unwired surface, T10 conversion path, T11 hydration/SSR, T9 i18n, T14/T15, plus the deferred sub-items above and from earlier waves. Per INDEX.md.
