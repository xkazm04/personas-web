# Fix Wave 5 — Unnamed/hover-only interactive controls (theme T5, part 3)

> 5 commits, 6 findings closed (6 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Finding closed | File(s) |
|---|---|---|---|
| 1 | `5e6dae4` | features-pricing #1 | PlatformCardTile.tsx, PlatformCardPanel.tsx |
| 2 | `a98d926` | agents-timeline-race #2 | TimelineControls.tsx, agents-timeline/index.tsx |
| 3 | `0d67e7c` | agent-playground-chat #2 | ChatProgressBar.tsx, ExampleChips.tsx |
| 4 | `5c70738` | split-pipeline-playground #3 | playground-split/index.tsx, PipelineProgressBar.tsx, ExampleSelector.tsx, playground-timeline/index.tsx |
| 5 | `d392f32` | security-compliance #1 | ArchitectureFlow.tsx |

## What was fixed

1. **Platform card nested-interactive + click-closes-panel** — the whole tile was `role="button"` with the detail panel (close + guide buttons) nested inside it, so clicking in the open panel closed it and AT saw one giant button. Toggle is now a `<button>` overlay beneath the panel; wrapper is a non-interactive `tabIndex=-1` container; `aria-controls` → panel id.
2. **Timeline scenario buttons unnamed + silent results** — added `aria-label` + `aria-current` per segment and an SR-only `aria-live` region announcing the race outcome.
3. **Chat scenario buttons unnamed** — `aria-label` + `aria-current` per segment, `aria-pressed` on the auto-cycle toggle and on the agent-playground example chips.
4. **Playground simulations inert to AT** — named both `role=progressbar`s, added SR-only `aria-live` regions announcing phase ("Running" / "Execution complete") and stage ("Stage N of M: label" / "Pipeline complete"), and `aria-pressed`+`aria-label` on the speed toggle.
5. **Security architecture detail hover-only** — trust-critical encryption/keyring copy was mouse-hover-only; the LayerCard is now a focusable `role=button` disclosure (`aria-expanded`/`aria-controls`) that reveals on hover OR focus and toggle-latches on tap/Enter/Space.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 8–9)

8. **Text-less `<button>` = bare "button" to AT** — segmented progress bars / icon-only controls need `aria-label` (what it does) + `aria-current`/`aria-pressed` (state). Style-only active state also fails 1.4.1 use-of-color.
9. **Visual-only status needs a live region** — an animated sim/race that conveys outcome through motion is inert to SR users. Add one SR-only `aria-live="polite"` per section that announces phase/stage/result transitions; name every `role=progressbar`.

## T5 status

Keyboard-reachability + naming cluster substantially closed (waves 3–5): connector cards, event-bus nodes, flow-node delete, platform card, timeline/chat/playground controls, security disclosure. Remaining T5 tail is smaller (icon-only medal/wheel buttons in leaderboard/trigger-wheel, legal tab semantics) — foldable into later medium waves. Next major themes: T2 fabricated-data honesty, T3 mode-switch cache, T7 error states, per INDEX.md.
