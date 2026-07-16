# Mobile App Shell & Views — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Messages tab badge uses a static mock constant, so it never reflects read state
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: stale-badge-mock-constant
- **File**: `src/components/mobile/MobileTabBar.tsx:49`
- **Scenario**: User opens /m/messages, taps "Mark all read" (or opens every thread); the unread pill on the page drops to 0, but the Messages tab badge in the fixed tab bar keeps showing `MOCK_UNREAD_MESSAGES` forever, on every /m page.
- **Root cause**: The tab bar reads `MOCK_UNREAD_MESSAGES` (a compile-time constant from `mock-dashboard-data`) while `MobileMessagesPage` computes unread from its local `overrides` Map. Two disconnected sources of truth for the same number; the Reviews tab correctly reads the shared `useReviewStore`, so the pattern already exists and was skipped for messages.
- **Impact**: Persistently wrong notification count — the classic trust-destroying badge that never clears; also an inconsistency with the reviews badge on the same bar.
- **Fix sketch**: Lift message read-state into a small store (or extend an existing messages store) exposing `unreadCount`; have both `MobileTabBar` and `MobileMessagesPage` subscribe to it, mirroring the `pendingReviewCount` wiring.

## 2. MobileSheet's whole-panel drag="y" fights the inner scrollable content
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: sheet-drag-scroll-conflict
- **File**: `src/components/mobile/MobileSheet.tsx:72-77`
- **Scenario**: A long thread opens in `MobileThreadSheet`; the user swipes up/down inside the message body to scroll. Because `drag="y"` is attached to the entire panel (`motion.div` wrapping the `overflow-y-auto` region), framer-motion competes with native touch scrolling — vertical pans can rubber-band the sheet or dismiss it (`offset.y > 120 || velocity.y > 600`) mid-read instead of scrolling.
- **Root cause**: Drag-to-dismiss is bound to the full sheet rather than scoped to the grab-handle/header, and the dismiss thresholds (120px, 600px/s) are unexplained magic numbers with no note on why they beat the scroll gesture.
- **Impact**: Janky or accidental dismissal while reading — the most common bottom-sheet defect on real phones; content longer than the viewport becomes hard to scroll.
- **Fix sketch**: Move `drag`/`onDragEnd` to the handle+header block only (or use `dragListener={false}` plus `dragControls` started from the handle's onPointerDown), and name the thresholds (`DISMISS_OFFSET_PX`, `DISMISS_VELOCITY`) with a one-line rationale.

## 3. Overview mixes live store data with mock alert counts on one screen, undocumented
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: mock-real-data-boundary
- **File**: `src/app/m/overview/page.tsx:58-62`
- **Scenario**: Stats (runs, success rate, agents, reviews) come from live stores fetched in `useEffect`, but the prominent alerts banner counts `MOCK_HEALTH_ISSUES.filter(status === "open")` — a hardcoded fixture. `/m/alerts` is likewise entirely fixture-driven (`MOCK_AUDIT_INCIDENTS`, `MOCK_HEALTH_CHECKS`, `MOCK_SLA_BREACHES`).
- **Root cause**: The mock/real seam is nowhere recorded — no comment, TODO, or flag says alerts are demo-only while the neighboring tiles are real. Only `alerts/page.tsx:31` hints "(static)".
- **Impact**: Users see a red "N alerts" banner that never changes regardless of actual system state, adjacent to real numbers — misleading in production, and the seam is invisible to the next developer wiring real observability data.
- **Fix sketch**: Document the boundary at both usage sites (e.g. `// DEMO DATA: replace with observability store — see <ticket>`), or gate the alerts card behind the same store/fixture switch the rest of the dashboard uses so the intent is executable, not tribal.

## 4. Success-rate and running-count semantics are unstated and skewed by queued runs
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-metric-denominator
- **File**: `src/app/m/overview/page.tsx:44-56`
- **Scenario**: `successRate = completed / total` where `total` is every execution, including ones still `queued`/`running`. A user who queues 5 new runs watches their success rate visibly drop with zero failures; the "running" chip also silently counts `queued` items as running.
- **Root cause**: No recorded decision on the metric's denominator (finished-only vs all) or on folding `queued` into "running"; the happy-path math was written once with no edge-case note (total = 0 is handled, in-flight runs are not).
- **Impact**: A headline KPI that moves for reasons users can't attribute; any desktop counterpart computing over finished runs only would disagree with mobile.
- **Fix sketch**: Compute `successRate` over terminal executions (`completed / (completed + failed)`), keep queued in its own count or rename the chip label, and leave a one-line comment stating the chosen denominator.

## 5. Manifest drift: `src/app/m/template.tsx` doesn't exist; transitions live in an unlisted component
- **Severity**: Low
- **Agent**: ambiguity_guardian
- **Category**: context-map-drift
- **File**: `src/app/m/layout.tsx:9`
- **Scenario**: The context file list includes `src/app/m/template.tsx`, which is absent from the repo. The page-transition responsibility a template would own is implemented by `src/components/mobile/MobilePageTransition.tsx`, imported by the layout but missing from the context's file list.
- **Root cause**: The mobile shell was likely refactored from a Next.js `template.tsx` to an explicit `MobilePageTransition` wrapper without updating the context map.
- **Impact**: Future scans/agents targeting this context miss the actual transition code and waste time on a phantom file; the map under-describes the shell's animation layer.
- **Fix sketch**: Update the context map: remove `src/app/m/template.tsx`, add `src/components/mobile/MobilePageTransition.tsx` (and consider `ViewFullSiteLink.tsx`, also imported by `MobileShell`).
