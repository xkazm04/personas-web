# Fix Wave 3 — Keyboard-reachable interactive cards (theme T5, part 1)

> 1 commit, 2 findings closed (1 Critical + 1 High). Closes the LAST of the 6 Criticals.
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Findings closed | Severity | File |
|---|---|---|---|---|
| 1 | `e47c9e8` | connectors-catalog #1, #2 | Critical + High | ConnectorCard.tsx |

## What was fixed

1. **Connector cards keyboard-unreachable (Critical)** — the /connections card was a `motion.div` with `onClick` + `cursor-pointer` but no role/tabIndex/keydown/name, so the page's core interaction (open a connector detail modal, ~100 cards) was mouse-only (WCAG 2.1.1 + 4.1.2). A real `<button>` now spans the card with an `aria-label` and a focus-visible ring; `motion.div` remains the visual/layout wrapper.
2. **Dead monogram fallback (High)** — connectors with a missing `/tools/*.svg` showed an empty white pill (onError just hid the image), despite every connector carrying a `monogram`. The pill now renders the two-letter monogram in the connector's brand colour on error.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Milestone: all 6 Criticals closed

| Critical | Wave | Commit |
|---|---|---|
| Reduced-motion invisible hero headline | 1 | 5532d31 |
| Ctrl+R rejects a review | 2 | cb9eba6 |
| Mock data in real-mode charts | 2 | c31814f |
| Client-bundled orchestrator key | 2 | 2cfaa88 |
| Anon-key Supabase PII exposure | 2 | aa184e3 |
| Connector cards keyboard-unreachable | 3 | e47c9e8 |

## Pattern (catalogue item 6)

6. **Click-only `div`/`motion.div` = keyboard-unreachable core action** — interactivity added via `onClick` on a non-button element has no role, focus, keydown, or name. Fix: render a real `<button>` (an absolutely-positioned overlay spanning the visual wrapper works when you must keep an animated container), with `aria-label` + `focus-visible` ring. Same shape recurs in FlowNodes, EventBusNodes, PlatformCardTile — the rest of the T5 cluster.

## What remains (T5 cluster still open)

Keyboard-reachability: flow-composer FlowNodes delete button, event-bus EventBusNodes, PlatformCardTile nested-button. Unnamed controls: progress-bar buttons across agents-timeline / agent-playground / split-playground / feature demos, icon-only tabs/medals/wheel buttons. Plus themes T2–T3, T6–T15 per INDEX.md.
