# Fix Wave 4 — SVG-node keyboard reachability (theme T5, part 2)

> 2 commits, 2 findings closed (2 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Finding closed | Severity | File |
|---|---|---|---|---|
| 1 | `6d885b9` | event-bus-monitoring #2 | High | EventBusNodes.tsx |
| 2 | `37f62f1` | flow-composer-playground #2 | High | FlowNodes.tsx |

## What was fixed

1. **Event-bus topology nodes mouse-only** — source/persona `<g className="cursor-pointer" onClick>` had no tabIndex/role/name/keydown, so the detail drawer (which has an excellent focus trap) was unreachable by keyboard for source nodes. Both groups now carry `role="button"`, `tabIndex`, `aria-label`, Enter/Space activation, and a focus-visible outline.
2. **Flow-node delete: nested-interactive + phantom tap target** — the remove `<g role=button>` was nested inside the node's own `<g role=button>` (WCAG 4.1.2) and rendered opacity-0/hover-only, so touch users saw no delete affordance yet a stray tap on the invisible hit area deleted the node. It's now a sibling under a non-interactive wrapper and defaults to opacity-40 (full on hover/focus) — always discoverable and intentional.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Pattern (catalogue item 7)

7. **Raw SVG `<g onClick>` is not keyboard-accessible** — SVG groups take `tabIndex`/`role`/`aria-label`/`onKeyDown` in React; add them plus a `focus-visible:outline` so SVG-based interactions (nodes, map markers) aren't mouse-only. And never nest one interactive `<g>` inside another — make them siblings.

## What remains (T5 still has a tail)

PlatformCardTile nested-button + click-closes-panel (features-pricing #1); unnamed progress-bar buttons across agents-timeline / agent-playground / split-playground / feature-voting; icon-only tab/medal/wheel buttons; security-compliance hover-only detail. Then themes T2–T3, T6–T15 per INDEX.md.
