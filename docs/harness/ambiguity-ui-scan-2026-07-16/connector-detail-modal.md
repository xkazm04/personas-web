# Connector Detail Modal — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. SetupCTA and CopyButton are built but never rendered in the modal
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: built-but-unwired-components
- **File**: `src/components/sections/connector-modal/index.tsx:9`
- **Scenario**: Open any connector modal. The context's advertised "copy buttons" and "setup CTA" never appear: `index.tsx` imports only `ConnectorModalHeader`, `UseCaseList`, and `TryItToggle`. A repo-wide grep confirms `connector-modal/components/SetupCTA.tsx` and `connector-modal/components/CopyButton.tsx` have zero importers (the guide section uses its own separate `guide/blocks/CopyButton.tsx`).
- **Root cause**: The modal composition was refactored (or the components were pre-built) without wiring them in, and nothing (test, lint, or context map) flags dead exports in this folder.
- **Impact**: Users get no conversion CTA at the natural end of the modal and no way to copy the `personas run "..."` commands — the two highest-intent actions the modal exists for. The context map also drifts (describes UI that doesn't exist), and the fully-featured CopyButton (fallback textarea, failure tooltip) duplicates the guide-blocks one.
- **Fix sketch**: Render `<SetupCTA connector={connector} />` after `TryItToggle` in `index.tsx`, and add `<CopyButton text={uc.command} color={connector.color} />` beside each command in `UseCaseList.tsx`. Then reconcile the two CopyButton implementations (keep the richer connector-modal one, re-export for guide blocks) or delete the dead files if the omission was intentional — and record which.

## 2. TryItToggle switch exposes no state to assistive technology
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-toggle-missing-state
- **File**: `src/components/sections/connector-modal/components/TryItToggle.tsx:18`
- **Scenario**: A screen-reader user tabs to the "Try it now" control. It announces as a plain button; the on/off state lives only in the purely visual `div` switch (position + color). After activating, there is no announcement that a simulator region appeared below.
- **Root cause**: The toggle is styled as a switch but the `<button>` carries no `aria-pressed` (or `role="switch"` + `aria-checked`) and no `aria-expanded`/`aria-controls` for the disclosure it drives; state is conveyed by color/position alone.
- **Impact**: Non-visual users cannot tell whether the preview is on or off, and may not discover the terminal content at all — a WCAG 4.1.2 (name/role/value) failure on the modal's main interactive feature.
- **Fix sketch**: Add `aria-expanded={showSimulator}` and `aria-controls="connector-sim"` to the button (disclosure semantics fit better than switch here), give the simulator wrapper `id="connector-sim"`, and mark the decorative switch `aria-hidden="true"`. Optionally announce completion via `aria-live="polite"` on the terminal body.

## 3. "Live preview" terminal is fabricated output with unexplained magic values
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: fabricated-demo-magic-numbers
- **File**: `src/components/sections/connector-modal/components/TerminalSimulator.tsx:16`
- **Scenario**: Toggle "Try it now" on any connector: every single one prints the identical script — "Found 24 results", "All done! 3 items updated.", "Finished in 3.4s" — under a header labeled "Live preview". The timestamp offsets (0/820/1540/2300/3100/3400 ms) also disagree with the render delays (0/600/1200/1800/2400/3200/3800 ms) for no recorded reason.
- **Root cause**: A hard-coded, connector-agnostic script with two parallel unlabeled timing tables; no comment or data source documents why the numbers exist, why they differ, or whether "Live" is meant literally.
- **Impact**: A visitor who opens two connectors sees byte-identical "results", undermining the credibility the simulator is supposed to build; "Live preview" is arguably a false claim on a marketing site. Future editors must reverse-engineer two timing arrays to change pacing.
- **Fix sketch**: Rename the header to "Simulated preview" (or add a "demo" chip), derive result counts/verbs from the connector's first use case (or per-category templates in `connectors.ts`), and collapse timing into one table: `steps: { text, atMs }[]` where the printed timestamp is derived from `atMs`, with a brief comment on the chosen pacing.

## 4. Escape handler is registered globally even while the modal is closed
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unguarded-global-listener
- **File**: `src/components/sections/connector-modal/index.tsx:39`
- **Scenario**: `ConnectorModal` is mounted with `connector={null}` (its normal resting state on the connectors page). Pressing Escape anywhere on the page — e.g. to dismiss a different overlay, a native `<dialog>`, or cancel an in-page search — still invokes `onClose()`, because the `keydown` listener is attached for the component's whole lifetime, not just while open.
- **Root cause**: The effect at lines 39–42 has no `connector` guard; only the scroll-lock effect (line 44) checks `if (!connector) return`. The asymmetry between the two effects is undocumented, so it reads as intentional when it is almost certainly an oversight.
- **Impact**: Harmless today only by luck (`onClose` setting already-null state is a no-op), but it silently swallows/duplicates Escape semantics the moment a second overlay or a stateful `onClose` exists — a classic happy-path-only latency bug.
- **Fix sketch**: Guard the handler (`if (!connector) return;` inside `handleEscape`, adding `connector` to its deps) or attach/detach the listener inside the existing `if (!connector) return` effect so open-state and listeners stay in lockstep.

## 5. Typography scale is flattened to `text-base` where micro-type is intended
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: type-scale-inconsistency
- **File**: `src/components/sections/connector-modal/components/ConnectorModalHeader.tsx:51`
- **Scenario**: In the open modal, the uppercase category pill and auth-type pill (`text-base font-mono uppercase tracking-wider` in `px-2.5 py-0.5` capsules), the "WHAT YOU CAN DO" eyebrow (`UseCaseList.tsx:8`), the terminal chrome label and terminal body (`TerminalSimulator.tsx:58,66`), and use-case numbering/commands all render at 16px `text-base` — the same size as the body summary — while the unrendered `SetupCTA` and the modal's `CopyButton` tooltip use `text-sm`/`text-xs` as expected.
- **Root cause**: Looks like a bulk `text-xs`→`text-base` substitution: every classname combination (tiny pill padding + `uppercase tracking-widest` + `font-mono`) is idiomatic micro-label styling that only makes sense at xs/sm, and no other size classes survive in these five components.
- **Impact**: Badges overflow their capsule proportions, the eyebrow heading outweighs the `h4` titles beneath it, and the terminal reads as body copy — the modal loses visual hierarchy versus the rest of the site (guide blocks and SetupCTA still use the small scale).
- **Fix sketch**: Restore the intended scale: pills and eyebrow to `text-xs`, terminal chrome to `text-xs` and terminal body/commands to `text-sm`, use-case descriptions to `text-sm`; sweep the five files together in one pass so the modal shares one type ramp, and compare against guide-block equivalents for the canonical values.
