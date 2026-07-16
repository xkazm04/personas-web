# Self-Healing & Trigger Automation — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Auto-fire timer silently overrides the user's manual trigger selection
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: autoplay-fights-user-selection
- **File**: `src/components/feature-sections/trigger-system/index.tsx:25`
- **Scenario**: A visitor clicks "Webhook" on the wheel to read its detail card. 3–5 seconds later the background `schedule()` loop fires a random trigger and calls `setActiveTrigger(idx)`, yanking the detail panel to a different trigger mid-read (AnimatePresence swaps the whole card). `handleSelect` clears `firing` but never pauses or resets the auto-fire timer, so there is no window in which a manual choice is respected.
- **Root cause**: Happy-path-only design — the auto-demo loop assumes the user never interacts. No recorded decision on interaction precedence, no idle timeout before autoplay resumes, and the `setTimeout(() => setFiring(null), 1000)` inside `fire` is untracked (a manual select followed by that stale timeout can also clear a subsequent firing state early).
- **Impact**: The interactive affordance (clickable wheel nodes, pagination dots) is effectively broken: content the user explicitly requested is replaced within seconds. Frustrating UX and disorienting for screen-reader/keyboard users whose focus context suddenly describes a different trigger.
- **Fix sketch**: On `handleSelect`, clear `timerRef` and restart the schedule after an idle grace period (e.g. 10s), or stop autoplay permanently after first interaction. Track the `setFiring(null)` timeout in a ref and clear it in both `fire` and `handleSelect`.

## 2. Icon-only wheel buttons and 6px pagination dots have no accessible name or state
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-unlabeled-controls
- **File**: `src/components/feature-sections/trigger-system/components/TriggerWheel.tsx:75`
- **Scenario**: A screen-reader user tabs through the trigger wheel: each `<button>` contains only a Lucide icon (aria-hidden SVG), so it announces as "button" with no name. The visible label ring is rendered as separate `pointer-events-none` spans (line 117) never associated with the buttons. The pagination dots in `TriggerDetail.tsx:56` are the same — unnamed buttons that are also 6×6px (`h-1.5 w-1.5`), far below the ~24px minimum target size, with no `aria-current`/`aria-pressed` conveying which trigger is active.
- **Root cause**: Decorative label ring was built for visual layout only; no `aria-label`, `aria-pressed`, or `aria-labelledby` wiring was added when the nodes became interactive buttons.
- **Impact**: Serious accessibility failure (WCAG 4.1.2 name/role/value, 2.5.8 target size): 16 interactive controls across the section are unusable non-visually, and the dots are nearly unclickable even with a mouse.
- **Fix sketch**: Add `aria-label={t.name}` and `aria-pressed={isActive}` to each wheel button (or wrap the group in `role="tablist"` with `aria-selected`); give dots `aria-label={`Show ${t.name}`}` plus an enlarged hit area (`p-2 -m-2` wrapper or min 24px button around the visual dot).

## 3. Trigger wheel is a fixed 400×400px block — overflows and clips on small viewports
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: responsive-fixed-dimensions
- **File**: `src/components/feature-sections/trigger-system/components/TriggerWheel.tsx:28`
- **Scenario**: On a 360–390px-wide phone, the wheel's hard-coded `style={{ width: 400, height: 400 }}` exceeds the viewport before section padding is even applied. The label ring sits at `LABEL_RADIUS = 182` with `whitespace-nowrap`, so labels like "FILE WATCH" and "EVENT BUS" centered at x≈18/x≈382 extend past even the 400px box — they get clipped or force horizontal scroll depending on ancestor overflow.
- **Root cause**: All geometry (400 container, RADIUS 140, LABEL_RADIUS 182, node sizes 44/56) is in absolute pixels with no responsive scaling; unlike the healing circuit, which uses an SVG `viewBox` that scales fluidly.
- **Impact**: Core marketing visual is broken on the most common mobile widths: cut-off labels, possible page-level horizontal scrollbar, and cramped tap targets — exactly where marketing traffic is majority-mobile.
- **Fix sketch**: Make the wheel scale: wrap in a container with `width: min(400px, 100%)` and `aspect-ratio: 1`, compute positions as percentages (`left: ${50 + 35*cos}%`), or apply a `transform: scale()` derived from container width; alternatively rebuild as SVG with a viewBox like CircuitBoard.

## 4. getPathMidpoint returns a corner/endpoint, not the break midpoint — heuristic silently wrong for straight traces
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-heuristic-undocumented-invariant
- **File**: `src/components/feature-sections/healing-circuit/data.ts:128`
- **Scenario**: The "break point" (spark + weld flash location) is computed by taking the middle *vertex* of the path's coordinate list. For the 4-vertex breakable paths it lands on a corner near the destination (e.g. `db-queue` → (310,340), not the trace's visual middle). For any 2-vertex straight path like `api-db` ("M 100 130 L 100 255"), `midIdx=2` yields the *endpoint* (100,255) — the spark would render on top of the destination node.
- **Root cause**: A regex-and-index heuristic stands in for real path-length math, and the invariant it depends on ("only multi-segment paths may appear in `breakableConnections`") is nowhere documented — `breakableConnections` just happens to exclude the two straight connections, with no comment linking the two facts.
- **Impact**: Today the failure/repair effects render off-center from where the trace visually "breaks"; the first person who adds `api-db` or `cache-queue` to the breakable rotation gets a spark exploding inside a node with no error and no hint why.
- **Fix sketch**: Compute the true midpoint (sum segment lengths, walk to 50% — trivial for axis-aligned L-paths), or store an explicit `breakPoint: {x,y}` per breakable connection in data.ts; at minimum add a comment on `breakableConnections` stating the multi-vertex requirement.

## 5. Status color palette duplicated across five places with hard-coded hexes
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: color-token-duplication
- **File**: `src/components/feature-sections/healing-circuit/components/CircuitTraces.tsx:8`
- **Scenario**: The same 4-color status palette (#f43f5e / #fbbf24 / #06b6d4 / #34d399) is independently declared in `data.ts` (`healingStages[].color` AND `nodeStatusColor`), re-derived by ternary chains in `CircuitTraces.tsx:8` (`traceColorFor`) and `StatusPanel.tsx:8` (`statusColorFor`), and hard-coded again inside `effects.tsx` (SparkEffect `#f43f5e` ×3, WeldFlash `#06b6d4` ×2, RepairBot `#fbbf24` ×2). Unlike the trigger system, none of it uses the shared `BRAND_VAR`/`tint` theme helpers.
- **Root cause**: Each component grew its own status→color mapping instead of one exported `connectionStatusColor: Record<ConnectionStatus, string>` next to the existing `nodeStatusColor`.
- **Impact**: A brand-palette tweak (or aligning these hexes with `brand-theme` tokens like the trigger section already does) requires edits in 5 files; miss one and the trace turns cyan while the weld flash stays a different cyan and the panel dot a third color — the exact desync this animation is supposed to look precise about.
- **Fix sketch**: Export `connectionStatusColor: Record<ConnectionStatus, string>` from `data.ts` (sourced from `BRAND_VAR` where possible), replace both ternary helpers with lookups, and pass `color` into `SparkEffect`/`WeldFlash`/`RepairBot` (they already receive props) instead of hard-coding hexes.
