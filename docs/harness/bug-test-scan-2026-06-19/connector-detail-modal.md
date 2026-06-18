# Connector Detail Modal — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Entire modal interaction surface has zero executing test coverage (only two skipped tests)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap / success-theater
- **File**: e2e/connections.spec.ts:29-47
- **Scenario**: The only two e2e tests that open the modal — `connector card opens modal with details` and `connector modal has try-it-now section` — are both `test.skip`'d (CSR-bailout hydration flakiness). Every other test in the file only asserts on the `/connections` catalog page, never the modal. So the open path, Escape-to-close, backdrop-click close, focus trap, body-scroll lock, terminal simulator, and the try-it toggle have **no executing assertions whatsoever**. The passing suite gives false confidence that "connections" is tested.
- **Root cause**: The team disabled the only modal tests rather than fixing the harness path (e.g. a direct deep-link), and there is no alternative coverage. With no unit runner, e2e is the only lens and it is skipped here.
- **Impact**: false-confidence test — any regression in modal lifecycle (leaked timers, broken Escape, missing focus restore) ships green.
- **Fix sketch**: Re-enable by deep-linking straight into modal state (`page.goto("/connections?connector=slack")`) which bypasses the flaky card-click/hydration race, then assert "What you can do", toggle "Try it now", and press Escape to confirm close.

## 2. SetupCTA is dead code — the modal renders no setup CTA at all
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: dead code / missing feature wiring
- **File**: src/components/sections/connector-modal/components/SetupCTA.tsx:13-50
- **Scenario**: This context is described as having a "setup CTA", but `index.tsx` (lines 94-106) renders only `ConnectorModalHeader`, `UseCaseList`, and `TryItToggle`. A project-wide grep finds **zero importers** of `SetupCTA`. The "Set up {label} in Personas" / "Download app → Add API key → Start automating" CTA is never displayed to users, so the modal has no conversion/download path from the detail view.
- **Root cause**: The component was built (or left over from a refactor) and never wired into the modal tree; nothing references it.
- **Impact**: UX degradation / lost conversion — the primary download CTA the modal is supposed to surface is absent; also unmaintained dead code that ships in the bundle if tree-shaking misses the default export.
- **Fix sketch**: Render `<SetupCTA connector={connector} />` at the bottom of the modal in `index.tsx` (after `TryItToggle`), or delete the file if the CTA was intentionally dropped.

## 3. CopyButton in this context is dead code; clipboard error path is built but never exercised
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: dead code / untested error path
- **File**: src/components/sections/connector-modal/components/CopyButton.tsx:32-124
- **Scenario**: The context lists "copy buttons", but neither `TerminalSimulator` nor `UseCaseList` (which render the `uc.command` strings) include any copy affordance, and a project-wide grep shows the `connector-modal/.../CopyButton` is **never imported** (the `CopyButton` used elsewhere is the unrelated `guide/blocks/CopyButton.tsx`). So users cannot copy connector commands from the modal, and the carefully written `navigator.clipboard` rejection → `legacyCopy(execCommand)` → failed-state fallback textarea is unreachable.
- **Root cause**: Copy affordance was implemented as a standalone component but never placed next to the `uc.command` `<code>` blocks; the modal's commands are display-only.
- **Impact**: UX degradation (no copy on the commands users are meant to run) plus an untested, unused error-handling branch (clipboard-deny, insecure-context fallback).
- **Fix sketch**: Use `<CopyButton text={uc.command} color={connector.color} />` inside `UseCaseList` next to each command `<code>`, then add an e2e that overrides `navigator.clipboard.writeText` to reject and asserts the `role="tooltip"` "Copy failed" fallback appears.

## 4. Escape keydown listener is always mounted and fires onClose even when no modal is open
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: modal lifecycle / global listener
- **File**: src/components/sections/connector-modal/index.tsx:32-42
- **Scenario**: `ConnectorModal` is always mounted on `/connections` (page.tsx:67) with `connector={selectedConnector}`. The Escape `useEffect` has no `connector` guard, so a document-level `keydown` listener is attached for the page's whole lifetime and calls `onClose()` on **every** Escape press — even when the modal is closed. When closed, `setSelectedConnector(null)` is a harmless no-op, but the handler also competes with any other Escape-driven UI on the page (e.g. closing the catalog search) and runs needlessly on every keystroke-Escape.
- **Root cause**: The listener lifecycle is tied to `handleEscape` identity, not to whether the dialog is actually open; the design assumed the component only exists while open.
- **Impact**: UX degradation / subtle event-ordering bug — global Escape side effects fire when the modal is not visible; potential interference with other Escape handlers on the page.
- **Fix sketch**: Guard the effect: `useEffect(() => { if (!connector) return; document.addEventListener("keydown", handleEscape); return () => document.removeEventListener("keydown", handleEscape); }, [connector, handleEscape]);`

## 5. Focus is not restored / re-trapped when switching connectors without closing the modal
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: focus trap / a11y lifecycle
- **File**: src/components/sections/connector-modal/index.tsx:24, src/hooks/useFocusTrap.ts:47-92
- **Scenario**: Connector selection is URL-driven (`?connector=`), so a user can navigate directly from one connector's modal to another (deep link, browser back/forward) without the modal closing. `useFocusTrap` keys its effect on `active` (`!!connector`) and the stable `containerRef`; switching connectors changes neither, so the effect never re-runs. Focus is not moved into the newly shown content, and `restoreRef` still points at whatever element opened the *first* connector — so on eventual close, focus may jump to a stale/unmounted card.
- **Root cause**: The focus trap assumes one open→close cycle per mount; it has no dependency on the connector identity, so an in-place content swap is invisible to it.
- **Impact**: UX/a11y degradation — keyboard/screen-reader focus can land on stale targets after a connector switch; no crash.
- **Fix sketch**: Pass connector identity into the trap so it re-arms on switch (e.g. add `connector?.name` to the hook's deps, or remount the dialog content with a `key={connector.name}`), and re-focus the first focusable on each connector change.
