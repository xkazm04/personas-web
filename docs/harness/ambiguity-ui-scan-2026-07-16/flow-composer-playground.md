# Visual Flow Composer & Playground Page — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. decodeFlow validates ids and wires but not `x`, `side`, or `toolId` — crafted share URLs produce ghost nodes and NaN geometry
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: partial-input-validation
- **File**: `src/components/flow-composer/data.ts:87`
- **Scenario**: A hand-edited or truncated `#flow=` hash carries a node like `{"id":"n7","toolId":"nope","side":"banana","x":"1e9"}`. Ids and wires pass the elaborate checks (lines 97–122), but `toolId`, `side`, and `x` are accepted as-is.
- **Root cause**: Validation was hardened for exactly the failure modes someone thought of (duplicate ids, dangling wires, label injection — each with a comment) and stops there; the remaining fields are an undocumented trust assumption. Unknown `toolId` makes `FlowNodes` return `null` (node invisible, yet counted by `FlowCTA` and unremovable since its delete button never renders); non-`"producer"` side silently falls into the consumer branch of `nodePos`; non-numeric or huge `x` yields `NaN`/off-canvas SVG coordinates that only a drag can partially repair.
- **Impact**: A shared URL can render a broken canvas ("4 nodes, 1 connection" with 2 visible nodes), wires anchored at `NaN`, and state the user cannot clean up — on the marketing site's flagship interactive demo.
- **Fix sketch**: In the node loop also require `TOOL_MAP.has(node.toolId)`, `node.side === "producer" || node.side === "consumer"`, and `typeof node.x === "number" && Number.isFinite(node.x)` (clamp to the 8–92 range `toSvgX` already enforces). Reject the whole state otherwise, matching the existing all-or-nothing policy.

## 2. Node delete button is a nested interactive `role="button"` and invisible without hover — undeletable on touch, accidentally deletable everywhere
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: nested-interactive-hover-only-affordance
- **File**: `src/components/flow-composer/components/FlowNodes.tsx:100`
- **Scenario**: The remove `<g role="button" tabIndex={0}>` (line 100) is a child of the node's own `<g role="button" tabIndex={0}>` (line 33). It renders `opacity-0` and only becomes visible on `hover:`/`focus-visible:`.
- **Root cause**: Interactive controls are nested (WCAG 4.1.2 / "nested-interactive": screen readers announce one button and may never expose the inner one), and the discoverability of destructive delete relies on a hover state that touch devices don't have — the legend even says "Hover node to delete".
- **Impact**: Touch/mobile users cannot see any way to delete a node, yet the invisible 1.5r hit area at the node's top-right still receives taps, so a tap aimed at the node edge silently deletes it (`stopPropagation` swallows the click). Screen-reader users get an ambiguous control tree on every node.
- **Fix sketch**: Make the remove control a sibling `<g>` of the node group instead of a child; render it at reduced opacity (e.g. `opacity-40`) by default so it is always discoverable, full opacity on hover/focus; alternatively surface delete on the focused/selected node only, and update the legend copy.

## 3. Duplicate-add policy in ToolSidebar is inconsistent and unstated — "both" tools stack unlimited producers at x=92
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unstated-duplication-policy
- **File**: `src/components/flow-composer/components/ToolSidebar.tsx:30`
- **Scenario**: A producer/consumer-category tool disables after one add (`disabled={alreadyOnCanvas && tool.category !== "both"}`), but any "both" tool (12 of 20) can be added as a producer indefinitely; consumers of "both" tools are capped at one via the separate `+C` button. Meanwhile `addNode` places each new node at `last.x + 18` clamped to 92 (`use-flow-composer.ts:132`), so the 4th+ node on a side lands exactly on x=92.
- **Root cause**: Three different cardinality rules coexist with no recorded rationale (one per tool? one per tool+side? unlimited?), and the `+18` / clamp-at-92 placement constants assume at most ~3 adds per side — a happy-path assumption nothing enforces.
- **Impact**: Users can click "Gmail" five times and get five perfectly overlapping producer circles at x=92 — looks like one node, drags apart confusingly, and inflates the CTA's "N nodes ready to import" count. The `+C` affordance itself (a bare `+C` glyph with only a `title`) is undiscoverable.
- **Fix sketch**: Pick one rule — most sensible is one node per (toolId, side) — and enforce it in `addNode`; then `disabled` logic becomes uniform. If unlimited adds are intended, distribute x by count (`(index+1) * (84/(count+1)) + 8`) instead of clamping into a pile, and document the decision next to the constants.

## 4. Scripted "Complete in 4.2s" contradicts the live elapsed timer shown in the same header
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: fabricated-metric-drift
- **File**: `src/app/playground/data.ts:68`
- **Scenario**: Each prompt's script ends with a hardcoded duration ("Complete in 4.2s", 3.8s, 5.1s…), while `TerminalSim` runs a real timer (`TerminalSim.tsx:82`) driven by randomized per-line delays of `250 + Math.random()*150` ms (`TerminalSim.tsx:90`). The inbox script has 14 lines, so the header freezes around 3.9–5.2s next to a line claiming 4.2s.
- **Root cause**: Two independent sources of truth for the same number — a fake baked into content data and a real measurement in the component — with no comment recording that the scripted figures are decorative or how the 250/150/100 delay constants were chosen.
- **Impact**: On most runs the visitor sees two different durations for the same run in one panel — a small but visible credibility crack in a demo whose whole point is to feel like a real terminal.
- **Fix sketch**: Either interpolate the measured elapsed into the completion line (`Complete in ${(elapsed/1000).toFixed(1)}s` rendered by the component, dropping the number from data), or tune cumulative script delays so each prompt's total deterministically matches its claimed duration; comment the delay constants either way.

## 5. Terminal simulation is silent to screen readers and prompt cards don't expose selection state
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: missing-live-region-and-pressed-state
- **File**: `src/app/playground/TerminalSim.tsx:150`
- **Scenario**: A screen-reader user activates "Triage my inbox". Lines stream into the scroll container (lines 162–177) with no `aria-live`/`role="log"`, the elapsed display is explicitly `aria-live="off"`, and status changes ("executing…" → "complete") live in decorative chrome. In `PromptSelector.tsx:22` the active card is conveyed only by cyan border/background — no `aria-pressed`, and no non-color cue beyond subtle glow.
- **Root cause**: The simulation was built as a purely visual animation; the accessible narration channel and the toggle semantics of the selector were never specified.
- **Impact**: Non-visual users hear nothing after clicking — the page's core interactive demo appears broken — and low-vision users can't reliably tell which of six similar cards is active. This also diverges from FlowComposer siblings, which do carry `role`/`aria-label` throughout.
- **Fix sketch**: Give the output container `role="log"` `aria-live="polite"` (streamed lines announce naturally; keep the elapsed counter off), announce start/completion via a visually-hidden status line, and add `aria-pressed={isActive}` plus a non-color active indicator (e.g. left accent bar or check glyph) to prompt cards.
